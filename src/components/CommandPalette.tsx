import React from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, ArrowRight, Clock, Command } from 'lucide-react';
import { GameThumbnail } from './GameThumbnail';
import { Game } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: any) => string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredGames: Game[];
  handleGameClick: (game: Game) => void;
  categories: string[];
  recentlyPlayedGames: Game[];
  setSelectedCategory: (category: string) => void;
  categoryKeyMap: Record<string, string>;
}

export function CommandPalette({
  isOpen,
  onClose,
  isDarkMode,
  t,
  searchQuery,
  setSearchQuery,
  filteredGames,
  handleGameClick,
  categories,
  recentlyPlayedGames,
  setSelectedCategory,
  categoryKeyMap
}: CommandPaletteProps) {
  return (
    <div className={`fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <motion.div 
        initial={false}
        animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? 'bg-bg-dark/80' : 'bg-white/80'}`}
      />
      <motion.div
        initial={false}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: -10 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}
      >
        <div className={`p-4 flex items-center gap-3 transition-all ${isDarkMode ? 'bg-white/[0.02]' : 'bg-black/[0.02]'}`}>
          <Search className="w-5 h-5 text-accent ml-2" />
          <input 
            autoFocus
            type="text"
            placeholder={t('search')}
            className={`flex-1 bg-transparent border-none outline-none text-lg font-medium py-2 ${isDarkMode ? 'placeholder:text-white/20 text-white' : 'placeholder:text-black/20 text-black'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredGames.length > 0) {
                handleGameClick(filteredGames[0]);
                onClose();
              }
            }}
          />
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <span className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>ESC</span>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
          <div className="space-y-6">
            {searchQuery && filteredGames.length > 0 && (
              <div>
                <h4 className={`text-[10px] font-semibold tracking-wide px-4 mb-3 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('gamesFound')}</h4>
                <div className="grid grid-cols-1 gap-2">
                  {filteredGames.slice(0, 8).map((game, idx) => (
                    <motion.button
                      key={`pal-game-${game.id}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        handleGameClick(game);
                        onClose();
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 group-hover:border-accent/50 transition-all">
                        <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold group-hover:text-accent transition-colors">{game.title}</p>
                        <p className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t((categoryKeyMap[game.category] || game.category) as any)}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-accent transition-all" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {!searchQuery && (
              <div className="grid grid-cols-2 gap-8 p-4">
                <div>
                  <h4 className={`text-[10px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('quickCategories')}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.slice(0, 6).map((cat, idx) => (
                      <motion.button
                        key={`quick-cat-${cat}-${idx}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedCategory(cat);
                          onClose();
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all text-left text-sm font-bold ${isDarkMode ? 'text-white/80 hover:text-white' : 'text-black/80 hover:text-black'}`}
                      >
                        {t((categoryKeyMap[cat] || cat) as any)}
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className={`text-[10px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('recentActivity')}</h4>
                  <div className="space-y-2">
                    {recentlyPlayedGames.slice(0, 3).map((game, idx) => (
                      <motion.button
                        key={`recent-center-${game.id}-${idx}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 5, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleGameClick(game);
                          onClose();
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full"
                      >
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold truncate">{game.title}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 border rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-black/5 border-black/10 text-black/80'}`}>↑↓</kbd>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('navigate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <kbd className={`px-1.5 py-0.5 border rounded text-[10px] font-mono ${isDarkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-black/5 border-black/10 text-black/80'}`}>↵</kbd>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('select')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Command className={`w-3 h-3 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('commandCenter')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
