import type { Game } from '../types';

export type PreviewMediaKind = 'mp4' | 'gif' | 'thumbnail' | 'none';

export interface PreviewMediaCandidate {
  kind: PreviewMediaKind;
  url: string;
}

const isAnimatedImage = (url: string) => /\.(gif|webp)(\?|#|$)/i.test(url);

/** Ordered preview candidates: explicit video → GIF/animated image → screenshot → thumbnail → none. */
export function getPreviewMediaCandidates(
  game: Pick<Game, 'id' | 'thumbnail' | 'previewVideoUrl' | 'previewGifUrl' | 'screenshots'>,
): PreviewMediaCandidate[] {
  const out: PreviewMediaCandidate[] = [];
  const seen = new Set<string>();

  const add = (kind: PreviewMediaKind, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ kind, url });
  };

  add('mp4', game.previewVideoUrl);
  add('gif', game.previewGifUrl);
  game.screenshots?.forEach((url) => add(isAnimatedImage(url) ? 'gif' : 'thumbnail', url));
  add('thumbnail', game.thumbnail);

  if (out.length === 0) {
    out.push({ kind: 'none', url: game.id });
  }

  return out;
}
