<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventGuest;
use App\Models\RsvpQuestion;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RsvpService
{
    public function __construct(
        private readonly EventService $events,
        private readonly NotificationService $notifications,
        private readonly ActivityLogService $activityLogs,
        private readonly EventStatsService $eventStats,
    ) {
    }

    public function publicEvent(string $slug): Event
    {
        $event = Event::where('slug', $slug)
            ->with([
                'category',
                'theme',
                'qrCode',
                'questions' => fn ($query) => $query->orderBy('sort_order'),
                'guests' => fn ($query) => $query->select(['id', 'event_id', 'name', 'response_status'])->orderBy('name'),
            ])
            ->firstOrFail();

        abort_if($event->archived_at, 404);
        $event->qrCode?->increment('scan_count');

        return $event;
    }

    public function submit(Event $event, array $data): EventGuest
    {
        if (! $event->rsvp_enabled) {
            throw ValidationException::withMessages(['event' => 'RSVP is disabled for this event.']);
        }

        if ($event->rsvp_deadline && $event->rsvp_deadline->isPast()) {
            throw ValidationException::withMessages(['event' => 'The RSVP deadline has passed.']);
        }

        if (! $event->allow_plus_ones && (int) ($data['plus_ones'] ?? 0) > 0) {
            throw ValidationException::withMessages(['plus_ones' => 'Plus-ones are not enabled for this event.']);
        }

        return DB::transaction(function () use ($event, $data) {
            $guest = $this->resolveGuest($event, $data);

            $guest->forceFill([
                'name' => $data['name'] ?? $guest->name,
                'email' => $data['email'] ?? $guest->email,
                'phone_number' => $data['phone_number'] ?? $guest->phone_number,
                'response_status' => $data['response_status'],
                'plus_ones' => $data['plus_ones'] ?? 0,
                'responded_at' => now(),
                'invite_status' => $guest->invite_status === 'pending' ? 'opened' : $guest->invite_status,
            ])->save();

            $this->storeAnswers($event, $guest, $data['answers'] ?? []);

            $this->notifications->create(
                $event->user_id,
                'New RSVP',
                "{$guest->name} responded {$guest->response_status} to {$event->title}.",
                'rsvp_submitted',
                ['event_id' => $event->id, 'guest_id' => $guest->id, 'slug' => $event->slug]
            );
            $this->activityLogs->record(
                $event,
                null,
                'rsvp_updated',
                'RSVP updated',
                "{$guest->name} responded {$guest->response_status}.",
                $guest,
                ['guest_id' => $guest->id, 'response_status' => $guest->response_status]
            );

            return $guest->refresh()->load('answers.question');
        });
    }

    public function stats(Event $event): array
    {
        $stats = $this->eventStats->forEvent($event);
        $stats['total'] = $stats['totalInvited'];
        $stats['conversion_rate'] = $stats['responseRate'];

        return $stats;
    }

    public function createQuestion(Event $event, array $data): RsvpQuestion
    {
        return $event->questions()->create([
            'question' => $data['question'],
            'question_type' => $data['question_type'],
            'required' => $data['required'] ?? false,
            'options' => $data['options'] ?? null,
            'sort_order' => $data['sort_order'] ?? $event->questions()->count(),
        ]);
    }

    public function deleteQuestion(RsvpQuestion $question): void
    {
        $question->delete();
    }

    private function resolveGuest(Event $event, array $data): EventGuest
    {
        if (! empty($data['guest_id'])) {
            $guest = $event->guests()->whereKey($data['guest_id'])->first();

            if (! $guest) {
                throw ValidationException::withMessages(['guest_id' => 'This guest does not belong to the event.']);
            }

            return $guest;
        }

        if (! empty($data['email'])) {
            return EventGuest::firstOrCreate(
                ['event_id' => $event->id, 'email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone_number' => $data['phone_number'] ?? null,
                    'invite_status' => 'opened',
                ]
            );
        }

        return $event->guests()->create([
            'name' => $data['name'],
            'phone_number' => $data['phone_number'] ?? null,
            'invite_status' => 'opened',
        ]);
    }

    private function storeAnswers(Event $event, EventGuest $guest, array $answers): void
    {
        $questions = $event->questions()->get()->keyBy('id');
        $answerMap = collect($answers)->keyBy('question_id');

        foreach ($questions as $question) {
            if ($question->required && ! $answerMap->has($question->id)) {
                throw ValidationException::withMessages([
                    'answers' => "The question '{$question->question}' requires an answer.",
                ]);
            }
        }

        $questionIds = collect($answers)->pluck('question_id')->filter()->values();
        $guest->answers()
            ->when($questionIds->isNotEmpty(), fn ($query) => $query->whereNotIn('question_id', $questionIds))
            ->when($questionIds->isEmpty(), fn ($query) => $query)
            ->delete();

        foreach ($answers as $answer) {
            if (! $questions->has($answer['question_id'])) {
                throw ValidationException::withMessages(['answers' => 'One or more answers are for questions outside this event.']);
            }

            $guest->answers()->updateOrCreate(
                ['question_id' => $answer['question_id']],
                ['answer' => ['value' => $answer['answer'] ?? null]]
            );
        }
    }
}
