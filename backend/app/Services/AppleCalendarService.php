<?php

namespace App\Services;

use App\Models\CalendarSync;
use App\Models\Event;
use Carbon\Carbon;
use ICal\ICal;

class AppleCalendarService
{
    public function generateICalUrl(CalendarSync $sync)
    {
        $events = Event::where('start_time', '>=', Carbon::now()->subDays(30))
            ->where('end_time', '<=', Carbon::now()->addDays(90))
            ->get();

        $ical = "BEGIN:VCALENDAR\r\n";
        $ical .= "VERSION:2.0\r\n";
        $ical .= "PRODID:-//Calendar App//EN\r\n";
        $ical .= "CALSCALE:GREGORIAN\r\n";

        foreach ($events as $event) {
            $ical .= "BEGIN:VEVENT\r\n";
            $ical .= "UID:" . $event->id . "\r\n";
            $ical .= "DTSTAMP:" . $event->created_at->format('Ymd\THis\Z') . "\r\n";
            $ical .= "DTSTART:" . $event->start_time->format('Ymd\THis\Z') . "\r\n";
            $ical .= "DTEND:" . $event->end_time->format('Ymd\THis\Z') . "\r\n";
            $ical .= "SUMMARY:" . $this->escapeString($event->title) . "\r\n";
            
            if ($event->description) {
                $ical .= "DESCRIPTION:" . $this->escapeString($event->description) . "\r\n";
            }
            
            $ical .= "END:VEVENT\r\n";
        }

        $ical .= "END:VCALENDAR";

        return $ical;
    }

    public function importICal($icalContent)
    {
        $ical = new ICal();
        $ical->initString($icalContent);

        foreach ($ical->events() as $icalEvent) {
            Event::updateOrCreate(
                ['ical_event_id' => $icalEvent->uid],
                [
                    'title' => $icalEvent->summary,
                    'description' => $icalEvent->description,
                    'start_time' => Carbon::parse($icalEvent->dtstart),
                    'end_time' => Carbon::parse($icalEvent->dtend),
                    'all_day' => strpos($icalEvent->dtstart, 'T') === false,
                ]
            );
        }
    }

    protected function escapeString($string)
    {
        $string = str_replace(["\r\n", "\n", "\r"], "\\n", $string);
        $string = str_replace(",", "\,", $string);
        $string = str_replace(";", "\;", $string);
        return $string;
    }
} 