import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import { setupAuth, isAuthenticated } from "./server/replit_integrations/auth/index.js";
import { authStorage } from "./server/replit_integrations/auth/storage.js";
import apiRoutes from "./server/routes/api.js";
import previewRoutes, { startAutoProbe, loadManifest } from "./server/routes/previews.js";
import { db } from "./server/db.js";
import { gameStats } from "./shared/models/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.set("trust proxy", 1);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Single-hop redirect: HTTP → HTTPS AND www → non-www in one step
// Combining both conditions avoids a two-hop redirect chain for http://www.gamedravo.com/
app.use((req, res, next) => {
  const proto = req.headers['x-forwarded-proto'] as string | undefined;
  const host = String(req.headers.host || '').toLowerCase();
  const isHttp = proto === 'http';
  const isWww = host === 'www.gamedravo.com' || host.startsWith('www.gamedravo.com:');
  if (isHttp || isWww) {
    return res.redirect(301, `https://gamedravo.com${req.originalUrl}`);
  }
  next();
});

// Serve locally-stored game preview files (written at runtime, not part of dist build)
app.use('/previews', express.static(path.join(process.cwd(), 'public/previews')));

// Mount API routes early (before Vite middleware) so they aren't intercepted by SPA fallback.
// /api/previews must come BEFORE /api so Express doesn't have to traverse all of apiRoutes
// before reaching the previews handler (and to avoid any future apiRoutes wildcard shadowing it).
app.use("/api/previews", previewRoutes);
app.use("/api", apiRoutes);

const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
let onlineGamesCatalogCache: { data: unknown; timestamp: number } | null = null;
let gamePixCatalogCache: { data: unknown; timestamp: number; limit: number } | null = null;

// ─── Sitemap game path cache (for static SEO body injection) ──────────────────
let _sitemapGamePaths: string[] | null = null;
function getSitemapGamePaths(): string[] {
  if (_sitemapGamePaths !== null) return _sitemapGamePaths;
  try {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) { _sitemapGamePaths = []; return []; }
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    _sitemapGamePaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(m => m[1])
      .filter((u: string) => u.includes('/games/'))
      .map((u: string) => u.replace(/^https?:\/\/[^/]+/, ''));
    return _sitemapGamePaths;
  } catch { _sitemapGamePaths = []; return []; }
}
const ONLINE_GAMES_CATALOG_CACHE_TTL = 1000 * 60 * 60;
const GAMEPIX_CATALOG_CACHE_TTL = 1000 * 60 * 60 * 6;
let gamePixFailureUntil = 0;
const GAMEPIX_FAILURE_BACKOFF_TTL = 1000 * 60 * 5; // 5 min backoff on failure
let autoProbeStarted = false;

app.get('/api/onlinegames-catalog', async (_req, res) => {
  try {
    if (
      onlineGamesCatalogCache &&
      Date.now() - onlineGamesCatalogCache.timestamp < ONLINE_GAMES_CATALOG_CACHE_TTL
    ) {
      return res.json(onlineGamesCatalogCache.data);
    }

    const response = await fetch(ONLINE_GAMES_CATALOG_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'GameDravo-CatalogLoader/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not load game catalog.' });
    }

    const data = await response.json();
    onlineGamesCatalogCache = { data, timestamp: Date.now() };
    setImmediate(maybeFireIndexNow);
    setImmediate(maybeStartAutoProbe);
    return res.json(data);
  } catch (error) {
    console.error('OnlineGames catalog proxy failed:', error);
    return res.status(502).json({ error: 'Could not load game catalog.' });
  }
});

app.get('/api/gamepix-catalog', async (req, res) => {
  // Fast-fail if GamePix recently errored
  if (Date.now() < gamePixFailureUntil) {
    return res.json([]);
  }

  const requestedLimit = Number(req.query.limit || 600);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 600) : 600;
  const pageSize = 24; // GamePix max supported pagination size
  const maxPages = Math.ceil(limit / pageSize);

  try {
    if (
      gamePixCatalogCache &&
      gamePixCatalogCache.limit === limit &&
      Date.now() - gamePixCatalogCache.timestamp < GAMEPIX_CATALOG_CACHE_TTL
    ) {
      return res.json(gamePixCatalogCache.data);
    }

    const pages = await Promise.all(
      Array.from({ length: maxPages }, async (_unused, index) => {
        const page = index + 1;
        const response = await fetch(`${GAMEPIX_CATALOG_URL}?order=quality&page=${page}&pagination=${pageSize}&sid=1`, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'GameDravo-CatalogLoader/1.0',
          },
        });

        if (!response.ok) {
          throw new Error(`GamePix page ${page} failed: ${response.status}`);
        }

        const feed = await response.json();
        return Array.isArray(feed?.items) ? feed.items : [];
      })
    );

    const data = pages.flat().slice(0, limit);
    gamePixCatalogCache = { data, timestamp: Date.now(), limit };
    setImmediate(maybeFireIndexNow);
    return res.json(data);
  } catch (error) {
    console.error('GamePix catalog proxy failed:', error);
    gamePixFailureUntil = Date.now() + GAMEPIX_FAILURE_BACKOFF_TTL;
    return res.status(502).json({ error: 'Could not load GamePix catalog.' });
  }
});


