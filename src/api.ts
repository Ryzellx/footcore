// API base auto-detection
const DEV_API = 'http://localhost:3001/api';
const PROD_API = 'https://football-live-api.vercel.app/api';

export const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? DEV_API
    : PROD_API;

// --- Types ---

export interface FotMobMatch {
  id: number;
  home: { name: string; id: number; score?: number; imageUrl?: string };
  away: { name: string; id: number; score?: number; imageUrl?: string };
  status: {
    started?: boolean;
    finished?: boolean;
    cancelled?: boolean;
    scoreStr?: string;
    reason?: { short?: string; long?: string };
  };
  time?: string;
  leagueId?: number;
  leagueName?: string;
}

export interface FotMobLeague {
  id: number;
  name: string;
  country?: string;
  logo?: string;
  matches: FotMobMatch[];
}

export interface MatchesByDateResponse {
  success: boolean;
  source: string;
  updatedAt: string;
  data: {
    leagues: FotMobLeague[];
  };
}

export interface MatchDetailData {
  general?: {
    matchId: number;
    matchName: string;
    teamColors?: { home?: { primary?: string }; away?: { primary?: string } };
  };
  header?: {
    teams: Array<{
      name: string;
      id: number;
      score?: number;
      imageUrl?: string;
    }>;
    status: {
      scoreStr?: string;
      reason?: { short?: string; long?: string };
      finished?: boolean;
      started?: boolean;
      cancelled?: boolean;
    };
  };
  content?: {
    matchFacts?: {
      events?: { incidents?: any[] };
      infoBox?: {
        Tournament?: { name?: string; id?: number; logo?: string };
        Stadium?: { name?: string };
        Referee?: { name?: string; country?: string };
        Attendance?: number;
      };
      playerOfTheMatch?: { id?: number; name?: string; teamName?: string; rating?: { num?: number; bgcolor?: string }; imageUrl?: string };
    };
    stats?: {
      Periods?: {
        All?: {
          stats: Array<{
            title: string;
            key: string;
            home: string | number;
            away: string | number;
          }>;
        };
      };
    };
    lineup?: {
      homeTeam?: { formation: string; startingXI?: any[]; subs?: any[] };
      awayTeam?: { formation: string; startingXI?: any[]; subs?: any[] };
    };
    shotmap?: {
      shots?: Array<{
        playerName?: string;
        x?: number;
        y?: number;
        min?: number;
        expectedGoals?: number;
        isOnTarget?: boolean;
        shotType?: string;
        eventType?: string;
        teamId?: number;
      }>;
    };
    h2h?: {
      summary?: [number, number, number];
      matches?: Array<{
        id?: number;
        home?: { name: string; score?: number };
        away?: { name: string; score?: number };
        status?: { finished?: boolean; scoreStr?: string };
        time?: string;
        league?: { name?: string };
      }>;
    };
    playerStats?: Record<string, { name: string; teamName?: string; stats?: any[] }>;
  };
}

export interface ClubData {
  id: number;
  name: string;
  shortName?: string;
  country?: string;
  logo?: string;
  gender?: string;
  latestSeason?: number;
  teamColors?: {
    darkMode?: { home?: string; away?: string };
    lightMode?: { home?: string; away?: string };
  };
  squad?: {
    isNationalTeam?: boolean;
    coach?: Array<{ id: number; name: string }>;
    keepers?: any[];
    defenders?: any[];
    midfielders?: any[];
    attackers?: any[];
  };
  trophies?: Array<{
    name: string;
    area?: string;
    count?: number;
    runnerUp?: number;
    seasonsWon?: string[];
  }>;
  fixtures?: {
    allFixtures?: Array<{
      id: number;
      opponent: { id: number; name: string };
      home: boolean;
      away: boolean;
      tournament?: { name?: string; id?: number };
      date?: string;
      time?: string;
      finished?: boolean;
      scoreStr?: string;
      result?: string;
    }>;
    nextMatch?: any;
    lastMatch?: any;
  };
  form?: string[];
  formString?: string;
  transfers?: {
    in?: any[];
    out?: any[];
    rumours?: any[];
  };
  standings?: any;
}

