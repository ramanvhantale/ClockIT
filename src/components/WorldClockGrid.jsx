// src/components/WorldClockGrid.jsx
import React, { useState } from 'react';
import { Plus, ArrowUpDown, Globe2, RotateCcw } from 'lucide-react';
import { WorldClockCard } from './WorldClockCard';
import { INITIAL_CITIES } from '../data/cities';

export function WorldClockGrid({
  cities,
  setCities,
  now,
  primaryCity,
  setPrimaryCity,
  is24Hour,
  showSeconds,
  searchQuery = '',
  onOpenAddCity,
  onToast,
  density = 'comfortable',
}) {
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'name' | 'time'

  // Filter based on search query
  const filtered = cities.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.timezone.toLowerCase().includes(q)
    );
  });

  // Sort cities
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.city.localeCompare(b.city);
    }
    if (sortBy === 'time') {
      // Sort by UTC hours offset
      const getOffset = (tz) => {
        try {
          const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            timeZoneName: 'shortOffset',
          }).formatToParts(now);
          const tzName = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
          const match = tzName.match(/([+-]\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        } catch {
          return 0;
        }
      };
      return getOffset(a.timezone) - getOffset(b.timezone);
    }
    return 0; // default order
  });

  const handleRemoveCity = (cityId) => {
    // If removing primary city, select another city as primary if available
    const remaining = cities.filter((c) => c.id !== cityId);
    setCities(remaining);
    if (primaryCity.id === cityId && remaining.length > 0) {
      setPrimaryCity(remaining[0]);
    }
    onToast('City removed', 'info');
  };

  const handleRestoreDefaults = () => {
    setCities(INITIAL_CITIES);
    setPrimaryCity(INITIAL_CITIES[0]);
    onToast('Restored default world cities', 'success');
  };

  return (
    <div className="world-clocks-section">
      {/* Section Controls */}
      <div className="section-header">
        <div className="section-header-left">
          <h2 className="section-title">World Clocks</h2>
          <p className="section-subtitle">
            Synchronized global time zones with day/night awareness
          </p>
        </div>

        <div className="section-header-right">
          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpDown size={15} color="var(--text-secondary)" />
            <select
              className="input-field"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort world clocks"
            >
              <option value="default">Default Order</option>
              <option value="name">Sort by Name</option>
              <option value="time">Sort by Time Zone</option>
            </select>
          </div>

          {/* Add City Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onOpenAddCity}
            aria-label="Add new city"
          >
            <Plus size={15} /> Add City
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {sorted.length === 0 ? (
        <div className="card empty-state">
          <Globe2 className="empty-state-icon" />
          <h3 className="empty-state-title">
            {cities.length === 0
              ? 'No world clocks added yet'
              : `No cities match "${searchQuery}"`}
          </h3>
          <p className="empty-state-desc">
            {cities.length === 0
              ? 'Keep track of business hours and friends across the globe by adding their cities.'
              : 'Try searching for a different city or clear your search filter.'}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={onOpenAddCity}>
              <Plus size={16} /> Add City
            </button>
            {cities.length === 0 && (
              <button className="btn btn-secondary" onClick={handleRestoreDefaults}>
                <RotateCcw size={16} /> Restore Initial Cities
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="world-clocks-grid">
          {sorted.map((city) => (
            <WorldClockCard
              key={city.id}
              city={city}
              now={now}
              primaryCity={primaryCity}
              is24Hour={is24Hour}
              showSeconds={showSeconds}
              isPrimary={city.id === primaryCity.id}
              onSetPrimary={(c) => {
                setPrimaryCity(c);
                onToast(`Primary clock set to ${c.city}`, 'success');
              }}
              onRemove={handleRemoveCity}
              density={density}
            />
          ))}
        </div>
      )}
    </div>
  );
}
