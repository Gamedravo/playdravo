import { Game } from '../types';

/** Sidebar / footer labels that use dedicated routes instead of /category/:slug */
const ROUTE_OVERRIDES: Record<string, string> = {
  All: '/',
  Favorites: '/library/favorites',
  History: '/library/history',
};

/** URL slug → canonical category label (genres with spaces) */
const SLUG_TO_LABEL: Record<string, string> = {
  '2-player': '2 Player',
  '3-player': '3 Player',
  '4-player': '4 Player',
};

/** Canonical label → URL slug */
const LABEL_TO_SLUG: Record<string, string> = {
  '2 Player': '2-player',
  '3 Player': '3-player',
  '4 Player': '4-player',
  Recommended: 'recommended',
  Trending: 'trending',
};

export type CategorySlug =
  | 'all'
  | 'trending'
  | 'new-arrivals'
  | 'top-rated'
  | 'recommended'
  | string;

export function getCategoryPath(categoryLabel: string): string {
  if (ROUTE_OVERRIDES[categoryLabel]) {
    return ROUTE_OVERRIDES[categoryLabel];
  }
  const slug = LABEL_TO_SLUG[categoryLabel] ?? categoryLabel.toLowerCase().replace(/\s+/g, '-');
  return `/category/${slug}`;
}

export function normalizeCategorySlug(raw?: string): string {
  return (raw ?? 'all').toLowerCase().trim();
}

export function getCategoryDisplayName(slug: string, fallbackGames: Game[]): string {
  const lower = normalizeCategorySlug(slug);
  switch (lower) {
    case 'all':
      return 'All';
    case 'trending':
      return 'Trending';
    case 'new-arrivals':
      return 'New Arrivals';
    case 'top-rated':
      return 'Top Rated';
    case 'recommended':
      return 'Recommended';
    default: {
      const label = SLUG_TO_LABEL[lower];
      if (label) return label;
      if (fallbackGames.length > 0) return fallbackGames[0].category;
      return lower
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  }
}

function getCreatedAtMs(game: Game): number {
  const { createdAt } = game;
  if (!createdAt) return 0;
  if (typeof createdAt === 'string') return new Date(createdAt).getTime();
  if (typeof (createdAt as { toMillis?: () => number }).toMillis === 'function') {
    return (createdAt as { toMillis: () => number }).toMillis();
  }
  if (typeof (createdAt as { seconds?: number }).seconds === 'number') {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  return 0;
}

export interface FilterCategoryGamesOptions {
  recommendedGames?: Game[];
  newArrivals?: Game[];
}

/** Resolve games for a /category/:categoryId route */
export function filterGamesForCategorySlug(
  slug: string,
  games: Game[],
  options: FilterCategoryGamesOptions = {}
): Game[] {
  const lower = normalizeCategorySlug(slug);
  const { recommendedGames = [], newArrivals = [] } = options;

  switch (lower) {
    case 'all':
      return [...games];

    case 'trending': {
      const byPlays = [...games].sort((a, b) => b.plays - a.plays);
      const hot = byPlays.filter((g) => g.isHot);
      const pool = hot.length >= 8 ? hot : byPlays;
      return pool.slice(0, Math.min(48, pool.length));
    }

    case 'new-arrivals': {
      if (newArrivals.length > 0) {
        const ids = new Set(newArrivals.map((g) => g.id));
        const fromFeed = newArrivals.filter((g) => games.some((x) => x.id === g.id));
        const rest = games
          .filter((g) => !ids.has(g.id))
          .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a));
        return [...fromFeed, ...rest].slice(0, 48);
      }
      return [...games]
        .sort((a, b) => getCreatedAtMs(b) - getCreatedAtMs(a))
        .slice(0, 48);
    }

    case 'top-rated':
      return [...games]
        .filter((g) => (g.rating ?? 0) > 0)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    case 'recommended': {
      if (recommendedGames.length > 0) {
        return recommendedGames.filter((g) => games.some((x) => x.id === g.id));
      }
      return [...games]
        .filter((g) => (g.rating ?? 0) >= 4)
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 24);
    }

    default: {
      const label = SLUG_TO_LABEL[lower];
      const match = label ?? lower.replace(/-/g, ' ');
      return games.filter(
        (g) =>
          g.category.toLowerCase() === match.toLowerCase() ||
          g.category.toLowerCase().replace(/\s+/g, '-') === lower
      );
    }
  }
}

export function getDefaultSortForSlug(slug: string): 'plays' | 'rating' | 'title' | 'latest' {
  const lower = normalizeCategorySlug(slug);
  if (lower === 'new-arrivals') return 'latest';
  if (lower === 'top-rated') return 'rating';
  if (lower === 'recommended') return 'rating';
  return 'plays';
}
