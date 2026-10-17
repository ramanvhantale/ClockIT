// src/components/WorldClockCard.jsx
import React from 'react';
import { Star, Trash2, Sun, Moon } from 'lucide-react';
import {
  formatTime,
  formatDate,
  getUtcOffset,
  getTzAbbr,
  isDaytime,
  getTimeDifference,
} from '../utils/timeUtils';

export function WorldClockCard({
  city,
  now,
  primaryCity,
  is24Hour,
  showSeconds,
  isPrimary,
  onSetPrimary,
  onRemove,
  density = 'comfortable',
}) {
  const { hours, minutes, seconds, ampm } = formatTime(
    now,
    city.timezone,
    is24Hour,
    showSeconds
  );
  const { day, month } = formatDate(now, city.timezone);
  const utcOffset = getUtcOffset(now, city.timezone);
  const tzAbbr = getTzAbbr(now, city.timezone) || utcOffset;
  const daytime = isDaytime(now, city.timezone);
  const diffFromPrimary = getTimeDifference(now, primaryCity.timezone, city.timezone);

  return (
    <div
      className={`city-card ${isPrimary ? 'is-primary' : ''} ${
        !daytime ? 'is-night' : ''
      } ${density === 'compact' ? 'density-compact' : ''}`}
    >
      {/* Card Header */}
      <div className="city-card-header">
        <div>
          <div className="city-name">
            {city.flag && <span style={{ marginRight: 6 }}>{city.flag}</span>}
            {city.city}
          </div>
          <div className="city-country">{city.country}</div>
        </div>

        <div className="city-actions">
          {/* Make Primary Button */}
          {!isPrimary && (
            <button
              className="city-action-btn"
              onClick={() => onSetPrimary(city)}
              title="Set as primary clock"
              aria-label={`Set ${city.city} as primary clock`}
            >
              <Star size={14} />
            </button>
          )}

          {/* Remove City Button */}
          <button
            className="city-action-btn danger"
            onClick={() => onRemove(city.id)}
            title="Remove city"
            aria-label={`Remove ${city.city}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Time Display */}
      <div className="city-card-time">
        <span>{hours}:{minutes}</span>
        {showSeconds && <span style={{ fontSize: '0.6em', opacity: 0.7 }}>:{seconds}</span>}
        {!is24Hour && (
          <span style={{ fontSize: '0.45em', marginLeft: 4, opacity: 0.8 }}>
            {ampm}
          </span>
        )}
      </div>

      {/* Card Footer: Date, Difference & Day/Night Indicator */}
      <div className="city-card-footer">
        <div className="city-card-date">
          {day} {month}
        </div>

        <div className="city-card-meta">
          <span className="city-tz-abbr">{tzAbbr}</span>
          <span className="city-diff" title={`Time relative to ${primaryCity.city}`}>
            {diffFromPrimary}
          </span>
          <span
            className="day-night-icon"
            title={daytime ? 'Daytime (Sun)' : 'Nighttime (Moon)'}
          >
            {daytime ? (
              <Sun size={15} color="#e59819" />
            ) : (
              <Moon size={15} color="#567C8D" />
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
