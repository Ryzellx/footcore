import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchMatchDetail,
  teamLogoUrl,
  getMatchStatusFromHeader,
  getMatchScoreStrFromHeader,
  formatMatchTime,
  getStoredTimezone,
  type MatchDetailData,
} from '../api';

type Tab = 'fakta' | 'langsung' | 'lineup' | 'tabel' | 'statistik';

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MatchDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('fakta');

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
        <button onClick={() => navigate(-1)} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Go back</button>
      </div>
    );
  }

  const header = detail.header;
  const homeTeam = header.teams[0];
  const awayTeam = header.teams[1];
  const statusType = getMatchStatusFromHeader(header.status);
  const infoBox = detail.content?.matchFacts?.infoBox;
  const timezone = getStoredTimezone();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'fakta', label: 'Fakta' },
    { id: 'langsung', label: 'Langsung' },
    { id: 'lineup', label: 'Lineup' },
    { id: 'tabel', label: 'Tabel' },
    { id: 'statistik', label: 'Statistik' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#999', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '12px 0', fontFamily: 'inherit',
      }}>← Back</button>

      {/* Match header */}
      <div style={{ background: '#222', padding: '24px 16px', textAlign: 'center', marginBottom: 0, borderBottom: '1px solid #333' }}>
        {infoBox?.tournament?.leagueName && (
          <div style={{ fontSize: 12, color: '#666', marginBottom: 16, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {infoBox.tournament.leagueName}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Link to={`/club/${homeTeam.id}`} style={{ textDecoration: 'none' }}>
              <img src={teamLogoUrl(homeTeam.id)} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{homeTeam.name}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
            {statusType === 'scheduled' ? (
              <div style={{ fontSize: 28, fontWeight: 800, color: '#888', fontVariantNumeric: 'tabular-nums' }}>
                {header.status?.utcTime ? formatMatchTime(header.status.utcTime, timezone) : '--:--'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: statusType === 'live' ? '#FF4444' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{homeTeam.score ?? ''}</span>
                <span style={{ fontSize: 28, color: '#666', fontWeight: 300 }}>:</span>
                <span style={{ fontSize: 40, fontWeight: 800, color: statusType === 'live' ? '#FF4444' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{awayTeam.score ?? ''}</span>
              </div>
            )}
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 4,
              background: statusType === 'live' ? 'rgba(255,68,68,0.15)' : statusType === 'ft' ? 'rgba(0,210,106,0.15)' : '#333',
              color: statusType === 'live' ? '#FF4444' : statusType === 'ft' ? '#00D26A' : '#888',
            }}>
              {statusType === 'live' ? (header.status?.liveTime?.short || getMatchScoreStrFromHeader(header.status)) : statusType === 'ft' ? 'FT' : getMatchScoreStrFromHeader(header.status)}
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Link to={`/club/${awayTeam.id}`} style={{ textDecoration: 'none' }}>
              <img src={teamLogoUrl(awayTeam.id)} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
            </Link>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{awayTeam.name}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #333', background: '#1B1B1B',
        position: 'sticky', top: 56, zIndex: 50, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: '0 0 auto', padding: '14px 16px', fontSize: 12, fontWeight: 700,
            color: tab === t.id ? '#00D26A' : '#666', background: 'none', border: 'none',
            cursor: 'pointer', borderBottom: tab === t.id ? '3px solid #00D26A' : '3px solid transparent',
            transition: 'all 0.15s ease', whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '16px 0' }}>
        {tab === 'fakta' && <FaktaTab detail={detail} timezone={timezone} />}
        {tab === 'langsung' && <LangsungTab detail={detail} />}
        {tab === 'lineup' && <LineupTab detail={detail} />}
        {tab === 'tabel' && <TabelTab detail={detail} />}
        {tab === 'statistik' && <StatistikTab detail={detail} />}
      </div>
    </div>
  );
}

// ==================== TAB 1: FAKTA ====================
function FaktaTab({ detail, timezone }: { detail: MatchDetailData; timezone: string }) {
  const infoBox = detail.content?.matchFacts?.infoBox;
  const potm = detail.content?.matchFacts?.playerOfTheMatch;
  const events = (detail.content?.matchFacts?.events as any)?.incidents || [];
  const shotmap = detail.content?.shotmap?.shots || [];
  const header = detail.header!;

  // Match facts: missed shots, saves, etc.
  const goals = events.filter((e: any) => e.type === 'goal');
  const missedShots = shotmap.filter((s: any) => !s.goalCrossed && !s.isOnTarget);
  const onTargetShots = shotmap.filter((s: any) => s.isOnTarget && !s.goalCrossed);

  return (
    <div>
      {/* POTM */}
      {potm && potm.name && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#222', marginBottom: 16 }}>
          {potm.id && (
            <img src={`https://images.fotmob.com/image_resources/playerimage/player/${potm.id}.png`} alt=""
              style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          )}
          <div>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Player of the Match</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 4 }}>
              {typeof potm.name === 'object' ? potm.name.fullName || `${potm.name.firstName || ''} ${potm.name.lastName || ''}`.trim() : potm.name}
            </div>
            {potm.teamName && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{potm.teamName}</div>}
          </div>
          {potm.rating?.num && (
            <span style={{ marginLeft: 'auto', background: potm.rating.bgcolor || '#00D26A', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 14, fontWeight: 800 }}>
              {potm.rating.num}
            </span>
          )}
        </div>
      )}

      {/* Match Info */}
      {infoBox && (
        <div style={{ background: '#222', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontSize: 14, fontWeight: 700, color: '#fff' }}>Match Info</div>
          {infoBox.tournament?.leagueName && (
            <InfoItem label="Competition" value={`${infoBox.tournament.leagueName}${infoBox.tournament.roundName ? ` - ${infoBox.tournament.roundName}` : ''}`} />
          )}
          {header.status?.utcTime && (
            <InfoItem label="Date & Time" value={new Date(header.status.utcTime).toLocaleString('en-US', { timeZone: timezone, dateStyle: 'medium', timeStyle: 'short' })} />
          )}
          {infoBox.stadium?.name && (
            <InfoItem label="Stadium" value={`${infoBox.stadium.name}${infoBox.stadium.city ? `, ${infoBox.stadium.city}` : ''}${infoBox.stadium.capacity ? ` (${infoBox.stadium.capacity.toLocaleString()})` : ''}`} />
          )}
          {infoBox.stadium?.surface && <InfoItem label="Surface" value={infoBox.stadium.surface} />}
          {infoBox.referee?.text && (
            <InfoItem label="Referee" value={infoBox.referee.text} />
          )}
          {infoBox.attendance && <InfoItem label="Attendance" value={infoBox.attendance.toLocaleString()} />}
        </div>
      )}

      {/* Team Form */}
      {infoBox?.teamForm && (
        <div style={{ background: '#222', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontSize: 14, fontWeight: 700, color: '#fff' }}>Form</div>
          <div style={{ display: 'flex', gap: 24, padding: '12px 16px' }}>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{header.teams[0]?.name}</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {(infoBox.teamForm.home || []).slice(-5).map((r: string, i: number) => (
                  <span key={i} style={{
                    width: 22, height: 22, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    background: r === 'W' ? '#00D26A' : r === 'L' ? '#FF4444' : '#666',
                  }}>{r}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{header.teams[1]?.name}</div>
              <div style={{ display: 'flex', gap: 3 }}>
                {(infoBox.teamForm.away || []).slice(-5).map((r: string, i: number) => (
                  <span key={i} style={{
                    width: 22, height: 22, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    background: r === 'W' ? '#00D26A' : r === 'L' ? '#FF4444' : '#666',
                  }}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shot Summary */}
      {shotmap.length > 0 && (
        <div style={{ background: '#222', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontSize: 14, fontWeight: 700, color: '#fff' }}>Shots</div>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{shotmap.filter(s => s.teamId === header.teams[0]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#00D26A' }}>{onTargetShots.filter(s => s.teamId === header.teams[0]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>On Target</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FF4444' }}>{missedShots.filter(s => s.teamId === header.teams[0]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Off Target</div>
            </div>
            <div style={{ width: 1, background: '#333' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{shotmap.filter(s => s.teamId === header.teams[1]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#00D26A' }}>{onTargetShots.filter(s => s.teamId === header.teams[1]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>On Target</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#FF4444' }}>{missedShots.filter(s => s.teamId === header.teams[1]?.id).length}</div>
              <div style={{ fontSize: 11, color: '#666' }}>Off Target</div>
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div style={{ background: '#222', marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontSize: 14, fontWeight: 700, color: '#fff' }}>Goals</div>
          {goals.map((g: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid #1A1A1A', flexDirection: g.isHome ? 'row' : 'row-reverse' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 30, textAlign: g.isHome ? 'left' : 'right' }}>{g.time?.formatted || ''}</span>
              <span style={{ fontSize: 16 }}>⚽</span>
              <div style={{ flex: 1, textAlign: g.isHome ? 'left' : 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{g.player?.name || ''}</div>
                {g.assist?.player?.name && <div style={{ fontSize: 11, color: '#666' }}>Assist: {g.assist.player.name}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== TAB 2: LANGSUNG (LIVE/EVENTS) ====================
function LangsungTab({ detail }: { detail: MatchDetailData }) {
  const events = (detail.content?.matchFacts?.events as any)?.incidents || [];
  const momentum = (detail.content?.momentum as any)?.main?.data || [];
  const shotmap = detail.content?.shotmap?.shots || [];

  const eventIcons: Record<string, string> = {
    goal: '⚽', yellowcard: '🟨', redcard: '🟥', substitution: '🔄',
    varDecision: '📺', penalty: '⚽', missedPenalty: '❌', ownGoal: '⚽',
    injury: '🏥', injuryTime: '⏱️', kickoff: '🏁', halftime: '🏁', fulltime: '🏁',
  };

  return (
    <div>
      {/* Momentum */}
      {momentum.length > 0 && (
        <div style={{ background: '#222', marginBottom: 16, padding: '16px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Momentum</div>
          <div style={{ display: 'flex', alignItems: 'center', height: 40, gap: 1 }}>
            {momentum.map((m: any, i: number) => {
              const val = m.value || 0;
              const height = Math.min(40, Math.abs(val) * 0.4);
              const isHome = val >= 0;
              return (
                <div key={i} style={{
                  flex: 1, height: `${height}px`, background: isHome ? '#00D26A' : '#555',
                  borderRadius: 2, opacity: 0.8,
                }} title={`Min ${m.minute}: ${val}`} />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#666' }}>
            <span>0'</span><span>45'</span><span>90'</span>
          </div>
        </div>
      )}

      {/* Event Timeline */}
      {events.length > 0 && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', padding: '12px 0', borderBottom: '1px solid #333', marginBottom: 8 }}>Events</div>
          {events.map((evt: any, i: number) => {
            const icon = eventIcons[evt.type] || '📌';
            const isHome = evt.isHome;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid #1A1A1A', flexDirection: isHome ? 'row' : 'row-reverse',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#666', minWidth: 30, textAlign: isHome ? 'left' : 'right' }}>
                  {evt.time?.formatted || evt.minute || ''}
                </span>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, textAlign: isHome ? 'left' : 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{evt.player?.name || ''}</div>
                  {evt.assist?.player?.name && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Assist: {evt.assist.player.name}</div>}
                  {evt.incidentClass && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{evt.incidentClass}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shotmap */}
      {shotmap.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', padding: '12px 0', borderBottom: '1px solid #333', marginBottom: 8 }}>Shotmap</div>
          {shotmap.map((shot: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
              borderBottom: '1px solid #1A1A1A',
            }}>
              <span style={{ fontSize: 12, color: '#666', minWidth: 30 }}>{shot.min}'</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', flex: 1 }}>{shot.playerName || ''}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 3,
                background: shot.goalCrossed ? 'rgba(0,210,106,0.2)' : shot.isOnTarget ? 'rgba(255,200,0,0.2)' : 'rgba(255,68,68,0.2)',
                color: shot.goalCrossed ? '#00D26A' : shot.isOnTarget ? '#FFC800' : '#FF4444',
              }}>
                {shot.goalCrossed ? 'GOAL' : shot.isOnTarget ? 'On Target' : 'Missed'}
              </span>
              {shot.expectedGoals !== undefined && (
                <span style={{ fontSize: 11, color: '#666', minWidth: 40, textAlign: 'right' }}>xG: {shot.expectedGoals.toFixed(2)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Live Player Ratings */}
      {detail.content?.playerStats && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', padding: '12px 0', borderBottom: '1px solid #333', marginBottom: 8 }}>Player Ratings</div>
          {Object.entries(detail.content.playerStats).sort(([, a]: any, [, b]: any) => {
            const ratingA = a.stats?.find((s: any) => s.key === 'rating')?.stats?.Average?.[0] || 0;
            const ratingB = b.stats?.find((s: any) => s.key === 'rating')?.stats?.Average?.[0] || 0;
            return ratingB - ratingA;
          }).map(([pid, pdata]: any) => {
            const rating = pdata.stats?.find((s: any) => s.key === 'rating')?.stats?.Average?.[0];
            if (!rating) return null;
            return (
              <div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1A1A1A' }}>
                <img src={`https://images.fotmob.com/image_resources/playerimage/player/${pid}.png`} alt=""
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{pdata.name || ''}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{pdata.teamName || ''}</span>
                <span style={{
                  fontSize: 14, fontWeight: 800, padding: '4px 8px', borderRadius: 4,
                  background: rating >= 7 ? '#00D26A' : rating >= 6 ? '#333' : '#FF4444',
                  color: '#fff', minWidth: 30, textAlign: 'center',
                }}>{rating.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== TAB 3: LINEUP ====================
function LineupTab({ detail }: { detail: MatchDetailData }) {
  const lineup = detail.content?.lineup;
  const header = detail.header!;

  if (!lineup) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No lineup data available</div>;
  }

  const renderPitch = (team: any, side: 'home' | 'away') => {
    if (!team) return null;
    const starters = team.startingXI || team.starters || [];
    const subs = team.substitutes || team.subs || [];
    const coach = Array.isArray(team.coach) ? team.coach[0] : team.coach;
    const teamData = side === 'home' ? header.teams[0] : header.teams[1];

    return (
      <div style={{ marginBottom: 32 }}>
        {/* Team header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 0', borderBottom: '1px solid #333' }}>
          <img src={teamLogoUrl(teamData?.id)} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{team.name || teamData?.name || ''}</span>
          {team.formation && <span style={{ fontSize: 14, fontWeight: 700, color: '#00D26A', marginLeft: 'auto' }}>{team.formation}</span>}
          {coach?.name && <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>Coach: {coach.name}</span>}
        </div>

        {/* Pitch SVG */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto', aspectRatio: '3/4' }}>
          {/* Pitch background */}
          <svg viewBox="0 0 300 400" style={{ width: '100%', height: '100%' }}>
            {/* Grass */}
            <rect x="0" y="0" width="300" height="400" fill="#1a472a" rx="4" />
            {/* Stripes */}
            <rect x="0" y="0" width="300" height="50" fill="#1d4f30" />
            <rect x="0" y="100" width="300" height="50" fill="#1d4f30" />
            <rect x="0" y="200" width="300" height="50" fill="#1d4f30" />
            <rect x="0" y="300" width="300" height="50" fill="#1d4f30" />
            {/* Outline */}
            <rect x="10" y="10" width="280" height="380" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            {/* Center line */}
            <line x1="10" y1="200" x2="290" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            {/* Center circle */}
            <circle cx="150" cy="200" r="40" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle cx="150" cy="200" r="3" fill="rgba(255,255,255,0.3)" />
            {/* Top penalty box */}
            <rect x="60" y="10" width="180" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <rect x="100" y="10" width="100" height="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle cx="150" cy="52" r="3" fill="rgba(255,255,255,0.3)" />
            {/* Top goal */}
            <rect x="120" y="2" width="60" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            {/* Bottom penalty box */}
            <rect x="60" y="330" width="180" height="60" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <rect x="100" y="365" width="100" height="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <circle cx="150" cy="348" r="3" fill="rgba(255,255,255,0.3)" />
            {/* Bottom goal */}
            <rect x="120" y="390" width="60" height="8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </svg>

          {/* Players on pitch */}
          {starters.map((p: any, i: number) => {
            const player = p.player || p;
            const py = (p.x ?? player.x ?? 0.5) * 100; // x = along pitch length → vertical (top)
            const px = (p.y ?? player.y ?? 0.5) * 100; // y = across pitch width → horizontal (left)
            const rating = p.performance?.rating || player.rating;
            const ratingNum = parseFloat(rating);
            const pid = player.id || p.id;

            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${px}%`,
                top: `${py}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                zIndex: 10,
              }}>
                {/* Player photo circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: ratingNum >= 7 ? '#00D26A' : ratingNum >= 6 ? '#444' : '#666',
                  border: `2px solid ${ratingNum >= 7 ? '#00D26A' : ratingNum >= 6 ? '#888' : '#555'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', position: 'relative',
                }}>
                  <img src={`https://images.fotmob.com/image_resources/playerimage/player/${pid}.png`} alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  {/* Shirt number overlay */}
                  <span style={{
                    position: 'absolute', bottom: -1, right: -1,
                    background: '#000', color: '#fff', fontSize: 9, fontWeight: 800,
                    width: 16, height: 16, borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #333',
                  }}>{player.shirtNumber || p.shirtNumber || ''}</span>
                </div>
                {/* Player name */}
                <span style={{
                  fontSize: 9, fontWeight: 700, color: '#fff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis',
                  textAlign: 'center',
                }}>
                  {(player.lastName || player.name || '').split(' ').pop()}
                </span>
                {/* Rating badge */}
                {rating && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: '#fff',
                    background: ratingNum >= 7 ? '#00D26A' : ratingNum >= 6 ? '#555' : '#FF4444',
                    padding: '1px 4px', borderRadius: 3,
                  }}>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Substitutes */}
        {subs.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Substitutes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {subs.map((p: any, i: number) => {
                const player = p.player || p;
                const pid = player.id || p.id;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
                    background: '#222', borderRadius: 6,
                  }}>
                    <img src={`https://images.fotmob.com/image_resources/playerimage/player/${pid}.png`} alt=""
                      style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#666' }}>{player.shirtNumber || p.shirtNumber || ''}</span>
                    <span style={{ fontSize: 12, color: '#ccc' }}>{player.name || p.name || ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {renderPitch(lineup.homeTeam, 'home')}
      <div style={{ height: 1, background: '#333', margin: '24px 0' }} />
      {renderPitch(lineup.awayTeam, 'away')}
    </div>
  );
}

// ==================== TAB 4: TABEL (STANDINGS) ====================
function TabelTab({ detail }: { detail: MatchDetailData }) {
  const tableData = detail.content?.table;
  const navigate = useNavigate();

  if (!tableData) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No standings data available</div>;
  }

  // Extract rows from table data
  let rows: any[] = [];
  if (Array.isArray(tableData)) {
    for (const item of tableData) {
      if (item.allStages) {
        for (const stage of item.allStages) {
          if (stage.tables) {
            for (const t of stage.tables) {
              if (t.data && t.data.length > 0) { rows = t.data; break; }
            }
          }
          if (rows.length > 0) break;
        }
      }
      if (rows.length === 0 && item.tables) {
        for (const t of item.tables) {
          if (t.data && t.data.length > 0) { rows = t.data; break; }
        }
      }
      if (rows.length === 0 && Array.isArray(item) && item.length > 0 && item[0].name) {
        rows = item;
      }
    }
  }

  if (rows.length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No standings data available</div>;
  }

  const hasForm = rows.some((r: any) => r.matchesForm || r.form);

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
          {rows.map((row: any, i: number) => {
            const teamId = row.id || row.teamId;
            const form = row.matchesForm || row.form || [];
            const gd = row.goalConDiff ?? row.gd ?? ((row.goalsFor ?? row.gf ?? 0) - (row.goalsAgainst ?? row.ga ?? 0));
            const isCurrentHome = teamId === detail.header?.teams[0]?.id;
            const isCurrentAway = teamId === detail.header?.teams[1]?.id;
            const isHighlighted = isCurrentHome || isCurrentAway;

            return (
              <tr key={i} style={{ cursor: teamId ? 'pointer' : 'default', background: isHighlighted ? 'rgba(0,210,106,0.08)' : 'transparent' }}
                onClick={() => teamId && navigate(`/club/${teamId}`)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isHighlighted ? 'rgba(0,210,106,0.08)' : 'transparent'; }}
              >
                <td style={tableTd(true)}>{row.idx ?? i + 1}</td>
                <td style={{ ...tableTd(false), textAlign: 'left' as const }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={teamLogoUrl(teamId)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    <span style={{ fontWeight: isHighlighted ? 700 : 500, color: isHighlighted ? '#00D26A' : '#fff' }}>{row.name || row.team || ''}</span>
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
                        const bgColor = result === 'W' ? '#00D26A' : result === 'L' ? '#FF4444' : '#666';
                        return <span key={fi} style={{ width: 20, height: 20, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', background: bgColor }}>{result}</span>;
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

// ==================== TAB 5: STATISTIK ====================
function StatistikTab({ detail }: { detail: MatchDetailData }) {
  const statsRaw = detail.content?.stats as any;
  const stats = statsRaw?.Periods?.All?.stats || statsRaw || [];
  const playerStats = detail.content?.playerStats || {};

  if ((!stats || stats.length === 0) && Object.keys(playerStats).length === 0) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>No statistics available</div>;
  }

  // Group stats by category
  const statGroups: Record<string, string[]> = {
    'Team Stats': ['Ball possession', 'Total shots', 'Shots on target', 'Shots off target', 'Blocked shots', 'Expected goals', 'xG', 'Big chances', 'Big chances missed', 'Corners', 'Offsides', 'Fouls', 'Yellow cards', 'Red cards', 'Saves'],
    'Passing': ['Passes', 'Accurate passes', 'Pass accuracy', 'Long balls', 'Crosses', 'Accurate crosses', 'Throw-ins', 'Goal kicks', 'Free kicks'],
    'Defensive': ['Tackles', 'Interceptions', 'Clearances', 'Blocks', 'Recoveries', 'Duels won', 'Aerial duels won'],
    'Attacking': ['Dribbles', 'Successful dribbles', 'Touches in opponent box', 'Chances created'],
    'Goalkeeper': ['Saves', 'Punches', 'High claims', 'Sweeper actions', 'Save percentage'],
  };

  return (
    <div>
      {/* Team Stats */}
      {stats.length > 0 && Object.entries(statGroups).map(([groupName, keywords]) => {
        const groupStats = stats.filter((s: any) => {
          const title = (s.title || s.key || '').toLowerCase();
          return keywords.some(k => title.includes(k.toLowerCase()));
        });
        if (groupStats.length === 0) return null;

        return (
          <div key={groupName} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#00D26A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, padding: '8px 0', borderBottom: '1px solid #333' }}>
              {groupName}
            </div>
            {groupStats.map((stat: any, i: number) => {
              const homeVal = typeof stat.home === 'number' ? stat.home : parseFloat(stat.home) || 0;
              const awayVal = typeof stat.away === 'number' ? stat.away : parseFloat(stat.away) || 0;
              const total = homeVal + awayVal;
              const homePct = total > 0 ? (homeVal / total) * 100 : 50;
              const isPercentage = stat.key === 'possession' || stat.title?.toLowerCase().includes('possession') || stat.title?.toLowerCase().includes('accuracy');

              return (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #2A2A2A' }}>
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

      {/* Player Stats */}
      {Object.keys(playerStats).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#00D26A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, padding: '8px 0', borderBottom: '1px solid #333' }}>
            Player Stats
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr>
                  <th style={tableTh('Player')}>Player</th>
                  <th style={tableTh('Rating')}>Rating</th>
                  <th style={tableTh('Goals')}>Goals</th>
                  <th style={tableTh('Assists')}>Assists</th>
                  <th style={tableTh('Shots')}>Shots</th>
                  <th style={tableTh('Key Passes')}>Key Passes</th>
                  <th style={tableTh('Pass Acc')}>Pass Acc</th>
                  <th style={tableTh('Tackles')}>Tackles</th>
                  <th style={tableTh('Interceptions')}>Interceptions</th>
                  <th style={tableTh('Dribbles')}>Dribbles</th>
                  <th style={tableTh('Fouls')}>Fouls</th>
                  <th style={tableTh('Fouls Won')}>Fouls Won</th>
                  <th style={tableTh('YC')}>YC</th>
                  <th style={tableTh('RC')}>RC</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(playerStats).map(([pid, pdata]: any) => {
                  const s = pdata.stats || [];
                  const get = (key: string) => {
                    const stat = s.find((st: any) => st.key === key);
                    return stat?.stats?.[Object.keys(stat.stats)[0]]?.[0] ?? '-';
                  };
                  return (
                    <tr key={pid}>
                      <td style={{ ...tableTd(false), textAlign: 'left' as const }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <img src={`https://images.fotmob.com/image_resources/playerimage/player/${pid}.png`} alt=""
                            style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                          <span style={{ fontSize: 12 }}>{pdata.name}</span>
                        </div>
                      </td>
                      <td style={tableTd(true)}><span style={{ fontWeight: 700, color: '#00D26A' }}>{get('rating')}</span></td>
                      <td style={tableTd(true)}>{get('goals')}</td>
                      <td style={tableTd(true)}>{get('assists')}</td>
                      <td style={tableTd(true)}>{get('totalScoringAttempt')}</td>
                      <td style={tableTd(true)}>{get('keyPass')}</td>
                      <td style={tableTd(true)}>{get('passAccuracy')}</td>
                      <td style={tableTd(true)}>{get('tackle')}</td>
                      <td style={tableTd(true)}>{get('interception')}</td>
                      <td style={tableTd(true)}>{get('dribble')}</td>
                      <td style={tableTd(true)}>{get('fouls')}</td>
                      <td style={tableTd(true)}>{get('wasFouled')}</td>
                      <td style={tableTd(true)}>{get('yellowCard')}</td>
                      <td style={tableTd(true)}>{get('redCard')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Shared helpers ---
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #2A2A2A' }}>
      <span style={{ fontSize: 13, color: '#666' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{value}</span>
    </div>
  );
}

function tableTh(label: string): React.CSSProperties {
  return {
    fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase' as const,
    letterSpacing: 0.5, padding: '8px 4px', borderBottom: '1px solid #333',
    textAlign: 'center' as const, whiteSpace: 'nowrap' as const,
  };
}

function tableTd(center?: boolean, _highlight?: boolean): React.CSSProperties {
  return {
    fontSize: 12, padding: '8px 4px', borderBottom: '1px solid #2A2A2A',
    textAlign: center ? 'center' : 'left', whiteSpace: 'nowrap' as const,
  };
}

function playerPhotoUrl(id: number): string {
  return `https://images.fotmob.com/image_resources/playerimage/player/${id}.png`;
}
