import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Calendar component mounted');
        console.log('API_BASE_URL:', API_BASE_URL);
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching events from:', `${API_BASE_URL}/api/events`);
            const response = await axios.get(`${API_BASE_URL}/api/events`);
            console.log('Raw API response:', response);
            
            if (!response.data) {
                throw new Error('No data received from API');
            }

            const formattedEvents = response.data.map(event => {
                console.log('Processing event:', event);
                return {
                    id: event.id,
                    title: event.title,
                    start: event.start_time,
                    end: event.end_time,
                    description: event.description,
                    color: event.color,
                    allDay: event.all_day
                };
            });
            
            console.log('Formatted events:', formattedEvents);
            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching events:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(error.message);
        } finally {
            setLoading(false);
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

    if (loading) {
        return <div>Loading calendar...</div>;
    }

    if (error) {
        return <div>Error loading calendar: {error}</div>;
    }

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