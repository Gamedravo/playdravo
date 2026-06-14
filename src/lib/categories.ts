import type { Game } from '../types';

export interface GameCategory {
  id: string;
  label: string;
  slug: string;
  emoji: string;
  color: string;
  matchers: RegExp[];
  mobileFilter?: boolean;
  bg: string;
}

export const MAIN_NAV_LABELS = [
  'All',
  'Favorites',
  'Recommended',
  'History',
  'Trending',
] as const;

export const GAME_CATEGORIES: GameCategory[] = [
  {
    id: 'action',
    label: 'Action',
    slug: 'action',
    emoji: '⚔️',
    color: '#ef4444',
    matchers: [/\baction\b/i],
    bg: 'from-rose-500/10 to-red-500/5 hover:border-rose-500/30',
  },
  {
    id: 'adventure',
    label: 'Adventure',
    slug: 'adventure',
    emoji: '🗺️',
    color: '#22c55e',
    matchers: [/\badventure\b/i, /\bplatformer\b/i, /\bparkour\b/i],
    bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30',
  },
  {
    id: 'racing',
    label: 'Racing',
    slug: 'racing',
    emoji: '🏎️',
    color: '#f59e0b',
    matchers: [/\bracing\b/i, /\bdrift\b/i, /\bendless runner\b/i],
    bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/30',
  },
  {
    id: 'sports',
    label: 'Sports',
    slug: 'sports',
    emoji: '⚽',
    color: '#16a34a',
    matchers: [/\bsports\b/i, /\bsoccer\b/i, /\bfootball\b/i, /\bgolf\b/i, /\bbasketball\b/i],
    bg: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30',
  },
  {
    id: 'puzzle',
    label: 'Puzzle',
    slug: 'puzzle',
    emoji: '🧩',
    color: '#d946ef',
    matchers: [/\bpuzzle\b/i, /\blogic\b/i, /\bmahjong\b/i],
    bg: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30',
  },
  {
    id: 'multiplayer',
    label: 'Multiplayer',
    slug: 'multiplayer',
    emoji: '👥',
    color: '#e879f9',
    matchers: [/\bmultiplayer\b/i, /\bio games\b/i],
    bg: 'from-teal-500/10 to-green-500/5 hover:border-teal-500/30',
  },
  {
    id: 'shooter',
    label: 'Shooter',
    slug: 'shooter',
    emoji: '🎯',
    color: '#f97316',
    matchers: [/\bshooting\b/i, /\bfps\b/i, /\bfirst person shooter\b/i, /\bsniper\b/i, /\bgun\b/i],
    bg: 'from-orange-500/10 to-red-500/5 hover:border-orange-500/30',
  },
  {
    id: 'casual',
    label: 'Casual',
    slug: 'casual',
    emoji: '😊',
    color: '#84cc16',
    matchers: [/\bcasual\b/i, /\bfun\b/i, /\bkids\b/i],
    bg: 'from-sky-500/10 to-cyan-500/5 hover:border-sky-500/30',
  },
  {
    id: 'simulator',
    label: 'Simulator',
    slug: 'simulator',
    emoji: '🔧',
    color: '#64748b',
    matchers: [/\bsimulator\b/i, /\bsimulation\b/i, /\btycoon\b/i, /\bmanagement\b/i],
    bg: 'from-slate-500/10 to-zinc-500/5 hover:border-slate-500/30',
  },
  {
    id: 'driving',
    label: 'Driving',
    slug: 'driving',
    emoji: '🚗',
    color: '#fbbf24',
    matchers: [/\bdriving\b/i, /\bcar\b/i, /\btraffic\b/i, /\btruck\b/i, /\btaxi\b/i],
    bg: 'from-yellow-500/10 to-amber-500/5 hover:border-yellow-500/30',
  },
  {
    id: 'strategy',
    label: 'Strategy',
    slug: 'strategy',
    emoji: '🧠',
    color: '#1d4ed8',
    matchers: [/\bstrategy\b/i, /\btower defense\b/i],
    bg: 'from-violet-500/10 to-fuchsia-500/5 hover:border-violet-500/30',
  },
  {
    id: 'girls',
    label: 'Girls Games',
    slug: 'girls',
    emoji: '💅',
    color: '#f472b6',
    matchers: [/\bgirls?\b/i, /\bfashion\b/i, /\bdress[\s-]?up\b/i, /\bmakeup\b/i, /\bbeauty\b/i, /\bsalon\b/i, /\bprincess\b/i, /\bbarbie\b/i],
    bg: 'from-pink-500/10 to-rose-500/5 hover:border-pink-500/30',
  },
  {
    id: 'mobile',
    label: 'Mobile Games',
    slug: 'mobile-games',
    emoji: '📱',
    color: '#22d3ee',
    matchers: [],
    mobileFilter: true,
    bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30',
  },
  {
    id: 'fighting',
    label: 'Fighting',
    slug: 'fighting',
    emoji: '🥊',
    color: '#dc2626',
    matchers: [/\bfighting\b/i, /\bcombat\b/i],
    bg: 'from-red-500/10 to-rose-500/5 hover:border-red-500/30',
  },
  {
    id: 'arcade',
    label: 'Arcade',
    slug: 'arcade',
    emoji: '👾',
    color: '#3b82f6',
    matchers: [/\barcade\b/i],
    bg: 'from-purple-500/10 to-pink-500/5 hover:border-purple-500/30',
  },
];

export const GAME_CATEGORY_LABELS: string[] = GAME_CATEGORIES.map((c) => c.label);

export const ALL_CATEGORY_LABELS: string[] = [
  ...MAIN_NAV_LABELS,
  ...GAME_CATEGORY_LABELS,
];

function gameHaystack(game: Game): string {
  return [...(game.tags || []), game.category, game.title].join(' ');
}

export function countGamesForCategory(games: Game[], cat: GameCategory): number {
  if (cat.mobileFilter) {
    return games.filter(
      (g) => g.mobileOptimization === 'touch-friendly' || g.mobileOptimization === 'responsive',
    ).length;
  }
  return games.filter((g) => cat.matchers.some((m) => m.test(gameHaystack(g)))).length;
}
