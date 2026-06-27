import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchPlayer,
  teamLogoUrl,
  playerPhotoUrl,
  type PlayerData,
} from '../api';
import { S, colors } from '../styles';
import { ArrowLeft } from 'lucide-react';

type Tab = 'stats' | 'career' | 'trophies' | 'matches';

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('stats');

  useEffect(() => {
    if (id) loadPlayer(id);
  }, [id]);

  async function loadPlayer(playerId: string) {
    setLoading(true);
    try {
      const data = await fetchPlayer(playerId);
      setPlayer(data);
    } catch (err) {
      console.error('Failed to load player:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={S.loadingContainer}>
        <div style={S.spinner} />
        <span style={S.loadingText}>Loading player info...</span>
      </div>
    );
  }

  if (!player) {
    return (
      <div style={S.emptyContainer}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>👤</span>
        <p style={S.emptyText}>Player not found</p>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats', label: 'Stats' },
    { id: 'career', label: 'Career' },
    { id: 'trophies', label: 'Trophies' },
    { id: 'matches', label: 'Recent' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button style={S.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Player header */}
      <div style={S.playerHeader}>
        <img
          src={playerPhotoUrl(player.id)}
          alt=""
          style={S.playerHeaderPhoto}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.3';
          }}
        />
        <div>
          <div style={S.playerHeaderName}>
            {player.shirtNumber && (
              <span style={{ color: colors.textMuted, marginRight: 8 }}>
                #{player.shirtNumber}
              </span>
            )}
            {player.name}
          </div>
          <div style={S.playerHeaderInfo}>
            {player.position && <span>{player.position}</span>}
            {player.club && (
              <>
                <span style={{ margin: '0 8px' }}>·</span>
                <Link
                  to={`/club/${player.clubId}`}
                  style={S.playerLink}
                >
                  {player.club}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={S.playerBioGrid}>
        {player.age && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Age</div>
            <div style={S.playerBioValue}>{player.age}</div>
          </div>
        )}
        {player.height && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Height</div>
            <div style={S.playerBioValue}>{player.height}</div>
          </div>
        )}
        {player.preferredFoot && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Foot</div>
            <div style={S.playerBioValue}>{player.preferredFoot}</div>
          </div>
        )}
        {player.country && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Country</div>
            <div style={S.playerBioValue}>{player.country}</div>
          </div>
        )}
        {player.marketValue && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Market Value</div>
            <div style={{ ...S.playerBioValue, color: colors.accent }}>
              {player.marketValue}
            </div>
          </div>
        )}
        {player.dateOfBirth && (
          <div style={S.playerBioItem}>
            <div style={S.playerBioLabel}>Born</div>
            <div style={S.playerBioValue}>
              {new Date(player.dateOfBirth).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        )}
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
      {tab === 'stats' && <StatsTab player={player} />}
      {tab === 'career' && <CareerTab player={player} />}
      {tab === 'trophies' && <TrophiesTab player={player} />}
      {tab === 'matches' && <RecentMatchesTab player={player} />}
    </div>
  );
}

