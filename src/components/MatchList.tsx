import { useState, useEffect, useCallback } from 'react';
import { Match, MatchDetail, fetchTodayMatches, fetchMatchDetail, fotmobIdMap } from '../api';
import { Calendar, Clock, MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ID', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(timeStr: string): string {
  return timeStr?.substring(0, 5) || '';
}

function getBadge(text: string): string {
  return text?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || '??';
}

export default function MatchList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [details, setDetails] = useState<Record<string, MatchDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoading(true);
    try {
      const data = await fetchTodayMatches();
      setMatches(data);
      // Load details in background
      for (const m of data) {
        const fotmobId = fotmobIdMap[m.idEvent];
        if (fotmobId) {
          loadDetail(m.idEvent, fotmobId);
        }
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(eventId: string, fotmobId: string) {
    setLoadingDetail(prev => ({ ...prev, [eventId]: true }));
    try {
      const detail = await fetchMatchDetail(fotmobId);
      if (detail) {
        setDetails(prev => ({ ...prev, [eventId]: { basic: matches.find(m => m.idEvent === eventId)!, fotmob: detail } }));
      }
    } finally {
      setLoadingDetail(prev => ({ ...prev, [eventId]: false }));
    }
  }

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  function getStatusBadge(status: string) {
    const s = status?.toLowerCase() || '';
    if (s === 'live') return <span className="status-live px-2.5 py-0.5 rounded-full text-xs font-semibold animate-live">● LIVE</span>;
    if (s === 'ft' || s === 'finished') return <span className="status-ft px-2.5 py-0.5 rounded-full text-xs font-semibold">FT</span>;
    if (s === 'ht') return <span className="status-ht px-2.5 py-0.5 rounded-full text-xs font-semibold">HT</span>;
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }}>{status}</span>;
  }

  function getStats(detail: MatchDetail) {
    const stats = detail?.fotmob?.content?.pageData?.stats;
    const lineups = detail?.fotmob?.content?.pageData?.lineup;
    const events = detail?.fotmob?.content?.pageData?.events;

    return { stats, lineups, events };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-secondary">Loading matches...</span>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-secondary gap-2">
        <Calendar size={40} strokeWidth={1.5} />
        <p className="text-lg font-medium">No matches today</p>
        <p className="text-sm">Check back later for upcoming fixtures</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Group by league */}
      <div className="flex items-center gap-2 px-1 mb-2">
        <div className="w-1 h-4 bg-accent rounded-full" />
        <span className="text-xs font-medium text-secondary uppercase tracking-wider">World Cup 2026</span>
        <span className="text-xs text-muted">— {matches.length} matches</span>
      </div>

      {matches.map((match, idx) => {
        const matchDetail = details[match.idEvent];
        const { stats, events: matchEvents } = matchDetail ? getStats(matchDetail) : { stats: null, events: null };

        return (
          <div
            key={match.idEvent}
            className="match-card animate-fade-in overflow-hidden"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Main row */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer select-none"
              onClick={() => toggleExpand(match.idEvent)}
            >
              {/* Time/Date */}
              <div className="flex flex-col items-center min-w-[56px]">
                <span className="text-[10px] text-muted uppercase">{formatDate(match.dateEvent)}</span>
                <span className="text-sm font-semibold text-primary">{formatTime(match.strTime)}</span>
                {getStatusBadge(match.strStatus)}
              </div>

              {/* Teams & Score */}
              <div className="flex-1 flex items-center justify-center gap-3 md:gap-6">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-1.5 w-[80px] md:w-[120px]">
                  {match.strHomeTeamBadge ? (
                    <img src={match.strHomeTeamBadge} alt={match.strHomeTeam} className="w-8 h-8 md:w-10 md:h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted">{getBadge(match.strHomeTeam)}</div>
                  )}
                  <span className="text-xs md:text-sm font-medium text-center leading-tight">{match.strHomeTeam}</span>
                </div>

                {/* Score */}
                <div className="flex items-center gap-2">
                  <span className={`text-xl md:text-2xl font-bold tabular-nums ${match.intHomeScore !== null && match.intHomeScore !== '0' ? 'text-accent' : 'text-muted'}`}>
                    {match.intHomeScore ?? '-'}
                  </span>
                  <span className="text-muted text-xs font-medium">vs</span>
                  <span className={`text-xl md:text-2xl font-bold tabular-nums ${match.intAwayScore !== null && match.intAwayScore !== '0' ? 'text-accent' : 'text-muted'}`}>
                    {match.intAwayScore ?? '-'}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-1.5 w-[80px] md:w-[120px]">
                  {match.strAwayTeamBadge ? (
                    <img src={match.strAwayTeamBadge} alt={match.strAwayTeam} className="w-8 h-8 md:w-10 md:h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted">{getBadge(match.strAwayTeam)}</div>
                  )}
                  <span className="text-xs md:text-sm font-medium text-center leading-tight">{match.strAwayTeam}</span>
                </div>
              </div>

              {/* Expand */}
              <div className="flex-shrink-0 text-muted">
                {loadingDetail[match.idEvent] ? (
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  expanded[match.idEvent] ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                )}
              </div>
            </div>

            {/* Footer info */}
            <div className="px-4 pb-3 flex items-center gap-3 text-[11px] text-muted">
              {match.strVenue && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {match.strVenue}{match.strCity ? `, ${match.strCity}` : ''}
                </span>
              )}
              {match.strGroup && (
                <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(100,116,139,0.1)' }}>
                  Group {match.strGroup}
                </span>
              )}
            </div>

            {/* Expanded: Stats section */}
            {expanded[match.idEvent] && matchDetail && stats && (
              <MatchStats
                stats={stats}
                events={matchEvents}
                homeTeam={match.strHomeTeam}
                awayTeam={match.strAwayTeam}
                matchId={match.idEvent}
              />
            )}

            {/* Expanded: Detail not loaded yet */}
            {expanded[match.idEvent] && !matchDetail && !loadingDetail[match.idEvent] && (
              <div className="px-4 pb-4 pt-0">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <ExternalLink size={12} />
                  <span>Detailed stats available via FotMob</span>
                </div>
              </div>
            )}

            {/* Expanded: Loading */}
            {expanded[match.idEvent] && loadingDetail[match.idEvent] && (
              <div className="px-4 pb-4 pt-0">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  <span>Loading detailed stats...</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MatchStats({ stats, events, homeTeam, awayTeam, matchId }: {
  stats: any;
  events: any[];
  homeTeam: string;
  awayTeam: string;
  matchId: string;
}) {
  // Parse stats from FotMob format
  // FotMob stats is an array of stat items
  // Example: [{title: 'Ball Possession', home: '45', away: '55', ...}]
  let statItems: any[] = [];

  if (stats?.Stats) {
    statItems = stats.Stats;
  } else if (Array.isArray(stats)) {
    statItems = stats;
  } else if (stats?.pageData?.stats?.Stats) {
    statItems = stats.pageData.stats.Stats;
  } else if (stats?.pageData?.stats) {
    statItems = stats.pageData.stats;
  }

  // Parse events
  let matchEvents: any[] = [];
  if (Array.isArray(events)) matchEvents = events;
  else if (events?.pageData?.events) matchEvents = events.pageData.events;

  // Key stats we always want to show
  const keyStats = [
    { key: 'Ball Possession', label: 'Possession', icon: '%' },
    { key: 'Expected Goals', label: 'xG', icon: '' },
    { key: 'Total shots', label: 'Shots', icon: '' },
    { key: 'Shots on target', label: 'Shots on Target', icon: '' },
    { key: 'Shots off target', label: 'Shots off Target', icon: '' },
    { key: 'Corner kicks', label: 'Corners', icon: '' },
    { key: 'Yellow cards', label: 'Yellow Cards', icon: '' },
    { key: 'Red cards', label: 'Red Cards', icon: '' },
    { key: 'Fouls', label: 'Fouls', icon: '' },
    { key: 'Total passes', label: 'Passes', icon: '' },
    { key: 'Offsides', label: 'Offsides', icon: '' },
  ];

  if (!statItems || statItems.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border">
      <div className="p-4 space-y-4">
        {/* Stats grid */}
        <div className="space-y-2.5">
          <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Match Statistics</h4>
          {statItems.map((stat: any, i: number) => {
            const homeVal = stat?.home || stat?.homeValue || stat?.homeDisplay || stat?.home?.toString() || '0';
            const awayVal = stat?.away || stat?.awayValue || stat?.awayDisplay || stat?.away?.toString() || '0';
            const title = stat?.title || stat?.name || stat?.statName || 'Stat';
            const total = parseFloat(homeVal) + parseFloat(awayVal);
            const homePct = total > 0 ? (parseFloat(homeVal) / total) * 100 : 50;

            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium w-20 text-right ${parseFloat(homeVal) > parseFloat(awayVal) ? 'text-accent' : 'text-secondary'}`}>
                    {title === 'Expected Goals' || title === 'xG' ? parseFloat(homeVal).toFixed(1) : homeVal}
                  </span>
                  <span className="text-[10px] text-muted uppercase tracking-wider px-2">{title}</span>
                  <span className={`font-medium w-20 text-left ${parseFloat(awayVal) > parseFloat(homeVal) ? 'text-accent' : 'text-secondary'}`}>
                    {title === 'Expected Goals' || title === 'xG' ? parseFloat(awayVal).toFixed(1) : awayVal}
                  </span>
                </div>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${homePct}%`,
                      background: parseFloat(homeVal) > parseFloat(awayVal)
                        ? 'linear-gradient(90deg, var(--accent) 0%, #16a34a 100%)'
                        : 'var(--accent)',
                      opacity: 0.7
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Key events */}
        {matchEvents && matchEvents.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-semibold text-muted uppercase tracking-wider">Match Events</h4>
            <div className="grid grid-cols-2 gap-2">
              {matchEvents.slice(0, 10).map((evt: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs p-2 rounded-lg"
                  style={{ background: 'rgba(30,41,59,0.5)' }}
                >
                  <span className="font-mono text-muted">{evt.minute ?? evt.time ?? '?'}'</span>
                  <span className={evt.type === 'goal' || evt.type === 'Goal' ? 'text-accent font-medium' : 'text-secondary'}>
                    {evt.eventName || evt.type || evt.event}
                  </span>
                  <span className="text-muted ml-auto">{evt.playerName || evt.player || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
