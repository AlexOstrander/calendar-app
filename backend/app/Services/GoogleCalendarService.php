<?php

namespace App\Services;

use App\Models\CalendarSync;
use App\Models\Event;
use Google_Client;
use Google_Service_Calendar;
use Carbon\Carbon;

class GoogleCalendarService
{
    protected $client;
    protected $service;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setAuthConfig(storage_path('app/google-credentials.json'));
        $this->client->addScope(Google_Service_Calendar::CALENDAR);
        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
        $this->client->setRedirectUri(config('services.google.redirect'));
    }

    public function getAuthUrl()
    {
        \Log::info('GOOGLE_REDIRECT_URI: ' . config('services.google.redirect'));
        $this->client->setRedirectUri(config('services.google.redirect'));
        return $this->client->createAuthUrl();
    }

    public function handleCallback($code)
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \Exception('Google OAuth error: ' . $token['error']);
        }

        if (!isset($token['access_token'])) {
            throw new \Exception('No access token returned from Google.');
        }

        return CalendarSync::create([
            'provider' => 'google',
            'access_token' => $token['access_token'],
            'refresh_token' => $token['refresh_token'] ?? null,
            'token_type' => $token['token_type'],
            'expires_at' => Carbon::now()->addSeconds($token['expires_in']),
            'calendar_id' => 'primary',
            'user_id' => \Auth::id(),
        ]);
    }

    public function syncEvents(CalendarSync $sync)
    {
        if ($sync->needsRefresh()) {
            $this->refreshToken($sync);
        }

        $this->client->setAccessToken($sync->access_token);
        $this->service = new Google_Service_Calendar($this->client);

        // Fetch events from Google Calendar
        $googleEvents = $this->service->events->listEvents($sync->calendar_id, [
            'timeMin' => Carbon::now()->subDays(30)->toRfc3339String(),
            'timeMax' => Carbon::now()->addDays(90)->toRfc3339String(),
        ]);

        $googleEventIds = [];
        foreach ($googleEvents->getItems() as $googleEvent) {
            $googleEventIds[] = $googleEvent->getId();
            Event::updateOrCreate(
                ['google_event_id' => $googleEvent->getId()],
                [
                    'title' => $googleEvent->getSummary(),
                    'description' => $googleEvent->getDescription(),
                    'start_time' => Carbon::parse($googleEvent->getStart()->getDateTime()),
                    'end_time' => Carbon::parse($googleEvent->getEnd()->getDateTime()),
                    'all_day' => $googleEvent->getStart()->getDateTime() === null,
                    'user_id' => $sync->user_id,
                ]
            );
        }

        // Delete local events that have a google_event_id but are no longer in Google
        Event::where('user_id', $sync->user_id)
            ->whereNotNull('google_event_id')
            ->whereNotIn('google_event_id', $googleEventIds)
            ->delete();

        // Sync local events to Google Calendar (local-only events)
        $localEvents = Event::whereNull('google_event_id')
            ->where('user_id', $sync->user_id)
            ->where('start_time', '>=', Carbon::now()->subDays(30))
            ->where('end_time', '<=', Carbon::now()->addDays(90))
            ->get();

        foreach ($localEvents as $localEvent) {
            $googleEvent = new \Google_Service_Calendar_Event([
                'summary' => $localEvent->title,
                'description' => $localEvent->description,
                'start' => ['dateTime' => $localEvent->start_time->toRfc3339String()],
                'end' => ['dateTime' => $localEvent->end_time->toRfc3339String()],
            ]);

            $createdEvent = $this->service->events->insert($sync->calendar_id, $googleEvent);
            $localEvent->update(['google_event_id' => $createdEvent->getId()]);
        }
    }

    protected function refreshToken(CalendarSync $sync)
    {
        $this->client->setAccessToken($sync->access_token);
        
        if ($this->client->isAccessTokenExpired()) {
            $this->client->fetchAccessTokenWithRefreshToken($sync->refresh_token);
            
            $sync->update([
                'access_token' => $this->client->getAccessToken()['access_token'],
                'expires_at' => Carbon::now()->addSeconds($this->client->getAccessToken()['expires_in']),
            ]);
        }
    }
} 