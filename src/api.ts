// API base auto-detection
const DEV_API = 'http://localhost:3001/api';
const PROD_API = 'https://football-live-api.vercel.app/api';

export const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? DEV_API
    : PROD_API;

// --- Timezone Utilities ---

export const TIMEZONES = [
  { id: 'Asia/Jakarta', label: 'WIB (Jakarta)', offset: 7 },
  { id: 'Asia/Makassar', label: 'WITA (Bali)', offset: 8 },
  { id: 'Asia/Jayapura', label: 'WIT (Papua)', offset: 9 },
  { id: 'Europe/London', label: 'GMT (London)', offset: 0 },
  { id: 'Europe/Paris', label: 'CET (Paris)', offset: 1 },
  { id: 'Europe/Berlin', label: 'CET (Berlin)', offset: 1 },
  { id: 'Europe/Madrid', label: 'CET (Madrid)', offset: 1 },
  { id: 'Europe/Rome', label: 'CET (Rome)', offset: 1 },
  { id: 'America/New_York', label: 'EST (New York)', offset: -5 },
  { id: 'America/Chicago', label: 'CST (Chicago)', offset: -6 },
  { id: 'America/Denver', label: 'MST (Denver)', offset: -7 },
  { id: 'America/Los_Angeles', label: 'PST (Los Angeles)', offset: -8 },
  { id: 'Asia/Tokyo', label: 'JST (Tokyo)', offset: 9 },
  { id: 'Asia/Seoul', label: 'KST (Seoul)', offset: 9 },
  { id: 'Asia/Shanghai', label: 'CST (Shanghai)', offset: 8 },
  { id: 'Asia/Dubai', label: 'GST (Dubai)', offset: 4 },
  { id: 'Asia/Kolkata', label: 'IST (India)', offset: 5.5 },
  { id: 'Australia/Sydney', label: 'AEST (Sydney)', offset: 10 },
  { id: 'America/Sao_Paulo', label: 'BRT (São Paulo)', offset: -3 },
  { id: 'Africa/Cairo', label: 'EET (Cairo)', offset: 2 },
];

export function getStoredTimezone(): string {
  const stored = localStorage.getItem('footcore_timezone');
  if (stored && TIMEZONES.some((tz) => tz.id === stored)) return stored;
  // Auto-detect
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONES.some((tz) => tz.id === detected)) return detected;
  } catch {}
  return 'Europe/London';
}

export function setTimezone(tz: string) {
  localStorage.setItem('footcore_timezone', tz);
}

export function convertUTCToLocal(utcTime: string, timezone: string): Date {
  // utcTime format: "2025-06-28T21:00:00Z" or "2025-06-28T21:00:00.000Z"
  return new Date(utcTime);
}

export function formatMatchTime(utcTime: string | undefined, timezone: string): string {
  if (!utcTime) return '';
  try {
    const d = new Date(utcTime);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    });
  } catch {
    return '';
  }
}

// --- Types ---

