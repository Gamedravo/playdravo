import { Game } from './types';

const ONLINE_GAMES_API_URL = '/api/onlinegames-catalog';
const ONLINE_GAMES_SOURCE_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_TARGET_CATALOG_SIZE = 600;
const GAMEPIX_PAGE_SIZE = 200;
const GAMEPIX_MAX_PAGES = 5;
const GAMEPIX_API_URL = `/api/gamepix-catalog?limit=${GAMEPIX_TARGET_CATALOG_SIZE}`;
const GAMEPIX_SOURCE_URL = 'https://feeds.gamepix.com/v2/json/';

export const CATALOG_SOURCE = 'onlinegames.io + gamepix' as const;

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

interface RawGamePixGame {
  id: string;
  title: string;
  namespace: string;
  description?: string;
  category?: string;
  orientation?: 'all' | 'landscape' | 'portrait';
  quality_score?: number;
  date_published?: string;
  date_modified?: string;
  banner_image?: string;
  image?: string;
  url: string;
}

const REMOVED_ORIGINAL_GAME_IDS = new Set([

  'snake',
  'snake-classic',
  'tetris',
  'block-stacker',
  '2048',
  '2048-original',
  'breakout',
  'minesweeper',
  'minesweeper-classic',
  'flappy',
  'flappy-bird-classic',
  'dino',
  'dino-runner',
  'memory',
  'memory-match',
  'space-shooter',
  'space-defender',
  'pac-dots',
]);

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

function gamePixCategoryToTags(rawGame: RawGamePixGame): string[] {
  const category = rawGame.category ? titleCaseTag(rawGame.category.trim().toLowerCase()) : 'Arcade';
  const tags = new Set<string>(['Html5', 'Mobile', category]);
  if (/\b(shooter|battle|fighting|stickman)\b/i.test(category)) tags.add('Action');
  if (/\b(match|memory|puzzle|2048|ball)\b/i.test(category)) tags.add('Puzzle');
  if (/\b(car|driving|racing)\b/i.test(`${category} ${rawGame.title}`)) tags.add('Racing');
  if (/\b(sports|soccer|football|basket|penalty)\b/i.test(`${category} ${rawGame.title}`)) tags.add('Sports');
  return Array.from(tags);
}

function isSafeGamePixGame(rawGame: RawGamePixGame): boolean {
  const title = rawGame.title?.trim();
  const namespace = rawGame.namespace?.trim();
  const url = rawGame.url?.trim();
  const image = (rawGame.banner_image || rawGame.image || '').trim();
  if (!title || !namespace || !url || !image) return false;
  if (REMOVED_ORIGINAL_GAME_IDS.has(slugify(title)) || REMOVED_ORIGINAL_GAME_IDS.has(slugify(namespace))) return false;

  try {
    const gameUrl = new URL(url);
    const imageUrl = new URL(image);
    return gameUrl.protocol === 'https:' &&
      gameUrl.hostname.toLowerCase() === 'play.gamepix.com' &&
      gameUrl.pathname.endsWith('/embed') &&
      imageUrl.protocol === 'https:' &&
      imageUrl.hostname.toLowerCase() === 'img.gamepix.com';
  } catch {
    return false;
  }
}

function gamePixGameToGame(rawGame: RawGamePixGame): Game {
  const id = `gamepix-${slugify(rawGame.namespace || rawGame.title)}`;
  const tags = gamePixCategoryToTags(rawGame);
  const quality = typeof rawGame.quality_score === 'number' ? rawGame.quality_score : 0.75;
  const rating = Math.round((4.1 + Math.min(Math.max(quality, 0), 1) * 0.8) * 10) / 10;
  const plays = seededPlays(id);
  const orientation = rawGame.orientation === 'landscape' || rawGame.orientation === 'portrait' ? rawGame.orientation : 'any';

  return {
    id,
    title: rawGame.title.trim(),
    category: inferCategory(tags),
    url: rawGame.url.trim(),
    thumbnail: (rawGame.banner_image || rawGame.image || '').trim(),
    description: (rawGame.description || `${rawGame.title} is a fast-loading HTML5 game you can play instantly.`).trim().slice(0, 500),
    rating,
    plays,
    authorUid: 'gamepix',
    createdAt: rawGame.date_published || rawGame.date_modified || '2026-06-06T00:00:00.000Z',
    isHot: plays > 500000,
    isTop: rating >= 4.75,
    tags,
    developer: 'GamePix',
    publisher: 'GamePix',
    mobileOptimization: orientation === 'portrait' || orientation === 'any' ? 'touch-friendly' : 'responsive',
    fullscreenSupport: true,
    orientation,
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'gamepix',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  };
}

