import { memo, useEffect } from 'react';
import { Search, RotateCcw, Play, Star, Terminal, Trophy, Flame, Heart, Clock } from 'lucide-react';
import { Game } from '../types';
import { GameCard } from './GameCard';
import { GameThumbnail } from './GameThumbnail';
import { GameCardSkeleton } from './LoadingSkeletons';
import { GAMES as STATIC_GAMES } from '../games';
import { useInViewport } from '../hooks/useInViewport';

interface GameGridProps {
  filteredGames: Game[];
  selectedCategory: string;
  searchQuery: string;
  isDarkMode: boolean;
  sortBy: 'title' | 'plays' | 'rating' | 'latest';
  setSortBy: (sort: 'title' | 'plays' | 'rating' | 'latest') => void;
  displayLimit: number;
  setDisplayLimit?: (limit: number | ((prev: number) => number)) => void;
  handleGameClick: (game: Game) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  t: (key: any) => string;
  isLoading?: boolean;
}

const categoryKeyMap: Record<string, string> = {
  'All': 'all',
  'Favorites': 'favorites',
  'Recommended': 'recommended',
  'History': 'history',
  'Trending': 'trending',
  'Mods': 'mods',
  'Action': 'action',
  'Adventure': 'adventure',
  'Arcade': 'arcade',
  'Casual': 'casual',
  'Horror': 'horror',
  'Puzzle': 'puzzle',
  'Simulator': 'simulator',
  'Obby': 'obby',
  'Sports': 'sports',
  'Strategy': 'strategy',
  'Multiplayer': 'multiplayer',
  '2 Player': 'twoPlayer',
  '3 Player': 'threePlayer',
  '4 Player': 'fourPlayer'
};

export const GameGrid = memo(function GameGrid({ 
  filteredGames,
  selectedCategory,
  searchQuery,
  isDarkMode,
  sortBy,
  setSortBy,
  displayLimit,
  setDisplayLimit,
  handleGameClick,
  setSearchQuery,
  setSelectedCategory,
  favorites = [],
  toggleFavorite,
  t,
  isLoading = false
}: GameGridProps) {
  const [sentinelRef, sentinelInView] = useInViewport<HTMLDivElement>({
    rootMargin: '400px 0px',
    once: false,
  });

  useEffect(() => {
    if (!sentinelInView || !setDisplayLimit) return;
    if (displayLimit >= filteredGames.length) return;
    setDisplayLimit((prev) => Math.min(prev + 28, filteredGames.length));
  }, [sentinelInView, displayLimit, filteredGames.length, setDisplayLimit]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <section className="shelf-section">
      <div id="bento-grid" className="shelf-header game-grid-header border-b border-white/5">
        <div className="section-heading-stack">
          <div className="section-eyebrow">
            <Flame className="w-3.5 h-3.5" />

            <span>{t('trending')}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">
            {selectedCategory === 'All' ? t('allGames') : t(categoryKeyMap[selectedCategory] || selectedCategory)}
          </h3>
        </div>

        {/* Sorting Games */}
        {selectedCategory !== 'Favorites' && (
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <div className="flex items-center p-1 rounded-xl border border-white/5 bg-white/5 min-w-max">
              {[
                { id: 'plays', label: 'Plays', icon: Play },
                { id: 'rating', label: 'Rating', icon: Star },
                { id: 'latest', label: 'Newest', icon: Clock }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-lg text-[11px] md:text-xs font-semibold tracking-tight transition-all shrink-0 ${
                    sortBy === option.id
                      ? 'bg-accent text-white'
                      : `hover:text-accent ${isDarkMode ? 'text-white/40' : 'text-black/40'}`
                  }`}
                >
                  <option.icon className="w-3.5 h-3.5" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (

          <div key="skeletons" className="game-card-grid">
            {[...Array(12)].map((_, i) => (
              <GameCardSkeleton key={`skeleton-${i}`} isDarkMode={isDarkMode} />
            ))}
          </div>

        ) : filteredGames.length === 0 ? (
          selectedCategory === 'Favorites' ? (
            <div
              key="favorites-empty"
              className={`col-span-full max-w-2xl mx-auto text-center py-16 px-6 sm:px-8 rounded-[2.5rem] border ${
                isDarkMode ? 'bg-[#151525]/30 border-white/5' : 'bg-white border-black/5 shadow-sm'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-red-500/10 text-red-500 animate-pulse">
                <Heart className="w-8 h-8 fill-current" />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight mb-2">Build Your Collection</h3>
              <p className={`text-sm max-w-sm mx-auto mb-8 leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                Save games you love to launch them directly from your dashboard. Tap the heart icon (<span className="text-red-500">♥</span>) on any game tile to start your library.
              </p>
              
              <div className={`pt-8 border-t border-dashed ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-6">Popular starting picks</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  {STATIC_GAMES.slice(0, 4).map((gm) => (
                    <div 
                      key={`fav-empty-${gm.id}`}
                      className={`group p-3 rounded-2xl border flex flex-col justify-between h-36 relative overflow-hidden transition-all duration-300 ${
                        isDarkMode ? 'bg-[#0f0f1c] hover:bg-[#15152a] border-white/5' : 'bg-gray-50 hover:bg-white border-black/5 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shrink-0">
                          <GameThumbnail src={gm.thumbnail} alt={`Play ${gm.title} game online free`} category={gm.category} className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(gm.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isDarkMode ? 'bg-black/40 hover:bg-black/60 text-white/70' : 'bg-black/5 hover:bg-black/10 text-black/70'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${favorites.includes(gm.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>
                      <div className="min-w-0 cursor-pointer pt-4" onClick={() => handleGameClick(gm)}>
                        <h5 className="text-[11px] font-bold truncate group-hover:text-accent transition-colors">{gm.title}</h5>
                        <span className="text-[9px] uppercase font-bold text-accent/70">{gm.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div 
              key="no-results"
              className="col-span-full py-32 text-center"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                <Search className={`w-10 h-10 ${isDarkMode ? 'text-white/10' : 'text-black/10'}`} />
              </div>
              <h3 className={`text-xl md:text-2xl font-bold tracking-tight mb-2 md:mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('noGamesFound')}</h3>
              <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {t('noResultsMessage').replace('{query}', searchQuery || 'none').replace('{category}', t(categoryKeyMap[selectedCategory] || selectedCategory))}
              </p>
              <button 
                onClick={handleReset}
                className={`mt-8 px-8 py-4 border rounded-2xl text-[10px] font-semibold tracking-wide transition-all active:scale-95 hover:bg-accent/10 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
              >
                {t('resetSearch')}
              </button>
            </div>
          )
        ) : (
          <div
            key={selectedCategory + searchQuery}
            className="game-card-grid"
          >
            {filteredGames.slice(0, displayLimit).map((game, index) => (
              <GameCard
                key={`grid-game-${game.id}-${index}`}
                game={game}
                isDarkMode={isDarkMode}
                handleGameClick={handleGameClick}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                searchQuery={searchQuery}
                t={t}
              />
            ))}
            {displayLimit < filteredGames.length && (
              <div ref={sentinelRef} className="col-span-full h-4" aria-hidden />
            )}
          </div>
        )}
    </section>
  );
});
