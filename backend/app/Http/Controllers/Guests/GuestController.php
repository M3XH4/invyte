<?php

namespace App\Http\Controllers\Guests;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Guests\StoreGuestRequest;
use App\Http\Requests\Guests\UpdateGuestRequest;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\EventGuestResource;
use App\Http\Resources\GuestDetailsResource;
use App\Models\Event;
use App\Models\EventGuest;
use App\Services\ActivityLogService;
use App\Services\EventStatsService;
use App\Services\GuestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestController extends ApiController
{
    public function __construct(
        private readonly GuestService $guests,
        private readonly EventStatsService $stats,
        private readonly ActivityLogService $activityLogs,
    )
    {
    }

    public function index(Request $request, Event $event): JsonResponse
    {
        $this->authorize('manage', $event);

        $guests = $this->guests->list($event, $request->only(['search', 'status', 'per_page']));

        return $this->success('Guests loaded', EventGuestResource::collection($guests));
    }

    public function store(StoreGuestRequest $request, Event $event): JsonResponse
    {
        $this->authorize('manage', $event);

        $guest = $this->guests->create($event, $request->validated());
        $log = $this->activityLogs->record(
            $event,
            $request->user(),
            'guest_added',
            'Guest added',
            "{$guest->name} was added to the guest list.",
            $guest,
            ['guest_id' => $guest->id]
        );

        return $this->success('Guest added successfully', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->stats->guestStats($event->id),
            'activity_log' => new ActivityLogResource($log),
        ], 201);
    }

    public function show(Event $event, EventGuest $guest): JsonResponse
    {
        $this->authorize('manage', $event);
        abort_unless($guest->event_id === $event->id, 404);

        return $this->success('Guest details loaded', new GuestDetailsResource(
            $guest->load(['answers.question', 'event'])
        ));
    }

    public function update(UpdateGuestRequest $request, Event $event, EventGuest $guest): JsonResponse
    {
        $this->authorize('manage', $event);
        abort_unless($guest->event_id === $event->id, 404);

        $guest = $this->guests->update($guest, $request->validated());
        $log = $this->activityLogs->record(
            $event,
            $request->user(),
            'guest_updated',
            'Guest updated',
            "{$guest->name} was updated.",
            $guest,
            ['guest_id' => $guest->id, 'response_status' => $guest->response_status]
        );

        return $this->success('Guest updated successfully', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->stats->guestStats($event->id),
            'activity_log' => new ActivityLogResource($log),
        ]);
    }

    public function destroy(Event $event, EventGuest $guest): JsonResponse
    {
        $this->authorize('manage', $event);
        abort_unless($guest->event_id === $event->id, 404);

        $guestName = $guest->name;
        $guestId = $guest->id;
        $this->guests->delete($guest);
        $log = $this->activityLogs->record(
            $event,
            auth()->user(),
            'guest_removed',
            'Guest removed',
            "{$guestName} was removed from the guest list.",
            null,
            ['guest_id' => $guestId]
        );

        return $this->success('Guest deleted successfully', [
            'event_stats' => $this->stats->guestStats($event->id),
            'activity_log' => new ActivityLogResource($log),
        ]);
    }

    public function checkIn(Request $request, Event $event, EventGuest $guest): JsonResponse
    {
        $this->authorize('manage', $event);
        abort_unless($guest->event_id === $event->id, 404);

        $guest = $this->guests->checkIn($guest, $request->boolean('checked_in', true));
        $log = $this->activityLogs->record(
            $event,
            $request->user(),
            $guest->checked_in_at ? 'attendance_checked_in' : 'attendance_reset',
            $guest->checked_in_at ? 'Guest checked in' : 'Attendance reset',
            $guest->checked_in_at ? "{$guest->name} was checked in." : "{$guest->name}'s attendance was reset.",
            $guest,
            ['guest_id' => $guest->id, 'checked_in' => (bool) $guest->checked_in_at]
        );

        return $this->success('Guest attendance updated', [
            'guest' => new EventGuestResource($guest),
            'event_stats' => $this->stats->guestStats($event->id),
            'activity_log' => new ActivityLogResource($log),
        ]);
    }

    public function attendance(Request $request, Event $event, EventGuest $guest): JsonResponse
    {
        return $this->checkIn($request, $event, $guest);
    }

}
