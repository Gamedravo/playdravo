import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
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
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
      >
        <GameThumbnail
          src={game.thumbnail}
          alt={game.title}
          category={game.category}
          title={game.title}
          gameId={game.id}
          priority
          className="w-full h-full object-cover object-center scale-[1.04]"
        />
      </motion.div>
    );
  }

  return null;
}
