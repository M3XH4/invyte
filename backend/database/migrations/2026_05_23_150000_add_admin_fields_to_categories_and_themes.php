<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_categories', function (Blueprint $table) {
            $table->string('image')->nullable()->after('icon');
            $table->text('description')->nullable()->after('color');
            $table->boolean('is_active')->default(true)->after('description');
        });

        Schema::table('themes', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->after('slug')->constrained('event_categories')->nullOnDelete();
            $table->string('primary_color')->nullable()->after('thumbnail');
            $table->string('secondary_color')->nullable()->after('primary_color');
            $table->string('background_color')->nullable()->after('secondary_color');
            $table->string('mood')->nullable()->after('background_color');
            $table->string('preview_image')->nullable()->after('mood');
            $table->boolean('is_active')->default(true)->after('preview_image');
        });
    }

    public function down(): void
    {
        Schema::table('themes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn([
                'primary_color',
                'secondary_color',
                'background_color',
                'mood',
                'preview_image',
                'is_active',
            ]);
        });

        Schema::table('event_categories', function (Blueprint $table) {
            $table->dropColumn(['image', 'description', 'is_active']);
        });
    }
};
