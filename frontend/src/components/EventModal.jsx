import React, { useState, useEffect } from 'react';

const defaultEvent = {
  title: '',
  start: '',
  end: '',
  description: '',
  color: '#4a90e2',
  allDay: false,
};

const EventModal = ({ open, onClose, onSave, initialEvent }) => {
  const [event, setEvent] = useState(defaultEvent);

  useEffect(() => {
    function toLocalDatetimeString(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60000);
      return localDate.toISOString().slice(0, 16);
    }
    if (initialEvent) {
      setEvent({
        ...defaultEvent,
        ...initialEvent,
        start: initialEvent.start ? toLocalDatetimeString(initialEvent.start) : '',
        end: initialEvent.end ? toLocalDatetimeString(initialEvent.end) : '',
      });
    } else {
      setEvent({ ...defaultEvent, start: '', end: '' });
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

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h2 style={{ marginBottom: 20 }}>{initialEvent ? 'Edit Event' : 'Add Event'}</h2>
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
              onClick={onClose}
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