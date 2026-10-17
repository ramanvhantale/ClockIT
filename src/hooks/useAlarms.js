// src/hooks/useAlarms.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { playAlarmSound, generateAlarmId } from '../utils/alarmUtils';
import { minutesUntilAlarm, formatCountdown } from '../utils/timeUtils';

const DEFAULT_ALARMS = [
  {
    id: 'alarm_default_1',
    hours: 7,
    minutes: 0,
    label: 'Morning Focus & Exercise',
    enabled: true,
  },
  {
    id: 'alarm_default_2',
    hours: 13,
    minutes: 30,
    label: 'Daily Standup / Meeting',
    enabled: true,
  },
  {
    id: 'alarm_default_3',
    hours: 22,
    minutes: 0,
    label: 'Evening Review & Wind Down',
    enabled: false,
  },
];

export function useAlarms(now, soundEnabled = true, onToast = () => {}) {
  const [alarms, setAlarms] = useLocalStorage('clockit_alarms', DEFAULT_ALARMS);
  const [ringingAlarm, setRingingAlarm] = useState(null);

  // References to keep track of audio playback & trigger deduplication
  const audioCtxRef = useRef(null);
  const currentSoundRef = useRef(null);
  const lastTriggeredRef = useRef({}); // Map of alarmId -> "YYYY-MM-DD-HH-mm"

  // Ensure AudioContext is ready upon user interaction
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Stop active ringing sound
  const stopSound = useCallback(() => {
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current = null;
    }
  }, []);

  // Trigger ringing for an alarm
  const triggerAlarm = useCallback((alarm) => {
    setRingingAlarm(alarm);
    if (soundEnabled) {
      try {
        const ctx = getAudioContext();
        stopSound();
        currentSoundRef.current = playAlarmSound(ctx);
      } catch (err) {
        console.warn('Audio playback error (browser user-interaction required):', err);
      }
    }
  }, [soundEnabled, getAudioContext, stopSound]);

  // Dismiss ringing alarm
  const dismissAlarm = useCallback(() => {
    stopSound();
    setRingingAlarm(null);
    onToast('Alarm dismissed', 'info');
  }, [stopSound, onToast]);

  // Snooze ringing alarm for 5 minutes
  const snoozeAlarm = useCallback(() => {
    if (!ringingAlarm) return;
    stopSound();

    const snoozedUntil = Date.now() + 5 * 60 * 1000;
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === ringingAlarm.id ? { ...a, snoozedUntil } : a
      )
    );

    setRingingAlarm(null);
    onToast('Snoozed for 5 minutes', 'info');
  }, [ringingAlarm, stopSound, setAlarms, onToast]);

  // Check alarms every time `now` updates (every second)
  useEffect(() => {
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentS = now.getSeconds();
    const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${currentH}-${currentM}`;

    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;

      // 1. Check if snoozed
      if (alarm.snoozedUntil) {
        if (Date.now() >= alarm.snoozedUntil) {
          // Clear snooze and trigger
          setAlarms((prev) =>
            prev.map((a) =>
              a.id === alarm.id ? { ...a, snoozedUntil: null } : a
            )
          );
          triggerAlarm(alarm);
        }
        return;
      }

      // 2. Check regular daily alarm
      const matchesTime = alarm.hours === currentH && alarm.minutes === currentM;
      if (matchesTime) {
        // Trigger only once per matching minute
        if (lastTriggeredRef.current[alarm.id] !== dateKey) {
          lastTriggeredRef.current[alarm.id] = dateKey;
          triggerAlarm(alarm);
        }
      }
    });
  }, [now, alarms, triggerAlarm, setAlarms]);

  // CRUD actions
  const addAlarm = useCallback(({ hours, minutes, label, enabled = true }) => {
    const newAlarm = {
      id: generateAlarmId(),
      hours: Number(hours),
      minutes: Number(minutes),
      label: label?.trim() || 'Alarm',
      enabled: Boolean(enabled),
    };
    setAlarms((prev) => [...prev, newAlarm]);
    onToast('Alarm added successfully', 'success');
    return newAlarm;
  }, [setAlarms, onToast]);

  const updateAlarm = useCallback((id, updatedFields) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    onToast('Alarm updated', 'success');
  }, [setAlarms, onToast]);

  const deleteAlarm = useCallback((id) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
    if (ringingAlarm?.id === id) {
      dismissAlarm();
    }
    onToast('Alarm deleted', 'info');
  }, [setAlarms, ringingAlarm, dismissAlarm, onToast]);

  const toggleAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextState = !a.enabled;
          onToast(nextState ? 'Alarm enabled' : 'Alarm disabled', 'info');
          return { ...a, enabled: nextState, snoozedUntil: null };
        }
        return a;
      })
    );
  }, [setAlarms, onToast]);

  // Compute next upcoming alarm
  const enabledAlarms = alarms.filter((a) => a.enabled);
  let nextAlarm = null;
  let minMinutes = Infinity;

  enabledAlarms.forEach((alarm) => {
    let diff;
    if (alarm.snoozedUntil && alarm.snoozedUntil > Date.now()) {
      diff = Math.max(1, Math.round((alarm.snoozedUntil - Date.now()) / 60000));
    } else {
      diff = minutesUntilAlarm(alarm.hours, alarm.minutes, now);
    }

    if (diff < minMinutes) {
      minMinutes = diff;
      nextAlarm = alarm;
    }
  });

  const nextAlarmCountdown = nextAlarm ? formatCountdown(minMinutes) : null;

  return {
    alarms,
    ringingAlarm,
    nextAlarm,
    nextAlarmCountdown,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissAlarm,
    snoozeAlarm,
    getAudioContext,
  };
}
