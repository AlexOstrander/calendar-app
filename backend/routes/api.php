<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalendarSyncController;
use Illuminate\Support\Facades\Auth;

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

// Protect all event routes with auth:sanctum
Route::middleware('auth:sanctum')->apiResource('events', EventController::class);

// Token login route for API authentication
Route::post('/token-login', function (Request $request) {
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);
    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }
    $user = Auth::user();
    $token = $user->createToken('api-token')->plainTextToken;
    return response()->json(['token' => $token, 'user' => $user]);
});

// Calendar Sync Routes (protect as needed)
Route::prefix('calendar-sync')->group(function () {
    Route::get('google/auth-url', [CalendarSyncController::class, 'getGoogleAuthUrl']);
    Route::get('google/callback', [CalendarSyncController::class, 'handleGoogleCallback']);
    Route::get('apple/ical-url', [CalendarSyncController::class, 'getICalUrl']);
    Route::post('apple/import', [CalendarSyncController::class, 'importICal']);
    Route::post('google/sync', [CalendarSyncController::class, 'syncGoogleCalendar']);
    Route::get('status', [CalendarSyncController::class, 'getSyncStatus']);
}); 