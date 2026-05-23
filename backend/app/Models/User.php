<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Concerns\HasUuidPrimaryKey;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuidPrimaryKey, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'bio',
        'phone_number',
        'is_guest',
        'has_seen_getting_started',
        'has_seen_onboarding',
        'role',
        'provider',
        'provider_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function guestEvents(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_guests')
            ->withPivot(['id', 'name', 'email', 'response_status', 'plus_ones', 'checked_in_at'])
            ->withTimestamps();
    }

    public function guestInvites(): HasMany
    {
        return $this->hasMany(EventGuest::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    public function pushTokens(): HasMany
    {
        return $this->hasMany(UserPushToken::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_guest' => 'boolean',
            'has_seen_getting_started' => 'boolean',
            'has_seen_onboarding' => 'boolean',
        ];
    }
}
