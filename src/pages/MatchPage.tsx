import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchMatchDetail,
  teamLogoUrl,
  playerPhotoUrl,
  getMatchStatusFromHeader,
  getMatchScoreStrFromHeader,
  formatMatchTime,
  getStoredTimezone,
  type MatchDetailData,
} from '../api';

type Tab = 'overview' | 'stats' | 'lineup' | 'h2h';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (id) loadDetail(id);
  }, [id]);

  async function loadDetail(matchId: string) {
    setLoading(true);
    try {
      const data = await fetchMatchDetail(matchId);
      setDetail(data);
    } catch (err) {
      console.error('Failed to load match:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #333', borderTop: '3px solid #00D26A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: 13, color: '#666' }}>Loading match...</span>
      </div>
    );
  }

  if (!detail || !detail.header) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 20px', gap: 16 }}>
        <span style={{ fontSize: 48, opacity: 0.2 }}>⚽</span>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#888' }}>Match not found</p>
        <button onClick={() => navigate(-1)} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
          ← Go back
        </button>
      </div>
    );
  }

  const header = detail.header;
  const homeTeam = header.teams[0];
  const awayTeam = header.teams[1];
  const statusType = getMatchStatusFromHeader(header.status);
  const scoreStr = getMatchScoreStrFromHeader(header.status);
  const infoBox = detail.content?.matchFacts?.infoBox;
  const events = detail.content?.matchFacts?.events?.incidents || [];
  const statsData = detail.content?.stats?.Periods?.All?.stats || [];
  const lineup = detail.content?.lineup;
  const h2h = detail.content?.h2h;
  const potm = detail.content?.matchFacts?.playerOfTheMatch;
  const timezone = getStoredTimezone();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Stats' },
    { id: 'lineup', label: 'Lineup' },
    { id: 'h2h', label: 'H2H' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#999',
          cursor: 'pointer', fontSize: 13, fontWeight: 600,
          padding: '12px 0', fontFamily: 'inherit',
        }}
      >
        ← Back
      </button>

      {/* Match header - FotMob style */}
      <div style={{
        background: '#222',
        borderRadius: 0,
        padding: '24px 16px',
        textAlign: 'center',
        marginBottom: 0,
        borderBottom: '1px solid #333',
      }}>
        {/* League name */}
        {infoBox?.Tournament?.name && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {infoBox.Tournament.name}
          </div>
        )}

        {/* Teams + Score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {/* Home team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Link to={`/club/${homeTeam.id}`} style={{ textDecoration: 'none' }}>
              <img
                src={teamLogoUrl(homeTeam.id)}
                alt=""
                style={{ width: 64, height: 64, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
              />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              {homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
            {statusType === 'scheduled' ? (
              <div style={{ fontSize: 28, fontWeight: 800, color: '#888', fontVariantNumeric: 'tabular-nums' }}>
                {header.status?.utcTime ? formatMatchTime(header.status.utcTime, timezone) : '--:--'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: 40, fontWeight: 800, color: statusType === 'live' ? '#FF4444' : '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {homeTeam.score ?? ''}
                </span>
                <span style={{ fontSize: 28, color: '#666', fontWeight: 300 }}>:</span>
                <span style={{
                  fontSize: 40, fontWeight: 800, color: statusType === 'live' ? '#FF4444' : '#fff',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {awayTeam.score ?? ''}
                </span>
              </div>
            )}

            {/* Status badge */}
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 4,
              background: statusType === 'live' ? 'rgba(255,68,68,0.15)' : statusType === 'ft' ? 'rgba(0,210,106,0.15)' : '#333',
              color: statusType === 'live' ? '#FF4444' : statusType === 'ft' ? '#00D26A' : '#888',
            }}>
              {statusType === 'live' ? (header.status?.liveTime?.short || scoreStr) : statusType === 'ft' ? 'FT' : scoreStr}
            </span>
          </div>

          {/* Away team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Link to={`/club/${awayTeam.id}`} style={{ textDecoration: 'none' }}>
              <img
                src={teamLogoUrl(awayTeam.id)}
                alt=""
                style={{ width: 64, height: 64, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
              />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              {awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs - FotMob style */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #333',
        background: '#1B1B1B', position: 'sticky', top: 56, zIndex: 50,
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: '0 0 auto', padding: '14px 20px', fontSize: 13, fontWeight: 700,
              color: tab === t.id ? '#00D26A' : '#666',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t.id ? '3px solid #00D26A' : '3px solid transparent',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 0' }}>
        {tab === 'overview' && <OverviewTab infoBox={infoBox} events={events} potm={potm} homeTeam={homeTeam} awayTeam={awayTeam} timezone={timezone} />}
        {tab === 'stats' && <StatsTab stats={statsData} />}
        {tab === 'lineup' && <LineupTab lineup={lineup} />}
        {tab === 'h2h' && <H2HTab h2h={h2h} />}
      </div>
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({ infoBox, events, potm, homeTeam, awayTeam, timezone }: {
  infoBox: any; events: any[]; potm: any; homeTeam: any; awayTeam: any; timezone: string;
}) {
  return (
    <div>
      {/* POTM */}
      {potm && potm.name && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
          background: '#222', marginBottom: 16,
        }}>
          {potm.imageUrl && (
            <img src={potm.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Player of the Match
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>{potm.name}</div>
            {potm.teamName && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{potm.teamName}</div>}
          </div>
          {potm.rating?.num && (
            <span style={{
              marginLeft: 'auto', background: potm.rating.bgcolor || '#00D26A',
              color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 14, fontWeight: 800,
            }}>
              {potm.rating.num}
            </span>
          )}
        </div>
      )}

      {/* Match info */}
      {infoBox && (
        <div style={{ background: '#222', marginBottom: 16 }}>
          {infoBox.Stadium?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Stadium</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{infoBox.Stadium.name}</span>
            </div>
          )}
          {infoBox.Referee?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Referee</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.Referee.name}{infoBox.Referee.country ? ` (${infoBox.Referee.country})` : ''}
              </span>
            </div>
          )}
          {infoBox.Attendance && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Attendance</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{infoBox.Attendance.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', padding: '12px 0', borderBottom: '1px solid #333', marginBottom: 8 }}>
            Match Events
          </div>
          {events.map((evt: any, i: number) => {
            const isGoal = evt.type === 'goal';
            const isYellow = evt.type === 'yellowcard';
            const isRed = evt.type === 'redcard';
            const isSub = evt.type === 'substitution';
            const icon = isGoal ? '⚽' : isYellow ? '🟨' : isRed ? '🟥' : isSub ? '🔄' : '📌';
            const isHome = evt.isHome;

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid #1A1A1A',
                flexDirection: isHome ? 'row' : 'row-reverse',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 30, textAlign: isHome ? 'left' : 'right' }}>
                  {evt.time?.formatted || evt.minute || ''}
                </span>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, textAlign: isHome ? 'left' : 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{evt.player?.name || ''}</div>
                  {evt.assist?.player?.name && (
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Assist: {evt.assist.player.name}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Stats Tab ---
function StatsTab({ stats }: { stats: any[] }) {
  if (!stats || stats.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No statistics available</div>;
  }

  return (
    <div>
      {stats.map((stat: any, i: number) => {
        const homeVal = typeof stat.home === 'number' ? stat.home : parseFloat(stat.home) || 0;
        const awayVal = typeof stat.away === 'number' ? stat.away : parseFloat(stat.away) || 0;
        const total = homeVal + awayVal;
        const homePct = total > 0 ? (homeVal / total) * 100 : 50;
        const isPercentage = stat.key === 'possession' || stat.title?.toLowerCase().includes('possession');

        return (
          <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid #2A2A2A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: homeVal >= awayVal ? '#00D26A' : '#666', minWidth: 50, textAlign: 'left' }}>
                {isPercentage ? `${homeVal}%` : homeVal}
              </span>
              <span style={{ fontSize: 12, color: '#888', textAlign: 'center', flex: 1 }}>{stat.title}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: awayVal >= homeVal ? '#00D26A' : '#666', minWidth: 50, textAlign: 'right' }}>
                {isPercentage ? `${awayVal}%` : awayVal}
              </span>
            </div>
            <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: '#1A1A1A' }}>
              <div style={{ background: '#00D26A', width: `${homePct}%`, transition: 'width 0.3s ease' }} />
              <div style={{ background: '#555', width: `${100 - homePct}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Lineup Tab ---
function LineupTab({ lineup }: { lineup: any }) {
  if (!lineup) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No lineup data available</div>;
  }

  const renderTeam = (team: any) => {
    if (!team) return null;
    const players = team.startingXI || [];
    const subs = team.subs || [];

    return (
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#00D26A', marginBottom: 12 }}>{team.formation}</div>
        {players.map((p: any, i: number) => {
          const player = p.player || p;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 22 }}>{player.jerseyNumber || p.shirtNumber || ''}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>
                {player.name || p.name || ''}{p.captain ? ' (C)' : ''}
              </span>
            </div>
          );
        })}
        {subs.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #333' }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Substitutes
            </div>
            {subs.map((p: any, i: number) => {
              const player = p.player || p;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 22 }}>{player.jerseyNumber || p.shirtNumber || ''}</span>
                  <span style={{ fontSize: 13, color: '#888' }}>{player.name || p.name || ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {renderTeam(lineup.homeTeam)}
      <div style={{ width: 1, background: '#333', margin: '0 8px' }} />
      {renderTeam(lineup.awayTeam)}
    </div>
  );
}

// --- H2H Tab ---
function H2HTab({ h2h }: { h2h: any }) {
  if (!h2h) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No head-to-head data available</div>;
  }

  const summary = h2h.summary || [0, 0, 0];
  const matches = h2h.matches || [];

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, padding: '20px 0', borderBottom: '1px solid #333', marginBottom: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#00D26A' }}>{summary[0]}</div>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Wins</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#888' }}>{summary[1]}</div>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Draws</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#FF4444' }}>{summary[2]}</div>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Losses</div>
        </div>
      </div>

      {/* Recent meetings */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', padding: '12px 0', borderBottom: '1px solid #333', marginBottom: 8 }}>
        Recent Meetings
      </div>
      {matches.length === 0 && (
        <p style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No recent meetings</p>
      )}
      {matches.map((m: any, i: number) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', padding: '12px 0',
          borderBottom: '1px solid #1A1A1A',
        }}>
          <div style={{ flex: 1, textAlign: 'right', fontSize: 13, color: '#fff' }}>{m.home?.name || ''}</div>
          <div style={{ minWidth: 70, textAlign: 'center', fontWeight: 800, fontSize: 15, fontVariantNumeric: 'tabular-nums', color: '#fff' }}>
            {m.status?.scoreStr || `${m.home?.score ?? ''} - ${m.away?.score ?? ''}`}
          </div>
          <div style={{ flex: 1, textAlign: 'left', fontSize: 13, color: '#fff' }}>{m.away?.name || ''}</div>
          <div style={{ fontSize: 11, color: '#666', marginLeft: 12 }}>
            {m.time ? new Date(m.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
