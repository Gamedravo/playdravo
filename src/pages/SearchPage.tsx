import React, { useState, useEffect, useRef, useDeferredValue, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
  Search,
  ArrowLeft,
  Brain,
  Zap,
  Sparkles,
  Flame,
  Users,
  Star,
  History,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { GameCard } from '../components/GameCard';
import { GameThumbnail } from '../components/GameThumbnail';
import { Analytics } from '../lib/analytics';

interface SearchPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  games: Game[];
  toggleFavorite: (gameId: string) => void;
  userProfile: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const trendingSearches = ['Action', 'Arcade', 'Puzzle', 'Sports', 'Strategy', 'Multiplayer'];

const suggestions = [
  { label: 'Deep & immersive', icon: Brain, tone: 'from-purple-500/25 to-fuchsia-500/10 text-purple-200' },
  { label: 'Train your brain', icon: Sparkles, tone: 'from-blue-500/25 to-cyan-500/10 text-blue-200' },
  { label: 'Adrenaline rush', icon: Zap, tone: 'from-orange-500/25 to-red-500/10 text-orange-200' },
];

const featuredCategories = [
  { label: 'New', icon: Sparkles, tone: 'from-emerald-500/25 to-teal-500/10' },
  { label: 'Trending', icon: Flame, tone: 'from-red-500/25 to-orange-500/10' },
  { label: 'Multiplayer', icon: Users, tone: 'from-blue-500/25 to-indigo-500/10' },
  { label: 'Recommended', icon: Star, tone: 'from-yellow-500/25 to-amber-500/10' },
];

export const SearchPage: React.FC<SearchPageProps> = React.memo(({
  isDarkMode,
  t,
  games,
  toggleFavorite,
  userProfile,
  searchQuery,
  setSearchQuery,
}) => {
  const [results, setResults] = useState<Game[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {

    if (searchInputRef.current && window.innerWidth >= 768) {
      searchInputRef.current.focus({ preventScroll: true });
    }

    const saved = localStorage.getItem('topg_recent_searches');
    if (!saved) return;

    try {
      setRecentSearches(JSON.parse(saved));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (deferredSearchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const query = deferredSearchQuery.toLowerCase();
    const filtered = games.filter((game) =>
      game.title.toLowerCase().includes(query) ||
      game.category.toLowerCase().includes(query) ||
      Boolean(game.tags?.some((tag) => tag.toLowerCase().includes(query))),
    );

    setResults(filtered);

    const saveTimer = setTimeout(() => {
      const trimmed = deferredSearchQuery.trim();
      if (trimmed.length > 1 && trimmed.length < 30) {
        Analytics.trackSearch(trimmed, filtered.length);
        setRecentSearches((prev) => {
          const withoutDuplicate = prev.filter((term) => term.toLowerCase() !== trimmed.toLowerCase());
          const next = [trimmed, ...withoutDuplicate].slice(0, 5);
          localStorage.setItem('topg_recent_searches', JSON.stringify(next));
          return next;
        });
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [deferredSearchQuery, games]);

  const clearRecentSearches = (event: React.MouseEvent) => {
    event.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('topg_recent_searches');
  };

  const popularGames = useMemo(
    () => games.slice().sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 4),
    [games],
  );
  const visibleResults = useMemo(() => results.slice(0, 72), [results]);
  const heroGame = popularGames[0] || games[0];

  const panelClass = isDarkMode

    ? 'border-white/10 bg-white/[0.055] shadow-[0_24px_80px_rgba(0,0,0,0.28)]'
    : 'border-black/10 bg-white/75 shadow-[0_24px_80px_rgba(89,74,120,0.14)]';

  return (
    <div className={`relative min-h-full overflow-hidden ${isDarkMode ? 'bg-[#06060b]' : 'bg-[#f7f4ff]'}`}>
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-32 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-[-8rem] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative z-10 px-3 pb-16 pt-3 md:px-5 md:pt-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3 md:mb-6">
            <button
              aria-label="Go back"
              onClick={() => {
                setSearchQuery('');
                navigate('/');
              }}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-95 md:h-12 md:w-12 md:rounded-2xl ${panelClass}`}
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <motion.div

              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="group relative flex-1"
            >
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent/35 via-fuchsia-500/20 to-blue-500/25 opacity-70 blur-xl transition-opacity duration-300 group-focus-within:opacity-100" />
              <div
                className={`relative flex h-11 items-center rounded-2xl border px-3 backdrop-blur-2xl transition-all duration-200 md:h-[72px] md:rounded-full md:px-7 ${
                  isDarkMode
                    ? 'border-white/[0.12] bg-white/[0.075] group-focus-within:border-accent/55 group-focus-within:bg-white/[0.095]'
                    : 'border-white/70 bg-white/70 group-focus-within:border-accent/45 group-focus-within:bg-white/90'
                }`}
              >
                <Search className="h-4 w-4 shrink-0 text-accent md:h-6 md:w-6" />
                <input
                  ref={searchInputRef}
                  aria-label="Search games"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('searchGamesPlaceholder') || 'Search games...'}
                  className={`h-full min-w-0 flex-1 border-none bg-transparent px-2 text-sm font-black tracking-tight outline-none placeholder:text-xs placeholder:font-bold md:px-4 md:text-xl md:placeholder:text-sm ${
                    isDarkMode ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/35'
                  }`}
                />

                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      aria-label="Clear search"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => setSearchQuery('')}
                      className={`grid h-8 w-8 place-items-center rounded-full transition-all hover:scale-105 active:scale-95 md:h-9 md:w-9 ${
                        isDarkMode ? 'bg-white/10 text-white/70 hover:text-white' : 'bg-black/5 text-black/60 hover:text-black'
                      }`}
                    >
                      <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </motion.button>

                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {!searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
            >
              <div className={`relative overflow-hidden rounded-[2rem] border p-5 backdrop-blur-2xl md:p-6 ${panelClass}`}>
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Modern discovery
                </div>
                <h1 className="max-w-2xl text-3xl font-black leading-none tracking-tight md:text-5xl">
                  Find your next game without digging through noise.
                </h1>
                <p className={`mt-4 max-w-xl text-sm leading-relaxed md:text-base ${isDarkMode ? 'text-white/55' : 'text-black/55'}`}>
                  Search by title, genre, mood, or favorite play style. Quick suggestions and trending picks keep discovery fast.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const Icon = suggestion.icon;
                    return (
                      <button
                        key={suggestion.label}
                        onClick={() => setSearchQuery(suggestion.label)}
                        className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r px-4 py-2.5 text-sm font-bold backdrop-blur-xl transition-all hover:scale-[1.03] active:scale-95 ${suggestion.tone}`}
                      >
                        <Icon className="h-4 w-4" />
                        {suggestion.label}
                      </button>
                    );
                  })}
                </div>

                {heroGame && (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/games/${heroGame.id}`)}
                      className="group relative min-h-[210px] overflow-hidden rounded-[1.5rem] border border-white/10 text-left shadow-2xl shadow-black/20"
                    >
                      <GameThumbnail
                        src={heroGame.thumbnail}
                        alt={heroGame.title}
                        category={heroGame.category}
                        title={heroGame.title}
                        gameId={heroGame.id}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="mb-2 inline-flex rounded-full bg-accent px-3 py-1 text-[9px] font-black uppercase tracking-widest text-bg-dark">
                          Featured search pick
                        </p>
                        <h2 className="line-clamp-1 text-2xl font-black text-white">{heroGame.title}</h2>
                        <p className="mt-1 text-xs font-semibold text-white/60">{heroGame.category}</p>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      {featuredCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.label}
                            type="button"
                            onClick={() => setSearchQuery(category.label)}
                            className={`group rounded-[1.4rem] border p-4 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-accent/35 active:scale-95 ${panelClass}`}
                          >
                            <div className={`mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${category.tone} text-white`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-black tracking-tight">{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className={`rounded-[2rem] border p-5 backdrop-blur-2xl ${panelClass}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-70">
                      <History className="h-4 w-4 text-accent" />
                      {t('recentSearches') || 'Recent Searches'}
                    </h3>
                    {recentSearches.length > 0 && (
                      <button
                        aria-label="Clear recent searches"
                        onClick={clearRecentSearches}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-400 transition-colors hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('clear') || 'Clear'}
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <button
                          key={`recent-term-${index}`}
                          onClick={() => setSearchQuery(term)}
                          className={`rounded-full px-3 py-2 text-xs font-bold transition-all hover:scale-[1.03] active:scale-95 ${
                            isDarkMode ? 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]' : 'bg-black/5 text-black/70 hover:bg-black/10'
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                      Your recent searches will appear here.
                    </p>
                  )}
                </div>

                <div className={`rounded-[2rem] border p-5 backdrop-blur-2xl ${panelClass}`}>
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-70">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    {t('trendingSearches') || 'Trending Searches'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-3.5 py-2 text-xs font-black text-accent transition-all hover:scale-[1.03] hover:bg-accent/18 active:scale-95"
                      >
                        <Flame className="h-3 w-3 fill-current" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {searchQuery && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                    <Search className="h-3.5 w-3.5" />
                    {results.length} matches
                  </p>
                  <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                    {t('resultsFor') || 'Results for'} <span className="text-accent">“{searchQuery}”</span>
                  </h2>
                </div>
              </div>

              {results.length > 0 ? (
                <div className="game-card-grid">
                  {visibleResults.map((game, index) => (
                    <GameCard
                      key={`search-game-${game.id}-${index}`}
                      game={game}
                      isDarkMode={isDarkMode}

                      t={t}
                      favorites={userProfile?.favorites || []}
                      toggleFavorite={toggleFavorite}
                      searchQuery={searchQuery}
                      handleGameClick={() => navigate(`/games/${game.id}`)}
                    />
                  ))}
                  {results.length > visibleResults.length && (
                    <p className="col-span-full py-3 text-center text-xs font-bold uppercase tracking-widest text-accent/70">
                      Showing top {visibleResults.length} of {results.length} matches — keep typing to narrow results.
                    </p>
                  )}
                </div>
              ) : (
                <div className={`rounded-[2rem] border p-6 text-center backdrop-blur-2xl md:p-8 ${panelClass}`}>

                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-accent/12 text-accent">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{t('noGamesFound') || 'No games found'}</h3>
                  <p className={`mx-auto mt-2 max-w-md text-sm leading-relaxed ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
                    {t('noGamesFoundDesc') || 'Try another keyword or jump into one of these popular games.'}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={`empty-trending-${term}`}
                        onClick={() => setSearchQuery(term)}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-[1.03] active:scale-95 ${
                          isDarkMode ? 'bg-white/[0.08] text-white/80 hover:bg-white/[0.12]' : 'bg-black/5 text-black/70 hover:bg-black/10'
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>

                  <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                    {popularGames.map((game) => (
                      <button
                        key={`rec-empty-${game.id}`}
                        onClick={() => navigate(`/games/${game.id}`)}
                        className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 active:scale-95 ${
                          isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/75'
                        }`}
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10">
                          <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} title={game.title} gameId={game.id} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="truncate text-sm font-black">{game.title}</h5>
                          <span className="text-[10px] font-black uppercase tracking-wide text-accent">{game.category}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});
