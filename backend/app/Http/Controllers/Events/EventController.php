<?php

namespace App\Http\Controllers\Events;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Events\StoreEventRequest;
use App\Http\Requests\Events\UpdateEventRequest;
use App\Http\Requests\Events\UploadEventCoverRequest;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\EventResource;
use App\Http\Resources\QrCodeResource;
use App\Models\Event;
use App\Services\EventService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EventController extends ApiController
{
    public function __construct(private readonly EventService $events)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $events = $this->events->listForUser($request->user(), $request->only(['search', 'status', 'category', 'sort', 'per_page']));

        return $this->success('Events loaded', EventResource::collection($events));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = $this->events->create($request->user(), $request->validated());

        return $this->success('Event created successfully', new EventResource($event), 201);
    }

    public function show(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        $event = $this->events->withCounts(Event::whereKey($event->id))
            ->with(['category', 'theme', 'qrCode', 'questions', 'guests.answers.question', 'media', 'host'])
            ->firstOrFail();

        return $this->success('Event loaded', new EventResource($event));
    }

    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        return $this->success('Event updated successfully', new EventResource($this->events->update($event, $request->validated())));
    }

    public function cover(UploadEventCoverRequest $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        if ($event->cover_image_path) {
            Storage::disk('public')->delete($event->cover_image_path);
        }

        $path = $request->file('cover')->store('event-covers', 'public');
        $event = $this->events->update($event, [
            'cover_image' => Storage::disk('public')->url($path),
            'cover_image_path' => $path,
        ]);

        return $this->success('Event cover updated successfully', new EventResource($event));
    }

    public function destroy(Event $event): JsonResponse
    {
        $this->authorize('delete', $event);

        $event = DB::transaction(fn () => $this->events->archive($event));

        return $this->success('Event moved to archive', new EventResource($event));
    }

    public function archive(Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        return $this->success('Event archived successfully', new EventResource($this->events->archive($event)));
    }

    public function restore(Event $event): JsonResponse
    {
        $this->authorize('restore', $event);

        return $this->success('Event restored successfully', new EventResource($this->events->restore($event)));
    }

    public function forceDelete(Event $event): JsonResponse
    {
        $this->authorize('forceDelete', $event);
        abort_unless($event->archived_at, 422, 'Only archived events can be permanently deleted.');

        DB::transaction(fn () => $this->events->forceDelete($event));

        return $this->success('Event permanently deleted');
    }

    public function duplicate(Request $request, Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        $copy = $this->events->duplicate($event->load(['questions', 'media']), $request->user());

        return $this->success('Event duplicated successfully', new EventResource($copy), 201);
    }

    public function qr(Event $event): JsonResponse
    {
        $this->authorize('update', $event);

        return $this->success('QR invitation loaded', new QrCodeResource($this->events->ensureQrCode($event)));
    }

    public function activityLogs(Event $event): JsonResponse
    {
        $this->authorize('view', $event);

        return $this->success('Activity logs loaded', ActivityLogResource::collection($event->activityLogs()
            ->latest()
            ->limit(50)
            ->get()));
    }
}
