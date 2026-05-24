<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventGuest;
use App\Models\Theme;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class AdminService
{
    public function __construct(private readonly EventService $events) {}

    public function dashboardStats(): array
    {
        $totalEvents = Event::withTrashed()->count();
        $archivedEvents = Event::whereNotNull('archived_at')->count();
        $activeEvents = Event::whereNull('archived_at')
            ->where(function (Builder $query) {
                $query->whereDate('start_date', '>=', now()->toDateString())
                    ->orWhere(function (Builder $query) {
                        $query->whereDate('start_date', '<=', now()->toDateString())
                            ->where(function (Builder $query) {
                                $query->whereNull('end_date')
                                    ->orWhereDate('end_date', '>=', now()->toDateString());
                            });
                    });
            })
            ->count();

        $guestQuery = EventGuest::query();
        $totalGuests = (clone $guestQuery)->count();
        $responded = (clone $guestQuery)->whereIn('response_status', ['going', 'maybe', 'not_going', 'cant_go'])->count();
        $rsvpResponseRate = $totalGuests > 0 ? round(($responded / $totalGuests) * 100, 1) : 0;

        return [
            'totalUsers' => User::count(),
            'totalEvents' => $totalEvents,
            'activeEvents' => $activeEvents,
            'archivedEvents' => $archivedEvents,
            'totalGuests' => $totalGuests,
            'rsvpResponseRate' => $rsvpResponseRate,
        ];
    }

    public function eventGrowthChart(): array
    {
        $months = collect(range(5, 0))->map(fn (int $offset) => now()->subMonths($offset)->startOfMonth());

        return $months->map(function (Carbon $month) {
            $end = $month->copy()->endOfMonth();

            return [
                'month' => $month->format('M'),
                'events' => Event::whereBetween('created_at', [$month, $end])->count(),
            ];
        })->values()->all();
    }

    public function rsvpStatusChart(): array
    {
        $counts = EventGuest::query()
            ->selectRaw("
                SUM(CASE WHEN response_status = 'going' THEN 1 ELSE 0 END) as going,
                SUM(CASE WHEN response_status = 'maybe' THEN 1 ELSE 0 END) as maybe,
                SUM(CASE WHEN response_status IN ('not_going', 'cant_go') THEN 1 ELSE 0 END) as not_going,
                SUM(CASE WHEN response_status = 'pending' OR response_status IS NULL THEN 1 ELSE 0 END) as pending
            ")
            ->first();

        return [
            ['name' => 'Going', 'value' => (int) ($counts->going ?? 0), 'fill' => '#22c55e'],
            ['name' => 'Maybe', 'value' => (int) ($counts->maybe ?? 0), 'fill' => '#fbbf24'],
            ['name' => 'Not Going', 'value' => (int) ($counts->not_going ?? 0), 'fill' => '#ef4444'],
            ['name' => 'Pending', 'value' => (int) ($counts->pending ?? 0), 'fill' => '#a855f7'],
        ];
    }

    public function recentActivityLogs(int $limit = 10): Collection
    {
        return ActivityLog::query()
            ->with(['user:id,name', 'event:id,title'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function upcomingEvents(int $limit = 5): Collection
    {
        return $this->eventQuery()
            ->whereNull('archived_at')
            ->whereDate('start_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->orderBy('start_time')
            ->limit($limit)
            ->get();
    }

    public function listEvents(array $filters = []): LengthAwarePaginator
    {
        $query = $this->eventQuery();

        if (! empty($filters['archived'])) {
            $query->whereNotNull('archived_at');
        } else {
            $query->whereNull('archived_at');
        }

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($search) {
                $query->where('title', 'LIKE', $search)
                    ->orWhere('venue_address', 'LIKE', $search)
                    ->orWhereHas('host', fn (Builder $q) => $q->where('name', 'LIKE', $search));
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->timelineStatus($filters['status']);
        }

        return $query
            ->orderByDesc('created_at')
            ->paginate(max(1, min((int) ($filters['per_page'] ?? 20), 100)));
    }

    public function listArchivedEvents(array $filters = []): LengthAwarePaginator
    {
        return $this->listEvents(array_merge($filters, ['archived' => true]));
    }

    public function findEvent(string $id): Event
    {
        return $this->eventQuery()->whereKey($id)->firstOrFail();
    }

    public function listUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->withCount(['events', 'guestInvites']);

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($search) {
                $query->where('name', 'LIKE', $search)
                    ->orWhere('email', 'LIKE', $search)
                    ->orWhere('username', 'LIKE', $search);
            });
        }

        if (! empty($filters['role']) && $filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        return $query->orderByDesc('created_at')->paginate(max(1, min((int) ($filters['per_page'] ?? 20), 100)));
    }

    public function listGuests(array $filters = []): LengthAwarePaginator
    {
        $query = EventGuest::query()
            ->with(['event:id,title,start_date,end_date,archived_at', 'answers.question']);

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($search) {
                $query->where('name', 'LIKE', $search)
                    ->orWhere('email', 'LIKE', $search)
                    ->orWhereHas('event', fn (Builder $q) => $q->where('title', 'LIKE', $search));
            });
        }

        if (! empty($filters['rsvp_status']) && $filters['rsvp_status'] !== 'all') {
            $status = $filters['rsvp_status'] === 'not_going' ? ['not_going', 'cant_go'] : [$filters['rsvp_status']];
            $query->whereIn('response_status', $status);
        }

        return $query->orderByDesc('created_at')->paginate(max(1, min((int) ($filters['per_page'] ?? 20), 100)));
    }

    public function rsvpAnalytics(): array
    {
        $stats = EventGuest::query()
            ->selectRaw("
                SUM(CASE WHEN response_status = 'going' THEN 1 ELSE 0 END) as going,
                SUM(CASE WHEN response_status = 'maybe' THEN 1 ELSE 0 END) as maybe,
                SUM(CASE WHEN response_status IN ('not_going', 'cant_go') THEN 1 ELSE 0 END) as not_going,
                SUM(CASE WHEN response_status = 'pending' OR response_status IS NULL THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as checked_in
            ")
            ->first();

        $going = (int) ($stats->going ?? 0);
        $maybe = (int) ($stats->maybe ?? 0);
        $notGoing = (int) ($stats->not_going ?? 0);
        $pending = (int) ($stats->pending ?? 0);
        $total = $going + $maybe + $notGoing + $pending;
        $responded = $going + $maybe + $notGoing;
        $checkedIn = (int) ($stats->checked_in ?? 0);

        return [
            'going' => $going,
            'maybe' => $maybe,
            'notGoing' => $notGoing,
            'pending' => $pending,
            'attendanceRate' => $going > 0 ? round(($checkedIn / $going) * 100, 1) : 0,
            'responseRate' => $total > 0 ? round(($responded / $total) * 100, 1) : 0,
            'responseRateOverTime' => $this->responseRateOverTime(),
            'categoryActivity' => $this->categoryActivity(),
        ];
    }

    public function search(string $query): array
    {
        $like = '%'.$query.'%';

        return [
            'events' => $this->eventQuery()
                ->where(function (Builder $query) use ($like) {
                    $query->where('title', 'LIKE', $like)
                        ->orWhere('venue_address', 'LIKE', $like);
                })
                ->limit(5)
                ->get(),
            'users' => User::query()
                ->where(function (Builder $query) use ($like) {
                    $query->where('name', 'LIKE', $like)
                        ->orWhere('email', 'LIKE', $like)
                        ->orWhere('username', 'LIKE', $like);
                })
                ->withCount(['events', 'guestInvites'])
                ->limit(5)
                ->get(),
            'guests' => EventGuest::query()
                ->with(['event:id,title,start_date,end_date,archived_at', 'answers.question'])
                ->where(function (Builder $query) use ($like) {
                    $query->where('name', 'LIKE', $like)
                        ->orWhere('email', 'LIKE', $like);
                })
                ->limit(5)
                ->get(),
            'categories' => EventCategory::query()
                ->withCount('events')
                ->where('name', 'LIKE', $like)
                ->limit(5)
                ->get(),
            'themes' => Theme::query()
                ->with(['category:id,name,slug'])
                ->withCount('events')
                ->where('name', 'LIKE', $like)
                ->limit(5)
                ->get(),
        ];
    }

    public function listCategories(array $filters = []): Collection
    {
        $query = EventCategory::query()->withCount('events');

        if (! empty($filters['search'])) {
            $like = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($like) {
                $query->where('name', 'LIKE', $like)
                    ->orWhere('slug', 'LIKE', $like)
                    ->orWhere('description', 'LIKE', $like);
            });
        }

        if (isset($filters['active']) && $filters['active'] !== 'all') {
            $query->where('is_active', $filters['active'] === 'true' || $filters['active'] === '1');
        }

        return $query->orderBy('name')->get();
    }

    public function createCategory(array $data): EventCategory
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        return EventCategory::create($data);
    }

    public function updateCategory(EventCategory $category, array $data): EventCategory
    {
        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $category->refresh();
    }

    public function deleteCategory(EventCategory $category): void
    {
        $category->delete();
    }

    public function listThemes(array $filters = []): Collection
    {
        $query = Theme::query()
            ->with(['category:id,name,slug'])
            ->withCount('events');

        if (! empty($filters['search'])) {
            $query->where('name', 'LIKE', '%'.$filters['search'].'%');
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['active']) && $filters['active'] !== 'all') {
            $query->where('is_active', $filters['active'] === 'true' || $filters['active'] === '1');
        }

        return $query->orderBy('name')->get();
    }

    public function createTheme(array $data): Theme
    {
        $colors = $data['colors'] ?? $data['preview_colors'] ?? [];
        $config = array_merge($data['config'] ?? [], [
            'colors' => $colors,
            'category' => $data['category'] ?? null,
            'mood' => $data['mood'] ?? null,
        ]);

        return Theme::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'category_id' => $data['category_id'] ?? $data['categoryId'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? $data['preview_image'] ?? null,
            'primary_color' => $data['primary_color'] ?? $data['primaryColor'] ?? ($colors[1] ?? null),
            'secondary_color' => $data['secondary_color'] ?? $data['secondaryColor'] ?? ($colors[2] ?? null),
            'background_color' => $data['background_color'] ?? $data['backgroundColor'] ?? ($colors[0] ?? null),
            'mood' => $data['mood'] ?? null,
            'preview_image' => $data['preview_image'] ?? $data['previewImage'] ?? null,
            'is_active' => $data['is_active'] ?? $data['isActive'] ?? true,
            'config' => $config,
        ])->load(['category'])->loadCount('events');
    }

    public function updateTheme(Theme $theme, array $data): Theme
    {
        $colors = $data['colors'] ?? $data['preview_colors'] ?? null;
        $config = array_merge($theme->config ?? [], $data['config'] ?? []);

        if ($colors !== null) {
            $config['colors'] = $colors;
        }

        if (isset($data['mood'])) {
            $config['mood'] = $data['mood'];
        }

        $theme->update(array_filter([
            'name' => $data['name'] ?? null,
            'slug' => $data['slug'] ?? null,
            'category_id' => $data['category_id'] ?? $data['categoryId'] ?? null,
            'thumbnail' => $data['thumbnail'] ?? null,
            'primary_color' => $data['primary_color'] ?? $data['primaryColor'] ?? null,
            'secondary_color' => $data['secondary_color'] ?? $data['secondaryColor'] ?? null,
            'background_color' => $data['background_color'] ?? $data['backgroundColor'] ?? null,
            'mood' => $data['mood'] ?? null,
            'preview_image' => $data['preview_image'] ?? $data['previewImage'] ?? null,
            'is_active' => $data['is_active'] ?? $data['isActive'] ?? null,
            'config' => $config,
        ], fn ($value) => $value !== null));

        return $theme->refresh()->load(['category'])->loadCount('events');
    }

    public function deleteTheme(Theme $theme): void
    {
        $theme->delete();
    }

    public function listNotifications(array $filters = []): LengthAwarePaginator
    {
        $query = UserNotification::query()->with('user:id,email,name');

        if (! empty($filters['search'])) {
            $search = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($search) {
                $query->where('title', 'LIKE', $search)
                    ->orWhere('message', 'LIKE', $search)
                    ->orWhereHas('user', fn (Builder $q) => $q->where('email', 'LIKE', $search));
            });
        }

        if (! empty($filters['read']) && $filters['read'] !== 'all') {
            $query->where('is_read', $filters['read'] === 'read');
        }

        if (! empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        return $query->latest()->paginate(max(1, min((int) ($filters['per_page'] ?? 20), 100)));
    }

    public function unreadNotificationCount(): int
    {
        return UserNotification::query()->where('is_read', false)->count();
    }

    public function markNotificationRead(UserNotification $notification): UserNotification
    {
        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return $notification->refresh()->load('user:id,email,name');
    }

    public function markAllNotificationsRead(): int
    {
        return UserNotification::query()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    public function reports(): array
    {
        $dashboard = $this->dashboardStats();
        $rsvp = $this->rsvpAnalytics();

        return [
            'eventStatistics' => [
                ['label' => 'Total Events', 'value' => $dashboard['totalEvents']],
                ['label' => 'Active Events', 'value' => $dashboard['activeEvents']],
                ['label' => 'Archived Events', 'value' => $dashboard['archivedEvents']],
                [
                    'label' => 'Avg Guests per Event',
                    'value' => $dashboard['totalEvents'] > 0
                        ? (int) round($dashboard['totalGuests'] / $dashboard['totalEvents'])
                        : 0,
                ],
            ],
            'userActivity' => [
                ['label' => 'Total Users', 'value' => number_format($dashboard['totalUsers'])],
                ['label' => 'New Users (30d)', 'value' => User::where('created_at', '>=', now()->subDays(30))->count()],
                ['label' => 'Active Hosts', 'value' => User::where('role', 'host')->whereHas('events')->count()],
                ['label' => 'Guest Accounts', 'value' => User::where('is_guest', true)->count()],
            ],
            'rsvpPerformance' => [
                ['label' => 'Response Rate', 'value' => $rsvp['responseRate'].'%'],
                ['label' => 'Attendance Rate', 'value' => $rsvp['attendanceRate'].'%'],
                ['label' => 'Going Responses', 'value' => number_format($rsvp['going'])],
                ['label' => 'Pending Invites', 'value' => number_format($rsvp['pending'])],
            ],
        ];
    }

    public function settings(): array
    {
        $settings = AppSetting::current()->settings ?? AppSetting::defaults();

        return [
            'appName' => $settings['app_name'] ?? AppSetting::defaults()['app_name'],
            'publicFrontendUrl' => $settings['public_frontend_url'] ?? AppSetting::defaults()['public_frontend_url'],
            'emailNotifications' => (bool) ($settings['email_notifications'] ?? true),
            'pushNotifications' => (bool) ($settings['push_notifications'] ?? true),
            'rsvpDeadlineDays' => (int) ($settings['rsvp_deadline_days'] ?? 3),
            'maxUploadMb' => (int) ($settings['max_upload_mb'] ?? 10),
            'adminName' => $settings['admin_name'] ?? AppSetting::defaults()['admin_name'],
            'adminEmail' => $settings['admin_email'] ?? AppSetting::defaults()['admin_email'],
        ];
    }

    public function updateSettings(array $data): array
    {
        $payload = array_filter([
            'app_name' => $data['appName'] ?? $data['app_name'] ?? null,
            'public_frontend_url' => $data['publicFrontendUrl'] ?? $data['public_frontend_url'] ?? null,
            'email_notifications' => $data['emailNotifications'] ?? $data['email_notifications'] ?? null,
            'push_notifications' => $data['pushNotifications'] ?? $data['push_notifications'] ?? null,
            'rsvp_deadline_days' => $data['rsvpDeadlineDays'] ?? $data['rsvp_deadline_days'] ?? null,
            'max_upload_mb' => $data['maxUploadMb'] ?? $data['max_upload_mb'] ?? null,
            'admin_name' => $data['adminName'] ?? $data['admin_name'] ?? null,
            'admin_email' => $data['adminEmail'] ?? $data['admin_email'] ?? null,
        ], fn ($value) => $value !== null);

        AppSetting::merge($payload);

        return $this->settings();
    }

    public function archiveEvent(Event $event): Event
    {
        return $this->events->archive($event);
    }

    public function restoreEvent(Event $event): Event
    {
        return $this->events->restore($event);
    }

    public function forceDeleteEvent(Event $event): void
    {
        $this->events->forceDelete($event);
    }

    private function eventQuery(): Builder
    {
        return $this->events->withCounts(
            Event::query()->with(['host:id,name', 'category:id,name,slug'])
        );
    }

    private function responseRateOverTime(): array
    {
        return collect(range(7, 0))->map(function (int $offset) {
            $start = now()->subWeeks($offset)->startOfWeek();
            $end = $start->copy()->endOfWeek();
            $total = EventGuest::whereBetween('created_at', [$start, $end])->count();
            $responded = EventGuest::whereBetween('created_at', [$start, $end])
                ->whereIn('response_status', ['going', 'maybe', 'not_going', 'cant_go'])
                ->count();

            return [
                'week' => 'W'.(8 - $offset),
                'rate' => $total > 0 ? (int) round(($responded / $total) * 100) : 0,
            ];
        })->values()->all();
    }

    private function categoryActivity(): array
    {
        return EventCategory::query()
            ->withCount('events')
            ->orderByDesc('events_count')
            ->limit(8)
            ->get()
            ->map(fn (EventCategory $category) => [
                'category' => $category->name,
                'count' => (int) $category->events_count,
            ])
            ->values()
            ->all();
    }
}
