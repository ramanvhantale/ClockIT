// src/utils/alarmUtils.js
// Web Audio API utilities for alarm sounds

/**
 * Create an AudioContext-based beep alarm sound.
 * Returns a stop function to silence it.
 * @param {AudioContext} audioCtx
 * @returns {{ stop: () => void }}
 */
export function playAlarmSound(audioCtx) {
  if (!audioCtx) return { stop: () => {} };

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.connect(audioCtx.destination);

  const oscillators = [];
  let stopped = false;

  // Create a repeating beep pattern
  const beepPattern = [
    { start: 0, duration: 0.15, freq: 880 },
    { start: 0.2, duration: 0.15, freq: 880 },
    { start: 0.4, duration: 0.15, freq: 1046 },
  ];

  const createBeepCycle = (offset) => {
    if (stopped) return;
    beepPattern.forEach(({ start, duration, freq }) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const env = audioCtx.createGain();
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + offset + start + 0.01);
      env.gain.setValueAtTime(0.4, audioCtx.currentTime + offset + start + duration - 0.01);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + offset + start + duration);

      osc.connect(env);
      env.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + offset + start);
      osc.stop(audioCtx.currentTime + offset + start + duration + 0.05);
      oscillators.push(osc);
    });
  };

  // Repeat 8 times (about 4 seconds of sound)
  for (let i = 0; i < 8; i++) {
    createBeepCycle(i * 0.7);
  }

  const stop = () => {
    stopped = true;
    oscillators.forEach(osc => {
      try { osc.stop(); } catch (_) { /* already stopped */ }
    });
  };

  return { stop };
}

/**
 * Generate a unique ID for alarms.
 * @returns {string}
 */
export function generateAlarmId() {
  return `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validate alarm form data.
 * @param {{ hours: string|number, minutes: string|number, label: string }} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateAlarm(data) {
  const errors = {};
  const h = parseInt(data.hours, 10);
  const m = parseInt(data.minutes, 10);

  if (isNaN(h) || h < 0 || h > 23) {
    errors.hours = 'Enter hours 0–23';
  }
  if (isNaN(m) || m < 0 || m > 59) {
    errors.minutes = 'Enter minutes 0–59';
  }
  if (data.label && data.label.length > 60) {
    errors.label = 'Label must be 60 characters or less';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
