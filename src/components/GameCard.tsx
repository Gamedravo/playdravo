import { memo, useState, useEffect, useRef } from 'react';
import { Trophy, Heart, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { HighlightText } from './HighlightText';
import { GameCardHoverPreview } from './GameCardHoverPreview';
import { AnimatePresence } from 'motion/react';
import { claimHoverPreview, releaseHoverPreview } from '../lib/hoverPreviewSession';

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
  All: 'all',
  Favorites: 'favorites',
  Recommended: 'recommended',
  History: 'history',
  Trending: 'trending',
  Mods: 'mods',
  Action: 'action',
  Adventure: 'adventure',
  Arcade: 'arcade',
  Casual: 'casual',
  Horror: 'horror',
  Puzzle: 'puzzle',
  Simulator: 'simulator',
  Obby: 'obby',
  Sports: 'sports',
  Strategy: 'strategy',
  Multiplayer: 'multiplayer',
  '2 Player': 'twoPlayer',
  '3 Player': 'threePlayer',
  '4 Player': 'fourPlayer',
};

const HOVER_DELAY_MS = 80;

export const GameCard = memo(function GameCard({
  game,
  isDarkMode,
  handleGameClick,
  favorites = [],
  toggleFavorite,
  searchQuery = '',
  t,
}: GameCardProps) {
  const isFavorite = favorites.includes(game.id);
  const [showPreview, setShowPreview] = useState(false);
  const [hoverSupported, setHoverSupported] = useState(false);
  const [previewAnchorRect, setPreviewAnchorRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHoverSupported(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => {
      mq.removeEventListener('change', update);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      releaseHoverPreview(game.id);
    };
  }, [game.id]);

  const stopPreview = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowPreview(false);
    releaseHoverPreview(game.id);
  };

  const handleMouseEnter = () => {
    if (!hoverSupported) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setPreviewAnchorRect(cardRef.current?.getBoundingClientRect() ?? null);
    hoverTimeoutRef.current = setTimeout(() => {
      setPreviewAnchorRect(cardRef.current?.getBoundingClientRect() ?? null);
      claimHoverPreview(game.id);
      setShowPreview(true);
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    stopPreview();
  };

  return (
    <Link
      ref={cardRef}
      to={`/games/${game.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        stopPreview();
        if (handleGameClick) {
          e.preventDefault();
          handleGameClick(game);
        }
      }}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl"
      aria-label={`Play ${game.title}`}
    >
      <div
        className={`relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border transition-[border-color,box-shadow] duration-150 ease-out ${
          isDarkMode
            ? 'border-white/[0.06] bg-[#0c0c14] shadow-[0_2px_8px_rgba(0,0,0,0.35)] group-hover:shadow-[0_8px_24px_rgba(157,92,255,0.25)] group-hover:border-accent/50'
            : 'border-black/[0.06] bg-white shadow-sm group-hover:shadow-[0_8px_20px_rgba(157,92,255,0.15)] group-hover:border-accent/40'
        } group-hover:ring-1 group-hover:ring-accent/30 active:scale-[0.99]`}
      >
        <div className="absolute inset-0 overflow-hidden transition-opacity duration-150">
          <GameThumbnail
            src={game.thumbnail}
            alt={game.title}
            category={game.category}
            title={game.title}
            gameId={game.id}
            className="w-full h-full object-cover object-center transition-transform duration-150 ease-out group-hover:scale-[1.04]"
          />
        </div>

        {hoverSupported && (
          <AnimatePresence>
            {showPreview && (
              <GameCardHoverPreview
                game={game}
                gameId={game.id}
                active={showPreview}
                isDarkMode={isDarkMode}
                anchorRect={previewAnchorRect}
              />
            )}
          </AnimatePresence>
        )}

        <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />

        <div className="absolute inset-0 z-[6] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-accent/90 text-bg-dark flex items-center justify-center shadow-[0_0_16px_rgba(157,92,255,0.45)]">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
          {game.isTop && (
            <div className="px-1.5 py-0.5 bg-yellow-500/95 text-white text-[8px] font-bold uppercase rounded">
              <Trophy className="w-2.5 h-2.5 inline mr-0.5" />
              {t('top')}
            </div>
          )}
          {game.isHot && (
            <div className="px-1.5 py-0.5 bg-accent/95 text-white text-[8px] font-bold uppercase rounded">
              {t('hot')}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(game.id);
          }}
          aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
          className={`absolute top-2 right-2 z-30 p-1.5 rounded-lg transition-all border opacity-0 group-hover:opacity-100 pointer-events-auto ${
            isFavorite
              ? 'bg-red-500/95 border-red-400/30 text-white'
              : 'bg-black/50 border-white/15 text-white/90 hover:bg-black/70'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-10 z-20 pointer-events-none">
          <h3 className="text-white font-bold text-[11px] leading-tight line-clamp-2 mb-0.5 group-hover:text-accent transition-colors">
            <HighlightText text={game.title} query={searchQuery} />
          </h3>
          <div className="flex items-center justify-between gap-1">
            <span className="text-white/45 text-[8px] font-semibold uppercase tracking-wide truncate">
              {t(categoryKeyMap[game.category] || game.category)}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[9px] font-semibold text-white/80">{(game.rating || 4.5).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
