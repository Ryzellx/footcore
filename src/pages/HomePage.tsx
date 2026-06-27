import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchMatchesByDate,
  formatDateForAPI,
  addDays,
  isSameDay,
  teamLogoUrl,
  getMatchStatusText,
  getMatchStatusType,
  type FotMobLeague,
  type FotMobMatch,
} from '../api';
import { S, colors } from '../styles';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
  const navigate = useNavigate();

  const days = getDaysRange(today, 3);

  useEffect(() => {
    loadMatches();
  }, [selectedDate]);

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

  return (
    <div className="animate-fade-in">
      {/* Date selector */}
      <div
        className="no-scrollbar"
        style={S.dateScroller}
      >
        {days.map((day) => {
          const isActive = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const btnStyle: React.CSSProperties = {
            ...S.dateBtn,
            ...(isActive ? S.dateBtnActive : {}),
            ...(!isActive && isToday ? S.dateBtnToday : {}),
          };

          return (
            <button
              key={day.toISOString()}
              style={btnStyle}
              onClick={() => setSelectedDate(day)}
            >
              <span style={S.dateDayName}>
                {isToday ? 'TODAY' : DAY_NAMES[day.getDay()]}
              </span>
              <span style={S.dateDayNum}>{day.getDate()}</span>
              <span style={S.dateMonth}>{MONTH_NAMES[day.getMonth()]}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div style={S.loadingContainer}>
          <div style={S.spinner} />
          <span style={S.loadingText}>Loading matches...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && leagues.length === 0 && (
        <div style={S.emptyContainer}>
          <span style={{ fontSize: 48, opacity: 0.3 }}>⚽</span>
          <p style={S.emptyText}>No matches found</p>
          <p style={S.emptySubtext}>Try selecting a different date</p>
        </div>
      )}

      {/* Matches grouped by league */}
      {!loading &&
        leagues.map((league) => (
          <div key={league.id} style={S.leagueSection}>
            {/* League header */}
            <div style={S.leagueHeader}>
              {league.logo && (
                <img
                  src={league.logo}
                  alt=""
                  style={S.leagueLogo}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <span style={S.leagueName}>{league.name}</span>
              {league.country && (
                <span style={S.leagueCountry}>{league.country}</span>
              )}
            </div>

            {/* Match cards */}
            {league.matches.map((match) => {
              const statusType = getMatchStatusType(match);
              const statusText = getMatchStatusText(match);

              return (
                <button
                  key={match.id}
                  style={S.matchCard}
                  onClick={() => handleMatchClick(match)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgCard;
                  }}
                >
                  {/* Home team */}
                  <div style={S.matchTeam}>
                    <img
                      src={teamLogoUrl(match.home.id)}
                      alt=""
                      style={S.teamLogo}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                    <span
                      style={{ ...S.teamName, cursor: 'pointer' }}
                      onClick={(e) => handleTeamClick(e, match.home.id)}
                    >
                      {match.home.name}
                    </span>
                  </div>

                  {/* Score */}
                  <div style={S.matchScore}>
                    <span
                      style={{
                        ...S.scoreText,
                        ...(statusType === 'live' ? { color: colors.live } : {}),
                        ...(statusType === 'ft' ? { color: colors.ft } : {}),
                        ...(statusType === 'scheduled' ? { color: colors.textMuted } : {}),
                      }}
                    >
                      {statusText}
                    </span>
                    {statusType === 'live' && (
                      <span
                        style={{
                          ...S.statusBadge,
                          ...S.statusLive,
                        }}
                        className="animate-live"
                      >
                        LIVE
                      </span>
                    )}
                    {statusType === 'ft' && (
                      <span style={{ ...S.statusBadge, ...S.statusFT }}>FT</span>
                    )}
                    {statusType === 'scheduled' && match.time && (
                      <span style={{ fontSize: 11, color: colors.textMuted }}>
                        {match.time}
                      </span>
                    )}
                  </div>

                  {/* Away team */}
                  <div style={{ ...S.matchTeam, ...S.matchTeamAway }}>
                    <span
                      style={{
                        ...S.teamName,
                        textAlign: 'right' as const,
                        cursor: 'pointer',
                      }}
                      onClick={(e) => handleTeamClick(e, match.away.id)}
                    >
                      {match.away.name}
                    </span>
                    <img
                      src={teamLogoUrl(match.away.id)}
                      alt=""
                      style={S.teamLogo}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
    </div>
  );
}
