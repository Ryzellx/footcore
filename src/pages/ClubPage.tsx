import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchClub,
  teamLogoUrl,
  playerPhotoUrl,
  type ClubData,
} from '../api';
import { S, colors } from '../styles';
import { ArrowLeft } from 'lucide-react';

type Tab = 'overview' | 'squad' | 'fixtures' | 'transfers' | 'trophies';

export default function ClubPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    if (id) loadClub(id);
  }, [id]);

  async function loadClub(clubId: string) {
    setLoading(true);
    try {
      const data = await fetchClub(clubId);
      setClub(data);
    } catch (err) {
      console.error('Failed to load club:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={S.loadingContainer}>
        <div style={S.spinner} />
        <span style={S.loadingText}>Loading club info...</span>
      </div>
    );
  }

  if (!club) {
    return (
      <div style={S.emptyContainer}>
        <span style={{ fontSize: 48, opacity: 0.3 }}>🏟️</span>
        <p style={S.emptyText}>Club not found</p>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'squad', label: 'Squad' },
    { id: 'fixtures', label: 'Fixtures' },
    { id: 'transfers', label: 'Transfers' },
    { id: 'trophies', label: 'Trophies' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button style={S.backBtn} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Club header */}
      <div style={S.clubHeader}>
        <img
          src={teamLogoUrl(club.id)}
          alt=""
          style={S.clubLogo}
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.3';
          }}
        />
        <div>
          <div style={S.clubName}>{club.name}</div>
          {club.country && <div style={S.clubCountry}>{club.country}</div>}
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
      {tab === 'overview' && <OverviewTab club={club} />}
      {tab === 'squad' && <SquadTab club={club} />}
      {tab === 'fixtures' && <FixturesTab club={club} />}
      {tab === 'transfers' && <TransfersTab club={club} />}
      {tab === 'trophies' && <TrophiesTab club={club} />}
    </div>
  );
}

