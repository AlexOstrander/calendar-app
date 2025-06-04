<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalendarSyncController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::apiResource('events', EventController::class);

// Calendar Sync Routes
Route::prefix('calendar-sync')->group(function () {
    Route::get('google/auth-url', [CalendarSyncController::class, 'getGoogleAuthUrl']);
    Route::get('google/callback', [CalendarSyncController::class, 'handleGoogleCallback']);
    Route::get('apple/ical-url', [CalendarSyncController::class, 'getICalUrl']);
    Route::post('apple/import', [CalendarSyncController::class, 'importICal']);
    Route::post('google/sync', [CalendarSyncController::class, 'syncGoogleCalendar']);
    Route::get('status', [CalendarSyncController::class, 'getSyncStatus']);
}); 