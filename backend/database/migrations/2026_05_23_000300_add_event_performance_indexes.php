<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->index('user_id', 'events_user_id_idx');
            $table->index('start_date', 'events_start_date_idx');
            $table->index('status', 'events_status_idx');
            $table->index('category_id', 'events_category_id_idx');
        });

        Schema::table('event_guests', function (Blueprint $table) {
            $table->index('event_id', 'event_guests_event_id_idx');
            $table->index('response_status', 'event_guests_response_status_idx');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id', 'notifications_user_id_idx');
            $table->index('is_read', 'notifications_is_read_idx');
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_is_read_idx');
            $table->dropIndex('notifications_user_id_idx');
        });

        Schema::table('event_guests', function (Blueprint $table) {
            $table->dropIndex('event_guests_response_status_idx');
            $table->dropIndex('event_guests_event_id_idx');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_category_id_idx');
            $table->dropIndex('events_status_idx');
            $table->dropIndex('events_start_date_idx');
            $table->dropIndex('events_user_id_idx');
        });
    }
};