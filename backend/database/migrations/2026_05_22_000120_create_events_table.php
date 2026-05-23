<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('event_categories')->nullOnDelete();
            $table->foreignUuid('theme_id')->nullable()->constrained('themes')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->date('start_date');
            $table->time('start_time')->nullable();
            $table->date('end_date')->nullable();
            $table->time('end_time')->nullable();
            $table->string('venue_name')->nullable();
            $table->text('venue_address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('privacy')->default('private');
            $table->string('status')->default('draft');
            $table->string('dress_code')->nullable();
            $table->string('food_option')->nullable();
            $table->unsignedInteger('max_guests')->nullable();
            $table->boolean('rsvp_enabled')->default(true);
            $table->boolean('allow_plus_ones')->default(false);
            $table->boolean('allow_guest_invites')->default(false);
            $table->boolean('show_guest_list')->default(false);
            $table->timestamp('rsvp_deadline')->nullable();
            $table->string('slug')->unique();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'start_date']);
            $table->index(['category_id', 'start_date']);
            $table->index(['status', 'archived_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
