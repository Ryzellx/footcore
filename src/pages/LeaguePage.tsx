import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchLeagueDetail,
  leagueLogoUrl,
  teamLogoUrl,
  type LeagueDetailData,
} from '../api';
import { S, colors } from '../styles';
import { ArrowLeft } from 'lucide-react';

type Tab = 'overview' | 'table' | 'fixtures' | 'stats';

export default function LeaguePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<LeagueDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (id) loadLeague(id);
  }, [id]);

  async function loadLeague(leagueId: string) {
    setLoading(true);
    try {
      const data = await fetchLeagueDetail(leagueId);
      setLeague(data);
    } catch (err) {
      console.error('Failed to load league:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={S.loadingContainer}>
        <div style={S.spinner} />
        <span style={S.loadingText}>Loading league info...</span>
      </div>
    );
  }

  if (!league) {
    return (
      <div style={S.emptyContainer}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>🏆</span>
        <p style={S.emptyText}>League not found</p>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  const details = league.details || ({} as any);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'table', label: 'Table' },
    { id: 'fixtures', label: 'Fixtures' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button style={S.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* League header */}
      <div style={S.clubHeader}>
        <img
          src={leagueLogoUrl(details.id)}
          alt=""
          style={{ ...S.clubLogo, borderRadius: 0 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.3';
          }}
        />
        <div>
          <div style={S.clubName}>{details.name || 'Unknown League'}</div>
          {details.country && (
            <div style={S.clubCountry}>{details.country}</div>
          )}
          {details.season && (
            <div style={{ fontSize: 12, color: colors.accent, marginTop: 2 }}>
              {details.season}
            </div>
          )}
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
      {tab === 'overview' && <OverviewTab league={league} onSwitchTab={setTab} />}
      {tab === 'table' && <TableTab league={league} />}
      {tab === 'fixtures' && <FixturesTab league={league} />}
      {tab === 'stats' && <StatsTab league={league} />}
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({ league, onSwitchTab }: { league: LeagueDetailData; onSwitchTab: (tab: Tab) => void }) {
  const navigate = useNavigate();
  const details = league.details || ({} as any);
  const table = getStandingsRows(league);
  const topScorers = getTopScorers(league);
  const recentMatches = getRecentMatches(league);
  const upcomingMatches = getUpcomingMatches(league);

  return (
    <div>
      {/* Info */}
      <div style={S.sectionTitle}>League Info</div>
      <div style={S.infoBox}>
        <InfoRow label="Name" value={details.name} />
        {details.country && <InfoRow label="Country" value={details.country} />}
        {details.season && <InfoRow label="Season" value={details.season} />}
        <InfoRow label="Status" value={league.hasOngoingLeague ? 'Ongoing' : 'Completed'} last />
      </div>

      {/* Top 3 in standings */}
      {table.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Standings</div>
          <div style={{ marginBottom: 16 }}>
            {table.slice(0, 5).map((row: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: colors.bgCard,
                  marginBottom: 2,
                  cursor: 'pointer',
                  borderRadius: i === 0 ? '8px 8px 0 0' : i === Math.min(4, table.length - 1) ? '0 0 8px 8px' : 0,
                }}
                onClick={() => {
                  const teamId = row.id || row.teamId;
                  if (teamId) navigate(`/club/${teamId}`);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.bgHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.bgCard;
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, minWidth: 20, textAlign: 'center' }}>
                  {row.idx ?? i + 1}
                </span>
                <img
                  src={teamLogoUrl(row.id || row.teamId)}
                  alt=""
                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                  {row.name || row.team || ''}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' as const }}>
                  {row.pts ?? row.points ?? ''}
                </span>
              </div>
            ))}
          </div>
          {table.length > 5 && (
            <button
              onClick={() => onSwitchTab('table')}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                background: 'none',
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                color: colors.accent,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: 16,
              }}
            >
              View full standings →
            </button>
          )}
        </div>
      )}

      {/* Top scorers preview */}
      {topScorers.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Top Scorers</div>
          {topScorers.slice(0, 5).map((s: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                background: colors.bgCard,
                marginBottom: 2,
                cursor: s.id ? 'pointer' : 'default',
                borderRadius: i === 0 ? '8px 8px 0 0' : i === Math.min(4, topScorers.length - 1) ? '0 0 8px 8px' : 0,
              }}
              onClick={() => {
                if (s.id) navigate(`/player/${s.id}`);
              }}
              onMouseEnter={(e) => {
                if (s.id) e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgCard;
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, minWidth: 20, textAlign: 'center' }}>
                {i + 1}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                {s.name || s.title || ''}
              </span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {s.teamName || s.subtitle || ''}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: colors.accent, minWidth: 30, textAlign: 'right' }}>
                {s.value ?? s.count ?? ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Recent Matches</div>
          {recentMatches.slice(0, 5).map((m: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                background: colors.bgCard,
                marginBottom: 2,
                cursor: 'pointer',
                borderRadius: i === 0 ? '8px 8px 0 0' : i === Math.min(4, recentMatches.length - 1) ? '0 0 8px 8px' : 0,
              }}
              onClick={() => navigate(`/match/${m.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgCard;
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={teamLogoUrl(m.home?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                <span style={{ fontSize: 13 }}>{m.home?.name || ''}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' as const, minWidth: 50, textAlign: 'center' }}>
                {m.status?.scoreStr || 'vs'}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: 13 }}>{m.away?.name || ''}</span>
                <img src={teamLogoUrl(m.away?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Upcoming Matches</div>
          {upcomingMatches.slice(0, 5).map((m: any, i: number) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                background: colors.bgCard,
                marginBottom: 2,
                borderRadius: i === 0 ? '8px 8px 0 0' : i === Math.min(4, upcomingMatches.length - 1) ? '0 0 8px 8px' : 0,
              }}
            >
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={teamLogoUrl(m.home?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                <span style={{ fontSize: 13 }}>{m.home?.name || ''}</span>
              </div>
              <span style={{ fontSize: 12, color: colors.textMuted, minWidth: 70, textAlign: 'center' }}>
                {m.status?.utcTime
                  ? new Date(m.status.utcTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'TBD'}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                <span style={{ fontSize: 13 }}>{m.away?.name || ''}</span>
                <img src={teamLogoUrl(m.away?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Table Tab ---
function TableTab({ league }: { league: LeagueDetailData }) {
  const table = getStandingsRows(league);
  const navigate = useNavigate();

  if (table.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No standings data available</p>
      </div>
    );
  }

  const hasForm = table.some((r: any) => r.matchesForm || r.form);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
        <thead>
          <tr>
            <th style={tableTh('#')}>#</th>
            <th style={{ ...tableTh(''), textAlign: 'left' as const, minWidth: 140 }}>Team</th>
            <th style={tableTh('P')}>P</th>
            <th style={tableTh('W')}>W</th>
            <th style={tableTh('D')}>D</th>
            <th style={tableTh('L')}>L</th>
            <th style={tableTh('GF')}>GF</th>
            <th style={tableTh('GA')}>GA</th>
            <th style={tableTh('GD')}>GD</th>
            <th style={tableTh('Pts')}>Pts</th>
            {hasForm && <th style={{ ...tableTh('Form'), minWidth: 100 }}>Form</th>}
          </tr>
        </thead>
        <tbody>
          {table.map((row: any, i: number) => {
            const teamId = row.id || row.teamId;
            const form = row.matchesForm || row.form || [];
            const gd = row.goalConDiff ?? row.gd ?? ((row.goalsFor ?? row.gf ?? 0) - (row.goalsAgainst ?? row.ga ?? 0));
            return (
              <tr
                key={i}
                style={{ cursor: teamId ? 'pointer' : 'default' }}
                onClick={() => teamId && navigate(`/club/${teamId}`)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <td style={tableTd(true)}>{row.idx ?? i + 1}</td>
                <td style={{ ...tableTd(false), textAlign: 'left' as const }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={teamLogoUrl(teamId)}
                      alt=""
                      style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                    <span style={{ fontWeight: 500 }}>{row.name || row.team || ''}</span>
                  </div>
                </td>
                <td style={tableTd(true)}>{row.played ?? row.p ?? 0}</td>
                <td style={tableTd(true)}>{row.wins ?? row.w ?? 0}</td>
                <td style={tableTd(true)}>{row.draws ?? row.d ?? 0}</td>
                <td style={tableTd(true)}>{row.losses ?? row.l ?? 0}</td>
                <td style={tableTd(true)}>{row.goalsFor ?? row.gf ?? 0}</td>
                <td style={tableTd(true)}>{row.goalsAgainst ?? row.ga ?? 0}</td>
                <td style={tableTd(true, true)}>{gd}</td>
                <td style={{ ...tableTd(true), fontWeight: 700 }}>{row.pts ?? row.points ?? 0}</td>
                {hasForm && (
                  <td style={{ ...tableTd(false), textAlign: 'left' as const }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {(Array.isArray(form) ? form : []).slice(-5).map((f: any, fi: number) => {
                        const result = typeof f === 'string' ? f : f.result || '';
                        const bgColor =
                          result === 'W' ? colors.accent : result === 'L' ? colors.live : colors.textMuted;
                        return (
                          <span
                            key={fi}
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700,
                              color: colors.white,
                              background: bgColor,
                            }}
                          >
                            {result}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- Fixtures Tab ---
function FixturesTab({ league }: { league: LeagueDetailData }) {
  const navigate = useNavigate();
  const allMatches = league.fixtures?.allMatches || [];

  if (allMatches.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No fixtures available</p>
      </div>
    );
  }

  // Sort matches by date
  const sortedMatches = [...allMatches].sort((a, b) => {
    const dateA = a.status?.utcTime ? new Date(a.status.utcTime).getTime() : 0;
    const dateB = b.status?.utcTime ? new Date(b.status.utcTime).getTime() : 0;
    return dateA - dateB;
  });

  // Group by status
  const live = sortedMatches.filter((m: any) => m.status?.started && !m.status?.finished);
  const upcoming = sortedMatches.filter((m: any) => !m.status?.started && !m.status?.finished);
  const finished = sortedMatches.filter((m: any) => m.status?.finished);

  // State for load more
  const [showCount, setShowCount] = useState(30);
  const [expandedSection, setExpandedSection] = useState<'upcoming' | 'finished' | null>(null);

  return (
    <div>
      {/* Live Matches */}
      {live.length > 0 && (
        <MatchSection title="Live" matches={live} navigate={navigate} showAll />
      )}

      {/* Upcoming Matches */}
      {upcoming.length > 0 && (
        <MatchSection
          title={`Upcoming (${upcoming.length})`}
          matches={expandedSection === 'upcoming' ? upcoming : upcoming.slice(0, showCount)}
          navigate={navigate}
          showLoadMore={upcoming.length > showCount}
          onLoadMore={() => setExpandedSection(expandedSection === 'upcoming' ? null : 'upcoming')}
          isExpanded={expandedSection === 'upcoming'}
        />
      )}

      {/* Finished Matches */}
      {finished.length > 0 && (
        <MatchSection
          title={`Results (${finished.length})`}
          matches={expandedSection === 'finished' ? finished.slice().reverse() : finished.slice(-showCount).reverse()}
          navigate={navigate}
          showLoadMore={finished.length > showCount}
          onLoadMore={() => setExpandedSection(expandedSection === 'finished' ? null : 'finished')}
          isExpanded={expandedSection === 'finished'}
        />
      )}
    </div>
  );
}

function MatchSection({
  title,
  matches,
  navigate,
  showAll = false,
  showLoadMore = false,
  onLoadMore,
  isExpanded = false,
}: {
  title: string;
  matches: any[];
  navigate: any;
  showAll?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  isExpanded?: boolean;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ ...S.sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{title}</span>
        {showLoadMore && (
          <button
            onClick={onLoadMore}
            style={{
              background: 'none',
              border: 'none',
              color: isExpanded ? colors.accent : colors.textMuted,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 8px',
              fontFamily: 'inherit',
            }}
          >
            {isExpanded ? 'Show Less' : `Show All ${matches.length}`}
          </button>
        )}
      </div>
      {matches.map((m: any, i: number) => (
        <div
          key={m.id || i}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
            background: colors.bgCard,
            marginBottom: 2,
            cursor: 'pointer',
            borderRadius: i === 0 ? '8px 8px 0 0' : i === matches.length - 1 ? '0 0 8px 8px' : 0,
          }}
          onClick={() => navigate(`/match/${m.id}`)}
          onMouseEnter={(e) => { e.currentTarget.style.background = colors.bgHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = colors.bgCard; }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={teamLogoUrl(m.home?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
            <span style={{ fontSize: 13 }}>{m.home?.name || ''}</span>
          </div>
          <div style={{ minWidth: 70, textAlign: 'center', fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
            {m.status?.finished
              ? m.status?.scoreStr
              : m.status?.started
              ? m.status?.scoreStr || m.status?.liveTime?.short || ''
              : m.status?.utcTime
              ? new Date(m.status.utcTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'TBD'}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 13 }}>{m.away?.name || ''}</span>
            <img src={teamLogoUrl(m.away?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
}
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{m.away?.name || ''}</span>
            <img src={teamLogoUrl(m.away?.id)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Stats Tab ---
function StatsTab({ league }: { league: LeagueDetailData }) {
  const navigate = useNavigate();
  const stats = league.stats;

  if (!stats || (typeof stats === 'object' && Object.keys(stats).length === 0)) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No stats data available</p>
      </div>
    );
  }

  // Stats can be in various formats from FotMob
  // Common format: { topPlayers: [...], groups: [...] }
  // Or: { stats: { title, key, player: [...] } }

  const topScorers = getTopScorers(league);
  const topAssists = getTopAssists(league);

  return (
    <div>
      {/* Top Scorers */}
      {topScorers.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Top Scorers</div>
          <StatPlayerList players={topScorers} navigate={navigate} />
        </div>
      )}

      {/* Top Assists */}
      {topAssists.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Top Assists</div>
          <StatPlayerList players={topAssists} navigate={navigate} />
        </div>
      )}

      {/* Fallback: raw stats if structured differently */}
      {topScorers.length === 0 && topAssists.length === 0 && (
        <div style={{ color: colors.textMuted, padding: 20, textAlign: 'center' as const }}>
          <p>Detailed stats not available for this league</p>
        </div>
      )}
    </div>
  );
}

function StatPlayerList({ players, navigate }: { players: any[]; navigate: any }) {
  return (
    <div>
      {players.map((s: any, i: number) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: colors.bgCard,
            marginBottom: 2,
            cursor: s.id ? 'pointer' : 'default',
            borderRadius: i === 0 ? '8px 8px 0 0' : i === players.length - 1 ? '0 0 8px 8px' : 0,
          }}
          onClick={() => {
            if (s.id) navigate(`/player/${s.id}`);
          }}
          onMouseEnter={(e) => {
            if (s.id) e.currentTarget.style.background = colors.bgHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.bgCard;
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textMuted, minWidth: 20, textAlign: 'center' }}>
            {i + 1}
          </span>
          {s.id && (
            <img
              src={`https://images.fotmob.com/image_resources/playerimage/player/${s.id}.png`}
              alt=""
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: colors.bgDark }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name || s.title || ''}</div>
            {s.teamName && (
              <div style={{ fontSize: 11, color: colors.textMuted }}>{s.teamName}</div>
            )}
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: colors.accent }}>
            {s.value ?? s.count ?? ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// --- Helpers ---

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: last ? 'none' : `1px solid ${colors.border}`,
    }}>
      <span style={{ fontSize: 13, color: colors.textMuted }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function tableTh(label: string): React.CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    padding: '8px 6px',
    borderBottom: `1px solid ${colors.border}`,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
  };
}

