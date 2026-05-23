<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QrCode extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = ['event_id', 'code', 'url', 'payload', 'scan_count'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'scan_count' => 'integer',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
