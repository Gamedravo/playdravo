import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowLeft, Brain, Zap, Sparkles, Flame, Users, Star, History, TrendingUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../types';
import { GAMES as STATIC_GAMES } from '../games';
import { GameCard } from '../components/GameCard';
import { GameThumbnail } from '../components/GameThumbnail';
import { Analytics } from '../lib/analytics';

interface SearchPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  toggleFavorite: (gameId: string) => void;
  userProfile: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = React.memo(({ 
  isDarkMode, 
  t, 
  toggleFavorite, 
  userProfile,
  searchQuery,
  setSearchQuery
}) => {
  const [results, setResults] = useState<Game[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (searchInputRef.current && window.innerWidth >= 768) {
      searchInputRef.current.focus({ preventScroll: true });
    }
    const saved = localStorage.getItem('topg_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update recent searches securely when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = STATIC_GAMES.filter(game => 
      game.title.toLowerCase().includes(query) || 
      game.category.toLowerCase().includes(query) ||
      (game.tags && game.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    setResults(filtered);

    // Save search query after 1.5 seconds of typing (simple debounce saving)
    const saveTimer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed.length > 1 && trimmed.length < 30) {
        // Track the search with Analytics
        Analytics.trackSearch(trimmed, filtered.length);
        
        setRecentSearches(prev => {
          const filteredPrev = prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase());
          const next = [trimmed, ...filteredPrev].slice(0, 5);
          localStorage.setItem('topg_recent_searches', JSON.stringify(next));
          return next;
        });
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [searchQuery]);

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('topg_recent_searches');
  };

  // Using a mix of static highly sought terms and dynamic ones
  const trendingSearches = [
    '2048',
    'Action',
    'Arcade',
    'Puzzle',
    'Sports',
    'Strategy'
  ];

  const suggestions = [
    { label: 'Deep & immersive', icon: <Brain className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-500' },
    { label: 'Train your brain', icon: <Sparkles className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-500' },
    { label: 'Adrenaline rush', icon: <Zap className="w-4 h-4" />, color: 'bg-orange-500/20 text-orange-500' },
  ];

  const featuredCategories = [
    { label: 'New', icon: <Sparkles className="w-6 h-6" />, color: 'bg-emerald-500/10 text-emerald-500' },
    { label: 'Trending', icon: <Flame className="w-6 h-6" />, color: 'bg-red-500/10 text-red-500' },
    { label: 'Multiplayer', icon: <Users className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Recommended', icon: <Star className="w-6 h-6" />, color: 'bg-yellow-500/10 text-yellow-500' },
  ];

  return (
    <div className="w-full">
      {/* Sticky Search Bar */}
      <div className={`sticky top-0 z-50 p-3 md:p-8 border-b transition-colors duration-300 ${isDarkMode ? 'border-white/5 bg-bg-dark/80 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]' : 'border-black/5 bg-white/80 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'}`}>
        <div className="flex items-center gap-3 md:gap-4 max-w-4xl mx-auto">
          <button 
            aria-label="Go back"
            onClick={() => {
              setSearchQuery('');
              navigate('/');
            }}
            className={`p-2.5 md:p-3 rounded-full transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/70 hover:text-black'}`}
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex-1 relative group"
          >
            {/* Animated Glow Backdrop */}
            <div className={`absolute -inset-[1px] md:-inset-[2px] rounded-full blur-md transition-all duration-500 opacity-0 group-focus-within:opacity-100 ${isDarkMode ? 'bg-gradient-to-r from-accent/50 via-purple-500/50 to-accent/50' : 'bg-gradient-to-r from-accent/30 via-purple-400/30 to-accent/30'}`} />
            
            {/* Inner Container */}
            <div className={`relative flex items-center h-12 md:h-14 rounded-full px-4 md:px-5 transition-all duration-300 border ${
              isDarkMode 
                ? 'bg-[#151525]/90 border-white/10 group-focus-within:border-accent/50 group-focus-within:bg-[#1a1a2e] shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]' 
                : 'bg-white/90 border-black/10 group-focus-within:border-accent/40 group-focus-within:bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]'
            }`}>
              <Search className={`w-4 h-4 md:w-5 md:h-5 transition-colors duration-300 ${isDarkMode ? 'text-white/40 group-focus-within:text-accent' : 'text-black/40 group-focus-within:text-accent'}`} />
              
              <input 
                ref={searchInputRef}
                aria-label="Search games"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchGamesPlaceholder') || "Search games..."}
                className={`flex-1 bg-transparent border-none outline-none px-3 md:px-4 text-[14px] md:text-[15px] font-bold tracking-wide placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px] md:placeholder:text-[11px] ${isDarkMode ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/30'}`}
              />
              
              <AnimatePresence>
                {searchQuery && (
                  <motion.button 
                    aria-label="Clear search"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery('')}
                    className={`p-1.5 md:p-2 rounded-full transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/60 hover:text-black'}`}
                  >
                    <span className="text-[10px] md:text-[11px] font-semibold tracking-wide px-1">{t('clear') || 'Clear'}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Area (Search Results) */}
      <div className={`pb-20 ${searchQuery ? 'p-3 md:p-8' : 'px-4 md:px-8 pt-4 pb-20'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Default View (No Search Query) */}
          {!searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 py-4"
            >
              {/* Recent & Trending Searches Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-2">
                {/* Recent Searches panel */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold tracking-wider uppercase opacity-40 flex items-center gap-2">
                      <History className="w-3.5 h-3.5" />
                      {t('recentSearches') || 'Recent Searches'}
                    </h3>
                    {recentSearches.length > 0 && (
                      <button 
                        aria-label="Clear recent searches"
                        onClick={clearRecentSearches}
                        className="text-[10px] font-bold tracking-wider uppercase text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('clear') || 'Clear'}
                      </button>
                    )}
                  </div>
                  {recentSearches.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <button
                          key={`recent-term-${i}`}
                          onClick={() => setSearchQuery(term)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                            isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-black/5 hover:bg-black/10 text-black/80'
                          }`}
                        >
                          <Search className="w-3 h-3 opacity-60" />
                          {term}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs ${isDarkMode ? 'text-white/30' : 'text-black/30'} italic`}>
                      Your recent searches will appear here.
                    </p>
                  )}
                </div>

                {/* Trending Searches panel */}
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                  <h3 className="text-sm font-bold tracking-wider uppercase opacity-40 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t('trendingSearches') || 'Trending Searches'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((term, i) => (
                      <button
                        key={`trending-term-${i}`}
                        onClick={() => setSearchQuery(term)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                          isDarkMode ? 'bg-accent/10 hover:bg-accent/20 text-accent' : 'bg-accent/10 hover:bg-accent/20 text-accent'
                        }`}
                      >
                        <Flame className="w-3 h-3 fill-current" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions (Deep & immersive) */}
              <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={`${suggestion.label}-${idx}`}
                    onClick={() => setSearchQuery(suggestion.label)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-[13px] md:text-sm font-bold transition-all hover:scale-105 active:scale-95 ${suggestion.color}`}
                  >
                    {suggestion.icon}
                    {suggestion.label}
                  </button>
                ))}
              </div>

              {/* Featured Categories */}
              <div>
                <h2 className="text-lg md:text-2xl font-bold tracking-tight mb-4 md:mb-6">{t('featured') || 'Featured'}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {featuredCategories.map((cat, idx) => (
                    <motion.button
                      key={`${cat.label}-${idx}`}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchQuery(cat.label)}
                      className={`flex flex-col items-center justify-center gap-3 md:gap-4 p-4 md:p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
                    >
                      <div className={`p-3 md:p-4 rounded-2xl ${cat.color}`}>
                        {cat.icon}
                      </div>
                      <span className="text-sm md:text-base font-bold tracking-wide">{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="py-2">
              <h2 className="text-xl font-bold tracking-tight mb-6">
                {t('resultsFor') || 'Results for'} <span className="text-accent">"{searchQuery}"</span>
              </h2>
              
              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {results.map((game, idx) => (
                    <GameCard 
                      key={`search-game-${game.id}-${idx}`}
                      game={game}
                      isDarkMode={isDarkMode}
                      t={t}
                      favorites={userProfile?.favorites || []}
                      toggleFavorite={toggleFavorite}
                      searchQuery={searchQuery}
                      handleGameClick={() => navigate(`/games/${game.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 md:py-16 space-y-12">
                  <div className="space-y-4">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-sm border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                      <Search className={`w-10 h-10 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{t('noGamesFound') || 'No games found'}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-black/40'} max-w-sm mx-auto`}>{t('noGamesFoundDesc') || 'Try searching for a different category or keyword, or explore our top-rated recommendations below.'}</p>
                  </div>

                  <div className={`max-w-xl mx-auto border-t border-dashed p-6 pt-10 rounded-3xl ${isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-black/10 bg-black/[0.01]'}`}>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {t('trendingSearches') || 'Try Trending Searches'}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                      {trendingSearches.map((term, i) => (
                        <button
                          key={`empty-trending-term-${i}`}
                          onClick={() => setSearchQuery(term)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                            isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-black/5 hover:bg-black/10 text-black/80'
                          }`}
                        >
                          <Search className="w-3 h-3 opacity-60" />
                          {term}
                        </button>
                      ))}
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {t('popularGames') || 'We recommend playing'}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {STATIC_GAMES.sort((a, b) => b.plays - a.plays).slice(0, 4).map((game) => (
                        <div 
                          key={`rec-empty-${game.id}`}
                          onClick={() => navigate(`/games/${game.id}`)}
                          className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer hover:border-accent/40 hover:-translate-y-0.5 active:scale-98 transition-all text-left ${
                            isDarkMode ? 'bg-[#151525]/80 border-white/5' : 'bg-white border-black/5'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                            <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-sm font-bold truncate pr-1">{game.title}</h5>
                            <span className="text-[10px] uppercase font-semibold text-accent">{game.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