export interface PlayerData {
  id: number;
  name: string;
  photo?: string;
  shirtNumber?: number;
  position?: string;
  club?: string;
  clubId?: number;
  country?: string;
  countryCode?: string;
  dateOfBirth?: string;
  age?: number;
  height?: string;
  preferredFoot?: string;
  marketValue?: string;
  status?: string;
  isCaptain?: boolean;
  playerInformation?: Array<{ title: string; value: string; icon?: string }>;
  injuries?: any[];
  trophies?: Array<{ teamName: string; tournaments: any[] }>;
  careerHistory?: {
    careerItems?: Array<{
      teamName: string;
      teamId?: number;
      appearances?: number;
      goals?: number;
      assists?: number;
      seasonName?: string;
    }>;
  };
  recentMatches?: Array<{
    matchId: number;
    opponent: string;
    opponentId?: number;
    score?: string;
    date?: string;
    competition?: string;
    result?: string;
    goals?: number;
    assists?: number;
    rating?: number;
  }>;
  marketValues?: {
    current?: string;
    history?: Array<{ date: string; value: string }>;
  };
  traits?: any;
  seasonStats?: any;
  firstSeasonStats?: any;
}

export interface SearchResults {
  matches: any[];
  teams: Array<{ id: number; name: string; country?: string; imageUrl?: string }>;
  players: Array<{ id: number; name: string; position?: string; imageUrl?: string; teamName?: string; teamId?: number }>;
  leagues: Array<{ id: number; name: string; country?: string }>;
}

// --- Fetch functions ---

export async function fetchMatchesByDate(date: string): Promise<FotMobLeague[]> {
  const res = await fetch(`${API_BASE}/fotmob/matches/date/${date}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.leagues || [];
}

export async function fetchMatchesRange(from: string, to: string): Promise<FotMobLeague[]> {
  const res = await fetch(`${API_BASE}/fotmob/matches/range?from=${from}&to=${to}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json?.data?.leagues || [];
}

export async function fetchMatchDetail(id: number | string): Promise<MatchDetailData | null> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/match/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchClub(id: number | string): Promise<ClubData | null> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/club/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchPlayer(id: number | string): Promise<PlayerData | null> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/player/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function fetchSearch(query: string): Promise<SearchResults> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/search/all?q=${encodeURIComponent(query)}`);
    if (!res.ok) return { matches: [], teams: [], players: [], leagues: [] };
    const json = await res.json();
    return json?.data || { matches: [], teams: [], players: [], leagues: [] };
  } catch {
    return { matches: [], teams: [], players: [], leagues: [] };
  }
}

// --- Utility ---

export function formatDateForAPI(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function teamLogoUrl(teamId: number): string {
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamId}.png`;
}

export function playerPhotoUrl(playerId: number): string {
  return `https://images.fotmob.com/image_resources/playerimage/player/${playerId}.png`;
}

export function getMatchStatusText(match: FotMobMatch): string {
  if (match.status?.finished) return match.status?.scoreStr || 'FT';
  if (match.status?.started) return match.status?.scoreStr || "'";
  if (match.status?.cancelled) return 'Cancelled';
  return match.time || '';
}

export function getMatchStatusType(match: FotMobMatch): 'live' | 'ft' | 'scheduled' | 'cancelled' {
  if (match.status?.cancelled) return 'cancelled';
  if (match.status?.finished) return 'ft';
  if (match.status?.started) return 'live';
  return 'scheduled';
}

export function getMatchStatusFromHeader(status: MatchDetailData['header']['status']): 'live' | 'ft' | 'scheduled' | 'cancelled' {
  if (!status) return 'scheduled';
  if (status.cancelled) return 'cancelled';
  if (status.finished) return 'ft';
  if (status.started) return 'live';
  return 'scheduled';
}

export function getMatchScoreStrFromHeader(status: MatchDetailData['header']['status']): string {
  if (!status) return '';
  if (status.finished) return status.scoreStr || 'FT';
  if (status.started) return status.scoreStr || "'";
  return status.reason?.short || '';
}
