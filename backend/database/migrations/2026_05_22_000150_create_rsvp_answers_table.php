<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rsvp_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('question_id')->constrained('rsvp_questions')->cascadeOnDelete();
            $table->foreignUuid('guest_id')->constrained('event_guests')->cascadeOnDelete();
            $table->json('answer');
            $table->timestamps();

            $table->unique(['question_id', 'guest_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rsvp_answers');
    }
};
