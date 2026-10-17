// src/components/LiveClockCard.jsx
import React from 'react';
import { Star, Sun, Moon, ChevronDown } from 'lucide-react';
import { AnalogClock } from './AnalogClock';
import {
  formatTime,
  formatDate,
  getUtcOffset,
  getTzAbbr,
  isDaytime,
  getTimeDifference,
} from '../utils/timeUtils';
import { ALL_CITIES } from '../data/cities';

export function LiveClockCard({
  city,
  now,
  isPrimary,
  primaryCity,
  is24Hour,
  showSeconds,
  smoothAnimations,
  onSetPrimary,
  onChangeCity,
  availableCities = ALL_CITIES,
}) {
  const { hours, minutes, seconds, ampm } = formatTime(
    now,
    city.timezone,
    is24Hour,
    showSeconds
  );
  const { dayName, day, month } = formatDate(now, city.timezone);
  const utcOffset = getUtcOffset(now, city.timezone);
  const tzAbbr = getTzAbbr(now, city.timezone) || utcOffset;
  const daytime = isDaytime(now, city.timezone);
  const diffFromPrimary = getTimeDifference(now, primaryCity.timezone, city.timezone);

  return (
    <div className={`live-clock-card ${isPrimary ? 'is-primary-card' : ''}`}>
      {/* Top Header of Card */}
      <div className="live-clock-card-header">
        {isPrimary ? (
          <div className="live-clock-badge-primary">
            <Star size={13} fill="currentColor" /> Primary Clock
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="live-clock-badge-secondary">World Clock</span>
            <button
              className="city-action-btn"
              onClick={() => onSetPrimary(city)}
              title={`Set ${city.city} as primary clock`}
              aria-label={`Set ${city.city} as primary clock`}
            >
              <Star size={14} />
            </button>
          </div>
        )}
      </div>

      {/* City Title & Country (with selector for companion clocks) */}
      <div className="live-clock-location">
        {onChangeCity && !isPrimary ? (
          <div className="live-clock-city-pill" title="Click to switch city">
            <span className="live-clock-flag">{city.flag}</span>
            <span className="live-clock-pill-name">{city.city}</span>
            <ChevronDown size={14} className="live-clock-chevron" />
            <select
              className="live-clock-native-select"
              value={city.id}
              onChange={(e) => {
                const found = availableCities.find((c) => c.id === e.target.value);
                if (found) onChangeCity(found);
              }}
              aria-label="Select city for this live clock"
            >
              {availableCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.city}, {c.country}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="live-clock-city-title">
            <span className="live-clock-flag">{city.flag}</span>
            <span className="live-clock-city-name">{city.city}</span>
          </div>
        )}
        <div className="live-clock-country">{city.country}</div>
      </div>

      {/* Live Analog Clock */}
      <div className="live-clock-analog-container">
        <AnalogClock
          timezone={city.timezone}
          smoothEnabled={smoothAnimations}
          size={160}
        />
      </div>

      {/* Live Digital Time Display */}
      <div className="live-clock-digital-time">
        <span>{hours}:{minutes}</span>
        {showSeconds && <span className="live-clock-seconds">:{seconds}</span>}
        {!is24Hour && <span className="live-clock-ampm">{ampm}</span>}
      </div>

      {/* Date & Day */}
      <div className="live-clock-date">
        {dayName}, {day} {month}
      </div>

      {/* Card Footer: Offset, Relative Difference, Day/Night */}
      <div className="live-clock-card-footer">
        <span className="hero-tz-badge" style={{ fontSize: '0.725rem', padding: '2px 8px' }}>
          {tzAbbr} ({utcOffset})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {!isPrimary && (
            <span className="city-diff" title={`Time difference relative to ${primaryCity.city}`}>
              {diffFromPrimary}
            </span>
          )}
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
