<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class NotificationService
{
    public function __construct(private readonly PushNotificationService $push)
    {
    }

    public function create(User|string $user, string $title, string $message, string $type = 'system', array $data = []): UserNotification
    {
        $userId = $user instanceof User ? $user->id : $user;

        $notification = UserNotification::create([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);

        $this->push->sendToUser($userId, $title, $message, [
            ...$data,
            'notification_id' => $notification->id,
            'type' => $type,
        ]);

        return $notification;
    }

    public function list(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return $user->notifications()
            ->latest()
            ->paginate(max(1, min($perPage, 100)));
    }

    public function markAsRead(User $user, array $ids = []): int
    {
        $query = $user->notifications()->where('is_read', false);

        if ($ids !== []) {
            $query->whereIn('id', $ids);
        }

        return $query->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function unread(User $user): Collection
    {
        return $user->notifications()->where('is_read', false)->latest()->get();
    }
}