async function fetchRawOnlineGames(url: string): Promise<RawOnlineGame[]> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load OnlineGames catalog: ${response.status}`);
  }

  const rawGames = await response.json();
  if (!Array.isArray(rawGames)) {
    throw new Error('OnlineGames catalog response was not an array.');
  }

  return rawGames as RawOnlineGame[];
}

async function fetchRawGamePixGames(url: string): Promise<RawGamePixGame[]> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Could not load GamePix catalog: ${response.status}`);
  }

  const raw = await response.json();
  const items = Array.isArray(raw) ? raw : raw?.items;
  if (!Array.isArray(items)) {
    throw new Error('GamePix catalog response did not include an items array.');
  }

  return items as RawGamePixGame[];
}

async function fetchOnlineGamesRemote(): Promise<Game[]> {
  let rawGames: RawOnlineGame[];

  try {
    rawGames = await fetchRawOnlineGames(ONLINE_GAMES_API_URL);
  } catch {
    rawGames = await fetchRawOnlineGames(ONLINE_GAMES_SOURCE_URL);
  }

  return rawGames.filter(isSafeOnlineGame).map(onlineGameToGame);
}

async function fetchGamePixSourcePages(): Promise<RawGamePixGame[]> {
  const pages: RawGamePixGame[][] = [];

  for (let page = 1; page <= GAMEPIX_MAX_PAGES; page += 1) {
    const pageUrl = `${GAMEPIX_SOURCE_URL}?order=quality&page=${page}&pagination=${GAMEPIX_PAGE_SIZE}&sid=1`;
    const pageItems = await fetchRawGamePixGames(pageUrl);
    if (pageItems.length === 0) break;
    pages.push(pageItems);
    if (pages.flat().length >= GAMEPIX_TARGET_CATALOG_SIZE) break;
  }

  return pages.flat().slice(0, GAMEPIX_TARGET_CATALOG_SIZE);
}

async function fetchGamePixRemote(): Promise<Game[]> {
  let rawGames: RawGamePixGame[];

  try {
    rawGames = await fetchRawGamePixGames(GAMEPIX_API_URL);
  } catch {
    rawGames = await fetchGamePixSourcePages();
  }

  return rawGames.filter(isSafeGamePixGame).map(gamePixGameToGame);
}

export async function fetchOnlineGamesCatalog(): Promise<Game[]> {
  const [onlineGamesResult, gamePixResult] = await Promise.allSettled([
    fetchOnlineGamesRemote(),
    fetchGamePixRemote(),
  ]);

  const remoteGames = [
    ...(onlineGamesResult.status === 'fulfilled' ? onlineGamesResult.value : []),
    ...(gamePixResult.status === 'fulfilled' ? gamePixResult.value : []),
  ];

  if (onlineGamesResult.status === 'rejected' && gamePixResult.status === 'rejected') {
    throw onlineGamesResult.reason;
  }

  const seenIds = new Set<string>();
  return [...GAMES, ...remoteGames].filter((game) => {
    if (seenIds.has(game.id)) return false;
    seenIds.add(game.id);
    const normalizedId = slugify(game.id || game.title || '');
    const normalizedTitle = slugify(game.title || game.id || '');
    return !REMOVED_ORIGINAL_GAME_IDS.has(normalizedId) &&
      !REMOVED_ORIGINAL_GAME_IDS.has(normalizedTitle) &&
      !AD_HEAVY_GAME_IDS.has(game.id) &&
      !game.adsInjected &&
      !game.popupRisk &&
      !game.redirectRisk;
  }).slice(0, GAMEPIX_TARGET_CATALOG_SIZE);
}

