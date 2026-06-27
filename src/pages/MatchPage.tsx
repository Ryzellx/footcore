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
  const events = detail.content?.matchFacts?.events || [];
  const eventTypes = detail.content?.matchFacts?.eventTypes || [];
  const statsData = detail.content?.stats || [];
  const lineup = detail.content?.lineup;
  const shotmap = detail.content?.shotmap?.shots || [];
  const h2h = detail.content?.h2h;
  const potm = detail.content?.matchFacts?.playerOfTheMatch;
  const playerStats = detail.content?.playerStats || {};
  const momentum = detail.content?.momentum;
  const table = detail.content?.table;
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
        {infoBox?.tournament?.leagueName && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {infoBox.tournament.leagueName} - {infoBox.tournament.roundName ? `Matchday ${infoBox.tournament.roundName}` : ''}
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
        {tab === 'facts' && <FactsTab infoBox={infoBox} potm={potm} homeTeam={homeTeam} awayTeam={awayTeam} timezone={timezone} header={header} detail={detail} events={events} />}
        {tab === 'live' && <LiveTab events={events} eventTypes={eventTypes} momentum={momentum} playerStats={playerStats} shotmap={shotmap} homeTeam={homeTeam} awayTeam={awayTeam} />}
        {tab === 'lineup' && <LineupTab lineup={lineup} homeTeam={homeTeam} awayTeam={awayTeam} />}
        {tab === 'table' && <TableTab table={table} homeTeam={homeTeam} awayTeam={awayTeam} />}
        {tab === 'stats' && <StatsTab stats={statsData} playerStats={playerStats} />}
      </div>
    </div>
  );
}

/* ============================================================
   TAB 1: FAKTA (FACTS / OVERVIEW)
   ============================================================ */
function FactsTab({ infoBox, potm, homeTeam, awayTeam, timezone, header, detail, events }: {
  infoBox: any; potm: any; homeTeam: any; awayTeam: any; timezone: string;
  header: any; detail: any; events: any[];
}) {
  // Format date/time
  const matchTime = header?.status?.utcTime ? formatMatchTime(header.status.utcTime, timezone) : '';
  const matchDate = header?.status?.utcTime ? new Date(header.status.utcTime).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }) : '';

  // Get match facts from events: missed shots, corners, fouls, offsides, saves
  const matchEvents = events || [];
  const missedShots = matchEvents.filter((e: any) => e.type === 'Goal' && e.swap?.some?.((s: any) => s.type === 'MissedShot'));
  const corners = matchEvents.filter((e: any) => e.type === 'Corner');
  const fouls = matchEvents.filter((e: any) => e.type === 'Foul');
  const offsides = matchEvents.filter((e: any) => e.type === 'Offside');
  const saves = matchEvents.filter((e: any) => e.type === 'Save');

  // Team form from infoBox.teamForm or h2h
  const teamForm = infoBox?.teamForm;

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
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              {potm.name?.fullName || potm.name?.firstName || potm.name?.lastName || potm.name}
            </div>
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
          {infoBox.tournament?.leagueName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Kompetisi</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.tournament.leagueName}{infoBox.tournament.roundName ? ` - Matchday ${infoBox.tournament.roundName}` : ''}
              </span>
            </div>
          )}
          {/* Stadium */}
          {infoBox.stadium?.name && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Stadion</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.stadium.name}{infoBox.stadium.city ? `, ${infoBox.stadium.city}` : ''}{infoBox.stadium.country ? `, ${infoBox.stadium.country}` : ''}
              </span>
            </div>
          )}
          {/* Referee */}
          {infoBox.referee?.text && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Wasit</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.referee.text}{infoBox.referee.country ? ` (${infoBox.referee.country})` : ''}
              </span>
            </div>
          )}
          {/* Attendance */}
          {infoBox.attendance && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Penonton</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{Number(infoBox.attendance).toLocaleString()}</span>
            </div>
          )}
          {/* Weather - if available */}
          {infoBox.weather && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px' }}>
              <span style={{ fontSize: 13, color: '#666' }}>Cuaca</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {infoBox.weather}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Match Facts - miss shots, corners, fouls, etc */}
      <div style={{ background: '#222', marginBottom: 1, padding: '16px' }}>
        <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Fakta Pertandingan
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <StatBox label="Tembakan Melenceng" value={countEventType(events, 'MissedShot') || countEventType(events, 'Goal')} icon="🎯" />
          <StatBox label="Corner" value={countEventType(events, 'Corner')} icon="🚩" />
          <StatBox label="Pelanggaran" value={countEventType(events, 'Foul')} icon="⚠️" />
          <StatBox label="Offside" value={countEventType(events, 'Offside')} icon="🚫" />
          <StatBox label="Penyelamatan" value={countEventType(events, 'Save')} icon="🧤" />
          <StatBox label="Kartu Kuning" value={countEventType(events, 'Yellow') || countEventType(events, 'Card')} icon="🟨" />
          <StatBox label="Kartu Merah" value={countEventType(events, 'Red')} icon="🟥" />
          <StatBox label="Pergantian" value={countEventType(events, 'Substitution')} icon="🔄" />
        </div>
      </div>

      {/* Team Form */}
      {teamForm && (
        <div style={{ background: '#222', marginBottom: 1, padding: '16px' }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, textAlign: 'center' }}>
            Performa Tim
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <TeamForm team={homeTeam} form={teamForm.home} />
            <TeamForm team={awayTeam} form={teamForm.away} />
          </div>
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

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px', background: '#1A1A1A', borderRadius: 4 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <span style={{ fontSize: 10, color: '#666', textAlign: 'center' }}>{label}</span>
    </div>
  );
}

