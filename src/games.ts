import { Game } from './types';

const ONLINE_GAMES_API_URL = '/api/onlinegames-catalog';
const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_FETCH_LIMIT = 1200;
const CATALOG_SIZE_LIMIT = 2000;
const GAMEPIX_API_URL = `/api/gamepix-catalog?limit=${GAMEPIX_FETCH_LIMIT}`;
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const CAN_FETCH_EXTERNAL_CATALOGS = typeof window === 'undefined';

export const CATALOG_SOURCE = 'onlinegames.io + gamepix' as const;

export const CATEGORY_LIST = [
  'All',
  'Favorites',
  'Recommended',
  'History',
  'Trending',
  'Action',
  'Adventure',
  'Racing',
  'Sports',
  'Puzzle',
  'Multiplayer',
  'Shooter',
  'Casual',
  'Simulator',
  'Driving',
  'Strategy',
  'Girls Games',
  'Mobile Games',
  'Fighting',
  'Arcade',
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
  if (/\b(fighting|martial arts|ninja|combat|duel|brawl|fighter)\b/.test(tags)) return 'Fighting';
  if (/\b(arcade|retro|classic)\b/.test(tags)) return 'Arcade';
  if (/\b(action|battle|war)\b/.test(tags)) return 'Action';
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

  if (category === 'Girls Games' || category === 'Girls') {
    const girlsKeywords = /\b(girls?|fashion|dress[\s-]?up|shopping|shopaholic|makeup|beauty|salon|princess|cooking|baking|cute|kawaii|unicorn|pony|mermaid|barbie|bratz|doll|jewel|jewelry|floral|flower|wedding|prom|celebrity|influencer|spa)\b/i;
    return (
      game.category === 'Girls' ||
      game.category === 'Girls Games' ||
      (game.tags ?? []).some((tag) => girlsKeywords.test(tag)) ||
      girlsKeywords.test(game.title ?? '') ||
      girlsKeywords.test(game.description ?? '')
    );
  }

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

  const primaryThumb = (rawGame.banner_image || rawGame.image || '').trim();
  const secondaryThumb = (rawGame.image || '').trim();
  const screenshots: string[] | undefined =
    primaryThumb && secondaryThumb && primaryThumb !== secondaryThumb
      ? [primaryThumb, secondaryThumb]
      : undefined;

  return {
    id,
    title: rawGame.title.trim(),
    category: inferCategory(tags),
    url: rawGame.url.trim(),
    thumbnail: primaryThumb,
    screenshots,
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

async function fetchRawGamePixFeed(limit: number): Promise<RawGamePixGame[]> {
  const pageSize = 100;
  const pages = Math.ceil(limit / pageSize);
  const results = await Promise.all(
    Array.from({ length: pages }, async (_, index) => {
      const page = index + 1;
      return fetchRawGamePixGames(`${GAMEPIX_CATALOG_URL}?order=quality&page=${page}&pagination=${pageSize}&sid=1`);
    })
  );

  return results.flat().slice(0, limit);
}

async function fetchOnlineGamesRemote(): Promise<Game[]> {
  try {
    const rawGames = await fetchRawOnlineGames(ONLINE_GAMES_API_URL);
    return rawGames.filter(isSafeOnlineGame).map(onlineGameToGame);
  } catch {
    if (!CAN_FETCH_EXTERNAL_CATALOGS) return [];
    try {
      const rawGames = await fetchRawOnlineGames(ONLINE_GAMES_CATALOG_URL);
      return rawGames.filter(isSafeOnlineGame).map(onlineGameToGame);
    } catch {
      return [];
    }
  }
}

async function fetchGamePixRemote(): Promise<Game[]> {
  try {
    const rawGames = await fetchRawGamePixGames(GAMEPIX_API_URL);
    return rawGames.filter(isSafeGamePixGame).map(gamePixGameToGame);
  } catch {
    if (!CAN_FETCH_EXTERNAL_CATALOGS) return [];
    try {
      const rawGames = await fetchRawGamePixFeed(GAMEPIX_FETCH_LIMIT);
      return rawGames.filter(isSafeGamePixGame).map(gamePixGameToGame);
    } catch {
      return [];
    }
  }
}

let _catalogCache: Game[] | null = null;
let _catalogPromise: Promise<Game[]> | null = null;

export async function fetchOnlineGamesCatalog(): Promise<Game[]> {
  if (_catalogCache) return _catalogCache;
  if (_catalogPromise) return _catalogPromise;

  _catalogPromise = _fetchCatalogRemote().then((result) => {
    _catalogCache = result;
    _catalogPromise = null;
    return result;
  }).catch((err) => {
    _catalogPromise = null;
    throw err;
  });

  return _catalogPromise;
}

const CUSTOM_GD_GAMES: Game[] = [];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function _fetchCatalogRemote(): Promise<Game[]> {
  const [onlineGamesResult, gamePixResult] = await Promise.allSettled([
    withTimeout(fetchOnlineGamesRemote(), 6000),
    withTimeout(fetchGamePixRemote(), 6000),
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
  }).slice(0, CATALOG_SIZE_LIMIT);
}

export const GAMES: Game[] = [

  // ── Fighting Games (verified from catalog) ────────────────────────────
  {
    id: 'get-on-top',
    title: 'Get On Top',
    category: 'Fighting',
    url: 'https://www.onlinegames.io/games/2024/code/6/get-on-top/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/697/responsive/Get-on-Top-lg.jpg',
    description: 'Two players wrestle to get on top! A hilarious 2-player physics fighting game — grab your opponent and pin them down to win. Great fun with a friend!',
    rating: 4.7,
    plays: 5800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['2 Player', 'Fighting', 'Multiplayer', 'Action', 'Arcade', 'Physics', 'Fun'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'drunken-duel',
    title: 'Drunken Duel',
    category: 'Fighting',
    url: 'https://www.onlinegames.io/games/2024/code/2/drunken-duel/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/698/responsive/Drunken-Duel-lg.jpg',
    description: 'The wobbly 2-player shooting duel! Control your drunk gunslinger and try to shoot your opponent before they get you. Hilarious physics make every match unpredictable.',
    rating: 4.6,
    plays: 4900000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['2 Player', 'Fighting', 'Multiplayer', 'Action', 'Arcade', 'Physics', 'Funny'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'tiny-crash-fighters',
    title: 'Tiny Crash Fighters',
    category: 'Fighting',
    url: 'https://www.onlinegames.io/games/2023/construct/285/tiny-crash-fighters/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/622/responsive/Tiny-Crash-Fighters-lg.jpg',
    description: 'Build your robot and destroy the competition! Equip your machine with weapons and send it into the arena to battle. A fun auto-battler fighting game for all ages.',
    rating: 4.5,
    plays: 3200000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Fighting', 'Action', 'Arcade', 'Strategy', 'Mobile', 'Fun'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'dark-ninja-hanjo',
    title: 'Dark Ninja Hanjo',
    category: 'Fighting',
    url: 'https://www.onlinegames.io/games/2023/unity/dark-ninja-hanjo/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/451/responsive/Dark-Ninja-Hanjo-lg.jpg',
    description: 'Become the ultimate ninja warrior! Slash through enemies, dodge attacks and master stealth combat as the legendary Dark Ninja Hanjo in this action-packed 3D fighting game.',
    rating: 4.6,
    plays: 4100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Fighting', 'Action', 'Adventure', '1 Player', 'Ninja', '3d'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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

  // ── Bus / Transport Games (verified from catalog) ──────────────────────
  {
    id: 'bus-subway-runner',
    title: 'Bus Subway Runner',
    category: 'Arcade',
    url: 'https://www.onlinegames.io/games/2022/unity/bus-subway-runner/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/235/responsive/Bus-Subway-Runner-Game-lg.jpg',
    description: 'Run from the police on top of speeding buses! Dodge obstacles, collect coins and survive as long as you can in this wild Subway Surfer-style endless runner — with buses!',
    rating: 4.5,
    plays: 3800000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Arcade', 'Action', '1 Player', 'Mobile', 'Running', 'Skill', 'Fun'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
  {
    id: 'taxi-simulator',
    title: 'Taxi Simulator',
    category: 'Simulator',
    url: 'https://www.onlinegames.io/games/2022/unity/taxi-simulator/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/465/responsive/Taxi-Simulator-lg.jpg',
    description: 'Pick up passengers and get them to their destinations on time! Navigate busy city streets in your taxi and earn cash in this realistic driving simulator.',
    rating: 4.4,
    plays: 2600000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', '3d', 'Car'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'truck-racing',
    title: 'Truck Racing',
    category: 'Racing',
    url: 'https://www.onlinegames.io/games/2022/construct/144/truck-racing/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/712/responsive/Truck-Racing-lg.jpg',
    description: 'Race massive trucks at full speed! Overtake rivals, avoid crashes and cross the finish line first in this fast-paced 2D truck racing game with great mobile support.',
    rating: 4.4,
    plays: 2300000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Racing', '1 Player', 'Mobile', '2d', 'Car', 'Truck', 'Fun'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
  {
    id: 'monster-truck-city-parking',
    title: 'Monster Truck City Parking',
    category: 'Simulator',
    url: 'https://www.onlinegames.io/games/2021/unity/monster-truck-city-parking/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/582/responsive/Monster-Truck-City-Parking-lg.jpg',
    description: 'Park a massive monster truck through tight city spaces! Navigate obstacles, reverse park and complete each level without crashing in this challenging 3D parking game.',
    rating: 4.3,
    plays: 1900000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Simulator', 'Driving', '1 Player', '3d', 'Truck', 'Skill'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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

  // ── Airplane / Flight Games (verified from catalog) ────────────────────
  {
    id: 'real-flight-simulator',
    title: 'Real Flight Simulator',
    category: 'Simulator',
    url: 'https://cloud.onlinegames.io/games/2023/unity2/real-flight-simulator/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/342/responsive/Real-Flight-Simulator-2-lg.jpg',
    description: 'Take to the skies in a real passenger jet! Master takeoff, cruising altitude, and landing at airports around the world in this immersive 3D flight simulator.',
    rating: 4.6,
    plays: 4500000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Simulator', '1 Player', '3d', 'Airplane', 'Flying', 'Skill'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'airplane-racer',
    title: 'Airplane Racer',
    category: 'Racing',
    url: 'https://www.onlinegames.io/games/2022/unity/airplane-racer/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/268/responsive/Airplane-Racer-lg.jpg',
    description: 'Race planes through the sky solo or against a friend! Choose your aircraft, pick a track and battle through aerial courses in this vivid 3D airplane racing game.',
    rating: 4.5,
    plays: 3700000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true,
    isTop: false,
    tags: ['Racing', '2 Player', 'Multiplayer', '3d', 'Airplane', 'Flying', 'Action'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'alien-sky-invasion',
    title: 'Alien Sky Invasion',
    category: 'Action',
    url: 'https://www.onlinegames.io/games/2021/unity3/alien-sky-invasion/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/594/responsive/Alien-Sky-Invasion-lg.jpg',
    description: 'Aliens are invading from the sky! Pilot your fighter plane and blast wave after wave of alien aircraft before they destroy the planet. Fast-paced 3D aerial shooting action.',
    rating: 4.5,
    plays: 3400000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Action', 'Shooting', '1 Player', '3d', 'Airplane', 'Flying', 'Space'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
    id: 'rescue-helicopter',
    title: 'Rescue Helicopter',
    category: 'Simulator',
    url: 'https://www.onlinegames.io/games/2021/2/rescue-helicopter/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/468/responsive/Rescue-Helicopter-lg.jpg',
    description: 'Fly rescue missions in your helicopter! Pick up injured patients and deliver them to the hospital safely. A fun mobile-friendly helicopter flying game for all ages.',
    rating: 4.4,
    plays: 2900000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Simulator', '1 Player', 'Mobile', 'Flying', 'Helicopter', '2d'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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
  {
    id: 'hover-racer-pro',
    title: 'Hover Racer Pro',
    category: 'Racing',
    url: 'https://www.onlinegames.io/games/2021/unity/hover-racer-pro/index.html',
    thumbnail: 'https://www.onlinegames.io/media/posts/572/responsive/Hover-Racer-Pro-lg.jpg',
    description: 'Race futuristic hover vehicles through incredible tracks! Speed through twisting courses, hit turbo boosts, and leave rivals in the dust in this 3D sci-fi racing game.',
    rating: 4.5,
    plays: 3100000,
    authorUid: 'curated',
    createdAt: '2026-06-06T00:00:00.000Z',
    isHot: false,
    isTop: false,
    tags: ['Racing', '1 Player', '3d', 'Flying', 'Airplane', 'Sci-Fi', 'Speed'],
    developer: 'OnlineGames.io',
    publisher: 'OnlineGames.io',
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

          // ── Girls Games (verified Gameflare embeds) ───────────────────────────

  // ── More Girls Games (verified kiz10 + Gameflare embeds) ─────────────
  {
    id: 'avatar-world-beauty-salon',
    title: 'Avatar World Beauty Salon',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/avatar-world-beauty-salon/?img=22529/1764442400_avatar-world-beauty-salon.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/22529/1764442400_avatar-world-beauty-salon.webp',
    description: 'Create your dream avatar and visit the ultimate beauty salon! Experiment with hairstyles, makeup, outfits and accessories in this gorgeous virtual world makeover game.',
    rating: 4.5, plays: 7200000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Beauty', 'Salon', 'Makeup', 'Dress Up'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'fashion-holic',
    title: 'Fashion Holic',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/fashion-holic/?img=22330/1763666675_fashion-holic.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/22330/1763666675_fashion-holic.webp',
    description: 'Become a total fashion holic! Mix and match thousands of clothing items, shoes and accessories to create stunning looks and share your unique style with the world.',
    rating: 4.5, plays: 5800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Dress Up', 'Style'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'celebrity-e-girl-vibes',
    title: 'Celebrity E-Girl Vibes',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/celebrity-e-girl-vibes/?img=22232/1763151215_celebrity-e-girl-vibes.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/22232/1763151215_celebrity-e-girl-vibes.webp',
    description: 'Channel your inner e-girl celebrity! Create edgy, colourful e-girl looks with bold makeup, layered outfits and alt fashion vibes inspired by top internet stars.',
    rating: 4.6, plays: 6400000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Makeup', 'Celebrity', 'Dress Up'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'barbee-met-gala-transformation',
    title: 'Barbee Met Gala Transformation',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/barbee-met-gala-transformation/?img=20006/1751156087_barbee-met-gala-transformation.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20006/1751156087_barbee-met-gala-transformation.webp',
    description: 'Get Barbee ready for the Met Gala! Style her in the most extravagant, over-the-top haute couture outfits and makeup for fashion\'s biggest night of the year.',
    rating: 4.5, plays: 5100000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Dress Up', 'Makeup', 'Celebrity'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'barbie-princess',
    title: 'Barbie Princess',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/barbie-princess/?img=1499/1412669035_2014-10-07-13_58_45-.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/1499/1412669035_2014-10-07-13_58_45-.webp',
    description: 'Dress Barbie as the ultimate princess! Choose from gorgeous gowns, sparkling tiaras, royal jewellery and magical accessories to create your perfect princess look.',
    rating: 4.4, plays: 9800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Barbie', 'Princess', 'Dress Up'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'ny-fashionista-real-makeover',
    title: 'NY Fashionista Real Makeover',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/ny-fashionista-real-makeover/?img=6179/1455310277_t_ny-fashionista-real-makeover.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/6179/1455310277_t_ny-fashionista-real-makeover.webp',
    description: 'Give a New York fashionista the ultimate real makeover! Apply skincare, foundation, eyeshadow, lipstick and style her hair into a stunning NYC-ready look.',
    rating: 4.4, plays: 6700000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Makeup', 'Makeover', 'Beauty', 'Fashion'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'fashion-sticker-studio',
    title: 'Fashion Sticker Studio',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/fashion-sticker-studio/?img=22157/1762810532_fashion-sticker-studio.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/22157/1762810532_fashion-sticker-studio.webp',
    description: 'Create fashionable sticker looks in the ultimate style studio! Dress up characters with trendy sticker outfits, backgrounds and accessories in this creative fashion game.',
    rating: 4.4, plays: 4200000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Creative', 'Dress Up', 'Style'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'my-little-pony-shoes-designer',
    title: 'My Little Pony Shoes Designer',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/my-little-pony-shoes-designer/?img=5847/1451345186_mylittleponyshoesdesigner.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/5847/1451345186_mylittleponyshoesdesigner.webp',
    description: 'Design magical shoes for My Little Pony! Choose colours, patterns, gems and decorations to create the most fabulous footwear for your favourite ponies.',
    rating: 4.3, plays: 8500000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'My Little Pony', 'Creative', 'Cute'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'lol-surprise-omg-style-studio',
    title: 'L.O.L. Surprise! O.M.G. Style Studio',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/l-o-l-surprise-o-m-g-style-studio/?img=19903/1749670804_l-o-l-surprise-o-m-g-style-studio.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/19903/1749670804_l-o-l-surprise-o-m-g-style-studio.webp',
    description: 'Style your L.O.L. Surprise! O.M.G. dolls in the ultimate fashion studio! Dress them in iconic outfits, apply glam makeup and create stunning photoshoot looks.',
    rating: 4.5, plays: 7900000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Doll', 'Dress Up', 'Cute'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'back-to-school-uniforms-edition',
    title: 'Back To School: Uniforms Edition',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/back-to-school-uniforms-edition/?img=20826/1755806173_back-to-school-uniforms-edition.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20826/1755806173_back-to-school-uniforms-edition.webp',
    description: 'Get ready for back to school in style! Customise and design the perfect school uniform look with trendy twists, accessories and coordinated outfits.',
    rating: 4.4, plays: 4800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Dress Up', 'School'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'graduation-makeup-trends',
    title: 'Graduation Makeup Trends',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/graduation-makeup-trends/?img=20007/1751156943_graduation-makeup-trends.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20007/1751156943_graduation-makeup-trends.webp',
    description: 'Create the perfect graduation day makeup look! Try the hottest beauty trends for prom and graduation — bold eyes, glowing skin and flawless finishing touches.',
    rating: 4.4, plays: 4300000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Makeup', 'Beauty', 'Prom'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'sailor-chic-vs-pirate-charm',
    title: 'Sailor Chic vs Pirate Charm',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/sailor-chic-vs-pirate-charm/?img=20005/1751155894_sailor-chic-vs-pirate-charm.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20005/1751155894_sailor-chic-vs-pirate-charm.webp',
    description: 'Choose your style — nautical sailor chic or bold pirate charm! Dress up in themed outfits, accessories and makeup looks inspired by the high seas.',
    rating: 4.4, plays: 3900000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Dress Up', 'Style'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'k-pop-hunter-halloween-fashion',
    title: 'K-Pop Hunter Halloween Fashion',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/k-pop-hunter-halloween-fashion/?img=21772/1760733222_k-pop-hunter-halloween-fashion.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/21772/1760733222_k-pop-hunter-halloween-fashion.webp',
    description: 'Mix K-Pop idol style with Halloween fashion! Create fierce and fabulous Halloween looks inspired by your favourite K-Pop stars with spooky seasonal twists.',
    rating: 4.5, plays: 5600000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Fashion', 'Dress Up', 'K-Pop', 'Halloween'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'asmr-beauty-superstar',
    title: 'ASMR Beauty Superstar',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/asmr-beauty-superstar/?img=20940/1756417245_asmr-beauty-superstar.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20940/1756417245_asmr-beauty-superstar.webp',
    description: 'Create satisfying ASMR beauty looks! Apply makeup, do skincare routines and style hair with relaxing, detailed beauty treatments in this calming ASMR game.',
    rating: 4.6, plays: 6800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'ASMR', 'Beauty', 'Makeup', 'Salon'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'asmr-makeover-makeup-studio',
    title: 'ASMR Makeover & Makeup Studio',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/game-asmr-makeover-makeup-studio/?img=21951/1761683425_game-asmr-makeover-makeup-studio.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/21951/1761683425_game-asmr-makeover-makeup-studio.webp',
    description: 'Step into the ultimate ASMR makeover studio! Perform satisfying skincare, makeup and hair styling treatments with relaxing sounds and gorgeous transformations.',
    rating: 4.6, plays: 5900000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'ASMR', 'Makeover', 'Makeup', 'Salon', 'Beauty'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cooking-empire',
    title: 'Cooking Empire',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/cooking-empire/?img=22550/1764617991_cooking-empire.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/22550/1764617991_cooking-empire.webp',
    description: 'Build your cooking empire! Serve customers, upgrade your kitchen and master dozens of recipes across multiple restaurant levels in this addictive cooking management game.',
    rating: 4.6, plays: 5400000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Management', 'Restaurant'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cooking-hut',
    title: 'Cooking Hut',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/cooking-hut/?img=21807/1761008833_cooking-hut.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/21807/1761008833_cooking-hut.webp',
    description: 'Run your own cosy cooking hut! Prepare and serve tasty meals to hungry customers, unlock new recipes and keep your little restaurant thriving.',
    rating: 4.4, plays: 4100000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Restaurant', 'Management'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'yummy-pancake-factory',
    title: 'Yummy Pancake Factory',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/yummy-pancake-factory/?img=20367/1753848170_yummy-pancake-factory.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20367/1753848170_yummy-pancake-factory.webp',
    description: 'Run the ultimate pancake factory! Pour batter, flip pancakes, add toppings and serve stacks of delicious pancakes to hungry customers in this sweet cooking game.',
    rating: 4.5, plays: 5700000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Baking', 'Cute', 'Food'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'purrfect-bakery',
    title: 'Purrfect Bakery',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/purrfect-bakery/?img=20085/1751506654_purrfect-bakery.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20085/1751506654_purrfect-bakery.webp',
    description: 'Run an adorable cat-themed bakery! Bake cakes, cookies and pastries, decorate them with cute cat designs and serve purr-fect treats to your customers.',
    rating: 4.6, plays: 6300000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Baking', 'Cute', 'Animals'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cooking-festival',
    title: 'Cooking Festival',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/cooking-festival/?img=20031/1751330218_cooking-festival.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20031/1751330218_cooking-festival.webp',
    description: 'Join the cooking festival and show off your culinary skills! Prepare festival foods, serve the crowds and compete in cooking challenges to win the trophy.',
    rating: 4.4, plays: 4500000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Restaurant', 'Food'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cooking-cafe-food-chef',
    title: 'Cooking Cafe Food Chef',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/cooking-cafe-food-chef/?img=20009/1751159188_cooking-cafe-food-chef.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20009/1751159188_cooking-cafe-food-chef.webp',
    description: 'Become the ultimate cafe food chef! Prepare drinks, pastries and meals for cafe customers, manage your kitchen and grow your trendy cafe business.',
    rating: 4.4, plays: 4800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Restaurant', 'Management'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'idle-restaurant-tycoon',
    title: 'Idle Restaurant Tycoon',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/idle-restaurant-tycoon/?img=20363/1753844647_idle-restaurant-tycoon.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20363/1753844647_idle-restaurant-tycoon.webp',
    description: 'Build a restaurant empire from scratch! Hire staff, upgrade equipment and watch your idle restaurant grow into a multi-level dining empire that earns while you sleep.',
    rating: 4.5, plays: 7200000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Idle', 'Restaurant', 'Management', 'Cooking'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'grandma-recipe-apple-pie',
    title: 'Grandma Recipe: Apple Pie',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/grandma-recipe-apple-pie/?img=20381/1753931214_grandma-recipe-apple-pie.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/20381/1753931214_grandma-recipe-apple-pie.webp',
    description: 'Follow Grandma\'s secret apple pie recipe step by step! Peel, slice, mix and bake a perfect golden apple pie with Grandma\'s traditional techniques.',
    rating: 4.4, plays: 3800000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Baking', 'Food'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'strawberry-shortcake-kiz10',
    title: 'Strawberry Shortcake',
    category: 'Girls',
    url: 'https://kiz10.com/embed-play/strawberry-shortcake/?img=19999/1751152425_strawberry-shortcake.webp',
    thumbnail: 'https://cdn.kiz10.com/upload/thumbnails/19999/1751152425_strawberry-shortcake.webp',
    description: 'Bake and decorate with Strawberry Shortcake! Create adorable strawberry-themed cakes and desserts with the beloved Berry Bitty City character.',
    rating: 4.4, plays: 5200000, authorUid: 'curated', createdAt: '2026-06-07T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Girls', 'Casual', '1 Player', 'Cooking', 'Baking', 'Cute'],
    developer: 'Kiz10', publisher: 'Kiz10', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'tekken-3',
    title: 'Tekken 3',
    category: 'Fighting',
    url: 'https://www.gameflare.com/embed/tekken-3/',
    thumbnail: '/tekken3.png',
    description: 'The legendary fighting game is here! Choose from 23 iconic fighters and battle through the King of Iron Fist Tournament. One of the greatest arcade fighters ever made — now in your browser.',
    rating: 4.9, plays: 18000000, authorUid: 'curated', createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Fighting', 'Action', '2 Player', 'Multiplayer', 'Arcade', 'Classic'],
    developer: 'Namco', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'holeio',
    title: 'Hole.io',
    category: 'Casual',
    url: 'https://www.gameflare.com/embed/holeio/',
    thumbnail: 'https://data.gameflare.com/games/8614/35w8JBDgRymodd-400-300.jpg',
    description: 'You are a black hole in the city! Swallow everything in your path — cars, people, buildings — and grow bigger to consume even larger objects. Compete against other holes to be the biggest!',
    rating: 4.8, plays: 22000000, authorUid: 'curated', createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Casual', 'Arcade', 'Multiplayer', 'io', 'Fun', 'Mobile'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'hole-arena',
    title: 'Hole Arena',
    category: 'Casual',
    url: 'https://www.gameflare.com/embed/hole-arena/',
    thumbnail: 'https://data.gameflare.com/games/11316/rr2aIj8fUKyrVx-400-300.jpg',
    description: 'Battle rival holes in an epic arena! Swallow objects to grow bigger, then take down your opponents before the timer runs out. A chaotic and addictive io-style arena brawler.',
    rating: 4.6, plays: 8500000, authorUid: 'curated', createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Casual', 'Arcade', 'Multiplayer', 'io', 'Fun', 'Mobile'],
    developer: 'Gameflare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'angry-birds-space-hd',
    title: 'Angry Birds Space HD',
    category: 'Casual',
    url: 'https://www.gameflare.com/embed/angry-birds-space-hd/',
    thumbnail: 'https://data.gameflare.com/games/3038/MDGwNz60XhvlCq-400-300.jpg',
    description: 'The Angry Birds are in space! Use gravity and clever physics to launch birds around planets and smash the pigs hiding in galactic structures. Out-of-this-world fun for all ages.',
    rating: 4.7, plays: 14000000, authorUid: 'curated', createdAt: '2026-06-06T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Casual', 'Arcade', 'Puzzle', '1 Player', 'Mobile', 'Physics', 'Fun', 'Kids'],
    developer: 'Rovio', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-07T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // ── MadKidGames Collection ─────────────────────────────────────────────
  {
    id: 'airplane-flight-simulator-evo',
    title: 'Airplane Flight Simulator Evo',
    category: 'Simulator',
    url: 'https://www.madkidgames.com/full/airplane-flight-simulator-evo',
    thumbnail: 'https://www.madkidgames.com/image/airplane-flight-simulator-evo.png',
    description: 'Take the cockpit of a realistic airplane and soar through the skies! Master take-offs, landings, and aerial maneuvers in this immersive 3D flight simulator. Perfect for aviation fans of all ages.',
    rating: 4.5, plays: 3800000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Simulator', '3d', 'Flying', '1 Player', 'Skill', 'Fun'],
    developer: 'MadKidGames', publisher: 'MadKidGames', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'angry-birds-2',
    title: 'Angry Birds 2',
    category: 'Casual',
    url: 'https://www.madkidgames.com/full/angry-birds-2',
    thumbnail: 'https://www.madkidgames.com/image/angry-birds-2.png',
    description: 'The birds are back and angrier than ever! Launch your feathered friends with the slingshot to topple elaborate structures and defeat the sneaky pigs. The sequel to the iconic physics puzzler.',
    rating: 4.8, plays: 21000000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Casual', 'Puzzle', 'Physics', '1 Player', 'Mobile', 'Kids', 'Fun', 'Arcade'],
    developer: 'Rovio', publisher: 'MadKidGames', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'unchained-you-can-never-escape',
    title: 'Unchained: You Can Never Escape',
    category: 'Action',
    url: 'https://www.madkidgames.com/full/unchained-you-can-never-escape',
    thumbnail: 'https://www.madkidgames.com/image/unchained-you-can-never-escape.png',
    description: 'Break free and survive at all costs! Navigate a dark, intense world where every decision matters. Dodge dangers, solve traps, and escape through increasingly challenging levels.',
    rating: 4.4, plays: 2900000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Action', 'Adventure', '1 Player', 'Skill', 'Arcade', 'Html5'],
    developer: 'MadKidGames', publisher: 'MadKidGames', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'subway-surfers',
    title: 'Subway Surfers',
    category: 'Mobile Games',
    url: 'https://www.madkidgames.com/full/subway-surfers',
    thumbnail: 'https://www.madkidgames.com/image/subway-surfers.png',
    description: 'Dash through the subway and escape the grumpy inspector! Swipe to dodge trains, grab coins and power-ups as you sprint through colorful cities. The classic mobile endless runner — now in your browser!',
    rating: 4.9, plays: 35000000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Mobile', 'Casual', 'Arcade', '1 Player', 'Running', 'Kids', 'Fun', 'Skill'],
    developer: 'Kiloo', publisher: 'MadKidGames', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'happy-glass',
    title: 'Happy Glass',
    category: 'Puzzle',
    url: 'https://www.madkidgames.com/full/happy-glass',
    thumbnail: 'https://www.madkidgames.com/image/happy-glass.png',
    description: 'Draw a path to fill the sad glass with water and make it happy! Use your finger or mouse to sketch lines and guide liquid into the cup. A relaxing and creative physics puzzle game.',
    rating: 4.7, plays: 11000000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Puzzle', 'Casual', '1 Player', 'Mobile', 'Physics', 'Kids', 'Fun', 'Brain'],
    developer: 'Lion Studios', publisher: 'MadKidGames', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'euro-truck-driver-2018',
    title: 'Euro Truck Driver 2018',
    category: 'Simulator',
    url: 'https://www.madkidgames.com/full/euro-truck-driver-2018',
    thumbnail: 'https://www.madkidgames.com/image/euro-truck-driver-2018.png',
    description: 'Haul cargo across European roads in a massive semi-truck! Navigate highways, cities, and mountain passes while managing your fuel and time. The ultimate truck driving experience in your browser.',
    rating: 4.5, plays: 6200000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: false, isTop: false,
    tags: ['Simulator', 'Driving', '3d', '1 Player', 'Skill', 'Mobile'],
    developer: 'MadKidGames', publisher: 'MadKidGames', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'ultimate-car-driving-simulator',
    title: 'Ultimate Car Driving Simulator',
    category: 'Simulator',
    url: 'https://www.madkidgames.com/full/ultimate-car-driving-simulator',
    thumbnail: 'https://www.madkidgames.com/image/ultimate-car-driving-simulator.png',
    description: 'Get behind the wheel of high-performance cars in a massive open world! Perform stunts, drift around corners, and explore the city at full speed in this ultimate car simulator.',
    rating: 4.6, plays: 8700000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: false,
    tags: ['Simulator', 'Driving', '3d', '1 Player', 'Racing', 'Skill', 'Mobile', 'Fun'],
    developer: 'MadKidGames', publisher: 'MadKidGames', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'stick-war-legacy',
    title: 'Stick War Legacy',
    category: 'Strategy',
    url: 'https://www.madkidgames.com/full/stick-war-legacy',
    thumbnail: 'https://www.madkidgames.com/image/stick-war-legacy.png',
    description: 'Lead your stick figure army to conquer enemy nations! Mine gold, train units — archers, swordsmen, spearmen, and giants — and command them into epic battles. One of the most played strategy games ever.',
    rating: 4.8, plays: 28000000, authorUid: 'curated', createdAt: '2026-06-27T00:00:00.000Z',
    isHot: true, isTop: true,
    tags: ['Strategy', 'Action', '1 Player', 'Skill', 'Battle', 'Arcade', 'Fun'],
    developer: 'Max Games Studios', publisher: 'MadKidGames', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-27T00:00:00.000Z',
    sourceId: 'madkidgames', avgPlayTime: '20m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
];
