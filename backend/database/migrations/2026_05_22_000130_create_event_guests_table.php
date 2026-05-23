<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_guests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('name');
            $table->string('role')->default('guest');
            $table->string('invite_status')->default('pending');
            $table->string('response_status')->default('pending');
            $table->unsignedInteger('plus_ones')->default(0);
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'email']);
            $table->index(['event_id', 'response_status']);
            $table->index(['event_id', 'invite_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_guests');
    }
};
