// src/components/AnalogClock.jsx
import React, { useEffect, useRef } from 'react';

/**
 * High-performance SVG Analog Clock component.
 * Uses direct DOM ref transforms in requestAnimationFrame to eliminate React re-render thrashing,
 * providing a 60–120 FPS buttery-smooth hand sweep with zero jitter.
 */
export function AnalogClock({
  timezone = 'Asia/Kolkata',
  smoothEnabled = true,
  size = 220,
}) {
  const hourHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const secondHandRef = useRef(null);

  // Generate 60 minute/hour markers (static, calculated once)
  const markers = [];
  for (let i = 0; i < 60; i++) {
    const isHour = i % 5 === 0;
    const angle = i * 6 * (Math.PI / 180);
    const outerR = 90;
    const innerR = isHour ? 78 : 84;
    const x1 = 100 + outerR * Math.sin(angle);
    const y1 = 100 - outerR * Math.cos(angle);
    const x2 = 100 + innerR * Math.sin(angle);
    const y2 = 100 - innerR * Math.cos(angle);

    markers.push(
      <line
        key={`tick-${i}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isHour ? 'var(--clock-numeral, #2F4156)' : 'var(--clock-hand-minute, #567C8D)'}
        strokeWidth={isHour ? 2.5 : 1}
        strokeLinecap="round"
        opacity={isHour ? 0.9 : 0.4}
      />
    );
  }

  // 12 hour numbers (static, calculated once)
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const numberElements = hourNumbers.map((num, idx) => {
    const angle = idx * 30 * (Math.PI / 180);
    const r = 66;
    const x = 100 + r * Math.sin(angle);
    const y = 100 - r * Math.cos(angle) + 4;

    return (
      <text
        key={`num-${num}`}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--clock-numeral, #2F4156)"
        fontSize="9.5"
        fontWeight="600"
        fontFamily="var(--font-display), sans-serif"
      >
        {num}
      </text>
    );
  });

  // Dedicated RAF animation loop updating DOM refs directly
  useEffect(() => {
    let animId;
    let timerId;
    let lastSec = -1;
    let baseH = 0;
    let baseM = 0;
    let baseS = 0;

    let formatter;
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    const updateBaseTime = (date) => {
      try {
        const parts = formatter.formatToParts(date);
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (p.type === 'hour') baseH = parseInt(p.value, 10) % 12;
          else if (p.type === 'minute') baseM = parseInt(p.value, 10);
          else if (p.type === 'second') baseS = parseInt(p.value, 10);
        }
      } catch (_) {
        // fallback to standard date
        baseH = date.getHours() % 12;
        baseM = date.getMinutes();
        baseS = date.getSeconds();
      }
    };

    const updateHandPositions = () => {
      const now = new Date();
      const currentSec = now.getSeconds();

      // Only refresh the timezone parsing when the second changes
      if (currentSec !== lastSec) {
        lastSec = currentSec;
        updateBaseTime(now);
      }

      const ms = smoothEnabled ? now.getMilliseconds() : 0;
      const secondFrac = baseS + (smoothEnabled ? ms / 1000 : 0);
      const minuteFrac = baseM + secondFrac / 60;
      const hourFrac = baseH + minuteFrac / 60;

      const secondAngle = secondFrac * 6;
      const minuteAngle = minuteFrac * 6;
      const hourAngle = hourFrac * 30;

      if (secondHandRef.current) {
        secondHandRef.current.setAttribute('transform', `rotate(${secondAngle} 100 100)`);
      }
      if (minuteHandRef.current) {
        minuteHandRef.current.setAttribute('transform', `rotate(${minuteAngle} 100 100)`);
      }
      if (hourHandRef.current) {
        hourHandRef.current.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
      }
    };

    // Initial render
    updateHandPositions();

    if (smoothEnabled) {
      const loop = () => {
        updateHandPositions();
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    } else {
      timerId = setInterval(updateHandPositions, 1000);
    }

    // Immediately resync on window focus or visibility change
    const onVisibilityChange = () => {
      if (!document.hidden) {
        lastSec = -1; // force re-query
        updateHandPositions();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onVisibilityChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onVisibilityChange);
    };
  }, [timezone, smoothEnabled]);

  return (
    <div className="analog-clock-wrapper" style={{ width: size, height: size }}>
      <svg
        className="analog-clock-svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        aria-label={`Analog clock displaying time in ${timezone}`}
        role="img"
      >
        {/* Outer Ring & Dial Plate */}
        <circle
          cx="100"
          cy="100"
          r="97"
          fill="var(--clock-dial-bg, #FFFFFF)"
          stroke="var(--clock-dial-border, #567C8D)"
          strokeWidth="3"
        />
        <circle
          cx="100"
          cy="100"
          r="94"
          fill="var(--clock-dial-bg, #FFFFFF)"
          stroke="var(--border-light, rgba(200, 217, 230, 0.4))"
          strokeWidth="1"
        />

        {/* Inner subtle rim */}
        <circle
          cx="100"
          cy="100"
          r="91"
          fill="none"
          stroke="var(--border-light, rgba(47, 65, 86, 0.06))"
          strokeWidth="1.5"
        />

        {/* Minute and Hour Ticks */}
        {markers}

        {/* 12-hour Numbers */}
        {numberElements}

        {/* Hour Hand */}
        <line
          ref={hourHandRef}
          x1="100"
          y1="100"
          x2="100"
          y2="54"
          stroke="var(--clock-hand-hour, #2F4156)"
          strokeWidth="4.5"
          strokeLinecap="round"
          style={{ willChange: 'transform' }}
        />

        {/* Minute Hand */}
        <line
          ref={minuteHandRef}
          x1="100"
          y1="100"
          x2="100"
          y2="34"
          stroke="var(--clock-hand-minute, #567C8D)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ willChange: 'transform' }}
        />

        {/* Second Hand (Accent color) */}
        <g ref={secondHandRef} style={{ willChange: 'transform' }}>
          <line
            x1="100"
            y1="116"
            x2="100"
            y2="24"
            stroke="var(--clock-hand-second, #567C8D)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="40" r="2.5" fill="var(--color-sky-blue, #C8D9E6)" />
        </g>

        {/* Center Pivot Pin */}
        <circle cx="100" cy="100" r="5" fill="var(--clock-pivot, #2F4156)" />
        <circle cx="100" cy="100" r="2" fill="var(--clock-dial-bg, #FFFFFF)" />
      </svg>
    </div>
  );
}
