import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CalendarSync = () => {
    const [syncStatus, setSyncStatus] = useState({
        google: { connected: false, last_sync: null },
        apple: { connected: false, last_sync: null }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSyncStatus();
    }, []);

    const fetchSyncStatus = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/calendar-sync/status');
            setSyncStatus(response.data);
        } catch (error) {
            console.error('Error fetching sync status:', error);
        }
    };

    const handleGoogleConnect = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await axios.get('http://localhost:8000/api/calendar-sync/google/auth-url');
            window.location.href = response.data.url;
        } catch (error) {
            setError('Failed to connect to Google Calendar. Please try again.');
            console.error('Error connecting to Google Calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSync = async () => {
        try {
            setLoading(true);
            setError("");
            await axios.post('http://localhost:8000/api/calendar-sync/google/sync');
            await fetchSyncStatus();
        } catch (error) {
            setError('Failed to sync with Google Calendar. Please try again.');
            console.error('Error syncing with Google Calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAppleExport = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/calendar-sync/apple/ical-url');
            
            // Create a blob and download the iCal file
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
            console.error('Error exporting to Apple Calendar:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="calendar-sync">
            <h2>Calendar Sync Settings</h2>
            
            <div className="sync-section">
                <h3>Google Calendar</h3>
                <p>Status: {syncStatus.google.connected ? 'Connected' : 'Not Connected'}</p>
                {syncStatus.google.last_sync && (
                    <p>Last synced: {new Date(syncStatus.google.last_sync).toLocaleString()}</p>
                )}
                <div className="sync-buttons">
                    {!syncStatus.google.connected ? (
                        <button 
                            onClick={handleGoogleConnect}
                            disabled={loading}
                            className="connect-button"
                        >
                            Connect Google Calendar
                        </button>
                    ) : (
                        <button 
                            onClick={handleGoogleSync}
                            disabled={loading}
                            className="sync-button"
                        >
                            Sync Now
                        </button>
                    )}
                    {error && (
                        <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
                    )}
                </div>
            </div>

            <div className="sync-section">
                <h3>Apple Calendar</h3>
                <p>Status: {syncStatus.apple.connected ? 'Connected' : 'Not Connected'}</p>
                {syncStatus.apple.last_sync && (
                    <p>Last synced: {new Date(syncStatus.apple.last_sync).toLocaleString()}</p>
                )}
                <div className="sync-buttons">
                    <button 
                        onClick={handleAppleExport}
                        disabled={loading}
                        className="export-button"
                    >
                        Export to Apple Calendar
                    </button>
                </div>
            </div>

            <style jsx>{`
                .calendar-sync {
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .sync-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    border: 1px solid #eee;
                    border-radius: 4px;
                }

                .sync-section h3 {
                    margin-top: 0;
                    color: #333;
                }

                .sync-buttons {
                    margin-top: 15px;
                }

                button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }

                button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .connect-button {
                    background-color: #4285f4;
                    color: white;
                }

                .connect-button:hover {
                    background-color: #357abd;
                }

                .sync-button {
                    background-color: #34a853;
                    color: white;
                }

                .sync-button:hover {
                    background-color: #2d9249;
                }

                .export-button {
                    background-color: #000;
                    color: white;
                }

                .export-button:hover {
                    background-color: #333;
                }
            `}</style>
        </div>
    );
};

export default CalendarSync; 