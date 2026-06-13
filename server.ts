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

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Mount API routes early (before Vite middleware) so they aren't intercepted by SPA fallback
app.use("/api", apiRoutes);

const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
let onlineGamesCatalogCache: { data: unknown; timestamp: number } | null = null;
let gamePixCatalogCache: { data: unknown; timestamp: number; limit: number } | null = null;
const ONLINE_GAMES_CATALOG_CACHE_TTL = 1000 * 60 * 60;
const GAMEPIX_CATALOG_CACHE_TTL = 1000 * 60 * 60 * 6;
let gamePixFailureUntil = 0;
const GAMEPIX_FAILURE_BACKOFF_TTL = 1000 * 60 * 5; // 5 min backoff on failure

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
    return res.json(data);
  } catch (error) {
    console.error('GamePix catalog proxy failed:', error);
    gamePixFailureUntil = Date.now() + GAMEPIX_FAILURE_BACKOFF_TTL;
    return res.status(502).json({ error: 'Could not load GamePix catalog.' });
  }
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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Force canonical host in production (www -> non-www).
    app.use((req, res, next) => {
      const host = String(req.headers.host || '').toLowerCase();
      if (host === 'www.gamedravo.com' || host.startsWith('www.gamedravo.com:')) {
        const target = `https://gamedravo.com${req.originalUrl || '/'}`;
        return res.redirect(301, target);
      }
      return next();
    });

    // Ensure correct content-types for SEO-critical static files (avoid SPA fallback).

    app.get('/sitemap.xml', (_req, res) => {
      res.type('application/xml');
      const distFile = path.join(distPath, 'sitemap.xml');
      const publicFile = path.join(process.cwd(), 'public', 'sitemap.xml');
      const filePath = fs.existsSync(distFile) ? distFile : publicFile;
      return res.sendFile(filePath);
    });
    app.get('/robots.txt', (_req, res) => {
      res.type('text/plain');
      const distFile = path.join(distPath, 'robots.txt');
      const publicFile = path.join(process.cwd(), 'public', 'robots.txt');
      const filePath = fs.existsSync(distFile) ? distFile : publicFile;
      return res.sendFile(filePath);
    });
    app.use(express.static(distPath));

    // Route-specific SEO meta — injected server-side so crawlers see correct title/canonical
    const SITE_ORIGIN = 'https://gamedravo.com';
    const ROUTE_META: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'GameDravo | Free Browser Games, No Download',
        description: 'GameDravo is a lightweight futuristic gaming portal for instant no-download browser games across action, puzzle, arcade, sports, strategy, and mobile play.',
      },
      '/about': {
        title: 'About GameDravo | Free Instant Browser Games',
        description: 'Learn about GameDravo — a lightweight futuristic portal for free, instant, no-download browser games across action, puzzle, arcade, sports, and more.',
      },
      '/contact': {
        title: 'Contact GameDravo | Get in Touch',
        description: 'Contact the GameDravo team for support, partnerships, game submissions, or general enquiries. We are here to help.',
      },
      '/privacy': {
        title: 'Privacy Policy | GameDravo',
        description: 'Read the GameDravo Privacy Policy to understand how we collect, use, and protect your personal data when you use our free browser gaming platform.',
      },
      '/terms': {
        title: 'Terms of Service | GameDravo',
        description: 'Review the GameDravo Terms of Service — the rules and guidelines governing your use of our free browser gaming platform.',
      },
      '/cookies': {
        title: 'Cookie Policy | GameDravo',
        description: 'Learn how GameDravo uses cookies to improve your experience, save preferences, and keep our free browser gaming platform secure.',
      },
      '/submit-game': {
        title: 'Submit a Game | GameDravo',
        description: 'Submit your browser game to GameDravo for review and potential listing on our free gaming platform.',
      },
      '/support': {
        title: 'Support | GameDravo',
        description: 'Get help from the GameDravo support team. Report bugs, request games, or ask questions about our free browser gaming platform.',
      },
    };

    app.get('*', (req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      try {
        let html = fs.readFileSync(htmlPath, 'utf8');
        const routePath = req.path.replace(/\/$/, '') || '/';
        const meta = ROUTE_META[routePath];
        const canonical = `${SITE_ORIGIN}${routePath === '/' ? '' : routePath}/`;
        if (meta) {
          html = html.replace(
            /(<title>)[^<]*(<\/title>)/,
            `$1${meta.title}$2`
          );
          html = html.replace(
            /<!-- Per-page canonical injected server-side or by React Helmet -->/,
            `<link rel="canonical" href="${canonical}" />`
          );
          html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${meta.description}$2`
          );
        } else {
          html = html.replace(
            /<!-- Per-page canonical injected server-side or by React Helmet -->/,
            `<link rel="canonical" href="${canonical}" />`
          );
        }
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
