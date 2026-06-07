import type { Game } from '../types';

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

function madKidGamesThumb2(thumbnail: string): string | null {
  if (thumbnail.includes('madkidgames.com') && thumbnail.includes('thumb_1.jpg')) {
    return thumbnail.replace('thumb_1.jpg', 'thumb_2.jpg');
  }
  return null;
}

/**
 * Ordered preview candidates for a game:
 *   1. explicit previewVideoUrl  → mp4
 *   2. explicit previewGifUrl    → gif
 *   3. trailerUrl (YouTube)      → youtube iframe (muted autoplay)
 *   4. screenshots               → gif (animated) | thumbnail (static)
 *   5. MadKidGames thumb_2 auto  → thumbnail (cycles with thumb_1)
 *   6. main thumbnail            → thumbnail
 */
export function getPreviewMediaCandidates(
  game: Pick<
    Game,
    'id' | 'thumbnail' | 'previewVideoUrl' | 'previewGifUrl' | 'trailerUrl' | 'screenshots'
  >,
): PreviewMediaCandidate[] {
  const out: PreviewMediaCandidate[] = [];
  const seen = new Set<string>();

  const add = (kind: PreviewMediaKind, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ kind, url });
  };

  // 1. Explicit video
  add('mp4', game.previewVideoUrl);

  // 2. Explicit GIF
  add('gif', game.previewGifUrl);

  // 3. YouTube trailer
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

  // 5. MadKidGames auto thumb_2 (confirmed to exist for all their games)
  const thumb2 = madKidGamesThumb2(game.thumbnail);
  if (thumb2) {
    // Put thumb_1 first (it's already the visible card thumbnail, so cycling to thumb_2 shows change)
    add('thumbnail', game.thumbnail);
    add('thumbnail', thumb2);
  }

  // 6. Fallback main thumbnail (for games without any other preview)
  add('thumbnail', game.thumbnail);

  if (out.length === 0) {
    out.push({ kind: 'none', url: game.id });
  }

  return out;
}
