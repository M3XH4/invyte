<?php

namespace App\Services;

use App\Models\Event;
use App\Models\User;

class EventPermissionService
{
    public function forUser(Event $event, ?User $user): array
    {
        if ($user && ($user->role ?? null) === 'admin') {
            return $this->permissions($event, 'admin', true, true, true, false);
        }

        if ($user && (string) $event->user_id === (string) $user->id) {
            return $this->permissions($event, 'host', true, true, true, false);
        }

        $guest = $user ? $event->guests()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id);

                if ($user->email) {
                    $query->orWhere('email', $user->email);
                }
            })
            ->first() : null;

        if ($guest) {
            return $this->permissions($event, 'guest', false, (bool) $event->show_guest_list, false, true);
        }

        return $this->permissions($event, 'public', false, false, false, false);
    }

    private function permissions(
        Event $event,
        string $role,
        bool $canManage,
        bool $canViewGuestList,
        bool $canViewAnswers,
        bool $hasOwnRsvp,
    ): array
    {
        $canUpdateOwnRsvp = $role === 'guest'
            && $hasOwnRsvp
            && ! $event->archived_at
            && $event->computedStatus() !== 'past'
            && (! $event->rsvp_deadline || $event->rsvp_deadline->isFuture());

        return [
            'role' => $role,
            'can_view_details' => true,
            'can_view_guest_list' => $canManage || $canViewGuestList,
            'can_edit_event' => $canManage,
            'can_open_settings' => $canManage,
            'can_add_guest' => $canManage,
            'can_remove_guest' => $canManage,
            'can_archive_event' => $canManage,
            'can_delete_event' => $canManage,
            'can_restore_event' => $canManage,
            'can_manage_attendance' => $canManage,
            'can_view_own_rsvp' => $role === 'guest' && $hasOwnRsvp,
            'can_update_own_rsvp' => $canUpdateOwnRsvp,
            'can_view_guest_answers' => $canViewAnswers,
        ];
    }
}
