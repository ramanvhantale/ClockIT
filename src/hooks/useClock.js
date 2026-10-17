// src/hooks/useClock.js
import { useState, useEffect } from 'react';

/**
 * Custom hook providing a synchronized current Date instance,
 * updating every second and immediately resyncing on tab visibility change.
 * @param {number} updateInterval Interval in milliseconds (default: 1000ms)
 * @returns {Date} Current Date object
 */
export function useClock(updateInterval = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Initial sync
    setNow(new Date());

    const intervalId = setInterval(() => {
      setNow(new Date());
    }, updateInterval);

    // Resync immediately when tab becomes visible after backgrounding
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setNow(new Date());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [updateInterval]);

  return now;
}

/**
 * Specialized hook for analog clock smooth hand animation using requestAnimationFrame.
 * When enabled is false, it steps discretely by second.
 * @param {string} timezone IANA timezone string
 * @param {boolean} smoothEnabled Whether to use continuous smooth second-hand rotation
 * @returns {{ hourAngle: number, minuteAngle: number, secondAngle: number }}
 */
export function useAnalogClockAngles(timezone, smoothEnabled = true) {
  const [angles, setAngles] = useState(() => calculateAngles(new Date(), timezone, smoothEnabled));

  useEffect(() => {
    let animationFrameId;
    let intervalId;

    if (smoothEnabled) {
      const render = () => {
        setAngles(calculateAngles(new Date(), timezone, true));
        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
    } else {
      setAngles(calculateAngles(new Date(), timezone, false));
      intervalId = setInterval(() => {
        setAngles(calculateAngles(new Date(), timezone, false));
      }, 1000);
    }

    const handleVisibility = () => {
      if (!document.hidden) {
        setAngles(calculateAngles(new Date(), timezone, smoothEnabled));
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [timezone, smoothEnabled]);

  return angles;
}

function calculateAngles(date, timezone, smooth) {
  try {
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

    const ms = smooth ? date.getMilliseconds() : 0;
    const secondFraction = s + (smooth ? ms / 1000 : 0);
    const minuteFraction = m + secondFraction / 60;
    const hourFraction = h + minuteFraction / 60;

    return {
      secondAngle: secondFraction * 6, // 360 / 60 = 6 deg/sec
      minuteAngle: minuteFraction * 6, // 360 / 60 = 6 deg/min
      hourAngle: hourFraction * 30,    // 360 / 12 = 30 deg/hour
    };
  } catch (err) {
    console.error('Error calculating clock angles:', err);
    return { hourAngle: 0, minuteAngle: 0, secondAngle: 0 };
  }
}
