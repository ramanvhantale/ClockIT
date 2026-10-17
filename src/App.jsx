// src/App.jsx
import React, { useState, useCallback } from 'react';
import { useClock } from './hooks/useClock';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAlarms } from './hooks/useAlarms';
import { INITIAL_CITIES } from './data/cities';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CitySearch } from './components/CitySearch';
import { AlarmDialog } from './components/AlarmDialog';
import { Toast } from './components/Toast';

// Pages
import { Dashboard } from './pages/Dashboard';
import { WorldClocks } from './pages/WorldClocks';
import { Alarms } from './pages/Alarms';
import { Settings } from './pages/Settings';

// Styles
import './styles/global.css';
import './styles/components.css';
import './styles/dashboard.css';

export function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted user preferences
  const [cities, setCities] = useLocalStorage('clockit_cities', INITIAL_CITIES);
  const [primaryCity, setPrimaryCity] = useLocalStorage('clockit_primary_city', INITIAL_CITIES[0]);
  const [is24Hour, setIs24Hour] = useLocalStorage('clockit_is24h', false);
  const [showSeconds, setShowSeconds] = useLocalStorage('clockit_show_seconds', true);
  const [smoothAnimations, setSmoothAnimations] = useLocalStorage('clockit_smooth_anim', true);
  const [soundEnabled, setSoundEnabled] = useLocalStorage('clockit_sound_enabled', true);
  const [cardDensity, setCardDensity] = useLocalStorage('clockit_card_density', 'comfortable');
  const [themeMode, setThemeMode] = useLocalStorage('clockit_theme', 'dual-tone');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('clockit_sidebar_collapsed', false);

  // Apply theme to document element with smooth transition class
  React.useEffect(() => {
    document.documentElement.classList.add('theme-transitioning');
    document.documentElement.setAttribute('data-theme', themeMode);
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 400);
    return () => clearTimeout(timer);
  }, [themeMode]);

  // Toast feedback state
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Synchronized Clock Time Source
  const now = useClock(1000);

  // Alarms management hook
  const {
    alarms,
    ringingAlarm,
    nextAlarm,
    nextAlarmCountdown,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    dismissAlarm,
    snoozeAlarm,
    getAudioContext,
  } = useAlarms(now, soundEnabled, addToast);

  // Add City Handler
  const handleAddCity = (city) => {
    setCities((prev) => [...prev, city]);
  };

  // Reset all preferences to default
  const handleResetDefaults = () => {
    setCities(INITIAL_CITIES);
    setPrimaryCity(INITIAL_CITIES[0]);
    setIs24Hour(false);
    setShowSeconds(true);
    setSmoothAnimations(true);
    setSoundEnabled(true);
    setCardDensity('comfortable');
    setThemeMode('dual-tone');
    setSidebarCollapsed(false);
    addToast('Preferences reset to default values', 'success');
  };

  // Render current active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            now={now}
            primaryCity={primaryCity}
            setPrimaryCity={setPrimaryCity}
            cities={cities}
            setCities={setCities}
            is24Hour={is24Hour}
            showSeconds={showSeconds}
            smoothAnimations={smoothAnimations}
            cardDensity={cardDensity}
            nextAlarm={nextAlarm}
            nextAlarmCountdown={nextAlarmCountdown}
            onOpenAddCity={() => setIsAddCityOpen(true)}
            onOpenAddAlarm={() => setActiveTab('alarms')}
            setActiveTab={setActiveTab}
            onToast={addToast}
            searchQuery={searchQuery}
          />
        );
      case 'world-clocks':
        return (
          <WorldClocks
            cities={cities}
            setCities={setCities}
            now={now}
            primaryCity={primaryCity}
            setPrimaryCity={setPrimaryCity}
            is24Hour={is24Hour}
            showSeconds={showSeconds}
            searchQuery={searchQuery}
            onOpenAddCity={() => setIsAddCityOpen(true)}
            onToast={addToast}
            cardDensity={cardDensity}
          />
        );
      case 'alarms':
        return (
          <Alarms
            now={now}
            alarms={alarms}
            addAlarm={addAlarm}
            updateAlarm={updateAlarm}
            deleteAlarm={deleteAlarm}
            toggleAlarm={toggleAlarm}
            nextAlarm={nextAlarm}
            nextAlarmCountdown={nextAlarmCountdown}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            is24Hour={is24Hour}
            primeAudio={getAudioContext}
          />
        );
      case 'settings':
        return (
          <Settings
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            is24Hour={is24Hour}
            setIs24Hour={setIs24Hour}
            showSeconds={showSeconds}
            setShowSeconds={setShowSeconds}
            smoothAnimations={smoothAnimations}
            setSmoothAnimations={setSmoothAnimations}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            primaryCity={primaryCity}
            setPrimaryCity={setPrimaryCity}
            cardDensity={cardDensity}
            setCardDensity={setCardDensity}
            onResetDefaults={handleResetDefaults}
            primeAudio={getAudioContext}
            onToast={addToast}
          />
        );
      default:
        return (
          <div className="card empty-state">
            <h2 className="empty-state-title">Page Not Found</h2>
            <p className="empty-state-desc">The requested section does not exist.</p>
            <button className="btn btn-primary" onClick={() => setActiveTab('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`app-wrapper ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        now={now}
        primaryCity={primaryCity}
        is24Hour={is24Hour}
      />

      {/* Main View Area */}
      <div className={`main-area ${sidebarCollapsed ? 'sidebar-hidden' : ''}`}>
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          now={now}
          primaryTimezone={primaryCity.timezone}
          is24Hour={is24Hour}
          setIs24Hour={setIs24Hour}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddCity={() => setIsAddCityOpen(true)}
        />

        {/* Page Content */}
        <main
          className={`page-content ${cardDensity === 'compact' ? 'density-compact' : 'density-comfortable'}`}
          id="main-content"
        >
          {renderContent()}
        </main>
      </div>

      {/* City Search Modal */}
      <CitySearch
        isOpen={isAddCityOpen}
        onClose={() => setIsAddCityOpen(false)}
        currentCities={cities}
        onAddCity={handleAddCity}
        onToast={addToast}
      />

      {/* Ringing Alarm Alert Dialog */}
      <AlarmDialog
        alarm={ringingAlarm}
        onDismiss={dismissAlarm}
        onSnooze={snoozeAlarm}
        is24Hour={is24Hour}
      />

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
