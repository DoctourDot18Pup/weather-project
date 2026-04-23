<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_searches', function (Blueprint $table) {
            $table->id();
            $table->string('city');
            $table->decimal('temperature', 5, 2);
            $table->string('weather_main');
            $table->text('weather_description');
            $table->integer('humidity');
            $table->decimal('wind_speed', 5, 2);
            $table->string('icon');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_searches');
    }
};