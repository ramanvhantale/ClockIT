// src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  RotateCcw,
  Volume2,
  Play,
  Square,
  Sun,
  Moon,
  Contrast,
  Check
} from 'lucide-react';
import { ALL_CITIES } from '../data/cities';
import { playAlarmSound } from '../utils/alarmUtils';

export function Settings({
  themeMode,
  setThemeMode,
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  is24Hour,
  setIs24Hour,
  showSeconds,
  setShowSeconds,
  smoothAnimations,
  setSmoothAnimations,
  soundEnabled,
  setSoundEnabled,
  primaryCity,
  setPrimaryCity,
  cardDensity,
  setCardDensity,
  onResetDefaults,
  primeAudio,
  onToast = () => {},
}) {
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);
  const [activeSoundStopper, setActiveSoundStopper] = useState(null);

  const handleTestSound = () => {
    if (isPlayingTestSound && activeSoundStopper) {
      activeSoundStopper.stop();
      setIsPlayingTestSound(false);
      setActiveSoundStopper(null);
      return;
    }

    try {
      const ctx = primeAudio();
      if (!ctx) {
        onToast('AudioContext not supported by your browser', 'error');
        return;
      }
      const sound = playAlarmSound(ctx);
      setActiveSoundStopper(sound);
      setIsPlayingTestSound(true);
      onToast('Playing alarm chime preview...', 'info');

      // Automatically reset after 4 seconds
      setTimeout(() => {
        setIsPlayingTestSound(false);
        setActiveSoundStopper(null);
      }, 4000);
    } catch (err) {
      console.warn('Audio test error:', err);
      onToast('Click anywhere on the screen first to grant audio permission', 'info');
    }
  };

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    const names = {
      'dual-tone': 'Dual Tone (Navy & Beige)',
      light: 'Light Mode',
      dark: 'Dark Mode',
    };
    onToast(`Theme set to ${names[mode]}`, 'success');
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <div className="section-header-left">
          <h2 className="section-title">Application Settings</h2>
          <p className="section-subtitle">
            Configure visual themes, clock precision, auditory feedback, and layout density
          </p>
        </div>

        <div className="section-header-right">
          <button className="btn btn-secondary btn-sm" onClick={onResetDefaults}>
            <RotateCcw size={14} /> Reset Defaults
          </button>
        </div>
      </div>

      {/* ─── Group 1: Appearance & Theme ─── */}
      <div className="settings-group">
        <div className="settings-group-title">Theme &amp; Appearance</div>

        {/* Theme Mode: Dual Tone / Light / Dark */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Dashboard Theme</div>
            <div className="settings-row-desc">
              Select between our signature Dual-Tone palette, crisp Light mode, or sleek Dark mode
            </div>
          </div>
          <div className="settings-row-control">
            <div className="format-toggle-btn" style={{ height: 'auto', padding: '3px' }}>
              <button
                type="button"
                className={themeMode === 'dual-tone' ? 'active' : ''}
                onClick={() => handleThemeChange('dual-tone')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px' }}
                title="Dual Tone: Navy sidebar with warm Beige canvas and White cards"
              >
                <Contrast size={14} /> Dual Tone
              </button>
              <button
                type="button"
                className={themeMode === 'light' ? 'active' : ''}
                onClick={() => handleThemeChange('light')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px' }}
                title="Light Mode: Bright minimalist layout"
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                className={themeMode === 'dark' ? 'active' : ''}
                onClick={() => handleThemeChange('dark')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px' }}
                title="Dark Mode: Deep navy slate for low-light environments"
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
        </div>

        {/* Clock Card Density */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Card Spacing &amp; Density</div>
            <div className="settings-row-desc">
              Comfortable gives generous whitespace, while Compact condenses cards for denser layouts
            </div>
          </div>
          <div className="settings-row-control">
            <div className="format-toggle-btn">
              <button
                className={cardDensity === 'comfortable' ? 'active' : ''}
                onClick={() => {
                  setCardDensity('comfortable');
                  onToast('Card density set to Comfortable', 'info');
                }}
              >
                Comfortable
              </button>
              <button
                className={cardDensity === 'compact' ? 'active' : ''}
                onClick={() => {
                  setCardDensity('compact');
                  onToast('Card density set to Compact', 'info');
                }}
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar Panel Visibility */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Navigation Panel Visibility</div>
            <div className="settings-row-desc">
              Hide sidebar navigation to maximize dashboard width and expand clock layouts
            </div>
          </div>
          <div className="settings-row-control">
            <div className="format-toggle-btn">
              <button
                className={!sidebarCollapsed ? 'active' : ''}
                onClick={() => {
                  setSidebarCollapsed(false);
                  onToast('Navigation panel visible', 'info');
                }}
              >
                Expanded
              </button>
              <button
                className={sidebarCollapsed ? 'active' : ''}
                onClick={() => {
                  setSidebarCollapsed(true);
                  onToast('Navigation panel hidden (Dashboard expanded)', 'success');
                }}
              >
                Hidden (Max Dashboard)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Group 2: Time & Precision ─── */}
      <div className="settings-group">
        <div className="settings-group-title">Time &amp; Clock Precision</div>

        {/* 12-hour vs 24-hour */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Time Format</div>
            <div className="settings-row-desc">
              Choose between 12-hour (with AM/PM) or 24-hour military clock display across all views
            </div>
          </div>
          <div className="settings-row-control">
            <div className="format-toggle-btn">
              <button
                className={!is24Hour ? 'active' : ''}
                onClick={() => {
                  setIs24Hour(false);
                  onToast('Switched to 12-Hour format', 'info');
                }}
              >
                12H
              </button>
              <button
                className={is24Hour ? 'active' : ''}
                onClick={() => {
                  setIs24Hour(true);
                  onToast('Switched to 24-Hour format', 'info');
                }}
              >
                24H
              </button>
            </div>
          </div>
        </div>

        {/* Show or Hide Seconds */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Show Seconds Display</div>
            <div className="settings-row-desc">
              Toggle the live seconds numerals on digital clocks and world clock cards
            </div>
          </div>
          <div className="settings-row-control">
            <label className="toggle">
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => {
                  setShowSeconds(e.target.checked);
                  onToast(e.target.checked ? 'Seconds enabled' : 'Seconds hidden', 'info');
                }}
                aria-label="Toggle show seconds"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </label>
          </div>
        </div>

        {/* Smooth Clock Animation */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Smooth Analog Sweeping</div>
            <div className="settings-row-desc">
              Continuous 60 FPS second-hand sweep via requestAnimationFrame (turn off for 1-second discrete stepping)
            </div>
          </div>
          <div className="settings-row-control">
            <label className="toggle">
              <input
                type="checkbox"
                checked={smoothAnimations}
                onChange={(e) => {
                  setSmoothAnimations(e.target.checked);
                  onToast(e.target.checked ? 'Smooth sweeping enabled' : 'Discrete 1-second stepping enabled', 'info');
                }}
                aria-label="Toggle smooth clock animations"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ─── Group 3: Audio & Alerts ─── */}
      <div className="settings-group">
        <div className="settings-group-title">Audio &amp; Synthesizer Alerts</div>

        {/* Alarm Sounds */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Alarm Sound Effects</div>
            <div className="settings-row-desc">
              Play Web Audio API synthesizer chimes when an alarm fires
            </div>
          </div>
          <div className="settings-row-control">
            <label className="toggle">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  primeAudio();
                  setSoundEnabled(e.target.checked);
                  onToast(e.target.checked ? 'Alarm sounds enabled' : 'Alarm sounds muted', 'info');
                }}
                aria-label="Toggle alarm sounds"
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </label>
          </div>
        </div>

        {/* Audio Test Preview Button */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Test Alarm Audio</div>
            <div className="settings-row-desc">
              Preview the Web Audio synthesizer chime to test browser audio output
            </div>
          </div>
          <div className="settings-row-control">
            <button
              className={`btn btn-sm ${isPlayingTestSound ? 'btn-danger' : 'btn-secondary'}`}
              onClick={handleTestSound}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              {isPlayingTestSound ? (
                <>
                  <Square size={13} /> Stop Audio
                </>
              ) : (
                <>
                  <Play size={13} /> Test Chime
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Group 4: Location & Time Zone Reference ─── */}
      <div className="settings-group">
        <div className="settings-group-title">Primary Reference Time Zone</div>

        {/* Primary City Dropdown */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Primary Reference City</div>
            <div className="settings-row-desc">
              The benchmark clock used for all time difference calculations and sidebar widgets
            </div>
          </div>
          <div className="settings-row-control">
            <select
              className="input-field"
              style={{ width: 'auto', minWidth: '200px' }}
              value={primaryCity.id}
              onChange={(e) => {
                const found = ALL_CITIES.find((c) => c.id === e.target.value);
                if (found) {
                  setPrimaryCity(found);
                  onToast(`Primary city set to ${found.city}, ${found.country}`, 'success');
                }
              }}
              aria-label="Select primary city"
            >
              {ALL_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.flag} {c.city}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