function TeamForm({ team, form }: { team: any; form: any }) {
  if (!form || !Array.isArray(form)) return null;
  return (
    <div style={{ textAlign: 'center' }}>
      <img src={teamLogoUrl(team.id)} alt="" style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 8 }} />
      <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 8 }}>{team.name}</div>
      <div style={{ display: 'flex', gap: 2 }}>
        {form.slice(-5).map((f: any, i: number) => {
          const result = typeof f === 'string' ? f : f?.result || f?.outcome || '';
          const bg = result === 'W' ? '#00D26A' : result === 'D' ? '#666' : result === 'L' ? '#FF4444' : '#333';
          return (
            <span key={i} style={{
              display: 'inline-block', width: 20, height: 20, fontSize: 9, fontWeight: 700,
              background: bg, color: '#fff', textAlign: 'center', lineHeight: '20px', borderRadius: 2,
            }}>
              {result}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function countEventType(events: any[], type: string): number {
  return events.filter((e: any) => {
    const et = e.type || '';
    if (type === 'MissedShot') return et === 'Goal' && e.swap?.some?.((s: any) => s.type === 'MissedShot');
    if (type === 'Card') return et === 'Card';
    if (type === 'Yellow') return et === 'Yellow';
    if (type === 'Red') return et === 'Red';
    return et === type;
  }).length;
}

/* ============================================================
   TAB 2: LANGSUNG (LIVE / EVENTS)
   ============================================================ */
function LiveTab({ events, eventTypes, momentum, playerStats, shotmap, homeTeam, awayTeam }: {
  events: any[]; eventTypes: string[]; momentum: any; playerStats: Record<string, any>; shotmap: any[];
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
            const isGoal = evtType === 'Goal';
            const isCard = evtType === 'Card';
            const isYellow = evtType === 'Yellow';
            const isRed = evtType === 'Red';
            const isSub = evtType === 'Substitution';
            const isVar = evtType === 'VAR' || evtType === 'varDecision';
            const isPenalty = evtType === 'Penalty';
            const isOwnGoal = evtType === 'OwnGoal';
            const isInjury = evtType === 'Injuries';
            const isPeriod = evtType === 'Half' || evtType === 'AddedTime';

            let icon = '📌';
            let label = '';
            if (isGoal) { icon = '⚽'; label = 'Gol'; }
            else if (isCard || isYellow) { icon = '🟨'; label = 'Kartu Kuning'; }
            else if (isRed) { icon = '🟥'; label = 'Kartu Merah'; }
            else if (isSub) { icon = '🔄'; label = 'Pergantian'; }
            else if (isVar) { icon = '📺'; label = 'VAR'; }
            else if (isPenalty) { icon = '⚽'; label = 'Penalti'; }
            else if (isOwnGoal) { icon = '⚽'; label = 'Gol Bunuh Diri'; }
            else if (isInjury) { icon = '🏥'; label = 'Cedera'; }
            else if (isPeriod) { icon = '🏁'; label = ''; }

            // For period events (kick-off, HT, FT) render differently
            if (isPeriod) {
              const reasonStr = evt.reason?.short || evt.text || evt.swap?.[0]?.name || '';
              return (
                <div key={i} style={{ textAlign: 'center', padding: '12px 0', position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#333', padding: '4px 14px', borderRadius: 12 }}>
                    <span style={{ fontSize: 12 }}>🏁</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa' }}>
                      {evt.timeStr || evt.time || ''} {reasonStr}
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
                  {evt.timeStr || (evt.time ? `${evt.time}'` : '')}
                </span>

                {/* Icon */}
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>

                {/* Player info */}
                <div style={{ flex: 1, textAlign: isHome ? 'left' : 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {evt.player?.name || evt.swap?.[0]?.name || ''}
                  </div>
                  {evt.assist?.player?.name && (
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      🅰️ {evt.assist.player.name}
                    </div>
                  )}
                  {isSub && evt.swap && (
                    <div style={{ fontSize: 11, color: '#FF4444', marginTop: 2 }}>
                      ↓ {evt.swap[0]?.name || ''}
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
    const players = team.starters || [];
    const subs = team.substitutes || [];
    const coach = team.coach;
    const formation = team.formation || '';

    // Group players by positionId
    // positionId mapping: 11=GK, 32-36=DEF, 22-26=MID, 42-46=FWD
    const goalkeepers: any[] = [];
    const defenders: any[] = [];
    const midfielders: any[] = [];
    const forwards: any[] = [];

    players.forEach((p: any) => {
      const posId = p.positionId || 0;
      if (posId === 11) goalkeepers.push(p);
      else if (posId >= 32 && posId <= 36) defenders.push(p);
      else if (posId >= 22 && posId <= 26) midfielders.push(p);
      else if (posId >= 42 && posId <= 46) forwards.push(p);
      else midfielders.push(p); // default
    });

    const renderPlayer = (p: any, idx: number) => {
      const pid = p.id;
      const name = p.name;
      const shirt = p.shirtNumber;
      const isCaptain = p.isCaptain; // might not exist in lineup data
      const rating = p.rating;

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
              const pid = p.id;
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
                    {p.shirtNumber || ''}
                  </span>
                  <span style={{ fontSize: 12, color: '#888' }}>{p.name || ''}</span>
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
                {coach.name || coach[0]?.name || String(coach)}
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
function TableTab({ table, homeTeam, awayTeam }: { table: any; homeTeam: any; awayTeam: any }) {
  // Table data structure from API: { leagueId, url, teams: [teamIds], tournamentNameForUrl, parentLeagueId, countryCode }
  // For full standings, we'd need to fetch the table from the URL
  // For now, show what we have

  if (!table) {
    return (
      <div style={{ background: '#222', padding: '40px 20px', textAlign: 'center', color: '#666', fontSize: 13 }}>
        Data klasemen tidak tersedia
      </div>
    );
  }

  return (
    <div>
      {/* Standings Table - would need separate fetch for full table */}
      <div style={{ background: '#222', padding: '16px' }}>
        <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Klasemen Grup
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          Data klasemen lengkap memerlukan fetch terpisah.
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
          <TeamBadge team={homeTeam} />
          <TeamBadge team={awayTeam} />
        </div>
      </div>

      {/* H2H section moved to its own area if needed */}
    </div>
  );
}

function TeamBadge({ team }: { team: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <img src={teamLogoUrl(team.id)} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{team.name}</span>
    </div>
  );
}

/* ============================================================
   TAB 5: STATISTIK (STATS)
   ============================================================ */
function StatsTab({ stats, playerStats }: { stats: any[]; playerStats: Record<string, any> }) {
  if (!stats || stats.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>Tidak ada statistik tersedia</div>;
  }

  // Group stats by category
  const categories: Record<string, any[]> = {
    'Team Stats': [],
    'Passing': [],
    'Defensive': [],
    'Attacking': [],
    'Goalkeeper': [],
    'Other': [],
  };

  const categoryMap: Record<string, string> = {
    'possession': 'Team Stats',
    'ball possession': 'Team Stats',
    'total shots': 'Team Stats',
    'shots on target': 'Team Stats',
    'shots off target': 'Team Stats',
    'blocked shots': 'Team Stats',
    'expected goals': 'Team Stats',
    'xg': 'Team Stats',
    'big chances': 'Team Stats',
    'big chances missed': 'Team Stats',
    'corners': 'Team Stats',
    'offsides': 'Team Stats',
    'fouls': 'Team Stats',
    'yellow cards': 'Team Stats',
    'red cards': 'Team Stats',
    'saves': 'Team Stats',
    'passes': 'Passing',
    'accurate passes': 'Passing',
    'pass accuracy': 'Passing',
    'long balls': 'Passing',
    'crosses': 'Passing',
    'accurate crosses': 'Passing',
    'throw-ins': 'Passing',
    'goal kicks': 'Passing',
    'free kicks': 'Passing',
    'tackles': 'Defensive',
    'interceptions': 'Defensive',
    'clearances': 'Defensive',
    'blocks': 'Defensive',
    'recoveries': 'Defensive',
    'duels won': 'Defensive',
    'aerial duels won': 'Defensive',
    'dribbles': 'Attacking',
    'successful dribbles': 'Attacking',
    'touches in opponent box': 'Attacking',
    'chances created': 'Attacking',
    'goalkeeper saves': 'Goalkeeper',
    'punches': 'Goalkeeper',
    'high claims': 'Goalkeeper',
    'sweeper actions': 'Goalkeeper',
    'save percentage': 'Goalkeeper',
  };

  stats.forEach((stat) => {
    const cat = categoryMap[stat.title?.toLowerCase()] || 'Other';
    categories[cat].push(stat);
  });

  return (
    <div>
      {Object.entries(categories).map(([categoryName, catStats]) => {
        if (catStats.length === 0) return null;
        return (
          <div key={categoryName} style={{ background: '#222', marginBottom: 1 }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '16px 16px 8px' }}>
              {categoryName}
            </div>
            {catStats.map((stat: any, i: number) => {
              const homeVal = typeof stat.home === 'number' ? stat.home : parseFloat(stat.home) || 0;
              const awayVal = typeof stat.away === 'number' ? stat.away : parseFloat(stat.away) || 0;
              const total = homeVal + awayVal;
              const homePct = total > 0 ? (homeVal / total) * 100 : 50;
              const isPercentage = stat.format === 'percentage' || stat.title?.toLowerCase().includes('accuracy') || stat.title?.toLowerCase().includes('possession');

              return (
                <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #2A2A2A' }}>
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
      })}

      {/* Player Stats Table */}
      {Object.keys(playerStats).length > 0 && (
        <div style={{ background: '#222', marginTop: 1 }}>
          <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '16px 16px 8px' }}>
            Statistik Pemain
          </div>
          <PlayerStatsTable playerStats={playerStats} />
        </div>
      )}
    </div>
  );
}

function PlayerStatsTable({ playerStats }: { playerStats: Record<string, any> }) {
  // Flatten all player stats into rows
  const allStats: Array<{ playerId: string; playerName: string; teamName: string; title: string; value: any }> = [];

  Object.entries(playerStats).forEach(([pid, ps]: [string, any]) => {
    if (ps?.stats) {
      ps.stats.forEach((cat: any) => {
        if (cat.stats) {
          cat.stats.forEach((s: any) => {
            if (s.stats && Array.isArray(s.stats) && s.stats.length >= 1) {
              allStats.push({
                playerId: pid,
                playerName: ps.name || '',
                teamName: ps.teamName || '',
                title: `${cat.title} - ${s.title}`,
                value: s.stats[0], // home team value (player's value)
              });
            }
          });
        }
      });
    }
  });

  if (allStats.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Tidak ada data statistik pemain</div>;
  }

  // Show top stats
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#666', fontWeight: 700 }}>Pemain</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#666', fontWeight: 700 }}>Tim</th>
            <th style={{ textAlign: 'left', padding: '8px 12px', color: '#666', fontWeight: 700 }}>Stat</th>
            <th style={{ textAlign: 'center', padding: '8px 12px', color: '#666', fontWeight: 700 }}>Nilai</th>
          </tr>
        </thead>
        <tbody>
          {allStats.slice(0, 50).map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #2A2A2A' }}>
              <td style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <img
                  src={playerPhotoUrl(parseInt(row.playerId))}
                  alt=""
                  style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span style={{ fontSize: 12, color: '#fff' }}>{row.playerName}</span>
              </td>
              <td style={{ padding: '8px 12px', color: '#888', fontSize: 11 }}>{row.teamName}</td>
              <td style={{ padding: '8px 12px', color: '#fff', fontSize: 11 }}>{row.title}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', color: '#00D26A', fontWeight: 700, fontSize: 12 }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}