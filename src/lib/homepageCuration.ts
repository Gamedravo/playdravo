import { Game } from '../types';
import { buildTagShelves } from './tagShelves';

export interface CuratedShelfBlock {
  id: string;
  title: string;
  subtitle: string;
  games: Game[];
  variant: 'standard' | 'accent' | 'compact';
  viewAllSlug?: string;
}

/** Tag shelves that duplicate dedicated category rows — skip for variety. */
const REDUNDANT_TAG_IDS = new Set(['racing', 'sports', 'action', 'puzzle', 'casual', 'multiplayer', 'shooting']);

const TAG_SUBTITLES: Record<string, string> = {
  shooting: 'Aim and fire',
  survival: 'Last one standing',
  horror: 'Spine-chilling picks',
  fighting: 'Combo breakers',
  'clicker-idle': 'Low effort, high fun',
  retro: 'Old-school vibes',
  driving: 'Behind the wheel',
  sandbox: 'Create your world',
  'card-board': 'Tabletop classics',
  '2-player': 'Couch co-op',
  simulator: 'Systems to master',
};

/**
 * Build a curated homepage sequence: category highlights interleaved with unique tag shelves.
 */
export function buildCuratedHomepageBlocks(
  shelves: ReturnType<typeof import('../utils/recommendations').buildHomepageShelves>,
  tagShelves: ReturnType<typeof buildTagShelves>,
  maxTagShelves = 5
): CuratedShelfBlock[] {
  const blocks: CuratedShelfBlock[] = [];

  const push = (
    id: string,
    title: string,
    subtitle: string,
    games: Game[],
    variant: CuratedShelfBlock['variant'] = 'standard',
    viewAllSlug?: string
  ) => {
    if (games.length >= 4) {
      blocks.push({ id, title, subtitle, games, variant, viewAllSlug });
    }
  };

  push('top-rated', 'Top rated', 'Community favorites', shelves.topRated, 'accent', 'top-rated');

  push('action', 'Action picks', 'Fast reflexes required', shelves.categoryShelves.Action, 'standard', 'action');
  push('puzzle', 'Puzzle lab', 'Think before you click', shelves.categoryShelves.Puzzle, 'compact', 'puzzle');

  const uniqueTags = tagShelves
    .filter((s) => !REDUNDANT_TAG_IDS.has(s.id) && s.games.length >= 4)
    .slice(0, maxTagShelves);

  uniqueTags.forEach((tag, i) => {
    push(
      `tag-${tag.id}`,
      tag.title,
      TAG_SUBTITLES[tag.id] || 'Curated for you',
      tag.games,
      i % 2 === 0 ? 'standard' : 'compact',
      tag.id
    );
  });

  push('racing', 'Racing & speed', 'Cross the finish line', shelves.categoryShelves.Racing, 'standard', 'racing');
  push('arcade', 'Arcade hall', 'Coin-op energy', shelves.categoryShelves.Arcade, 'compact', 'arcade');
  push('sports', 'Sports arena', 'Compete for glory', shelves.categoryShelves.Sports, 'standard', 'sports');
  push('strategy', 'Strategy corner', 'Plan your moves', shelves.categoryShelves.Strategy, 'compact', 'strategy');
  push('casual', 'Casual break', 'Five-minute sessions', shelves.categoryShelves.Casual, 'standard', 'casual');
  push('adventure', 'Adventures', 'Explore new worlds', shelves.categoryShelves.Adventure, 'compact', 'adventure');
  push('multiplayer', 'Play together', 'Shared sessions', shelves.categoryShelves.Multiplayer, 'accent', 'multiplayer');

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
