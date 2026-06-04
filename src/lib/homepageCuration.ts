import { Game } from '../types';
import { buildTagShelves } from './tagShelves';
import { getMobileOptimizedGames } from './homepageCategories';

export interface CuratedShelfBlock {
  id: string;
  title: string;
  subtitle: string;
  games: Game[];
  variant: 'standard' | 'accent' | 'mobile';
  viewAllSlug?: string;
}

export const SHELF_MIN_GAMES = 10;
export const SHELF_TARGET_GAMES = 28;

/** Tag shelves that duplicate dedicated category rows — skip for variety. */
const REDUNDANT_TAG_IDS = new Set([
  'racing',
  'sports',
  'action',
  'puzzle',
  'casual',
  'multiplayer',
  'shooting',
  'driving',
  'simulator',
]);

const TAG_SUBTITLES: Record<string, string> = {
  shooting: 'Aim and fire',
  survival: 'Last one standing',
  horror: 'Spine-chilling picks',
  fighting: 'Combo breakers',
  'clicker-idle': 'Low effort, high fun',
  retro: 'Old-school vibes',
  sandbox: 'Create your world',
  'card-board': 'Tabletop classics',
  '2-player': 'Couch co-op',
};

function haystack(game: Game): string {
  return [...(game.tags || []), game.category, game.title].join(' ');
}

/** Fill a shelf toward target count from a matcher pool, then general backfill. */
export function densifyShelf(
  games: Game[] | null | undefined,
  allGames: Game[],
  matchers?: RegExp[],
  target = SHELF_TARGET_GAMES
): Game[] {
  const safeGames = (games ?? []).filter((g): g is Game => Boolean(g?.id));
  const safePool = (allGames ?? []).filter((g): g is Game => Boolean(g?.id));
  const seen = new Set(safeGames.map((g) => g.id));
  const result = [...safeGames];

  const addFrom = (pool: Game[]) => {
    for (const game of pool) {
      if (result.length >= target) break;
      if (!game?.id || seen.has(game.id)) continue;
      result.push(game);
      seen.add(game.id);
    }
  };

  if (matchers?.length) {
    const matched = safePool
      .filter((g) => matchers.some((m) => m.test(haystack(g))))
      .sort((a, b) => b.plays - a.plays);
    addFrom(matched);
  }

  if (result.length < SHELF_MIN_GAMES) {
    addFrom([...safePool].sort((a, b) => b.plays - a.plays));
  }

  return result.slice(0, target);
}

/**
 * Build a curated homepage sequence: category highlights interleaved with unique tag shelves.
 * Sparse shelves are merged or dropped so rows always feel full.
 */
export function buildCuratedHomepageBlocks(
  shelves: ReturnType<typeof import('../utils/recommendations').buildHomepageShelves>,
  tagShelves: ReturnType<typeof buildTagShelves>,
  allGames: Game[],
  maxTagShelves = 4
): CuratedShelfBlock[] {
  const blocks: CuratedShelfBlock[] = [];
  const usedBlockIds = new Set<string>();

  const push = (
    id: string,
    title: string,
    subtitle: string,
    games: Game[],
    variant: CuratedShelfBlock['variant'] = 'standard',
    viewAllSlug?: string,
    matchers?: RegExp[]
  ) => {
    if (usedBlockIds.has(id)) return;
    const filled = densifyShelf(games ?? [], allGames, matchers);
    if (filled.length < SHELF_MIN_GAMES) return;
    usedBlockIds.add(id);
    blocks.push({ id, title, subtitle, games: filled, variant, viewAllSlug });
  };

  const category = (name: keyof typeof shelves.categoryShelves) =>
    shelves.categoryShelves[name] ?? [];

  push('top-rated', 'Top rated', 'Community favorites', shelves.topRated ?? [], 'accent', 'top-rated');

  // Mobile-optimized games shelf - shows early on mobile devices
  const mobileGames = getMobileOptimizedGames(allGames);
  if (mobileGames.length >= SHELF_MIN_GAMES) {
    push('best-on-mobile', 'Best on Mobile', 'Touch-optimized games', mobileGames, 'mobile', 'mobile');
  }

  push(
    'action',
    'Action picks',
    'Fast reflexes required',
    category('Action'),
    'standard',
    'action',
    [/\baction\b/i]
  );
  push(
    'puzzle',
    'Puzzle lab',
    'Think before you click',
    category('Puzzle'),
    'standard',
    'puzzle',
    [/\bpuzzle\b/i, /\blogic\b/i]
  );

  const uniqueTags = tagShelves
    .filter((s) => !REDUNDANT_TAG_IDS.has(s.id) && s.games.length >= 6)
    .slice(0, maxTagShelves);

  uniqueTags.forEach((tag) => {
    push(
      `tag-${tag.id}`,
      tag.title,
      TAG_SUBTITLES[tag.id] || 'Curated for you',
      tag.games ?? [],
      'standard',
      tag.id,
      tag.matchers
    );
  });

  push(
    'racing',
    'Racing & driving',
    'Cross the finish line',
    category('Racing'),
    'standard',
    'racing',
    [/\bracing\b/i, /\bdriving\b/i, /\bcar\b/i]
  );
  push(
    'arcade',
    'Arcade hall',
    'Coin-op energy',
    category('Arcade'),
    'standard',
    'arcade',
    [/\barcade\b/i]
  );
  push(
    'sports',
    'Sports arena',
    'Compete for glory',
    category('Sports'),
    'standard',
    'sports',
    [/\bsports\b/i]
  );
  push(
    'strategy',
    'Strategy corner',
    'Plan your moves',
    category('Strategy'),
    'standard',
    'strategy',
    [/\bstrategy\b/i]
  );
  push(
    'simulator',
    'Simulators',
    'Systems to master',
    category('Simulator'),
    'standard',
    'simulation',
    [/\bsimulator\b/i, /\btycoon\b/i]
  );
  push(
    'casual',
    'Casual break',
    'Five-minute sessions',
    category('Casual'),
    'standard',
    'casual',
    [/\bcasual\b/i]
  );
  push(
    'adventure',
    'Adventures',
    'Explore new worlds',
    category('Adventure'),
    'standard',
    'adventure',
    [/\badventure\b/i]
  );
  push(
    'multiplayer',
    'Play together',
    'Shared sessions',
    category('Multiplayer'),
    'accent',
    'multiplayer',
    [/\bmultiplayer\b/i]
  );

  return blocks;
}

/** Hero + side picks for featured spotlight (deduped, high quality). */
export function pickFeaturedSpotlight(
  featuredGame: Game | null,
  topRated: Game[],
  trending: Game[]
): { hero: Game | null; picks: Game[] } {
  const pool: Game[] = [];
  const seen = new Set<string>();

  const add = (g: Game | null | undefined) => {
    if (!g || seen.has(g.id)) return;
    seen.add(g.id);
    pool.push(g);
  };

  add(featuredGame);
  topRated.forEach(add);
  trending.forEach(add);

  const sorted = pool.sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.plays - a.plays);
  if (!sorted.length) return { hero: null, picks: [] };

  return {
    hero: sorted[0],
    picks: sorted.slice(1, 5),
  };
}
