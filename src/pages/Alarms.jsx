// src/pages/Alarms.jsx
import React, { useState } from 'react';
import { Plus, Bell, Volume2, VolumeX, Clock } from 'lucide-react';
import { AlarmCard } from '../components/AlarmCard';
import { AlarmForm } from '../components/AlarmForm';
import { formatAlarmTime } from '../utils/timeUtils';

export function Alarms({
  now,
  alarms,
  addAlarm,
  updateAlarm,
  deleteAlarm,
  toggleAlarm,
  nextAlarm,
  nextAlarmCountdown,
  soundEnabled,
  setSoundEnabled,
  is24Hour,
  primeAudio,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);

  const handleOpenAdd = () => {
    setEditingAlarm(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (alarm) => {
    setEditingAlarm(alarm);
    setIsFormOpen(true);
  };

  const handleSave = (alarmData) => {
    if (editingAlarm) {
      updateAlarm(editingAlarm.id, alarmData);
    } else {
      addAlarm(alarmData);
    }
  };

  return (
    <div className="alarms-section">
      {/* ─── Header Action Strip ─── */}
      <div className="section-header">
        <div className="section-header-left">
          <h2 className="section-title">Alarms &amp; Scheduled Alerts</h2>
          <p className="section-subtitle">
            Accurate browser alarms with snooze, label management, and audio playback
          </p>
        </div>

        <div className="section-header-right">
          {/* Sound Toggle */}
          <button
            className={`btn btn-sm ${soundEnabled ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => {
              primeAudio();
              setSoundEnabled(!soundEnabled);
            }}
            title={soundEnabled ? 'Alarm sounds enabled' : 'Alarm sounds muted'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Add Alarm Button */}
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={15} /> Add Alarm
          </button>
        </div>
      </div>

      {/* ─── Upcoming Alarm Banner ─── */}
      {nextAlarm ? (
        <div className="next-alarm-banner">
          <div className="next-alarm-icon">
            <Bell size={24} />
          </div>
          <div className="next-alarm-info">
            <div className="next-alarm-label">Next Alarm</div>
            <div className="next-alarm-time">
              {formatAlarmTime(nextAlarm.hours, nextAlarm.minutes, is24Hour)} &mdash;{' '}
              {nextAlarm.label}
            </div>
            <div className="next-alarm-countdown">
              Rings in {nextAlarmCountdown}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          <Clock size={18} color="var(--color-teal)" />
          <span>No upcoming alarms scheduled. Enable or add an alarm below.</span>
        </div>
      )}

      {/* ─── Alarms Grid or Empty State ─── */}
      {alarms.length === 0 ? (
        <div className="card empty-state">
          <Bell className="empty-state-icon" />
          <h3 className="empty-state-title">No alarms configured</h3>
          <p className="empty-state-desc">
            Stay on track throughout your day by setting personalized alarms.
          </p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add First Alarm
          </button>
        </div>
      ) : (
        <div className="alarms-grid">
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              now={now}
              is24Hour={is24Hour}
              onToggle={toggleAlarm}
              onEdit={handleOpenEdit}
              onDelete={deleteAlarm}
            />
          ))}
        </div>
      )}

      {/* ─── Add/Edit Modal Form ─── */}
      <AlarmForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        editingAlarm={editingAlarm}
        is24Hour={is24Hour}
        primeAudio={primeAudio}
      />
    </div>
  );
}
