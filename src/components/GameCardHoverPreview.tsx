import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Play, Gamepad2 } from 'lucide-react';
import type { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { getPreviewMediaCandidates } from '../lib/gamePreviewMedia';
import { getActiveHoverPreviewId, subscribeHoverPreview } from '../lib/hoverPreviewSession';

interface GameCardHoverPreviewProps {
  game: Game;
  gameId: string;
  active: boolean;
  isDarkMode: boolean;
}

export function GameCardHoverPreview({ game, gameId, active, isDarkMode }: GameCardHoverPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const candidates = useMemo(() => getPreviewMediaCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(() => getActiveHoverPreviewId() === gameId);

  const current = candidates[Math.min(candidateIndex, candidates.length - 1)];

  useEffect(() => {
    if (!active) {
      setCandidateIndex(0);
      return;
    }

    return subscribeHoverPreview((id) => setSessionActive(id === gameId));
  }, [active, gameId, game.title, game.previewVideoUrl, game.thumbnail]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || current.kind !== 'mp4') return;

    if (!active || !sessionActive) {
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
  }, [active, sessionActive, current, candidates.length]);

  if (!active) return null;

  const fade = { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const };

  if (current.kind === 'mp4' && sessionActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          onError={() => setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
      </motion.div>
    );
  }

  if (current.kind === 'gif' && sessionActive) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
      >
        <img
          src={current.url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
      </motion.div>
    );
  }

  if (current.kind === 'thumbnail') {
    const rating = game.rating || 4.5;
    const plays = game.plays || 0;
    const playsLabel =
      plays >= 1_000_000
        ? `${(plays / 1_000_000).toFixed(1)}M plays`
        : plays >= 1_000
        ? `${(plays / 1_000).toFixed(0)}K plays`
        : plays > 0
        ? `${plays} plays`
        : null;
    const description = game.description?.trim();
    const snippet = description
      ? description.length > 80
        ? description.slice(0, 77) + '…'
        : description
      : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 1.0 }}
        animate={{ opacity: 1, scale: 1.0 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
      >
        {/* Zoomed thumbnail */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.0 }}
          animate={{ scale: 1.08 }}
          transition={{ duration: 6, ease: 'linear' }}
        >
          <GameThumbnail
            src={game.thumbnail}
            alt={game.title}
            category={game.category}
            title={game.title}
            gameId={game.id}
            priority
            className="w-full h-full object-cover object-center"
          />
        </motion.div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

        {/* Top: Preview badge */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
        >
          <Play className="w-2 h-2 fill-current" />
          Preview
        </motion.div>

        {/* Bottom: Game info card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-x-0 bottom-0 p-2.5 space-y-1.5"
        >
          {/* Rating + category row */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-300 font-bold text-[9px]">{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gamepad2 className="w-2.5 h-2.5 text-white/60" />
              <span className="text-white/60 text-[8px] uppercase font-semibold tracking-wide">{game.category}</span>
            </div>
            {playsLabel && (
              <span className="text-white/40 text-[8px] font-medium ml-auto">{playsLabel}</span>
            )}
          </div>

          {/* Title */}
          <p className="text-white font-bold text-[11px] leading-tight line-clamp-2 drop-shadow-sm">
            {game.title}
          </p>

          {/* Description snippet */}
          {snippet && (
            <p className="text-white/55 text-[8px] leading-relaxed line-clamp-2">
              {snippet}
            </p>
          )}

          {/* Mobile optimization badge */}
          {game.mobileOptimization === 'touch-friendly' && (
            <div className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-[7px] font-semibold uppercase px-1.5 py-0.5 rounded-full">
              📱 Mobile Friendly
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  return null;
}
