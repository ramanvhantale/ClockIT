// src/components/DigitalClock.jsx
import React from 'react';
import { formatTime, formatDate, getUtcOffset } from '../utils/timeUtils';

/**
 * Prominent digital clock display with formatted time, seconds, AM/PM,
 * full date display, and timezone metadata badge.
 */
export function DigitalClock({
  now,
  timezone = 'Asia/Kolkata',
  cityName = 'Pune',
  countryName = 'India',
  is24Hour = false,
  showSeconds = true,
}) {
  const { hours, minutes, seconds, ampm } = formatTime(now, timezone, is24Hour, showSeconds);
  const { dayName, fullDate } = formatDate(now, timezone);
  const utcOffset = getUtcOffset(now, timezone);

  return (
    <div className="digital-info-panel">
      {/* Time Display */}
      <div className="digital-time-display" aria-live="polite">
        <span>{hours}:{minutes}</span>
        {showSeconds && <span className="digital-time-seconds">:{seconds}</span>}
        {!is24Hour && <span className="digital-ampm">{ampm}</span>}
      </div>

      {/* Date Information */}
      <div className="hero-date-row">
        <div className="hero-day-name">{dayName}</div>
        <div className="hero-full-date">{fullDate}</div>
      </div>

      {/* Timezone and Offset Metadata */}
      <div className="hero-tz-row">
        <span className="live-dot" title="Live synchronized time" />
        <span className="hero-tz-badge">
          {cityName}, {countryName}
        </span>
        <span className="hero-utc-offset">{utcOffset}</span>
      </div>
    </div>
  );
}
