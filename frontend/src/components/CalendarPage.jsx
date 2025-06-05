import React, { useState, useCallback, useEffect } from 'react';
import Calendar from './Calendar';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [syncStatus, setSyncStatus] = useState({
        google: { connected: false, last_sync: null },
        apple: { connected: false, last_sync: null }
    });
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncError, setSyncError] = useState("");

    const fetchUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            const response = await axios.get(`${API_BASE_URL}/api/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data && response.data.name) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    }, []);

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${API_BASE_URL}/api/events`);
            if (!response.data) {
                throw new Error('No data received from API');
            }
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
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSyncStatus = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/calendar-sync/status`);
            setSyncStatus(response.data);
        } catch (error) {
            // Optionally handle error
        }
    }, []);

    const handleGoogleSync = useCallback(async () => {
        try {
            setSyncLoading(true);
            setSyncError("");
            await axios.post(`${API_BASE_URL}/api/calendar-sync/google/sync`);
            await fetchSyncStatus();
            await fetchEvents();
        } catch (error) {
            setSyncError('Failed to sync with Google Calendar. Please try again.');
        } finally {
            setSyncLoading(false);
        }
    }, [fetchSyncStatus, fetchEvents]);

    useEffect(() => {
        fetchEvents();
        fetchSyncStatus();
        fetchUser();
        // Check for error in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        if (errorParam) {
            setSyncError(decodeURIComponent(errorParam));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        const params = new URLSearchParams(window.location.search);
        if (params.get('google') === 'success') {
            toast.success('Google Calendar connected!');
            handleGoogleSync();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [fetchEvents, fetchSyncStatus, fetchUser, handleGoogleSync]);

    // Debug log for user state
    useEffect(() => {
        console.log('Current user state:', user);
        console.log('User name:', user?.name);
    }, [user]);

    const handleGoogleConnect = async () => {
        try {
            setSyncLoading(true);
            setSyncError("");
            const response = await axios.get(`${API_BASE_URL}/api/calendar-sync/google/auth-url`);
            window.location.href = response.data.url;
        } catch (error) {
            setSyncError('Failed to connect to Google Calendar. Please try again.');
        } finally {
            setSyncLoading(false);
        }
    };

    const handleGoogleLogout = async () => {
        try {
            setSyncLoading(true);
            setSyncError("");
            // Remove Google sync connection (delete CalendarSync row)
            await axios.delete(`${API_BASE_URL}/api/calendar-sync/google`);
            await fetchSyncStatus();
            await fetchEvents();
        } catch (error) {
            setSyncError('Failed to disconnect Google Calendar.');
        } finally {
            setSyncLoading(false);
        }
    };

    const handleAppleExport = async () => {
        try {
            setSyncLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/calendar-sync/apple/ical-url`);
            const blob = new Blob([response.data.ical_content], { type: 'text/calendar' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'calendar.ics';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            setSyncError('Failed to export to Apple Calendar.');
        } finally {
            setSyncLoading(false);
        }
    };

    return (
        <div>
            <Calendar
                events={events}
                loading={loading}
                error={error}
                refreshEvents={fetchEvents}
                syncStatus={syncStatus}
                syncLoading={syncLoading}
                syncError={syncError}
                onGoogleConnect={handleGoogleConnect}
                onGoogleSync={handleGoogleSync}
                onGoogleLogout={handleGoogleLogout}
                onAppleExport={handleAppleExport}
                userName={user?.name}
            />
            <ToastContainer />
        </div>
    );
};

export default CalendarPage; 