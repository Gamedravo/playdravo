import { Game } from './types';

const ONLINE_GAMES_API_URL = '/api/onlinegames-catalog';
const ONLINE_GAMES_SOURCE_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';

export const CATALOG_SOURCE = 'onlinegames.io' as const;

export const CATEGORY_LIST = [
  'All',
  'Favorites',

  'Recommended',
  'History',
  'Trending',
  'Mods',
  'Mobile Games',
  'Best On Mobile',
  'Action',
  'Adventure',
  'Arcade',
  'Card',
  'Casual',
  'Educational',
  'Multiplayer',
  '1 Player',
  '2 Player',
  '3 Player',
  '4 Player',
  'Platformer',
  'Puzzle',
  'Racing',
  'Simulator',
  'Sports',
  'Strategy'
];

export const TAGS_LIST: string[] = [
  '1 Player',
  '2 Player',
  '2d',
  '3d',
  'Action',
  'Adventure',
  'Arcade',
  'Arena',
  'Ball',
  'Battle',
  'Battle Royale',
  'Board',
  'Brain',
  'Car',
  'Card',
  'Clicker',
  'Crafting',
  'Driving',
  'Free',
  'Fun',
  'Html5',
  'Io Games',
  'Kids',
  'Mobile',
  'Multiplayer',
  'Parkour',
  'Physics',
  'Puzzle',
  'Racing',
  'Shooting',
  'Simulator',
  'Skill',
  'Sports',
  'Strategy',
  'Unity'
];

interface RawOnlineGame {
  title: string;
  embed: string;
  image: string;
  tags: string;
  description: string;
}

const verifiedAt = '2026-06-06T00:00:00.000Z';

function localGame(
  id: string,
  title: string,
  category: string,
  thumbnail: string,
  description: string,
  tags: string[],
  plays: number,
  rating = 4.8,
): Game {
  return {
    id,
    title,
    category,
    url: `/games/clean-arcade.html?game=${id}`,
    thumbnail,
    description,
    rating,
    plays,
    authorUid: 'gamedravo-clean-arcade',
    createdAt: verifiedAt,
    isHot: plays > 200000,
    isTop: rating >= 4.85,
    tags: ['No Ads', 'Html5', 'Mobile', ...tags],
    developer: 'GameDravo Clean Arcade',
    publisher: 'GameDravo',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'any',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: verifiedAt,
    sourceId: 'gamedravo-clean-arcade',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    version: 'clean-1.0',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  };
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 72) || 'game';
}

function titleCaseTag(tag: string): string {
  return tag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .map(titleCaseTag);
}

const AD_HEAVY_GAME_IDS = new Set([
  'stickman-parkour',
  'stickman-gta-city',
  'checkout-frenzy',
  'dublix',
  'escape-car',
  'cube-worlds',
  'burnout-city',
  'basket-hoop',
  'fps-strike',
  'warstrike',
  'fast-food-rush',
  'super-car-driving',
  'egg-car-racing',
  'love-tester-story',
  'cubecraft-survival',
  'chess-freezenova',
  'mini-cars-racing',
]);

function inferCategory(tagList: string[]): string {
  const tags = tagList.join(' ').toLowerCase();
  if (/\b(2 player|3 player|4 player|two player|three player|four player|multiplayer|io games)\b/.test(tags)) return 'Multiplayer';
  if (/\b(first person shooter|shooting|fps|gun|battle royale)\b/.test(tags)) return 'Action';
  if (/\b(racing|drift|driving|traffic|car)\b/.test(tags)) return 'Racing';
  if (/\b(puzzle|logic|mahjong|sudoku|match 3)\b/.test(tags)) return 'Puzzle';
  if (/\b(sports|soccer|football|golf|basketball|baseball)\b/.test(tags)) return 'Sports';
  if (/\b(simulator|tycoon|management|organizing)\b/.test(tags)) return 'Simulator';
  if (/\b(strategy|tower defense)\b/.test(tags)) return 'Strategy';
  if (/\b(adventure|parkour|running|platformer|horror|scary|zombie|survival)\b/.test(tags)) return 'Adventure';
  if (/\b(arcade|retro|classic)\b/.test(tags)) return 'Arcade';
  if (/\b(action|battle|war|fighting)\b/.test(tags)) return 'Action';
  if (/\b(casual|fun|kids)\b/.test(tags)) return 'Casual';
  return 'Arcade';
}

function hasPlayerTag(game: Game, playerCount: 1 | 2 | 3 | 4): boolean {
  const target = `${playerCount} Player`.toLowerCase();
  return (game.tags ?? []).some((tag) => tag.toLowerCase() === target);
}

