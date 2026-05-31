import { memo, useState, useEffect, useRef } from 'react';
import { Trophy, Heart, Play, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { HighlightText } from './HighlightText';
import { GameplayPreview } from './GameplayPreview';
import { motion, AnimatePresence } from 'motion/react';

interface GameCardProps {
  game: Game;
  isDarkMode: boolean;
  handleGameClick: (game: Game) => void;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  searchQuery?: string;
  t: (key: any) => string;
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

export const GameCard = memo(function GameCard({ 
  game, 
  isDarkMode, 
  handleGameClick, 
  favorites = [], 
  toggleFavorite,
  searchQuery = "",
  t
}: GameCardProps) {
  const isFavorite = favorites.includes(game.id);
  const [showPreview, setShowPreview] = useState(false);
  const [hoverSupported, setHoverSupported] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didPrefetchRef = useRef(false);

  useEffect(() => {
    // Media query to check fine hover pointer inputs (e.g., desktops, notebooks)
    const mq = window.matchMedia('(hover: hover)');
    setHoverSupported(mq.matches);
    
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (!didPrefetchRef.current) {
      didPrefetchRef.current = true;
      void import('../pages/GamePage');
    }

    if (!hoverSupported) return;

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 300); // 300ms hover delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowPreview(false);
  };

  return (
    <Link 
      to={`/games/${game.id}`} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (handleGameClick) {
          e.preventDefault();
          handleGameClick(game);
        }
      }}
      className="block group focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-transparent rounded-xl md:rounded-2xl"
      aria-label={`Play ${game.title} - ${game.category} game`}
    >
      <div
        className={`relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ease-out will-change-transform ${
          isDarkMode 
            ? 'border-white/5 bg-white/[0.02] shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_rgba(157,92,255,0.25)]' 
            : 'border-black/5 bg-black/[0.02] shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(157,92,255,0.15)]'
        } hover:-translate-y-2 hover:border-accent/60 active:scale-95`}
      >
        <GameThumbnail 
          src={game.thumbnail} 
          alt={game.title}
          category={game.category}
          title={game.title}
          gameId={game.id}
          className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
        />
        
        {/* Live Gameplay Preview Overlay Layer */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 rounded-xl md:rounded-2xl overflow-hidden"
            >
              <GameplayPreview category={game.category} isDarkMode={isDarkMode} gameTitle={game.title} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-30 flex flex-col gap-1.5 pointer-events-none group-hover:scale-95 transition-transform duration-300">
          {game.isTop && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/95 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-widest rounded border border-yellow-400/20 shadow-md">
              <Trophy className="w-2.5 h-2.5 fill-current" />
              {t('top')}
            </div>
          )}
          {game.isHot && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-accent/95 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-widest rounded border border-accent/20 shadow-md">
              <Play className="w-2.5 h-2.5 fill-current" />
              {t('hot')}
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(game.id);
          }}
          aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
          className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-30 p-2 rounded-xl transition-all duration-300 border shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-90 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-3 pointer-events-auto md:flex items-center hidden ${
            isFavorite 
              ? 'bg-red-500/95 hover:bg-red-500 border-red-400/30 text-white' 
              : 'bg-black/45 backdrop-blur-md border-white/15 text-white/90 hover:bg-black/75 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${isFavorite ? 'fill-current animate-pulse' : ''}`} />
        </button>

        {/* Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/100 via-black/80 to-transparent pt-20 z-20 pointer-events-none translate-y-1 group-hover:translate-y-0 transition-all duration-300 ease-out">
          <div className="transition-transform duration-300">
            <h3 className="text-white font-extrabold text-sm md:text-[15px] leading-tight line-clamp-1 mb-1.5 drop-shadow-md tracking-tight group-hover:text-accent group-hover:scale-[1.01] transition-all duration-300 origin-left">
              <HighlightText text={game.title} query={searchQuery} />
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-[9px] font-extrabold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5 backdrop-blur-xs">
                {t(categoryKeyMap[game.category] || game.category)}
              </span>
              
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-0.5 text-yellow-400 font-bold text-[10px] tracking-wide">
                  <Star className="w-3 h-3 fill-current" />
                  {(game.rating || 4.5).toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-white/50 text-[10px] font-bold tracking-wide">
                  <Play className="w-3 h-3 fill-current" />
                  {game.plays >= 1000 ? `${(game.plays / 1000).toFixed(1)}K` : game.plays}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

