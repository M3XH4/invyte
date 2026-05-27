<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventCategory;
use App\Models\QrCode;
use App\Models\Theme;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EventService
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly ActivityLogService $activityLogs,
    )
    {
    }

    public function listForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Event::query()
            ->select([
                'id',
                'user_id',
                'category_id',
                'theme_id',
                'title',
                'description',
                'cover_image',
                'cover_image_path',
                'start_date',
                'start_time',
                'end_date',
                'end_time',
                'venue_name',
                'venue_address',
                'privacy',
                'status',
                'dress_code',
                'food_option',
                'max_guests',
                'rsvp_enabled',
                'allow_plus_ones',
                'allow_guest_invites',
                'show_guest_list',
                'rsvp_deadline',
                'slug',
                'archived_at',
                'created_at',
                'updated_at',
            ])
            ->ownedBy($user);

        $query = $this->withCounts($query)
            ->with([
                'category:id,name,slug,icon,color',
                'theme:id,name,slug,thumbnail,config',
                'qrCode:id,event_id,code,url,payload,scan_count',
                'host:id,name',
            ])
            ->search($filters['search'] ?? null)
            ->timelineStatus($filters['status'] ?? 'all');

        if (! empty($filters['category'])) {
            $category = $filters['category'];

            $query->whereHas('category', function (Builder $query) use ($category) {
                $query->where('slug', $category);

                if (Str::isUuid($category)) {
                    $query->orWhere('id', $category);
                }
            });
        }

        $sort = $filters['sort'] ?? 'date_asc';
        $query = match ($sort) {
            'date_desc' => $query->orderByDesc('start_date')->orderByDesc('start_time'),
            'created_desc' => $query->latest(),
            default => $query->orderBy('start_date')->orderBy('start_time'),
        };

        $events = $query->paginate(max(1, min((int) ($filters['per_page'] ?? 10), 50)));

        if (app()->isLocal()) {
            logger()->debug('Events loaded for user', [
                'user_id' => $user->id,
                'count' => $events->count(),
                'total' => $events->total(),
                'filters' => Arr::only($filters, ['search', 'status', 'category', 'sort', 'per_page']),
            ]);
        }

        return $events;
    }

    public function create(User $user, array $data): Event
    {
        return DB::transaction(function () use ($user, $data) {
            $questions = $data['questions'] ?? [];
            $payload = $this->normalizeEventData(Arr::except($data, ['questions']));
            $payload['user_id'] = $user->id;
            $payload['slug'] = $this->generateUniqueSlug($payload['title']);

            $event = Event::create($payload);
            $this->activityLogs->record(
                $event,
                $user,
                'event_created',
                'Event created',
                "{$event->title} was created.",
                $event
            );

            if (app()->isLocal()) {
                logger()->debug('Event created for user', [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'title' => $event->title,
                ]);
            }

            foreach ($questions as $index => $question) {
                $event->questions()->create([
                    'question' => $question['question'],
                    'question_type' => $question['question_type'] ?? 'text',
                    'required' => $question['required'] ?? false,
                    'options' => $question['options'] ?? null,
                    'sort_order' => $index,
                ]);
            }

            $this->ensureQrCode($event);

            return $event->load(['category', 'theme', 'qrCode', 'questions', 'host']);
        });
    }

    public function update(Event $event, array $data): Event
    {
        return DB::transaction(function () use ($event, $data) {
            $event->update($this->normalizeEventData(Arr::except($data, ['questions'])));
            $this->ensureQrCode($event);
            $this->activityLogs->record(
                $event,
                $event->host,
                'event_updated',
                'Event updated',
                "{$event->title} was updated.",
                $event,
                ['changed_fields' => array_keys($data)]
            );

            $this->notifications->create(
                $event->user_id,
                'Event updated',
                "{$event->title} was updated.",
                'event_updated',
                ['event_id' => $event->id, 'slug' => $event->slug]
            );

            return $event->refresh()->load(['category', 'theme', 'qrCode', 'questions', 'guests', 'host']);
        });
    }

    public function archive(Event $event): Event
    {
        $event->forceFill(['archived_at' => now()])->save();
        $this->activityLogs->record(
            $event,
            $event->host,
            'event_archived',
            'Event moved to archive',
            "{$event->title} was moved to archive.",
            $event
        );

        return $event->refresh()->load(['category', 'theme', 'qrCode', 'host']);
    }

    public function restore(Event $event): Event
    {
        $event->forceFill(['archived_at' => null])->save();
        $this->activityLogs->record(
            $event,
            $event->host,
            'event_restored',
            'Event restored',
            "{$event->title} was restored from archive.",
            $event
        );

        return $event->refresh()->load(['category', 'theme', 'qrCode', 'host']);
    }

    public function forceDelete(Event $event): void
    {
        $this->activityLogs->record(
            $event,
            $event->host,
            'event_permanently_deleted',
            'Event permanently deleted',
            "{$event->title} was permanently deleted.",
            $event
        );
        $event->forceDelete();
    }

    public function duplicate(Event $event, User $user): Event
    {
        return DB::transaction(function () use ($event, $user) {
            $copy = $event->replicate(['slug', 'archived_at']);
            $copy->user_id = $user->id;
            $copy->title = 'Copy of '.$event->title;
            $copy->slug = $this->generateUniqueSlug($copy->title);
            $copy->status = 'draft';
            $copy->save();

            foreach ($event->questions as $question) {
                $copy->questions()->create($question->only(['question', 'question_type', 'required', 'options', 'sort_order']));
            }

            foreach ($event->media as $media) {
                $copy->media()->create($media->only(['url', 'type', 'metadata']));
            }

            $this->ensureQrCode($copy);

            return $copy->load(['category', 'theme', 'qrCode', 'questions', 'media', 'host']);
        });
    }

    public function ensureQrCode(Event $event): QrCode
    {
        $url = rtrim((string) config('app.frontend_url', config('app.url')), '/').'/public-rsvp/'.$event->slug;
        $code = 'INV-'.$event->slug;

        return QrCode::updateOrCreate(
            ['event_id' => $event->id],
            [
                'code' => $code,
                'url' => $url,
                'payload' => [
                    'type' => 'event_rsvp',
                    'slug' => $event->slug,
                    'url' => $url,
                ],
            ]
        );
    }

    public function stats(Event $event): array
    {
        return [
            'total' => $event->guests()->count(),
            'going' => $event->guests()->where('response_status', 'going')->count(),
            'maybe' => $event->guests()->where('response_status', 'maybe')->count(),
            'not_going' => $event->guests()->where('response_status', 'not_going')->count(),
            'pending' => $event->guests()->where('response_status', 'pending')->count(),
            'checked_in' => $event->guests()->whereNotNull('checked_in_at')->count(),
        ];
    }

    public function withCounts(Builder $query): Builder
    {
        return $query
            ->withCount('guests')
            ->withCount(['guests as going_count' => fn (Builder $query) => $query->where('response_status', 'going')])
            ->withCount(['guests as maybe_count' => fn (Builder $query) => $query->where('response_status', 'maybe')])
            ->withCount(['guests as not_going_count' => fn (Builder $query) => $query->whereIn('response_status', ['not_going', 'cant_go'])])
            ->withCount(['guests as pending_count' => fn (Builder $query) => $query->where('response_status', 'pending')]);
    }

    private function normalizeEventData(array $data): array
    {
        if (isset($data['category_slug'])) {
            $data['category_id'] = EventCategory::where('slug', $data['category_slug'])->value('id');
        }

        if (isset($data['theme_slug'])) {
            $data['theme_id'] = Theme::where('slug', $data['theme_slug'])->value('id');
        }

        return Arr::except($data, ['category_slug', 'theme_slug']);
    }

    private function generateUniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: Str::random(8);
        $slug = $base;
        $counter = 2;

        while (Event::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$counter++;
        }

        return $slug;
    }
}