// ─── IndexNow URL Submission ──────────────────────────────────────────────────
// Notifies Bing, Yandex, and other IndexNow-compatible engines about new/updated
// URLs.  Fires once per server session after both catalogs are warm.

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '';
const INDEXNOW_HOST = 'gamedravo.com';
const INDEXNOW_SITE = 'https://gamedravo.com';
let indexNowSubmitted = false; // fire once per server process

async function submitIndexNow(urls: string[]): Promise<void> {
  if (!INDEXNOW_KEY || urls.length === 0) return;
  const BATCH = 10_000; // IndexNow hard limit per request
  try {
    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host: INDEXNOW_HOST,
          key: INDEXNOW_KEY,
          keyLocation: `${INDEXNOW_SITE}/${INDEXNOW_KEY}.txt`,
          urlList: batch,
        }),
      });
      if (res.ok || res.status === 202) {
        console.log(`[IndexNow] Submitted ${batch.length} URLs (batch ${Math.floor(i / BATCH) + 1}) → HTTP ${res.status}`);
      } else {
        console.warn(`[IndexNow] Submission failed: HTTP ${res.status} ${await res.text()}`);
      }
    }
  } catch (err) {
    console.warn('[IndexNow] Submission error:', err);
  }
}

function buildIndexNowUrls(): string[] {
  const urls: string[] = [`${INDEXNOW_SITE}/`];
  // Category pages
  const categorySlugs = [
    'trending', 'new-arrivals', 'top-rated', 'recommended',
    'action', 'adventure', 'arcade', 'board', 'card', 'casual',
    'clicker', 'driving', 'educational', 'fighting', 'horror',
    'idle', 'mobile', 'mobile-games', 'best-on-mobile',
    'multiplayer', 'puzzle', 'racing', 'retro', 'sandbox',
    'shooter', 'simulator', 'sports', 'strategy', 'survival', 'word',
    '1-player', '2-player', '3-player', '4-player',
  ];
  for (const slug of categorySlugs) urls.push(`${INDEXNOW_SITE}/category/${slug}`);
  // Game pages from warm caches
  if (onlineGamesCatalogCache?.data) {
    for (const g of onlineGamesCatalogCache.data as Array<{ title?: string }>) {
      if (g.title) {
        const id = g.title.toLowerCase().normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '').slice(0, 72) || 'game';
        urls.push(`${INDEXNOW_SITE}/games/${id}`);
      }
    }
  }
  if (gamePixCatalogCache?.data) {
    for (const g of gamePixCatalogCache.data as Array<{ namespace?: string; title?: string }>) {
      if (g.title) {
        const base = (g.namespace || g.title).toLowerCase().normalize('NFKD')
          .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '').slice(0, 72) || 'game';
        urls.push(`${INDEXNOW_SITE}/games/gamepix-${base}`);
      }
    }
  }
  return urls;
}

function maybeFireIndexNow(): void {
  if (indexNowSubmitted) return;
  if (!onlineGamesCatalogCache?.data || !gamePixCatalogCache?.data) return;
  indexNowSubmitted = true;
  const urls = buildIndexNowUrls();
  console.log(`[IndexNow] Both catalogs warm — submitting ${urls.length} URLs…`);
  submitIndexNow(urls).catch(() => {});
}

function maybeStartAutoProbe(): void {
  if (autoProbeStarted) return;
  if (!onlineGamesCatalogCache?.data) return;
  autoProbeStarted = true;
  const rawGames = onlineGamesCatalogCache.data as Array<{ title: string; embed: string; image: string }>;
  const manifest = loadManifest();
  const uncovered = rawGames.filter((g) => g.title && g.embed).length;
  const alreadyInManifest = rawGames.filter((g) => {
    const id = (g.title ?? '').toLowerCase().normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 72) || 'game';
    return !!manifest[id];
  }).length;
  console.log(`[AutoProbe] OnlineGames catalog warm — ${uncovered} games, ${alreadyInManifest} already in manifest. Starting CDN probe…`);
  startAutoProbe(rawGames).catch((err) => console.warn('[AutoProbe] Error:', err));
}

