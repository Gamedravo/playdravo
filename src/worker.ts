const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const CACHE_SECONDS = 60 * 60;
const GAMEPIX_CACHE_SECONDS = 60 * 60 * 6;

interface WorkerEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
}

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

interface GameStatsRecord {
  id: string;
  plays: number;
  rating: number;
  ratingCount: number;
  totalRating: number;
  updatedAt: string;
}

interface GameModSubmission {
  id: string;
  gameId: string;
  title: string;
  description: string;
  version: string;
  author: string;
  authorId: string;
  downloads: number;
  rating: number;
  thumbnail: string;
  createdAt: string;
}

interface GameRequestSubmission {
  id: string;
  gameName: string;
  description: string;
  link: string | null;
  status: SubmissionStatus;
  votes: number;
  read: boolean;
  displayName: string;
  userEmail: string;
  createdAt: string;
}

interface BugReportSubmission {
  id: string;
  gameName: string | null;
  description: string;
  email: string | null;
  read: boolean;
  createdAt: string;
}

interface ContactMessageSubmission {
  id: string;
  subject: string;
  message: string;
  email: string | null;
  read: boolean;
  createdAt: string;
}

interface ChatMessageSubmission {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

const gameStatsRecords = new Map<string, GameStatsRecord>();
const userRatings = new Map<string, number>();
const gameModSubmissions: GameModSubmission[] = [];
const gameRequestSubmissions: GameRequestSubmission[] = [];
const bugReportSubmissions: BugReportSubmission[] = [];
const contactMessageSubmissions: ContactMessageSubmission[] = [];
const chatMessageSubmissions: ChatMessageSubmission[] = [];

interface EmailUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  username: string | null;
  usernameSet: boolean;
  createdAt: string;
}
const emailUsers = new Map<string, EmailUser>();
const emailSessions = new Map<string, { userId: string; expiresAt: number }>();

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'www.gamedravo.com') {
      url.hostname = 'gamedravo.com';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/game' || url.pathname.startsWith('/game/')) {

      url.pathname = url.pathname.replace(/^\/game/, '/games');
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/robots.txt') {
      return serveSeoAsset(request, env, 'text/plain; charset=utf-8');
    }

    if (url.pathname === '/sitemap.xml') {
      return serveSeoAsset(request, env, 'application/xml; charset=utf-8');
    }

    if (url.pathname === '/api/onlinegames-catalog') {
      return handleOnlineGamesCatalog(request);
    }

    if (url.pathname === '/api/gamepix-catalog') {
      return handleGamePixCatalog(request);
    }

    if (url.pathname === '/api/check-embed') {
      return handleCheckEmbed(request);
    }

    if (url.pathname === '/api/auth/user') {
      return handleAuthUser(request);
    }

    if (url.pathname === '/api/auth/firebase/token') {
      return handleFirebaseToken(request);
    }

    if (url.pathname === '/api/user/profile') {
      return handleUserProfile(request);
    }

    if (url.pathname === '/api/games/stats') {
      return handleGameStats(request);
    }

    if (url.pathname.startsWith('/api/games/')) {
      return handleGameRoutes(request, url);
    }

    if (url.pathname === '/api/game-requests' || url.pathname.startsWith('/api/game-requests/')) {
      return handleGameRequests(request, url);
    }

    if (url.pathname === '/api/bug-reports' || url.pathname.startsWith('/api/bug-reports/')) {
      return handleBugReports(request, url);
    }

    if (url.pathname === '/api/contact-messages' || url.pathname.startsWith('/api/contact-messages/')) {
      return handleContactMessages(request, url);
    }

    if (url.pathname === '/api/game-reports') {
      return handleGameReports(request);
    }

    if (url.pathname === '/api/chat') {
      return handleChat(request);
    }

    if (url.pathname.startsWith('/api/auth/email/')) {
      return handleEmailAuth(request, url);
    }

    if (url.pathname === '/api/logout') {
      return handleLogout(request);
    }

    if (url.pathname === '/api/admin/oauth-status') {
      return handleOAuthStatus(env);
    }

    if (url.pathname === '/api/auth/google' || url.pathname === '/api/auth/google/callback') {
      try {
        return await handleOAuthGoogle(request, url, env);
      } catch (err) {
        console.error('[Worker] handleOAuthGoogle threw:', err instanceof Error ? err.stack : String(err));
        return new Response(null, { status: 302, headers: { Location: `/?oauth_error=${encodeURIComponent('Google sign-in failed. Please try again.')}` } });
      }
    }

    if (url.pathname === '/api/auth/github' || url.pathname === '/api/auth/github/callback') {
      try {
        return await handleOAuthGithub(request, url, env);
      } catch (err) {
        console.error('[Worker] handleOAuthGithub threw:', err instanceof Error ? err.stack : String(err));
        return new Response(null, { status: 302, headers: { Location: `/?oauth_error=${encodeURIComponent('GitHub sign-in failed. Please try again.')}` } });
      }
    }

    if (url.pathname === '/api/auth/microsoft' || url.pathname === '/api/auth/microsoft/callback') {
      try {
        return await handleOAuthMicrosoft(request, url, env);
      } catch (err) {
        console.error('[Worker] handleOAuthMicrosoft threw:', err instanceof Error ? err.stack : String(err));
        return new Response(null, { status: 302, headers: { Location: `/?oauth_error=${encodeURIComponent('Microsoft sign-in failed. Please try again.')}` } });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ message: 'API route not found' }, { status: 404, headers: noStoreJsonHeaders() });
    }

    return serveStaticAsset(request, env);
  },
};

