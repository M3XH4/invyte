<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Birthday', 'slug' => 'birthday', 'icon' => 'cake', 'color' => '#f97316'],
            ['name' => 'Wedding', 'slug' => 'wedding', 'icon' => 'heart', 'color' => '#ec4899'],
            ['name' => 'Seminar', 'slug' => 'seminar', 'icon' => 'presentation', 'color' => '#2563eb'],
            ['name' => 'Party', 'slug' => 'party', 'icon' => 'party-popper', 'color' => '#8b5cf6'],
            ['name' => 'Funeral', 'slug' => 'funeral', 'icon' => 'flower', 'color' => '#475569'],
            ['name' => 'Reunion', 'slug' => 'reunion', 'icon' => 'users', 'color' => '#16a34a'],
            ['name' => 'Corporate', 'slug' => 'corporate', 'icon' => 'briefcase', 'color' => '#0f766e'],
            ['name' => 'Meeting', 'slug' => 'meeting', 'icon' => 'calendar-days', 'color' => '#64748b'],
        ];

        foreach ($categories as $category) {
            EventCategory::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
