import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LEAGUES, leagueLogoUrl, type LeagueMeta } from '../api';
import { colors } from '../styles';
import { Search, Trophy } from 'lucide-react';

const REGION_ORDER = ['International', 'Top Europe', 'Other Europe', 'Americas', 'Asia'];

export default function LeaguesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return LEAGUES;
    return LEAGUES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, LeagueMeta[]> = {};
    for (const league of filtered) {
      if (!groups[league.region]) groups[league.region] = [];
      groups[league.region].push(league);
    }
    // Sort groups by REGION_ORDER
    const sorted: [string, LeagueMeta[]][] = [];
    for (const region of REGION_ORDER) {
      if (groups[region]) sorted.push([region, groups[region]]);
    }
    // Add any remaining regions
    for (const region of Object.keys(groups)) {
      if (!REGION_ORDER.includes(region)) sorted.push([region, groups[region]]);
    }
    return sorted;
  }, [filtered]);

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textMuted,
          }}
        />
        <input
          type="text"
          placeholder="Search leagues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 42px',
            borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
            color: colors.text,
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
          autoFocus
        />
      </div>

      {/* Grouped leagues */}
      {grouped.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          color: colors.textMuted,
        }}>
          <span style={{ fontSize: 48, opacity: 0.3 }}>🏆</span>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>No leagues found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search term</p>
        </div>
      )}

      {grouped.map(([region, leagues]) => (
        <div key={region} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            marginBottom: 10,
            paddingBottom: 8,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {region === 'International' && <Trophy size={14} />}
            {region}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 8,
          }}>
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => navigate(`/league/${league.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  background: colors.bgCard,
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.text,
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  fontFamily: 'inherit',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.bgHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.bgCard;
                }}
              >
                <img
                  src={leagueLogoUrl(league.id)}
                  alt=""
                  style={{
                    width: 36,
                    height: 36,
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{league.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {league.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
