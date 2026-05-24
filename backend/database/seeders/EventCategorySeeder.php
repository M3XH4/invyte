<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Birthday',
                'slug' => 'birthday',
                'icon' => 'cake',
                'image' => '/assets/categories/transparent-birthday-icon.png',
                'color' => '#f97316',
                'description' => 'Birthday parties and celebrations',
            ],
            [
                'name' => 'Wedding',
                'slug' => 'wedding',
                'icon' => 'heart',
                'image' => '/assets/categories/transparent-wedding-icon.png',
                'color' => '#ec4899',
                'description' => 'Weddings and engagement events',
            ],
            [
                'name' => 'Seminar',
                'slug' => 'seminar',
                'icon' => 'presentation',
                'image' => '/assets/categories/transparent-seminar-icon.png',
                'color' => '#2563eb',
                'description' => 'Seminars, workshops, and talks',
            ],
            [
                'name' => 'Party',
                'slug' => 'party',
                'icon' => 'party-popper',
                'image' => '/assets/categories/transparent-party-icon.png',
                'color' => '#8b5cf6',
                'description' => 'Parties and social gatherings',
            ],
            [
                'name' => 'Funeral',
                'slug' => 'funeral',
                'icon' => 'flower',
                'image' => '/assets/categories/transparent-funeral-icon.png',
                'color' => '#475569',
                'description' => 'Memorials and funeral services',
            ],
            [
                'name' => 'Reunion',
                'slug' => 'reunion',
                'icon' => 'users',
                'image' => '/assets/categories/transparent-reunion-icon.png',
                'color' => '#16a34a',
                'description' => 'Family and class reunions',
            ],
            [
                'name' => 'Corporate',
                'slug' => 'corporate',
                'icon' => 'briefcase',
                'image' => '/assets/categories/transparent-meeting-icon.png',
                'color' => '#0f766e',
                'description' => 'Corporate events and galas',
            ],
            [
                'name' => 'Meeting',
                'slug' => 'meeting',
                'icon' => 'calendar-days',
                'image' => '/assets/categories/transparent-meeting-icon.png',
                'color' => '#64748b',
                'description' => 'Meetings and briefings',
            ],
            [
                'name' => 'Gaming',
                'slug' => 'gaming',
                'icon' => 'gamepad-2',
                'image' => '/assets/categories/transparent-party-icon.png',
                'color' => '#a78bfa',
                'description' => 'Gaming nights and tournaments',
            ],
            [
                'name' => 'Concert',
                'slug' => 'concert',
                'icon' => 'music',
                'image' => '/assets/categories/transparent-party-icon.png',
                'color' => '#f472b6',
                'description' => 'Concerts and live performances',
            ],
        ];

        foreach ($categories as $category) {
            EventCategory::updateOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }
    }
}