// --- Stats Tab ---
function StatsTab({ player }: { player: PlayerData }) {
  const stats = player.seasonStats;

  if (!stats) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No season stats available</p>
      </div>
    );
  }

  // Try to extract stat entries from various possible structures
  let statEntries: Array<{ label: string; value: string | number }> = [];

  if (Array.isArray(stats)) {
    statEntries = stats.map((s: any) => ({
      label: s.title || s.name || s.statName || '',
      value: s.value || s.stat || 0,
    }));
  } else if (typeof stats === 'object') {
    const keys = Object.keys(stats);
    for (const key of keys) {
      const val = stats[key];
      if (typeof val === 'number' || typeof val === 'string') {
        statEntries.push({ label: key, value: val });
      } else if (val && typeof val === 'object' && (val.stat !== undefined || val.value !== undefined)) {
        statEntries.push({ label: val.title || key, value: val.stat || val.value });
      }
    }
  }

  if (statEntries.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No stats available</p>
      </div>
    );
  }

  // Find max for bar scaling
  const maxVal = Math.max(
    ...statEntries.map((s) => {
      const n = typeof s.value === 'string' ? parseFloat(s.value) : s.value;
      return isNaN(n) ? 0 : n;
    }),
    1
  );

  return (
    <div>
      {statEntries.map((stat, i) => {
        const numVal = typeof stat.value === 'string' ? parseFloat(stat.value) : stat.value;
        const pct = isNaN(numVal) ? 0 : (numVal / maxVal) * 100;

        return (
          <div key={i} style={S.statRow}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: colors.text }}>{stat.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: colors.accent }}>{stat.value}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: colors.bgDark, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: colors.accent,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Career Tab ---
function CareerTab({ player }: { player: PlayerData }) {
  const careerItems = player.careerHistory?.careerItems || [];

  if (careerItems.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No career history available</p>
      </div>
    );
  }

  return (
    <div>
      {careerItems.map((item, i) => (
        <div key={i} style={S.careerItem}>
          {item.teamId && (
            <img
              src={teamLogoUrl(item.teamId)}
              alt=""
              style={S.careerTeamLogo}
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={S.careerTeamName}>
              {item.teamId ? (
                <Link to={`/club/${item.teamId}`} style={S.playerLink}>
                  {item.teamName}
                </Link>
              ) : (
                item.teamName
              )}
            </div>
            <div style={S.careerStats}>
              {item.seasonName && <span>{item.seasonName}</span>}
              {item.appearances !== undefined && (
                <span> · {item.appearances} apps</span>
              )}
              {item.goals !== undefined && item.goals > 0 && (
                <span> · {item.goals} goals</span>
              )}
              {item.assists !== undefined && item.assists > 0 && (
                <span> · {item.assists} assists</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Trophies Tab ---
function TrophiesTab({ player }: { player: PlayerData }) {
  const trophies = player.trophies || [];

  if (trophies.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No trophy data available</p>
      </div>
    );
  }

  return (
    <div>
      {trophies.map((trophy, i) => (
        <div key={i} style={S.trophyItem}>
          <div>
            <div style={S.trophyName}>🏆 {trophy.teamName}</div>
            {trophy.tournaments && trophy.tournaments.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {trophy.tournaments.map((t: any, j: number) => (
                  <div key={j} style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {t.name || t.title || ''}
                    {t.seasons && ` (${t.seasons.join(', ')})`}
                    {t.count ? ` ×${t.count}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Recent Matches Tab ---
function RecentMatchesTab({ player }: { player: PlayerData }) {
  const matches = player.recentMatches || [];

  if (matches.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No recent matches available</p>
      </div>
    );
  }

  return (
    <div>
      <table style={S.transferTable}>
        <thead>
          <tr>
            <th style={S.transferTh}>Date</th>
            <th style={S.transferTh}>Opponent</th>
            <th style={S.transferTh}>Score</th>
            <th style={S.transferTh}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, i) => {
            const resultStyle =
              m.result === 'W'
                ? S.formW
                : m.result === 'D'
                ? S.formD
                : m.result === 'L'
                ? S.formL
                : null;

            return (
              <tr key={i}>
                <td style={{ ...S.transferTd, color: colors.textMuted, fontSize: 12 }}>
                  {m.date
                    ? new Date(m.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </td>
                <td style={S.transferTd}>
                  {m.opponentId ? (
                    <Link to={`/club/${m.opponentId}`} style={S.playerLink}>
                      {m.opponent}
                    </Link>
                  ) : (
                    m.opponent
                  )}
                </td>
                <td style={{ ...S.transferTd, fontWeight: 700, fontVariantNumeric: 'tabular-nums' as const }}>
                  {m.score || ''}
                  {resultStyle && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        marginLeft: 6,
                        color: colors.white,
                        ...resultStyle,
                      }}
                    >
                      {m.result}
                    </span>
                  )}
                </td>
                <td style={{ ...S.transferTd, fontWeight: 700 }}>
                  {m.rating ? (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background:
                          m.rating >= 7
                            ? colors.accent
                            : m.rating >= 6
                            ? colors.yellow
                            : colors.live,
                        color: colors.white,
                        fontSize: 12,
                      }}
                    >
                      {m.rating.toFixed(1)}
                    </span>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
