<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => response()->json(['status' => 'ok']));

// OAuth — deben ser rutas web (usan redirecciones del navegador)
Route::get('/auth/{provider}/redirect', [AuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'callback']);
