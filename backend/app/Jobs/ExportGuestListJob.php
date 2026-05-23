<?php

namespace App\Jobs;

use App\Models\Event;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ExportGuestListJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Event $event)
    {
    }

    public function handle(): void
    {
        // Generate CSV/XLSX exports here and store them in S3 or Cloudinary-backed storage.
    }
}