// Admin endpoint: manually re-trigger IndexNow submission
app.post('/api/admin/indexnow', async (_req, res) => {
  if (!INDEXNOW_KEY) {
    return res.status(503).json({ error: 'INDEXNOW_KEY not configured' });
  }
  indexNowSubmitted = false; // reset so next warm triggers re-submission
  const urls = buildIndexNowUrls();
  if (urls.length === 0) {
    return res.status(202).json({ message: 'Caches cold — nothing to submit yet', submitted: 0 });
  }
  await submitIndexNow(urls);
  return res.json({ message: 'Submitted', submitted: urls.length });
});

// Check Embed Compatibility Route
app.post("/api/check-embed", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const checkRes = await fetch(url, { 
      method: "HEAD",
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;'
      }
    });
    
    clearTimeout(timeout);

    const xFrameOptions = checkRes.headers.get("x-frame-options")?.toLowerCase();
    const csp = checkRes.headers.get("content-security-policy")?.toLowerCase();
    
    let isBlocked = false;
    let reason = "";

    if (xFrameOptions === "deny" || xFrameOptions === "sameorigin") {
      isBlocked = true;
      reason = `Blocked by X-Frame-Options: ${xFrameOptions}`;
    } else if (csp && (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'"))) {
      isBlocked = true;
      reason = "Blocked by Content-Security-Policy: frame-ancestors";
    }

    res.json({
      embeddable: !isBlocked,
      reason,
      status: checkRes.status
    });
  } catch (error: any) {
    // If we can't even fetch the headers, it might be a DNS or purely client-side routing issue.
    // However, for proxy checks, we return false here as a precaution, or true assuming the firewall blocked our Node server.
    // Let's assume it's embeddable to prevent false negatives from the Node server being firewalled, 
    // unless we get a definitive block header.
    console.warn("Embed check failed:", error.message);
    res.json({
      embeddable: true,
      reason: error.message,
      error: true
    });
  }
});


