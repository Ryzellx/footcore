import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMatchesByDate,
  formatDateForAPI,
  addDays,
  isSameDay,
  teamLogoUrl,
  getMatchStatusType,
  formatMatchTime,
  getStoredTimezone,
  type FotMobLeague,
  type FotMobMatch,
} from '../api';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function getDaysRange(center: Date, range: number): Date[] {
  const days: Date[] = [];
  for (let i = -range; i <= range; i++) {
    days.push(addDays(center, i));
  }
  return days;
}

export default function HomePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [leagues, setLeagues] = useState<FotMobLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezoneState] = useState(getStoredTimezone);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = getDaysRange(today, 3);

  // Listen for timezone changes
  useEffect(() => {
    function handleStorage() {
      setTimezoneState(getStoredTimezone());
    }
    window.addEventListener('storage', handleStorage);
    // Also poll for same-tab changes
    const interval = setInterval(() => {
      const tz = getStoredTimezone();
      setTimezoneState((prev) => (prev !== tz ? tz : prev));
    }, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    loadMatches();
  }, [selectedDate]);

  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  async function loadMatches() {
    setLoading(true);
    try {
      const data = await fetchMatchesByDate(formatDateForAPI(selectedDate));
      setLeagues(data);
    } catch (err) {
      console.error('Failed to load matches:', err);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  }

  function handleMatchClick(match: FotMobMatch) {
    navigate(`/match/${match.id}`);
  }

  function handleTeamClick(e: React.MouseEvent, teamId: number) {
    e.stopPropagation();
    navigate(`/club/${teamId}`);
  }

  function renderMatchStatus(match: FotMobMatch) {
    const statusType = getMatchStatusType(match);
    const scoreStr = match.status?.scoreStr || '';

    if (statusType === 'scheduled') {
      // Show local time
      const time = formatMatchTime(match.status?.utcTime, timezone);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#888', fontVariantNumeric: 'tabular-nums' }}>
            {time || '--:--'}
          </span>
        </div>
      );
    }

    if (statusType === 'live') {
      const liveMin = match.status?.liveTime?.short || match.status?.reason?.short || '';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
            {scoreStr}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#FF4444',
              marginTop: 2,
            }}
            className="animate-live"
          >
            {liveMin}
          </span>
        </div>
      );
    }

    if (statusType === 'ft') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
            {scoreStr}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#00D26A', marginTop: 2 }}>
            FT
          </span>
        </div>
      );
    }

    // Cancelled
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#FF4444' }}>
          {match.status?.reason?.short || 'CANCL'}
        </span>
      </div>
    );
  }

  function renderGroupRound(match: FotMobMatch) {
    const parts: string[] = [];
    if (match.group) parts.push(match.group);
    if (match.round) parts.push(`Round ${match.round}`);
    if (parts.length === 0) return null;
    return (
      <span style={{ fontSize: 11, color: '#666', marginLeft: 8 }}>
        {parts.join(' · ')}
      </span>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Date selector - FotMob horizontal scroll */}
      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
          padding: '0',
          margin: '0 -16px',
          scrollbarWidth: 'none',
        }}
      >
        {days.map((day) => {
          const isActive = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              data-active={isActive ? 'true' : undefined}
              style={{
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 18px',
                border: 'none',
                background: isActive ? '#00D26A' : 'transparent',
                color: isActive ? '#000' : '#999',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: isActive ? 800 : 500,
                transition: 'all 0.15s ease',
                minWidth: 56,
                fontFamily: 'inherit',
              }}
              onClick={() => setSelectedDate(day)}
            >
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>
                {isToday ? 'TODAY' : DAY_NAMES[day.getDay()]}
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>
                {day.getDate()}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, marginTop: 2, opacity: 0.8 }}>
                {MONTH_NAMES[day.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Thin divider */}
      <div style={{ height: 1, background: '#2A2A2A' }} />

      {/* Loading */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          gap: 16,
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: '3px solid #333',
            borderTop: '3px solid #00D26A',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: '#666' }}>Loading matches...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && leagues.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          textAlign: 'center',
          color: '#666',
        }}>
          <span style={{ fontSize: 48, opacity: 0.2 }}>⚽</span>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 16, color: '#888' }}>No matches found</p>
          <p style={{ fontSize: 13, marginTop: 4, color: '#555' }}>Try selecting a different date</p>
        </div>
      )}

      {/* Matches grouped by league */}
      {!loading && leagues.map((league) => (
        <div key={league.id} style={{ marginTop: 16 }}>
          {/* League header - FotMob style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 0',
              borderBottom: '1px solid #2A2A2A',
              marginBottom: 0,
            }}
          >
            {league.logo && (
              <img
                src={league.logo}
                alt=""
                style={{
                  width: 22,
                  height: 22,
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              {league.name}
            </span>
            {league.country && (
              <span style={{ fontSize: 11, color: '#666', marginLeft: 'auto' }}>
                {league.country}
              </span>
            )}
          </div>

          {/* Match cards */}
          {league.matches.map((match) => (
            <button
              key={match.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 0',
                background: 'transparent',
                marginBottom: 0,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                border: 'none',
                borderBottom: '1px solid #1A1A1A',
                width: '100%',
                color: '#fff',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
              onClick={() => handleMatchClick(match)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#2A2A2A';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Home team */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
              }}>
                <img
                  src={teamLogoUrl(match.home.id)}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.2';
                  }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => handleTeamClick(e, match.home.id)}
                >
                  {match.home.name}
                </span>
              </div>

              {/* Score / Time center */}
              {renderMatchStatus(match)}

              {/* Away team */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 10,
                minWidth: 0,
              }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'right',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => handleTeamClick(e, match.away.id)}
                >
                  {match.away.name}
                </span>
                <img
                  src={teamLogoUrl(match.away.id)}
                  alt=""
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.2';
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
