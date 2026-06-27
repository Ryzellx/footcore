import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSearch, teamLogoUrl, playerPhotoUrl, type SearchResults } from '../api';
import { S, colors } from '../styles';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchSearch(query.trim());
      setResults(data);
    } catch {
      setResults({ matches: [], teams: [], players: [], leagues: [] });
    } finally {
      setLoading(false);
    }
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className="animate-fade-in" style={S.searchContainer}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <SearchIcon
          size={18}
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textMuted,
          }}
        />
        <input
          type="text"
          placeholder="Search teams, players, leagues..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            ...S.searchInput,
            paddingLeft: 42,
          }}
          autoFocus
        />
      </div>

      {/* Loading */}
      {loading && (
        <div style={S.loadingContainer}>
          <div style={S.spinner} />
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div>
          {/* Teams */}
          {results.teams.length > 0 && (
            <div style={S.searchSection}>
              <div style={S.searchSectionTitle}>Teams</div>
              {results.teams.map((team) => (
                <button
                  key={team.id}
                  style={S.searchResultItem}
                  onClick={() => navigate(`/club/${team.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgCard;
                  }}
                >
                  <img
                    src={teamLogoUrl(team.id)}
                    alt=""
                    style={{ width: 32, height: 32, objectFit: 'contain' as const }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{team.name}</div>
                    {team.country && (
                      <div style={{ fontSize: 12, color: colors.textMuted }}>{team.country}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Players */}
          {results.players.length > 0 && (
            <div style={S.searchSection}>
              <div style={S.searchSectionTitle}>Players</div>
              {results.players.map((player) => (
                <button
                  key={player.id}
                  style={S.searchResultItem}
                  onClick={() => navigate(`/player/${player.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgCard;
                  }}
                >
                  <img
                    src={playerPhotoUrl(player.id)}
                    alt=""
                    style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' as const, background: colors.bgDark }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{player.name}</div>
                    <div style={{ fontSize: 12, color: colors.textMuted }}>
                      {player.position && <span>{player.position}</span>}
                      {player.teamName && <span> · {player.teamName}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Leagues */}
          {results.leagues.length > 0 && (
            <div style={S.searchSection}>
              <div style={S.searchSectionTitle}>Leagues</div>
              {results.leagues.map((league) => (
                <button
                  key={league.id}
                  style={S.searchResultItem}
                  onClick={() => navigate(`/?league=${league.id}`)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = colors.bgCard;
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{league.name}</div>
                    {league.country && (
                      <div style={{ fontSize: 12, color: colors.textMuted }}>{league.country}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searched &&
            results.teams.length === 0 &&
            results.players.length === 0 &&
            results.leagues.length === 0 && (
              <div style={S.emptyContainer}>
                <span style={{ fontSize: 48, opacity: 0.3 }}>🔍</span>
                <p style={S.emptyText}>No results found</p>
                <p style={S.emptySubtext}>Try a different search term</p>
              </div>
            )}
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div style={{ ...S.emptyContainer, paddingTop: 40 }}>
          <SearchIcon size={48} style={{ opacity: 0.2, color: colors.textMuted }} />
          <p style={{ ...S.emptySubtext, marginTop: 12 }}>
            Search for your favorite teams, players, and leagues
          </p>
        </div>
      )}
    </div>
  );
}
