// src/components/Sidebar.jsx
import React from 'react';
import {
  LayoutDashboard,
  Globe,
  AlarmClock,
  Settings,
  X,
  Clock as ClockIcon,
  ChevronLeft
} from 'lucide-react';
import { formatTime, formatDate } from '../utils/timeUtils';

export function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  sidebarCollapsed = false,
  setSidebarCollapsed = () => {},
  now,
  primaryCity,
  is24Hour,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'world-clocks', label: 'World Clocks', icon: Globe },
    { id: 'alarms', label: 'Alarms', icon: AlarmClock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (mobileOpen) setMobileOpen(false);
  };

  const { hours, minutes } = formatTime(now, primaryCity.timezone, is24Hour, false);
  const { day, month } = formatDate(now, primaryCity.timezone);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo and Brand */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <ClockIcon size={20} color="#FFFFFF" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">ClockIT</span>
            <span className="sidebar-logo-tagline">Time Management</span>
          </div>

          {/* Desktop Collapse Button */}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(true)}
            title="Hide navigation panel (make dashboard big)"
            aria-label="Hide navigation panel"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Mobile Close Button */}
          {mobileOpen && (
            <button
              className="btn-icon"
              style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.7)' }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="nav-icon" size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Mini Time Widget in Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-time-widget">
            <div className="sidebar-time-label">{primaryCity.city} Time</div>
            <div className="sidebar-time-value">
              {hours}:{minutes}
            </div>
            <div className="sidebar-date-value">
              {day} {month}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
