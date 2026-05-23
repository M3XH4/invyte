<?php

namespace App\Services;

use App\Models\EventGuest;
use App\Models\Event;

class EventStatsService
{
    public function forEvent(Event $event): array
    {
        return $this->guestStats($event->id);
    }

    public function guestStats(string $eventId): array
    {
        $counts = EventGuest::query()
            ->where('event_id', $eventId)
            ->selectRaw(
                '
                COUNT(*) as total_invited,
                SUM(CASE WHEN response_status = ? THEN 1 ELSE 0 END) as going,
                SUM(CASE WHEN response_status = ? THEN 1 ELSE 0 END) as maybe,
                SUM(CASE WHEN response_status in (?, ?) THEN 1 ELSE 0 END) as not_going,
                SUM(CASE WHEN response_status = ? THEN 1 ELSE 0 END) as pending
                ',
                ['going', 'maybe', 'not_going', 'cant_go', 'pending']
            )
            ->first();
        $totalInvited = (int) ($counts->total_invited ?? 0);
        $going = (int) ($counts->going ?? 0);
        $maybe = (int) ($counts->maybe ?? 0);
        $notGoing = (int) ($counts->not_going ?? 0);
        $pending = (int) ($counts->pending ?? 0);
        $responseRate = $totalInvited > 0
            ? (int) round((($going + $maybe + $notGoing) / $totalInvited) * 100)
            : 0;

        return [
            'going' => $going,
            'maybe' => $maybe,
            'notGoing' => $notGoing,
            'not_going' => $notGoing,
            'pending' => $pending,
            'totalInvited' => $totalInvited,
            'total_invited' => $totalInvited,
            'responseRate' => $responseRate,
            'response_rate' => $responseRate,
        ];
    }
}