// HTML sitemap — server-rendered page listing all game URLs from sitemap.xml.
// Uses relative URLs so crawlers count every link as a proper internal link.
app.get('/html-sitemap', (_req, res) => {
  try {
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const allUrls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

    // Convert absolute sitemap URLs to relative paths
    const toPath = (absUrl: string) => absUrl.replace(/^https?:\/\/[^/]+/, '');

    const gamePaths = allUrls.filter(u => u.includes('/games/')).map(toPath);
    const categoryPaths = allUrls.filter(u => u.includes('/category/')).map(toPath);
    const staticPaths = allUrls.filter(u => !u.includes('/games/') && !u.includes('/category/')).map(toPath);

    const toLabel = (p: string, prefix: string) =>
      p.replace(prefix, '').replace(/^gamepix-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Home';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Games Index | GameDravo</title>
  <meta name="description" content="Complete index of all ${gamePaths.length} free browser games on GameDravo. Browse every game by title — no download required.">
  <link rel="canonical" href="https://gamedravo.com/html-sitemap">
  <style>
    *{box-sizing:border-box}body{font-family:system-ui,sans-serif;max-width:1200px;margin:0 auto;padding:24px 16px;color:#1a202c;background:#f7fafc}
    h1{font-size:1.8rem;font-weight:900;margin:0 0 8px}p.sub{color:#4a5568;margin:0 0 24px}
    nav{margin-bottom:32px;display:flex;flex-wrap:wrap;gap:10px}nav a{color:#2b6cb0;font-weight:600;text-decoration:none}nav a:hover{text-decoration:underline}
    h2{font-size:1.1rem;font-weight:700;margin:32px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0}
    ul{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:3px 12px}
    ul.static-list{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
    li a{color:#4a5568;font-size:0.875rem;text-decoration:none;display:block;padding:3px 0}li a:hover{color:#1a202c;text-decoration:underline}
    .count{font-size:0.8rem;color:#718096;font-weight:400;margin-left:6px}
  </style>
</head>
<body>
  <nav>
    <a href="/">← GameDravo Home</a>
    <a href="/category/action">Action</a>
    <a href="/category/puzzle">Puzzle</a>
    <a href="/category/racing">Racing</a>
    <a href="/category/sports">Sports</a>
    <a href="/category/arcade">Arcade</a>
    <a href="/category/multiplayer">Multiplayer</a>
    <a href="/category/strategy">Strategy</a>
    <a href="/category/adventure">Adventure</a>
  </nav>

  <h1>GameDravo — All Games Index</h1>
  <p class="sub">Browse all <strong>${gamePaths.length}</strong> free browser games available on GameDravo. Click any title to play instantly — no download required.</p>

  <h2>Site Pages <span class="count">${staticPaths.length} pages</span></h2>
  <ul class="static-list">
    ${staticPaths.map(p => `<li><a href="${p}">${toLabel(p, '/')}</a></li>`).join('\n    ')}
  </ul>

  <h2>Game Categories <span class="count">${categoryPaths.length} categories</span></h2>
  <ul class="static-list">
    ${categoryPaths.map(p => `<li><a href="${p}">${toLabel(p, '/category/')}</a></li>`).join('\n    ')}
  </ul>

  <h2>All Games <span class="count">${gamePaths.length} games</span></h2>
  <ul>
    ${gamePaths.map(p => `<li><a href="${p}">${toLabel(p, '/games/')}</a></li>`).join('\n    ')}
  </ul>
</body>
</html>`;

    res.type('text/html').send(html);
  } catch {
    res.status(500).send('Game index temporarily unavailable.');
  }
});

// ─── Dynamic XML Sitemap ──────────────────────────────────────────────────────
// Registered top-level (before Vite + static serving) so it works in both dev
// and production.  Reuses the in-memory catalog caches already maintained above
// and enriches <lastmod> from game_stats.updatedAt in the DB.

const SITEMAP_CATEGORY_SLUGS = [
  'trending', 'new-arrivals', 'top-rated', 'recommended',
  'action', 'adventure', 'arcade', 'board', 'card', 'casual',
  'clicker', 'driving', 'educational', 'fighting', 'horror',
  'idle', 'mobile', 'mobile-games', 'best-on-mobile',
  'multiplayer', 'puzzle', 'racing', 'retro', 'sandbox',
  'shooter', 'simulator', 'sports', 'strategy', 'survival', 'word',
  '1-player', '2-player', '3-player', '4-player',
];

function sitemapSlugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'game';
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

app.get('/sitemap.xml', async (_req, res) => {
  const SITE = 'https://gamedravo.com';
  const today = new Date().toISOString().slice(0, 10);

  try {
    // ── 1. Build lastmod map from DB ──────────────────────────────────────────
    const statsRows = await db.select({
      id: gameStats.id,
      updatedAt: gameStats.updatedAt,
    }).from(gameStats);
    const lastmodMap = new Map<string, string>();
    for (const row of statsRows) {
      if (row.updatedAt) {
        lastmodMap.set(row.id, new Date(row.updatedAt).toISOString().slice(0, 10));
      }
    }

    // ── 2. Collect game IDs from caches ──────────────────────────────────────
    interface GameEntry { id: string; thumb?: string; lastmod: string }
    const gameMap = new Map<string, GameEntry>();

    const addGame = (id: string, thumb?: string) => {
      if (!gameMap.has(id)) {
        gameMap.set(id, {
          id,
          thumb,
          lastmod: lastmodMap.get(id) ?? today,
        });
      }
    };

    if (onlineGamesCatalogCache?.data) {
      const raw = onlineGamesCatalogCache.data as Array<{ title?: string; image?: string }>;
      for (const g of raw) {
        if (g.title) addGame(sitemapSlugify(g.title), g.image);
      }
    }

    if (gamePixCatalogCache?.data) {
      const raw = gamePixCatalogCache.data as Array<{ namespace?: string; title?: string; banner_image?: string; image?: string }>;
      for (const g of raw) {
        if (g.title) {
          const id = `gamepix-${sitemapSlugify(g.namespace || g.title)}`;
          addGame(id, g.banner_image || g.image);
        }
      }
    }

    // If both caches are cold (server just restarted), fall back to static file
    if (gameMap.size === 0) {
      const staticPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      if (fs.existsSync(staticPath)) {
        res.type('application/xml');
        return res.sendFile(staticPath);
      }
    }

    // ── 3. Build XML ──────────────────────────────────────────────────────────
    const url = (
      loc: string,
      opts: { lastmod?: string; changefreq?: string; priority?: string; image?: string } = {}
    ) => {
      const { lastmod = today, changefreq = 'weekly', priority = '0.7', image } = opts;
      const imgTag = image
        ? `\n    <image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>`
        : '';
      return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${imgTag}\n  </url>`;
    };

    const lines: string[] = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
      `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ];

    // Static pages
    lines.push(url(`${SITE}/`, { changefreq: 'daily', priority: '1.0' }));
    for (const [slug, opts] of [
      ['/search',        { priority: '0.7', changefreq: 'daily'   }],
      ['/html-sitemap',  { priority: '0.5', changefreq: 'weekly'  }],
      ['/about',         { priority: '0.5', changefreq: 'monthly' }],
      ['/contact',       { priority: '0.5', changefreq: 'monthly' }],
      ['/submit-game',   { priority: '0.5', changefreq: 'monthly' }],
      ['/support',       { priority: '0.4', changefreq: 'monthly' }],
      ['/privacy',       { priority: '0.3', changefreq: 'yearly'  }],
      ['/terms',         { priority: '0.3', changefreq: 'yearly'  }],
      ['/cookies',       { priority: '0.3', changefreq: 'yearly'  }],
    ] as [string, Record<string, string>][]) {
      lines.push(url(`${SITE}${slug}`, opts));
    }

    // Category pages
    for (const slug of SITEMAP_CATEGORY_SLUGS) {
      lines.push(url(`${SITE}/category/${slug}`, { changefreq: 'daily', priority: '0.9' }));
    }

    // Game pages — sorted by lastmod desc so freshest entries appear first
    const games = Array.from(gameMap.values()).sort((a, b) => b.lastmod.localeCompare(a.lastmod));
    for (const g of games) {
      lines.push(url(`${SITE}/games/${g.id}`, {
        lastmod: g.lastmod,
        changefreq: 'weekly',
        priority: '0.8',
        image: g.thumb,
      }));
    }

    lines.push('</urlset>');

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.send(lines.join('\n'));
  } catch (err) {
    console.error('Sitemap generation failed:', err);
    // Hard fallback to static file
    const staticPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    if (fs.existsSync(staticPath)) {
      res.type('application/xml');
      return res.sendFile(staticPath);
    }
    return res.status(500).type('application/xml').send('<?xml version="1.0"?><error>Sitemap temporarily unavailable</error>');
  }
});

async function startServer() {
  // Wire up Replit Auth (session + passport + OIDC routes)
  await setupAuth(app);

  // Auth API routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ─── Shared SEO meta injection (works in BOTH dev and production mode) ──────
  const SITE_ORIGIN = 'https://gamedravo.com';

  const ROUTE_META: Record<string, { title: string; description: string }> = {
    '/': { title: 'GameDravo | Free Browser Games, No Download', description: 'GameDravo is a lightweight futuristic gaming portal for instant no-download browser games across action, puzzle, arcade, sports, strategy, and mobile play.' },
    '/about': { title: 'About GameDravo | Free Instant Browser Games', description: 'Learn about GameDravo — a lightweight futuristic portal for free, instant, no-download browser games across action, puzzle, arcade, sports, and more.' },
    '/contact': { title: 'Contact GameDravo | Get in Touch', description: 'Contact the GameDravo team for support, partnerships, game submissions, or general enquiries. We are here to help.' },
    '/privacy': { title: 'Privacy Policy | GameDravo', description: 'Read the GameDravo Privacy Policy to understand how we collect, use, and protect your personal data when you use our free browser gaming platform.' },
    '/terms': { title: 'Terms of Service | GameDravo', description: 'Review the GameDravo Terms of Service — the rules and guidelines governing your use of our free browser gaming platform.' },
    '/cookies': { title: 'Cookie Policy | GameDravo', description: 'Learn how GameDravo uses cookies to improve your experience, save preferences, and keep our free browser gaming platform secure.' },
    '/submit-game': { title: 'Submit a Game | GameDravo', description: 'Submit your browser game to GameDravo for review and potential listing on our free gaming platform.' },
    '/support': { title: 'Support | GameDravo', description: 'Get help from the GameDravo support team. Report bugs, request games, or ask questions about our free browser gaming platform.' },
    '/search': { title: 'Search Games | GameDravo', description: 'Search hundreds of free browser games on GameDravo. Find action, puzzle, arcade, racing, sports, and multiplayer games — instant play, no download.' },
    '/html-sitemap': { title: 'All Games Index | GameDravo', description: 'Browse the complete index of all free browser games on GameDravo. Find every game by title — instant play, no download required.' },
  };

  const ROUTE_BODY: Record<string, string> = {
    '/': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>GameDravo — Free Browser Games</h1><p>GameDravo is a free, lightweight gaming portal offering hundreds of instant-play browser games with no downloads required. Play action, puzzle, arcade, racing, sports, strategy, adventure, multiplayer, simulator, and casual games directly in your browser on desktop or mobile. Discover trending games, new arrivals, top-rated picks, and our curated recommendations. GameDravo is fast, free, and always online — no Flash, no plugins, just pure HTML5 gaming. Browse by category, search by title, save your favourites, track your play history, and find the perfect game for any mood. Our library is updated regularly with hand-picked titles from trusted game developers around the world. Categories include action games, puzzle games, arcade classics, racing challenges, sports simulations, strategy battles, adventure quests, multiplayer competitions, idle simulators, casual fun, girls fashion games, and mobile-optimised titles. Start playing now at GameDravo — the ultimate destination for free browser gaming.</p><nav><a href="/">Home</a> <a href="/about">About</a> <a href="/contact">Contact</a> <a href="/privacy">Privacy</a> <a href="/terms">Terms</a> <a href="/cookies">Cookies</a> <a href="/html-sitemap">All Games</a></nav></div>`,
    '/about': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>About GameDravo</h1><p>GameDravo is a free browser gaming platform built for speed, simplicity, and accessibility. We curate the best HTML5 games from talented developers worldwide and make them available instantly — no download, no registration, no Flash required. Our mission is to bring high-quality gaming to everyone, everywhere, on any device. GameDravo launched with a focus on lightweight performance, ensuring games load fast even on slower connections. We support action games, puzzle games, arcade games, racing games, sports games, strategy games, adventure games, multiplayer games, simulator games, casual games, and mobile-friendly titles. Our platform features a personalised favourites library, play history tracking, trending game charts, new arrivals, and curated recommendations. We sandbox every game to protect your device and privacy. GameDravo serves over 150,000 monthly players and offers more than 800 curated games. We are passionate about making browser gaming better — fast, free, and fun for everyone.</p></div>`,
    '/contact': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>Contact GameDravo</h1><p>Get in touch with the GameDravo team for any enquiries, support requests, partnership opportunities, or game submissions. We welcome feedback from players, developers, and publishers. Our support team is available to help with technical issues, account questions, bug reports, and general enquiries. If you are a game developer and would like to submit your HTML5 browser game for consideration on our platform, please reach out via our contact form or email us directly. For advertising and partnership opportunities, our team will be happy to discuss potential collaborations. GameDravo values open communication and aims to respond to all enquiries within two business days. You can also visit our support portal for answers to frequently asked questions, or submit a ticket for priority assistance. We are committed to providing excellent customer service and making your GameDravo experience the best it can be.</p></div>`,
    '/privacy': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>Privacy Policy — GameDravo</h1><p>Your privacy matters to us at GameDravo. This Privacy Policy explains how we collect, use, store, and protect information when you use our free browser gaming platform. We collect minimal data necessary to operate the service — including session identifiers, play history, and user preferences when you create an account. We do not sell your personal data to third parties. All game sessions run in a secure, isolated sandbox environment. We use industry-standard encryption to protect data in transit and at rest. Users have full control over their personal data and can request deletion at any time. We comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Our platform uses cookies for session management, preference storage, and anonymous analytics. You can control cookie settings through your browser. GameDravo may display contextual advertising from trusted partners, but we do not use personal data for targeted advertising without consent. We retain usage data for up to 12 months unless you request earlier deletion. For any privacy-related questions or data deletion requests, please contact our support team.</p></div>`,
    '/terms': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>Terms of Service — GameDravo</h1><p>By accessing and using GameDravo, you agree to these Terms of Service. GameDravo provides a free browser gaming platform for personal, non-commercial use. You must be at least 13 years of age to use this service. You agree not to misuse the platform, including attempting to circumvent security measures, scrape content, or engage in any activity that disrupts service for other users. All games on GameDravo are provided by third-party developers and are subject to their respective licences. GameDravo's original content — including the platform design, branding, and proprietary features — is protected by copyright. You retain ownership of any content you submit, but grant GameDravo a licence to display it. We reserve the right to remove content or suspend accounts that violate these terms. GameDravo is provided on an as-is basis and we do not guarantee uninterrupted availability. We may update these terms periodically and will notify users of significant changes. Continued use of the platform after changes constitutes acceptance of the updated terms. For questions about these terms, please contact our support team.</p></div>`,
    '/cookies': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>Cookie Policy — GameDravo</h1><p>GameDravo uses cookies and similar technologies to improve your experience on our platform. This Cookie Policy explains what cookies are, how we use them, and how you can control them. Cookies are small text files stored on your device that help websites remember your preferences and session information. We use strictly necessary cookies to keep you logged in and remember your settings. Preference cookies save your favourite games, display preferences, and language settings. Analytics cookies help us understand how players use GameDravo so we can improve the experience — all analytics data is anonymous. Security cookies protect against cross-site request forgery and verify secure token exchanges. You can control or delete cookies through your browser settings at any time. Disabling cookies may affect some functionality, including saving favourites and maintaining your session. GameDravo does not use third-party advertising cookies without your consent. We review our cookie usage regularly to ensure we only collect what is necessary. For questions about our use of cookies, please contact our support team.</p></div>`,
  };

  const slugToTitle = (slug: string): string =>
    slug.replace(/^gamepix-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  function buildHomeBody(): string {
    const gamePaths = getSitemapGamePaths();
    const gameLinksHtml = gamePaths
      .map(p => `<a href="${p}">${slugToTitle(p.replace('/games/', ''))}</a>`)
      .join(' ');
    return `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>GameDravo — Free Browser Games</h1><p>GameDravo is a free, lightweight gaming portal offering hundreds of instant-play browser games with no downloads required. Play action, puzzle, arcade, racing, sports, strategy, adventure, multiplayer, simulator, and casual games directly in your browser on desktop or mobile. Discover trending games, new arrivals, top-rated picks, and our curated recommendations. GameDravo is fast, free, and always online — no Flash, no plugins, just pure HTML5 gaming.</p><nav><a href="/">Home</a> <a href="/about">About</a> <a href="/contact">Contact</a> <a href="/privacy">Privacy</a> <a href="/terms">Terms</a> <a href="/cookies">Cookies</a> <a href="/html-sitemap">All Games</a></nav>${gameLinksHtml ? `<nav aria-label="All Games">${gameLinksHtml}</nav>` : ''}</div>`;
  }

  function escapeJson(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '');
  }

  function escapeAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildSocialMeta(title: string, description: string, url: string, type = 'website'): string {
    const image = 'https://gamedravo.com/logo.svg';
    const t = escapeAttr(title);
    const d = escapeAttr(description);
    return [
      `<meta property="og:type" content="${type}" />`,
      `<meta property="og:site_name" content="GameDravo" />`,
      `<meta property="og:title" content="${t}" />`,
      `<meta property="og:description" content="${d}" />`,
      `<meta property="og:url" content="${url}" />`,
      `<meta property="og:image" content="${image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:site" content="@GameDravo" />`,
      `<meta name="twitter:title" content="${t}" />`,
      `<meta name="twitter:description" content="${d}" />`,
      `<meta name="twitter:image" content="${image}" />`,
    ].join('\n');
  }

  function buildGameJsonLd(gameSlug: string, canonicalUrl: string): string {
    const t = escapeJson(slugToTitle(gameSlug));
    const desc = escapeJson(`Play ${slugToTitle(gameSlug)} for free in your browser on GameDravo. No download required. Instant HTML5 gameplay — no plugins, no installation.`);
    const videoGameSchema = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": t,
      "description": desc,
      "url": canonicalUrl,
      "applicationCategory": "GameApplication",
      "operatingSystem": "Web Browser",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "publisher": { "@type": "Organization", "name": "GameDravo", "url": "https://gamedravo.com" }
    };
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "GameDravo", "item": "https://gamedravo.com" },
        { "@type": "ListItem", "position": 2, "name": "All Games", "item": "https://gamedravo.com/html-sitemap" },
        { "@type": "ListItem", "position": 3, "name": t, "item": canonicalUrl }
      ]
    };
    return `<script type="application/ld+json">${JSON.stringify(videoGameSchema)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
  }

  function buildCategoryJsonLd(catSlug: string, canonicalUrl: string): string {
    const n = catSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const collectionSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `Free ${n} Games Online`,
      "description": `Play free ${n.toLowerCase()} games online on GameDravo. No download required. Instant play on desktop and mobile.`,
      "url": canonicalUrl,
      "isPartOf": { "@type": "WebSite", "name": "GameDravo", "url": "https://gamedravo.com" }
    };
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "GameDravo", "item": "https://gamedravo.com" },
        { "@type": "ListItem", "position": 2, "name": `${n} Games`, "item": canonicalUrl }
      ]
    };
    return `<script type="application/ld+json">${JSON.stringify(collectionSchema)}</script>\n<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`;
  }


  function injectSeoMeta(html: string, routePath: string): string {
    const canonical = `${SITE_ORIGIN}${routePath === '/' ? '' : routePath}`;
    const gameMatch = routePath.match(/^\/games\/(.+)$/);
    const catMatch = routePath.match(/^\/category\/(.+)$/);
    let dynMeta: { title: string; description: string } | null = null;
    let dynBody = '';
    let jsonLd = '';
    let noscriptH1 = '';
    if (gameMatch) {
      const t = slugToTitle(gameMatch[1]);
      dynMeta = { title: `${t} – Play Free Online | GameDravo`, description: `Play ${t} free in your browser — no download, no installation. Instant HTML5 game on GameDravo.` };
      noscriptH1 = `Play ${t} Free Online`;
      // Inject links to 24 nearby game pages for crawlable internal linking
      const allGamePaths = getSitemapGamePaths();
      const idx = allGamePaths.findIndex(p => p === routePath);
      const nearby = idx >= 0
        ? [...allGamePaths.slice(Math.max(0, idx - 12), idx), ...allGamePaths.slice(idx + 1, idx + 13)]
        : allGamePaths.slice(0, 24);
      const nearbyLinks = nearby.map(p => `<a href="${p}">${slugToTitle(p.replace('/games/',''))}</a>`).join(' ');
      dynBody = `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;"><h1>Play ${t} Free Online</h1><p>Play ${t} for free on GameDravo — no download or installation required. Open your browser and start playing instantly on desktop or mobile. ${t} is an HTML5 browser game available on GameDravo, your home for free instant-play games. Browse hundreds of free games including action, puzzle, arcade, racing, sports, strategy, multiplayer, and casual titles. No Flash, no plugins — just pure HTML5 fun.</p><nav><a href="/">Home</a> <a href="/html-sitemap">All Games</a> <a href="/category/action">Action</a> <a href="/category/puzzle">Puzzle</a> <a href="/category/arcade">Arcade</a> <a href="/category/racing">Racing</a> <a href="/category/sports">Sports</a></nav>${nearbyLinks ? `<nav aria-label="More Games">${nearbyLinks}</nav>` : ''}</div>`;
      jsonLd = buildGameJsonLd(gameMatch[1], canonical);
    } else if (catMatch) {
      const n = catMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const nl = n.toLowerCase();
      dynMeta = { title: `${n} Games – Play Free Online | GameDravo`, description: `Play free ${nl} games online on GameDravo. No download required. Discover the best ${nl} browser games — instant play on desktop and mobile.` };
      noscriptH1 = `Free ${n} Games Online`;
      dynBody = `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;"><h1>Free ${n} Games Online</h1><p>Play free ${nl} games online on GameDravo. Browse our curated collection of the best ${nl} browser games — no download, no installation, no Flash required. Instant play on desktop and mobile. GameDravo offers hundreds of free HTML5 games across every category: action, puzzle, arcade, racing, sports, strategy, adventure, multiplayer, simulator, and casual games. Find your next favourite ${nl} game on GameDravo today.</p><nav><a href="/">Home</a> <a href="/html-sitemap">All Games</a> <a href="/category/action">Action</a> <a href="/category/puzzle">Puzzle</a> <a href="/category/arcade">Arcade</a> <a href="/category/racing">Racing</a> <a href="/category/sports">Sports</a> <a href="/category/strategy">Strategy</a></nav></div>`;
      jsonLd = buildCategoryJsonLd(catMatch[1], canonical);
    }
    const meta = ROUTE_META[routePath] || dynMeta;
    // Homepage body is built dynamically to include all game links
    const bodyContent = routePath === '/' ? buildHomeBody() : (ROUTE_BODY[routePath] || dynBody);
    html = html.replace(/<!-- Per-page canonical injected server-side or by React Helmet -->/, `<link rel="canonical" href="${canonical}" />`);
    if (meta) {
      html = html.replace(/(<title>)[^<]*(<\/title>)/, `$1${meta.title}$2`);
      html = html.replace(/(<meta name="description" content=")[^"]*(")/,  `$1${meta.description}$2`);
    }
    // Inject OG + Twitter Card + JSON-LD tags before </head> — all server-side so crawlers see them
    const resolvedTitle = meta?.title || 'GameDravo | Free Browser Games, No Download';
    const resolvedDesc = meta?.description || 'GameDravo is a lightweight futuristic gaming portal for instant no-download browser games.';
    const ogType = gameMatch ? 'game' : 'website';
    const socialTags = buildSocialMeta(resolvedTitle, resolvedDesc, canonical, ogType);
    const headInjection = [socialTags, jsonLd].filter(Boolean).join('\n');
    if (headInjection) {
      html = html.replace('</head>', `${headInjection}\n</head>`);
    }
    // Replace the noscript H1 "GameDravo" with a page-specific heading for non-JS crawlers
    if (noscriptH1) {
      html = html.replace(
        /(<h1[^>]*>)GameDravo(<\/h1>)/,
        `$1${noscriptH1}$2`
      );
    }
    html = html.replace('<!-- SEO_STATIC_BODY -->', bodyContent);
    return html;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      plugins: [{
        name: 'seo-meta-inject',
        transformIndexHtml: {
          order: 'post' as const,
          handler(html: string, ctx: { originalUrl?: string }) {
            const routePath = (ctx.originalUrl || '/').split('?')[0].replace(/\/$/, '') || '/';
            return injectSeoMeta(html, routePath);
          }
        }
      }]
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.get('/robots.txt', (_req, res) => {
      res.type('text/plain');
      const f = fs.existsSync(path.join(distPath, 'robots.txt')) ? path.join(distPath, 'robots.txt') : path.join(process.cwd(), 'public', 'robots.txt');
      return res.sendFile(f);
    });
    app.use(express.static(distPath, { index: false }));

    app.get('*', (req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      try {
        const routePath = req.path.replace(/\/$/, '') || '/';
        const html = injectSeoMeta(fs.readFileSync(htmlPath, 'utf8'), routePath);
        res.type('text/html').send(html);
      } catch {
        res.sendFile(htmlPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
