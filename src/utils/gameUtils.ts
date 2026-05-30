import { Game } from '../types';
import { GAMES } from '../games';

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
    
    // Normalization & Fallbacks
    developer: data.developer || 'PlayDravo Studios',
    version: data.version || '1.0.0',
    controls: Array.isArray(data.controls) ? data.controls : ['Mouse', 'Touch'],
    features: Array.isArray(data.features) ? data.features : [],
    orientation: data.orientation || 'responsive',
    avgPlayTime: data.avgPlayTime || '10m',
    difficulty: data.difficulty || 'Medium',
    engine: data.engine || 'HTML5 Canvas',
    releaseDate: data.releaseDate || '2024-01-01',
    authorUid: data.authorUid || 'system',
    mods: Array.isArray(data.mods) ? data.mods : [],
    ...data,
    // Force the correct URL if it's one of our hardcoded games, so we replace broken Firebase state
    url: GAMES.find(g => g.id === id)?.url || data.url || '',
    thumbnail: GAMES.find(g => g.id === id)?.thumbnail || data.thumbnail || '',
    mobileOptimization: GAMES.find(g => g.id === id)?.mobileOptimization || data.mobileOptimization || 'touch-friendly',
  };
}
