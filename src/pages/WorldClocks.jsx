// src/pages/WorldClocks.jsx
import React from 'react';
import { WorldClockGrid } from '../components/WorldClockGrid';
import { Globe, MapPin, Plus } from 'lucide-react';
import { getUtcOffset } from '../utils/timeUtils';

export function WorldClocks({
  cities,
  setCities,
  now,
  primaryCity,
  setPrimaryCity,
  is24Hour,
  showSeconds,
  searchQuery,
  onOpenAddCity,
  onToast,
  cardDensity,
}) {
  const currentOffset = getUtcOffset(now, primaryCity.timezone);

  return (
    <div className="world-clocks-page">
      {/* Overview Stat Ribbon */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'var(--color-sky-10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-navy)',
            }}
          >
            <Globe size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Primary Reference Clock
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {primaryCity.city}, {primaryCity.country} ({currentOffset})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="badge badge-sky" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <MapPin size={13} style={{ marginRight: 4 }} />
            {cities.length} {cities.length === 1 ? 'City' : 'Cities'} Tracked
          </span>
          <button className="btn btn-primary btn-sm" onClick={onOpenAddCity}>
            <Plus size={15} /> Add City
          </button>
        </div>
      </div>

      {/* Main Grid */}
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
