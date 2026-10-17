// src/components/CitySearch.jsx
import React, { useState } from 'react';
import { Search, Plus, Check, X } from 'lucide-react';
import { ALL_CITIES } from '../data/cities';

export function CitySearch({
  isOpen,
  onClose,
  currentCities,
  onAddCity,
  onToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const currentCityIds = new Set(currentCities.map((c) => c.id));

  const filteredCities = ALL_CITIES.filter((item) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      item.city.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.timezone.toLowerCase().includes(q)
    );
  });

  const handleSelect = (city) => {
    if (currentCityIds.has(city.id)) {
      onToast(`${city.city} is already present in your world clocks.`, 'info');
      return;
    }
    onAddCity(city);
    onToast(`Added ${city.city}, ${city.country} to clocks`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Add World Clock</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Search from worldwide cities and time zones
            </p>
          </div>
          <button
            className="btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Search Input */}
        <div style={{ padding: '16px 24px 8px' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search by city or country name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 36 }}
              autoFocus
            />
          </div>
        </div>

        {/* Cities List */}
        <div
          className="modal-body"
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            paddingTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {filteredCities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              No cities found matching "{searchTerm}".
            </div>
          ) : (
            filteredCities.map((c) => {
              const isAdded = currentCityIds.has(c.id);
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isAdded ? 'var(--color-navy-10)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <span style={{ marginRight: 6 }}>{c.flag}</span>
                      {c.city}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.country} &middot; <span style={{ opacity: 0.8 }}>{c.timezone}</span>
                    </div>
                  </div>

                  {isAdded ? (
                    <span
                      className="badge badge-teal"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Check size={12} /> Added
                    </span>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSelect(c)}
                      aria-label={`Add ${c.city}`}
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
