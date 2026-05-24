<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $this->image,
            'icon' => $this->icon,
            'color' => $this->color ?? '#a855f7',
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'isActive' => (bool) $this->is_active,
            'events_count' => (int) ($this->events_count ?? 0),
            'eventCount' => (int) ($this->events_count ?? 0),
        ];
    }
}