async function serveSeoAsset(request: Request, env: WorkerEnv, contentType: string): Promise<Response> {
  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  headers.set('Content-Type', contentType);
  headers.set('Cache-Control', 'public, max-age=3600');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function serveStaticAsset(request: Request, env: WorkerEnv): Promise<Response> {
  const response = await env.ASSETS.fetch(request);
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  const isHtml = url.pathname === '/' || headers.get('Content-Type')?.includes('text/html');

  if (/\.(?:js|css|mjs|woff2?|png|jpe?g|webp|gif|svg|ico)$/i.test(url.pathname)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (isHtml) {
    headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
  }

  if (isHtml && response.ok) {
    const html = await response.text();
    return new Response(injectSeoHtml(html, url.pathname), { status: response.status, statusText: response.statusText, headers });
  }

  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const SITE_ORIGIN = 'https://gamedravo.com';

const STATIC_ROUTE_META: Record<string, { title: string; description: string; h1: string }> = {
  '/': {
    title: 'GameDravo – Play Free Browser Games Instantly, No Download',
    description: 'Play free browser games instantly on GameDravo. Discover action, puzzle, arcade, racing, sports, strategy, and mobile HTML5 games with no download required.',
    h1: 'GameDravo — Free Browser Games',
  },
  '/about': {
    title: 'About GameDravo | Free Instant Browser Games',
    description: 'Learn about GameDravo, a lightweight futuristic portal for free instant no-download browser games across action, puzzle, arcade, sports, strategy, and more.',
    h1: 'About GameDravo',
  },
  '/contact': {
    title: 'Contact GameDravo | Get in Touch',
    description: 'Contact the GameDravo team for support, partnerships, game submissions, bug reports, or general enquiries about our browser gaming platform.',
    h1: 'Contact GameDravo',
  },
  '/support': {
    title: 'Support | GameDravo',
    description: 'Get help with GameDravo, report issues, request games, and find support for your free browser gaming experience.',
    h1: 'GameDravo Support',
  },
  '/submit-game': {
    title: 'Submit a Game | GameDravo',
    description: 'Submit your HTML5 browser game to GameDravo for review and potential listing on our free instant-play gaming platform.',
    h1: 'Submit a Game to GameDravo',
  },
  '/privacy': {
    title: 'Privacy Policy | GameDravo',
    description: 'Read the GameDravo Privacy Policy to understand how we collect, use, and protect personal data on our free browser gaming platform.',
    h1: 'Privacy Policy — GameDravo',
  },
  '/terms': {
    title: 'Terms of Service | GameDravo',
    description: 'Review the GameDravo Terms of Service, including rules and guidelines for using our free browser gaming platform.',
    h1: 'Terms of Service — GameDravo',
  },
  '/cookies': {
    title: 'Cookie Policy | GameDravo',
    description: 'Learn how GameDravo uses cookies to save preferences, improve performance, and keep our free browser gaming platform secure.',
    h1: 'Cookie Policy — GameDravo',
  },
  '/html-sitemap': {
    title: 'Game Index | GameDravo',
    description: 'Browse the GameDravo game index and discover free browser games by title and category.',
    h1: 'GameDravo Game Index',
  },
  '/status': {
    title: 'System Status | GameDravo',
    description: 'Check GameDravo system status, platform availability, and browser game service health.',
    h1: 'GameDravo System Status',
  },
  '/report-bug': {
    title: 'Report a Bug | GameDravo',
    description: 'Report bugs, broken games, or technical issues to help improve the GameDravo browser gaming experience.',
    h1: 'Report a GameDravo Bug',
  },
};

function injectSeoHtml(html: string, rawPath: string): string {
  const path = normalizePath(rawPath);
  const gameSlug = path.match(/^\/games\/([^/?#]+)$/)?.[1];
  const categorySlug = path.match(/^\/category\/([^/?#]+)$/)?.[1];
  const supportSlug = path.match(/^\/support\/([^/?#]+)$/)?.[1];
  const canonicalPath = path === '/' ? '/' : path.replace(/\/+$/, '');
  const canonical = `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`;

  let meta = STATIC_ROUTE_META[canonicalPath];
  let body = '';
  let type = 'website';

  if (gameSlug) {
    const name = titleFromSlug(gameSlug);
    meta = {
      title: `${name} – Play Online Free | GameDravo`,
      description: `Play ${name} free online on GameDravo. No download, no sign-up, instant HTML5 browser gameplay on desktop and mobile.`,
      h1: `Play ${name} Online Free`,
    };
    type = 'game';
    body = staticSeoBody(meta.h1, `${name} is a free browser game on GameDravo. Play instantly with no download or installation. Explore more action, puzzle, arcade, racing, sports, strategy, multiplayer, and mobile games across GameDravo.`, ['/html-sitemap', '/category/action', '/category/puzzle', '/category/racing', '/category/sports']);
  } else if (categorySlug) {
    const name = titleFromSlug(categorySlug);
    meta = {
      title: `${name} Games – Free Online ${name} Games | GameDravo`,
      description: `Play free ${name.toLowerCase()} games online on GameDravo. No download required — instant browser gameplay on desktop and mobile.`,
      h1: `Free ${name} Games Online`,
    };
    body = staticSeoBody(meta.h1, `Browse free ${name.toLowerCase()} games on GameDravo. Play instantly in your browser with no download, no Flash, and no installation.`, ['/', '/html-sitemap', '/category/action', '/category/puzzle', '/category/racing', '/category/sports']);
  } else if (supportSlug) {
    const name = titleFromSlug(supportSlug);
    meta = {
      title: `${name} Support | GameDravo`,
      description: `Read GameDravo support guidance for ${name.toLowerCase()} and get help with your browser gaming experience.`,
      h1: `${name} Support`,
    };
  }

  if (!meta) return html;

  if (!body) {
    body = staticSeoBody(meta.h1, meta.description, ['/', '/html-sitemap', '/about', '/contact', '/support']);
  }

  const escapedTitle = escapeHtml(meta.title);
  const escapedDescription = escapeHtml(meta.description);
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapedDescription}" />`)
    .replace(/<!-- Per-page canonical injected server-side or by React Helmet -->/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<!-- SEO_STATIC_BODY -->', body);

  const socialTags = [
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="GameDravo" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${SITE_ORIGIN}/logo.svg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    `<meta name="twitter:image" content="${SITE_ORIGIN}/logo.svg" />`,
    buildJsonLd(meta, canonical, type),
  ].join('\n');

  return html.replace('</head>', `${socialTags}\n</head>`);
}

function normalizePath(path: string): string {
  const cleaned = decodeURIComponent(path.split('?')[0] || '/');
  return cleaned.length > 1 ? cleaned.replace(/\/+$/, '') : '/';
}

function titleFromSlug(slug: string): string {
  return slug.replace(/^gamepix-/, '').replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function staticSeoBody(h1: string, text: string, links: string[]): string {
  const nav = links.map((href) => `<a href="${href}">${titleFromSlug(href.split('/').filter(Boolean).pop() || 'home')}</a>`).join(' ');
  return `<div style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true"><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(text)}</p><nav>${nav}</nav></div>`;
}

function buildJsonLd(meta: { title: string; description: string }, canonical: string, type: string): string {
  const schema = type === 'game'
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: meta.title.replace(' – Play Online Free | GameDravo', ''),
        description: meta.description,
        url: canonical,
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web Browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: 'GameDravo', url: SITE_ORIGIN },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: meta.title,
        description: meta.description,
        url: canonical,
        isPartOf: { '@type': 'WebSite', name: 'GameDravo', url: SITE_ORIGIN },
      };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

async function handleOnlineGamesCatalog(request: Request): Promise<Response> {

  return proxyJsonCatalog(request, ONLINE_GAMES_CATALOG_URL, CACHE_SECONDS, 'Could not load game catalog.');
}

async function handleGamePixCatalog(request: Request): Promise<Response> {

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return methodNotAllowed();
  }

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') || 600);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 600) : 600;
  const pageSize = 200;
  const maxPages = Math.ceil(limit / pageSize);

  const pageResults = await Promise.allSettled(
    Array.from({ length: maxPages }, async (_unused, index) => {
      const page = index + 1;
      const response = await fetch(`${GAMEPIX_CATALOG_URL}?order=quality&page=${page}&pagination=${pageSize}&sid=1`, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'GameDravo-CatalogLoader/1.0',
        },
        cf: {
          cacheTtl: GAMEPIX_CACHE_SECONDS,
          cacheEverything: true,
        },
      } as RequestInit & { cf: { cacheTtl: number; cacheEverything: boolean } });

      if (!response.ok) throw new Error(`GamePix page ${page} failed: ${response.status}`);
      const feed = await response.json();
      return Array.isArray(feed?.items) ? feed.items : [];
    })
  );

  const games = pageResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  const cacheSeconds = games.length > 0 ? GAMEPIX_CACHE_SECONDS : 60;

  return Response.json(games.slice(0, limit), {
    headers: {
      ...corsHeaders(),
      'Cache-Control': `public, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`,
    },
  });
}

async function handleCheckEmbed(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  const body = await readJsonBody(request);
  const targetUrl = cleanText(body?.url, 2000);
  if (!targetUrl) {
    return Response.json({ error: 'Missing URL' }, { status: 400, headers: corsHeaders() });
  }

  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return Response.json({ error: 'Invalid URL' }, { status: 400, headers: corsHeaders() });
    }

    const checkRes = await fetch(parsed.toString(), {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GameDravoBot/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml',
      },
    });

    const xFrameOptions = checkRes.headers.get('x-frame-options')?.toLowerCase();
    const csp = checkRes.headers.get('content-security-policy')?.toLowerCase();
    let isBlocked = false;
    let reason = '';

    if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin') {
      isBlocked = true;
      reason = `Blocked by X-Frame-Options: ${xFrameOptions}`;
    } else if (csp && (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'"))) {
      isBlocked = true;
      reason = 'Blocked by Content-Security-Policy: frame-ancestors';
    }

    return Response.json({ embeddable: !isBlocked, reason, status: checkRes.status }, { headers: noStoreJsonHeaders() });
  } catch (error) {
    return Response.json({ embeddable: true, reason: error instanceof Error ? error.message : 'Embed check failed', error: true }, { headers: noStoreJsonHeaders() });
  }
}

async function handleAuthUser(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return methodNotAllowed();
  }

  const cookies = parseCookies(request);
  const sessionId = cookies['gd_session'];
  if (sessionId) {
    const session = emailSessions.get(sessionId);
    if (session && session.expiresAt > Date.now()) {
      const user = emailUsers.get(session.userId);
      if (user) {
        const { passwordHash: _, ...safe } = user;
        return Response.json(safe, { headers: noStoreJsonHeaders() });
      }
    }
  }

  return Response.json(null, { status: 401, headers: noStoreJsonHeaders() });
}

async function handleFirebaseToken(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  const body = await readJsonBody(request);
  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== 'string') {
    return Response.json({ message: 'idToken is required' }, { status: 400, headers: noStoreJsonHeaders() });
  }

  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyDSGAiHaQnDwPJILJBUCySQOs-WuCSTXG0`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      return Response.json({ message: 'Invalid or expired token' }, { status: 401, headers: noStoreJsonHeaders() });
    }

    const data = await verifyRes.json();
    const fbUser = data?.users?.[0];
    if (!fbUser) {
      return Response.json({ message: 'Token verification failed' }, { status: 401, headers: noStoreJsonHeaders() });
    }

    return Response.json({
      ok: true,
      user: {
        uid: fbUser.localId,
        email: fbUser.email || null,
        displayName: fbUser.displayName || null,
        photoURL: fbUser.photoUrl || null,
      },
    }, { headers: noStoreJsonHeaders() });
  } catch {
    return Response.json({ message: 'Token verification error' }, { status: 500, headers: noStoreJsonHeaders() });
  }
}

async function handleUserProfile(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'PATCH') {
    return methodNotAllowed();
  }

  const body = await readJsonBody(request);
  return Response.json({
    id: cleanText(body?._userId, 120) || 'local-user',
    ...body,
    updatedAt: new Date().toISOString(),
  }, { headers: noStoreJsonHeaders() });
}

async function handleGameStats(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return methodNotAllowed();
  }

  return Response.json(Array.from(gameStatsRecords.values()), {
    headers: {
      ...corsHeaders(),
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
    },
  });
}

async function handleGameRoutes(request: Request, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const match = url.pathname.match(/^\/api\/games\/([^/]+)\/(play|rating|rate|mods)$/);
  if (!match) {
    return Response.json({ message: 'Game API route not found' }, { status: 404, headers: noStoreJsonHeaders() });
  }

  const gameId = decodeURIComponent(match[1]);
  const action = match[2];

  if (request.method === 'POST' && action === 'play') {
    const stats = getOrCreateStats(gameId);
    stats.plays += 1;
    stats.updatedAt = new Date().toISOString();
    return Response.json({ ok: true }, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'GET' && action === 'rating') {
    const rating = userRatings.get(gameId);
    return Response.json(rating ? { gameId, value: rating } : null, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST' && action === 'rate') {
    const body = await readJsonBody(request);
    const value = Number(body?.value);
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return Response.json({ message: 'Rating must be 1-5' }, { status: 400, headers: corsHeaders() });
    }

    const stats = getOrCreateStats(gameId);
    const existing = userRatings.get(gameId);
    if (existing) {
      stats.totalRating = stats.totalRating - existing + value;
    } else {
      stats.ratingCount += 1;
      stats.totalRating += value;
    }
    stats.rating = Number((stats.totalRating / Math.max(stats.ratingCount, 1)).toFixed(1));
    stats.updatedAt = new Date().toISOString();
    userRatings.set(gameId, value);

    return Response.json({ rating: stats.rating, ratingCount: stats.ratingCount, userRating: value }, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'GET' && action === 'mods') {
    return Response.json(
      gameModSubmissions.filter((mod) => mod.gameId === gameId).sort((a, b) => b.downloads - a.downloads),
      { headers: noStoreJsonHeaders() },
    );
  }

  if (request.method === 'POST' && action === 'mods') {
    const body = await readJsonBody(request);
    const title = cleanText(body?.title, 120);
    if (!title) {
      return Response.json({ message: 'Title is required' }, { status: 400, headers: corsHeaders() });
    }

    const id = crypto.randomUUID();
    const mod: GameModSubmission = {
      id,
      gameId,
      title,
      description: cleanText(body?.description, 1000) || '',
      version: cleanText(body?.version, 40) || 'v1.0.0',
      author: 'GameDravo Player',
      authorId: 'local-user',
      downloads: 0,
      rating: 5,
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(id)}/200/200`,
      createdAt: new Date().toISOString(),
    };

    gameModSubmissions.unshift(mod);
    trimCollection(gameModSubmissions, 100);
    return Response.json(mod, { status: 201, headers: noStoreJsonHeaders() });
  }

  return methodNotAllowed();
}

async function handleGameRequests(request: Request, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const requestId = url.pathname.match(/^\/api\/game-requests\/([^/]+)/)?.[1];

  if (request.method === 'GET' && !requestId) {
    return Response.json(gameRequestSubmissions, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST' && !requestId) {
    const body = await readJsonBody(request);
    const gameName = cleanText(body?.gameName, 120);
    if (!gameName) {
      return Response.json({ message: 'Game name is required' }, { status: 400, headers: corsHeaders() });
    }

    const submission: GameRequestSubmission = {
      id: crypto.randomUUID(),
      gameName,
      description: cleanText(body?.description, 1000) || '',
      link: cleanText(body?.link, 500) || null,
      status: 'pending',
      votes: 0,
      read: false,
      displayName: 'GameDravo Player',
      userEmail: '',
      createdAt: new Date().toISOString(),
    };

    gameRequestSubmissions.unshift(submission);
    trimCollection(gameRequestSubmissions, 50);
    return Response.json(submission, { status: 201, headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST' && requestId && url.pathname.endsWith('/vote')) {
    const existing = gameRequestSubmissions.find((submission) => submission.id === requestId);
    if (!existing) {
      return Response.json({ message: 'Game request not found' }, { status: 404, headers: corsHeaders() });
    }

    existing.votes += 1;
    return Response.json(existing, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'PATCH' && requestId) {
    const existing = gameRequestSubmissions.find((submission) => submission.id === requestId);
    if (!existing) {
      return Response.json({ message: 'Game request not found' }, { status: 404, headers: corsHeaders() });
    }

    const body = await readJsonBody(request);
    updateReadAndStatus(existing, body);
    return Response.json(existing, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'DELETE' && requestId) {
    return deleteFromCollection(gameRequestSubmissions, requestId, 'Game request not found');
  }

  return methodNotAllowed();
}

async function handleBugReports(request: Request, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const id = url.pathname.match(/^\/api\/bug-reports\/([^/]+)/)?.[1];

  if (request.method === 'GET' && !id) {
    return Response.json(bugReportSubmissions, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST' && !id) {
    const body = await readJsonBody(request);
    const description = cleanText(body?.description, 2000);
    if (!description) {
      return Response.json({ message: 'Description is required' }, { status: 400, headers: corsHeaders() });
    }

    const report: BugReportSubmission = {
      id: crypto.randomUUID(),
      gameName: cleanText(body?.gameName, 120) || null,
      description,
      email: cleanText(body?.email, 320) || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    bugReportSubmissions.unshift(report);
    trimCollection(bugReportSubmissions, 100);
    return Response.json(report, { status: 201, headers: noStoreJsonHeaders() });
  }

  if (request.method === 'PATCH' && id) {
    const existing = bugReportSubmissions.find((report) => report.id === id);
    if (!existing) {
      return Response.json({ message: 'Bug report not found' }, { status: 404, headers: corsHeaders() });
    }

    const body = await readJsonBody(request);
    if (typeof body?.read === 'boolean') existing.read = body.read;
    return Response.json(existing, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'DELETE' && id) {
    return deleteFromCollection(bugReportSubmissions, id, 'Bug report not found');
  }

  return methodNotAllowed();
}

async function handleContactMessages(request: Request, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const id = url.pathname.match(/^\/api\/contact-messages\/([^/]+)/)?.[1];

  if (request.method === 'GET' && !id) {
    return Response.json(contactMessageSubmissions, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST' && !id) {
    const body = await readJsonBody(request);
    const subject = cleanText(body?.subject, 200);
    const message = cleanText(body?.message, 3000);
    if (!subject || !message) {
      return Response.json({ message: 'Subject and message are required' }, { status: 400, headers: corsHeaders() });
    }

    const submission: ContactMessageSubmission = {
      id: crypto.randomUUID(),
      subject,
      message,
      email: cleanText(body?.email, 320) || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    contactMessageSubmissions.unshift(submission);
    trimCollection(contactMessageSubmissions, 100);
    return Response.json(submission, { status: 201, headers: noStoreJsonHeaders() });
  }

  if (request.method === 'PATCH' && id) {
    const existing = contactMessageSubmissions.find((message) => message.id === id);
    if (!existing) {
      return Response.json({ message: 'Contact message not found' }, { status: 404, headers: corsHeaders() });
    }

    const body = await readJsonBody(request);
    if (typeof body?.read === 'boolean') existing.read = body.read;
    return Response.json(existing, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'DELETE' && id) {
    return deleteFromCollection(contactMessageSubmissions, id, 'Contact message not found');
  }

  return methodNotAllowed();
}

async function handleGameReports(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'POST') {
    return methodNotAllowed();
  }

  const body = await readJsonBody(request);
  const reason = cleanText(body?.reason, 2000);
  if (!reason) {
    return Response.json({ message: 'Reason is required' }, { status: 400, headers: corsHeaders() });
  }

  return Response.json({
    id: crypto.randomUUID(),
    gameId: cleanText(body?.gameId, 160) || '',
    gameTitle: cleanText(body?.gameTitle, 200) || null,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }, { status: 201, headers: noStoreJsonHeaders() });
}

async function handleChat(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method === 'GET') {
    return Response.json(chatMessageSubmissions.slice(-50), { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'POST') {
    const body = await readJsonBody(request);
    const text = cleanText(body?.text, 1000);
    if (!text) {
      return Response.json({ message: 'Text is required' }, { status: 400, headers: corsHeaders() });
    }

    const message: ChatMessageSubmission = {
      id: crypto.randomUUID(),
      userId: 'local-user',
      displayName: 'GameDravo Player',
      text,
      createdAt: new Date().toISOString(),
    };

    chatMessageSubmissions.push(message);
    if (chatMessageSubmissions.length > 50) chatMessageSubmissions.shift();
    return Response.json(message, { status: 201, headers: noStoreJsonHeaders() });
  }

  return methodNotAllowed();
}

function handleOAuthStatus(env: WorkerEnv): Response {
  return Response.json({
    google: { clientId: !!env.GOOGLE_CLIENT_ID, clientSecret: !!env.GOOGLE_CLIENT_SECRET },
    github: { clientId: !!env.GITHUB_CLIENT_ID, clientSecret: !!env.GITHUB_CLIENT_SECRET },
    microsoft: { clientId: !!env.MICROSOFT_CLIENT_ID, clientSecret: !!env.MICROSOFT_CLIENT_SECRET },
  }, { headers: noStoreJsonHeaders() });
}

function handleLogout(request: Request): Response {
  const cookies = parseCookies(request);
  const sessionId = cookies['gd_session'];
  if (sessionId) emailSessions.delete(sessionId);
  const headers = new Headers({ Location: '/' });
  headers.append('Set-Cookie', 'gd_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  headers.append('Set-Cookie', 'connect.sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return new Response(null, { status: 302, headers });
}

function oauthRedirect(_url: string, errorMsg: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: `/?oauth_error=${encodeURIComponent(errorMsg)}` },
  });
}

function oauthInitResponse(redirectUrl: string, state: string): Response {
  const maxAge = 10 * 60;
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    },
  });
}

function oauthSuccessResponse(sessionId: string): Response {
  const maxAge = 7 * 24 * 60 * 60;
  const headers = new Headers({ Location: '/' });
  headers.append('Set-Cookie', `gd_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`);
  headers.append('Set-Cookie', `oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return new Response(null, { status: 302, headers });
}

function upsertOAuthWorkerUser(provider: string, oauthId: string, email: string | null, displayName: string | null, photoUrl: string | null): string {
  const id = `${provider}_${oauthId}`;
  const fallback = displayName || (email ? email.split('@')[0] : 'Player');
  const existing = emailUsers.get(id);
  if (existing) {
    if (displayName) existing.displayName = displayName;
    emailUsers.set(id, existing);
  } else {
    emailUsers.set(id, {
      id,
      email: email || '',
      passwordHash: '',
      displayName: fallback,
      username: null,
      usernameSet: false,
      createdAt: new Date().toISOString(),
    });
  }
  const sessionId = crypto.randomUUID();
  emailSessions.set(sessionId, { userId: id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return sessionId;
}

async function handleOAuthGoogle(request: Request, url: URL, env: WorkerEnv): Promise<Response> {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const base = `${url.protocol}//${url.host}`;

  if (url.pathname === '/api/auth/google') {
    if (!clientId) {
      return oauthRedirect('/', 'Google OAuth is not configured.');
    }
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: `${base}/api/auth/google/callback`,
      scope: 'openid email profile',
      state,
      access_type: 'online',
    });
    return oauthInitResponse(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, state);
  }

  if (url.pathname === '/api/auth/google/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const cookies = parseCookies(request);
    const savedState = cookies['oauth_state'];

    if (error) return oauthRedirect('/', String(error));
    if (!code || !state || state !== savedState) {
      return oauthRedirect('/', 'OAuth state mismatch. Please try again.');
    }
    if (!clientId || !clientSecret) {
      return oauthRedirect('/', 'Google OAuth is not configured.');
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: `${base}/api/auth/google/callback`, grant_type: 'authorization_code' }),
      });
      const tokenData = await tokenRes.json() as any;
      if (tokenData.error || !tokenData.access_token) {
        return oauthRedirect('/', tokenData.error_description || tokenData.error || 'Token exchange failed');
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json() as any;

      const sessionId = upsertOAuthWorkerUser('google', String(profile.id || Date.now()), profile.email || null, profile.name || null, profile.picture || null);
      return oauthSuccessResponse(sessionId);
    } catch {
      return oauthRedirect('/', 'Google sign-in failed. Please try again.');
    }
  }

  return Response.json({ message: 'Not found' }, { status: 404 });
}

async function handleOAuthGithub(request: Request, url: URL, env: WorkerEnv): Promise<Response> {
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  const base = `${url.protocol}//${url.host}`;

  if (url.pathname === '/api/auth/github') {
    if (!clientId) {
      return oauthRedirect('/', 'GitHub OAuth is not configured.');
    }
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${base}/api/auth/github/callback`,
      scope: 'read:user user:email',
      state,
    });
    return oauthInitResponse(`https://github.com/login/oauth/authorize?${params}`, state);
  }

  if (url.pathname === '/api/auth/github/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const cookies = parseCookies(request);
    const savedState = cookies['oauth_state'];

    if (error) return oauthRedirect('/', String(error));
    if (!code || !state || state !== savedState) {
      return oauthRedirect('/', 'OAuth state mismatch. Please try again.');
    }
    if (!clientId || !clientSecret) {
      return oauthRedirect('/', 'GitHub OAuth is not configured.');
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${base}/api/auth/github/callback` }),
      });
      const tokenData = await tokenRes.json() as any;
      if (tokenData.error || !tokenData.access_token) {
        return oauthRedirect('/', tokenData.error_description || tokenData.error || 'Token exchange failed');
      }

      const headers = { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' };
      const [userRes, emailsRes] = await Promise.all([
        fetch('https://api.github.com/user', { headers }),
        fetch('https://api.github.com/user/emails', { headers }),
      ]);
      const ghUser = await userRes.json() as any;
      const emailList = await emailsRes.json() as any;
      const primaryEmail: string | null = ghUser.email || (Array.isArray(emailList) ? (emailList.find((e: any) => e.primary && e.verified)?.email ?? null) : null);

      const sessionId = upsertOAuthWorkerUser('github', String(ghUser.id), primaryEmail, ghUser.name || ghUser.login || null, ghUser.avatar_url || null);
      return oauthSuccessResponse(sessionId);
    } catch {
      return oauthRedirect('/', 'GitHub sign-in failed. Please try again.');
    }
  }

  return Response.json({ message: 'Not found' }, { status: 404 });
}

async function handleOAuthMicrosoft(request: Request, url: URL, env: WorkerEnv): Promise<Response> {
  const clientId = env.MICROSOFT_CLIENT_ID;
  const clientSecret = env.MICROSOFT_CLIENT_SECRET;
  const base = `${url.protocol}//${url.host}`;

  if (url.pathname === '/api/auth/microsoft') {
    if (!clientId) {
      return oauthRedirect('/', 'Microsoft OAuth is not configured.');
    }
    const state = crypto.randomUUID();
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: `${base}/api/auth/microsoft/callback`,
      scope: 'openid email profile User.Read',
      state,
      response_mode: 'query',
    });
    return oauthInitResponse(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`, state);
  }

  if (url.pathname === '/api/auth/microsoft/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDesc = url.searchParams.get('error_description');
    const cookies = parseCookies(request);
    const savedState = cookies['oauth_state'];

    if (error) return oauthRedirect('/', String(errorDesc || error));
    if (!code || !state || state !== savedState) {
      return oauthRedirect('/', 'OAuth state mismatch. Please try again.');
    }
    if (!clientId || !clientSecret) {
      return oauthRedirect('/', 'Microsoft OAuth is not configured.');
    }

    try {
      const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: `${base}/api/auth/microsoft/callback`, grant_type: 'authorization_code', scope: 'openid email profile User.Read' }),
      });
      const tokenData = await tokenRes.json() as any;
      if (tokenData.error || !tokenData.access_token) {
        return oauthRedirect('/', tokenData.error_description || tokenData.error || 'Token exchange failed');
      }

      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/json' },
      });
      const profile = await profileRes.json() as any;
      const email: string | null = profile.mail || profile.userPrincipalName || null;

      const sessionId = upsertOAuthWorkerUser('microsoft', String(profile.id || Date.now()), email, profile.displayName || null, null);
      return oauthSuccessResponse(sessionId);
    } catch {
      return oauthRedirect('/', 'Microsoft sign-in failed. Please try again.');
    }
  }

  return Response.json({ message: 'Not found' }, { status: 404 });
}

async function proxyJsonCatalog(
  request: Request,
  sourceUrl: string,
  cacheSeconds: number,
  errorMessage: string,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return methodNotAllowed();
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'GameDravo-CatalogLoader/1.0',
      },
      cf: {
        cacheTtl: cacheSeconds,
        cacheEverything: true,
      },
    } as RequestInit & { cf: { cacheTtl: number; cacheEverything: boolean } });

    if (!response.ok) {
      return Response.json({ error: errorMessage }, { status: response.status, headers: corsHeaders() });
    }

    const data = await response.json();
    return Response.json(data, {
      headers: {
        ...corsHeaders(),
        'Cache-Control': `public, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds}`,
      },
    });
  } catch (error) {
    console.error('Catalog proxy failed:', error);
    return Response.json({ error: errorMessage }, { status: 502, headers: corsHeaders() });
  }
}

async function handleEmailAuth(request: Request, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const action = url.pathname.replace('/api/auth/email/', '');

  if (action === 'register' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const email = cleanText(body?.email, 200)?.toLowerCase();
    const password = typeof body?.password === 'string' ? body.password : '';
    const username = cleanText(body?.username, 40);
    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400, headers: noStoreJsonHeaders() });
    }
    if (password.length < 6) {
      return Response.json({ message: 'Password must be at least 6 characters' }, { status: 400, headers: noStoreJsonHeaders() });
    }
    const existing = [...emailUsers.values()].find(u => u.email === email);
    if (existing) {
      return Response.json({ message: 'An account with this email already exists' }, { status: 409, headers: noStoreJsonHeaders() });
    }
    const passwordHash = await hashPasswordCrypto(password);
    const displayName = username || email.split('@')[0];
    const id = crypto.randomUUID();
    const user: EmailUser = { id, email, passwordHash, displayName, username: username || null, usernameSet: !!username, createdAt: new Date().toISOString() };
    emailUsers.set(id, user);
    const sessionId = crypto.randomUUID();
    emailSessions.set(sessionId, { userId: id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const { passwordHash: _, ...safe } = user;
    const headers = { ...noStoreJsonHeaders(), 'Set-Cookie': `gd_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}` };
    return Response.json({ ok: true, user: safe }, { headers });
  }

  if (action === 'login' && request.method === 'POST') {
    const body = await readJsonBody(request);
    const email = cleanText(body?.email, 200)?.toLowerCase();
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) {
      return Response.json({ message: 'Email and password are required' }, { status: 400, headers: noStoreJsonHeaders() });
    }
    const user = [...emailUsers.values()].find(u => u.email === email);
    if (!user || !user.passwordHash) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401, headers: noStoreJsonHeaders() });
    }
    const valid = await verifyPasswordCrypto(password, user.passwordHash);
    if (!valid) {
      return Response.json({ message: 'Invalid email or password' }, { status: 401, headers: noStoreJsonHeaders() });
    }
    const sessionId = crypto.randomUUID();
    emailSessions.set(sessionId, { userId: user.id, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const { passwordHash: _, ...safe } = user;
    const headers = { ...noStoreJsonHeaders(), 'Set-Cookie': `gd_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}` };
    return Response.json({ ok: true, user: safe }, { headers });
  }

  if (action === 'logout' && request.method === 'POST') {
    const cookies = parseCookies(request);
    const sessionId = cookies['gd_session'];
    if (sessionId) emailSessions.delete(sessionId);
    const headers = { ...noStoreJsonHeaders(), 'Set-Cookie': 'gd_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' };
    return Response.json({ ok: true }, { headers });
  }

  if (action === 'me' && request.method === 'GET') {
    const cookies = parseCookies(request);
    const sessionId = cookies['gd_session'];
    if (!sessionId) return Response.json({ message: 'Not authenticated' }, { status: 401, headers: noStoreJsonHeaders() });
    const session = emailSessions.get(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      return Response.json({ message: 'Not authenticated' }, { status: 401, headers: noStoreJsonHeaders() });
    }
    const user = emailUsers.get(session.userId);
    if (!user) return Response.json({ message: 'User not found' }, { status: 401, headers: noStoreJsonHeaders() });
    const { passwordHash: _, ...safe } = user;
    return Response.json(safe, { headers: noStoreJsonHeaders() });
  }

  return Response.json({ message: 'API route not found' }, { status: 404, headers: noStoreJsonHeaders() });
}

async function hashPasswordCrypto(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, keyMaterial, 256);
  const toHex = (buf: Uint8Array) => Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${toHex(salt)}.${toHex(new Uint8Array(derived))}`;
}

async function verifyPasswordCrypto(password: string, stored: string): Promise<boolean> {
  try {
    const [saltHex, hashHex] = stored.split('.');
    if (!saltHex || !hashHex) return false;
    const salt = new Uint8Array((saltHex.match(/.{2}/g) || []).map(h => parseInt(h, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' }, keyMaterial, 256);
    const computedHex = Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computedHex === hashHex;
  } catch {
    return false;
  }
}

function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get('Cookie') || '';
  return Object.fromEntries(
    header.split(';')
      .map(c => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k.trim(), v.join('=').trim()])
  );
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

function getOrCreateStats(gameId: string): GameStatsRecord {
  const existing = gameStatsRecords.get(gameId);
  if (existing) return existing;

  const record: GameStatsRecord = {
    id: gameId,
    plays: 0,
    rating: 0,
    ratingCount: 0,
    totalRating: 0,
    updatedAt: new Date().toISOString(),
  };
  gameStatsRecords.set(gameId, record);
  return record;
}

function updateReadAndStatus(target: { read: boolean; status: SubmissionStatus }, body: Record<string, unknown> | null): void {
  if (body?.status === 'pending' || body?.status === 'approved' || body?.status === 'rejected') {
    target.status = body.status;
  }
  if (typeof body?.read === 'boolean') {
    target.read = body.read;
  }
}

function deleteFromCollection<T extends { id: string }>(collection: T[], id: string, notFoundMessage: string): Response {
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) {
    return Response.json({ message: notFoundMessage }, { status: 404, headers: corsHeaders() });
  }

  collection.splice(index, 1);
  return Response.json({ ok: true }, { headers: noStoreJsonHeaders() });
}

function trimCollection(collection: unknown[], maxItems: number): void {
  collection.splice(maxItems);
}

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function methodNotAllowed(): Response {
  return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() });
}

function noStoreJsonHeaders(): Record<string, string> {
  return {
    ...corsHeaders(),
    'Cache-Control': 'no-store',
  };
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Robots-Tag': 'noindex, nofollow',
  };
}
