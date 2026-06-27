import { useState, useEffect } from 'react';
import { FotMobDetail, fotmobIdMap, Match } from '../api';
import { ArrowLeft, Activity, Users, Swords, Goal, Clock } from 'lucide-react';

interface Props {
  match: Match;
  onBack: () => void;
}

export default function MatchDetail({ match, onBack }: Props) {
  const [detail, setDetail] = useState<FotMobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stats' | 'lineup' | 'events'>('stats');

  useEffect(() => {
    loadDetail();
  }, [match.idEvent]);

  async function loadDetail() {
    setLoading(true);
    try {
      const fotmobId = fotmobIdMap[match.idEvent];
      if (!fotmobId) {
        setLoading(false);
        return;
      }
      const res = await fetch(`http://localhost:3001/api/fotmob/match/${fotmobId}`);
      if (res.ok) {
        const json = await res.json();
        setDetail(json?.data || null);
      }
    } finally {
      setLoading(false);
    }
  }

  const stats = detail?.content?.pageData?.stats?.Stats || detail?.content?.pageData?.stats || [];
  const lineups = detail?.content?.pageData?.lineup;
  const events = detail?.content?.pageData?.events || [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to matches</span>
      </button>

      {/* Match header */}
      <div className="match-card p-6 text-center">
        <span className="text-xs text-muted">{match.strLeague}</span>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex flex-col items-center gap-2">
            {match.strHomeTeamBadge ? (
              <img src={match.strHomeTeamBadge} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted">
                {match.strHomeTeam?.[0]}
              </div>
            )}
            <span className="text-sm font-medium">{match.strHomeTeam}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${match.intHomeScore && match.intHomeScore !== '0' ? 'text-accent' : 'text-muted'}`}>
              {match.intHomeScore || '0'}
            </span>
            <span className="text-muted text-lg">—</span>
            <span className={`text-3xl font-bold ${match.intAwayScore && match.intAwayScore !== '0' ? 'text-accent' : 'text-muted'}`}>
              {match.intAwayScore || '0'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            {match.strAwayTeamBadge ? (
              <img src={match.strAwayTeamBadge} alt="" className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted">
                {match.strAwayTeam?.[0]}
              </div>
            )}
            <span className="text-sm font-medium">{match.strAwayTeam}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted">
          <span className="flex items-center gap-1"><Clock size={12} />{match.strTime}</span>
          <span className="flex items-center gap-1">📍{match.strVenue}</span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!detail && !loading && (
        <div className="text-center py-8 text-muted text-sm">
          <Activity size={32} className="mx-auto mb-2 opacity-50" />
          <p>Detailed stats not available for this match</p>
        </div>
      )}

      {detail && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            {[
              { id: 'stats' as const, label: 'Stats', icon: Activity },
              { id: 'lineup' as const, label: 'Lineups', icon: Users },
              { id: 'events' as const, label: 'Events', icon: Goal },
            ].map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    tab === t.id
                      ? 'bg-accent text-white shadow-lg shadow-accent/20'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  <Icon size={13} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === 'stats' && <StatsTab stats={stats} />}
          {tab === 'lineup' && <LineupTab lineups={lineups} />}
          {tab === 'events' && <EventsTab events={events} homeTeam={match.strHomeTeam} />}
        </>
      )}
    </div>
  );
}

function StatsTab({ stats }: { stats: any[] }) {
  if (!stats || stats.length === 0) {
    return <div className="text-center py-8 text-muted text-sm">No statistics available</div>;
  }

  return (
    <div className="match-card p-4 space-y-3">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Match Statistics</h3>
      {stats.map((stat: any, i: number) => {
        const homeVal = stat?.home || stat?.homeDisplay || stat?.homeValue || '0';
        const awayVal = stat?.away || stat?.awayDisplay || stat?.awayValue || '0';
        const title = stat?.title || stat?.name || stat?.statName || 'Stat';
        const total = parseFloat(homeVal) + parseFloat(awayVal);
        const homePct = total > 0 ? (parseFloat(homeVal) / total) * 100 : 50;

        return (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className={`font-medium ${parseFloat(homeVal) >= parseFloat(awayVal) ? 'text-accent' : 'text-muted'}`}>
                {homeVal}
              </span>
              <span className="text-[10px] text-muted">{title}</span>
              <span className={`font-medium ${parseFloat(awayVal) >= parseFloat(homeVal) ? 'text-accent' : 'text-muted'}`}>
                {awayVal}
              </span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${homePct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineupTab({ lineups }: { lineups: any }) {
  const home = lineups?.home || lineups?.[0];
  const away = lineups?.away || lineups?.[1];

  if (!home && !away) {
    return <div className="text-center py-8 text-muted text-sm">No lineup data available</div>;
  }

  const renderFormation = (team: any, side: 'home' | 'away') => {
    const formation = team.formation || team.formationName || 'N/A';
    const players = team.startingXI || team.players?.startingXI || team.lineup || [];

    return (
      <div className={`flex-1 ${side === 'away' ? 'text-right' : ''}`}>
        <h4 className="text-xs font-semibold text-muted mb-3">
          {formation}
          <span className="block text-[10px] text-muted mt-1">Formation</span>
        </h4>
        <div className="space-y-1">
          {players.map((p: any, i: number) => (
            <div key={i} className={`flex items-center gap-2 text-xs ${side === 'away' ? 'flex-row-reverse' : ''}`}>
              <span className="font-mono text-[10px] text-muted w-4">{p.shirtNumber || p.number || '—'}</span>
              <span className={p.isCaptain ? 'font-semibold text-accent' : ''}>
                {p.name || p.playerName || p.player?.name || 'Unknown'}
                {p.isCaptain ? ' (C)' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="match-card p-4">
      <div className="flex gap-6">
        {home && renderFormation(home, 'home')}
        {away && renderFormation(away, 'away')}
      </div>

      {/* Substitutes */}
      {(home?.substitutes || home?.subs) && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-[10px] font-semibold text-muted uppercase mb-2">Substitutes</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {(home?.substitutes || home?.subs || []).map((p: any, i: number) => (
              <span key={i} className="text-secondary">{p.name || p.playerName || p.player?.name || '—'}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsTab({ events, homeTeam }: { events: any[]; homeTeam: string }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-8 text-muted text-sm">No events available</div>;
  }

  return (
    <div className="match-card p-4">
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Match Timeline</h3>
      <div className="space-y-0">
        {events.map((evt: any, i: number) => {
          const isHome = evt.home || evt.team === 'home' || evt.teamName === homeTeam;
          const eventType = evt.type?.toLowerCase() || evt.event?.toLowerCase() || 'event';
          const minute = evt.minute ?? evt.time ?? '?';
          const player = evt.playerName || evt.player || evt.player?.name || '';
          const assist = evt.assistName || evt.assist || '';

          const iconMap: Record<string, string> = {
            goal: '⚽',
            'yellow card': '🟨',
            'red card': '🟥',
            substitution: '🔄',
            'substitution': '🔄',
            var: '📺',
            penalty: '⚽',
          };

          const icon = Object.entries(iconMap).find(([k]) => eventType.includes(k))?.[1] || '📌';

          return (
            <div key={i} className={`event-line flex items-center gap-3 py-2 ${isHome ? '' : 'flex-row-reverse text-right'}`}>
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  eventType.includes('goal') || eventType.includes('penalty')
                    ? 'bg-accent/20'
                    : eventType.includes('card')
                    ? 'bg-warning/20'
                    : 'bg-secondary'
                }`}>
                  {icon}
                </div>
              </div>
              <div className={`flex-1 ${isHome ? 'text-left' : 'text-right'}`}>
                <div className="flex items-center gap-1.5">
                  {!isHome && <div className="flex-1" />}
                  <span className="font-mono text-[10px] text-muted">{minute}'</span>
                  <span className={`text-xs font-medium ${
                    eventType.includes('goal') ? 'text-accent' : 'text-primary'
                  }`}>{player}</span>
                </div>
                {assist && (
                  <div className="text-[10px] text-muted mt-0.5">
                    Assist: {assist}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
