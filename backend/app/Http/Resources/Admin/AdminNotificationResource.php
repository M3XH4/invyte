<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminNotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'recipient' => $this->user?->email ?? ($this->data['recipient'] ?? 'all_users'),
            'is_read' => (bool) $this->is_read,
            'isRead' => (bool) $this->is_read,
            'created_at' => $this->created_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'data' => $this->data ?? [],
        ];
    }
}
