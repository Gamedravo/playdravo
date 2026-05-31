import type { Game } from '../types';

export type PreviewMediaKind = 'mp4' | 'gif' | 'canvas';

export interface PreviewMediaCandidate {
  kind: PreviewMediaKind;
  url: string;
}

/** Build ordered hover-preview candidates: explicit MP4 → derived MP4 → GIF → canvas fallback. */
export function getPreviewMediaCandidates(game: Pick<Game, 'id' | 'url' | 'previewVideoUrl' | 'previewGifUrl'>): PreviewMediaCandidate[] {
  const out: PreviewMediaCandidate[] = [];
  const seen = new Set<string>();

  const add = (kind: PreviewMediaKind, url: string | undefined) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ kind, url });
  };

  add('mp4', game.previewVideoUrl);
  add('gif', game.previewGifUrl);

  for (const url of derivePreviewUrlsFromEmbed(game.url)) {
    if (url.endsWith('.gif')) add('gif', url);
    else add('mp4', url);
  }

  out.push({ kind: 'canvas', url: game.id });
  return out;
}

function derivePreviewUrlsFromEmbed(embedUrl: string): string[] {
  const urls: string[] = [];
  try {
    const parsed = new URL(embedUrl);
    if (!parsed.hostname.includes('onlinegames.io')) return urls;

    const htmlPath = parsed.pathname;
    const base = embedUrl.replace(/\/[^/]+\.html?(\?.*)?$/i, '');
    urls.push(`${base}/preview.mp4`);
    urls.push(`${base}/gameplay.mp4`);
    urls.push(`${base}/video.mp4`);
    urls.push(embedUrl.replace(/\.html?(\?.*)?$/i, '.mp4'));
    urls.push(embedUrl.replace(/index\.html?(\?.*)?$/i, 'preview.mp4'));

    const slugMatch = htmlPath.match(/\/([^/]+)\/(?:game|index)\.html?$/i);
    if (slugMatch) {
      const slug = slugMatch[1];
      urls.push(`https://www.onlinegames.io/media/cache/preview/${slug}.mp4`);
      urls.push(`https://www.onlinegames.io/media/cache/preview/${slug}.gif`);
    }
  } catch {
    // ignore
  }
  return urls;
}
