<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminGuestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email ?? '',
            'eventId' => $this->event_id,
            'eventTitle' => $this->event?->title ?? 'Unknown Event',
            'rsvpStatus' => $this->normalizeRsvpStatus(),
            'plusOnes' => (int) $this->plus_ones,
            'attendanceStatus' => $this->resolveAttendanceStatus(),
            'checkedInAt' => $this->checked_in_at?->toISOString(),
            'answers' => $this->relationLoaded('answers')
                ? $this->answers->map(fn ($answer) => [
                    'question' => $answer->question?->question ?? 'Question',
                    'answer' => is_array($answer->answer)
                        ? implode(', ', $answer->answer)
                        : (string) ($answer->answer ?? ''),
                ])->values()->all()
                : [],
        ];
    }

    private function normalizeRsvpStatus(): string
    {
        return match ($this->response_status) {
            'cant_go' => 'not_going',
            default => $this->response_status ?: 'pending',
        };
    }

    private function resolveAttendanceStatus(): string
    {
        if ($this->checked_in_at) {
            return 'checked_in';
        }

        $eventEnded = $this->event?->computedStatus() === 'past';

        if ($eventEnded && $this->response_status === 'going') {
            return 'no_show';
        }

        return 'not_checked_in';
    }
}
