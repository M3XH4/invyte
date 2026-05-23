<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    public function record(
        Event $event,
        ?User $user,
        string $type,
        string $action,
        ?string $description = null,
        ?Model $subject = null,
        array $metadata = [],
    ): ActivityLog {
        return ActivityLog::create([
            'event_id' => $event->id,
            'user_id' => $user?->id,
            'type' => $type,
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'metadata' => array_merge(['type' => $type], $metadata),
        ]);
    }
}
