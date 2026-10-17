// src/components/AlarmDialog.jsx
import React from 'react';
import { BellRing, Check, Clock } from 'lucide-react';
import { formatAlarmTime } from '../utils/timeUtils';

export function AlarmDialog({
  alarm,
  onDismiss,
  onSnooze,
  is24Hour = false,
}) {
  if (!alarm) return null;

  const formattedTime = formatAlarmTime(alarm.hours, alarm.minutes, is24Hour);

  return (
    <div
      className="alarm-ringing-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-title"
    >
      <div className="alarm-ringing-box">
        {/* Animated Ringing Bell Icon */}
        <div className="alarm-ringing-icon">
          <BellRing size={36} />
        </div>

        {/* Time */}
        <div className="alarm-ringing-time" id="alarm-title">
          {formattedTime}
        </div>

        {/* Alarm Label */}
        <div className="alarm-ringing-label">
          {alarm.label || 'Alarm ringing!'}
        </div>

        {/* Snooze & Dismiss Action Buttons */}
        <div className="alarm-ringing-actions">
          <button
            className="btn btn-secondary btn-lg"
            onClick={onSnooze}
            aria-label="Snooze alarm for 5 minutes"
          >
            <Clock size={18} /> Snooze 5m
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={onDismiss}
            aria-label="Dismiss alarm"
          >
            <Check size={18} /> Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
