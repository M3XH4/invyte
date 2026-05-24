<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $event = $this->event;
        $permissions = [
            'role' => 'guest',
            'can_view_details' => true,
            'can_view_guest_list' => (bool) $event->show_guest_list,
            'can_edit_event' => false,
            'can_open_settings' => false,
            'can_add_guest' => false,
            'can_remove_guest' => false,
            'can_archive_event' => false,
            'can_delete_event' => false,
            'can_restore_event' => false,
            'can_manage_attendance' => false,
            'can_view_own_rsvp' => true,
            'can_update_own_rsvp' => ! $event->archived_at
                && $event->computedStatus() !== 'past'
                && (! $event->rsvp_deadline || $event->rsvp_deadline->isFuture()),
            'can_view_guest_answers' => false,
        ];

        return [
            'id' => $event->id,
            'uuid' => $event->id,
            'slug' => $event->slug,
            'title' => $event->title,
            'description' => $event->description,
            'cover_image' => $event->cover_image,
            'coverImage' => $event->cover_image,
            'start_date' => $event->start_date?->toDateString(),
            'date' => $event->start_date?->toDateString(),
            'start_time' => $event->start_time,
            'time' => $event->start_time,
            'venue_address' => $event->venue_address,
            'location' => $event->venue_address,
            'show_guest_list' => (bool) $event->show_guest_list,
            'host' => [
                'name' => $event->host?->name,
            ],
            'guest' => new EventGuestResource($this->resource->loadMissing('answers.question')),
            'permissions' => $permissions,
            'event' => new EventResource($event),
        ];
    }
}