function tableTd(center?: boolean, highlight?: boolean): React.CSSProperties {
  return {
    fontSize: 13,
    padding: '10px 6px',
    borderBottom: `1px solid ${colors.border}`,
    textAlign: center ? 'center' : 'left',
    whiteSpace: 'nowrap' as const,
  };
}

function getStandingsRows(league: LeagueDetailData): any[] {
  const table = league.table || [];
  if (!Array.isArray(table) || table.length === 0) return [];

  // FotMob table format: [{ data: { ccode, leagueId, ... }, allStages: [{ ... }] }]
  // Or: [{ ccode, leagueId, ... }] directly
  // Or: [{ name, id, ... }] directly
  // Or: [[{ name, id, ... }]] (nested)

  // Try to extract from common FotMob structures
  for (const item of table) {
    // Case 1: { allStages: [{ tables: [{ data: [...], ... }] }] }
    if (item.allStages && Array.isArray(item.allStages)) {
      for (const stage of item.allStages) {
        if (stage.tables && Array.isArray(stage.tables)) {
          for (const t of stage.tables) {
            if (t.data && Array.isArray(t.data) && t.data.length > 0) {
              return t.data;
            }
            if (t.rows && Array.isArray(t.rows)) {
              return t.rows;
            }
          }
        }
      }
    }
    // Case 2: item directly has table data
    if (item.data && Array.isArray(item.data)) {
      return item.data;
    }
    // Case 3: { tables: [{ data: [...] }] }
    if (item.tables && Array.isArray(item.tables)) {
      for (const t of item.tables) {
        if (t.data && Array.isArray(t.data) && t.data.length > 0) {
          return t.data;
        }
      }
    }
  }

  // Case 4: flat array of team objects
  if (table.length > 0 && typeof table[0] === 'object' && (table[0].name || table[0].team || table[0].id)) {
    return table;
  }

  // Case 5: allTableData
  const allTableData = league.allTableData || [];
  if (Array.isArray(allTableData) && allTableData.length > 0) {
    return allTableData;
  }

  return [];
}

