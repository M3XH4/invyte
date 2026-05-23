<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->type ?: ($this->metadata['type'] ?? 'update');

        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'user_id' => $this->user_id,
            'type' => $type,
            'action' => $this->action,
            'description' => $this->description,
            'metadata' => $this->metadata ?? [],
            'timestamp' => $this->created_at?->diffForHumans(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
