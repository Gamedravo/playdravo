import type { Game } from '../types';
import type { PreviewEntry } from '../hooks/usePreviewManifest';

export type PreviewMediaKind = 'mp4' | 'gif' | 'youtube' | 'thumbnail' | 'none';

export interface PreviewMediaCandidate {
  kind: PreviewMediaKind;
  url: string;
}

const isAnimatedImage = (url: string) => /\.(gif|webp)(\?|#|$)/i.test(url);

function extractYouTubeId(url: string): string | null {
  const m =
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * For MadKidGames games, thumb_2.jpg is confirmed to exist on their CDN
 * (thumb_3+ return soft-404 HTML). We return it as a 'gif' kind so it is
 * rendered via an <img> overlay immediately on hover — instant visual change.
 */
function madKidGamesThumb2(thumbnail: string): string | null {
  if (thumbnail.includes('madkidgames.com') && thumbnail.includes('thumb_1.jpg')) {
    return thumbnail.replace('thumb_1.jpg', 'thumb_2.jpg');
  }
  return null;
}

/**
 * Ordered preview candidates for a game card hover effect:
 *   0. manifest entry (server-probed CDN asset — highest priority)
 *   1. explicit previewVideoUrl  → mp4 (HTML5 video)
 *   2. explicit previewGifUrl    → gif (animated img)
 *   3. trailerUrl (YouTube)      → youtube iframe (muted autoplay)
 *   4. screenshots               → gif (animated) or thumbnail (static)
 *   5. MadKidGames auto thumb_2  → gif kind (shows immediately on hover)
 *   6. main thumbnail fallback   → thumbnail (no active preview)
 */
export function getPreviewMediaCandidates(
  game: Pick<
    Game,
    'id' | 'thumbnail' | 'previewVideoUrl' | 'previewGifUrl' | 'trailerUrl' | 'screenshots'
  >,
  manifestEntry?: PreviewEntry,
): PreviewMediaCandidate[] {
  const out: PreviewMediaCandidate[] = [];
  const seen = new Set<string>();

  const add = (kind: PreviewMediaKind, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ kind, url });
  };

  // 0. Manifest entry — server-probed CDN asset (mp4/webm/gif)
  if (manifestEntry) {
    const kind: PreviewMediaKind = manifestEntry.kind === 'webm' ? 'mp4' : manifestEntry.kind;
    add(kind, manifestEntry.url);
  }

  // 1. Explicit video (mp4 / webm)
  add('mp4', game.previewVideoUrl);

  // 2. Explicit GIF / animated WebP
  add('gif', game.previewGifUrl);

  // 3. YouTube trailer (muted autoplay iframe)
  if (game.trailerUrl) {
    const ytId = extractYouTubeId(game.trailerUrl);
    if (ytId) {
      add(
        'youtube',
        `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&start=5&enablejsapi=0`,
      );
    }
  }

  // 4. Screenshots
  game.screenshots?.forEach((url) => add(isAnimatedImage(url) ? 'gif' : 'thumbnail', url));

  // 5. MadKidGames: thumb_2.jpg overlays immediately as a 'gif' kind → instant preview
  const thumb2 = madKidGamesThumb2(game.thumbnail);
  if (thumb2) {
    add('gif', thumb2);
  }

  // 6. Fallback — thumbnail kind is excluded from active preview by GameCard filter
  add('thumbnail', game.thumbnail);

  if (out.length === 0) {
    out.push({ kind: 'none', url: game.id });
  }

  return out;
}
