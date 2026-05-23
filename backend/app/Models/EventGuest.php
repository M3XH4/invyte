<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventGuest extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = [
        'event_id',
        'user_id',
        'email',
        'phone_number',
        'name',
        'role',
        'invite_status',
        'response_status',
        'plus_ones',
        'invited_at',
        'opened_at',
        'responded_at',
        'checked_in_at',
    ];

    protected function casts(): array
    {
        return [
            'plus_ones' => 'integer',
            'invited_at' => 'datetime',
            'opened_at' => 'datetime',
            'responded_at' => 'datetime',
            'checked_in_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(RsvpAnswer::class, 'guest_id');
    }
}
