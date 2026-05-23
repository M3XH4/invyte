<?php

namespace App\Jobs;

use App\Models\Event;
use App\Services\EventService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class GenerateQrCodeJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event)
    {
    }

    public function handle(EventService $events): void
    {
        $events->ensureQrCode($this->event->refresh());
    }
}
