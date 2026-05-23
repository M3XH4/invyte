<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('activity_logs', 'type')) {
                $table->string('type')->nullable()->after('event_id');
            }

            if (! Schema::hasColumn('activity_logs', 'description')) {
                $table->text('description')->nullable()->after('action');
            }
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            if (Schema::hasColumn('activity_logs', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('activity_logs', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