// --- Overview Tab ---
function OverviewTab({ club }: { club: ClubData }) {
  const form = club.form || [];
  const nextMatch = club.fixtures?.nextMatch;
  const lastMatch = club.fixtures?.lastMatch;

  return (
    <div>
      {/* Form */}
      {form.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Recent Form</div>
          <div style={S.formContainer}>
            {form.map((result, i) => {
              const style =
                result === 'W'
                  ? S.formW
                  : result === 'D'
                  ? S.formD
                  : S.formL;
              return (
                <div key={i} style={{ ...S.formBadge, ...style }}>
                  {result}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Next match */}
      {nextMatch && (
        <div>
          <div style={S.sectionTitle}>Next Match</div>
          <div style={S.infoBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                vs {nextMatch.opponent?.name || nextMatch.opponent || 'TBD'}
              </span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                {nextMatch.date
                  ? new Date(nextMatch.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''}
              </span>
            </div>
            {nextMatch.tournament?.name && (
              <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                {nextMatch.tournament.name}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last match */}
      {lastMatch && (
        <div>
          <div style={S.sectionTitle}>Last Match</div>
          <div style={S.infoBox}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                vs {lastMatch.opponent?.name || lastMatch.opponent || 'TBD'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' as const }}>
                {lastMatch.scoreStr || ''}
              </span>
            </div>
            {lastMatch.result && (
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    ...S.formBadge,
                    ...(lastMatch.result === 'W'
                      ? S.formW
                      : lastMatch.result === 'D'
                      ? S.formD
                      : S.formL),
                  }}
                >
                  {lastMatch.result}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coach */}
      {club.squad?.coach && club.squad.coach.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Coach</div>
          <div style={S.infoBox}>
            {club.squad.coach.map((c: any, i: number) => (
              <div key={i} style={{ fontSize: 14, fontWeight: 600 }}>
                {c.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Squad Tab ---
function SquadTab({ club }: { club: ClubData }) {
  if (!club.squad) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No squad data available</p>
      </div>
    );
  }

  const groups: { title: string; players: any[] }[] = [
    { title: 'Goalkeepers', players: club.squad.keepers || [] },
    { title: 'Defenders', players: club.squad.defenders || [] },
    { title: 'Midfielders', players: club.squad.midfielders || [] },
    { title: 'Attackers', players: club.squad.attackers || [] },
  ];

  return (
    <div>
      {groups.map((group) => {
        if (group.players.length === 0) return null;
        return (
          <div key={group.title} style={S.squadGroup}>
            <div style={S.squadGroupTitle}>{group.title}</div>
            {group.players.map((player: any) => (
              <button
                key={player.id}
                style={S.playerCard}
                onClick={() => window.location.href = `/player/${player.id}`}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = colors.bgCard;
                }}
              >
                <span style={S.playerNumber}>{player.shirtNumber || ''}</span>
                <img
                  src={playerPhotoUrl(player.id)}
                  alt=""
                  style={S.playerPhoto}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = '0.3';
                  }}
                />
                <div>
                  <div style={S.playerName}>{player.name}</div>
                  {player.position && (
                    <div style={S.playerPosition}>{player.position}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// --- Fixtures Tab ---
function FixturesTab({ club }: { club: ClubData }) {
  const fixtures = club.fixtures?.allFixtures || [];

  if (fixtures.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No fixtures available</p>
      </div>
    );
  }

  return (
    <div>
      {fixtures.map((fix: any, i: number) => {
        const isHome = fix.home;
        const opponent = fix.opponent?.name || 'TBD';
        const dateStr = fix.date
          ? new Date(fix.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : '';
        const resultStyle =
          fix.result === 'W'
            ? S.formW
            : fix.result === 'D'
            ? S.formD
            : fix.result === 'L'
            ? S.formL
            : null;

        return (
          <div key={i} style={S.fixtureRow}>
            <span style={S.fixtureDate}>{dateStr}</span>
            <div style={S.fixtureTeams}>
              <span style={{ color: colors.textSecondary }}>
                {isHome ? 'vs' : '@'} {opponent}
              </span>
              {fix.tournament?.name && (
                <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>
                  {fix.tournament.name}
                </span>
              )}
            </div>
            {fix.scoreStr && (
              <span style={S.fixtureScore}>{fix.scoreStr}</span>
            )}
            {resultStyle && (
              <span style={{ ...S.fixtureResult, ...resultStyle, color: colors.white }}>
                {fix.result}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Transfers Tab ---
function TransfersTab({ club }: { club: ClubData }) {
  const transfersIn = club.transfers?.in || [];
  const transfersOut = club.transfers?.out || [];

  if (transfersIn.length === 0 && transfersOut.length === 0) {
    return (
      <div style={S.emptyContainer}>
        <p style={{ color: colors.textMuted }}>No transfer data available</p>
      </div>
    );
  }

  return (
    <div>
      {transfersIn.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Arrivals</div>
          <table style={S.transferTable}>
            <thead>
              <tr>
                <th style={S.transferTh}>Player</th>
                <th style={S.transferTh}>From</th>
                <th style={S.transferTh}>Fee</th>
              </tr>
            </thead>
            <tbody>
              {transfersIn.map((t: any, i: number) => (
                <tr key={i}>
                  <td style={S.transferTd}>{t.player?.name || t.name || ''}</td>
                  <td style={{ ...S.transferTd, color: colors.textSecondary }}>
                    {t.fromClub?.name || t.from || ''}
                  </td>
                  <td style={{ ...S.transferTd, color: colors.textMuted }}>
                    {t.fee || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transfersOut.length > 0 && (
        <div>
          <div style={S.sectionTitle}>Departures</div>
          <table style={S.transferTable}>
            <thead>
              <tr>
                <th style={S.transferTh}>Player</th>
                <th style={S.transferTh}>To</th>
                <th style={S.transferTh}>Fee</th>
              </tr>
            </thead>
            <tbody>
              {transfersOut.map((t: any, i: number) => (
                <tr key={i}>
                  <td style={S.transferTd}>{t.player?.name || t.name || ''}</td>
                  <td style={{ ...S.transferTd, color: colors.textSecondary }}>
                    {t.toClub?.name || t.to || ''}
                  </td>
                  <td style={{ ...S.transferTd, color: colors.textMuted }}>
                    {t.fee || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Trophies Tab ---
function TrophiesTab({ club }: { club: ClubData }) {
  const trophies = club.trophies || [];

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
            <div style={S.trophyName}>🏆 {trophy.name}</div>
            {trophy.area && <div style={S.trophyArea}>{trophy.area}</div>}
          </div>
          <div style={S.trophyCount}>×{trophy.count || 0}</div>
        </div>
      ))}
    </div>
  );
}
