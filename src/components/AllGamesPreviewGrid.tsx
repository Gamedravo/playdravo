import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Play, Star } from 'lucide-react';
import type { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { getPreviewMediaCandidates } from '../lib/gamePreviewMedia';
import { claimHoverPreview, releaseHoverPreview } from '../lib/hoverPreviewSession';
import { useInViewport } from '../hooks/useInViewport';

interface AllGamesPreviewGridProps {
  games: Game[];
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
  t: (key: any) => string;
}

const PREVIEW_ID = 'all-games-preview-tile';

export const AllGamesPreviewGrid = memo(function AllGamesPreviewGrid({
  games,
  isDarkMode,
  onPlay,
  t,
}: AllGamesPreviewGridProps) {
  const previewGames = useMemo(() => games.filter((game) => Boolean(game?.id)).slice(0, 3), [games]);
  const defaultGame = useMemo(
    () =>
      [...games]
        .filter((game) => Boolean(game?.id))
        .sort((a, b) => (Number(b.isHot) - Number(a.isHot)) || (b.plays || 0) - (a.plays || 0) || (b.rating || 0) - (a.rating || 0))[0] ||
      previewGames[0] ||
      null,
    [games, previewGames]
  );
  const [activeGame, setActiveGame] = useState<Game | null>(defaultGame);
  const [hoverSupported, setHoverSupported] = useState(false);
  const [sectionRef, inView] = useInViewport<HTMLDivElement>({ rootMargin: '120px 0px', once: false });

  useEffect(() => {
    setActiveGame(defaultGame);
  }, [defaultGame]);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHoverSupported(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!defaultGame || previewGames.length === 0) return null;

  const showHoverPreview = hoverSupported && inView;

  return (
    <div
      ref={sectionRef}
      className={`mb-5 rounded-[1.75rem] border p-3 sm:p-4 ${
        isDarkMode
          ? 'bg-white/[0.025] border-white/[0.06]'
          : 'bg-black/[0.02] border-black/[0.06]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
            <Gamepad2 className="w-3 h-3" />
            {t('allGames') || 'All Games'}
          </p>
          <h3 className="text-sm sm:text-base font-black tracking-tight">Instant game preview</h3>
        </div>
        <span className={`hidden sm:inline text-[10px] font-semibold ${isDarkMode ? 'text-white/35' : 'text-black/40'}`}>
          {hoverSupported ? 'Hover a tile' : 'Featured pick'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {previewGames.map((game) => (
          <button
            key={`all-games-mini-${game.id}`}
            type="button"
            onMouseEnter={() => {
              if (!showHoverPreview) return;
              setActiveGame(game);
              claimHoverPreview(PREVIEW_ID);
            }}
            onMouseLeave={() => {
              if (!showHoverPreview) return;
              setActiveGame(defaultGame);
              releaseHoverPreview(PREVIEW_ID);
            }}
            onFocus={() => setActiveGame(game)}
            onClick={() => onPlay(game)}
            className={`group relative aspect-[16/10] overflow-hidden rounded-2xl border text-left active:scale-[0.98] transition-all duration-100 ${
              isDarkMode
                ? 'border-white/[0.08] bg-[#0c0c14] hover:border-accent/50'
                : 'border-black/[0.08] bg-white hover:border-accent/40'
            }`}
          >
            <GameThumbnail
              src={game.thumbnail}
              alt={game.title}
              category={game.category}
              title={game.title}
              gameId={game.id}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5">
              <p className="text-white text-xs font-bold leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                {game.title}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-yellow-300">
                <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                {(game.rating || 4.5).toFixed(1)}
              </div>
            </div>
          </button>
        ))}

        <PreviewTile
          key={activeGame?.id || 'explore-all'}
          game={activeGame}
          fallbackGame={defaultGame}
          active={inView}
          hoverSupported={hoverSupported}
          isDarkMode={isDarkMode}
          onPlay={onPlay}
        />
      </div>
    </div>
  );
});

function PreviewTile({
  game,
  fallbackGame,
  active,
  hoverSupported,
  isDarkMode,
  onPlay,
}: {
  game: Game | null;
  fallbackGame: Game;
  active: boolean;
  hoverSupported: boolean;
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
}) {
  const selectedGame = game || fallbackGame;
  const candidates = useMemo(() => getPreviewMediaCandidates(selectedGame), [selectedGame]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const current = candidates[Math.min(candidateIndex, candidates.length - 1)];
  const canAnimate = hoverSupported && active;

  useEffect(() => {
    setCandidateIndex(0);
  }, [selectedGame.id]);

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
      setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
    });

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [canAnimate, current, candidates.length]);

  const media = current.kind === 'mp4' && canAnimate ? (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onError={() => setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
    />
  ) : current.kind === 'gif' && canAnimate ? (
    <img
      src={current.url}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
    />
  ) : (
    <GameThumbnail
      src={current.kind === 'thumbnail' ? current.url : selectedGame.thumbnail}
      alt={selectedGame.title}
      category={selectedGame.category}
      title={selectedGame.title}
      gameId={selectedGame.id}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );

  return (
    <button
      type="button"
      onClick={() => onPlay(selectedGame)}
      className={`group relative aspect-[16/10] overflow-hidden rounded-2xl border text-left ${
        isDarkMode
          ? 'border-accent/25 bg-[#090914] shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
          : 'border-accent/20 bg-white shadow-[0_16px_35px_rgba(0,0,0,0.08)]'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedGame.id}-${current.kind}-${current.url}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0"
        >
          {media}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <div className="absolute top-2 left-2 rounded-full bg-accent/95 text-bg-dark px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
        Preview
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 space-y-2">
        <div>
          <p className="text-white text-sm font-black leading-tight line-clamp-1">{selectedGame.title}</p>
          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-yellow-300">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {(selectedGame.rating || 4.5).toFixed(1)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white text-bg-dark px-3 py-1.5 text-[10px] font-black uppercase tracking-wide transition-transform group-hover:scale-[1.03]">
          <Play className="w-3 h-3 fill-current" />
          Play
        </span>
      </div>
    </button>
  );
}
