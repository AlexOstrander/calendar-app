<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CalendarSyncController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// User Registration
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
    ]);
    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'password' => Hash::make($validated['password']),
    ]);
    return response()->json(['user' => $user], 201);
});

// Token Login
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

// Get Authenticated User
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Events (CRUD, protected)
Route::middleware('auth:sanctum')->apiResource('events', EventController::class);

// Calendar Sync Routes (add auth:sanctum if you want to protect them)
Route::prefix('calendar-sync')->group(function () {
    // Google Calendar routes
    Route::get('/google/auth-url', [CalendarSyncController::class, 'getGoogleAuthUrl']);
    Route::get('/google/callback', [CalendarSyncController::class, 'handleGoogleCallback']);
    Route::post('/google/sync', [CalendarSyncController::class, 'syncGoogleCalendar']);
    Route::delete('/google', [CalendarSyncController::class, 'disconnectGoogle']);

    // Apple Calendar routes
    Route::get('/apple/ical-url', [CalendarSyncController::class, 'getICalUrl']);
    Route::post('/apple/import', [CalendarSyncController::class, 'importICal']);

    // Status route
    Route::get('/status', [CalendarSyncController::class, 'getSyncStatus']);
});