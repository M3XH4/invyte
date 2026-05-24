<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            EventCategorySeeder::class,
            ThemeSeeder::class,
        ]);

        User::query()->updateOrCreate(
            ['email' => 'admin@invyte.app'],
            [
                'name' => 'Admin User',
                'username' => 'invyte_admin',
                'role' => 'admin',
                'password' => User::factory()->make()->password,
                'email_verified_at' => now(),
            ]
        );
    }
}
