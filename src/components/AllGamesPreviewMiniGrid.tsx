import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, Star, Sparkles } from 'lucide-react';
import type { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { getPreviewMediaCandidates } from '../lib/gamePreviewMedia';
import { useInViewport } from '../hooks/useInViewport';

interface AllGamesPreviewMiniGridProps {
  games: Game[];
  isDarkMode: boolean;
  handleGameClick: (game: Game) => void;
  t: (key: any) => string;
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

function PreviewMedia({ game, active, isDesktop }: { game: Game; active: boolean; isDesktop: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const candidates = useMemo(() => getPreviewMediaCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const current = candidates[Math.min(candidateIndex, candidates.length - 1)];
  const canAnimate = active && isDesktop;

  useEffect(() => {
    setCandidateIndex(0);
  }, [game.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || current.kind !== 'mp4') return;

    if (!canAnimate) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    if (video.src !== current.url) {
      video.src = current.url;
      video.load();
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.play().catch(() => {
      setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index));
    });

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [canAnimate, current, candidates.length]);

  if (current.kind === 'mp4' && canAnimate) {
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        onError={() => setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index))}
      />
    );
  }

  if (current.kind === 'gif' && canAnimate) {
    return (
      <img
        src={current.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index))}
      />
    );
  }

  return (
    <GameThumbnail
      src={game.thumbnail}
      alt={game.title}
      category={game.category}
      title={game.title}
      gameId={game.id}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

export function AllGamesPreviewMiniGrid({ games, isDarkMode, handleGameClick, t }: AllGamesPreviewMiniGridProps) {
  const isDesktop = useDesktopHover();
  const [previewRef, previewInView] = useInViewport<HTMLDivElement>({ rootMargin: '160px 0px', once: false });

  const featuredGame = useMemo(() => {
    return games
      .filter((game) => Boolean(game?.id))
      .slice()
      .sort((a, b) => (b.plays || 0) - (a.plays || 0) || (b.rating || 0) - (a.rating || 0))[0];
  }, [games]);

  const previewGames = useMemo(() => {
    if (!featuredGame) return [];
    const unique = new Map<string, Game>();
    [featuredGame, ...games].forEach((game) => {
      if (game?.id && !unique.has(game.id)) unique.set(game.id, game);
    });
    return Array.from(unique.values()).slice(0, 3);
  }, [featuredGame, games]);

  const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

  useEffect(() => {
    if (!featuredGame) return;
    setHoveredGameId((current) => current ?? featuredGame.id);
  }, [featuredGame]);

  if (!featuredGame || previewGames.length < 3) return null;

  const activeGame = previewGames.find((game) => game.id === hoveredGameId) || featuredGame;
  const rating = activeGame.rating || 4.5;

  return (
    <div
      className={`mb-5 rounded-[1.75rem] border p-3 sm:p-4 ${
        isDarkMode ? 'border-white/[0.06] bg-white/[0.025]' : 'border-black/[0.06] bg-black/[0.02]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
            <Sparkles className="h-3 w-3" />
            Live discovery
          </p>
          <h4 className="text-sm font-black tracking-tight sm:text-base">Explore All Games</h4>
        </div>
        <span className={`hidden text-[10px] font-semibold sm:block ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>
          Hover thumbnails to update the preview
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {previewGames.map((game) => (
          <button
            key={`all-games-preview-thumb-${game.id}`}
            type="button"
            onMouseEnter={() => {
              if (isDesktop) setHoveredGameId(game.id);
            }}
            onFocus={() => setHoveredGameId(game.id)}
            onClick={() => handleGameClick(game)}
            className={`group relative aspect-video overflow-hidden rounded-2xl border text-left transition-all duration-100 ${
              activeGame.id === game.id
                ? 'border-accent/60 ring-1 ring-accent/30'
                : isDarkMode
                ? 'border-white/10 hover:border-accent/45'
                : 'border-black/10 hover:border-accent/35'
            }`}
          >
            <GameThumbnail
              src={game.thumbnail}
              alt={game.title}
              category={game.category}
              title={game.title}
              gameId={game.id}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <span className="absolute bottom-2 left-2 right-2 truncate text-[11px] font-black text-white drop-shadow">
              {game.title}
            </span>
          </button>
        ))}

        <div ref={previewRef} className="relative aspect-video overflow-hidden rounded-2xl border border-accent/25 bg-[#080811] shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGame.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="absolute inset-0"
            >
              <PreviewMedia game={activeGame} active={previewInView} isDesktop={isDesktop} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
              <div className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white/85 backdrop-blur-md">
                Featured preview
              </div>
              <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-300">
                  <Star className="h-3 w-3 fill-yellow-300" />
                  {rating.toFixed(1)}
                </div>
                <h5 className="line-clamp-1 text-sm font-black text-white">{activeGame.title}</h5>
                <button
                  type="button"
                  onClick={() => handleGameClick(activeGame)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-bg-dark shadow-lg shadow-accent/20 transition-transform active:scale-95"
                >
                  <Play className="h-3 w-3 fill-current" />
                  {t('playNow') || 'Play'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
