<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $events = Event::where('user_id', Auth::id())->get()->map(function ($event) {
            $eventArray = $event->toArray();
            if ($event->all_day) {
                $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d');
                $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d');
            } else {
                $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d\TH:i:s');
                $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d\TH:i:s');
            }
            return $eventArray;
        });
        return response()->json($events);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'color' => 'nullable|string|max:7',
            'all_day' => 'boolean'
        ]);
        $validated['user_id'] = Auth::id();
        $event = Event::create($validated);
        $eventArray = $event->toArray();
        if ($event->all_day) {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d');
        } else {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d\TH:i:s');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d\TH:i:s');
        }
        return response()->json($eventArray, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): JsonResponse
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }
        $eventArray = $event->toArray();
        if ($event->all_day) {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d');
        } else {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d\TH:i:s');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d\TH:i:s');
        }
        return response()->json($eventArray);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'color' => 'nullable|string|max:7',
            'all_day' => 'boolean'
        ]);
        $event->update($validated);
        $eventArray = $event->toArray();
        if ($event->all_day) {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d');
        } else {
            $eventArray['start_time'] = \Carbon\Carbon::parse($event->start_time)->format('Y-m-d\TH:i:s');
            $eventArray['end_time'] = \Carbon\Carbon::parse($event->end_time)->format('Y-m-d\TH:i:s');
        }
        return response()->json($eventArray);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): JsonResponse
    {
        if ($event->user_id !== Auth::id()) {
            abort(403);
        }
        $event->delete();
        return response()->json(null, 204);
    }
}