function getTopScorers(league: LeagueDetailData): any[] {
  const stats = league.stats;
  if (!stats) return [];

  // Try different stat structures
  if (stats.topScores && Array.isArray(stats.topScores)) {
    return stats.topScores;
  }
  if (stats.topScorers && Array.isArray(stats.topScorers)) {
    return stats.topScorers;
  }

  // FotMob format: { stats: { 'topScores': { title, key, headers, data: [...] } } }
  if (stats.stats) {
    const topScores = stats.stats.topScores || stats.stats.TopScores;
    if (topScores?.data) {
      return topScores.data.map((d: any) => ({
        id: d.player?.id || d.id,
        name: d.player?.name || d.name,
        teamName: d.team?.name || d.subtitle,
        value: d.value || d.goals || d.stat?.value || '',
        count: d.stat?.value || d.value || '',
      }));
    }
  }

  // Try top-level array of stats groups
  if (Array.isArray(stats)) {
    for (const group of stats) {
      if (group.key === 'topScores' || group.title?.toLowerCase().includes('scor')) {
        return (group.data || group.rows || []).map((d: any) => ({
          id: d.player?.id || d.id,
          name: d.player?.name || d.title || d.name,
          teamName: d.team?.name || d.subtitle,
          value: d.stat?.value || d.value || d.count || '',
        }));
      }
    }
  }

  return [];
}

