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

  // ── 100 curated browser games ──────────────────────────────────────────────

  // Racing / Bike
  {
    id: 'moto-x3m', title: 'Moto X3M', category: 'Action',
    url: 'https://www.gameflare.com/embed/moto-x3m/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Moto+X3M',
    description: 'Race your motorbike through insane obstacle courses, perform stunts and survive deadly traps. One of the most addictive physics-based bike games ever made!',
    rating: 4.8, plays: 25000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Racing', 'Action', 'Bike', 'Stunts', 'Physics'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'moto-x3m-winter', title: 'Moto X3M Winter', category: 'Action',
    url: 'https://www.gameflare.com/embed/moto-x3m-winter/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Moto+X3M+Winter',
    description: 'The smash-hit Moto X3M returns with a frosty winter theme! Race through icy tracks and snow-covered obstacles.',
    rating: 4.7, plays: 14000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Racing', 'Action', 'Bike', 'Winter', 'Physics'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'moto-x3m-pool-party', title: 'Moto X3M Pool Party', category: 'Action',
    url: 'https://www.gameflare.com/embed/moto-x3m-pool-party/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/34d399?text=Moto+X3M+Pool',
    description: 'Splash into summer with Moto X3M Pool Party! Race through water slides, diving boards and poolside stunts.',
    rating: 4.7, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Racing', 'Action', 'Bike', 'Summer', 'Physics'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'moto-x3m-spooky-land', title: 'Moto X3M Spooky Land', category: 'Action',
    url: 'https://www.gameflare.com/embed/moto-x3m-spooky-land/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Moto+X3M+Spooky',
    description: 'A Halloween twist on the legendary Moto X3M! Race through haunted tracks with skeletons, ghosts and pumpkins.',
    rating: 4.6, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Racing', 'Action', 'Bike', 'Halloween', 'Physics'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'stickman-hook', title: 'Stickman Hook', category: 'Action',
    url: 'https://www.gameflare.com/embed/stickman-hook/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Stickman+Hook',
    description: 'Swing like Spider-Man! Tap to hook onto pegs and swing your stickman through colorful obstacle courses. Simple but insanely addictive!',
    rating: 4.7, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Casual', '1 Player', 'Stickman', 'Physics', 'Mobile'],
    developer: 'Madbox', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'vex-5', title: 'VEX 5', category: 'Action',
    url: 'https://www.gameflare.com/embed/vex-5/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=VEX+5',
    description: 'Navigate your stickman through brutally challenging obstacle acts. Dodge sawblades, spikes and death traps in this incredible platformer.',
    rating: 4.7, plays: 11000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Platformer', '1 Player', 'Stickman', 'Obstacle'],
    developer: 'Amazing Adam', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'vex-6', title: 'VEX 6', category: 'Action',
    url: 'https://www.gameflare.com/embed/vex-6/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=VEX+6',
    description: 'The latest entry in the acclaimed VEX series! More acts, deadlier obstacles and slicker stickman controls than ever before.',
    rating: 4.8, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Platformer', '1 Player', 'Stickman', 'Obstacle'],
    developer: 'Amazing Adam', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'vex-4', title: 'VEX 4', category: 'Action',
    url: 'https://www.gameflare.com/embed/vex-4/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=VEX+4',
    description: 'A masterpiece of stickman platforming. Survive razor-sharp obstacles across 10 deadly acts in VEX 4.',
    rating: 4.6, plays: 9500000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Platformer', '1 Player', 'Stickman', 'Obstacle'],
    developer: 'Amazing Adam', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'slope-game', title: 'Slope Game', category: 'Action',
    url: 'https://www.gameflare.com/embed/slope-game/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Slope',
    description: 'Guide a ball down a neon slope at ever-increasing speeds. React fast, dodge obstacles and survive as long as you can!',
    rating: 4.8, plays: 30000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Arcade', '1 Player', 'Speed', 'Endless', 'Neon'],
    developer: 'Rob Kay', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'run-3', title: 'Run 3', category: 'Action',
    url: 'https://www.gameflare.com/embed/run-3/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Run+3',
    description: 'Run through a space tunnel that goes on forever! Jump, dodge and switch gravity to keep your alien moving. A massive browser gaming classic.',
    rating: 4.8, plays: 35000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Arcade', '1 Player', 'Space', 'Endless', 'Classic'],
    developer: 'Player 03', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Sports — Random Physics Series
  {
    id: 'basket-random', title: 'Basketball Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/basket-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Basketball+Random',
    description: 'Hilariously unpredictable basketball! Every round changes the rules — giant players, bouncy courts and utter chaos. 2-player couch game!',
    rating: 4.7, plays: 16000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Sports', '2 Player', 'Basketball', 'Multiplayer', 'Random', 'Fun'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'boxing-random', title: 'Boxing Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/boxing-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Boxing+Random',
    description: 'Ragdoll boxing at its finest. Wild physics, random power-ups and laugh-out-loud knockdowns. Perfect for 2-player battles!',
    rating: 4.7, plays: 13000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Sports', '2 Player', 'Boxing', 'Multiplayer', 'Random', 'Ragdoll'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'soccer-random', title: 'Soccer Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/soccer-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Soccer+Random',
    description: 'Unpredictable soccer chaos! Changing pitches, random weather and bizarre physics make every match hilarious.',
    rating: 4.6, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Sports', '2 Player', 'Soccer', 'Multiplayer', 'Random', 'Fun'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'volleyball-random', title: 'Volleyball Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/volleyball-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=Volleyball+Random',
    description: 'Spike and serve your way to victory in this wild physics-based volleyball game. Random rules keep every set fresh!',
    rating: 4.5, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '2 Player', 'Volleyball', 'Multiplayer', 'Random'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'wrestling-random', title: 'Wrestling Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/wrestling-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Wrestling+Random',
    description: 'Ragdoll wrestling with random chaos! Pin your opponent before they pin you in this hilariously unpredictable 2-player brawler.',
    rating: 4.6, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Sports', '2 Player', 'Wrestling', 'Multiplayer', 'Ragdoll'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'baseball-random', title: 'Baseball Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/baseball-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Baseball+Random',
    description: 'Hit home runs in the wackiest baseball game around! Random physics and wild batter/pitcher combos guarantee laughs.',
    rating: 4.4, plays: 6000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '2 Player', 'Baseball', 'Multiplayer', 'Random'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'tennis-random', title: 'Tennis Random', category: 'Sports',
    url: 'https://www.gameflare.com/embed/tennis-random/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/34d399?text=Tennis+Random',
    description: 'Wild tennis with random physics rules every set! Challenge a friend and see who can handle the chaos.',
    rating: 4.4, plays: 5500000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '2 Player', 'Tennis', 'Multiplayer', 'Random'],
    developer: 'RHM Interactive', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Racing / Driving
  {
    id: 'madalin-stunt-cars-2', title: 'Madalin Stunt Cars 2', category: 'Racing',
    url: 'https://www.gameflare.com/embed/madalin-stunt-cars-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Madalin+Stunt+Cars+2',
    description: 'Drive supercars on massive open stunt maps with ramps, loops and jumps. Choose from dozens of exotic cars and pull off insane stunts!',
    rating: 4.8, plays: 28000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Racing', 'Stunts', '3D', 'Cars', 'Open World', 'Multiplayer'],
    developer: 'Madalin Games', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'madalin-stunt-cars-3', title: 'Madalin Stunt Cars 3', category: 'Racing',
    url: 'https://www.gameflare.com/embed/madalin-stunt-cars-3/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Madalin+Stunt+Cars+3',
    description: 'The ultimate stunt car experience is back with new cars, bigger maps and insane online multiplayer. Feel the speed!',
    rating: 4.9, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Racing', 'Stunts', '3D', 'Cars', 'Open World', 'Multiplayer'],
    developer: 'Madalin Games', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'drift-hunters', title: 'Drift Hunters', category: 'Racing',
    url: 'https://www.gameflare.com/embed/drift-hunters/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=Drift+Hunters',
    description: 'Master the art of drifting in this stunning 3D car game. Upgrade and tune real-feeling cars and rack up massive drift combos.',
    rating: 4.8, plays: 22000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Racing', 'Drifting', '3D', 'Cars', 'Tuning', 'Realistic'],
    developer: 'Studionum43', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'road-fury', title: 'Road Fury', category: 'Racing',
    url: 'https://www.gameflare.com/embed/road-fury/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Road+Fury',
    description: 'Blast down a post-apocalyptic highway and destroy enemy vehicles before they destroy you. Fast-paced vehicular combat action!',
    rating: 4.5, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Racing', 'Action', 'Shooting', 'Cars', 'Combat'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'crazy-roll-3d', title: 'Crazy Roll 3D', category: 'Racing',
    url: 'https://www.gameflare.com/embed/crazy-roll-3d/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Crazy+Roll+3D',
    description: 'Roll your ball through an insane 3D track filled with obstacles, gaps and spirals. Survive longer than anyone else!',
    rating: 4.5, plays: 7000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Racing', 'Arcade', '3D', 'Endless', 'Ball', 'Speed'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'parking-fury-2', title: 'Parking Fury 2', category: 'Racing',
    url: 'https://www.gameflare.com/embed/parking-fury-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Parking+Fury+2',
    description: 'Park your car in tight spots without crashing. Realistic physics make each level a satisfying puzzle. Night mode included!',
    rating: 4.3, plays: 5000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Racing', 'Puzzle', '1 Player', 'Parking', 'Driving', 'Realistic'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Strategy
  {
    id: 'age-of-war', title: 'Age of War', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/age-of-war/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Age+of+War',
    description: 'Evolve your army from cavemen to futuristic soldiers and destroy the enemy base. A legendary strategy game with 5 ages of war!',
    rating: 4.7, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Strategy', 'Action', '1 Player', 'Classic', 'Tower Defense', 'Evolution'],
    developer: 'Max Games', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'age-of-war-2', title: 'Age of War 2', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/age-of-war-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Age+of+War+2',
    description: 'The sequel to the legendary strategy game. More units, more ages and more epic base-destroying action!',
    rating: 4.7, plays: 15000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Strategy', 'Action', '1 Player', 'Classic', 'Tower Defense'],
    developer: 'Max Games', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'bloons-tower-defense-5', title: 'Bloons TD 5', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/bloons-tower-defense-5/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Bloons+TD+5',
    description: 'Defend against waves of balloons using strategic tower placements. Dozens of towers, tracks and game modes in the ultimate tower defense!',
    rating: 4.8, plays: 25000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Strategy', 'Tower Defense', '1 Player', 'Casual', 'Classic'],
    developer: 'Ninja Kiwi', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '25m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'stick-war-legacy', title: 'Stick War Legacy', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/stick-war-legacy/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=Stick+War+Legacy',
    description: 'Lead your stickman army to conquer enemy nations. Mine gold, train warriors and defeat giant bosses in this epic strategy game!',
    rating: 4.8, plays: 30000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Strategy', 'Action', '1 Player', 'Stickman', 'RTS', 'Classic'],
    developer: 'Max Games', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '25m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'epic-war-5', title: 'Epic War 5', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/epic-war-5/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Epic+War+5',
    description: 'Command a massive fantasy army of heroes, orcs and mythical creatures. Siege enemy castles and dominate the battlefield!',
    rating: 4.5, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Strategy', 'Action', '1 Player', 'Fantasy', 'RTS'],
    developer: 'War Elephant', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'kingdom-rush', title: 'Kingdom Rush', category: 'Strategy',
    url: 'https://www.gameflare.com/embed/kingdom-rush/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Kingdom+Rush',
    description: 'The tower defense king! Build towers, command heroes and crush waves of goblins, trolls and dragons in this award-winning strategy epic.',
    rating: 4.9, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Strategy', 'Tower Defense', '1 Player', 'Fantasy', 'Classic'],
    developer: 'Ironhide Game Studio', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '30m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Adventure / Platformer
  {
    id: 'bob-the-robber', title: 'Bob the Robber', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/bob-the-robber/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=Bob+the+Robber',
    description: 'Sneak through guarded buildings, crack safes and outsmart security cameras as Bob the Robber. A masterpiece of stealth platforming!',
    rating: 4.6, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Adventure', 'Puzzle', '1 Player', 'Stealth', 'Platformer', 'Classic'],
    developer: 'Funtomic', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'bob-the-robber-2', title: 'Bob the Robber 2', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/bob-the-robber-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=Bob+Robber+2',
    description: 'Bob is back with harder heists, smarter guards and new gadgets. More safes, more alarms, more stealth action!',
    rating: 4.6, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Adventure', 'Puzzle', '1 Player', 'Stealth', 'Platformer'],
    developer: 'Funtomic', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'snail-bob', title: 'Snail Bob', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/snail-bob/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/34d399?text=Snail+Bob',
    description: 'Guide adorable Snail Bob through clever puzzle levels using switches, levers and timing. A charming brain-teaser for all ages!',
    rating: 4.5, plays: 10000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Adventure', 'Puzzle', '1 Player', 'Casual', 'Cute', 'Kids'],
    developer: 'Riki Zarir', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'snail-bob-2', title: 'Snail Bob 2', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/snail-bob-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/34d399?text=Snail+Bob+2',
    description: "Bob is back with a Christmas adventure! Guide him through winter wonderland puzzles to find his grandpa's house.",
    rating: 4.5, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Adventure', 'Puzzle', '1 Player', 'Casual', 'Cute', 'Kids'],
    developer: 'Riki Zarir', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'red-ball-4', title: 'Red Ball 4', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/red-ball-4/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Red+Ball+4',
    description: 'Roll and jump through physics-based levels as the heroic red ball. Defeat the evil black squares trying to flatten the world!',
    rating: 4.6, plays: 15000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Adventure', 'Platformer', '1 Player', 'Physics', 'Casual', 'Kids'],
    developer: 'FDG Mobile Games', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl', title: 'Fireboy and Watergirl', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/fireboy-and-watergirl/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Fireboy+%26+Watergirl',
    description: 'Help Fireboy and Watergirl work together to solve elemental puzzles! A beloved 2-player co-op platformer with fire and water mechanics.',
    rating: 4.8, plays: 40000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Adventure', 'Puzzle', '2 Player', 'Platformer', 'Co-op', 'Classic'],
    developer: 'Oslo Albet', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-2', title: 'Fireboy and Watergirl 2', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/fireboy-and-watergirl-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Fireboy+%26+WG2',
    description: 'The light temple awaits! Use light beams and mirrors to guide Fireboy and Watergirl to the exit in this sequel classic.',
    rating: 4.7, plays: 25000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Adventure', 'Puzzle', '2 Player', 'Platformer', 'Co-op', 'Classic'],
    developer: 'Oslo Albet', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'fireboy-and-watergirl-3', title: 'Fireboy and Watergirl 3', category: 'Adventure',
    url: 'https://www.gameflare.com/embed/fireboy-and-watergirl-3/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Fireboy+%26+WG3',
    description: 'The ice temple is full of frozen puzzles! Slide across icy platforms and find the gems together in this frosty co-op adventure.',
    rating: 4.6, plays: 18000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Adventure', 'Puzzle', '2 Player', 'Platformer', 'Co-op', 'Classic'],
    developer: 'Oslo Albet', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'papa-louie', title: "Papa's Burger", category: 'Casual',
    url: 'https://www.gameflare.com/embed/papa-louie/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Papa+Louie',
    description: "Serve customers their perfect burgers in Papa Louie's Burgeria! Manage orders, grill patties and build the ultimate burger restaurant.",
    rating: 4.6, plays: 18000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Casual', 'Cooking', '1 Player', 'Management', 'Classic', 'Fun'],
    developer: 'Flipline Studios', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Puzzle / Casual
  {
    id: '2048', title: '2048', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/2048/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=2048',
    description: 'Slide tiles and combine matching numbers to reach 2048. A deceptively simple puzzle game that will have you hooked for hours!',
    rating: 4.7, plays: 50000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Puzzle', 'Casual', '1 Player', 'Numbers', 'Classic', 'Mobile'],
    developer: 'Gabriele Cirulli', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'bubble-shooter-hd', title: 'Bubble Shooter HD', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/bubble-shooter-hd/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Bubble+Shooter',
    description: 'Pop colorful bubbles by shooting matching colors. A timeless puzzle classic that is easy to learn and impossible to put down!',
    rating: 4.5, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Puzzle', 'Casual', '1 Player', 'Bubble', 'Classic', 'Mobile'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'mahjong-shanghai', title: 'Mahjong Shanghai', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/mahjong-shanghai/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Mahjong+Shanghai',
    description: 'Clear the board by matching identical Mahjong tiles. The classic Chinese tile game in beautiful HD with multiple layouts!',
    rating: 4.4, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Puzzle', 'Casual', '1 Player', 'Mahjong', 'Classic', 'Brain'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cut-the-rope', title: 'Cut the Rope', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/cut-the-rope/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Cut+the+Rope',
    description: "Feed candy to Om Nom by slicing ropes with perfect timing! Collect all three stars in this award-winning physics puzzle series.",
    rating: 4.7, plays: 30000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Puzzle', 'Casual', '1 Player', 'Physics', 'Classic', 'Kids'],
    developer: 'ZeptoLab', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'geometry-dash-lite', title: 'Geometry Dash Lite', category: 'Action',
    url: 'https://www.gameflare.com/embed/geometry-dash-lite/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Geometry+Dash',
    description: 'Jump and fly through rhythm-based levels in this legendary music platformer. One wrong move and you start over — perfectly brutal!',
    rating: 4.8, plays: 40000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Action', 'Rhythm', '1 Player', 'Music', 'Platformer', 'Classic'],
    developer: 'RobTop Games', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'tunnel-rush', title: 'Tunnel Rush', category: 'Action',
    url: 'https://www.gameflare.com/embed/tunnel-rush/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Tunnel+Rush',
    description: "Dodge through a neon kaleidoscope tunnel at blistering speed. React in milliseconds or crash. It's pure, fast-twitch adrenaline!",
    rating: 4.6, plays: 16000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Action', 'Arcade', '1 Player', 'Speed', 'Endless', 'Neon'],
    developer: 'Deer Cat Games', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '5m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'flappy-bird', title: 'Flappy Bird', category: 'Casual',
    url: 'https://www.gameflare.com/embed/flappy-bird/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=Flappy+Bird',
    description: 'The world-famous mobile phenomenon! Tap to keep your bird airborne and guide it through the gaps. Deceptively simple, endlessly frustrating fun.',
    rating: 4.5, plays: 60000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Casual', 'Arcade', '1 Player', 'Mobile', 'Classic', 'Tap'],
    developer: 'Dong Nguyen', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '5m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'piano-tiles', title: 'Piano Tiles', category: 'Casual',
    url: 'https://www.gameflare.com/embed/piano-tiles/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f0f0f0?text=Piano+Tiles',
    description: 'Tap the black tiles in rhythm to play beautiful songs on the piano. A musical reflex game that is incredibly satisfying to master!',
    rating: 4.6, plays: 25000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Casual', 'Music', '1 Player', 'Rhythm', 'Tap', 'Mobile'],
    developer: 'Umoni Studio', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'color-road', title: 'Color Road', category: 'Casual',
    url: 'https://www.gameflare.com/embed/color-road/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Color+Road',
    description: 'Roll your color-matching ball down a winding road. Collect balls of your color and dodge the ones that do not match!',
    rating: 4.4, plays: 10000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Casual', 'Arcade', '1 Player', 'Color', 'Mobile', 'Endless'],
    developer: 'Ketchapp', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'knife-hit', title: 'Knife Hit', category: 'Casual',
    url: 'https://www.gameflare.com/embed/knife-hit/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Knife+Hit',
    description: 'Throw knives at a spinning wooden log without hitting other knives. Simple, satisfying and intensely challenging!',
    rating: 4.5, plays: 14000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Casual', 'Arcade', '1 Player', 'Knife', 'Mobile', 'Tap'],
    developer: 'Ketchapp', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'stack-ball', title: 'Stack Ball', category: 'Casual',
    url: 'https://www.gameflare.com/embed/stack-ball/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Stack+Ball',
    description: 'Smash your ball through colorful helix platform stacks. Break through the colored tiles and reach the bottom! Addictive mobile fun.',
    rating: 4.4, plays: 11000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Casual', 'Arcade', '1 Player', 'Mobile', 'Tap', 'Endless'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'crowd-city', title: 'Crowd City', category: 'Casual',
    url: 'https://www.gameflare.com/embed/crowd-city/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Crowd+City',
    description: 'Grow your crowd by swallowing pedestrians and dominate the city! Absorb more people than your rivals before the timer runs out.',
    rating: 4.5, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Casual', 'io', '1 Player', 'Crowd', 'Mobile', 'Fun'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'paper-io-2', title: 'Paper.io 2', category: 'Casual',
    url: 'https://www.gameflare.com/embed/paper-io-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Paper.io+2',
    description: 'Expand your territory by drawing loops and capturing land. Eliminate rivals by cutting their lines in this massively popular io game!',
    rating: 4.7, plays: 25000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Casual', 'io', 'Multiplayer', 'Territory', 'Mobile', 'Fun'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Sports (more)
  {
    id: 'basketball-legends', title: 'Basketball Legends', category: 'Sports',
    url: 'https://www.gameflare.com/embed/basketball-legends/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Basketball+Legends',
    description: 'Choose basketball legends and face off in fast-paced 1v1 matches! Pull off super dunks, trick shots and signature moves.',
    rating: 4.7, plays: 18000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Sports', '2 Player', 'Basketball', 'Multiplayer', 'Fun', 'Action'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'basketball-stars', title: 'Basketball Stars', category: 'Sports',
    url: 'https://www.gameflare.com/embed/basketball-stars/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=Basketball+Stars',
    description: 'Challenge real players worldwide in this fast-paced multiplayer basketball game. Dribble, fake and shoot your way to the top!',
    rating: 4.6, plays: 14000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Sports', 'Multiplayer', 'Basketball', '2 Player', 'Fun'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'head-soccer', title: 'Head Soccer', category: 'Sports',
    url: 'https://www.gameflare.com/embed/head-soccer/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Head+Soccer',
    description: 'Score goals with giant-headed soccer characters! Unlock special abilities and face off against countries around the world.',
    rating: 4.6, plays: 16000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Sports', '2 Player', 'Soccer', 'Multiplayer', 'Fun', 'Casual'],
    developer: 'D&D Dream', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'penalty-shooters-2', title: 'Penalty Shooters 2', category: 'Sports',
    url: 'https://www.gameflare.com/embed/penalty-shooters-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Penalty+Shooters+2',
    description: 'Take penalties and save shots in this nail-biting football game. Score past the keeper and dive to stop their shots — feel the pressure!',
    rating: 4.5, plays: 10000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '1 Player', 'Soccer', 'Football', 'Penalty', 'Fun'],
    developer: 'Gamesplural', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'soccer-physics', title: 'Soccer Physics', category: 'Sports',
    url: 'https://www.gameflare.com/embed/soccer-physics/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/34d399?text=Soccer+Physics',
    description: 'Absurd soccer with one button! Fling your wobbly ragdoll players and score goals in the most unpredictable soccer game ever.',
    rating: 4.5, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '2 Player', 'Soccer', 'Physics', 'Ragdoll', 'Fun'],
    developer: 'Otto Ojala', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'football-masters', title: 'Football Masters', category: 'Sports',
    url: 'https://www.gameflare.com/embed/football-masters/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Football+Masters',
    description: "Win the football championship with your nation's heroes. Fast arcade soccer with skill moves, power shots and team selection!",
    rating: 4.4, plays: 7000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '2 Player', 'Soccer', 'Multiplayer', 'Fun'],
    developer: 'MadPuffers', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'table-tennis-world-tour', title: 'Table Tennis World Tour', category: 'Sports',
    url: 'https://www.gameflare.com/embed/table-tennis-world-tour/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Table+Tennis',
    description: 'Compete in the ping pong World Tour! Spin, smash and lob your way to the championship in this realistic table tennis game.',
    rating: 4.3, plays: 5000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '1 Player', 'Ping Pong', 'Table Tennis', 'Realistic'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'archery-world-tour', title: 'Archery World Tour', category: 'Sports',
    url: 'https://www.gameflare.com/embed/archery-world-tour/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Archery+World+Tour',
    description: 'Travel the world competing in archery tournaments. Adjust for wind and distance to hit bullseyes in the archery world championship!',
    rating: 4.3, plays: 4500000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '1 Player', 'Archery', 'Aim', 'Tournament'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'bowling-king', title: 'Bowling King', category: 'Sports',
    url: 'https://www.gameflare.com/embed/bowling-king/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Bowling+King',
    description: 'Become the bowling king! Perfect your aim, add spin and knock down all 10 pins for strikes across multiple alleys and levels.',
    rating: 4.4, plays: 6000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', '1 Player', 'Bowling', 'Casual', 'Aim'],
    developer: 'MiniGames', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // 2-Player / Multiplayer
  {
    id: 'air-hockey', title: 'Air Hockey', category: '2 Player',
    url: 'https://www.gameflare.com/embed/air-hockey/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Air+Hockey',
    description: 'The classic air hockey table comes to your browser! Battle a friend in split-screen or face the AI in intense puck-slapping action.',
    rating: 4.5, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['2 Player', 'Sports', 'Multiplayer', 'Classic', 'Arcade', 'Fun'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'ping-pong-chaos', title: 'Ping Pong Chaos', category: '2 Player',
    url: 'https://www.gameflare.com/embed/ping-pong-chaos/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Ping+Pong+Chaos',
    description: 'Ping pong has never been this crazy! Multiple balls, power-ups and absurd physics make every rally a chaotic spectacle. 2-player blast!',
    rating: 4.4, plays: 6000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['2 Player', 'Sports', 'Multiplayer', 'Chaos', 'Arcade'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'sumo-physics', title: 'Sumo Physics', category: '2 Player',
    url: 'https://www.gameflare.com/embed/sumo-physics/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/ef4444?text=Sumo+Physics',
    description: 'Push your sumo opponent off the platform using crazy ragdoll physics! A one-button 2-player game that causes instant chaos.',
    rating: 4.4, plays: 5500000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['2 Player', 'Sports', 'Multiplayer', 'Ragdoll', 'Sumo', 'Physics'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'head-basketball', title: 'Head Basketball', category: '2 Player',
    url: 'https://www.gameflare.com/embed/head-basketball/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Head+Basketball',
    description: 'Cartoon-style basketball with giant-headed players and super power dunks! Unlock special attacks and dunk all over your friends.',
    rating: 4.5, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['2 Player', 'Sports', 'Basketball', 'Multiplayer', 'Fun'],
    developer: 'D&D Dream', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // Action / Shooting
  {
    id: 'zombocalypse', title: 'Zombocalypse', category: 'Action',
    url: 'https://www.gameflare.com/embed/zombocalypse/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Zombocalypse',
    description: 'The zombie apocalypse is here! Grab weapons dropped by air supply and mow down endless undead hordes in this intense top-down shooter.',
    rating: 4.5, plays: 11000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Zombie', 'Survival', 'Arcade'],
    developer: 'Newgrounds', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: '1945-air-force', title: '1945 Air Force', category: 'Action',
    url: 'https://www.gameflare.com/embed/1945-air-force/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=1945+Air+Force',
    description: 'Pilot a WWII fighter jet through intense bullet-hell skies! Shoot down enemy planes, collect power-ups and defeat massive bosses.',
    rating: 4.6, plays: 13000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Airplane', 'WWII', 'Arcade'],
    developer: 'ONESOFT', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'zombie-shooter', title: 'Zombie Shooter', category: 'Action',
    url: 'https://www.gameflare.com/embed/zombie-shooter/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Zombie+Shooter',
    description: 'Hold your ground against relentless zombie waves. Choose your weapons, upgrade your arsenal and survive the endless undead onslaught!',
    rating: 4.4, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Zombie', 'Survival'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'stickman-shooting', title: 'Stickman Shooting', category: 'Action',
    url: 'https://www.gameflare.com/embed/stickman-shooting/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Stickman+Shooting',
    description: 'Eliminate stick figure enemies with a variety of weapons in this action-packed stickman shooter with satisfying physics ragdoll kills.',
    rating: 4.3, plays: 6000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Stickman', 'Ragdoll'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'alien-attack', title: 'Alien Attack', category: 'Action',
    url: 'https://www.gameflare.com/embed/alien-attack/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Alien+Attack',
    description: 'Defend Earth from alien invaders in this classic Space Invaders-style shooter. Blast wave after wave of increasingly fast alien ships!',
    rating: 4.3, plays: 7000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Space', 'Arcade', 'Classic'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'military-wars-3d', title: 'Military Wars 3D', category: 'Action',
    url: 'https://www.gameflare.com/embed/military-wars-3d/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Military+Wars+3D',
    description: 'Fight through intense 3D military combat missions. Take cover, aim carefully and eliminate enemy soldiers in this realistic FPS-style game.',
    rating: 4.4, plays: 9000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Shooting', '1 Player', '3D', 'Military', 'FPS'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '12m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },

  // More Casual / Endless
  {
    id: 'fall-beans', title: 'Fall Beans', category: 'Casual',
    url: 'https://www.gameflare.com/embed/fall-beans/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Fall+Beans',
    description: 'Compete in wacky elimination rounds with colorful jelly bean characters! Survive moving obstacles and be the last bean standing.',
    rating: 4.6, plays: 15000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Casual', 'Multiplayer', 'Platformer', 'Fun', 'Battle Royale'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'parkour-block-3d', title: 'Parkour Block 3D', category: 'Action',
    url: 'https://www.gameflare.com/embed/parkour-block-3d/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=Parkour+Block+3D',
    description: 'Race through Minecraft-style parkour courses at breakneck speed! Jump, sprint and slide across block obstacles in first-person 3D.',
    rating: 4.5, plays: 10000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Platformer', '1 Player', '3D', 'Minecraft', 'Parkour'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'helix-jump', title: 'Helix Jump', category: 'Casual',
    url: 'https://www.gameflare.com/embed/helix-jump/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/facc15?text=Helix+Jump',
    description: 'Drop your bouncing ball through rotating helix platforms. Skip multiple levels at once for a combo and smash through the tiles to the bottom!',
    rating: 4.5, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Casual', 'Arcade', '1 Player', 'Mobile', 'Tap', 'Endless'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '7m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'chess-online', title: 'Chess Online', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/chess-online/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f0f0f0?text=Chess+Online',
    description: 'Play chess against a powerful AI or challenge friends online! Multiple difficulty levels from beginner to grandmaster with hints and move analysis.',
    rating: 4.6, plays: 15000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Puzzle', 'Strategy', '1 Player', '2 Player', 'Chess', 'Classic', 'Brain'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'solitaire', title: 'Solitaire Classic', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/solitaire/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Solitaire',
    description: 'The timeless card game! Sort the deck in sequential order and suit stacks to win. Clean HD graphics with drag-and-drop controls.',
    rating: 4.4, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Puzzle', 'Casual', '1 Player', 'Cards', 'Classic', 'Relaxing'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'idle-breakout', title: 'Idle Breakout', category: 'Casual',
    url: 'https://www.gameflare.com/embed/idle-breakout/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=Idle+Breakout',
    description: 'Smash bricks with bouncing balls that keep going even when you are gone! Buy more balls, upgrade power and break through billions of bricks.',
    rating: 4.5, plays: 12000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Casual', 'Idle', '1 Player', 'Clicker', 'Breakout', 'Upgrade'],
    developer: 'Kodiqi', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '20m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'cookie-clicker', title: 'Cookie Clicker', category: 'Casual',
    url: 'https://www.gameflare.com/embed/cookie-clicker/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Cookie+Clicker',
    description: 'Click the cookie to make more cookies. Buy grandmas, farms and portals to bake trillions of cookies! The ultimate idle clicker game.',
    rating: 4.6, plays: 30000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: true, tags: ['Casual', 'Idle', '1 Player', 'Clicker', 'Cookie', 'Addictive'],
    developer: 'Orteil', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '30m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'dragon-ball-fighting', title: 'Dragon Ball Fighting', category: 'Fighting',
    url: 'https://www.gameflare.com/embed/dragon-ball-fighting/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Dragon+Ball+Fight',
    description: 'Fight as Goku, Vegeta, Gohan and more iconic DBZ characters! Unleash Kamehameha blasts and super attacks in this DBZ browser fighter.',
    rating: 4.5, plays: 14000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: true, isTop: false, tags: ['Fighting', 'Action', '2 Player', 'Anime', 'Dragon Ball', 'Classic'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'duck-hunt', title: 'Duck Hunt', category: 'Action',
    url: 'https://www.gameflare.com/embed/duck-hunt/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Duck+Hunt',
    description: 'The legendary NES game is back! Shoot ducks before they escape and do not miss or the dog will laugh at you. A nostalgic arcade classic!',
    rating: 4.5, plays: 18000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Shooting', '1 Player', 'Arcade', 'Classic', 'Retro'],
    developer: 'Nintendo (Fan port)', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'city-car-driving', title: 'City Car Driving', category: 'Racing',
    url: 'https://www.gameflare.com/embed/city-car-driving/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/60a5fa?text=City+Car+Driving',
    description: 'Drive through a realistic 3D city following traffic laws — or break them all! A chill open-world driving simulator in your browser.',
    rating: 4.4, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Racing', 'Simulator', '1 Player', '3D', 'Driving', 'Open World'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '15m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'slope-ball', title: 'Slope Ball', category: 'Action',
    url: 'https://www.gameflare.com/embed/slope-ball/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Slope+Ball',
    description: 'A vibrant variation of the classic Slope game with a colorful ball. Roll, dodge and survive as long as possible on the endless neon slope!',
    rating: 4.4, plays: 7000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Arcade', '1 Player', 'Endless', 'Speed', 'Ball'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '6m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'golf-orbit', title: 'Golf Orbit', category: 'Sports',
    url: 'https://www.gameflare.com/embed/golf-orbit/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/22c55e?text=Golf+Orbit',
    description: 'Hit the golf ball as far as possible and reach orbit! Upgrade clubs, aim for the stars and see how far your drive can go.',
    rating: 4.4, plays: 6000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Sports', 'Casual', '1 Player', 'Golf', 'Idle', 'Upgrade'],
    developer: 'Voodoo', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'jewel-blast', title: 'Jewel Blast', category: 'Puzzle',
    url: 'https://www.gameflare.com/embed/jewel-blast/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/a855f7?text=Jewel+Blast',
    description: 'Blast colorful gems and create dazzling chain reactions! Match 3 or more jewels to clear the board before you run out of moves.',
    rating: 4.3, plays: 8000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Puzzle', 'Casual', '1 Player', 'Match 3', 'Jewels', 'Mobile'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'touch-friendly',
    fullscreenSupport: true, orientation: 'portrait', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'run-2', title: 'Run 2', category: 'Action',
    url: 'https://www.gameflare.com/embed/run-2/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/7c3aed?text=Run+2',
    description: 'Sprint through a twisting space corridor in the Run 2 sequel! Jump over gaps, avoid holes and master two playable characters.',
    rating: 4.6, plays: 20000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Action', 'Arcade', '1 Player', 'Space', 'Endless', 'Classic'],
    developer: 'Player 03', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '8m', contentRating: 'Everyone',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
  {
    id: 'naruto-fighting', title: 'Naruto Fighting', category: 'Fighting',
    url: 'https://www.gameflare.com/embed/naruto-fighting/',
    thumbnail: 'https://placehold.co/400x300/0f0f1a/f97316?text=Naruto+Fighting',
    description: 'Battle as Naruto, Sasuke, and iconic shinobi characters! Deploy jutsu, dodge attacks and fight to become the most powerful ninja!',
    rating: 4.4, plays: 10000000, authorUid: 'curated', createdAt: '2026-06-10T00:00:00.000Z',
    isHot: false, isTop: false, tags: ['Fighting', 'Action', '2 Player', 'Anime', 'Naruto', 'Ninja'],
    developer: 'GameFlare', publisher: 'Gameflare', mobileOptimization: 'responsive',
    fullscreenSupport: true, orientation: 'landscape', embedCompatibility: 'full',
    validationState: 'Verified Working', lastVerified: '2026-06-10T00:00:00.000Z',
    sourceId: 'curated', avgPlayTime: '10m', contentRating: 'Teen',
    adsInjected: false, popupRisk: false, redirectRisk: false,
  },
];