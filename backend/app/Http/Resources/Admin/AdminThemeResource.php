<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminThemeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $config = $this->config ?? [];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category_id' => $this->category_id,
            'categoryId' => $this->category_id,
            'category' => $this->category?->name ?? ($config['category'] ?? 'General'),
            'colors' => $this->colors($config),
            'previewColors' => $this->colors($config),
            'primary_color' => $this->primary_color ?? ($config['primary'] ?? null),
            'primaryColor' => $this->primary_color ?? ($config['primary'] ?? null),
            'secondary_color' => $this->secondary_color ?? ($config['accent'] ?? null),
            'secondaryColor' => $this->secondary_color ?? ($config['accent'] ?? null),
            'background_color' => $this->background_color ?? ($config['background'] ?? null),
            'backgroundColor' => $this->background_color ?? ($config['background'] ?? null),
            'mood' => $this->mood ?? ($config['mood'] ?? null),
            'preview_image' => $this->preview_image ?? $this->thumbnail,
            'previewImage' => $this->preview_image ?? $this->thumbnail,
            'config' => $config,
            'is_active' => (bool) $this->is_active,
            'isActive' => (bool) $this->is_active,
            'status' => $this->is_active ? 'active' : 'disabled',
            'usage_count' => (int) ($this->events_count ?? 0),
            'usageCount' => (int) ($this->events_count ?? 0),
        ];
    }

    /**
     * @param  array<string, mixed>  $config
     * @return list<string>
     */
    private function colors(array $config): array
    {
        if (! empty($config['colors']) && is_array($config['colors'])) {
            return array_values($config['colors']);
        }

        if (! empty($config['preview_colors']) && is_array($config['preview_colors'])) {
            return array_values($config['preview_colors']);
        }

        $colors = array_filter([
            $this->background_color ?? ($config['background'] ?? null),
            $this->primary_color ?? ($config['primary'] ?? null),
            $this->secondary_color ?? ($config['accent'] ?? null),
        ]);

        return $colors !== [] ? array_values($colors) : ['#faf5ff', '#9333ea', '#ec4899'];
    }
}
