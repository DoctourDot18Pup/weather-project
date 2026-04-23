<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weather_searches', function (Blueprint $table) {
            $table->string('country', 10)->nullable()->after('city');
            $table->decimal('lat', 10, 6)->nullable()->after('country');
            $table->decimal('lon', 10, 6)->nullable()->after('lat');
            $table->integer('timezone_offset')->nullable()->after('lon');
            $table->decimal('feels_like', 5, 2)->nullable()->after('temperature');
            $table->decimal('temp_min', 5, 2)->nullable()->after('feels_like');
            $table->decimal('temp_max', 5, 2)->nullable()->after('temp_min');
            $table->integer('pressure')->nullable()->after('humidity');
            $table->integer('visibility')->nullable()->after('pressure');
            $table->integer('wind_deg')->nullable()->after('wind_speed');
            $table->integer('clouds')->nullable()->after('wind_deg');
            $table->integer('sunrise')->nullable()->after('clouds');
            $table->integer('sunset')->nullable()->after('sunrise');
            $table->tinyInteger('aqi')->nullable()->after('sunset');
            $table->json('aqi_components')->nullable()->after('aqi');
            $table->json('hourly')->nullable()->after('aqi_components');
            $table->json('daily')->nullable()->after('hourly');
        });
    }

    public function down(): void
    {
        Schema::table('weather_searches', function (Blueprint $table) {
            $table->dropColumn([
                'country', 'lat', 'lon', 'timezone_offset',
                'feels_like', 'temp_min', 'temp_max',
                'pressure', 'visibility', 'wind_deg', 'clouds',
                'sunrise', 'sunset',
                'aqi', 'aqi_components', 'hourly', 'daily',
            ]);
        });
    }
};
