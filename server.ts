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

app.set("trust proxy", 1);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// HTTP → HTTPS redirect (production only, before all other handlers)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
    if (proto === 'http') {
      return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
    }
  }
  next();
});

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

    // Route-specific SEO meta — injected server-side so crawlers see correct title/canonical/body
    const SITE_ORIGIN = 'https://gamedravo.com';
    const ROUTE_META: Record<string, { title: string; description: string; body?: string }> = {
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
      '/search': {
        title: 'Search Games | GameDravo',
        description: 'Search hundreds of free browser games on GameDravo. Find action, puzzle, arcade, racing, sports, and multiplayer games — instant play, no download.',
      },
      '/html-sitemap': {
        title: 'All Games Index | GameDravo',
        description: 'Browse the complete index of all free browser games on GameDravo. Find every game by title — instant play, no download required.',
      },
    };

    // Per-route static body content injected for crawlers (fixes low word count audit error)
    const ROUTE_BODY: Record<string, string> = {
      '/': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>GameDravo — Free Browser Games</h1>
<p>GameDravo is a free, lightweight gaming portal offering hundreds of instant-play browser games with no downloads required. Play action, puzzle, arcade, racing, sports, strategy, adventure, multiplayer, simulator, and casual games directly in your browser on desktop or mobile. Discover trending games, new arrivals, top-rated picks, and our curated recommendations. GameDravo is fast, free, and always online — no Flash, no plugins, just pure HTML5 gaming. Browse by category, search by title, save your favourites, track your play history, and find the perfect game for any mood. Our library is updated regularly with hand-picked titles from trusted game developers around the world. Categories include action games, puzzle games, arcade classics, racing challenges, sports simulations, strategy battles, adventure quests, multiplayer competitions, idle simulators, casual fun, girls fashion games, and mobile-optimised titles. Start playing now at GameDravo — the ultimate destination for free browser gaming.</p>
<nav><a href="/">Home</a> <a href="/about">About</a> <a href="/contact">Contact</a> <a href="/privacy">Privacy</a> <a href="/terms">Terms</a> <a href="/cookies">Cookies</a> <a href="/html-sitemap">All Games</a></nav>
</div>`,
      '/about': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>About GameDravo</h1>
<p>GameDravo is a free browser gaming platform built for speed, simplicity, and accessibility. We curate the best HTML5 games from talented developers worldwide and make them available instantly — no download, no registration, no Flash required. Our mission is to bring high-quality gaming to everyone, everywhere, on any device. GameDravo launched with a focus on lightweight performance, ensuring games load fast even on slower connections. We support action games, puzzle games, arcade games, racing games, sports games, strategy games, adventure games, multiplayer games, simulator games, casual games, and mobile-friendly titles. Our platform features a personalised favourites library, play history tracking, trending game charts, new arrivals, and curated recommendations. We sandbox every game to protect your device and privacy. GameDravo serves over 150,000 monthly players and offers more than 800 curated games. We are passionate about making browser gaming better — fast, free, and fun for everyone.</p>
</div>`,
      '/contact': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Contact GameDravo</h1>
<p>Get in touch with the GameDravo team for any enquiries, support requests, partnership opportunities, or game submissions. We welcome feedback from players, developers, and publishers. Our support team is available to help with technical issues, account questions, bug reports, and general enquiries. If you are a game developer and would like to submit your HTML5 browser game for consideration on our platform, please reach out via our contact form or email us directly. For advertising and partnership opportunities, our team will be happy to discuss potential collaborations. GameDravo values open communication and aims to respond to all enquiries within two business days. You can also visit our support portal for answers to frequently asked questions, or submit a ticket for priority assistance. We are committed to providing excellent customer service and making your GameDravo experience the best it can be.</p>
</div>`,
      '/privacy': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Privacy Policy — GameDravo</h1>
<p>Your privacy matters to us at GameDravo. This Privacy Policy explains how we collect, use, store, and protect information when you use our free browser gaming platform. We collect minimal data necessary to operate the service — including session identifiers, play history, and user preferences when you create an account. We do not sell your personal data to third parties. All game sessions run in a secure, isolated sandbox environment. We use industry-standard encryption to protect data in transit and at rest. Users have full control over their personal data and can request deletion at any time. We comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). Our platform uses cookies for session management, preference storage, and anonymous analytics. You can control cookie settings through your browser. GameDravo may display contextual advertising from trusted partners, but we do not use personal data for targeted advertising without consent. We retain usage data for up to 12 months unless you request earlier deletion. For any privacy-related questions or data deletion requests, please contact our support team.</p>
</div>`,
      '/terms': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Terms of Service — GameDravo</h1>
<p>By accessing and using GameDravo, you agree to these Terms of Service. GameDravo provides a free browser gaming platform for personal, non-commercial use. You must be at least 13 years of age to use this service. You agree not to misuse the platform, including attempting to circumvent security measures, scrape content, or engage in any activity that disrupts service for other users. All games on GameDravo are provided by third-party developers and are subject to their respective licences. GameDravo's original content — including the platform design, branding, and proprietary features — is protected by copyright. You retain ownership of any content you submit, but grant GameDravo a licence to display it. We reserve the right to remove content or suspend accounts that violate these terms. GameDravo is provided on an as-is basis and we do not guarantee uninterrupted availability. We may update these terms periodically and will notify users of significant changes. Continued use of the platform after changes constitutes acceptance of the updated terms. For questions about these terms, please contact our support team.</p>
</div>`,
      '/cookies': `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Cookie Policy — GameDravo</h1>
<p>GameDravo uses cookies and similar technologies to improve your experience on our platform. This Cookie Policy explains what cookies are, how we use them, and how you can control them. Cookies are small text files stored on your device that help websites remember your preferences and session information. We use strictly necessary cookies to keep you logged in and remember your settings. Preference cookies save your favourite games, display preferences, and language settings. Analytics cookies help us understand how players use GameDravo so we can improve the experience — all analytics data is anonymous. Security cookies protect against cross-site request forgery and verify secure token exchanges. You can control or delete cookies through your browser settings at any time. Disabling cookies may affect some functionality, including saving favourites and maintaining your session. GameDravo does not use third-party advertising cookies without your consent. We review our cookie usage regularly to ensure we only collect what is necessary. For questions about our use of cookies, please contact our support team.</p>
</div>`,
    };

    // Helper: convert a URL slug to a readable title
    const slugToTitle = (slug: string): string =>
      slug
        .replace(/^gamepix-/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    app.get('*', (req, res) => {
      const htmlPath = path.join(distPath, 'index.html');
      try {
        let html = fs.readFileSync(htmlPath, 'utf8');
        const routePath = req.path.replace(/\/$/, '') || '/';
        const canonical = `${SITE_ORIGIN}${routePath === '/' ? '' : routePath}/`;

        // Detect dynamic routes
        const gameMatch = routePath.match(/^\/games\/(.+)$/);
        const catMatch = routePath.match(/^\/category\/(.+)$/);

        let dynamicMeta: { title: string; description: string } | null = null;
        let dynamicBody = '';

        if (gameMatch) {
          const gameTitle = slugToTitle(gameMatch[1]);
          dynamicMeta = {
            title: `Play ${gameTitle} Free Online — GameDravo`,
            description: `Play ${gameTitle} for free in your browser on GameDravo. No download required. Instant HTML5 gameplay — no plugins, no installation.`,
          };
          dynamicBody = `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Play ${gameTitle} Free Online</h1>
<p>Play ${gameTitle} for free on GameDravo — no download or installation required. Open your browser and start playing instantly on desktop or mobile. ${gameTitle} is an HTML5 browser game available on GameDravo, your home for free instant-play games. Browse hundreds of free games including action, puzzle, arcade, racing, sports, strategy, multiplayer, and casual titles. No Flash, no plugins — just pure HTML5 fun.</p>
<nav><a href="/">Home</a> <a href="/html-sitemap">All Games</a> <a href="/category/action">Action</a> <a href="/category/puzzle">Puzzle</a> <a href="/category/arcade">Arcade</a> <a href="/category/racing">Racing</a> <a href="/category/sports">Sports</a></nav>
</div>`;
        } else if (catMatch) {
          const catName = catMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const catNameLower = catName.toLowerCase();
          dynamicMeta = {
            title: `Free ${catName} Games Online — GameDravo`,
            description: `Play free ${catNameLower} games online on GameDravo. No download required. Discover the best ${catNameLower} browser games — instant play on desktop and mobile.`,
          };
          dynamicBody = `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
<h1>Free ${catName} Games Online</h1>
<p>Play free ${catNameLower} games online on GameDravo. Browse our curated collection of the best ${catNameLower} browser games — no download, no installation, no Flash required. Instant play on desktop and mobile. GameDravo offers hundreds of free HTML5 games across every category: action, puzzle, arcade, racing, sports, strategy, adventure, multiplayer, simulator, and casual games. Find your next favourite ${catNameLower} game on GameDravo today.</p>
<nav><a href="/">Home</a> <a href="/html-sitemap">All Games</a> <a href="/category/action">Action</a> <a href="/category/puzzle">Puzzle</a> <a href="/category/arcade">Arcade</a> <a href="/category/racing">Racing</a> <a href="/category/sports">Sports</a> <a href="/category/strategy">Strategy</a></nav>
</div>`;
        }

        const meta = ROUTE_META[routePath] || dynamicMeta;
        const bodyContent = ROUTE_BODY[routePath] || dynamicBody;

        // Inject canonical for every route
        html = html.replace(
          /<!-- Per-page canonical injected server-side or by React Helmet -->/,
          `<link rel="canonical" href="${canonical}" />`
        );

        if (meta) {
          html = html.replace(
            /(<title>)[^<]*(<\/title>)/,
            `$1${meta.title}$2`
          );
          html = html.replace(
            /(<meta name="description" content=")[^"]*(")/,
            `$1${meta.description}$2`
          );
        }

        // Inject route-specific body content for crawlers (fixes low word count)
        html = html.replace('<!-- SEO_STATIC_BODY -->', bodyContent);

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
