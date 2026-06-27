// FotMob-style color scheme and design system
// All styles as CSS-in-JS objects (no Tailwind, no CSS classes)

export const colors = {
  bg: '#1B1B1B',
  bgCard: '#222222',
  bgHover: '#2A2A2A',
  bgDark: '#181818',
  accent: '#00D26A',
  accentDim: 'rgba(0, 210, 106, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#666666',
  live: '#FF4444',
  liveBg: 'rgba(255, 68, 68, 0.15)',
  ft: '#00D26A',
  ftBg: 'rgba(0, 210, 106, 0.15)',
  scheduled: '#666666',
  scheduledBg: 'rgba(102, 102, 102, 0.15)',
  border: '#333333',
  borderLight: '#444444',
  yellow: '#FFD700',
  yellowBg: 'rgba(255, 215, 0, 0.15)',
  red: '#FF4444',
  redBg: 'rgba(255, 68, 68, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
};

export const S: Record<string, React.CSSProperties> = {
  // Layout
  root: {
    minHeight: '100vh',
    background: colors.bg,
    color: colors.text,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    lineHeight: 1.5,
    WebkitFontSmoothing: 'antialiased',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 16px',
  },
  mainContent: {
    paddingBottom: 80, // space for bottom nav
  },

  // Header
  header: {
    background: colors.bgDark,
    borderBottom: `1px solid ${colors.border}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInner: {
    maxWidth: 1200,
    width: '100%',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    color: colors.text,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: colors.accent,
  },

  // Date selector
  dateScroller: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto' as const,
    padding: '12px 0',
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
  },
  dateBtn: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.bgCard,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.15s ease',
    minWidth: 60,
  },
  dateBtnActive: {
    background: colors.accent,
    color: colors.black,
    border: `1px solid ${colors.accent}`,
    fontWeight: 700,
  },
  dateBtnToday: {
    border: `1px solid ${colors.accent}`,
    color: colors.accent,
  },
  dateDayName: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  dateDayNum: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  dateMonth: {
    fontSize: 10,
    opacity: 0.7,
  },

  // League section
  leagueSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  leagueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: 8,
  },
  leagueLogo: {
    width: 24,
    height: 24,
    objectFit: 'contain' as const,
  },
  leagueName: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
  },
  leagueCountry: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 'auto',
  },

  // Match card
  matchCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 8,
    background: colors.bgCard,
    marginBottom: 2,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    border: 'none',
    width: '100%',
    color: colors.text,
    textAlign: 'left' as const,
  },
  matchCardHover: {
    background: colors.bgHover,
  },

  // Match row layout
  matchTeam: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  matchTeamAway: {
    justifyContent: 'flex-end',
  },
  teamLogo: {
    width: 28,
    height: 28,
    objectFit: 'contain' as const,
    flexShrink: 0,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis' as const,
  },
  matchScore: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minWidth: 60,
    padding: '0 12px',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: 2,
  },
  scoreTextSmall: {
    fontSize: 14,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
    marginTop: 2,
  },

  // Status badge variants
  statusLive: {
    background: colors.liveBg,
    color: colors.live,
  },
  statusFT: {
    background: colors.ftBg,
    color: colors.ft,
  },
  statusScheduled: {
    background: colors.scheduledBg,
    color: colors.textMuted,
  },

  // Bottom navigation
  bottomNav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: colors.bgDark,
    borderTop: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 100,
    height: 60,
  },
  bottomNavInner: {
    display: 'flex',
    maxWidth: 1200,
    width: '100%',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '8px 0',
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    transition: 'color 0.15s ease',
  },
  navItemActive: {
    color: colors.accent,
  },

  // Match detail page
  detailHeader: {
    background: colors.bgCard,
    borderRadius: 12,
    padding: '24px 16px',
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  detailTeams: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  detailTeam: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    flex: 1,
    maxWidth: 140,
  },
  detailTeamLogo: {
    width: 56,
    height: 56,
    objectFit: 'contain' as const,
  },
  detailTeamName: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'center' as const,
  },
  detailScore: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  detailScoreNum: {
    fontSize: 36,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  detailScoreDash: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: 300,
  },
  detailStatus: {
    marginTop: 12,
    display: 'inline-block',
    fontSize: 13,
    fontWeight: 700,
    padding: '4px 16px',
    borderRadius: 6,
  },
  detailLeague: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },

  // Tabs
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: 16,
    overflowX: 'auto' as const,
    scrollbarWidth: 'none' as const,
  },
  tab: {
    flex: '0 0 auto',
    padding: '12px 20px',
    fontSize: 13,
    fontWeight: 600,
    color: colors.textMuted,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    borderBottom: '3px solid transparent',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  tabActive: {
    color: colors.accent,
    borderBottom: `3px solid ${colors.accent}`,
  },

  // Info box
  infoBox: {
    background: colors.bgCard,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  infoRowLast: {
    borderBottom: 'none',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
  },

  // Stats
  statRow: {
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    fontSize: 13,
  },
  statBarContainer: {
    display: 'flex',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    background: colors.bgDark,
  },
  statBarHome: {
    background: colors.accent,
    transition: 'width 0.3s ease',
  },
  statBarAway: {
    background: colors.textMuted,
    transition: 'width 0.3s ease',
  },

  // Events timeline
  eventRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  eventMinute: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.textMuted,
    minWidth: 30,
    textAlign: 'right' as const,
  },
  eventIcon: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    flexShrink: 0,
  },
  eventInfo: {
    flex: 1,
    fontSize: 13,
  },
  eventPlayer: {
    fontWeight: 600,
    color: colors.text,
  },
  eventDetail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Lineup
  lineupContainer: {
    display: 'flex',
    gap: 16,
  },
  lineupTeam: {
    flex: 1,
  },
  lineupFormation: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.accent,
    marginBottom: 8,
  },
  lineupPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 0',
    fontSize: 13,
  },
  lineupNumber: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.textMuted,
    minWidth: 20,
  },
  lineupPlayerName: {
    fontWeight: 500,
  },
  subsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: `1px solid ${colors.border}`,
  },

  // H2H
  h2hSummary: {
    display: 'flex',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  h2hStat: {
    textAlign: 'center' as const,
  },
  h2hNum: {
    fontSize: 28,
    fontWeight: 700,
  },
  h2hLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  h2hMatch: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: 13,
  },

  // Club page
  clubHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '24px 16px',
    background: colors.bgCard,
    borderRadius: 12,
    marginBottom: 16,
  },
  clubLogo: {
    width: 64,
    height: 64,
    objectFit: 'contain' as const,
  },
  clubName: {
    fontSize: 22,
    fontWeight: 700,
  },
  clubCountry: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Squad
  squadGroup: {
    marginBottom: 24,
  },
  squadGroupTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${colors.border}`,
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: colors.bgCard,
    borderRadius: 8,
    marginBottom: 4,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    color: colors.text,
    textAlign: 'left' as const,
    transition: 'background 0.15s ease',
  },
  playerPhoto: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    background: colors.bgDark,
  },
  playerNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.textMuted,
    minWidth: 24,
    textAlign: 'center' as const,
  },
  playerName: {
    fontSize: 14,
    fontWeight: 600,
  },
  playerPosition: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  playerLink: {
    color: colors.accent,
    textDecoration: 'none',
    cursor: 'pointer',
  },

  // Player page
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '24px 16px',
    background: colors.bgCard,
    borderRadius: 12,
    marginBottom: 16,
  },
  playerHeaderPhoto: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    background: colors.bgDark,
    border: `3px solid ${colors.accent}`,
  },
  playerHeaderName: {
    fontSize: 22,
    fontWeight: 700,
  },
  playerHeaderInfo: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  playerBioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 8,
    marginBottom: 16,
  },
  playerBioItem: {
    background: colors.bgCard,
    borderRadius: 8,
    padding: '12px 16px',
  },
  playerBioLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    fontWeight: 600,
  },
  playerBioValue: {
    fontSize: 15,
    fontWeight: 700,
    marginTop: 4,
  },

  // Career
  careerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
  },
  careerTeamLogo: {
    width: 32,
    height: 32,
    objectFit: 'contain' as const,
  },
  careerTeamName: {
    fontSize: 14,
    fontWeight: 600,
  },
  careerStats: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Form badges
  formContainer: {
    display: 'flex',
    gap: 6,
    marginBottom: 16,
  },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  formW: { background: colors.accent },
  formD: { background: colors.textMuted },
  formL: { background: colors.live },

  // Fixture list
  fixtureRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
    fontSize: 13,
  },
  fixtureDate: {
    fontSize: 12,
    color: colors.textMuted,
    minWidth: 80,
  },
  fixtureTeams: {
    flex: 1,
    marginLeft: 12,
  },
  fixtureScore: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums' as const,
    minWidth: 50,
    textAlign: 'center' as const,
  },
  fixtureResult: {
    fontSize: 12,
    fontWeight: 700,
    width: 20,
    height: 20,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  // Trophy
  trophyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: colors.bgCard,
    borderRadius: 8,
    marginBottom: 4,
  },
  trophyName: {
    fontSize: 14,
    fontWeight: 600,
  },
  trophyArea: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  trophyCount: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.accent,
  },

  // Transfer table
  transferTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: 16,
  },
  transferTh: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    padding: '8px 12px',
    borderBottom: `1px solid ${colors.border}`,
    textAlign: 'left' as const,
  },
  transferTd: {
    fontSize: 13,
    padding: '10px 12px',
    borderBottom: `1px solid ${colors.border}`,
  },

  // Search
  searchContainer: {
    padding: '16px 0',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    background: colors.bgCard,
    color: colors.text,
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit',
  },
  searchSection: {
    marginTop: 16,
  },
  searchSectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    background: colors.bgCard,
    borderRadius: 8,
    marginBottom: 4,
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    color: colors.text,
    textAlign: 'left' as const,
    textDecoration: 'none',
  },

  // Back button
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 0',
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    marginBottom: 8,
    fontFamily: 'inherit',
  },

  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: 12,
  },
  spinner: {
    width: 32,
    height: 32,
    border: `3px solid ${colors.border}`,
    borderTop: `3px solid ${colors.accent}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  // Empty state
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center' as const,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 600,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
  },

  // POTM
  potmContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    background: colors.bgCard,
    borderRadius: 8,
    marginBottom: 16,
  },
  potmPhoto: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover' as const,
    background: colors.bgDark,
  },
  potmName: {
    fontSize: 16,
    fontWeight: 700,
  },
  potmTeam: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  potmRating: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 700,
    marginTop: 4,
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${colors.border}`,
  },

  // Responsive adjustments (handled via media queries in index.css)
  // Mobile-specific overrides are applied conditionally in components
};
