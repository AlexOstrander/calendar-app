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
    onAppleExport
}) => {
    const [localSyncing, setLocalSyncing] = React.useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalEvent, setModalEvent] = useState(null);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [currentDate, setCurrentDate] = useState(new Date());

    const openAddModal = (dateInfo) => {
        setModalEvent({
            start: dateInfo.startStr.slice(0, 16),
            end: dateInfo.endStr ? dateInfo.endStr.slice(0, 16) : dateInfo.startStr.slice(0, 16),
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
        if (!window.confirm('Delete this event?')) return;
        setLocalSyncing(true);
        try {
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/events/${clickInfo.event.id}`, {
                method: 'DELETE'
            });
            await refreshEvents();
        } catch (error) {
            // Optionally handle error
        } finally {
            setLocalSyncing(false);
        }
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
                    My Calendar
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
                />
                <EventModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSave={handleModalSave}
                    initialEvent={modalEvent}
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
                        background: #FFF6ED !important;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Calendar; 