import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchMatchDetail,
  teamLogoUrl,
  playerPhotoUrl,
  getMatchStatusFromHeader,
  getMatchScoreStrFromHeader,
  type MatchDetailData,
} from '../api';
import { S, colors } from '../styles';
import { ArrowLeft } from 'lucide-react';

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
      <div style={S.loadingContainer}>
        <div style={S.spinner} />
        <span style={S.loadingText}>Loading match details...</span>
      </div>
    );
  }

  if (!detail || !detail.header) {
    return (
      <div style={S.emptyContainer}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>⚽</span>
        <p style={S.emptyText}>Match not found</p>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go back
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stats', label: 'Stats' },
    { id: 'lineup', label: 'Lineup' },
    { id: 'h2h', label: 'H2H' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button style={S.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Match header */}
      <div style={S.detailHeader}>
        {infoBox?.Tournament?.name && (
          <div style={S.detailLeague}>{infoBox.Tournament.name}</div>
        )}
        <div style={S.detailTeams}>
          <div style={S.detailTeam}>
            <Link to={`/club/${homeTeam.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={teamLogoUrl(homeTeam.id)}
                alt=""
                style={S.detailTeamLogo}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
            </Link>
            <span style={S.detailTeamName}>{homeTeam.name}</span>
          </div>

          <div style={S.detailScore}>
            <span
              style={{
                ...S.detailScoreNum,
                color:
                  statusType === 'live'
                    ? colors.live
                    : statusType === 'ft'
                    ? colors.ft
                    : colors.text,
              }}
            >
              {homeTeam.score ?? ''}
            </span>
            <span style={S.detailScoreDash}>-</span>
            <span
              style={{
                ...S.detailScoreNum,
                color:
                  statusType === 'live'
                    ? colors.live
                    : statusType === 'ft'
                    ? colors.ft
                    : colors.text,
              }}
            >
              {awayTeam.score ?? ''}
            </span>
          </div>

          <div style={S.detailTeam}>
            <Link to={`/club/${awayTeam.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <img
                src={teamLogoUrl(awayTeam.id)}
                alt=""
                style={S.detailTeamLogo}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0.3';
                }}
              />
            </Link>
            <span style={S.detailTeamName}>{awayTeam.name}</span>
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            ...S.detailStatus,
            ...(statusType === 'live'
              ? S.statusLive
              : statusType === 'ft'
              ? S.statusFT
              : S.statusScheduled),
          }}
        >
          {scoreStr}
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{
              ...S.tab,
              ...(tab === t.id ? S.tabActive : {}),
            }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <OverviewTab
          infoBox={infoBox}
          events={events}
          potm={potm}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}
      {tab === 'stats' && <StatsTab stats={statsData} />}
      {tab === 'lineup' && <LineupTab lineup={lineup} />}
      {tab === 'h2h' && <H2HTab h2h={h2h} />}
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({
  infoBox,
  events,
  potm,
  homeTeam,
  awayTeam,
}: {
  infoBox: any;
  events: any[];
  potm: any;
  homeTeam: any;
  awayTeam: any;
}) {
  return (
    <div>
      {/* POTM */}
      {potm && potm.name && (
        <div style={S.potmContainer}>
          {potm.imageUrl && (
            <img
              src={potm.imageUrl}
              alt=""
              style={S.potmPhoto}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1 }}>
              Player of the Match
            </div>
            <div style={S.potmName}>{potm.name}</div>
            {potm.teamName && <div style={S.potmTeam}>{potm.teamName}</div>}
            {potm.rating?.num && (
              <span
                style={{
                  ...S.potmRating,
                  background: potm.rating.bgcolor || colors.accent,
                  color: colors.white,
                }}
              >
                {potm.rating.num}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Match info */}
      {infoBox && (
        <div style={S.infoBox}>
          {infoBox.Stadium?.name && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Stadium</span>
              <span style={S.infoValue}>{infoBox.Stadium.name}</span>
            </div>
          )}
          {infoBox.Referee?.name && (
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Referee</span>
              <span style={S.infoValue}>
                {infoBox.Referee.name}
                {infoBox.Referee.country ? ` (${infoBox.Referee.country})` : ''}
              </span>
            </div>
          )}
          {infoBox.Attendance && (
            <div style={{ ...S.infoRow, ...S.infoRowLast }}>
              <span style={S.infoLabel}>Attendance</span>
              <span style={S.infoValue}>{infoBox.Attendance.toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Events */}
      {events.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Match Events</div>
          {events.map((evt: any, i: number) => {
            const isGoal = evt.type === 'goal';
            const isYellow = evt.type === 'yellowcard';
            const isRed = evt.type === 'redcard';
            const isSub = evt.type === 'substitution';
            const icon = isGoal ? '⚽' : isYellow ? '🟨' : isRed ? '🟥' : isSub ? '🔄' : '📌';
            const isHome = evt.isHome;

            return (
              <div
                key={i}
                style={{
                  ...S.eventRow,
                  flexDirection: isHome ? 'row' : 'row-reverse',
                  textAlign: isHome ? 'left' : 'right',
                }}
              >
                <span style={S.eventMinute}>{evt.time?.formatted || evt.minute || ''}</span>
                <span style={S.eventIcon}>{icon}</span>
                <div style={{ ...S.eventInfo, textAlign: isHome ? 'left' : 'right' }}>
                  <span style={S.eventPlayer}>{evt.player?.name || ''}</span>
                  {evt.assist?.player?.name && (
                    <div style={S.eventDetail}>Assist: {evt.assist.player.name}</div>
                  )}
                  {evt.incidentClass && (
                    <div style={S.eventDetail}>{evt.incidentClass}</div>
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
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No statistics available</p>
      </div>
    );
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
          <div key={i} style={S.statRow}>
            <div style={S.statHeader}>
              <span style={{ fontWeight: 700, color: homeVal >= awayVal ? colors.accent : colors.textMuted }}>
                {isPercentage ? `${homeVal}%` : homeVal}
              </span>
              <span style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center' as const, flex: 1 }}>
                {stat.title}
              </span>
              <span style={{ fontWeight: 700, color: awayVal >= homeVal ? colors.accent : colors.textMuted }}>
                {isPercentage ? `${awayVal}%` : awayVal}
              </span>
            </div>
            <div style={S.statBarContainer}>
              <div style={{ ...S.statBarHome, width: `${homePct}%` }} />
              <div style={{ ...S.statBarAway, width: `${100 - homePct}%` }} />
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
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No lineup data available</p>
      </div>
    );
  }

  const homeTeam = lineup.homeTeam;
  const awayTeam = lineup.awayTeam;

  const renderTeam = (team: any, side: 'home' | 'away') => {
    if (!team) return null;
    const players = team.startingXI || [];
    const subs = team.subs || [];

    return (
      <div style={S.lineupTeam}>
        <div style={S.lineupFormation}>{team.formation}</div>
        {players.map((p: any, i: number) => {
          const player = p.player || p;
          return (
            <div
              key={i}
              style={S.lineupPlayer}
            >
              <span style={S.lineupNumber}>{player.jerseyNumber || p.shirtNumber || ''}</span>
              <span style={S.lineupPlayerName}>
                {player.name || p.name || ''}
                {p.captain ? ' (C)' : ''}
              </span>
            </div>
          );
        })}
        {subs.length > 0 && (
          <div style={S.subsSection}>
            <div style={{ fontSize: 11, color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 }}>
              Substitutes
            </div>
            {subs.map((p: any, i: number) => {
              const player = p.player || p;
              return (
                <div key={i} style={S.lineupPlayer}>
                  <span style={S.lineupNumber}>{player.jerseyNumber || p.shirtNumber || ''}</span>
                  <span style={{ color: colors.textSecondary }}>{player.name || p.name || ''}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.lineupContainer}>
      {renderTeam(homeTeam, 'home')}
      <div style={{ width: 1, background: colors.border, margin: '0 8px' }} />
      {renderTeam(awayTeam, 'away')}
    </div>
  );
}

// --- H2H Tab ---
function H2HTab({ h2h }: { h2h: any }) {
  if (!h2h) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No head-to-head data available</p>
      </div>
    );
  }

  const summary = h2h.summary || [0, 0, 0];
  const matches = h2h.matches || [];

  return (
    <div>
      {/* Summary */}
      <div style={S.h2hSummary}>
        <div style={S.h2hStat}>
          <div style={{ ...S.h2hNum, color: colors.accent }}>{summary[0]}</div>
          <div style={S.h2hLabel}>Wins</div>
        </div>
        <div style={S.h2hStat}>
          <div style={{ ...S.h2hNum, color: colors.textMuted }}>{summary[1]}</div>
          <div style={S.h2hLabel}>Draws</div>
        </div>
        <div style={S.h2hStat}>
          <div style={{ ...S.h2hNum, color: colors.live }}>{summary[2]}</div>
          <div style={S.h2hLabel}>Losses</div>
        </div>
      </div>

      {/* Recent meetings */}
      <div style={S.sectionTitle}>Recent Meetings</div>
      {matches.length === 0 && (
        <p style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' as const, padding: '20px 0' }}>
          No recent meetings
        </p>
      )}
      {matches.map((m: any, i: number) => (
        <div key={i} style={S.h2hMatch}>
          <div style={{ flex: 1, textAlign: 'right' as const }}>
            <span style={{ fontSize: 13 }}>{m.home?.name || ''}</span>
          </div>
          <div style={{ minWidth: 60, textAlign: 'center' as const, fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' as const }}>
            {m.status?.scoreStr || `${m.home?.score ?? ''} - ${m.away?.score ?? ''}`}
          </div>
          <div style={{ flex: 1, textAlign: 'left' as const }}>
            <span style={{ fontSize: 13 }}>{m.away?.name || ''}</span>
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, marginLeft: 12 }}>
            {m.time ? new Date(m.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
