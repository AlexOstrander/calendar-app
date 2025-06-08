import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

const Calendar = ({
    events,
    loading,
    error,
    refreshEvents,
    syncStatus,
    syncLoading,
    syncError,
    onGoogleConnect,
    onGoogleSync,
    onGoogleLogout,
    onAppleExport,
    userName
}) => {
    // Debug log for userName prop
    console.log('Calendar received userName:', userName);

    const [localSyncing, setLocalSyncing] = React.useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEvent, setModalEvent] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit' or 'view'
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());

    const toLocalInputValue = (date) => {
        const pad = n => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const openAddModal = (dateInfo) => {
        let start, end;
        const now = new Date();
        if (dateInfo.allDay) {
            // Use the clicked day, but set the time to now
            const clickedDate = new Date(dateInfo.startStr);
            clickedDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
            start = toLocalInputValue(clickedDate);
            // Set end to one hour after start
            const endDate = new Date(clickedDate);
            endDate.setHours(endDate.getHours() + 1);
            end = toLocalInputValue(endDate);
        } else {
            start = dateInfo.startStr.slice(0, 16);
            end = dateInfo.endStr ? dateInfo.endStr.slice(0, 16) : dateInfo.startStr.slice(0, 16);
        }
        setModalEvent({
            start,
            end,
            allDay: dateInfo.allDay || false,
            color: '#4a90e2',
        });
        setModalMode('add');
        setModalOpen(true);
    };

    const openEditModal = (clickInfo) => {
        setModalEvent({
            id: clickInfo.event.id,
            title: clickInfo.event.title,
            start: clickInfo.event.start ? clickInfo.event.start.toISOString().slice(0, 16) : '',
            end: clickInfo.event.end ? clickInfo.event.end.toISOString().slice(0, 16) : '',
            description: clickInfo.event.extendedProps.description || '',
            color: clickInfo.event.backgroundColor,
            allDay: clickInfo.event.allDay,
        });
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleModalSave = async (eventData) => {
        setLocalSyncing(true);
        // Map frontend fields to backend fields
        const payload = {
            ...eventData,
            start_time: eventData.start,
            end_time: eventData.end,
            all_day: eventData.allDay,
        };
        delete payload.start;
        delete payload.end;
        delete payload.allDay;
        const token = localStorage.getItem('token');
        try {
            if (modalMode === 'add') {
                await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });
            } else if (modalMode === 'edit' && modalEvent?.id) {
                await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events/${modalEvent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });
            }
            setModalOpen(false);
            await refreshEvents();
        } catch (error) {
            // Optionally handle error
        } finally {
            setLocalSyncing(false);
        }
    };

    const handleEventDelete = async (clickInfo) => {
        if (!window.confirm('Delete this event?')) {
            console.log('User cancelled delete');
            return;
        }
        setLocalSyncing(true);
        const token = localStorage.getItem('token');
        try {
            console.log('Sending DELETE request...');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events/${clickInfo.event.id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            console.log('DELETE response status:', response.status);
            await refreshEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setLocalSyncing(false);
        }
    };

    const renderEventContent = (eventInfo) => {
        // Determine if this is month view and a timed event
        const isMonthView = eventInfo.view && eventInfo.view.type === 'dayGridMonth';
        const isTimed = !eventInfo.event.allDay;
        const color = eventInfo.event.backgroundColor || eventInfo.event.extendedProps.color || '#4a90e2';
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${color}`,
                paddingLeft: 4,
                background: isMonthView ? 'rgba(0,0,0,0.01)' : undefined,
                minHeight: 20
            }}>
                <span>
                    {isMonthView && isTimed && eventInfo.timeText && (
                        <span style={{ fontWeight: 600, marginRight: 4 }}>{eventInfo.timeText}</span>
                    )}
                    {eventInfo.event.title}
                </span>
            </div>
        );
    };

    if (loading) {
        return <div>Loading calendar...</div>;
    }
    if (error) {
        return <div>Error loading calendar: {error}</div>;
    }
    return (
        <div style={{ minHeight: '100vh', background: '#FFF6ED', padding: '40px 0' }}>
            <div style={{
                maxWidth: 1100,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                padding: 32,
            }}>
                <h2 style={{
                    fontWeight: 700,
                    fontSize: 28,
                    marginBottom: 24,
                    color: '#22223B',
                }}>
                    {userName ? `${userName}'s Calendar` : 'Loading...'}
                </h2>
                {/* Toolbar for sync controls */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 24,
                    marginBottom: 24,
                    flexWrap: 'wrap',
                }}>
                    {/* Google Calendar Controls */}
                    <div style={{ minWidth: 260 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Google Calendar</div>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>
                            Status: {syncStatus?.google?.connected ? 'Connected' : 'Not Connected'}
                        </div>
                        {syncStatus?.google?.last_sync && (
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                                Last synced: {new Date(syncStatus.google.last_sync).toLocaleString()}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                            {!syncStatus?.google?.connected ? (
                                <button
                                    onClick={onGoogleConnect}
                                    disabled={syncLoading}
                                    style={{ background: '#4285f4', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    Connect Google Calendar
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={onGoogleSync}
                                        disabled={syncLoading}
                                        style={{ background: '#34a853', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        Sync Now
                                    </button>
                                    <button
                                        onClick={onGoogleLogout}
                                        disabled={syncLoading}
                                        style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}
                                    >
                                        Sign Out / Switch Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {/* Apple Calendar Controls */}
                    <div style={{ minWidth: 220 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Apple Calendar</div>
                        <div style={{ fontSize: 14, marginBottom: 4 }}>
                            Status: {syncStatus?.apple?.connected ? 'Connected' : 'Not Connected'}
                        </div>
                        {syncStatus?.apple?.last_sync && (
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                                Last synced: {new Date(syncStatus.apple.last_sync).toLocaleString()}
                            </div>
                        )}
                        <button
                            onClick={onAppleExport}
                            disabled={syncLoading}
                            style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', fontWeight: 500, cursor: 'pointer', marginTop: 8 }}
                        >
                            Export to Apple Calendar
                        </button>
                    </div>
                    {/* Sync error/loading */}
                    {syncError && (
                        <div style={{ color: 'red', fontWeight: 500, marginLeft: 16 }}>{syncError}</div>
                    )}
                    {syncLoading && (
                        <div style={{ color: '#4a90e2', fontWeight: 500, marginLeft: 16 }}>Syncing...</div>
                    )}
                </div>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={currentView}
                    initialDate={currentDate}
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
                    select={openAddModal}
                    eventClick={openEditModal}
                    eventDrop={handleModalSave}
                    eventResize={handleModalSave}
                    loading={localSyncing}
                    datesSet={(arg) => {
                        setCurrentView(arg.view.type);
                        setCurrentDate(arg.start);
                    }}
                    eventContent={renderEventContent}
                />
                <EventModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleModalSave}
                    initialEvent={modalEvent}
                    onDelete={async (eventObj) => {
                        console.log('Attempting to delete event:', eventObj);
                        setLocalSyncing(true);
                        const token = localStorage.getItem('token');
                        try {
                            console.log('About to send DELETE request...');
                            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events/${eventObj.id}`, {
                                method: 'DELETE',
                                headers: {
                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                }
                            });
                            console.log('DELETE response status:', response.status);
                            if (!response.ok) {
                                const text = await response.text();
                                console.error('Delete failed:', response.status, text);
                            }
                            setModalOpen(false);
                            await refreshEvents();
                        } catch (error) {
                            console.error('Error deleting event:', error);
                        } finally {
                            setLocalSyncing(false);
                        }
                    }}
                />
                <style>{`
                    .fc .fc-button, .fc .fc-button-primary {
                        background: #5F43E9 !important;
                        color: #fff !important;
                        border-radius: 6px !important;
                        border: none !important;
                        font-weight: 600 !important;
                        box-shadow: none !important;
                        transition: background 0.2s;
                        margin-right: 8px !important;
                    }
                    .fc .fc-button-group {
                        gap: 8px !important;
                    }
                    .fc .fc-button:hover, .fc .fc-button-primary:hover {
                        background: #3D2DB3 !important;
                    }
                    .fc .fc-toolbar-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        color: #22223B;
                    }
                    .fc .fc-daygrid-day {
                        background: #FAF7F2;
                    }
                    .fc .fc-day-today {
                        background: #FFD580 !important;
                        border: 2.5px solid #FF9800 !important;
                        box-shadow: 0 0 0 2px #FF980033 !important;
                        border-radius: 8px !important;
                        z-index: 2;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Calendar; 