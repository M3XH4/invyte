<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'name' => 'Classic Ivory',
                'slug' => 'classic-ivory',
                'thumbnail' => '/themes/classic-ivory.png',
                'config' => ['background' => '#fff7ed', 'primary' => '#9a3412', 'accent' => '#f59e0b', 'font' => 'Poppins'],
            ],
            [
                'name' => 'Modern Slate',
                'slug' => 'modern-slate',
                'thumbnail' => '/themes/modern-slate.png',
                'config' => ['background' => '#f8fafc', 'primary' => '#0f172a', 'accent' => '#14b8a6', 'font' => 'Poppins'],
            ],
            [
                'name' => 'Garden Fresh',
                'slug' => 'garden-fresh',
                'thumbnail' => '/themes/garden-fresh.png',
                'config' => ['background' => '#f0fdf4', 'primary' => '#166534', 'accent' => '#84cc16', 'font' => 'Poppins'],
            ],
            [
                'name' => 'Celebration Pop',
                'slug' => 'celebration-pop',
                'thumbnail' => '/themes/celebration-pop.png',
                'config' => ['background' => '#fdf2f8', 'primary' => '#be185d', 'accent' => '#7c3aed', 'font' => 'Poppins'],
            ],
        ];

        foreach ($themes as $theme) {
            Theme::updateOrCreate(['slug' => $theme['slug']], $theme);
        }
    }
}
