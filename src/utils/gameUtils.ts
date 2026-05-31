import { Game } from '../types';
import { GAMES } from '../games';

/** Use catalog thumbnail URL directly (onlinegames.io dataset). */
export function resolveGameThumbnail(
  gameId: string,
  thumbnail?: string
): string {
  const catalog = GAMES.find((g) => g.id === gameId);
  return (catalog?.thumbnail || thumbnail || '').trim();
}

export function parseFirebaseGame(id: string, data: any): Game {
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
    url: GAMES.find((g) => g.id === id)?.url || data.url || '',
    thumbnail: resolveGameThumbnail(id, data.thumbnail),
    mobileOptimization:
      GAMES.find((g) => g.id === id)?.mobileOptimization ||
      data.mobileOptimization ||
      'touch-friendly',
  };
}
