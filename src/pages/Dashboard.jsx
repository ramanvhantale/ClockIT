// src/pages/Dashboard.jsx
import React from 'react';
import { WorldClockGrid } from '../components/WorldClockGrid';
import { LiveClockCard } from '../components/LiveClockCard';
import { Bell, ArrowRight, Clock } from 'lucide-react';
import { formatAlarmTime } from '../utils/timeUtils';
import { ALL_CITIES } from '../data/cities';
import { useLocalStorage } from '../hooks/useLocalStorage';

const DEFAULT_COMPANION_IDS = ['europe-london', 'america-new_york', 'asia-tokyo'];

export function Dashboard({
  now,
  primaryCity,
  setPrimaryCity,
  cities,
  setCities,
  is24Hour,
  showSeconds,
  smoothAnimations,
  cardDensity,
  nextAlarm,
  nextAlarmCountdown,
  onOpenAddCity,
  onOpenAddAlarm,
  setActiveTab,
  onToast,
  searchQuery,
}) {
  // Persist companion cities for the 3 additional live clocks on the home dashboard
  const [companionIds, setCompanionIds] = useLocalStorage(
    'clockit_companion_cities',
    DEFAULT_COMPANION_IDS
  );

  // Resolve the 3 companion city objects, ensuring none duplicate the primary city
  const resolvedCompanions = companionIds.map((id, index) => {
    // If companion matches primaryCity, substitute another city
    if (id === primaryCity.id) {
      const fallback =
        cities.find((c) => c.id !== primaryCity.id && !companionIds.includes(c.id)) ||
        ALL_CITIES.find((c) => c.id !== primaryCity.id && !companionIds.includes(c.id)) ||
        ALL_CITIES[(index + 1) % ALL_CITIES.length];
      return fallback;
    }
    return ALL_CITIES.find((c) => c.id === id) || ALL_CITIES[index % ALL_CITIES.length];
  });

  // Switch a companion city to become the Primary Clock
  const handleSwitchPrimary = (companionCity, index) => {
    const oldPrimary = primaryCity;
    setPrimaryCity(companionCity);
    // Put old primary in the companion's slot so all 4 remain distinct
    setCompanionIds((prev) => {
      const next = [...prev];
      next[index] = oldPrimary.id;
      return next;
    });
    onToast(`Primary clock set to ${companionCity.city}`, 'success');
  };

  // Change which city is displayed in one of the 3 companion live clocks
  const handleUpdateCompanion = (index, newCity) => {
    if (newCity.id === primaryCity.id) {
      onToast(`${newCity.city} is already the Primary Clock`, 'info');
      return;
    }
    setCompanionIds((prev) => {
      const next = [...prev];
      next[index] = newCity.id;
      return next;
    });
    onToast(`Updated clock to ${newCity.city}`, 'success');
  };

  return (
    <div className="dashboard-page">
      {/* ─── Featured Live Clocks Showcase (Primary Clock + 3 Live Clocks) ─── */}
      <section className="live-clocks-showcase">
        <div className="live-clocks-header">
          <div>
            <h2 className="section-title" style={{ marginBottom: 2 }}>
              Featured Live Clocks
            </h2>
            <p className="section-subtitle">
              Synchronized live analog &amp; digital clocks: Primary reference &amp; global cities
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="live-dot" title="Live synchronized time" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              4 Live Clocks Active
            </span>
          </div>
        </div>

        <div className="live-clocks-grid">
          {/* Clock 1: Primary Reference Clock */}
          <LiveClockCard
            city={primaryCity}
            now={now}
            isPrimary={true}
            primaryCity={primaryCity}
            is24Hour={is24Hour}
            showSeconds={showSeconds}
            smoothAnimations={smoothAnimations}
            onSetPrimary={() => {}}
            availableCities={ALL_CITIES}
          />

          {/* Clocks 2, 3, 4: Three Additional Live Clocks Beside Current Clock */}
          {resolvedCompanions.map((compCity, idx) => (
            <LiveClockCard
              key={`${compCity.id}_${idx}`}
              city={compCity}
              now={now}
              isPrimary={false}
              primaryCity={primaryCity}
              is24Hour={is24Hour}
              showSeconds={showSeconds}
              smoothAnimations={smoothAnimations}
              onSetPrimary={(c) => handleSwitchPrimary(c, idx)}
              onChangeCity={(newCity) => handleUpdateCompanion(idx, newCity)}
              availableCities={ALL_CITIES}
            />
          ))}
        </div>
      </section>

      {/* ─── Next Alarm Countdown Banner (if an enabled alarm exists) ─── */}
      {nextAlarm && (
        <div className="next-alarm-banner">
          <div className="next-alarm-icon">
            <Bell size={22} />
          </div>
          <div className="next-alarm-info">
            <div className="next-alarm-label">Upcoming Alert</div>
            <div className="next-alarm-time">
              {formatAlarmTime(nextAlarm.hours, nextAlarm.minutes, is24Hour)} &mdash;{' '}
              {nextAlarm.label}
            </div>
            <div className="next-alarm-countdown">
              Rings in {nextAlarmCountdown}
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('alarms')}
            style={{ marginLeft: 'auto' }}
          >
            Manage Alarms <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ─── World Clocks Grid ─── */}
      <WorldClockGrid
        cities={cities}
        setCities={setCities}
        now={now}
        primaryCity={primaryCity}
        setPrimaryCity={setPrimaryCity}
        is24Hour={is24Hour}
        showSeconds={showSeconds}
        searchQuery={searchQuery}
        onOpenAddCity={onOpenAddCity}
        onToast={onToast}
        density={cardDensity}
      />
    </div>
  );
}