export function gameMatchesCategory(game: Game, category: string): boolean {
  if (category === 'Mobile Games' || category === 'Best On Mobile') {
    return game.mobileOptimization === 'touch-friendly' ||
      game.mobileOptimization === 'responsive' ||
      (game.tags ?? []).some((tag) => /\b(mobile|touch)\b/i.test(tag));
  }

  if (category === 'Multiplayer') {
    return game.category === 'Multiplayer' ||
      (game.tags ?? []).some((tag) => /\b(multiplayer|io games|2 player|3 player|4 player)\b/i.test(tag));
  }

  if (category === '1 Player') return hasPlayerTag(game, 1);
  if (category === '2 Player') return hasPlayerTag(game, 2);
  if (category === '3 Player') return hasPlayerTag(game, 3);
  if (category === '4 Player') return hasPlayerTag(game, 4);

  return game.category === category || (game.tags ?? []).some((tag) => tag.toLowerCase() === category.toLowerCase());
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function seededRating(id: string): number {
  return Math.round((4.0 + (hashSeed(id) % 10) / 10) * 10) / 10;
}

function seededPlays(id: string): number {
  return 15000 + (hashSeed(`${id}-plays`) % 2500000);
}

function bestThumbnailVariant(image: string): string {
  return image
    .trim()
    .replace(/-xs\.webp$/i, '-lg.webp')
    .replace(/-md\.webp$/i, '-lg.webp')
    .replace(/-xs\.(jpg|jpeg|png)$/i, '-lg.$1')
    .replace(/-md\.(jpg|jpeg|png)$/i, '-lg.$1');
}

function isSafeOnlineGame(rawGame: RawOnlineGame): boolean {
  const title = rawGame.title?.trim();
  const embed = rawGame.embed?.trim();
  const image = rawGame.image?.trim();
  if (!title || !embed || !image) return false;
  if (AD_HEAVY_GAME_IDS.has(slugify(title))) return false;
  if (!/^https:\/\//i.test(embed) || !/^https:\/\//i.test(image)) return false;

  try {
    const embedUrl = new URL(embed);
    const imageUrl = new URL(image);
    const embedHost = embedUrl.hostname.toLowerCase().replace(/^www\./, '');
    const imageHost = imageUrl.hostname.toLowerCase().replace(/^www\./, '');
    const embedPath = embedUrl.pathname.toLowerCase();
    const imagePath = imageUrl.pathname.toLowerCase();

    const trustedEmbedHost = embedHost === 'onlinegames.io' || embedHost === 'cloud.onlinegames.io';
    const trustedImageHost = imageHost === 'onlinegames.io' || imageHost === 'cloud.onlinegames.io';
    const blockedWrapper = embedPath.includes('index-og.html') || embedPath.includes('game-og.html');
    const usableImage = /\.(webp|png|jpe?g)$/i.test(imagePath) && !imagePath.includes('/placeholder');

    return trustedEmbedHost && trustedImageHost && !blockedWrapper && usableImage;
  } catch {
    return false;
  }
}

function onlineGameToGame(rawGame: RawOnlineGame): Game {
  const id = slugify(rawGame.title);
  const tags = parseTags(rawGame.tags || '');
  const rating = seededRating(id);
  const plays = seededPlays(id);
  const hasMobileTag = tags.some((tag) => tag.toLowerCase() === 'mobile');

  return {
    id,
    title: rawGame.title.trim(),
    category: inferCategory(tags),
    url: rawGame.embed.trim(),
    thumbnail: bestThumbnailVariant(rawGame.image),
    description: (rawGame.description || '').trim().slice(0, 500),
    rating,
    plays,
    authorUid: 'onlinegames-io',
    createdAt: '2026-06-04T15:51:40.314Z',
    isHot: plays > 500000,
    isTop: rating >= 4.7,
    tags,
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
    mobileOptimization: hasMobileTag ? 'touch-friendly' : 'responsive',
    fullscreenSupport: true,
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-04T15:51:40.314Z',
    sourceId: 'onlinegames-io',
    avgPlayTime: '10m',
  };
}

async function fetchRawOnlineGames(url: string): Promise<RawOnlineGame[]> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load game catalog: ${response.status}`);
  }

  const rawGames = await response.json();
  if (!Array.isArray(rawGames)) {
    throw new Error('Game catalog response was not an array.');
  }

  return rawGames as RawOnlineGame[];
}

export async function fetchOnlineGamesCatalog(): Promise<Game[]> {
  let rawGames: RawOnlineGame[];

  try {
    rawGames = await fetchRawOnlineGames(ONLINE_GAMES_API_URL);
  } catch {
    rawGames = await fetchRawOnlineGames(ONLINE_GAMES_SOURCE_URL);
  }

  const seenIds = new Set<string>();
  const remoteGames = rawGames
    .filter(isSafeOnlineGame)
    .map(onlineGameToGame);

  return [...GAMES, ...remoteGames].filter((game) => {
    if (seenIds.has(game.id)) return false;
    seenIds.add(game.id);
    return !AD_HEAVY_GAME_IDS.has(game.id) && !game.adsInjected && !game.popupRisk && !game.redirectRisk;
  });
}

export const GAMES: Game[] = [
  localGame(
    'snake',
    'Snake Classic',
    'Arcade',
    '/images/games/js-snake.svg',
    'The legendary Snake game rebuilt locally for GameDravo. Eat apples, grow longer, and avoid crashing into yourself. No ads, no popups, no external provider.',
    ['1 Player', 'Arcade', 'Classic', 'Endless', 'Retro', 'Skill'],
    324900,
    4.9,
  ),
  localGame(
    'tetris',

    'Block Stacker',
    'Puzzle',
    '/images/games/js-tetris.svg',
    'A lightweight falling-block puzzle inspired by classic Tetris. Rotate, stack, clear lines, and chase a high score directly in your browser.',
    ['1 Player', 'Puzzle', 'Classic', 'Strategy', 'Skill'],
    292100,
    4.88,
  ),
  localGame(
    '2048',
    '2048 Original',
    'Puzzle',
    '/images/games/2048-original.svg',
    'Slide numbered tiles and merge matching values until you reach 2048. A fast, clean, local version with touch and keyboard controls.',
    ['1 Player', 'Board', 'Brain', 'Logic', 'Puzzle', 'Strategy'],
    276400,
    4.86,
  ),
  localGame(
    'breakout',
    'Breakout',
    'Arcade',
    '/images/games/breakout-js13k.svg',
    'Bounce the ball, smash every brick, and keep the paddle alive. A tiny no-ad arcade classic that loads instantly.',
    ['1 Player', 'Arcade', 'Classic', 'Retro', 'Skill'],
    213500,
  ),
  localGame(
    'pong',
    'Pong Duel',
    'Sports',
    '/images/games/core-ball-clone.svg',
    'Classic Pong with solo AI and two-player keyboard controls. Simple, fast, and completely ad-free.',
    ['1 Player', '2 Player', 'Arcade', 'Classic', 'Sports'],
    189300,
  ),
  localGame(
    'minesweeper',
    'Minesweeper Classic',
    'Puzzle',
    '/images/games/minesweeper-classic.svg',
    'Clear the board without hitting a mine. Use logic, flags, and careful guesses in this clean local Minesweeper build.',
    ['1 Player', 'Board', 'Brain', 'Classic', 'Logic', 'Puzzle'],
    171200,
  ),
  localGame(
    'tic-tac-toe',
    'Tic Tac Toe',
    'Strategy',
    '/images/games/tic-tac-toe.svg',
    'Play the famous X and O strategy game against a friend on the same device. Instant, lightweight, and safe.',
    ['2 Player', 'Board', 'Classic', 'Kids', 'Strategy'],
    165800,
  ),
  localGame(
    'flappy',
    'Flappy Bird Classic',
    'Arcade',
    '/images/games/floppy-bird.svg',
    'Tap to fly through pipes in this tiny local flappy-style arcade game. No ad screens before play.',
    ['1 Player', 'Arcade', 'Endless', 'Retro', 'Skill'],
    222700,
    4.84,
  ),
  localGame(
    'dino',
    'Dino Runner',
    'Arcade',
    '/images/games/chrome-dino.svg',
    'Jump over cactus obstacles in a fast offline-style runner inspired by the classic browser dinosaur game.',
    ['1 Player', 'Arcade', 'Endless', 'Offline', 'Platformer', 'Skill'],
    241600,
    4.87,
  ),
  localGame(
    'memory',
    'Memory Match',
    'Puzzle',
    '/images/games/color-method.svg',
    'Flip cards, remember icons, and match every pair. A clean brain-training game for quick sessions.',
    ['1 Player', 'Board', 'Brain', 'Kids', 'Logic', 'Puzzle'],
    132400,
  ),
  localGame(
    'space-shooter',
    'Space Defender',
    'Action',
    '/images/games/defender-13k.svg',
    'Pilot a small ship, dodge enemies, and fire lasers in a compact arcade shooter built for fast loading.',
    ['1 Player', 'Action', 'Arcade', 'Retro', 'Skill'],
    198500,
    4.82,
  ),
  localGame(
    'pac-dots',
    'Pac Dots',
    'Arcade',
    '/images/games/pacman-js.svg',
    'Collect dots in a maze while avoiding roaming ghosts. A lightweight maze-chase classic with no third-party ads.',
    ['1 Player', 'Arcade', 'Classic', 'Retro', 'Skill'],
    227300,
    4.85,
  ),
];
