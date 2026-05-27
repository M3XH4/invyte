<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Event extends Model
{
    use HasUuidPrimaryKey;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'theme_id',
        'title',
        'description',
        'cover_image',
        'cover_image_path',
        'start_date',
        'start_time',
        'end_date',
        'end_time',
        'venue_name',
        'venue_address',
        'latitude',
        'longitude',
        'privacy',
        'status',
        'dress_code',
        'food_option',
        'max_guests',
        'rsvp_enabled',
        'allow_plus_ones',
        'allow_guest_invites',
        'show_guest_list',
        'rsvp_deadline',
        'slug',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'max_guests' => 'integer',
            'rsvp_enabled' => 'boolean',
            'allow_plus_ones' => 'boolean',
            'allow_guest_invites' => 'boolean',
            'show_guest_list' => 'boolean',
            'rsvp_deadline' => 'datetime',
            'archived_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }

    public function guests(): HasMany
    {
        return $this->hasMany(EventGuest::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(RsvpQuestion::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(EventMedia::class);
    }

    public function qrCode(): HasOne
    {
        return $this->hasOne(QrCode::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function scopeOwnedBy(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function (Builder $query, string $search) {
            $like = '%'.$search.'%';

            $query->where(function (Builder $query) use ($like) {
                $query->where('title', 'LIKE', $like)
                    ->orWhere('venue_name', 'LIKE', $like)
                    ->orWhere('venue_address', 'LIKE', $like)
                    ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'LIKE', $like));
            });
        });
    }

    public function scopeTimelineStatus(Builder $query, ?string $status): Builder
    {
        $today = now()->toDateString();
        $time = now()->format('H:i:s');

        return match ($status) {
            'upcoming' => $query
                ->whereNull('archived_at')
                ->where(function (Builder $query) use ($today, $time) {
                    $query->whereDate('start_date', '>', $today)
                        ->orWhere(function (Builder $query) use ($today, $time) {
                            $query->whereDate('start_date', $today)
                                ->where('start_time', '>', $time);
                        });
                }),
            'ongoing' => $query
                ->whereNull('archived_at')
                ->whereNotNull('end_date')
                ->where(function (Builder $query) use ($today, $time) {
                    $query->whereDate('start_date', '<', $today)
                        ->orWhere(function (Builder $query) use ($today, $time) {
                            $query->whereDate('start_date', $today)
                                ->where('start_time', '<=', $time);
                        });
                })
                ->where(function (Builder $query) use ($today, $time) {
                    $query->whereDate('end_date', '>', $today)
                        ->orWhere(function (Builder $query) use ($today, $time) {
                            $query->whereDate('end_date', $today)
                                ->where(function (Builder $query) use ($time) {
                                    $query->whereNull('end_time')
                                        ->orWhere('end_time', '>=', $time);
                                });
                        });
                }),
            'past' => $query->where(function (Builder $query) {
                $today = now()->toDateString();
                $time = now()->format('H:i:s');

                $query->whereNull('archived_at')
                    ->where(function (Builder $query) use ($today, $time) {
                        $query->where(function (Builder $query) use ($today, $time) {
                            $query->whereNotNull('end_date')
                                ->where(function (Builder $query) use ($today, $time) {
                                    $query->whereDate('end_date', '<', $today)
                                        ->orWhere(function (Builder $query) use ($today, $time) {
                                            $query->whereDate('end_date', $today)
                                                ->whereNotNull('end_time')
                                                ->where('end_time', '<', $time);
                                        });
                                });
                        })->orWhere(function (Builder $query) use ($today, $time) {
                            $query->whereNull('end_date')
                                ->where(function (Builder $query) use ($today, $time) {
                                    $query->whereDate('start_date', '<', $today)
                                        ->orWhere(function (Builder $query) use ($today, $time) {
                                            $query->whereDate('start_date', $today)
                                                ->where('start_time', '<', $time);
                                        });
                                });
                        });
                    });
            }),
            'archived' => $query->whereNotNull('archived_at'),
            default => $query->whereNull('archived_at'),
        };
    }

    public function computedStatus(): string
    {
        if ($this->archived_at) {
            return 'archived';
        }

        $start = Carbon::parse($this->start_date->toDateString().' '.($this->start_time ?? '00:00:00'));
        if (! $this->end_date) {
            return now()->lt($start) ? 'upcoming' : 'past';
        }

        $end = Carbon::parse($this->end_date->toDateString().' '.($this->end_time ?? '23:59:59'));

        return match (true) {
            now()->lt($start) => 'upcoming',
            now()->between($start, $end) => 'ongoing',
            default => 'past',
        };
    }
}
