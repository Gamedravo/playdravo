import { useMemo, useState } from 'react';
import type { Game } from '../types';
import { useInViewport } from '../hooks/useInViewport';

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      return u.pathname.replace(/^\//, '') || null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v');
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('/')[0] ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

type PreviewKind = 'youtube' | 'mp4' | 'none';

function getPreviewSource(game: Pick<Game, 'trailerUrl' | 'previewVideoUrl'>): { kind: PreviewKind; value: string | null } {
  const yt = game.trailerUrl ? extractYouTubeId(game.trailerUrl) : null;
  if (yt) return { kind: 'youtube', value: yt };
  if (game.previewVideoUrl) return { kind: 'mp4', value: game.previewVideoUrl };
  return { kind: 'none', value: null };
}

export function GamePreviewPlayer({
  game,
  className = '',
}: {
  game: Pick<Game, 'title' | 'thumbnail' | 'trailerUrl' | 'previewVideoUrl'>;
  className?: string;
}) {
  const source = useMemo(() => getPreviewSource(game), [game]);
  const [activated, setActivated] = useState(false);
  const [ref, inView] = useInViewport<HTMLDivElement>({ rootMargin: '250px 0px', threshold: 0.15, once: true });

  if (source.kind === 'none' || !source.value) return null;

  const canLoad = activated && inView;

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}>
      {/* Poster / Placeholder */}
      {!canLoad && (
        <button
          type="button"
          onClick={() => setActivated(true)}
          className="group relative w-full aspect-video bg-black text-left"
          aria-label={`Play preview for ${game.title}`}
        >
          <img
            src={game.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="fill-white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white/80">
            Preview
          </div>
        </button>
      )}

      {/* Loaded preview */}
      {canLoad && source.kind === 'youtube' && (
        <iframe
          className="w-full aspect-video"
          src={`https://www.youtube-nocookie.com/embed/${source.value}?rel=0&modestbranding=1&playsinline=1&mute=1`}
          title={`${game.title} preview`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}

      {canLoad && source.kind === 'mp4' && (
        <video
          className="w-full aspect-video bg-black"
          controls
          preload="none"
          playsInline
          muted
          poster={game.thumbnail}
        >
          <source src={source.value} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

