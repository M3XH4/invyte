<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminEventResource;
use App\Models\Event;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        $events = $this->admin->listEvents($request->only(['search', 'status', 'per_page']));

        return $this->success('Events loaded', AdminEventResource::collection($events));
    }

    public function archived(Request $request): JsonResponse
    {
        $events = $this->admin->listArchivedEvents($request->only(['search', 'per_page']));

        return $this->success('Archived events loaded', AdminEventResource::collection($events));
    }

    public function show(Event $event): JsonResponse
    {
        $event = $this->admin->findEvent($event->id);

        return $this->success('Event loaded', new AdminEventResource($event));
    }

    public function archive(Event $event): JsonResponse
    {
        return $this->success('Event archived', new AdminEventResource($this->admin->archiveEvent($event)));
    }

    public function restore(Event $event): JsonResponse
    {
        return $this->success('Event restored', new AdminEventResource($this->admin->restoreEvent($event)));
    }

    public function destroy(Event $event): JsonResponse
    {
        abort_unless($event->archived_at, 422, 'Only archived events can be permanently deleted.');

        $this->admin->forceDeleteEvent($event);

        return $this->success('Event permanently deleted');
    }
}
