<?php

namespace App\Http\Controllers;

use App\Models\CalendarSync;
use App\Services\GoogleCalendarService;
use App\Services\AppleCalendarService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CalendarSyncController extends Controller
{
    protected $googleService;
    protected $appleService;

    public function __construct(
        GoogleCalendarService $googleService,
        AppleCalendarService $appleService
    ) {
        $this->googleService = $googleService;
        $this->appleService = $appleService;
    }

    public function getGoogleAuthUrl(): JsonResponse
    {
        return response()->json([
            'url' => $this->googleService->getAuthUrl()
        ]);
    }

    public function handleGoogleCallback(Request $request): JsonResponse
    {
        $sync = $this->googleService->handleCallback($request->code);
        return response()->json($sync);
    }

    public function getICalUrl(): JsonResponse
    {
        $sync = CalendarSync::where('provider', 'apple')->first();
        $icalContent = $this->appleService->generateICalUrl($sync);
        
        return response()->json([
            'ical_content' => $icalContent
        ]);
    }

    public function importICal(Request $request): JsonResponse
    {
        $this->appleService->importICal($request->ical_content);
        return response()->json(['message' => 'Calendar imported successfully']);
    }

    public function syncGoogleCalendar(): JsonResponse
    {
        $sync = CalendarSync::where('provider', 'google')->first();
        $this->googleService->syncEvents($sync);
        return response()->json(['message' => 'Calendar synced successfully']);
    }

    public function getSyncStatus(): JsonResponse
    {
        $googleSync = CalendarSync::where('provider', 'google')->first();
        $appleSync = CalendarSync::where('provider', 'apple')->first();

        return response()->json([
            'google' => [
                'connected' => (bool) $googleSync,
                'last_sync' => $googleSync ? $googleSync->updated_at : null,
            ],
            'apple' => [
                'connected' => (bool) $appleSync,
                'last_sync' => $appleSync ? $appleSync->updated_at : null,
            ]
        ]);
    }
} 