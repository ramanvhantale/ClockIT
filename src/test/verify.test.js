// src/test/verify.test.js
// Automated verification suite for ClockIT time calculations, timezones, and alarm logic
import {
  formatTime,
  formatDate,
  getUtcOffset,
  getTimeDifference,
  isDaytime,
  minutesUntilAlarm,
  formatCountdown,
  formatAlarmTime,
} from '../utils/timeUtils.js';
import { validateAlarm, generateAlarmId } from '../utils/alarmUtils.js';
import { ALL_CITIES, INITIAL_CITIES } from '../data/cities.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`✗ FAIL: ${message}`);
  }
}

console.log('--- RUNNING CLOCKIT VERIFICATION SUITE ---\n');

// 1. Timezone validity for all cities
console.log('1. Testing IANA Timezone Validity:');
ALL_CITIES.forEach((c) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: c.timezone });
    formatter.format(new Date());
    assert(true, `City ${c.city} has valid IANA timezone: ${c.timezone}`);
  } catch (err) {
    assert(false, `City ${c.city} has INVALID timezone: ${c.timezone} (${err.message})`);
  }
});

// 2. Format 12-hour vs 24-hour
console.log('\n2. Testing 12-Hour vs 24-Hour Formatting:');
const sampleDate = new Date(Date.UTC(2026, 9, 14, 8, 30, 45)); // 8:30:45 UTC
const f24 = formatTime(sampleDate, 'UTC', true, true);
assert(f24.hours === '08' && f24.minutes === '30' && f24.seconds === '45', '24H format returns 08:30:45');

const f12 = formatTime(sampleDate, 'UTC', false, true);
assert(f12.hours === '08' && f12.minutes === '30' && f12.ampm === 'AM', '12H format AM return');

const samplePM = new Date(Date.UTC(2026, 9, 14, 20, 15, 0)); // 20:15 UTC
const f12PM = formatTime(samplePM, 'UTC', false, false);
assert(f12PM.hours === '08' && f12PM.minutes === '15' && f12PM.ampm === 'PM', '12H format PM return');

// 3. Daylight Saving Time Awareness (London & New York)
console.log('\n3. Testing Daylight Saving Time (DST) Handling:');
// London in July (BST = UTC+1) vs January (GMT = UTC+0)
const summerDate = new Date('2026-07-15T12:00:00Z');
const winterDate = new Date('2026-01-15T12:00:00Z');

const londonSummerOffset = getUtcOffset(summerDate, 'Europe/London');
const londonWinterOffset = getUtcOffset(winterDate, 'Europe/London');
assert(londonSummerOffset.includes('+1'), `London in July should be UTC+1 (got: ${londonSummerOffset})`);
assert(londonWinterOffset === 'GMT' || londonWinterOffset.includes('+0') || londonWinterOffset === 'UTC', `London in January should be GMT/UTC+0 (got: ${londonWinterOffset})`);

// New York in July (EDT = UTC-4) vs January (EST = UTC-5)
const nySummerOffset = getUtcOffset(summerDate, 'America/New_York');
const nyWinterOffset = getUtcOffset(winterDate, 'America/New_York');
assert(nySummerOffset.includes('-4'), `New York in July should be UTC-4 (got: ${nySummerOffset})`);
assert(nyWinterOffset.includes('-5'), `New York in January should be UTC-5 (got: ${nyWinterOffset})`);

// 4. Time Difference Relative to Primary
console.log('\n4. Testing Time Difference Calculations:');
const diffSame = getTimeDifference(summerDate, 'Asia/Kolkata', 'Asia/Kolkata');
assert(diffSame === 'Same', 'Same timezone returns "Same"');

const diffLondonToPune = getTimeDifference(summerDate, 'Asia/Kolkata', 'Europe/London');
assert(diffLondonToPune.startsWith('-'), `London relative to Pune is behind (-): ${diffLondonToPune}`);

const diffTokyoToPune = getTimeDifference(summerDate, 'Asia/Kolkata', 'Asia/Tokyo');
assert(diffTokyoToPune.startsWith('+'), `Tokyo relative to Pune is ahead (+): ${diffTokyoToPune}`);

// 5. Day / Night Determination
console.log('\n5. Testing Day/Night Calculation:');
const noonDate = new Date('2026-10-14T12:00:00Z');
assert(isDaytime(noonDate, 'UTC') === true, 'Noon (12:00) in UTC is daytime');

const midnightDate = new Date('2026-10-14T02:00:00Z');
assert(isDaytime(midnightDate, 'UTC') === false, '02:00 in UTC is nighttime');

// 6. Alarm Validation
console.log('\n6. Testing Alarm Form Validation:');
assert(validateAlarm({ hours: 7, minutes: 30, label: 'Test' }).valid === true, 'Valid alarm passes');
assert(validateAlarm({ hours: 25, minutes: 30 }).valid === false, 'Hour 25 fails validation');
assert(validateAlarm({ hours: 10, minutes: 75 }).valid === false, 'Minute 75 fails validation');
assert(validateAlarm({ hours: 10, minutes: 15, label: 'a'.repeat(65) }).valid === false, 'Over-length label fails');

// 7. Alarm Countdowns
console.log('\n7. Testing Alarm Countdown Calculations:');
const baseTime = new Date('2026-10-14T10:00:00');
const minsUntil11 = minutesUntilAlarm(11, 30, baseTime);
assert(minsUntil11 === 90, `Minutes until 11:30 from 10:00 is 90 (got: ${minsUntil11})`);
assert(formatCountdown(90) === '1h 30m', 'Countdown formats to "1h 30m"');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
console.log(`========================================`);

if (failed > 0) process.exit(1);