function getTopAssists(league: LeagueDetailData): any[] {
  const stats = league.stats;
  if (!stats) return [];

  if (stats.topAssists && Array.isArray(stats.topAssists)) {
    return stats.topAssists;
  }

  if (stats.stats) {
    const topAssists = stats.stats.topAssists || stats.stats.TopAssists;
    if (topAssists?.data) {
      return topAssists.data.map((d: any) => ({
        id: d.player?.id || d.id,
        name: d.player?.name || d.name,
        teamName: d.team?.name || d.subtitle,
        value: d.value || d.assists || d.stat?.value || '',
      }));
    }
  }

  if (Array.isArray(stats)) {
    for (const group of stats) {
      if (group.key === 'topAssists' || group.title?.toLowerCase().includes('assist')) {
        return (group.data || group.rows || []).map((d: any) => ({
          id: d.player?.id || d.id,
          name: d.player?.name || d.title || d.name,
          teamName: d.team?.name || d.subtitle,
          value: d.stat?.value || d.value || d.count || '',
        }));
      }
    }
  }

  return [];
}

function getRecentMatches(league: LeagueDetailData): any[] {
  const matches = league.fixtures?.allMatches || [];
  return matches.filter((m: any) => m.status?.finished).slice(-10).reverse();
}

function getUpcomingMatches(league: LeagueDetailData): any[] {
  const matches = league.fixtures?.allMatches || [];
  return matches.filter((m: any) => !m.status?.started && !m.status?.finished).slice(0, 10);
}
