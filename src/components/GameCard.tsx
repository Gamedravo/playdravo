import { memo, useEffect, useId, useMemo, useRef, useState } from 'react';
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

  // Separate thumbnail candidates for the storyboard cycler
  const thumbnailCandidates = useMemo(
    () => candidates.filter((c) => c.kind === 'thumbnail'),
    [candidates],
  );

  // Non-thumbnail candidates (mp4 / gif / youtube)
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

  // MP4 playback
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

  // Storyboard thumbnail cycling (e.g. MadKidGames thumb_1 ↔ thumb_2)
  if (useThumbnailCycle) {
    return <ThumbnailCycler candidates={thumbnailCandidates} active={active} />;
  }

  if (!richCurrent) return null;

  // YouTube muted autoplay iframe
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

  // Animated GIF / WebP
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

  // HTML5 video (mp4 / webm)
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
}: GameCardProps) {
  const isFavorite = favorites.includes(game.id);
  const hoverSupported = useDesktopHover();
  const cardPreviewId = useId();
  const activeCardId = useActivePreviewCardId();

  const previewCandidates = useMemo(() => {
    const all = getPreviewMediaCandidates(game);
    const rich = all.filter((c) => c.kind === 'mp4' || c.kind === 'gif' || c.kind === 'youtube');
    const thumbs = all.filter((c) => c.kind === 'thumbnail');
    // Show preview when: has rich media OR multiple thumbnails to cycle through
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
            ? 'border-white/[0.08] bg-[#0c0c14] shadow-[0_8px_24px_rgba(0,0,0,0.38)] group-hover:shadow-[0_20px_50px_rgba(34,211,238,0.18),0_8px_24px_rgba(124,58,237,0.2)] group-hover:border-cyan-400/40'
            : 'border-black/[0.08] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.08)] group-hover:shadow-[0_16px_34px_rgba(157,92,255,0.16)] group-hover:border-accent/45'
        } group-hover:-translate-y-1.5 group-hover:ring-1 group-hover:ring-cyan-400/20 active:scale-[0.98]`}
      >
        {/* Neon sweep on hover */}
        <div className="game-card-sweep pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(115deg, transparent 0%, rgba(34,211,238,0.07) 42%, transparent 62%)' }} />
        <div className="absolute inset-0 overflow-hidden">
          <GameThumbnail
            src={game.thumbnail}
            alt={game.title}
            category={game.category}
            title={game.title}
            gameId={game.id}
            className="h-full w-full object-cover object-center"
          />
          <InlineCardPreview game={game} active={previewActive} candidates={previewCandidates} />
        </div>

        {/* Preview indicator dot — shows when game has hover preview */}
        {hasPreview && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[8px] font-bold uppercase tracking-wider">Preview</span>
            </div>
          </div>
        )}

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

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-14 z-20 pointer-events-none">
          <h3 className="text-white font-black text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-cyan-300 transition-colors duration-200">
            <HighlightText text={game.title} query={searchQuery} />
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/55 text-[10px] font-bold uppercase tracking-wide truncate">
              {t(categoryKeyMap[game.category] || game.category)}
            </span>
            <div className="flex items-center gap-1 shrink-0 rounded-full bg-white/10 px-2 py-1 backdrop-blur-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-black text-white/90">{(game.rating || 4.5).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
