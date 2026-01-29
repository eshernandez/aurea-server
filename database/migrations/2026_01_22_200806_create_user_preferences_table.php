<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('timezone')->default('America/Bogota'); // Colombia por defecto
            $table->boolean('notifications_enabled')->default(true);
            $table->integer('notifications_per_day')->default(3);
            $table->json('preferred_hours')->nullable(); // Array de horas: [8, 12, 18]
            $table->json('preferred_categories')->nullable(); // Array de category_ids: [1, 2, 3]
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_preferences');
    }
};