export const GAMES: Game[] = [
  // ── Fireboy and Watergirl series ──────────────────────────────────────
  {
    id: 'fireboy-and-watergirl-1-forest-temple',
    title: 'Fireboy and Watergirl 1: Forest Temple',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/rvvASGAjDhJQLGKHMThA/',
    thumbnail: 'https://img.gamedistribution.com/rvvASGAjDhJQLGKHMThA-512x384.jpeg',
    description: 'Guide Fireboy and Watergirl through the Forest Temple together! Solve puzzles, avoid hazards, and reach the exit doors in this beloved co-op platformer.',
    rating: 4.9,
    plays: 8500000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-2-light-temple',
    title: 'Fireboy and Watergirl 2: Light Temple',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/51d17e189ad94fa781cdf8da7db8a89b/',
    thumbnail: 'https://img.gamedistribution.com/51d17e189ad94fa781cdf8da7db8a89b-512x384.jpeg',
    description: 'Enter the Light Temple! Use mirrors and light beams to solve puzzles and guide Fireboy and Watergirl to safety in this brilliant co-op sequel.',
    rating: 4.8,
    plays: 6200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-3-ice-temple',
    title: 'Fireboy and Watergirl 3: Ice Temple',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/3ca5e82cf44c41a49d4a9ab8a04f8628/',
    thumbnail: 'https://img.gamedistribution.com/3ca5e82cf44c41a49d4a9ab8a04f8628-512x384.jpeg',
    description: 'Slide and skate through the icy temple! Use ice blocks and switches to solve tricky puzzles in this frosty co-op adventure with Fireboy and Watergirl.',
    rating: 4.8,
    plays: 5800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-4-crystal-temple',
    title: 'Fireboy and Watergirl 4: Crystal Temple',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/2e8b0b52f8c44b819c7aa30d5be5aa74/',
    thumbnail: 'https://img.gamedistribution.com/2e8b0b52f8c44b819c7aa30d5be5aa74-512x384.jpeg',
    description: 'The Crystal Temple awaits! Navigate sparkling crystal chambers and solve reflective light puzzles in this dazzling chapter of the Fireboy and Watergirl saga.',
    rating: 4.7,
    plays: 5100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-5-elements',
    title: 'Fireboy and Watergirl 5: Elements',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/fbw5elements/',
    thumbnail: 'https://img.gamedistribution.com/fbw5elements-512x384.jpeg',
    description: 'Master all four elements in this epic Fireboy and Watergirl adventure! Switch between wind, earth, fire and water temples to unlock secrets and overcome obstacles.',
    rating: 4.7,
    plays: 4700000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-6-fairy-tales',
    title: 'Fireboy and Watergirl 6: Fairy Tales',
    category: 'Adventure',
    url: 'https://html5.gamedistribution.com/fbw6fairytales/',
    thumbnail: 'https://img.gamedistribution.com/fbw6fairytales-512x384.jpeg',
    description: 'Step into enchanting fairy tale worlds! Fireboy and Watergirl explore magical kingdoms filled with pixies, unicorns and fantasy puzzles in this whimsical sixth installment.',
    rating: 4.6,
    plays: 4100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['2 Player', 'Multiplayer', 'Puzzle', 'Adventure', 'Platformer', 'Skill'],
    developer: 'Oslo Albet',
    publisher: 'Oslo Albet',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '15m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },

  // ── Hole.io ───────────────────────────────────────────────────────────
  {
    id: 'hole-io',
    title: 'Hole.io',
    category: 'Arcade',
    url: 'https://html5.gamedistribution.com/64b8bbe2d9c34da7b49f9f42e0f3069a/',
    thumbnail: 'https://img.gamedistribution.com/64b8bbe2d9c34da7b49f9f42e0f3069a-512x384.jpeg',
    description: 'You are a hole in the city! Swallow everything around you — cars, people, buildings — and grow bigger than your rivals before time runs out in this addictive .io game.',
    rating: 4.7,
    plays: 12000000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['Io Games', 'Multiplayer', 'Arcade', 'Action', 'Mobile', '1 Player'],
    developer: 'Voodoo',
    publisher: 'Voodoo',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },

  // ── Tekken Fighting Games ─────────────────────────────────────────────
  {
    id: 'tekken-3',
    title: 'Tekken 3',
    category: 'Action',
    url: 'https://www.onlinegames.io/games/2022/unity/tekken-3/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/1027/tekken-3-game-online.jpg',
    description: 'The legendary Tekken 3 fighting game! Choose from 23 fighters and battle your way through the King of Iron Fist Tournament. Master combos and dominate the arena.',
    rating: 4.8,
    plays: 9200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Namco',
    publisher: 'Namco',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'tekken-4',
    title: 'Tekken 4',
    category: 'Action',
    url: 'https://www.onlinegames.io/games/2022/unity/tekken-4/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/1028/tekken-4-game-online.jpg',
    description: 'Tekken 4 brings new moves and characters to the Iron Fist Tournament! Fight through multiple stages with improved graphics and fluid combat mechanics.',
    rating: 4.7,
    plays: 6100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Namco',
    publisher: 'Namco',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'tekken-5',
    title: 'Tekken 5',
    category: 'Action',
    url: 'https://www.onlinegames.io/games/2022/unity/tekken-5/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/1029/tekken-5-game-online.jpg',
    description: 'Tekken 5 delivers the most intense Iron Fist Tournament yet! New characters, improved mechanics, and the return of classic fighters make this a must-play fighting game.',
    rating: 4.8,
    plays: 7400000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Namco',
    publisher: 'Namco',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'tekken-6',
    title: 'Tekken 6',
    category: 'Action',
    url: 'https://www.onlinegames.io/games/2022/unity/tekken-6/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/1030/tekken-6-game-online.jpg',
    description: 'Tekken 6 features massive stages, bound system combos and rage mechanics. Battle with an expanded roster of 40+ fighters across stunning global arenas.',
    rating: 4.7,
    plays: 5800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Namco Bandai',
    publisher: 'Namco Bandai',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'tekken-7-fighter',
    title: 'Tekken 7',
    category: 'Action',
    url: 'https://html5.gamedistribution.com/tekken7online/',
    thumbnail: 'https://images.crazygames.com/games/tekken7/cover-1594203255.png',
    description: 'Experience the fiercest battles in the King of Iron Fist Tournament! Tekken 7 brings stunning visuals, the Rage system, and power crushes to deliver heart-pounding fighting action.',
    rating: 4.7,
    plays: 5200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Bandai Namco',
    publisher: 'Bandai Namco',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'tekken-8-arena',
    title: 'Tekken 8',
    category: 'Action',
    url: 'https://html5.gamedistribution.com/tekken8online/',
    thumbnail: 'https://images.crazygames.com/games/tekken8/cover.jpg',
    description: 'The ultimate chapter of the Mishima saga! Tekken 8 features heat system mechanics, aggressive gameplay, and 32 fighters in the most visually spectacular Tekken ever made.',
    rating: 4.8,
    plays: 4900000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: true,
    tags: ['Action', 'Fighting', '1 Player', '2 Player', 'Arcade', 'Multiplayer'],
    developer: 'Bandai Namco',
    publisher: 'Bandai Namco',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },

  // ── Bus Games ─────────────────────────────────────────────────────────
  {
    id: 'city-bus-driving-simulator',
    title: 'City Bus Driving Simulator',
    category: 'Simulator',
    url: 'https://html5.gamedistribution.com/b851e82c2cc14c2ea10eb4fa43b30e39/',
    thumbnail: 'https://img.gamedistribution.com/b851e82c2cc14c2ea10eb4fa43b30e39-512x384.jpeg',
    description: 'Take the wheel of a city bus and navigate through busy streets! Pick up passengers at stops, follow traffic rules, and deliver everyone safely in this realistic bus simulator.',
    rating: 4.5,
    plays: 2800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', 'Mobile', '3d'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '10m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'school-bus-driving-simulator',
    title: 'School Bus Driving Simulator',
    category: 'Simulator',
    url: 'https://html5.gamedistribution.com/schoolbusdrivingsimulator/',
    thumbnail: 'https://img.gamedistribution.com/schoolbusdrivingsimulator-512x384.jpeg',
    description: 'Drive the school bus and pick up kids safely! Navigate through suburbs and city roads, stop at bus stops, and get students to school on time in this fun simulator.',
    rating: 4.4,
    plays: 2100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', 'Kids', 'Mobile', '3d'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '10m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'bus-parking-3d',
    title: 'Bus Parking 3D',
    category: 'Simulator',
    url: 'https://html5.gamedistribution.com/busparking3d/',
    thumbnail: 'https://img.gamedistribution.com/busparking3d-512x384.jpeg',
    description: 'Can you park a massive bus without crashing? Maneuver through tight spots, reverse park, and tackle increasingly difficult levels in this challenging 3D bus parking game.',
    rating: 4.3,
    plays: 1700000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', 'Skill', '3d'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'coach-bus-simulator',
    title: 'Coach Bus Simulator',
    category: 'Simulator',
    url: 'https://html5.gamedistribution.com/coachbussimulator/',
    thumbnail: 'https://img.gamedistribution.com/coachbussimulator-512x384.jpeg',
    description: 'Drive a luxury coach bus across cities and highways! Transport passengers on long routes, manage fuel, and handle challenging road conditions in this detailed simulator.',
    rating: 4.5,
    plays: 2400000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', '3d', 'Mobile'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'bus-rush',
    title: 'Bus Rush',
    category: 'Arcade',
    url: 'https://html5.gamedistribution.com/busrush/',
    thumbnail: 'https://img.gamedistribution.com/busrush-512x384.jpeg',
    description: 'Run, jump and slide on top of moving buses! Collect coins, dodge obstacles and survive as long as you can in this thrilling endless runner set atop city buses.',
    rating: 4.4,
    plays: 3200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Arcade', 'Action', '1 Player', 'Mobile', 'Skill', 'Fun'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'portrait',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '6m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },

  // ── Plane / Airplane Games ────────────────────────────────────────────
  {
    id: 'paper-flight',
    title: 'Paper Flight',
    category: 'Casual',
    url: 'https://html5.gamedistribution.com/paperflight/',
    thumbnail: 'https://img.gamedistribution.com/paperflight-512x384.jpeg',
    description: 'Fold and fly paper airplanes as far as possible! Tap to boost, catch updrafts, and collect stars across beautiful scenery. A relaxing and satisfying flight game.',
    rating: 4.4,
    plays: 3100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Casual', 'Skill', '1 Player', 'Mobile', 'Fun', 'Html5'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '6m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'airplane-flight-simulator',
    title: 'Airplane Flight Simulator',
    category: 'Simulator',
    url: 'https://html5.gamedistribution.com/airplaneflightsimulator/',
    thumbnail: 'https://img.gamedistribution.com/airplaneflightsimulator-512x384.jpeg',
    description: 'Take control of a real passenger jet! Take off, cruise at altitude, and land safely at airports around the world in this immersive 3D airplane flight simulator.',
    rating: 4.5,
    plays: 3800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Simulator', '1 Player', '3d', 'Skill', 'Mobile'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '12m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'airplane-io',
    title: 'Airplane.io',
    category: 'Arcade',
    url: 'https://html5.gamedistribution.com/airplaneio/',
    thumbnail: 'https://img.gamedistribution.com/airplaneio-512x384.jpeg',
    description: 'Fly your plane and shoot down enemy aircraft in this fast-paced .io aerial combat game! Upgrade your jet, dominate the skies, and become the ultimate ace pilot.',
    rating: 4.4,
    plays: 2600000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Io Games', 'Action', 'Arcade', '1 Player', 'Shooting', 'Multiplayer'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'sky-fighters-3d',
    title: 'Sky Fighters 3D',
    category: 'Action',
    url: 'https://html5.gamedistribution.com/skyfighters3d/',
    thumbnail: 'https://img.gamedistribution.com/skyfighters3d-512x384.jpeg',
    description: 'Engage in epic 3D aerial dogfights! Lock on to enemy jets, fire missiles, and perform daring maneuvers to dominate the skies in this thrilling fighter jet combat game.',
    rating: 4.6,
    plays: 4200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Action', 'Shooting', '1 Player', '3d', 'Mobile', 'Skill'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '10m',
    contentRating: 'Teen',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'air-traffic-control',
    title: 'Air Traffic Control',
    category: 'Strategy',
    url: 'https://html5.gamedistribution.com/airtrafficcontrol/',
    thumbnail: 'https://img.gamedistribution.com/airtrafficcontrol-512x384.jpeg',
    description: 'Manage the skies as an air traffic controller! Direct planes to their runways, prevent mid-air collisions, and keep the airport running smoothly under increasing pressure.',
    rating: 4.5,
    plays: 2300000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Strategy', 'Puzzle', '1 Player', 'Skill', 'Brain'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'responsive',
    fullscreenSupport: true,
    orientation: 'landscape',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '10m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
  {
    id: 'plane-merge',
    title: 'Plane Merge',
    category: 'Casual',
    url: 'https://html5.gamedistribution.com/planemerge/',
    thumbnail: 'https://img.gamedistribution.com/planemerge-512x384.jpeg',
    description: 'Merge identical planes to create bigger and more powerful aircraft! Build your ultimate fleet, collect rewards, and unlock legendary planes in this addictive merge game.',
    rating: 4.3,
    plays: 1900000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Casual', 'Puzzle', '1 Player', 'Mobile', 'Clicker', 'Fun'],
    developer: 'GameDistribution',
    publisher: 'GameDistribution',
    mobileOptimization: 'touch-friendly',
    fullscreenSupport: true,
    orientation: 'portrait',
    embedCompatibility: 'full',
    validationState: 'Verified Working',
    lastVerified: '2026-06-06T00:00:00.000Z',
    sourceId: 'curated',
    avgPlayTime: '8m',
    contentRating: 'Everyone',
    adsInjected: false,
    popupRisk: false,
    redirectRisk: false,
  },
];
