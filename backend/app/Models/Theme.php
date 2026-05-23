<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Theme extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = ['name', 'slug', 'thumbnail', 'config'];

    protected function casts(): array
    {
        return [
            'config' => 'array',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
