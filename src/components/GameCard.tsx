import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { HighlightText } from './HighlightText';
import { getPreviewMediaCandidates, type PreviewMediaCandidate } from '../lib/gamePreviewMedia';

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

function useDesktopHover() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return enabled;
}

function getVideoType(url: string) {
  if (/\.webm(\?|#|$)/i.test(url)) return 'video/webm';
  if (/\.ogg|\.ogv(\?|#|$)/i.test(url)) return 'video/ogg';
  return 'video/mp4';
}

function InlineCardPreview({
  game,
  active,
}: {
  game: Game;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const candidates = useMemo(
    () => getPreviewMediaCandidates(game).filter((candidate) => candidate.kind === 'mp4' || candidate.kind === 'gif'),
    [game],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const current: PreviewMediaCandidate | undefined = candidates[candidateIndex];

  useEffect(() => {
    setCandidateIndex(0);
  }, [game.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current || current.kind !== 'mp4') return;

    if (!active) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.src = current.url;
    video.load();
    video.play().catch(() => {
      setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index));
    });

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [active, current, candidates.length]);

  if (!active || !current) return null;

  if (current.kind === 'gif') {
    return (
      <img
        src={current.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index))}
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover object-center"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onError={() => setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index))}
    >
      <source src={current.url} type={getVideoType(current.url)} />
    </video>
  );
}

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
  const hoverSupported = useDesktopHover();
  const [isHovered, setIsHovered] = useState(false);
  const previewActive = hoverSupported && isHovered;

  const stopPreview = () => setIsHovered(false);

  return (
    <Link
      to={`/games/${game.id}`}
      onMouseEnter={() => {
        if (hoverSupported) setIsHovered(true);
      }}
      onMouseLeave={stopPreview}
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
            ? 'border-white/[0.06] bg-[#0c0c14] shadow-[0_2px_8px_rgba(0,0,0,0.35)] group-hover:shadow-[0_8px_24px_rgba(157,92,255,0.18)] group-hover:border-accent/45'
            : 'border-black/[0.06] bg-white shadow-sm group-hover:shadow-[0_8px_20px_rgba(157,92,255,0.12)] group-hover:border-accent/35'
        } group-hover:ring-1 group-hover:ring-accent/25 active:scale-[0.99]`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <GameThumbnail
            src={game.thumbnail}
            alt={game.title}
            category={game.category}
            title={game.title}
            gameId={game.id}
            className="h-full w-full object-cover object-center"
          />
          <InlineCardPreview game={game} active={previewActive} />
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
