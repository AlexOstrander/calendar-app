import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Calendar = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/events`);
            const formattedEvents = response.data.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start_time,
                end: event.end_time,
                description: event.description,
                color: event.color,
                allDay: event.all_day
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleEventAdd = async (info) => {
        try {
            const newEvent = {
                title: info.event.title,
                start_time: info.event.start,
                end_time: info.event.end,
                all_day: info.event.allDay,
                color: info.event.backgroundColor
            };

            await axios.post(`${API_BASE_URL}/api/events`, newEvent);
            fetchEvents();
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    const handleEventUpdate = async (info) => {
        try {
            const updatedEvent = {
                title: info.event.title,
                start_time: info.event.start,
                end_time: info.event.end,
                all_day: info.event.allDay,
                color: info.event.backgroundColor
            };

            await axios.put(`${API_BASE_URL}/api/events/${info.event.id}`, updatedEvent);
            fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleEventDelete = async (info) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/events/${info.event.id}`);
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    return (
        <div className="calendar-container" style={{ height: '800px', padding: '20px' }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleEventAdd}
                eventClick={handleEventDelete}
                eventDrop={handleEventUpdate}
                eventResize={handleEventUpdate}
            />
        </div>
    );
};

export default Calendar; 