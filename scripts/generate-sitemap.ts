import fs from 'node:fs';
import path from 'node:path';
import { GAMES, CATEGORY_LIST } from '../src/games';

const BASE_URL = 'https://gamedravo.com';
const TODAY = new Date().toISOString().slice(0, 10);
const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';

interface SitemapEntry {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function absolute(pathname: string): string {
  if (pathname === '/') return `${BASE_URL}/`;
  return `${BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  if (parsed.pathname !== '/') parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  return parsed.toString();
}

function urlTag(entry: SitemapEntry): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ].join('\n');
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

function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const AD_HEAVY_GAME_IDS = new Set([
  'stickman-parkour', 'stickman-gta-city', 'checkout-frenzy', 'dublix',
  'escape-car', 'cube-worlds', 'burnout-city', 'basket-hoop', 'fps-strike',
  'warstrike', 'fast-food-rush', 'super-car-driving', 'egg-car-racing',
  'love-tester-story', 'cubecraft-survival', 'chess-freezenova', 'mini-cars-racing',
]);

const REMOVED_ORIGINAL_GAME_IDS = new Set([
  'snake', 'snake-classic', 'tetris', 'block-stacker', '2048', '2048-original',
  'breakout', 'minesweeper', 'minesweeper-classic', 'flappy', 'flappy-bird-classic',
  'dino', 'dino-runner', 'memory', 'memory-match', 'space-shooter', 'space-defender', 'pac-dots',
]);

async function fetchOnlineGameIds(): Promise<string[]> {
  try {
    console.log('Fetching OnlineGames.io catalog...');
    const res = await fetch(ONLINE_GAMES_CATALOG_URL, {
      headers: { Accept: 'application/json', 'User-Agent': 'GameDravo-SitemapGenerator/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn(`OnlineGames catalog returned ${res.status}, skipping`);
      return [];
    }
    const raw: Array<{ title?: string; embed?: string; image?: string }> = await res.json();
    const ids: string[] = [];
    for (const game of raw) {
      if (!game.title || !game.embed || !game.image) continue;
      const id = slugify(game.title);
      if (AD_HEAVY_GAME_IDS.has(id)) continue;
      if (REMOVED_ORIGINAL_GAME_IDS.has(id)) continue;
      if (!/^https:\/\//i.test(game.embed) || !/^https:\/\//i.test(game.image)) continue;
      try {
        const embedHost = new URL(game.embed).hostname.toLowerCase().replace(/^www\./, '');
        const embedPath = new URL(game.embed).pathname.toLowerCase();
        if (embedHost !== 'onlinegames.io' && embedHost !== 'cloud.onlinegames.io') continue;
        if (embedPath.includes('index-og.html') || embedPath.includes('game-og.html')) continue;
      } catch { continue; }
      ids.push(id);
    }
    console.log(`  OnlineGames.io: ${ids.length} games`);
    return ids;
  } catch (err) {
    console.warn('Failed to fetch OnlineGames catalog:', (err as Error).message);
    return [];
  }
}

const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const GAMEPIX_PAGE_SIZE = 24;
const GAMEPIX_TARGET = 600;

async function fetchGamePixIds(): Promise<string[]> {
  try {
    console.log('Fetching GamePix catalog...');
    const totalPages = Math.ceil(GAMEPIX_TARGET / GAMEPIX_PAGE_SIZE);
    const pages = await Promise.all(
      Array.from({ length: totalPages }, async (_, i) => {
        const page = i + 1;
        const res = await fetch(
          `${GAMEPIX_CATALOG_URL}?order=quality&page=${page}&pagination=${GAMEPIX_PAGE_SIZE}&sid=1`,
          { headers: { Accept: 'application/json', 'User-Agent': 'GameDravo-SitemapGenerator/1.0' },
            signal: AbortSignal.timeout(15000) }
        );
        if (!res.ok) return [];
        const feed = await res.json();
        return Array.isArray(feed?.items) ? feed.items : [];
      })
    );
    const items = pages.flat().slice(0, GAMEPIX_TARGET);
    const ids = items
      .filter((g: any) => g.namespace || g.title)
      .map((g: any) => `gamepix-${slugify(g.namespace || g.title)}`);
    console.log(`  GamePix: ${ids.length} games`);
    return ids;
  } catch (err) {
    console.warn('Failed to fetch GamePix catalog:', (err as Error).message);
    return [];
  }
}

async function generate(): Promise<string> {
  const entries: SitemapEntry[] = [];

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages: [string, SitemapEntry['changefreq'], string][] = [
    ['/', 'daily', '1.0'],
    ['/search', 'weekly', '0.7'],
    ['/about', 'monthly', '0.6'],
    ['/contact', 'monthly', '0.5'],
    ['/support', 'monthly', '0.5'],
    ['/submit-game', 'monthly', '0.5'],
    ['/privacy', 'monthly', '0.4'],
    ['/terms', 'monthly', '0.4'],
    ['/cookies', 'monthly', '0.3'],
  ];
  for (const [pathname, changefreq, priority] of staticPages) {
    entries.push({ loc: absolute(pathname), changefreq, priority });
  }

  // ── Category pages ────────────────────────────────────────────────────────
  const skipCategories = new Set(['All', 'Favorites', 'Recommended', 'History', 'Trending', 'Mods']);
  for (const cat of CATEGORY_LIST) {
    if (skipCategories.has(cat)) continue;
    entries.push({
      loc: absolute(`/category/${slugifyCategory(cat)}`),
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // ── Static game pages ─────────────────────────────────────────────────────
  const seenIds = new Set<string>();
  for (const game of GAMES) {
    if (!game.id || seenIds.has(game.id)) continue;
    seenIds.add(game.id);
    entries.push({ loc: absolute(`/games/${game.id}`), changefreq: 'weekly', priority: '0.8' });
  }

  // ── Fetch remote catalogs in parallel ────────────────────────────────────
  const [onlineIds, gamePixIds] = await Promise.all([fetchOnlineGameIds(), fetchGamePixIds()]);

  for (const id of [...onlineIds, ...gamePixIds]) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    entries.push({ loc: absolute(`/games/${id}`), changefreq: 'weekly', priority: '0.8' });
  }

  // Deduplicate and sort (home first, then by priority desc, then alpha)
  const deduped = Array.from(
    new Map(entries.map((e) => [normalizeUrl(e.loc), { ...e, loc: normalizeUrl(e.loc) }])).values()
  ).sort((a, b) => {
    if (a.loc === `${BASE_URL}/`) return -1;
    if (b.loc === `${BASE_URL}/`) return 1;
    const pd = parseFloat(b.priority) - parseFloat(a.priority);
    if (pd !== 0) return pd;
    return a.loc.localeCompare(b.loc);
  });

  const gameCount = deduped.filter(e => e.loc.includes('/games/')).length;
  const catCount = deduped.filter(e => e.loc.includes('/category/')).length;
  console.log(`Sitemap URLs: ${deduped.length} total (${gameCount} games, ${catCount} categories, ${staticPages.length} static)`);

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${deduped.map(urlTag).join('\n')}\n` +
    `</urlset>\n`
  );
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
generate()
  .then((xml) => {
    fs.writeFileSync(outPath, xml, 'utf8');
    console.log(`Wrote sitemap: ${outPath}`);
  })
  .catch((error) => {
    console.error('Failed to generate sitemap:', error);
    process.exitCode = 1;
  });
