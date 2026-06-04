import type { Game } from '../types';

export interface HomepageCategoryChip {
  id: string;
  title: string;
  icon: string;
  slug: string;
  matchers: RegExp[];
  bg: string;
  /** If true, match against game.mobileOptimization instead of tags/title/category */
  mobileFilter?: boolean;
}

/** Browse chips — matched against tags, category, and title. */
export const HOMEPAGE_CATEGORY_CHIPS: HomepageCategoryChip[] = [
  { id: 'mobile', title: 'Mobile Games', icon: '📱', slug: 'mobile', matchers: [], bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30', mobileFilter: true },
  { id: 'action', title: 'Action', icon: '⚔️', slug: 'action', matchers: [/\baction\b/i], bg: 'from-rose-500/10 to-red-500/5 hover:border-rose-500/30' },
  { id: 'shooter', title: 'Shooter', icon: '🎯', slug: 'shooter', matchers: [/\bshooting\b/i, /\bfps\b/i, /\bfirst person shooter\b/i, /\bsniper\b/i, /\bgun\b/i], bg: 'from-orange-500/10 to-red-500/5 hover:border-orange-500/30' },
  { id: 'racing', title: 'Racing', icon: '🏎️', slug: 'racing', matchers: [/\bracing\b/i, /\bdrift\b/i, /\bendless runner\b/i], bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/30' },
  { id: 'driving', title: 'Driving', icon: '🚗', slug: 'driving', matchers: [/\bdriving\b/i, /\bcar\b/i, /\btraffic\b/i, /\btruck\b/i, /\btaxi\b/i], bg: 'from-yellow-500/10 to-amber-500/5 hover:border-yellow-500/30' },
  { id: 'puzzle', title: 'Puzzle', icon: '🧩', slug: 'puzzle', matchers: [/\bpuzzle\b/i, /\blogic\b/i, /\bmahjong\b/i], bg: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30' },
  { id: 'word', title: 'Word', icon: '📝', slug: 'word', matchers: [/\bword\b/i], bg: 'from-indigo-500/10 to-violet-500/5 hover:border-indigo-500/30' },
  { id: 'arcade', title: 'Arcade', icon: '👾', slug: 'arcade', matchers: [/\barcade\b/i], bg: 'from-purple-500/10 to-pink-500/5 hover:border-purple-500/30' },
  { id: 'retro', title: 'Retro', icon: '🕹️', slug: 'retro', matchers: [/\bretro\b/i, /\bclassic\b/i], bg: 'from-fuchsia-500/10 to-purple-500/5 hover:border-fuchsia-500/30' },
  { id: 'casual', title: 'Casual', icon: '😊', slug: 'casual', matchers: [/\bcasual\b/i, /\bfun\b/i, /\bkids\b/i], bg: 'from-sky-500/10 to-cyan-500/5 hover:border-sky-500/30' },
  { id: 'sports', title: 'Sports', icon: '⚽', slug: 'sports', matchers: [/\bsports\b/i, /\bsoccer\b/i, /\bfootball\b/i, /\bgolf\b/i, /\bbasketball\b/i], bg: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30' },
  { id: 'simulation', title: 'Simulation', icon: '🔧', slug: 'simulation', matchers: [/\bsimulator\b/i, /\bsimulation\b/i, /\btycoon\b/i, /\bmanagement\b/i], bg: 'from-slate-500/10 to-zinc-500/5 hover:border-slate-500/30' },
  { id: 'adventure', title: 'Adventure', icon: '🗺️', slug: 'adventure', matchers: [/\badventure\b/i, /\bplatformer\b/i, /\bparkour\b/i], bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30' },
  { id: 'survival', title: 'Survival', icon: '🏕️', slug: 'survival', matchers: [/\bsurvival\b/i], bg: 'from-green-500/10 to-emerald-500/5 hover:border-green-500/30' },
  { id: 'horror', title: 'Horror', icon: '👻', slug: 'horror', matchers: [/\bhorror\b/i, /\bscary\b/i, /\bzombie\b/i], bg: 'from-gray-500/10 to-neutral-500/5 hover:border-gray-500/40' },
  { id: 'fighting', title: 'Fighting', icon: '🥊', slug: 'fighting', matchers: [/\bfighting\b/i, /\bcombat\b/i], bg: 'from-red-500/10 to-rose-500/5 hover:border-red-500/30' },
  { id: 'strategy', title: 'Strategy', icon: '🧠', slug: 'strategy', matchers: [/\bstrategy\b/i, /\btower defense\b/i], bg: 'from-violet-500/10 to-fuchsia-500/5 hover:border-violet-500/30' },
  { id: 'multiplayer', title: 'Multiplayer', icon: '👥', slug: 'multiplayer', matchers: [/\bmultiplayer\b/i, /\bio games\b/i], bg: 'from-teal-500/10 to-green-500/5 hover:border-teal-500/30' },
  { id: 'clicker', title: 'Clicker', icon: '👆', slug: 'clicker', matchers: [/\bclicker\b/i], bg: 'from-lime-500/10 to-green-500/5 hover:border-lime-500/30' },
  { id: 'idle', title: 'Idle', icon: '⏳', slug: 'idle', matchers: [/\bidle\b/i], bg: 'from-stone-500/10 to-amber-500/5 hover:border-stone-500/30' },
  { id: 'sandbox', title: 'Sandbox', icon: '🧱', slug: 'sandbox', matchers: [/\bsandbox\b/i, /\bcrafting\b/i], bg: 'from-amber-500/10 to-yellow-500/5 hover:border-amber-500/30' },
  { id: 'educational', title: 'Educational', icon: '📚', slug: 'educational', matchers: [/\beducational\b/i, /\bbrain\b/i], bg: 'from-indigo-500/10 to-blue-500/5 hover:border-indigo-500/30' },
  { id: 'board', title: 'Board Games', icon: '♟️', slug: 'board', matchers: [/\bboard\b/i, /\bchess\b/i], bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/30' },
  { id: 'card', title: 'Card Games', icon: '🃏', slug: 'card', matchers: [/\bcard\b/i, /\bsolitaire\b/i], bg: 'from-red-500/10 to-pink-500/5 hover:border-red-500/30' },
];

function haystack(game: Game): string {
  return [...(game.tags || []), game.category, game.title].join(' ');
}

export function countGamesForChip(games: Game[], chip: HomepageCategoryChip): number {
  if (chip.mobileFilter) {
    return games.filter((g) => g.mobileOptimization === 'touch-friendly' || g.mobileOptimization === 'responsive').length;
  }
  return games.filter((g) => chip.matchers.some((m) => m.test(haystack(g)))).length;
}

export function buildHomepageCategoryChips(games: Game[], minCount = 1) {
  return HOMEPAGE_CATEGORY_CHIPS.filter(
    (chip) => countGamesForChip(games, chip) >= minCount
  );
}

/** Get mobile-optimized games for "Best On Mobile" shelf */
export function getMobileOptimizedGames(games: Game[]): Game[] {
  return games
    .filter((g) => g.mobileOptimization === 'touch-friendly' || g.mobileOptimization === 'responsive')
    .sort((a, b) => {
      // Prioritize touch-friendly over responsive
      const aPriority = a.mobileOptimization === 'touch-friendly' ? 1 : 0;
      const bPriority = b.mobileOptimization === 'touch-friendly' ? 1 : 0;
      if (bPriority !== aPriority) return bPriority - aPriority;
      // Then sort by rating * plays for overall quality
      return (b.rating * b.plays) - (a.rating * a.plays);
    });
}
