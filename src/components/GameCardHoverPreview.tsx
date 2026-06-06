import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Play, Star } from 'lucide-react';
import type { Game } from '../types';
import { GameThumbnail } from './GameThumbnail';
import { getPreviewMediaCandidates } from '../lib/gamePreviewMedia';
import { getActiveHoverPreviewId, subscribeHoverPreview } from '../lib/hoverPreviewSession';

interface GameCardHoverPreviewProps {
  game: Game;
  gameId: string;
  active: boolean;
  isDarkMode: boolean;
  anchorRect: DOMRect | null;
}

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 250;
const GAP = 14;
const EDGE_PADDING = 12;

function getFloatingPosition(anchorRect: DOMRect | null) {
  if (typeof window === 'undefined' || !anchorRect) {
    return { left: EDGE_PADDING, top: EDGE_PADDING };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fitsRight = anchorRect.right + GAP + PANEL_WIDTH <= viewportWidth - EDGE_PADDING;
  const fitsLeft = anchorRect.left - GAP - PANEL_WIDTH >= EDGE_PADDING;

  const left = fitsRight
    ? anchorRect.right + GAP
    : fitsLeft
      ? anchorRect.left - GAP - PANEL_WIDTH
      : Math.min(Math.max(anchorRect.left, EDGE_PADDING), viewportWidth - PANEL_WIDTH - EDGE_PADDING);

  const idealTop = anchorRect.top + anchorRect.height / 2 - PANEL_HEIGHT / 2;
  const top = Math.min(Math.max(idealTop, EDGE_PADDING), viewportHeight - PANEL_HEIGHT - EDGE_PADDING);

  return { left, top };
}

export function GameCardHoverPreview({ game, gameId, active, isDarkMode, anchorRect }: GameCardHoverPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const candidates = useMemo(() => getPreviewMediaCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(() => getActiveHoverPreviewId() === gameId);
  const [position, setPosition] = useState(() => getFloatingPosition(anchorRect));

  const current = candidates[Math.min(candidateIndex, candidates.length - 1)];
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
    ? description.length > 112
      ? description.slice(0, 109) + '…'
      : description
    : null;

  useEffect(() => {
    if (!active) {
      setCandidateIndex(0);
      return;
    }

    setSessionActive(getActiveHoverPreviewId() === gameId);
    return subscribeHoverPreview((id) => setSessionActive(id === gameId));
  }, [active, gameId]);

  useEffect(() => {
    if (!active) return;

    const updatePosition = () => setPosition(getFloatingPosition(anchorRect));
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [active, anchorRect]);

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

  if (!active || !sessionActive) return null;

  const renderMedia = () => {
    if (current.kind === 'mp4') {
      return (
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
      );
    }

    if (current.kind === 'gif') {
      return (
        <img
          src={current.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setCandidateIndex((i) => (i + 1 < candidates.length ? i + 1 : i))}
        />
      );
    }

    return (
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.06 }}
        transition={{ duration: 5, ease: 'linear' }}
      >
        <GameThumbnail
          src={current.kind === 'thumbnail' ? current.url : game.thumbnail}
          alt={game.title}
          category={game.category}
          title={game.title}
          gameId={game.id}
          priority
          className="w-full h-full object-cover object-center"
        />
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed pointer-events-none overflow-hidden rounded-3xl border shadow-[0_24px_80px_rgba(0,0,0,0.45)] z-[2500] ${
        isDarkMode ? 'bg-[#080810] border-white/10' : 'bg-white border-black/10'
      }`}
      style={{
        left: position.left,
        top: position.top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      }}
    >
      <div className="absolute inset-0">
        {renderMedia()}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />

      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-accent/95 text-bg-dark px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">
        <Play className="w-2.5 h-2.5 fill-current" />
        Preview
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-200 text-[10px] font-black">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            <Gamepad2 className="w-3 h-3 text-white/70" />
            <span className="text-white/70 text-[9px] uppercase font-bold tracking-wide">{game.category}</span>
          </div>
          {playsLabel && <span className="ml-auto text-white/45 text-[10px] font-semibold">{playsLabel}</span>}
        </div>

        <div>
          <h4 className="text-white text-lg font-black leading-tight line-clamp-1">{game.title}</h4>
          {snippet && <p className="mt-1 text-white/58 text-[11px] leading-snug line-clamp-2">{snippet}</p>}
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-white text-bg-dark px-4 py-2 text-[11px] font-black uppercase tracking-wide shadow-lg">
          <Play className="w-3.5 h-3.5 fill-current" />
          Play now
        </div>
      </div>
    </motion.div>
  );
}
