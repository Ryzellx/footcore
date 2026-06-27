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

type Tab = 'facts' | 'live' | 'lineup' | 'table' | 'stats';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('facts');

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
  const shotmap = detail.content?.shotmap?.shots || [];
  const playerStats = detail.content?.playerStats || {};
  const momentum = detail.content?.momentum;
  const timezone = getStoredTimezone();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'facts', label: 'Fakta' },
    { id: 'live', label: 'Langsung' },
    { id: 'lineup', label: 'Susunan Pemain' },
    { id: 'table', label: 'Tabel' },
    { id: 'stats', label: 'Statistik' },
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
              flex: '0 0 auto', padding: '14px 16px', fontSize: 13, fontWeight: 700,
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
        {tab === 'facts' && (
          <FactsTab
            infoBox={infoBox} potm={potm} homeTeam={homeTeam} awayTeam={awayTeam}
            timezone={timezone} h2h={h2h} playerStats={playerStats} header={header}
            detail={detail}
          />
        )}
        {tab === 'live' && (
          <LiveTab events={events} momentum={momentum} playerStats={playerStats} shotmap={shotmap} homeTeam={homeTeam} awayTeam={awayTeam} />
        )}
        {tab === 'lineup' && <LineupTab lineup={lineup} homeTeam={homeTeam} awayTeam={awayTeam} />}
        {tab === 'table' && <TableTab h2h={h2h} detail={detail} homeTeam={homeTeam} awayTeam={awayTeam} />}
        {tab === 'stats' && <StatsTab stats={statsData} playerStats={playerStats} />}
      </div>
    </div>
  );
}

/* ============================================================
   TAB 1: FAKTA (FACTS / OVERVIEW)
   ============================================================ */
