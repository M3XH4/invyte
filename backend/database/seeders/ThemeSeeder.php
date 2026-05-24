<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = EventCategory::query()->pluck('id', 'slug');

        $themes = [
            ...$this->birthdayThemes($categoryIds['birthday'] ?? null, 'birthday'),
            ...$this->weddingThemes($categoryIds['wedding'] ?? null, 'wedding'),
            ...$this->partyThemes($categoryIds['party'] ?? null, 'party'),
            ...$this->corporateThemes($categoryIds['corporate'] ?? null, $categoryIds['meeting'] ?? null),
            ...$this->gamingThemes($categoryIds['gaming'] ?? null, 'gaming'),
            ...$this->concertThemes($categoryIds['concert'] ?? null, 'concert'),
            ...$this->funeralThemes($categoryIds['funeral'] ?? null, 'funeral'),
            ...$this->seminarThemes($categoryIds['seminar'] ?? null, 'seminar'),
        ];

        foreach ($themes as $theme) {
            Theme::updateOrCreate(['slug' => $theme['slug']], $theme);
        }
    }

    private function birthdayThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Cartoon Party', '#fff7ed', '#f97316', '#fb923c', 'playful'],
            ['Neon Birthday', '#0f172a', '#a855f7', '#ec4899', 'vibrant'],
            ['Superhero Birthday', '#1e1b4b', '#2563eb', '#fbbf24', 'heroic'],
            ['Princess Theme', '#fdf2f8', '#ec4899', '#f9a8d4', 'magical'],
            ['Space Adventure', '#020617', '#38bdf8', '#8b5cf6', 'cosmic'],
            ['Arcade Party', '#111827', '#22d3ee', '#f472b6', 'retro'],
            ['Candyland', '#fff1f2', '#fb7185', '#fbbf24', 'sweet'],
            ['Balloon Festival', '#eff6ff', '#3b82f6', '#f472b6', 'festive'],
        ]);
    }

    private function weddingThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Elegant Gold', '#fffbeb', '#ca8a04', '#f59e0b', 'elegant'],
            ['Garden Wedding', '#f0fdf4', '#16a34a', '#86efac', 'romantic'],
            ['Minimal White', '#ffffff', '#111827', '#9ca3af', 'minimal'],
            ['Sunset Wedding', '#fff7ed', '#ea580c', '#f472b6', 'warm'],
            ['Classic Romance', '#fdf2f8', '#be185d', '#f9a8d4', 'romantic'],
            ['Rustic Floral', '#faf5f0', '#92400e', '#d97706', 'rustic'],
        ]);
    }

    private function partyThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Neon Party', '#0b1120', '#a855f7', '#22d3ee', 'neon'],
            ['Tropical Party', '#ecfdf5', '#059669', '#fbbf24', 'tropical'],
            ['Club Night', '#020617', '#7c3aed', '#ec4899', 'nightlife'],
            ['Retro Disco', '#312e81', '#f59e0b', '#ec4899', 'retro'],
            ['Pool Party', '#e0f2fe', '#0284c7', '#f472b6', 'summer'],
        ]);
    }

    private function corporateThemes(?string $corporateId, ?string $meetingId): array
    {
        $id = $corporateId ?? $meetingId;
        $slug = $corporateId ? 'corporate' : 'meeting';

        return $this->build($id, $slug, [
            ['Corporate Blue', '#eff6ff', '#1d4ed8', '#38bdf8', 'professional'],
            ['Minimal Professional', '#f8fafc', '#0f172a', '#64748b', 'clean'],
            ['Executive Black', '#020617', '#111827', '#fbbf24', 'executive'],
            ['Modern Conference', '#f1f5f9', '#334155', '#06b6d4', 'modern'],
        ]);
    }

    private function gamingThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Neon Arena', '#050816', '#8b5cf6', '#22d3ee', 'competitive'],
            ['Pixel Quest', '#0c0a1d', '#a855f7', '#22d3ee', 'pixel'],
            ['Cyber Battle', '#020617', '#06b6d4', '#ec4899', 'cyber'],
            ['Arcade Night', '#111827', '#f59e0b', '#ef4444', 'arcade'],
        ]);
    }

    private function concertThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Festival Lights', '#1e1b4b', '#f59e0b', '#ec4899', 'festival'],
            ['Rock Stage', '#111827', '#ef4444', '#f97316', 'rock'],
            ['Acoustic Night', '#292524', '#d97706', '#fbbf24', 'acoustic'],
        ]);
    }

    private function funeralThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Peaceful Memorial', '#f8fafc', '#64748b', '#94a3b8', 'peaceful'],
            ['White Floral', '#ffffff', '#9ca3af', '#e5e7eb', 'serene'],
            ['Classic Tribute', '#f1f5f9', '#475569', '#cbd5e1', 'tribute'],
        ]);
    }

    private function seminarThemes(?string $categoryId, string $categorySlug): array
    {
        return $this->build($categoryId, $categorySlug, [
            ['Learning Hub', '#eff6ff', '#2563eb', '#60a5fa', 'educational'],
            ['Workshop Modern', '#f8fafc', '#0f766e', '#14b8a6', 'focused'],
            ['Speaker Spotlight', '#111827', '#6366f1', '#a855f7', 'bold'],
        ]);
    }

    /**
     * @param  list<array{0: string, 1: string, 2: string, 3: string, 4: string}>  $items
     * @return list<array<string, mixed>>
     */
    private function build(?string $categoryId, string $categorySlug, array $items): array
    {
        return collect($items)->map(function (array $item) use ($categoryId, $categorySlug) {
            [$name, $background, $primary, $secondary, $mood] = $item;
            $slug = Str::slug($name);
            $previewImage = "/themes/{$slug}.png";

            return [
                'name' => $name,
                'slug' => $slug,
                'category_id' => $categoryId,
                'thumbnail' => $previewImage,
                'preview_image' => $previewImage,
                'background_color' => $background,
                'primary_color' => $primary,
                'secondary_color' => $secondary,
                'mood' => $mood,
                'is_active' => true,
                'config' => [
                    'background' => $background,
                    'primary' => $primary,
                    'secondary' => $secondary,
                    'accent' => $secondary,
                    'colors' => [$background, $primary, $secondary],
                    'mood' => $mood,
                    'category' => $categorySlug,
                    'font' => 'Poppins',
                ],
            ];
        })->all();
    }
}
