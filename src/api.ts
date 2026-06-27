const API_BASE = 'http://localhost:3001/api';

export interface Match {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  strLeague: string;
  strLeagueBadge: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  strVenue: string;
  strCity: string;
  strCountry: string;
  strThumb: string;
  strDate?: string;
  dateEvent: string;
  strTime: string;
  strGroup: string;
  idHomeTeam: string;
  idAwayTeam: string;
  strSquare?: string;
  strPoster?: string;
  strPostponed?: string;
  strSeason?: string;
}

export interface FotMobDetail {
  content?: any;
  general?: any;
  header?: any;
}

export interface MatchDetail {
  basic: Match;
  fotmob?: FotMobDetail;
}

export async function fetchTodayMatches(): Promise<Match[]> {
  const res = await fetch(`${API_BASE}/matches/today`);
  const json = await res.json();
  return json?.data?.events || json?.data || [];
}

export async function fetchMatchDetail(fotmobId: string): Promise<FotMobDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/match/${fotmobId}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

// Map TheSportsDB event to FotMob ID (we use known mappings)
export const fotmobIdMap: Record<string, string> = {
  // 2026-06-27 matches
  '2391772': '4653708', // Cape Verde vs Saudi Arabia
  '2391773': '4653709', // Egypt vs Iran
  '2391774': '4667794', // New Zealand vs Belgium
};
