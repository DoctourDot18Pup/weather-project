<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\AuthController;

// ── Clima (públicas) ───────────────────────────────────────────────────────
Route::get('/weather/by-coords', [WeatherController::class, 'getWeatherByCoords']);
Route::get('/weather/{city}',    [WeatherController::class, 'getWeather']);
Route::get('/geocode',           [WeatherController::class, 'geocode']);

// ── Historial y estadísticas (opcionales con auth) ─────────────────────────
Route::get('/weather-stats',            [WeatherController::class, 'getStats']);
Route::get('/weather-history',          [WeatherController::class, 'getHistory']);
Route::get('/weather-history/{id}',     [WeatherController::class, 'getHistoryById']);
Route::delete('/weather-history/{id}',  [WeatherController::class, 'deleteHistory']);
Route::delete('/weather-history',       [WeatherController::class, 'clearHistory']);

// ── Auth (protegidas con Sanctum) ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me',        [AuthController::class, 'me']);
    Route::post('/auth/logout',   [AuthController::class, 'logout']);
});
