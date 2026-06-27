import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Search, Settings } from 'lucide-react';
import { S } from './styles';
import { getStoredTimezone, setTimezone as storeSetTimezone } from './api';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ClubPage from './pages/ClubPage';
import PlayerPage from './pages/PlayerPage';
import SearchPage from './pages/SearchPage';
import TimezoneSettings from './components/TimezoneSettings';

export default function App() {
  const location = useLocation();
  const path = location.pathname;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timezone, setTimezoneState] = useState(getStoredTimezone);

  // Listen for timezone changes from settings modal
  function handleTimezoneChange(tz: string) {
    setTimezoneState(tz);
    // Force re-render of children by toggling key
    window.dispatchEvent(new Event('storage'));
  }

  return (
    <div style={S.root}>
      {/* Header */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <Link to="/" style={S.logo}>
            <span style={S.logoText}>
              Foot<span style={S.logoAccent}>core</span>
            </span>
          </Link>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              cursor: 'pointer',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.background = '#2A2A2A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#999';
              e.currentTarget.style.background = 'none';
            }}
            title="Timezone Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={{ ...S.container, ...S.mainContent }}>
        <Routes>
          <Route path="/" element={<HomePage key={timezone} />} />
          <Route path="/match/:id" element={<MatchPage />} />
          <Route path="/club/:id" element={<ClubPage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      {/* Bottom navigation */}
      <nav style={S.bottomNav}>
        <div style={S.bottomNavInner}>
          <Link
            to="/"
            style={{
              ...S.navItem,
              ...(path === '/' ? S.navItemActive : {}),
            }}
          >
            <Home size={22} />
            <span>Home</span>
          </Link>
          <Link
            to="/search"
            style={{
              ...S.navItem,
              ...(path === '/search' ? S.navItemActive : {}),
            }}
          >
            <Search size={22} />
            <span>Search</span>
          </Link>
        </div>
      </nav>

      {/* Timezone Settings Modal */}
      <TimezoneSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onTimezoneChange={handleTimezoneChange}
      />
    </div>
  );
}
