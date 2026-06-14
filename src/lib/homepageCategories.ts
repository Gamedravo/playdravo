import type { Game } from '../types';
import { GAME_CATEGORIES, countGamesForCategory } from './categories';

export type { GameCategory as HomepageCategoryChip } from './categories';

export const HOMEPAGE_CATEGORY_CHIPS = GAME_CATEGORIES;

function haystack(game: Game): string {
  return [...(game.tags || []), game.category, game.title].join(' ');
}

export function countGamesForChip(games: Game[], chip: (typeof GAME_CATEGORIES)[number]): number {
  return countGamesForCategory(games, chip);
}

export function buildHomepageCategoryChips(games: Game[], minCount = 1) {
  return GAME_CATEGORIES.filter((chip) => countGamesForCategory(games, chip) >= minCount);
}

export function getMobileOptimizedGames(games: Game[]): Game[] {
  return games
    .filter((g) => g.mobileOptimization === 'touch-friendly' || g.mobileOptimization === 'responsive')
    .sort((a, b) => {
      const aPriority = a.mobileOptimization === 'touch-friendly' ? 1 : 0;
      const bPriority = b.mobileOptimization === 'touch-friendly' ? 1 : 0;
      if (bPriority !== aPriority) return bPriority - aPriority;
      return b.rating * b.plays - a.rating * a.plays;
    });
}
