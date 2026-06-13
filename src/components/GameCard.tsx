import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Trophy, Heart, Star, Play, Flame } from 'lucide-react';
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
  /** Mark this card's thumbnail as high-priority (above-the-fold). */
  priority?: boolean;
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

function formatPlayCount(plays: number): string {
  if (plays >= 1_000_000) return `${(plays / 1_000_000).toFixed(1)}M`;
  if (plays >= 1_000) return `${(plays / 1_000).toFixed(0)}K`;
  return plays.toString();
}

let activePreviewCardId: string | null = null;
const activePreviewListeners = new Set<(cardId: string | null) => void>();

function setActivePreviewCard(cardId: string | null) {
  if (activePreviewCardId === cardId) return;
  activePreviewCardId = cardId;
  activePreviewListeners.forEach((listener) => listener(cardId));
}

function clearActivePreviewCard(cardId: string) {
  if (activePreviewCardId === cardId) {
    setActivePreviewCard(null);
  }
}

function useActivePreviewCardId() {
  const [cardId, setCardId] = useState(activePreviewCardId);

  useEffect(() => {
    activePreviewListeners.add(setCardId);
    return () => {
      activePreviewListeners.delete(setCardId);
    };
  }, []);

  return cardId;
}

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

/** Thumbnail storyboard — cycles between static images every 1.4 s (YouTube-style) */
function ThumbnailCycler({
  candidates,
  active,
}: {
  candidates: PreviewMediaCandidate[];
  active: boolean;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [active]);

  useEffect(() => {
    if (!active || candidates.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % candidates.length), 1400);
    return () => clearInterval(t);
  }, [active, candidates.length]);

  if (!active || candidates.length === 0) return null;

  const url = candidates[idx]?.url;
  if (!url) return null;

  return (
    <img
      key={url}
      src={url}
      alt=""
      className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none animate-fade-in"
      loading="eager"
      decoding="async"
      referrerPolicy="no-referrer"
      aria-hidden
    />
  );
}

