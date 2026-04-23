<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeatherSearch extends Model
{
    protected $fillable = [
        'city', 'country', 'lat', 'lon', 'timezone_offset',
        'temperature', 'feels_like', 'temp_min', 'temp_max',
        'weather_main', 'weather_description', 'icon',
        'humidity', 'pressure', 'visibility',
        'wind_speed', 'wind_deg', 'clouds',
        'sunrise', 'sunset',
        'aqi', 'aqi_components', 'hourly', 'daily',
    ];

    protected $casts = [
        'temperature'     => 'decimal:2',
        'feels_like'      => 'decimal:2',
        'temp_min'        => 'decimal:2',
        'temp_max'        => 'decimal:2',
        'wind_speed'      => 'decimal:2',
        'lat'             => 'decimal:6',
        'lon'             => 'decimal:6',
        'humidity'        => 'integer',
        'pressure'        => 'integer',
        'visibility'      => 'integer',
        'wind_deg'        => 'integer',
        'clouds'          => 'integer',
        'sunrise'         => 'integer',
        'sunset'          => 'integer',
        'timezone_offset' => 'integer',
        'aqi'             => 'integer',
        'aqi_components'  => 'array',
        'hourly'          => 'array',
        'daily'           => 'array',
    ];
}
