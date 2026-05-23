<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\ApiController;
use App\Http\Requests\Notifications\MarkNotificationsReadRequest;
use App\Http\Requests\Notifications\StorePushTokenRequest;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use App\Services\PushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function __construct(
        private readonly NotificationService $notifications,
        private readonly PushNotificationService $push
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notifications->list($request->user(), (int) $request->query('per_page', 20));

        return $this->success('Notifications loaded', NotificationResource::collection($notifications));
    }

    public function markAsRead(MarkNotificationsReadRequest $request): JsonResponse
    {
        $count = $this->notifications->markAsRead($request->user(), $request->validated('ids', []));

        return $this->success('Notifications marked as read', ['updated' => $count]);
    }

    public function storePushToken(StorePushTokenRequest $request): JsonResponse
    {
        $this->push->register($request->user(), $request->validated());

        return $this->success('Push notifications enabled');
    }

    public function destroyPushToken(StorePushTokenRequest $request): JsonResponse
    {
        $this->push->unregister($request->user(), $request->validated('token'));

        return $this->success('Push notifications disabled on this device');
    }
}