function InlineCardPreview({
  game,
  active,
  candidates,
}: {
  game: Pick<Game, 'id' | 'title'>;
  active: boolean;
  candidates: PreviewMediaCandidate[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const current: PreviewMediaCandidate | undefined = candidates[candidateIndex];

  const thumbnailCandidates = useMemo(
    () => candidates.filter((c) => c.kind === 'thumbnail'),
    [candidates],
  );

  const richCandidates = useMemo(
    () => candidates.filter((c) => c.kind !== 'thumbnail'),
    [candidates],
  );

  const richCurrent: PreviewMediaCandidate | undefined = richCandidates[candidateIndex];
  const useRich = richCandidates.length > 0;
  const useThumbnailCycle = !useRich && thumbnailCandidates.length > 1;

  useEffect(() => {
    setCandidateIndex(0);
  }, [game.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !video || !richCurrent || richCurrent.kind !== 'mp4') return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.src = richCurrent.url;
    video.load();
    video.play().catch(() => {
      setCandidateIndex((i) => (i + 1 < richCandidates.length ? i + 1 : i));
    });

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [active, richCurrent, richCandidates.length]);

  if (!active) return null;

  if (useThumbnailCycle) {
    return <ThumbnailCycler candidates={thumbnailCandidates} active={active} />;
  }

  if (!richCurrent) return null;

  if (richCurrent.kind === 'youtube') {
    return (
      <iframe
        key={richCurrent.url}
        src={richCurrent.url}
        className="absolute inset-0 h-full w-full pointer-events-none"
        style={{ border: 'none' }}
        allow="autoplay; encrypted-media"
        title={game.title}
        aria-hidden
      />
    );
  }

  if (richCurrent.kind === 'gif') {
    return (
      <img
        src={richCurrent.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setCandidateIndex((i) => (i + 1 < richCandidates.length ? i + 1 : i))}
        aria-hidden
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onError={() => setCandidateIndex((i) => (i + 1 < richCandidates.length ? i + 1 : i))}
    >
      <source src={richCurrent.url} type={getVideoType(richCurrent.url)} />
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
  priority = false,
}: GameCardProps) {
  const isFavorite = favorites.includes(game.id);
  const hoverSupported = useDesktopHover();
  const cardPreviewId = useId();
  const activeCardId = useActivePreviewCardId();

  const previewCandidates = useMemo(() => {
    const all = getPreviewMediaCandidates(game);
    const rich = all.filter((c) => c.kind === 'mp4' || c.kind === 'gif' || c.kind === 'youtube');
    const thumbs = all.filter((c) => c.kind === 'thumbnail');
    if (rich.length > 0) return all;
    if (thumbs.length > 1) return all;
    return [];
  }, [game]);

  const hasPreview = previewCandidates.length > 0;
  const previewActive = hoverSupported && activeCardId === cardPreviewId;

  useEffect(() => {
    if (!hoverSupported) clearActivePreviewCard(cardPreviewId);
    return () => clearActivePreviewCard(cardPreviewId);
  }, [cardPreviewId, hoverSupported]);

  const startPreview = () => {
    if (hoverSupported && hasPreview) {
      setActivePreviewCard(cardPreviewId);
    }
  };

  const stopPreview = () => clearActivePreviewCard(cardPreviewId);

  const playCount = typeof game.plays === 'number' ? game.plays : 0;

  return (
    <Link
      to={`/games/${game.id}`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onClick={(e) => {
        stopPreview();
        if (handleGameClick) {
          e.preventDefault();
          handleGameClick(game);
        }
      }}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-2xl"
      aria-label={`Play ${game.title}`}
    >
      <div
        className={`game-card-shell relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border transition-[transform,border-color,box-shadow] duration-200 ease-out ${
          isDarkMode
            ? 'border-white/[0.07] bg-[#0c0c14] shadow-[0_6px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_22px_56px_rgba(124,58,237,0.22),0_8px_24px_rgba(0,0,0,0.45)] group-hover:border-violet-400/40'
            : 'border-black/[0.08] bg-white shadow-[0_6px_20px_rgba(15,23,42,0.08)] group-hover:shadow-[0_18px_40px_rgba(124,58,237,0.18)] group-hover:border-violet-400/40'
        } group-hover:-translate-y-2 active:scale-[0.98]`}
      >
        {/* Premium hover sheen */}
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.09) 0%, transparent 45%, rgba(251,191,36,0.07) 100%)' }}
        />

        {/* Image / video area */}
        <div className="absolute inset-0 overflow-hidden">
          <GameThumbnail
            src={game.thumbnail}
            alt={game.title}
            category={game.category}
            title={game.title}
            gameId={game.id}
            priority={priority}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <InlineCardPreview game={game} active={previewActive} candidates={previewCandidates} />
        </div>

        {/* Preview indicator */}
        {hasPreview && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center gap-0.5 bg-black/65 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[8px] font-bold uppercase tracking-wider">Preview</span>
            </div>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-2 left-2 z-30 flex flex-col gap-1 pointer-events-none">
          {game.isTop && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg, #EAB308, #F59E0B)', boxShadow: '0 2px 10px rgba(234,179,8,0.45)' }}>
              <Trophy className="w-2.5 h-2.5" />
              Top
            </div>
          )}
          {game.isHot && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)', boxShadow: '0 2px 10px rgba(249,115,22,0.45)' }}>
              <Flame className="w-2.5 h-2.5" />
              Hot
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(game.id);
          }}
          aria-label={isFavorite ? `Remove ${game.title} from favorites` : `Add ${game.title} to favorites`}
          className={`absolute top-2 right-2 z-30 p-1.5 rounded-xl transition-all border opacity-0 group-hover:opacity-100 pointer-events-auto backdrop-blur-md ${
            isFavorite
              ? 'bg-red-500/95 border-red-400/30 text-white shadow-[0_2px_12px_rgba(239,68,68,0.5)]'
              : 'bg-black/55 border-white/15 text-white/90 hover:bg-black/70 hover:border-white/30'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6)] backdrop-blur-md border border-white/20"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))' }}>
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </div>
        </div>

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/97 via-black/75 to-transparent pt-16 z-20 pointer-events-none">
          <h3 className="text-white font-black text-[13px] leading-tight line-clamp-2 mb-2 group-hover:text-violet-200 transition-colors duration-200">
            <HighlightText text={game.title} query={searchQuery} />
          </h3>
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-white/45 text-[9.5px] font-bold uppercase tracking-widest truncate">
              {t(categoryKeyMap[game.category] || game.category)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {playCount > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-white/[0.08] border border-white/[0.10] px-1.5 py-0.5 backdrop-blur-sm">
                  <Play className="w-2 h-2 text-white/50 fill-white/50" />
                  <span className="text-[9px] font-black text-white/65">{formatPlayCount(playCount)}</span>
                </div>
              )}
              <div className="flex items-center gap-0.5 rounded-full bg-yellow-500/15 border border-yellow-400/20 px-1.5 py-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[9.5px] font-black text-yellow-300">{(game.rating || 4.5).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