export interface FotMobMatch {
  id: number;
  home: { name: string; id: number; score?: number; imageUrl?: string; shortName?: string };
  away: { name: string; id: number; score?: number; imageUrl?: string; shortName?: string };
  status: {
    utcTime?: string;
    started?: boolean;
    finished?: boolean;
    cancelled?: boolean;
    ongoing?: boolean;
    scoreStr?: string;
    reason?: { short?: string; long?: string };
    liveTime?: { short?: string };
  };
  time?: string;
  leagueId?: number;
  leagueName?: string;
  group?: string;
  round?: string;
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
    teamColors?: { darkMode?: { home?: string[]; away?: string[] }; lightMode?: { home?: string[]; away?: string[] } };
  };
  header?: {
    teams: Array<{
      name: string;
      id: number;
      score?: number;
      imageUrl?: string;
    }>;
    status: {
      utcTime?: string;
      started?: boolean;
      finished?: boolean;
      cancelled?: boolean;
      ongoing?: boolean;
      scoreStr?: string;
      reason?: { short?: string; long?: string };
      liveTime?: { short?: string };
    };
  };
  content?: {
    matchFacts?: {
      events?: Array<{
        timeStr?: number;
        type?: string;
        time?: number;
        overloadTime?: any;
        player?: { id: number; name: string; profileUrl: string };
        homeScore?: number | null;
        awayScore?: number | null;
        isHome?: boolean;
        swap?: any[];
        reason?: { short?: string; long?: string };
        assist?: { player?: { name: string } };
        incidentType?: string;
        text?: string;
      }>;
      eventTypes?: string[];
      penaltyShootoutEvents?: any;
      infoBox?: {
        tournament?: { id?: number; parentLeagueId?: number; link?: string; leagueName?: string; roundName?: string; round?: string };
        stadium?: { name?: string; city?: string; country?: string; lat?: number; long?: number; capacity?: number; surface?: string };
        referee?: { text?: string; countryCode?: string; country?: string };
        attendance?: number;
        teamForm?: { home?: string[]; away?: string[] };
        poll?: any;
        topPlayers?: any;
        insights?: any;
        postReview?: any;
      };
      playerOfTheMatch?: {
        id?: number;
        name?: { firstName?: string; lastName?: string; fullName?: string };
        teamName?: string;
        teamId?: number;
        rating?: { num?: string; isTop?: { isTopRating: boolean; isMatchFinished: boolean }; bgcolor?: string };
        minutesPlayed?: number;
        shotmap?: any[];
        pageUrl?: string;
        isHomeTeam?: boolean;
        stats?: any[];
        role?: string;
        teamData?: { home: { id: number; color: string }; away: { id: number; color: string } };
      };
    };
    playerStats?: Record<string, { name: string; teamName?: string; stats?: any[] }>;
    stats?: Array<{
      title: string;
      key: string;
      home: string | number;
      away: string | number;
      format?: string;
      highlighted?: any;
    }>;
    lineup?: {
      homeTeam?: {
        id?: number;
        name?: string;
        rating?: number;
        formation?: string;
        starters?: Array<{
          id: number;
          age?: number;
          name: string;
          positionId?: number;
          shirtNumber?: string;
          countryName?: string;
          countryCode?: string;
          marketValue?: number;
          x?: number;
          y?: number;
          rating?: number;
          firstName?: string;
          lastName?: string;
          substitutionEvents?: any[];
        }>;
        substitutes?: any[];
        coach?: { name: string } | any[];
        averageStarterAge?: number;
        totalStarterMarketValue?: number;
      };
      awayTeam?: {
        id?: number;
        name?: string;
        rating?: number;
        formation?: string;
        starters?: any[];
        substitutes?: any[];
        coach?: any;
      };
    };
    shotmap?: {
      shots?: Array<{
        id?: number;
        eventType?: string;
        teamId?: number;
        playerId?: number;
        playerName?: string;
        x?: number;
        y?: number;
        min?: number;
        addedMin?: number;
        isBlocked?: boolean;
        isOnTarget?: boolean;
        blockedX?: number;
        blockedY?: number;
        goalCrossed?: boolean;
        expectedGoals?: number;
        expectedGoalsOnTarget?: number;
        shotType?: string;
        situation?: string;
        period?: string;
        isOwnGoal?: boolean;
        onGoalShot?: any;
      }>;
    };
    h2h?: {
      summary?: [number, number, number];
      matches?: any[];
    };
    momentum?: { main?: { data?: Array<{ minute: number; value: number }> } };
    table?: any;
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

// Get the UTC date range that covers a local date in the given timezone
function getUTCRangeForLocalDate(localDate: string, timezone: string): { from: string; to: string } {
  // localDate = "2026-06-28" in user's timezone
  // We need UTC range that covers 00:00-23:59 in that timezone
  // For WIB (UTC+7): local 00:00 = UTC 17:00 prev day, local 23:59 = UTC 16:59 current day
  
  const [y, m, d] = localDate.split('-').map(Number);
  
  // Create date at 00:00 local time, then get UTC equivalent
  const localMidnight = new Date(`${localDate}T00:00:00`);
  const localEnd = new Date(`${localDate}T23:59:59`);
  
  // Get the timezone offset in minutes for this specific date
  const utcMidnight = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  const utcEnd = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
  
  // Use Intl to get the offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  
  // Find what UTC time corresponds to local midnight
  // We need to find UTC time where formatter.format(utc) = localDate + "00:00:00"
  // Simple approach: iterate around the date
  const guess = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // noon UTC as starting point
  const formatted = formatter.format(guess);
  const [fDate, fTime] = formatted.split(', ');
  const [fm, fd, fy] = fDate.split('/').map(Number);
  const localDateNum = y * 10000 + m * 100 + d;
  const guessDateNum = fy * 10000 + fm * 100 + fd;
  
  let offsetHours = 0;
  if (guessDateNum > localDateNum) {
    // Local date is ahead of UTC (positive offset, e.g., WIB +7)
    offsetHours = (guessDateNum - localDateNum) * 24;
  } else if (guessDateNum < localDateNum) {
    // Local date is behind UTC (negative offset, e.g., PST -8)
    offsetHours = -(localDateNum - guessDateNum) * 24;
  }
  
  // Adjust based on time component
  const [fh, fmi] = (fTime || '12:00:00').split(':').map(Number);
  if (fh !== 12) {
    offsetHours += (fh - 12);
  }
  
  const utcFrom = new Date(Date.UTC(y, m - 1, d, -offsetHours, 0, 0));
  const utcTo = new Date(Date.UTC(y, m - 1, d, 24 - offsetHours - 1, 59, 59));
  
  return {
    from: utcFrom.toISOString().split('T')[0],
    to: utcTo.toISOString().split('T')[0],
  };
}

// Get local date string from UTC time + timezone
export function getLocalDate(utcTime: string, timezone: string): string {
  try {
    const d = new Date(utcTime);
    return d.toLocaleDateString('en-CA', { timeZone: timezone }); // Returns YYYY-MM-DD
  } catch {
    return utcTime?.split('T')[0] || '';
  }
}

export async function fetchMatchesByDate(date: string): Promise<FotMobLeague[]> {
  const timezone = getStoredTimezone();
  
  // Get UTC range that covers this local date
  const { from, to } = getUTCRangeForLocalDate(date, timezone);
  
  // Fetch range from backend
  const leagues = await fetchMatchesRange(from, to);
  
  // Filter matches that fall on this local date
  const filtered: FotMobLeague[] = [];
  for (const league of leagues) {
    const dayMatches = (league.matches || []).filter((m) => {
      if (!m.status?.utcTime) return false;
      const localDate = getLocalDate(m.status.utcTime, timezone);
      return localDate === date;
    });
    if (dayMatches.length > 0) {
      filtered.push({ ...league, matches: dayMatches });
    }
  }
  
  return filtered;
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

export function leagueLogoUrl(leagueId: number): string {
  return `https://images.fotmob.com/image_resources/logo/leaguelogo/${leagueId}.png`;
}

// --- Leagues Data ---

export interface LeagueMeta {
  id: number;
  name: string;
  country: string;
  region: string;
}

export const LEAGUES: LeagueMeta[] = [
  // Top Europe
  { id: 147, name: 'Premier League', country: 'England', region: 'Top Europe' },
  { id: 87, name: 'La Liga', country: 'Spain', region: 'Top Europe' },
  { id: 164, name: 'Serie A', country: 'Italy', region: 'Top Europe' },
  { id: 154, name: 'Bundesliga', country: 'Germany', region: 'Top Europe' },
  { id: 168, name: 'Ligue 1', country: 'France', region: 'Top Europe' },
  { id: 57, name: 'Eredivisie', country: 'Netherlands', region: 'Top Europe' },
  { id: 61, name: 'Liga Portugal', country: 'Portugal', region: 'Top Europe' },
  { id: 69, name: 'Süper Lig', country: 'Turkey', region: 'Top Europe' },
  { id: 64, name: 'Scottish Premiership', country: 'Scotland', region: 'Top Europe' },
  { id: 46, name: 'Superligaen', country: 'Denmark', region: 'Top Europe' },
  { id: 68, name: 'Allsvenskan', country: 'Sweden', region: 'Top Europe' },
  { id: 58, name: 'Eliteserien', country: 'Norway', region: 'Top Europe' },
  { id: 85, name: 'Super League', country: 'Greece', region: 'Top Europe' },
  { id: 122, name: 'Super League', country: 'Switzerland', region: 'Top Europe' },
  { id: 189, name: 'First Division A', country: 'Belgium', region: 'Top Europe' },
  { id: 180, name: 'Croatian HNL', country: 'Croatia', region: 'Top Europe' },
  { id: 179, name: 'Czech Liga', country: 'Czech Republic', region: 'Top Europe' },
  { id: 171, name: 'Ekstraklasa', country: 'Poland', region: 'Top Europe' },
  { id: 173, name: 'Liga I', country: 'Romania', region: 'Top Europe' },
  { id: 176, name: 'Serbian SuperLiga', country: 'Serbia', region: 'Top Europe' },
  { id: 203, name: 'Süper Lig', country: 'Turkey', region: 'Top Europe' },
  { id: 195, name: 'Bundesliga', country: 'Austria', region: 'Top Europe' },
  { id: 207, name: 'Premier League', country: 'Ukraine', region: 'Top Europe' },
  { id: 250, name: 'Liga MX', country: 'Mexico', region: 'Top Europe' },
  { id: 240, name: 'Russian Premier League', country: 'Russia', region: 'Top Europe' },
  { id: 241, name: 'Premiership', country: 'N. Ireland', region: 'Top Europe' },
  { id: 242, name: 'Premier League', country: 'Wales', region: 'Top Europe' },
  { id: 247, name: 'Premier League', country: 'Israel', region: 'Top Europe' },
  { id: 190, name: 'Primera División', country: 'Uruguay', region: 'Top Europe' },
  { id: 200, name: 'First League', country: 'Bulgaria', region: 'Top Europe' },
  { id: 219, name: 'Prva Liga', country: 'Slovenia', region: 'Top Europe' },
  { id: 222, name: 'Fortuna Liga', country: 'Slovakia', region: 'Top Europe' },
  { id: 225, name: 'Premier League', country: 'Kazakhstan', region: 'Top Europe' },
  { id: 231, name: 'Meistriliiga', country: 'Estonia', region: 'Top Europe' },
  { id: 237, name: 'A Lyga', country: 'Lithuania', region: 'Top Europe' },
  { id: 239, name: 'Virsliga', country: 'Latvia', region: 'Top Europe' },
  { id: 249, name: 'Premier League', country: 'Finland', region: 'Top Europe' },
  { id: 260, name: 'Veikkausliiga', country: 'Finland', region: 'Top Europe' },
  { id: 263, name: 'Premier League', country: 'Iceland', region: 'Top Europe' },
  { id: 270, name: 'Premier Division', country: 'Ireland', region: 'Top Europe' },
  { id: 278, name: 'First Division', country: 'Ireland', region: 'Top Europe' },
  // Other Europe
  { id: 40, name: 'Championship', country: 'England', region: 'Other Europe' },
  { id: 119, name: '2. Bundesliga', country: 'Germany', region: 'Other Europe' },
  { id: 86, name: 'Serie B', country: 'Italy', region: 'Other Europe' },
  { id: 141, name: 'Segunda División', country: 'Spain', region: 'Other Europe' },
  { id: 185, name: 'Ligue 2', country: 'France', region: 'Other Europe' },
  { id: 48, name: 'League One', country: 'England', region: 'Other Europe' },
  { id: 181, name: '2. Liga', country: 'Austria', region: 'Other Europe' },
  { id: 183, name: 'Challenge League', country: 'Switzerland', region: 'Other Europe' },
  { id: 188, name: 'Eerste Divisie', country: 'Netherlands', region: 'Other Europe' },
  { id: 186, name: 'Jupiler Pro League', country: 'Belgium', region: 'Other Europe' },
  { id: 193, name: '1. Division', country: 'Denmark', region: 'Other Europe' },
  { id: 196, name: 'Superettan', country: 'Sweden', region: 'Other Europe' },
  { id: 206, name: 'OBOS-ligaen', country: 'Norway', region: 'Other Europe' },
  { id: 47, name: 'League Two', country: 'England', region: 'Other Europe' },
  { id: 41, name: 'FA Cup', country: 'England', region: 'Other Europe' },
  { id: 151, name: 'DFB-Pokal', country: 'Germany', region: 'Other Europe' },
  { id: 135, name: 'Copa del Rey', country: 'Spain', region: 'Other Europe' },
  { id: 138, name: 'Coppa Italia', country: 'Italy', region: 'Other Europe' },
  { id: 153, name: 'Coupe de France', country: 'France', region: 'Other Europe' },
  { id: 23, name: 'Taça de Portugal', country: 'Portugal', region: 'Other Europe' },
  { id: 51, name: 'KNVB Cup', country: 'Netherlands', region: 'Other Europe' },
  { id: 137, name: 'Community Shield', country: 'England', region: 'Other Europe' },
  { id: 256, name: 'Carabao Cup', country: 'England', region: 'Other Europe' },
  // International
  { id: 77, name: 'FIFA World Cup', country: '', region: 'International' },
  { id: 42, name: 'Champions League', country: '', region: 'International' },
  { id: 73, name: 'Europa League', country: '', region: 'International' },
  { id: 10216, name: 'Conference League', country: '', region: 'International' },
  { id: 50, name: 'EURO', country: '', region: 'International' },
  { id: 44, name: 'Copa America', country: '', region: 'International' },
  { id: 114, name: 'Friendlies', country: '', region: 'International' },
  { id: 489, name: 'Club Friendlies', country: '', region: 'International' },
  { id: 10195, name: 'WC Qualification Europe', country: '', region: 'International' },
  { id: 10196, name: 'WC Qualification Africa', country: '', region: 'International' },
  { id: 10197, name: 'WC Qualification Asia', country: '', region: 'International' },
  { id: 10198, name: 'WC Qualification CONCACAF', country: '', region: 'International' },
  { id: 10199, name: 'WC Qualification CONMEBOL', country: '', region: 'International' },
  { id: 10200, name: 'WC Qualification OFC', country: '', region: 'International' },
  { id: 10201, name: 'WC Qualification Intercontinental Playoffs', country: '', region: 'International' },
  { id: 54, name: 'UEFA Nations League', country: '', region: 'International' },
  { id: 55, name: 'CONCACAF Nations League', country: '', region: 'International' },
  { id: 491, name: 'International Champions Cup', country: '', region: 'International' },
  { id: 490, name: 'Super Cup', country: 'UEFA', region: 'International' },
  { id: 10210, name: 'Arab Cup', country: '', region: 'International' },
  { id: 10215, name: 'African Nations Championship', country: '', region: 'International' },
  { id: 37, name: 'CONMEBOL Libertadores', country: '', region: 'International' },
  { id: 38, name: 'CONMEBOL Sudamericana', country: '', region: 'International' },
  { id: 10226, name: 'CONCACAF Champions Cup', country: '', region: 'International' },
  { id: 10223, name: 'AFC Champions League', country: '', region: 'International' },
  { id: 10434, name: 'CAF Champions League', country: '', region: 'International' },
  // Americas
  { id: 112, name: 'Liga Profesional', country: 'Argentina', region: 'Americas' },
  { id: 24, name: 'Serie B', country: 'Brazil', region: 'Americas' },
  { id: 111, name: 'Primera División', country: 'Chile', region: 'Americas' },
  { id: 103, name: 'Primera A', country: 'Colombia', region: 'Americas' },
  { id: 108, name: 'Liga 1', country: 'Peru', region: 'Americas' },
  { id: 109, name: 'Primera División', country: 'Paraguay', region: 'Americas' },
  { id: 110, name: 'Liga Pro', country: 'Ecuador', region: 'Americas' },
  { id: 287, name: 'Primera División', country: 'Bolivia', region: 'Americas' },
  { id: 134, name: 'Primera División', country: 'Venezuela', region: 'Americas' },
  { id: 288, name: 'Division Intermedia', country: 'Paraguay', region: 'Americas' },
  { id: 289, name: 'Serie C', country: 'Brazil', region: 'Americas' },
  { id: 290, name: 'Copa do Brasil', country: '', region: 'Americas' },
  { id: 292, name: 'Campeonato Gaúcho', country: 'Brazil', region: 'Americas' },
  { id: 293, name: 'Campeonato Paulista', country: 'Brazil', region: 'Americas' },
  { id: 296, name: 'Copa Argentina', country: '', region: 'Americas' },
  { id: 297, name: 'Copa Chile', country: '', region: 'Americas' },
  { id: 298, name: 'Superliga', country: 'Argentina', region: 'Americas' },
  { id: 300, name: 'Liga MX', country: 'Mexico', region: 'Americas' },
  { id: 301, name: 'USL Championship', country: 'USA', region: 'Americas' },
  { id: 305, name: 'Campeonato Carioca', country: 'Brazil', region: 'Americas' },
  { id: 306, name: 'Campeonato Mineiro', country: 'Brazil', region: 'Americas' },
  { id: 130, name: 'MLS', country: 'USA', region: 'Americas' },
  { id: 121, name: 'Liga MX', country: 'Mexico', region: 'Americas' },
  { id: 132, name: 'Liga de Expansión MX', country: 'Mexico', region: 'Americas' },
  { id: 133, name: 'Canadian Premier League', country: '', region: 'Americas' },
  { id: 139, name: 'USL League One', country: 'USA', region: 'Americas' },
  { id: 140, name: 'NWSL', country: 'USA', region: 'Americas' },
  { id: 142, name: 'Liga Nacional', country: 'Honduras', region: 'Americas' },
  { id: 143, name: 'Liga Primera', country: 'Nicaragua', region: 'Americas' },
  { id: 145, name: 'Primera División', country: 'Costa Rica', region: 'Americas' },
  { id: 146, name: 'LPF', country: 'Panama', region: 'Americas' },
  { id: 149, name: 'Liga Nacional', country: 'Guatemala', region: 'Americas' },
  { id: 254, name: 'Canadian Championship', country: '', region: 'Americas' },
  { id: 262, name: 'Caribbean Club Championship', country: '', region: 'Americas' },
  { id: 271, name: 'US Open Cup', country: '', region: 'Americas' },
  // Asia
  { id: 98, name: 'J1 League', country: 'Japan', region: 'Asia' },
  { id: 35, name: 'Pro League', country: 'Saudi Arabia', region: 'Asia' },
  { id: 113, name: 'A-League', country: 'Australia', region: 'Asia' },
  { id: 169, name: 'Super League', country: 'China', region: 'Asia' },
  { id: 251, name: 'Indian Super League', country: '', region: 'Asia' },
  { id: 272, name: 'Thai League', country: '', region: 'Asia' },
  { id: 274, name: 'V-League', country: 'Vietnam', region: 'Asia' },
  { id: 329, name: 'J2 League', country: 'Japan', region: 'Asia' },
  { id: 330, name: 'K League 2', country: 'South Korea', region: 'Asia' },
  { id: 331, name: 'Persian Gulf Pro League', country: 'Iran', region: 'Asia' },
  { id: 332, name: 'Stars League', country: 'Qatar', region: 'Asia' },
  { id: 333, name: 'UAE Pro League', country: '', region: 'Asia' },
  { id: 335, name: 'Iraqi Premier League', country: '', region: 'Asia' },
  { id: 336, name: 'Bahrain Premier League', country: '', region: 'Asia' },
  { id: 337, name: 'Kuwait Premier League', country: '', region: 'Asia' },
  { id: 338, name: 'Oman Professional League', country: '', region: 'Asia' },
  { id: 342, name: 'A-League Women', country: 'Australia', region: 'Asia' },
  { id: 439, name: 'K3 League', country: 'South Korea', region: 'Asia' },
  { id: 440, name: 'Thai League 2', country: '', region: 'Asia' },
  { id: 441, name: 'Liga 1', country: 'Indonesia', region: 'Asia' },
  { id: 442, name: 'Malaysia Super League', country: '', region: 'Asia' },
  { id: 461, name: 'Singapore Premier League', country: '', region: 'Asia' },
  { id: 512, name: 'Hong Kong Premier League', country: '', region: 'Asia' },
  { id: 516, name: 'Philippines Football League', country: '', region: 'Asia' },
  { id: 519, name: 'Chinese Taipei Premier League', country: '', region: 'Asia' },
  // Africa
  { id: 100, name: 'Premier League', country: 'South Africa', region: 'Africa' },
  { id: 521, name: 'Egyptian Premier League', country: '', region: 'Africa' },
  { id: 522, name: 'Tunisian Ligue 1', country: '', region: 'Africa' },
  { id: 524, name: 'Algerian Ligue 1', country: '', region: 'Africa' },
  { id: 525, name: 'Nigerian Professional Football League', country: '', region: 'Africa' },
  { id: 526, name: 'Ghana Premier League', country: '', region: 'Africa' },
  { id: 529, name: 'Kenya Premier League', country: '', region: 'Africa' },
  { id: 530, name: 'Ethiopian Premier League', country: '', region: 'Africa' },
  { id: 533, name: 'Tanzanian Premier League', country: '', region: 'Africa' },
  { id: 535, name: 'Côte d\'Ivoire Ligue 1', country: '', region: 'Africa' },
  { id: 536, name: 'Senegal Premier League', country: '', region: 'Africa' },
  { id: 537, name: 'Cameroonian Elite One', country: '', region: 'Africa' },
  { id: 538, name: 'Congolese Premier League', country: '', region: 'Africa' },
  { id: 540, name: 'Libyan Premier League', country: '', region: 'Africa' },
  { id: 544, name: 'Zambian Super League', country: '', region: 'Africa' },
];

// --- League Detail ---

export interface LeagueDetailData {
  details: {
    id: number;
    name: string;
    shortName?: string;
    country?: string;
    countryCode?: string;
    seostr?: string;
    ccode?: string;
    gender?: string;
    season?: string;
  };
  table: any[];
  allTableData: any[];
  fixtures: {
    allMatches: any[];
    pastPast: any[];
    pastLastFetchedPage: any;
    futureFixtures: any[];
  };
  stats: any;
  history: any;
  hasOngoingLeague: boolean;
}

export async function fetchLeagueDetail(id: number | string): Promise<LeagueDetailData | null> {
  try {
    const res = await fetch(`${API_BASE}/fotmob/league/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
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
