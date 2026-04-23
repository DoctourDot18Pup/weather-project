<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WeatherController;

Route::get('/weather/by-coords', [WeatherController::class, 'getWeatherByCoords']);
Route::get('/weather/{city}',    [WeatherController::class, 'getWeather']);

Route::get('/geocode',           [WeatherController::class, 'geocode']);
Route::get('/weather-stats',     [WeatherController::class, 'getStats']);

Route::get('/weather-history',          [WeatherController::class, 'getHistory']);
Route::get('/weather-history/{id}',     [WeatherController::class, 'getHistoryById']);
Route::delete('/weather-history/{id}',  [WeatherController::class, 'deleteHistory']);
Route::delete('/weather-history',       [WeatherController::class, 'clearHistory']);
