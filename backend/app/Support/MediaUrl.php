<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaUrl
{
    public static function publicUrl(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            if (Str::contains($value, '/storage/')) {
                return Storage::disk('public')->url(Str::after($value, '/storage/'));
            }

            return $value;
        }

        $path = Str::startsWith($value, '/storage/')
            ? Str::after($value, '/storage/')
            : Str::after($value, 'storage/');

        return Storage::disk('public')->url(ltrim($path, '/'));
    }
}