function FactsTab({ infoBox, potm, homeTeam, awayTeam, timezone, h2h, playerStats, header, detail }: {
  infoBox: any; potm: any; homeTeam: any; awayTeam: any; timezone: string;
  h2h: any; playerStats: Record<string, any>; header: any; detail: any;
}) {
  // Find highest rated player from playerStats
  let topPlayer: any = null;
  let topRating = 0;
  Object.values(playerStats || {}).forEach((ps: any) => {
    if (ps?.stats) {
      ps.stats.forEach((s: any) => {
        if (s.key === 'rating' || s.title?.toLowerCase().includes('rating')) {
          const val = typeof s.stats?.[s.stats?.length - 1] === 'number' ? s.stats[s.stats.length - 1] : parseFloat(s.stats?.[s.stats?.length - 1]) || 0;
          if (val > topRating) {
            topRating = val;
            topPlayer = { name: ps.name, teamName: ps.teamName, rating: val, id: ps.id };
          }
        }
      });
    }
  });

  // Format date/time
  const matchTime = header?.status?.utcTime ? formatMatchTime(header.status.utcTime, timezone) : '';
  const matchDate = header?.status?.utcTime ? new Date(header.status.utcTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }) : '';

  return (
    <div>
      {/* POTM */}
      {potm && potm.name && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '16px',
          background: '#222', marginBottom: 1,
        }}>
          {potm.imageUrl && (
            <img src={potm.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              Pemain Terbaik
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

      {/* Match Info */}
      {infoBox && (
        <div style={{ background: '#222', marginBottom: 1 }}>
          {/* Date & Time */}
          {matchDate && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Tanggal & Waktu</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'right' }}>{matchDate}, {matchTime}</span>
            </div>
          )}
          {/* Tournament */}
          {infoBox.Tournament?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Kompetisi</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{infoBox.Tournament.name}</span>
            </div>
          )}
          {/* Stadium */}
          {infoBox.Stadium?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Stadion</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{infoBox.Stadium.name}</span>
            </div>
          )}
          {/* Referee */}
          {infoBox.Referee?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Wasit</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.Referee.name}{infoBox.Referee.country ? ` (${infoBox.Referee.country})` : ''}
              </span>
            </div>
          )}
          {/* Attendance */}
          {infoBox.Attendance && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Penonton</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{Number(infoBox.Attendance).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Top Rated Player (from playerStats) */}
      {topPlayer && topPlayer.rating > 0 && (
        <div style={{
          background: '#222', marginBottom: 1, padding: '16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
            {topPlayer.id && (
              <img
                src={playerPhotoUrl(topPlayer.id)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Rating Tertinggi</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 2 }}>{topPlayer.name}</div>
            {topPlayer.teamName && <div style={{ fontSize: 11, color: '#888' }}>{topPlayer.teamName}</div>}
          </div>
          <span style={{
            background: topPlayer.rating >= 7 ? '#00D26A' : topPlayer.rating >= 6 ? '#F5A623' : '#666',
            color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 13, fontWeight: 800,
          }}>
            {topPlayer.rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* H2H Summary */}
      {h2h?.summary && (
        <div style={{ background: '#222', marginBottom: 1, padding: '16px' }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, textAlign: 'center' }}>
            Head to Head
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#00D26A' }}>{h2h.summary[0]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Menang</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#888' }}>{h2h.summary[1]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Seri</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FF4444' }}>{h2h.summary[2]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Kalah</div>
            </div>
          </div>
          {/* Recent meetings */}
          {h2h.matches && h2h.matches.length > 0 && (
            <div>
              {h2h.matches.slice(0, 5).map((m: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', padding: '8px 0',
                  borderBottom: i < Math.min(h2h.matches.length, 5) - 1 ? '1px solid #2A2A2A' : 'none',
                }}>
                  <div style={{ flex: 1, textAlign: 'right', fontSize: 12, color: '#fff' }}>{m.home?.name || ''}</div>
                  <div style={{ minWidth: 60, textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
                    {m.status?.scoreStr || `${m.home?.score ?? '?'} - ${m.away?.score ?? '?'}`}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontSize: 12, color: '#fff' }}>{m.away?.name || ''}</div>
                  <div style={{ fontSize: 10, color: '#666', marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {m.time ? new Date(m.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Team Colors */}
      {detail?.general?.teamColors && (
        <div style={{ background: '#222', padding: '16px', display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Warna Kandang</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {detail.general.teamColors.home?.primary && (
                <div style={{ width: 24, height: 24, borderRadius: 4, background: detail.general.teamColors.home.primary }} />
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Warna Tandang</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {detail.general.teamColors.away?.primary && (
                <div style={{ width: 24, height: 24, borderRadius: 4, background: detail.general.teamColors.away.primary }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB 2: LANGSUNG (LIVE / EVENTS)
   ============================================================ */
function LiveTab({ events, momentum, playerStats, shotmap, homeTeam, awayTeam }: {
  events: any[]; momentum: any; playerStats: Record<string, any>; shotmap: any[];
  homeTeam: any; awayTeam: any;
}) {
  return (
    <div>
      {/* Match Momentum */}
      {momentum?.main?.data && momentum.main.data.length > 0 && (
        <div style={{ background: '#222', padding: '16px', marginBottom: 1 }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Momentum Pertandingan
          </div>
          <MomentumChart data={momentum.main.data} />
        </div>
      )}

      {/* Events Timeline */}
      {events.length > 0 ? (
        <div style={{ background: '#222', padding: '16px', marginBottom: 1 }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Jalannya Pertandingan
          </div>
          {events.map((evt: any, i: number) => {
            const isHome = evt.isHome;
            const evtType = evt.type || '';
            const isGoal = evtType === 'goal';
            const isYellow = evtType === 'yellowcard';
            const isRed = evtType === 'redcard';
            const isSub = evtType === 'substitution';
            const isVar = evtType === 'varDecision' || evtType === 'var';
            const isPenalty = evtType === 'penalty';
            const isOwnGoal = evtType === 'ownGoal';
            const isInjury = evtType === 'injury';
            const isPeriod = evtType === 'period';

            let icon = '📌';
            let label = '';
            if (isGoal) { icon = '⚽'; label = 'Gol'; }
            else if (isYellow) { icon = '🟨'; label = 'Kartu Kuning'; }
            else if (isRed) { icon = '🟥'; label = 'Kartu Merah'; }
            else if (isSub) { icon = '🔄'; label = 'Pergantian'; }
            else if (isVar) { icon = '📺'; label = 'VAR'; }
            else if (isPenalty) { icon = '⚽'; label = 'Penalti'; }
            else if (isOwnGoal) { icon = '⚽'; label = 'Gol Bunuh Diri'; }
            else if (isInjury) { icon = '🏥'; label = 'Cedera'; }
            else if (isPeriod) { icon = '🏁'; label = ''; }

            // For period events (kick-off, HT, FT) render differently
            if (isPeriod) {
              const reasonStr = evt.reason?.short || evt.text || '';
              return (
                <div key={i} style={{ textAlign: 'center', padding: '12px 0', position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#333', padding: '4px 14px', borderRadius: 12 }}>
                    <span style={{ fontSize: 12 }}>🏁</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa' }}>
                      {evt.time?.formatted || evt.minute || ''} {reasonStr}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 0', borderBottom: i < events.length - 1 ? '1px solid #2A2A2A' : 'none',
                flexDirection: isHome ? 'row' : 'row-reverse',
              }}>
                {/* Time */}
                <span style={{
                  fontSize: 12, fontWeight: 700, color: '#666', minWidth: 32,
                  textAlign: isHome ? 'left' : 'right',
                }}>
                  {evt.time?.formatted || (evt.minute ? `${evt.minute}'` : '')}
                </span>

                {/* Icon */}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>

                {/* Player info */}
                <div style={{ flex: 1, textAlign: isHome ? 'left' : 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {evt.player?.name || ''}
                  </div>
                  {evt.assist?.player?.name && (
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      🅰️ {evt.assist.player.name}
                    </div>
                  )}
                  {isSub && evt.assist?.player?.name && (
                    <div style={{ fontSize: 11, color: '#FF4444', marginTop: 2 }}>
                      ↓ {evt.assist.player.name}
                    </div>
                  )}
                  {isVar && evt.incidentType && (
                    <div style={{ fontSize: 11, color: '#F5A623', marginTop: 2 }}>
                      {evt.incidentType}
                    </div>
                  )}
                  {evt.reason?.short && !isPeriod && (
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      {evt.reason.short}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#222', padding: '40px 20px', textAlign: 'center', color: '#666', fontSize: 13 }}>
          Belum ada peristiwa
        </div>
      )}

      {/* Shotmap */}
      {shotmap.length > 0 && (
        <div style={{ background: '#222', padding: '16px', marginTop: 1 }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Peta Tembakan
          </div>
          <ShotmapChart shots={shotmap} homeTeam={homeTeam} awayTeam={awayTeam} />
        </div>
      )}

      {/* Live Player Ratings */}
      {Object.keys(playerStats).length > 0 && (
        <div style={{ background: '#222', padding: '16px', marginTop: 1 }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Rating Pemain
          </div>
          <PlayerRatingsList playerStats={playerStats} />
        </div>
      )}
    </div>
  );
}

/* Momentum Chart */
function MomentumChart({ data }: { data: any[] }) {
  const maxVal = Math.max(...data.map((d) => Math.abs(d.value || 0)), 1);
  const chartHeight = 80;

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: chartHeight, position: 'relative', background: '#1A1A1A', borderRadius: 4, overflow: 'hidden' }}>
      {/* Center line */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: chartHeight / 2, height: 1, background: '#333' }} />
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${data.length * 4} ${chartHeight}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const val = d.value || 0;
          const barH = (Math.abs(val) / maxVal) * (chartHeight / 2 - 4);
          const y = val >= 0 ? chartHeight / 2 - barH : chartHeight / 2;
          const color = val >= 0 ? '#00D26A' : '#FF4444';
          return (
            <rect key={i} x={i * 4} y={y} width={3} height={barH} fill={color} opacity={0.8} />
          );
        })}
      </svg>
      {/* Labels */}
      <div style={{ position: 'absolute', left: 8, top: 4, fontSize: 10, color: '#666' }}>Home</div>
      <div style={{ position: 'absolute', right: 8, bottom: 4, fontSize: 10, color: '#666' }}>Away</div>
    </div>
  );
}

/* Shotmap Chart */
function ShotmapChart({ shots, homeTeam, awayTeam }: { shots: any[]; homeTeam: any; awayTeam: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Simple list view of shots */}
      {shots.map((shot: any, i: number) => {
        const isHome = shot.teamId === homeTeam.id;
        const isGoal = shot.eventType === 'Goal';
        const xg = shot.expectedGoals ? shot.expectedGoals.toFixed(2) : '-';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flexDirection: isHome ? 'row' : 'row-reverse',
            padding: '6px 0',
          }}>
            <span style={{ fontSize: 11, color: '#666', minWidth: 30 }}>{shot.min || ''}'</span>
            <span style={{ fontSize: 14 }}>{isGoal ? '⚽' : shot.isOnTarget ? '🟢' : '🔴'}</span>
            <div style={{ textAlign: isHome ? 'left' : 'right', flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{shot.playerName || ''}</div>
              <div style={{ fontSize: 10, color: '#666' }}>
                {shot.shotType || ''} · xG: {xg}
                {shot.isOnTarget !== undefined ? (shot.isOnTarget ? ' · On Target' : ' · Off Target') : ''}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Player Ratings List */
function PlayerRatingsList({ playerStats }: { playerStats: Record<string, any> }) {
  const players: Array<{ name: string; teamName: string; rating: number; id: string }> = [];

  Object.entries(playerStats).forEach(([pid, ps]: [string, any]) => {
    if (ps?.stats) {
      let rating = 0;
      ps.stats.forEach((s: any) => {
        if (s.key === 'rating' || s.title?.toLowerCase().includes('rating')) {
          const val = typeof s.stats?.[s.stats?.length - 1] === 'number' ? s.stats[s.stats.length - 1] : parseFloat(s.stats?.[s.stats?.length - 1]) || 0;
          if (val > rating) rating = val;
        }
      });
      if (rating > 0) {
        players.push({ name: ps.name, teamName: ps.teamName || '', rating, id: pid });
      }
    }
  });

  players.sort((a, b) => b.rating - a.rating);

  if (players.length === 0) {
    return <div style={{ fontSize: 12, color: '#666', textAlign: 'center', padding: 16 }}>Tidak ada data rating</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {players.slice(0, 20).map((p) => (
        <div key={p.id} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
          borderBottom: '1px solid #2A2A2A',
        }}>
          <img
            src={playerPhotoUrl(parseInt(p.id))}
            alt=""
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', background: '#333' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.name}</div>
            <div style={{ fontSize: 10, color: '#666' }}>{p.teamName}</div>
          </div>
          <span style={{
            background: p.rating >= 7 ? '#00D26A' : p.rating >= 6 ? '#F5A623' : '#666',
            color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 800,
          }}>
            {p.rating.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   TAB 3: SUSUNAN PEMAIN (LINEUP)
   ============================================================ */
function LineupTab({ lineup, homeTeam, awayTeam }: { lineup: any; homeTeam: any; awayTeam: any }) {
  if (!lineup) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Data susunan pemain tidak tersedia</div>;
  }

  const renderTeam = (team: any, teamInfo: any, isHome: boolean) => {
    if (!team) return null;
    const players = team.startingXI || [];
    const subs = team.subs || [];
    const coach = team.coach;
    const formation = team.formation || '';

    // Group players by position
    const goalkeepers: any[] = [];
    const defenders: any[] = [];
    const midfielders: any[] = [];
    const forwards: any[] = [];

    players.forEach((p: any) => {
      const player = p.player || p;
      const posId = player.positionId || p.positionId || 0;
      // positionId: 1=GK, 2=DEF, 3=MID, 4=FWD (approximate)
      if (posId === 1) goalkeepers.push(p);
      else if (posId === 2) defenders.push(p);
      else if (posId === 3) midfielders.push(p);
      else if (posId === 4) forwards.push(p);
      else midfielders.push(p); // default
    });

    const renderPlayer = (p: any, idx: number) => {
      const player = p.player || p;
      const pid = player.id || p.id;
      const name = player.name || p.name || '';
      const shirt = player.jerseyNumber || p.shirtNumber || '';
      const isCaptain = p.captain;
      const rating = p.performance?.rating || player.rating || null;

      return (
        <div key={idx} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 0', borderBottom: '1px solid #2A2A2A',
        }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
            {pid && (
              <img
                src={playerPhotoUrl(pid)}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 20 }}>{shirt}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
              {name}{isCaptain ? ' (C)' : ''}
            </span>
          </div>
          {rating && (
            <span style={{
              background: rating >= 7 ? '#00D26A' : rating >= 6 ? '#F5A623' : '#555',
              color: '#fff', padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 700,
            }}>
              {typeof rating === 'number' ? rating.toFixed(1) : rating}
            </span>
          )}
        </div>
      );
    };

    const renderGroup = (title: string, group: any[]) => {
      if (group.length === 0) return null;
      return (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            {title}
          </div>
          {group.map((p, i) => renderPlayer(p, i))}
        </div>
      );
    };

    return (
      <div style={{ flex: 1 }}>
        {/* Team header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          padding: '12px', background: '#2A2A2A', borderRadius: 0,
        }}>
          <img
            src={teamLogoUrl(teamInfo.id)}
            alt=""
            style={{ width: 28, height: 28, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{teamInfo.name}</div>
            {formation && <div style={{ fontSize: 12, color: '#00D26A', fontWeight: 700 }}>{formation}</div>}
          </div>
        </div>

        {/* Formation visual */}
        {formation && (
          <div style={{
            textAlign: 'center', marginBottom: 16, padding: '8px',
            background: '#1A1A1A', borderRadius: 4,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#00D26A' }}>{formation}</span>
          </div>
        )}

        {/* Starting XI grouped by position */}
        {renderGroup('Penjaga Gawang', goalkeepers)}
        {renderGroup('Pertahanan', defenders)}
        {renderGroup('Gelandang', midfielders)}
        {renderGroup('Penyerang', forwards)}

        {/* If no position grouping worked, show all */}
        {goalkeepers.length === 0 && defenders.length === 0 && midfielders.length === 0 && forwards.length === 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Starting XI
            </div>
            {players.map((p: any, i: number) => renderPlayer(p, i))}
          </div>
        )}

        {/* Substitutes */}
        {subs.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #333' }}>
            <div style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Cadangan
            </div>
            {subs.map((p: any, i: number) => {
              const player = p.player || p;
              const pid = player.id || p.id;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0', borderBottom: '1px solid #2A2A2A',
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: '#333', flexShrink: 0 }}>
                    {pid && (
                      <img
                        src={playerPhotoUrl(pid)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#666', minWidth: 18 }}>
                    {player.jerseyNumber || p.shirtNumber || ''}
                  </span>
                  <span style={{ fontSize: 12, color: '#888' }}>{player.name || p.name || ''}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Coach */}
        {coach && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #333' }}>
            <div style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Pelatih
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 14, color: '#fff' }}>👤</div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {(coach as any)?.name || (coach as any)?.[0]?.name || String(coach)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {renderTeam(lineup.homeTeam, homeTeam, true)}
        <div style={{ width: 1, background: '#333', margin: '0 8px', flexShrink: 0 }} />
        {renderTeam(lineup.awayTeam, awayTeam, false)}
      </div>
    </div>
  );
}

/* ============================================================
   TAB 4: TABEL (TABLE / STANDINGS)
   ============================================================ */
function TableTab({ h2h, detail, homeTeam, awayTeam }: {
  h2h: any; detail: any; homeTeam: any; awayTeam: any;
}) {
  // Try to get standings/table from content
  const tableData = (detail as any)?.content?.table;
  const standings = tableData?.[0]?.data?.allMatches || tableData?.[0]?.data?.tables?.[0]?.data?.allMatches || tableData || null;
  const tableRows = Array.isArray(standings) ? standings : null;

  return (
    <div>
      {/* Standings Table */}
      {tableRows && tableRows.length > 0 ? (
        <div style={{ background: '#222', overflowX: 'auto' }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '16px 16px 8px' }}>
            Klasemen
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#666', fontWeight: 700, fontSize: 11 }}>#</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', color: '#666', fontWeight: 700, fontSize: 11 }}>Tim</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>M</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>M</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>S</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>K</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>GM</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>GK</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>SG</th>
                <th style={{ textAlign: 'center', padding: '10px 6px', color: '#666', fontWeight: 700, fontSize: 11 }}>Poin</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', color: '#666', fontWeight: 700, fontSize: 11 }}>Form</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row: any, i: number) => {
                const team = row.team || row;
                const tid = team.id || 0;
                const isCurrent = tid === homeTeam.id || tid === awayTeam.id;
                const posColor = row.qualColor || '';
                const played = row.played ?? row.matches ?? 0;
                const wins = row.wins ?? 0;
                const draws = row.draws ?? 0;
                const losses = row.losses ?? 0;
                const gf = row.scoresFor ?? row.gf ?? 0;
                const ga = row.scoresAgainst ?? row.ga ?? 0;
                const gd = row.goalConDiff ?? row.gd ?? (gf - ga);
                const pts = row.points ?? row.pts ?? 0;
                const formArr = row.form || row.recentForm || [];

                return (
                  <tr key={i} style={{
                    borderBottom: '1px solid #2A2A2A',
                    background: isCurrent ? 'rgba(0,210,106,0.08)' : 'transparent',
                  }}>
                    <td style={{ padding: '10px 8px', color: isCurrent ? '#00D26A' : '#888', fontWeight: isCurrent ? 700 : 500 }}>
                      {row.idx !== undefined ? row.idx + 1 : i + 1}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={teamLogoUrl(tid)}
                          alt=""
                          style={{ width: 18, height: 18, objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <span style={{ fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#00D26A' : '#fff' }}>
                          {team.name || team.shortName || ''}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{played}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{wins}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{draws}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{losses}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{gf}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#888' }}>{ga}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: gd > 0 ? '#00D26A' : gd < 0 ? '#FF4444' : '#888', fontWeight: 600 }}>{gd > 0 ? `+${gd}` : gd}</td>
                    <td style={{ textAlign: 'center', padding: '10px 6px', color: '#fff', fontWeight: 800 }}>{pts}</td>
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {Array.isArray(formArr) && formArr.slice(-5).map((f: any, fi: number) => {
                          const result = typeof f === 'string' ? f : f?.result || '';
                          const bg = result === 'W' ? '#00D26A' : result === 'D' ? '#666' : result === 'L' ? '#FF4444' : '#333';
                          return (
                            <span key={fi} style={{
                              display: 'inline-block', width: 16, height: 16, fontSize: 9, fontWeight: 700,
                              background: bg, color: '#fff', textAlign: 'center', lineHeight: '16px',
                            }}>
                              {result}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#222', padding: '40px 20px', textAlign: 'center', color: '#666', fontSize: 13 }}>
          Data klasemen tidak tersedia
        </div>
      )}

      {/* H2H section */}
      {h2h?.summary && (
        <div style={{ background: '#222', marginTop: 1, padding: '16px' }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, textAlign: 'center' }}>
            Head to Head
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#00D26A' }}>{h2h.summary[0]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Menang</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#888' }}>{h2h.summary[1]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Seri</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FF4444' }}>{h2h.summary[2]}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Kalah</div>
            </div>
          </div>
          {h2h.matches && h2h.matches.length > 0 && (
            <div>
              {h2h.matches.map((m: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', padding: '10px 0',
                  borderBottom: i < h2h.matches.length - 1 ? '1px solid #2A2A2A' : 'none',
                }}>
                  <div style={{ flex: 1, textAlign: 'right', fontSize: 12, color: '#fff' }}>{m.home?.name || ''}</div>
                  <div style={{ minWidth: 60, textAlign: 'center', fontWeight: 800, fontSize: 13, color: '#fff' }}>
                    {m.status?.scoreStr || `${m.home?.score ?? '?'} - ${m.away?.score ?? '?'}`}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left', fontSize: 12, color: '#fff' }}>{m.away?.name || ''}</div>
                  <div style={{ fontSize: 10, color: '#666', marginLeft: 8, whiteSpace: 'nowrap' }}>
                    {m.time ? new Date(m.time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </div>
                  {m.league?.name && (
                    <div style={{ fontSize: 9, color: '#555', marginLeft: 8, whiteSpace: 'nowrap' }}>{m.league.name}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB 5: STATISTIK (STATISTICS)
   ============================================================ */
function StatsTab({ stats, playerStats }: { stats: any[]; playerStats: Record<string, any> }) {
  if ((!stats || stats.length === 0) && Object.keys(playerStats).length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Data statistik tidak tersedia</div>;
  }

  // Group stats by category
  const teamStatKeys = ['ballPossession', 'totalShots', 'shotsOnTarget', 'shotsOffTarget', 'blockedScoringAttempt', 'expectedGoals', 'bigChance', 'bigChanceMissed', 'corner', 'offside', 'foulGiven', 'yellowCard', 'redCard', 'saves'];
  const passingStatKeys = ['accuratePass', 'totalPass', 'passAccuracy', 'accurateLongBall', 'accurateCross', 'totalCross', 'goalKick', 'freeKick', 'throwIn'];
  const defensiveStatKeys = ['totalTackle', 'interceptionWon', 'clearanceTotal', 'outfielderBlock', 'ballRecovery', 'duelWon', 'aerialWon'];
  const attackingStatKeys = ['dribble', 'dribbleWon', 'touchesInOppBox', 'chanceCreated'];
  const gkStatKeys = ['saves', 'punches', 'highClaims', 'sweeper', 'savedShotsFromInsideTheBox'];

  const categorize = (keys: string[]) => stats.filter((s) => keys.includes(s.key));

  const teamStats = categorize(teamStatKeys);
  const passingStats = categorize(passingStatKeys);
  const defensiveStats = categorize(defensiveStatKeys);
  const attackingStats = categorize(attackingStatKeys);
  const gkStats = categorize(gkStatKeys);

  // Stats not in any category
  const allKnownKeys = [...teamStatKeys, ...passingStatKeys, ...defensiveStatKeys, ...attackingStatKeys, ...gkStatKeys];
  const otherStats = stats.filter((s) => !allKnownKeys.includes(s.key));

  const renderStatRow = (stat: any, idx: number) => {
    const homeVal = typeof stat.home === 'number' ? stat.home : parseFloat(stat.home) || 0;
    const awayVal = typeof stat.away === 'number' ? stat.away : parseFloat(stat.away) || 0;
    const total = homeVal + awayVal;
    const homePct = total > 0 ? (homeVal / total) * 100 : 50;
    const isPercentage = stat.key === 'ballPossession' || stat.key === 'passAccuracy' || stat.title?.toLowerCase().includes('possession') || stat.title?.toLowerCase().includes('accuracy');

    return (
      <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #2A2A2A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, minWidth: 45, textAlign: 'left',
            color: homeVal > awayVal ? '#00D26A' : homeVal === awayVal ? '#888' : '#666',
          }}>
            {isPercentage ? `${homeVal}%` : homeVal}
          </span>
          <span style={{ fontSize: 11, color: '#888', textAlign: 'center', flex: 1 }}>{stat.title}</span>
          <span style={{
            fontSize: 13, fontWeight: 700, minWidth: 45, textAlign: 'right',
            color: awayVal > homeVal ? '#00D26A' : awayVal === homeVal ? '#888' : '#666',
          }}>
            {isPercentage ? `${awayVal}%` : awayVal}
          </span>
        </div>
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', background: '#1A1A1A' }}>
          <div style={{ background: '#00D26A', width: `${homePct}%`, transition: 'width 0.3s ease' }} />
          <div style={{ background: '#555', width: `${100 - homePct}%`, transition: 'width 0.3s ease' }} />
        </div>
      </div>
    );
  };

  const renderSection = (title: string, sectionStats: any[]) => {
    if (sectionStats.length === 0) return null;
    return (
      <div style={{ background: '#222', marginBottom: 1, padding: '16px' }}>
        <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          {title}
        </div>
        {sectionStats.map((s, i) => renderStatRow(s, i))}
      </div>
    );
  };

  // Player stats table
  const hasPlayerStats = Object.keys(playerStats).length > 0;
  const playerStatHeaders: string[] = [];
  const playerRows: Array<{ id: string; name: string; teamName: string; stats: Record<string, any> }> = [];

  if (hasPlayerStats) {
    Object.entries(playerStats).forEach(([pid, ps]: [string, any]) => {
      if (ps?.stats && ps.stats.length > 0) {
        const statMap: Record<string, any> = {};
        ps.stats.forEach((s: any) => {
          const key = s.key || s.title || '';
          if (key && !playerStatHeaders.includes(s.title || key)) {
            playerStatHeaders.push(s.title || key);
          }
          // Get the last value (or 'All' period value)
          const vals = s.stats || [];
          statMap[key] = vals.length > 0 ? vals[vals.length - 1] : '-';
        });
        playerRows.push({ id: pid, name: ps.name, teamName: ps.teamName || '', stats: statMap });
      }
    });
  }

  return (
    <div>
      {/* Team Stats Sections */}
      {renderSection('Statistik Tim', teamStats)}
      {renderSection('Passing', passingStats)}
      {renderSection('Pertahanan', defensiveStats)}
      {renderSection('Serangan', attackingStats)}
      {renderSection('Penjaga Gawang', gkStats)}
      {renderSection('Lainnya', otherStats)}

      {/* Player Stats Table */}
      {hasPlayerStats && playerRows.length > 0 && (
        <div style={{ background: '#222', marginTop: 1, padding: '16px', overflowX: 'auto' }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Statistik Pemain
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', color: '#666', fontWeight: 700, fontSize: 10, position: 'sticky', left: 0, background: '#222' }}>Pemain</th>
                {playerStatHeaders.slice(0, 8).map((h, i) => (
                  <th key={i} style={{ textAlign: 'center', padding: '8px 6px', color: '#666', fontWeight: 700, fontSize: 10, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {playerRows.slice(0, 30).map((pr, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #2A2A2A' }}>
                  <td style={{ padding: '8px 6px', position: 'sticky', left: 0, background: '#222', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img
                        src={playerPhotoUrl(parseInt(pr.id))}
                        alt=""
                        style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', background: '#333' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}>{pr.name}</div>
                        <div style={{ fontSize: 9, color: '#666' }}>{pr.teamName}</div>
                      </div>
                    </div>
                  </td>
                  {playerStatHeaders.slice(0, 8).map((h, hi) => {
                    // Find matching stat key
                    let val: any = '-';
                    Object.entries(pr.stats).forEach(([key, v]) => {
                      if (key === h || key.toLowerCase() === h.toLowerCase()) val = v;
                    });
                    return (
                      <td key={hi} style={{ textAlign: 'center', padding: '8px 6px', color: '#888', fontSize: 11 }}>
                        {val !== null && val !== undefined ? String(val) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
