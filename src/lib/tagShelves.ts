import { Game } from '../types';

/** Homepage shelves generated from dataset tags (display label → tag matchers). */
export const TAG_SHELF_DEFINITIONS: Array<{
  id: string;
  title: string;
  matchers: RegExp[];
}> = [
  { id: 'racing', title: 'Racing & Driving', matchers: [/\bracing\b/i, /\bcar\b/i, /\bdrift\b/i, /\bdriving\b/i, /\btraffic\b/i] },
  { id: 'shooting', title: 'Shooting', matchers: [/\bshooting\b/i, /\bfps\b/i, /\bgun\b/i, /\bfirst person shooter\b/i, /\bbattle royale\b/i] },
  { id: 'multiplayer', title: 'Multiplayer', matchers: [/\bmultiplayer\b/i, /\bio games\b/i] },
  { id: '2-player', title: '2 Player', matchers: [/\b2 player\b/i, /\btwo player\b/i] },
  { id: 'sports', title: 'Sports', matchers: [/\bsports\b/i, /\bsoccer\b/i, /\bfootball\b/i, /\bgolf\b/i, /\bbasketball\b/i] },
  { id: 'survival', title: 'Survival', matchers: [/\bsurvival\b/i, /\bzombie\b/i, /\bhorror\b/i] },
  { id: 'action', title: 'Action', matchers: [/\baction\b/i, /\bbattle\b/i, /\bwar\b/i, /\bfighting\b/i] },
  { id: 'puzzle', title: 'Puzzle', matchers: [/\bpuzzle\b/i, /\blogic\b/i, /\bmahjong\b/i] },
  { id: 'casual', title: 'Casual & Fun', matchers: [/\bcasual\b/i, /\bfun\b/i, /\bkids\b/i] },
  { id: 'simulator', title: 'Simulators', matchers: [/\bsimulator\b/i, /\btycoon\b/i, /\bmanagement\b/i] },
  { id: 'horror', title: 'Horror & Scary', matchers: [/\bhorror\b/i, /\bscary\b/i] },
  { id: 'fighting', title: 'Fighting', matchers: [/\bfighting\b/i, /\bcombat\b/i] },
  { id: 'clicker-idle', title: 'Clicker & Idle', matchers: [/\bclicker\b/i, /\bidle\b/i] },
  { id: 'retro', title: 'Retro & Classics', matchers: [/\bretro\b/i, /\bclassic\b/i] },
  { id: 'driving', title: 'Cars & Driving', matchers: [/\bdriving\b/i, /\bcar\b/i, /\btraffic\b/i] },
  { id: 'sandbox', title: 'Sandbox', matchers: [/\bsandbox\b/i, /\bcrafting\b/i] },
  { id: 'card-board', title: 'Card & Board', matchers: [/\bcard\b/i, /\bboard\b/i, /\bchess\b/i, /\bsolitaire\b/i] },
];

export function pickGamesByTagShelf(
  games: Game[],
  matchers: RegExp[],
  limit: number,
  excludeIds: Set<string>
): Game[] {
  const pool = games.filter((g) => {
    if (excludeIds.has(g.id)) return false;
    const haystack = [...(g.tags || []), g.category, g.title].join(' ');
    return matchers.some((m) => m.test(haystack));
  });

  pool.sort((a, b) => b.plays - a.plays);

  const picked: Game[] = [];
  const seenThumbs = new Set<string>();
  for (const game of pool) {
    if (picked.length >= limit) break;
    if (seenThumbs.has(game.thumbnail) && picked.length >= 3) continue;
    picked.push(game);
    seenThumbs.add(game.thumbnail);
    excludeIds.add(game.id);
  }
  return picked;
}

export function buildTagShelves(games: Game[], limitPerShelf = 18, excludeIds = new Set<string>()) {
  return TAG_SHELF_DEFINITIONS.map((def) => ({
    ...def,
    games: pickGamesByTagShelf(games, def.matchers, limitPerShelf, excludeIds),
  })).filter((s) => s.games.length >= 4);
}
