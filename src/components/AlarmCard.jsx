// src/components/AlarmCard.jsx
import React from 'react';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { formatAlarmTime, minutesUntilAlarm, formatCountdown } from '../utils/timeUtils';

export function AlarmCard({
  alarm,
  now,
  is24Hour,
  onToggle,
  onEdit,
  onDelete,
}) {
  const formattedTime = formatAlarmTime(alarm.hours, alarm.minutes, is24Hour);

  // Compute countdown
  let countdownText = '';
  if (alarm.enabled) {
    if (alarm.snoozedUntil && alarm.snoozedUntil > Date.now()) {
      const minLeft = Math.max(1, Math.round((alarm.snoozedUntil - Date.now()) / 60000));
      countdownText = `Snoozed (in ${minLeft}m)`;
    } else {
      const mins = minutesUntilAlarm(alarm.hours, alarm.minutes, now);
      countdownText = `Rings in ${formatCountdown(mins)}`;
    }
  }

  return (
    <div className={`alarm-card ${!alarm.enabled ? 'disabled' : ''}`}>
      <div className="alarm-card-header">
        <div>
          <div className="alarm-time-display">{formattedTime}</div>
          <div className="alarm-label">{alarm.label}</div>
        </div>

        {/* Enable / Disable Toggle */}
        <label className="toggle" title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}>
          <input
            type="checkbox"
            checked={alarm.enabled}
            onChange={() => onToggle(alarm.id)}
            aria-label={`Toggle alarm for ${alarm.label}`}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--border-light)',
        }}
      >
        {/* Countdown Badge */}
        {alarm.enabled ? (
          <span
            className="badge badge-teal"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Clock size={12} /> {countdownText}
          </span>
        ) : (
          <span className="badge badge-navy" style={{ opacity: 0.6 }}>
            Inactive
          </span>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-icon btn-ghost"
            style={{ padding: 6 }}
            onClick={() => onEdit(alarm)}
            title="Edit alarm"
            aria-label="Edit alarm"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn-icon btn-ghost"
            style={{ padding: 6, color: '#c0392b' }}
            onClick={() => onDelete(alarm.id)}
            title="Delete alarm"
            aria-label="Delete alarm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
