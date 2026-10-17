import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, Settings } from 'lucide-react';
import { formatDate } from '../utils/timeUtils';

export function Header({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  now,
  primaryTimezone,
  is24Hour,
  setIs24Hour,
  searchQuery,
  setSearchQuery,
  onOpenAddCity,
}) {
  const titles = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Real-time overview of world time zones and alerts',
    },
    'world-clocks': {
      title: 'World Clocks',
      subtitle: 'Compare time zones across international cities',
    },
    alarms: {
      title: 'Alarms',
      subtitle: 'Manage local and scheduled time alerts',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize display preferences and audio controls',
    },
  };

  const current = titles[activeTab] || titles.dashboard;
  const { dayName, fullDate } = formatDate(now, primaryTimezone);

  return (
    <header className="header">
      {/* Navigation Panel Toggle Button (Desktop & Mobile) */}
      <button
        className={`header-nav-toggle-btn ${sidebarCollapsed ? 'is-collapsed' : ''}`}
        onClick={() => {
          if (window.innerWidth <= 1024) {
            setMobileOpen(!mobileOpen);
          } else {
            setSidebarCollapsed(!sidebarCollapsed);
          }
        }}
        title={sidebarCollapsed ? 'Show navigation panel' : 'Hide navigation panel (maximize dashboard)'}
        aria-label="Toggle navigation panel"
      >
        {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>

      {/* Title Area */}
      <div className="header-title-area">
        <h1 className="header-title">{current.title}</h1>
        <p className="header-subtitle">{current.subtitle}</p>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Date Display */}
        <span className="header-date">
          {dayName}, {fullDate}
        </span>

        {/* Search Field */}
        <div className="header-search">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            className="input-field"
            placeholder="Search cities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (activeTab !== 'world-clocks' && activeTab !== 'dashboard') {
                setActiveTab('world-clocks');
              }
            }}
          />
        </div>

        {/* 12 / 24 Hour Toggle */}
        <div className="format-toggle-btn" role="group" aria-label="Time format toggle">
          <button
            className={!is24Hour ? 'active' : ''}
            onClick={() => setIs24Hour(false)}
            aria-pressed={!is24Hour}
          >
            12H
          </button>
          <button
            className={is24Hour ? 'active' : ''}
            onClick={() => setIs24Hour(true)}
            aria-pressed={is24Hour}
          >
            24H
          </button>
        </div>

        {/* Settings Shortcut */}
        <button
          className="btn-icon btn-ghost"
          onClick={() => setActiveTab('settings')}
          title="Open Settings"
          aria-label="Open Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
