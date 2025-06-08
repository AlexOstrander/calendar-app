import React, { useState, useEffect } from 'react';

const defaultEvent = {
  title: '',
  start: '',
  end: '',
  description: '',
  color: '#4a90e2',
  allDay: false,
};

const EventModal = ({ open, onClose, onSave, initialEvent, onDelete }) => {
  const [event, setEvent] = useState(defaultEvent);
  const [mode, setMode] = useState('view'); // 'view' or 'edit'
  const [showConfirm, setShowConfirm] = useState(false); // For custom delete confirmation

  useEffect(() => {
    function toLocalDatetimeString(dateStr) {
      if (!dateStr) return '';
      return dateStr.slice(0, 16);
    }
    if (initialEvent) {
      setEvent({
        ...defaultEvent,
        ...initialEvent,
        start: initialEvent.start ? toLocalDatetimeString(initialEvent.start) : '',
        end: initialEvent.end ? toLocalDatetimeString(initialEvent.end) : '',
      });
      setMode('view'); // Reset to view mode when opening
    } else {
      setEvent({ ...defaultEvent, start: '', end: '' });
      setMode('edit');
    }
  }, [initialEvent, open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent((ev) => ({
      ...ev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!event.title || !event.start || !event.end) return;
    onSave(event);
  };

  // Helper for formatting date
  function formatDateTime(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  // Helper for repeat and alert (static for now)
  const repeatText = 'Does not repeat';
  const alertText = 'Alert 1 day before at 9 AM';

  // VIEW MODE (Apple Calendar style)
  if (mode === 'view') {
    return (
      <div style={backdropStyle}>
        <div style={{ ...modalStyle, minWidth: 340, maxWidth: 400, padding: 0, overflow: 'hidden', position: 'relative' }}>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer',
              zIndex: 2,
            }}
            aria-label="Close"
          >
            ×
          </button>
          <div style={{ padding: '28px 28px 20px 28px' }}>
            {/* Color dot and title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: event.color, display: 'inline-block', border: '1.5px solid #eee' }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>{event.title || '(No Title)'}</span>
            </div>
            {/* Date/time */}
            <div style={{ color: '#444', fontSize: 15, marginBottom: 8 }}>
              {event.allDay ? 'All day' : ''} {formatDateTime(event.start)}
              {event.end && !event.allDay ? ` – ${formatDateTime(event.end)}` : ''}
            </div>
            {/* Repeat and alert */}
            <div style={{ color: '#666', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span title="Repeat" style={{ fontSize: 16 }}>🔁</span> {repeatText}
            </div>
            <div style={{ color: '#666', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span title="Alert" style={{ fontSize: 16 }}>⏰</span> {alertText}
            </div>
            {/* Description */}
            {event.description && (
              <div style={{ color: '#333', fontSize: 15, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{event.description}</div>
            )}
            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setMode('edit')}
                style={{ flex: 1, background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, padding: '10px 0', cursor: 'pointer' }}
              >
                Edit
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                style={{ flex: 1, background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, padding: '10px 0', cursor: 'pointer' }}
              >
                Unsubscribe
              </button>
            </div>
            {/* Custom confirmation dialog */}
            {showConfirm && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
                  padding: 28,
                  minWidth: 260,
                  maxWidth: 320,
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 16 }}>Delete this event?</div>
                  <div style={{ color: '#666', fontSize: 15, marginBottom: 22 }}>This action cannot be undone.</div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setShowConfirm(false);
                        onDelete && onDelete(event);
                      }}
                      style={{ background: '#f44336', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, padding: '8px 18px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowConfirm(false)}
                      style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, padding: '8px 18px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EDIT MODE (form)
  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: 20 }}>Edit Event</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={event.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="datetime-local"
              name="start"
              value={event.start}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              type="datetime-local"
              name="end"
              value={event.end}
              onChange={handleChange}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <textarea
            name="description"
            placeholder="Description"
            value={event.description}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: 60 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                name="allDay"
                checked={event.allDay}
                onChange={handleChange}
              />
              All day
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Color:</span>
              <input
                type="color"
                name="color"
                value={event.color}
                onChange={handleChange}
                style={{ width: 32, height: 32, border: 'none', background: 'none' }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#5F43E9',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                padding: '10px 0',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{
                flex: 1,
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 16,
                padding: '10px 0',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const backdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.18)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
};

const modalStyle = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
  padding: 32,
  minWidth: 400,
  maxWidth: 600,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '16px',
  borderRadius: 6,
  border: '1px solid #ddd',
  fontSize: 16,
  boxSizing: 'border-box',
};

export default EventModal; 