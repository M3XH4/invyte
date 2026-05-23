<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'event' => new EventResource($this->event),
            'guest' => new EventGuestResource($this->resource->loadMissing('answers.question')),
            'permissions' => [
                'can_view_details' => true,
                'can_view_guest_list' => (bool) $this->event->show_guest_list,
                'can_edit_event' => false,
                'can_add_guest' => false,
                'can_delete_event' => false,
                'can_manage_attendance' => false,
            ],
        ];
    }
}
