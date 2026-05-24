<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'thumbnail',
        'primary_color',
        'secondary_color',
        'background_color',
        'mood',
        'preview_image',
        'is_active',
        'config',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
