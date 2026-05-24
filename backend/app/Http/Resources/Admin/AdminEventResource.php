<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $going = (int) ($this->going_count ?? 0);
        $maybe = (int) ($this->maybe_count ?? 0);
        $notGoing = (int) ($this->not_going_count ?? 0);
        $pending = (int) ($this->pending_count ?? 0);
        $totalInvited = (int) ($this->guests_count ?? ($going + $maybe + $notGoing + $pending));
        $responded = $going + $maybe + $notGoing;
        $responseRate = $totalInvited > 0 ? round(($responded / $totalInvited) * 100, 1) : 0;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'hostId' => $this->user_id,
            'hostName' => $this->host?->name ?? 'Unknown',
            'category' => $this->category?->name ?? 'Uncategorized',
            'categorySlug' => $this->category?->slug,
            'startDate' => $this->start_date?->toDateString(),
            'startTime' => $this->start_time,
            'venueAddress' => $this->venue_address ?? $this->venue_name ?? '',
            'status' => $this->computedStatus(),
            'isArchived' => (bool) $this->archived_at,
            'archivedAt' => $this->archived_at?->toISOString(),
            'rsvp' => [
                'going' => $going,
                'maybe' => $maybe,
                'notGoing' => $notGoing,
                'pending' => $pending,
            ],
            'totalInvited' => $totalInvited,
            'responseRate' => $responseRate,
            'description' => $this->description,
            'maxGuests' => $this->max_guests,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
