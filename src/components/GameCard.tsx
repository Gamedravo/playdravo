import { memo } from 'react';
import { Trophy, Heart, Play, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { HighlightText } from './HighlightText';

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

  const handleMouseEnter = () => {
    // Prefetch the GamePage component
    const prefetch = () => import('../pages/GamePage');
    prefetch();
  };

  return (
    <Link 
      to={`/games/${game.id}`} 
      onMouseEnter={handleMouseEnter}
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
        className={`relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer border transition-transform duration-150 will-change-transform ${
          isDarkMode 
            ? 'border-white/5 bg-white/[0.02] shadow-sm' 
            : 'border-black/5 bg-black/[0.02] shadow-sm'
        } hover:-translate-y-0.5 hover:border-accent/40 active:scale-95`}
      >
        <GameThumbnail 
          src={game.thumbnail} 
          alt={`Play ${game.title} game online free`}
          className="w-full h-full object-cover transition-transform duration-500 will-change-transform"
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {game.isTop && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide rounded border border-yellow-400/20 shadow-sm">
              <Trophy className="w-2.5 h-2.5 fill-current" />
              {t('top')}
            </div>
          )}
          {game.isHot && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-accent/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide rounded border border-accent/20 shadow-sm">
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
          className={`absolute top-2.5 right-2.5 md:top-3 md:right-3 z-30 p-2 rounded-lg transition-transform md:transition-colors duration-150 border shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-90 ${
            isFavorite 
              ? 'bg-red-500/90 hover:bg-red-500 border-red-500 text-white' 
              : 'bg-black/40 backdrop-blur-md border-white/10 text-white/80 hover:bg-black/60 hover:text-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Info Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-16 z-20 pointer-events-none translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
          <div className="transition-transform duration-300">
            <h3 className="text-white font-black text-sm md:text-base leading-tight line-clamp-1 mb-1 drop-shadow-md">
              <HighlightText text={game.title} query={searchQuery} />
            </h3>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-[9px] font-bold uppercase tracking-widest">
                {t(categoryKeyMap[game.category] || game.category)}
              </span>
              <div className="flex items-center gap-1 text-white/60 text-[10px] font-bold tracking-wide">
                <Play className="w-3 h-3 fill-current" />
                {game.plays >= 1000 ? `${(game.plays / 1000).toFixed(1)}K` : game.plays}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

