import { Game } from '../types';
import { GAMES } from '../games';
import { inferAdsInjectedFromUrl } from '../lib/adsInjection';
import { getCategoryFallbackThumbnail } from './thumbnailFallback';

/** Verified onlinegames.io catalog entries only. */
export function isCatalogGame(game: Pick<Game, 'id' | 'sourceId' | 'authorUid'>): boolean {
  const catalog = GAMES.find((g) => g.id === game.id);
  if (!catalog) return false;
  return catalog.sourceId === 'onlinegames-io' || catalog.authorUid === 'onlinegames-io';
}

export type ThumbnailSize = 'md' | 'lg';

/** Prefer responsive artwork; lg for hero/featured, md for cards. */
export function upgradeThumbnailResolution(url: string, size: ThumbnailSize = 'md'): string {
  const trimmed = url.trim();
  if (!trimmed.includes('onlinegames.io')) return trimmed;

  const target = size === 'lg' ? 'lg' : 'md';

  if (/-lg\.webp$/i.test(trimmed) && target === 'md') return trimmed.replace(/-lg\.webp$/i, '-md.webp');
  if (/-lg\.(jpg|jpeg|png)$/i.test(trimmed) && target === 'md') {
    return trimmed.replace(/-lg\.(jpg|jpeg|png)$/i, '-md.$1');
  }
  if (/-xs\.webp$/i.test(trimmed)) return trimmed.replace(/-xs\.webp$/i, `-${target}.webp`);
  if (/-md\.webp$/i.test(trimmed) && target === 'lg') return trimmed.replace(/-md\.webp$/i, '-lg.webp');
  if (/-xs\.(jpg|jpeg|png)$/i.test(trimmed)) {
    return trimmed.replace(/-xs\.(jpg|jpeg|png)$/i, `-${target}.$1`);
  }
  if (/-md\.(jpg|jpeg|png)$/i.test(trimmed) && target === 'lg') {
    return trimmed.replace(/-md\.(jpg|jpeg|png)$/i, '-lg.$1');
  }
  if (/\/responsive\/[^/]+-xs\./i.test(trimmed)) return trimmed.replace(/-xs\./, `-${target}.`);
  if (/\/responsive\/[^/]+-md\./i.test(trimmed) && target === 'lg') {
    return trimmed.replace(/-md\./, '-lg.');
  }
  return trimmed;
}

/**
 * Keep WebP only when the catalog URL is already WebP.
 * Do not rewrite JPG/PNG → WebP: most onlinegames.io posts only host JPG (WebP returns 403).
 */
export function preferWebPUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.includes('onlinegames.io')) return trimmed;
  if (/\.webp(\?|$)/i.test(trimmed)) return trimmed;
  return trimmed;
}

/** Use catalog thumbnail URL directly (onlinegames.io dataset). */
export function resolveGameThumbnail(
  gameId: string,
  thumbnail?: string,
  size: ThumbnailSize = 'md'
): string {
  const catalog = GAMES.find((g) => g.id === gameId);
  const raw = (catalog?.thumbnail || thumbnail || '').trim();
  return preferWebPUrl(upgradeThumbnailResolution(raw, size));
}

export interface ThumbnailSources {
  src: string;
  srcSet?: string;
  sizes: string;
}

const CARD_SIZES = '(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px';

/** Responsive src/srcSet for shelf cards and grid tiles. */
export function buildThumbnailSources(
  gameId: string,
  thumbnail?: string,
  size: ThumbnailSize = 'md'
): ThumbnailSources {
  const src = resolveGameThumbnail(gameId, thumbnail, size);
  const md = resolveGameThumbnail(gameId, thumbnail, 'md');
  const lg = resolveGameThumbnail(gameId, thumbnail, 'lg');

  if (md === lg) {
    return { src, sizes: CARD_SIZES };
  }

  return {
    src,
    srcSet: `${md} 200w, ${lg} 400w`,
    sizes: CARD_SIZES,
  };
}

/** Ordered candidates for <img> onError fallback (deduped). */
export function buildThumbnailFallbackChain(
  gameId: string,
  thumbnail?: string,
  size: ThumbnailSize = 'md',
  category?: string
): string[] {
  const catalog = GAMES.find((g) => g.id === gameId);
  const raw = (catalog?.thumbnail || thumbnail || '').trim();
  const chain: string[] = [
    resolveGameThumbnail(gameId, thumbnail, size),
    upgradeThumbnailResolution(raw, size),
    raw,
    getCategoryFallbackThumbnail(category || catalog?.category),
  ];
  return [...new Set(chain.filter(Boolean))];
}

export function parseFirebaseGame(id: string, data: any): Game {
  const url = GAMES.find((g) => g.id === id)?.url || data.url || '';
  return {
    id,
    title: data.title || 'Unknown Game',
    description: data.description || 'No description available.',
    category: data.category || 'Casual',
    tags: Array.isArray(data.tags) ? data.tags : [],
    plays: typeof data.plays === 'number' ? data.plays : 0,
    rating: typeof data.rating === 'number' ? data.rating : 0,
    isNew: !!data.isNew,
    isHot: !!data.isHot,
    isTop: !!data.isTop,
    createdAt: data.createdAt || new Date().toISOString(),
    developer: data.developer || 'OnlineGames.io',
    version: data.version || '1.0.0',
    controls: Array.isArray(data.controls) ? data.controls : ['Mouse', 'Touch'],
    features: Array.isArray(data.features) ? data.features : [],
    orientation: data.orientation || 'responsive',
    avgPlayTime: data.avgPlayTime || '10m',
    difficulty: data.difficulty || 'Medium',
    engine: data.engine || 'HTML5',
    releaseDate: data.releaseDate || '2024-01-01',
    authorUid: data.authorUid || 'system',
    mods: Array.isArray(data.mods) ? data.mods : [],
    ...data,
    url,
    thumbnail: resolveGameThumbnail(id, data.thumbnail),
    adsInjected: typeof data.adsInjected === 'boolean' ? data.adsInjected : inferAdsInjectedFromUrl(url),
    mobileOptimization:
      GAMES.find((g) => g.id === id)?.mobileOptimization ||
      data.mobileOptimization ||
      'touch-friendly',
  };
}
