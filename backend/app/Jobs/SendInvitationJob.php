<?php

namespace App\Jobs;

use App\Models\EventGuest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendInvitationJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public EventGuest $guest)
    {
    }

    public function handle(): void
    {
        $this->guest->forceFill([
            'invite_status' => 'sent',
            'invited_at' => now(),
        ])->save();

        // Wire mail, SMS, or Expo push providers here without blocking the API request.
    }
}
