<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'guest' => new EventGuestResource($this->resource->loadMissing(['answers.question', 'event'])),
        ];
    }
}
