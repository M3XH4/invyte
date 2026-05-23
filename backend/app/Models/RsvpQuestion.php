<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RsvpQuestion extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = ['event_id', 'question', 'question_type', 'required', 'options', 'sort_order'];

    protected function casts(): array
    {
        return [
            'required' => 'boolean',
            'options' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(RsvpAnswer::class, 'question_id');
    }
}
