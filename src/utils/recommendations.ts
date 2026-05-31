import { Game } from '../types';
import { resolveGameThumbnail } from './gameUtils';

export interface RecommendationOptions {
  limit?: number;
  excludeIds?: string[];
  preferredCategories?: string[];
  playHistory?: string[];
  /** Game IDs already shown on homepage shelves — avoid repeats */
  shelfSeenIds?: Set<string>;
}

function thumbnailKey(game: Game): string {
  return resolveGameThumbnail(game.id, game.thumbnail);
}

/** Score + diversify recommendations by category and unique artwork. */
export function buildRecommendations(
  games: Game[],
  options: RecommendationOptions = {}
): Game[] {
  const {
    limit = 12,
    excludeIds = [],
    preferredCategories = [],
    playHistory = [],
    shelfSeenIds = new Set<string>(),
  } = options;

  const exclude = new Set([...excludeIds, ...playHistory]);
  const usedThumbnails = new Set<string>();
  const categoryCounts = new Map<string, number>();
  const maxPerCategory = Math.max(2, Math.ceil(limit / 4));

  const scored = games
    .filter((g) => !exclude.has(g.id))
    .map((g) => {
      let score = 0;
      if (preferredCategories.includes(g.category)) score += 12;
      if (g.rating >= 4.5) score += 6;
      if (g.rating >= 4.0) score += 3;
      if (g.plays > 500000) score += 4;
      if (g.isHot) score += 2;
      if (g.isTop) score += 2;
      if (shelfSeenIds.has(g.id)) score -= 8;
      score += Math.random() * 3;
      return { game: g, score };
    })
    .sort((a, b) => b.score - a.score);

  const picked: Game[] = [];

  for (const { game } of scored) {
    if (picked.length >= limit) break;

    const catCount = categoryCounts.get(game.category) ?? 0;
    if (catCount >= maxPerCategory) continue;

    const thumb = thumbnailKey(game);
    if (usedThumbnails.has(thumb) && picked.length >= 4) continue;

    picked.push(game);
    usedThumbnails.add(thumb);
    categoryCounts.set(game.category, catCount + 1);
  }

  if (picked.length < limit) {
    for (const { game } of scored) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.id === game.id)) continue;
      picked.push(game);
    }
  }

  return picked;
}

/** Pick games for a category shelf with deduped artwork vs already shown. */
export function pickCategoryShelf(
  games: Game[],
  category: string,
  limit: number,
  excludeIds: Set<string> = new Set(),
  usedThumbnails: Set<string> = new Set()
): Game[] {
  const result: Game[] = [];

  const pool = games
    .filter((g) => g.category === category && !excludeIds.has(g.id))
    .sort((a, b) => b.rating * Math.log10(b.plays + 10) - a.rating * Math.log10(a.plays + 10));

  for (const game of pool) {
    if (result.length >= limit) break;
    const thumb = thumbnailKey(game);
    if (usedThumbnails.has(thumb) && result.length >= 2) continue;
    result.push(game);
    usedThumbnails.add(thumb);
    excludeIds.add(game.id);
  }

  return result;
}

/** Build multiple homepage shelves without repeating games or artwork. */
export function buildHomepageShelves(games: Game[]) {
  const seenIds = new Set<string>();
  const seenThumbs = new Set<string>();

  const take = (pool: Game[], limit: number) => {
    const out: Game[] = [];
    for (const game of pool) {
      if (out.length >= limit) break;
      if (seenIds.has(game.id)) continue;
      const thumb = thumbnailKey(game);
      if (seenThumbs.has(thumb) && out.length >= 2) continue;
      out.push(game);
      seenIds.add(game.id);
      seenThumbs.add(thumb);
    }
    return out;
  };

  const byPlays = [...games].sort((a, b) => b.plays - a.plays);
  const byRating = [...games].sort((a, b) => b.rating - a.rating);
  const byNew = [...games].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const categories = ['Action', 'Puzzle', 'Arcade', 'Racing', 'Sports', 'Strategy'] as const;

  return {
    trending: take(byPlays, 20),
    topRated: take(byRating.filter((g) => g.rating >= 4.2), 20),
    newArrivals: take(byNew, 20),
    quickPlay: take(
      games.filter(
        (g) =>
          g.avgPlayTime === '2m' ||
          g.avgPlayTime === '5m' ||
          g.tags?.some((t) => /Casual|Arcade|Fun/i.test(t))
      ),
      20
    ),
    mobileFriendly: take(
      games.filter(
        (g) =>
          g.mobileOptimization === 'touch-friendly' ||
          g.tags?.some((t) => /Mobile/i.test(t))
      ),
      20
    ),
    categoryShelves: Object.fromEntries(
      categories.map((cat) => [
        cat,
        pickCategoryShelf(games, cat, 16, seenIds, seenThumbs),
      ])
    ) as Record<(typeof categories)[number], Game[]>,
    seenIds,
  };
}
