<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventGuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->id,
            'event_id' => $this->event_id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'contact_method' => $this->email ? 'email' : ($this->phone_number ? 'phone' : null),
            'contact_value' => $this->email ?: $this->phone_number,
            'role' => $this->role,
            'invite_status' => $this->invite_status,
            'response_status' => $this->response_status,
            'status' => $this->response_status,
            'plus_ones' => $this->plus_ones,
            'invited_at' => $this->invited_at?->toISOString(),
            'opened_at' => $this->opened_at?->toISOString(),
            'responded_at' => $this->responded_at?->toISOString(),
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            'attended' => (bool) $this->checked_in_at,
            'answers' => RsvpAnswerResource::collection($this->whenLoaded('answers')),
            'event' => $this->whenLoaded('event', fn () => [
                'id' => $this->event->id,
                'uuid' => $this->event->id,
                'title' => $this->event->title,
                'start_date' => $this->event->start_date?->toDateString(),
                'date' => $this->event->start_date?->toDateString(),
                'start_time' => $this->event->start_time,
                'time' => $this->event->start_time,
                'venue_address' => $this->event->venue_address,
                'location' => $this->event->venue_address,
            ]),
        ];
    }
}
