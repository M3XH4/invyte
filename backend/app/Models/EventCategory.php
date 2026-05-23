<?php

namespace App\Models;

use App\Models\Concerns\HasUuidPrimaryKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventCategory extends Model
{
    use HasUuidPrimaryKey;

    protected $fillable = ['name', 'slug', 'icon', 'color'];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id');
    }
}
