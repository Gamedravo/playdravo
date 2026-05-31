import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Game, UserProfile } from '../types';
import { GameCard } from '../components/GameCard';
import { GameThumbnail } from '../components/GameThumbnail';
import { 
  Heart, 
  History, 
  Play,
  TrendingUp,
  Gamepad2,
  Trophy,
  ArrowRight,
  Clock,
  LayoutGrid
} from 'lucide-react';
import { SEO } from '../components/SEO';

interface LibraryPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  games: Game[];
  favorites: string[];
  playHistory: string[];
  handleGameClick: (game: Game) => void;
  toggleFavorite: (gameId: string) => void;
  userProfile?: UserProfile | null;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  isDarkMode,
  t,
  games,
  favorites,
  playHistory,
  handleGameClick,
  toggleFavorite,
  userProfile
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on route
  const isHistory = location.pathname.includes('/history');
  const activeTab = isHistory ? 'history' : 'favorites';

  const favoriteGames = useMemo(() => {
    return games.filter(g => favorites.includes(g.id));
  }, [games, favorites]);

  const historyGames = useMemo(() => {
    // Keep order of playHistory (most recent first)
    const historyMap = new Map(games.map(g => [g.id, g]));
    return playHistory
      .map(id => historyMap.get(id))
      .filter((g): g is Game => g !== undefined);
  }, [games, playHistory]);

  const trendingGames = useMemo(() => {
    return [...games].sort((a, b) => b.plays - a.plays).slice(0, 4);
  }, [games]);

  const renderEmptyState = () => {
    if (activeTab === 'favorites') {
      return (
        <div className={`mt-8 p-12 text-center rounded-[2.5rem] border border-dashed transition-all ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]'}`}>
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${isDarkMode ? 'bg-bg-dark border border-white/10' : 'bg-white border border-black/10'}`}>
            <Heart className={`w-8 h-8 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('emptyFavoritesTitle') || 'Your collection is empty'}</h2>
          <p className={`max-w-md mx-auto mb-8 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
            {t('emptyFavoritesDesc') || 'Start building your personal library by favoriting games you love. They will be saved here for quick access across all your devices.'}
          </p>
          
          <div className="pt-8 border-t border-dashed border-white/10 text-left">
            <h3 className="text-sm font-bold tracking-tight mb-6 flex items-center gap-2 opacity-80">
              <TrendingUp className="w-4 h-4 text-accent" />
              {t('popularGamesToTry') || 'Popular Games to Try'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {trendingGames.map(game => (
                <GameCard
                  key={`empty-rec-${game.id}`}
                  game={game}
                  isDarkMode={isDarkMode}
                  handleGameClick={handleGameClick}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`mt-8 p-12 text-center rounded-[2.5rem] border border-dashed transition-all ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]'}`}>
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-xl ${isDarkMode ? 'bg-bg-dark border border-white/10' : 'bg-white border border-black/10'}`}>
          <History className={`w-8 h-8 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`} />
        </div>
        <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('emptyHistoryTitle') || 'No gameplay history yet'}</h2>
        <p className={`max-w-md mx-auto mb-8 text-sm ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
          {t('emptyHistoryDesc') || 'Games you play will automatically appear here. Resume your previous sessions instantly and pick up right where you left off.'}
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 rounded-xl bg-accent text-bg-dark font-bold hover:bg-accent/90 transition-colors flex items-center gap-2 mx-auto"
        >
          <LayoutGrid className="w-5 h-5" />
          {t('browseGames') || 'Browse Games'}
        </button>
      </div>
    );
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto w-full min-h-[80vh]">
      <SEO 
        title={`${activeTab === 'history' ? 'Recently Played' : 'Favorites'} - My Library`}
        description="View your personal gaming library, favorites, and recent gameplay history."
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
              {activeTab === 'favorites' ? (
                <Heart className="w-6 h-6 text-red-500 fill-red-500/20" />
              ) : (
                <History className="w-6 h-6 text-accent" />
              )}
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
              {t('myText') || 'My'} <span className={activeTab === 'favorites' ? 'text-red-500' : 'text-accent'}>{t('myLibrary') || 'Library'}</span>
            </h1>
          </div>
          
          <div className="flex bg-black/5 dark:bg-white/5 rounded-2xl p-1.5 w-fit border border-black/5 dark:border-white/5">
            <button
              onClick={() => navigate('/library/favorites')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'favorites' 
                  ? 'bg-white dark:bg-bg-dark text-black dark:text-white shadow-sm' 
                  : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              {t('favorites') || 'Favorites'}
            </button>
            <button
              onClick={() => navigate('/library/history')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'history' 
                  ? 'bg-white dark:bg-bg-dark text-black dark:text-white shadow-sm' 
                  : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              {t('recentlyPlayed') || 'Recently Played'}
            </button>
          </div>
        </div>

        {userProfile && (
          <div className="hidden md:flex items-center gap-4 bg-gradient-to-r from-accent/10 to-transparent p-4 rounded-2xl border border-accent/20">
            <img src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid}`} alt="Profile" className="w-12 h-12 rounded-full border-2 border-accent/50 shadow-lg" />
            <div>
              <div className="text-sm font-bold text-accent">{t('personalHub') || 'Personal Hub'}</div>
              <div className={`text-xs font-semibold ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('loggedInAs') || 'Logged in as'} {userProfile.displayName || 'Player'}</div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'favorites' ? (
            favoriteGames.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {favoriteGames.map((game, idx) => (
                  <GameCard
                    key={`fav-${game.id}`}
                    game={game}
                    handleGameClick={handleGameClick}
                    isDarkMode={isDarkMode}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    t={t}
                  />
                ))}
              </div>
            ) : renderEmptyState()
          ) : (
            historyGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {historyGames.map((game, idx) => (
                  <motion.div
                    key={`hist-${game.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleGameClick(game)}
                    className={`group cursor-pointer rounded-[2rem] border overflow-hidden relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-accent/30' : 'bg-black/[0.02] border-black/5 hover:border-accent/30'}`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <GameThumbnail src={game.thumbnail || ''} alt={game.title} category={game.category} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6 z-20">
                        <div className="w-full">
                          <h3 className="text-white font-bold text-lg mb-1 truncate">{game.title}</h3>
                          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            {idx === 0 ? 'Played just now' : `Played recently`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute right-4 top-4 w-12 h-12 bg-accent text-bg-dark rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
                        <Play className="w-5 h-5 ml-1 fill-current" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : renderEmptyState()
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
