import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { S } from './styles';
import HomePage from './pages/HomePage';
import MatchPage from './pages/MatchPage';
import ClubPage from './pages/ClubPage';
import PlayerPage from './pages/PlayerPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  const location = useLocation();
  const path = location.pathname;

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
        </div>
      </header>

      {/* Main content */}
      <main style={{ ...S.container, ...S.mainContent }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
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
    </div>
  );
}
