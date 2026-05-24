<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ThemeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'thumbnail' => $this->thumbnail,
            'category_id' => $this->category_id,
            'category_slug' => $this->category?->slug,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'config' => $this->config ?? [],
        ];
    }
}
