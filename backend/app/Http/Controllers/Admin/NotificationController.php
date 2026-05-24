<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Http\Resources\Admin\AdminNotificationResource;
use App\Models\UserNotification;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function __construct(private readonly AdminService $admin) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->admin->listNotifications($request->only([
            'search',
            'read',
            'type',
            'per_page',
        ]));

        return $this->success('Notifications loaded', [
            'items' => AdminNotificationResource::collection($notifications->items()),
            'unread_count' => $this->admin->unreadNotificationCount(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        return $this->success('Unread count loaded', [
            'unread_count' => $this->admin->unreadNotificationCount(),
        ]);
    }

    public function markRead(UserNotification $notification): JsonResponse
    {
        $notification = $this->admin->markNotificationRead($notification);

        return $this->success('Notification marked as read', new AdminNotificationResource($notification));
    }

    public function markAllRead(): JsonResponse
    {
        $updated = $this->admin->markAllNotificationsRead();

        return $this->success('All notifications marked as read', [
            'updated' => $updated,
            'unread_count' => 0,
        ]);
    }
}
