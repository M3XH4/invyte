<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RsvpAnswer extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = ['question_id', 'guest_id', 'answer'];

    protected function casts(): array
    {
        return [
            'answer' => 'array',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(RsvpQuestion::class, 'question_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(EventGuest::class, 'guest_id');
    }
}
