import type { Game } from '../types';

export type PreviewMediaKind = 'mp4' | 'gif' | 'thumbnail' | 'none';

export interface PreviewMediaCandidate {
  kind: PreviewMediaKind;
  url: string;
}

/** Ordered hover-preview candidates: explicit MP4 → GIF → thumbnail → none. */
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
  add('thumbnail', game.screenshots?.[0]);
  add('thumbnail', game.thumbnail);

  if (out.length === 0) {
    out.push({ kind: 'none', url: game.id });
  }

  return out;
}
