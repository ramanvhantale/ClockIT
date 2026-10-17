// src/utils/timeUtils.js
// Core time utilities using Intl.DateTimeFormat and IANA timezone IDs

/**
 * Format a time string for a given timezone and format.
 * @param {Date} date
 * @param {string} timezone  IANA timezone identifier
 * @param {boolean} is24Hour
 * @param {boolean} showSeconds
 * @returns {{ hours: string, minutes: string, seconds: string, ampm: string, fullTime: string }}
 */
export function formatTime(date, timezone, is24Hour = true, showSeconds = true) {
  const opts = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !is24Hour,
  };
  if (showSeconds) opts.second = '2-digit';

  const formatter = new Intl.DateTimeFormat('en-US', opts);
  const parts = formatter.formatToParts(date);

  let hours = '';
  let minutes = '';
  let seconds = '';
  let ampm = '';

  parts.forEach(({ type, value }) => {
    if (type === 'hour') hours = value;
    if (type === 'minute') minutes = value;
    if (type === 'second') seconds = value;
    if (type === 'dayPeriod') ampm = value;
  });

  const fullTime = parts.map(p => p.value).join('');

  return { hours, minutes, seconds, ampm, fullTime };
}

/**
 * Format a date string for a given timezone.
 * @param {Date} date
 * @param {string} timezone
 * @returns {{ dayName: string, day: string, month: string, year: string, fullDate: string }}
 */
export function formatDate(date, timezone) {
  const opts = {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat('en-US', opts);
  const parts = formatter.formatToParts(date);

  let dayName = '';
  let day = '';
  let month = '';
  let year = '';

  parts.forEach(({ type, value }) => {
    if (type === 'weekday') dayName = value;
    if (type === 'day') day = value;
    if (type === 'month') month = value;
    if (type === 'year') year = value;
  });

  const fullDate = `${day} ${month} ${year}`;
  return { dayName, day, month, year, fullDate };
}

/**
 * Get the UTC offset minutes for a timezone at a given date.
 * Handles both "GMT+X" and "UTC+X" browser variations across platforms.
 * @param {Date} date
 * @param {string} timezone
 * @returns {number} Offset in minutes from UTC (e.g. +330 for IST)
 */
export function getUtcOffsetMinutes(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value || '';
    const match = tzPart.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  } catch {
    return 0;
  }
}

/**
 * Get the UTC offset string for a timezone at a specific date.
 * e.g. "UTC+5:30" or "UTC-4" or "UTC"
 * @param {Date} date
 * @param {string} timezone
 * @returns {string}
 */
export function getUtcOffset(date, timezone) {
  const minutes = getUtcOffsetMinutes(date, timezone);
  if (minutes === 0) return 'UTC';
  const sign = minutes > 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Get timezone abbreviation (e.g. IST, BST, EDT, JST).
 * @param {Date} date
 * @param {string} timezone
 * @returns {string}
 */
export function getTzAbbr(date, timezone) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : '';
  } catch {
    return '';
  }
}

/**
 * Get local hour (0-23) in a timezone.
 * @param {Date} date
 * @param {string} timezone
 * @returns {number}
 */
export function getLocalHour(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hourPart = parts.find(p => p.type === 'hour');
  const h = parseInt(hourPart?.value ?? '0', 10);
  return h === 24 ? 0 : h;
}

/**
 * Determine if it is daytime in a given timezone (6am – 8pm).
 * @param {Date} date
 * @param {string} timezone
 * @returns {boolean}
 */
export function isDaytime(date, timezone) {
  const h = getLocalHour(date, timezone);
  return h >= 6 && h < 20;
}

/**
 * Calculate the hour/minute/second angles for analog clock hands.
 * @param {Date} date
 * @param {string} timezone
 * @returns {{ hourAngle: number, minuteAngle: number, secondAngle: number }}
 */
export function getClockAngles(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  let h = 0, m = 0, s = 0;
  parts.forEach(({ type, value }) => {
    if (type === 'hour') h = parseInt(value, 10) % 12;
    if (type === 'minute') m = parseInt(value, 10);
    if (type === 'second') s = parseInt(value, 10);
  });

  const ms = date.getMilliseconds();
  const secondAngle = (s + ms / 1000) * 6;
  const minuteAngle = (m + s / 60) * 6;
  const hourAngle = (h + m / 60 + s / 3600) * 30;

  return { hourAngle, minuteAngle, secondAngle };
}

/**
 * Get the offset difference in hours between two IANA timezones.
 * Returns a formatted string like "+5h 30m" or "-3h" or "Same".
 * @param {Date} date
 * @param {string} tz1  Reference timezone
 * @param {string} tz2  Target timezone
 * @returns {string}
 */
export function getTimeDifference(date, tz1, tz2) {
  if (tz1 === tz2) return 'Same';

  const diff = getUtcOffsetMinutes(date, tz2) - getUtcOffsetMinutes(date, tz1);
  if (diff === 0) return 'Same';

  const sign = diff > 0 ? '+' : '-';
  const absDiff = Math.abs(diff);
  const h = Math.floor(absDiff / 60);
  const m = absDiff % 60;
  return m === 0 ? `${sign}${h}h` : `${sign}${h}h ${m}m`;
}

/**
 * Format a Date object or hours/minutes to a string for alarms.
 * @param {number} hours
 * @param {number} minutes
 * @param {boolean} is24Hour
 * @returns {string}
 */
export function formatAlarmTime(hours, minutes, is24Hour = true) {
  if (is24Hour) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Parse current local time's hour/minute.
 * @param {Date} date
 * @returns {{ h: number, m: number, s: number }}
 */
export function getCurrentHMS(date) {
  return { h: date.getHours(), m: date.getMinutes(), s: date.getSeconds() };
}

/**
 * Compute minutes until an alarm fires.
 * @param {number} alarmHour   0-23
 * @param {number} alarmMinute 0-59
 * @param {Date} now
 * @returns {number} minutes until alarm (0-1439)
 */
export function minutesUntilAlarm(alarmHour, alarmMinute, now) {
  const totalAlarm = alarmHour * 60 + alarmMinute;
  const totalNow = now.getHours() * 60 + now.getMinutes();
  let diff = totalAlarm - totalNow;
  if (diff <= 0) diff += 1440; // next day
  return diff;
}

/**
 * Format a countdown duration in minutes to a human-readable string.
 * @param {number} totalMinutes
 * @returns {string}
 */
export function formatCountdown(totalMinutes) {
  if (totalMinutes <= 0) return 'Now';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
