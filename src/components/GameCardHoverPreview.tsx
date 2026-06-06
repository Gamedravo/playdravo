import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  anchorRect: DOMRect | null;
  onPlay: () => void;
  onPreviewMouseEnter: () => void;
  onPreviewMouseLeave: () => void;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 230;
const GAP = 14;
const EDGE_PADDING = 12;

function getPreviewPosition(anchorRect: DOMRect | null) {
  if (!anchorRect || typeof window === 'undefined') {
    return { left: EDGE_PADDING, top: EDGE_PADDING };
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const hasRoomRight = anchorRect.right + GAP + PREVIEW_WIDTH <= viewportWidth - EDGE_PADDING;
  const left = hasRoomRight
    ? anchorRect.right + GAP
    : Math.max(EDGE_PADDING, anchorRect.left - GAP - PREVIEW_WIDTH);
  const desiredTop = anchorRect.top + anchorRect.height / 2 - PREVIEW_HEIGHT / 2;
  const top = Math.min(
    Math.max(EDGE_PADDING, desiredTop),
    Math.max(EDGE_PADDING, viewportHeight - PREVIEW_HEIGHT - EDGE_PADDING),
  );

  return { left, top };
}

export function GameCardHoverPreview({
  game,
  gameId,
  active,
  anchorRect,
  onPlay,
  onPreviewMouseEnter,
  onPreviewMouseLeave,
}: GameCardHoverPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const candidates = useMemo(() => getPreviewMediaCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [sessionActive, setSessionActive] = useState(() => getActiveHoverPreviewId() === gameId);
  const current = candidates[Math.min(candidateIndex, candidates.length - 1)];
  const position = getPreviewPosition(anchorRect);

  useEffect(() => {
    if (!active) {
      setCandidateIndex(0);
      return;
    }

    return subscribeHoverPreview((id) => setSessionActive(id === gameId));
  }, [active, gameId]);

  useEffect(() => {
    setCandidateIndex(0);
  }, [game.id]);

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
      setCandidateIndex((index) => (index + 1 < candidates.length ? index + 1 : index));
    });

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [active, sessionActive, current, candidates.length]);

  if (!active || !sessionActive || typeof document === 'undefined') return null;

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
    ? description.length > 94
      ? description.slice(0, 91) + '…'
      : description
    : null;

  const media = (() => {
    if (current.kind === 'mp4') {
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

    if (current.kind === 'gif') {
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
        priority
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    );
  })();

  return createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 4 }}
      transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-auto fixed z-[2000] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#080811] shadow-[0_22px_70px_rgba(0,0,0,0.55)]"
      style={{ left: position.left, top: position.top, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT }}
    >
      <div className="absolute inset-0">
        {media}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/5" />
      </div>

      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md">
        <Play className="h-2.5 w-2.5 fill-current text-accent" />
        Preview
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-yellow-300">
            <Star className="h-3 w-3 fill-yellow-300" />
            {rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 text-white/65">
            <Gamepad2 className="h-3 w-3" />
            {game.category}
          </span>
          {playsLabel && <span className="ml-auto text-white/45">{playsLabel}</span>}
        </div>

        <div>
          <h4 className="line-clamp-1 text-base font-black text-white">{game.title}</h4>
          {snippet && <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-white/58">{snippet}</p>}
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-[10px] font-black uppercase tracking-wider text-bg-dark shadow-lg shadow-accent/20 transition-transform active:scale-95"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Play now
        </button>
      </div>
    </motion.div>,
    document.body,
  );
}
