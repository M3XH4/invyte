<?php

namespace App\Jobs;

use App\Models\Event;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendReminderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event)
    {
    }

    public function handle(NotificationService $notifications): void
    {
        $event = $this->event->refresh();

        $notifications->create(
            $event->user_id,
            'Event reminder',
            "{$event->title} is coming up.",
            'event_reminder',
            ['event_id' => $event->id, 'slug' => $event->slug]
        );
    }
}
