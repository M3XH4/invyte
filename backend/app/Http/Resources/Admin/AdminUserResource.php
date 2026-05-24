<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'role' => $this->role,
            'status' => $this->resolveStatus(),
            'avatarUrl' => $this->avatar,
            'totalHostedEvents' => (int) ($this->events_count ?? 0),
            'guestRsvpCount' => (int) ($this->guest_invites_count ?? 0),
            'joinedAt' => $this->created_at?->toISOString(),
        ];
    }

    private function resolveStatus(): string
    {
        if ($this->role === 'admin') {
            return 'active';
        }

        return $this->email_verified_at ? 'active' : 'pending';
    }
}
