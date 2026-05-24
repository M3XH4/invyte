<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->type ?: 'system';

        return [
            'id' => $this->id,
            'action' => $this->action,
            'description' => $this->description ?? $this->action,
            'userName' => $this->user?->name,
            'eventTitle' => $this->event?->title,
            'createdAt' => $this->created_at?->toISOString(),
            'type' => match (true) {
                str_contains((string) $type, 'rsvp'), str_contains((string) $this->action, 'rsvp') => 'rsvp',
                str_contains((string) $type, 'user'), str_contains((string) $this->action, 'user') => 'user',
                str_contains((string) $type, 'event'), str_contains((string) $this->action, 'event') => 'event',
                default => 'system',
            },
        ];
    }
}
