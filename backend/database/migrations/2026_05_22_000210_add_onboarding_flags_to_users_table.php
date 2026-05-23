<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('has_seen_getting_started')->default(false)->after('is_guest');
            $table->boolean('has_seen_onboarding')->default(false)->after('has_seen_getting_started');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['has_seen_getting_started', 'has_seen_onboarding']);
        });
    }
};
