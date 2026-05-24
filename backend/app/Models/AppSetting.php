<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class AppSetting extends Model
{
    protected $fillable = ['settings'];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }

    public static function defaults(): array
    {
        return [
            'app_name' => config('app.name', 'Invyte'),
            'public_frontend_url' => config('app.frontend_url', config('app.url')),
            'email_notifications' => true,
            'push_notifications' => true,
            'rsvp_deadline_days' => 3,
            'max_upload_mb' => 10,
            'admin_name' => 'Admin User',
            'admin_email' => 'admin@invyte.app',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'settings' => static::defaults(),
        ]);
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = static::current()->settings ?? [];

        return Arr::get($settings, $key, $default);
    }

    public static function merge(array $values): self
    {
        $record = static::current();
        $record->update([
            'settings' => array_merge($record->settings ?? static::defaults(), $values),
        ]);

        return $record->refresh();
    }
}
