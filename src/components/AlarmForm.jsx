// src/components/AlarmForm.jsx
import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { validateAlarm } from '../utils/alarmUtils';

export function AlarmForm({
  isOpen,
  onClose,
  onSave,
  editingAlarm = null,
  is24Hour = false,
  primeAudio = () => {},
}) {
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [label, setLabel] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAlarm) {
      const h = editingAlarm.hours;
      const m = editingAlarm.minutes;
      if (is24Hour) {
        setHours(String(h).padStart(2, '0'));
      } else {
        const h12 = h % 12 || 12;
        setHours(String(h12).padStart(2, '0'));
        setAmpm(h >= 12 ? 'PM' : 'AM');
      }
      setMinutes(String(m).padStart(2, '0'));
      setLabel(editingAlarm.label || '');
    } else {
      // Default to 08:00 AM or 08:00
      setHours('08');
      setMinutes('00');
      setAmpm('AM');
      setLabel('Alarm');
    }
    setErrors({});
  }, [editingAlarm, isOpen, is24Hour]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    primeAudio(); // Establish audio context on user action

    let finalHour = parseInt(hours, 10);
    const finalMinute = parseInt(minutes, 10);

    if (!is24Hour) {
      if (ampm === 'PM' && finalHour < 12) finalHour += 12;
      if (ampm === 'AM' && finalHour === 12) finalHour = 0;
    }

    const { valid, errors: validationErrors } = validateAlarm({
      hours: finalHour,
      minutes: finalMinute,
      label,
    });

    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      hours: finalHour,
      minutes: finalMinute,
      label: label.trim() || 'Alarm',
      enabled: editingAlarm ? editingAlarm.enabled : true,
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: 'var(--color-sky-10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-teal)',
                }}
              >
                <Bell size={18} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {editingAlarm ? 'Edit Alarm' : 'Set New Alarm'}
              </h2>
            </div>
            <button
              type="button"
              className="btn-icon btn-ghost"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Time Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                Alarm Time
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Hours */}
                <select
                  className="input-field"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                >
                  {is24Hour
                    ? Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))
                    : Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(
                        (h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        )
                      )}
                </select>

                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  :
                </span>

                {/* Minutes */}
                <select
                  className="input-field"
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.25rem', fontWeight: 700 }}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* AM/PM toggle when in 12-hour mode */}
                {!is24Hour && (
                  <div className="format-toggle-btn" style={{ marginLeft: 6 }}>
                    <button
                      type="button"
                      className={ampm === 'AM' ? 'active' : ''}
                      onClick={() => setAmpm('AM')}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      className={ampm === 'PM' ? 'active' : ''}
                      onClick={() => setAmpm('PM')}
                    >
                      PM
                    </button>
                  </div>
                )}
              </div>

              {(errors.hours || errors.minutes) && (
                <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: 4 }}>
                  {errors.hours || errors.minutes}
                </div>
              )}
            </div>

            {/* Label Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 6,
                }}
              >
                Alarm Label
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Wake up, Team Standup, Medication"
                value={label}
                maxLength={60}
                onChange={(e) => setLabel(e.target.value)}
              />
              {errors.label && (
                <div style={{ color: '#c0392b', fontSize: '0.75rem', marginTop: 4 }}>
                  {errors.label}
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Note: Alarms ring as long as this tab or browser window remains open.
            </p>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingAlarm ? 'Update Alarm' : 'Set Alarm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
