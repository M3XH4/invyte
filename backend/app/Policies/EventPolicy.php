<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function view(User $user, Event $event): bool
    {
        return $this->owns($user, $event) || $event->guests()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id);

                if ($user->email) {
                    $query->orWhere('email', $user->email);
                }
            })
            ->exists();
    }

    public function update(User $user, Event $event): bool
    {
        return $this->owns($user, $event);
    }

    public function delete(User $user, Event $event): bool
    {
        return $this->owns($user, $event);
    }

    public function restore(User $user, Event $event): bool
    {
        return $this->owns($user, $event);
    }

    public function forceDelete(User $user, Event $event): bool
    {
        return $this->owns($user, $event);
    }

    public function manage(User $user, Event $event): bool
    {
        return $this->owns($user, $event);
    }

    private function owns(User $user, Event $event): bool
    {
        return (string) $event->user_id === (string) $user->id || $user->role === 'admin';
    }
}
