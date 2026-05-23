<?php

namespace App\Services;

use App\Models\Event;
use App\Models\EventGuest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class GuestService
{
    public function list(Event $event, array $filters = []): LengthAwarePaginator
    {
        $query = $event->guests()->with('answers.question');

        if (! empty($filters['search'])) {
            $like = '%'.$filters['search'].'%';
            $query->where(function (Builder $query) use ($like) {
                $query->where('name', 'LIKE', $like)
                    ->orWhere('email', 'LIKE', $like)
                    ->orWhere('phone_number', 'LIKE', $like);
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('response_status', $filters['status']);
        }

        return $query->orderBy('name')->paginate(max(1, min((int) ($filters['per_page'] ?? 20), 100)));
    }

    public function create(Event $event, array $data): EventGuest
    {
        $payload = [
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone_number' => $data['phone_number'] ?? null,
            'role' => $data['role'] ?? 'guest',
            'invite_status' => $data['invite_status'] ?? 'pending',
            'response_status' => $data['response_status'] ?? 'pending',
            'plus_ones' => $data['plus_ones'] ?? 0,
            'invited_at' => ($data['invite_status'] ?? null) === 'sent' ? now() : null,
        ];

        if (! empty($payload['email'])) {
            return EventGuest::updateOrCreate(
                ['event_id' => $event->id, 'email' => $payload['email']],
                $payload + ['event_id' => $event->id]
            );
        }

        return $event->guests()->create($payload);
    }

    public function update(EventGuest $guest, array $data): EventGuest
    {
        $guest->update($data);

        return $guest->refresh()->load('answers.question');
    }

    public function checkIn(EventGuest $guest, bool $checkedIn = true): EventGuest
    {
        $guest->forceFill(['checked_in_at' => $checkedIn ? now() : null])->save();

        return $guest->refresh();
    }

    public function delete(EventGuest $guest): void
    {
        $guest->delete();
    }
}
