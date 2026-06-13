const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const CACHE_SECONDS = 60 * 60;
const GAMEPIX_CACHE_SECONDS = 60 * 60 * 6;

interface GameRequestSubmission {
  id: string;
  gameName: string;
  description: string;
  link: string | null;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  read: boolean;
  displayName: string;
  userEmail: string;
  createdAt: string;
}

const gameRequestSubmissions: GameRequestSubmission[] = [];

interface WorkerEnv {

  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/onlinegames-catalog') {
      return handleOnlineGamesCatalog(request);
    }

    if (url.pathname === '/api/gamepix-catalog') {
      return handleGamePixCatalog(request);
    }

    if (url.pathname === '/api/games/stats') {
      return handleGameStats(request);
    }

    if (url.pathname === '/api/game-requests' || url.pathname.startsWith('/api/game-requests/')) {
      return handleGameRequests(request, url);
    }

    return env.ASSETS.fetch(request);

  },
};

async function handleOnlineGamesCatalog(request: Request): Promise<Response> {

  return proxyJsonCatalog(request, ONLINE_GAMES_CATALOG_URL, CACHE_SECONDS, 'Could not load game catalog.');
}

async function handleGameStats(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() });
  }

  return Response.json([], {
    headers: {
      ...corsHeaders(),
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=60',
    },
  });
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
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
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
    gameRequestSubmissions.splice(50);
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

    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (body?.status === 'pending' || body?.status === 'approved' || body?.status === 'rejected') {
      existing.status = body.status;
    }
    if (typeof body?.read === 'boolean') {
      existing.read = body.read;
    }
    return Response.json(existing, { headers: noStoreJsonHeaders() });
  }

  if (request.method === 'DELETE' && requestId) {
    const index = gameRequestSubmissions.findIndex((submission) => submission.id === requestId);
    if (index === -1) {
      return Response.json({ message: 'Game request not found' }, { status: 404, headers: corsHeaders() });
    }

    gameRequestSubmissions.splice(index, 1);
    return Response.json({ ok: true }, { headers: noStoreJsonHeaders() });
  }

  return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() });
}

async function handleGamePixCatalog(request: Request): Promise<Response> {

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (request.method !== 'GET') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers: corsHeaders() });
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

async function proxyJsonCatalog(

  request: Request,
  sourceUrl: string,
  cacheSeconds: number,
  errorMessage: string,
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== 'GET') {
    return Response.json(
      { error: 'Method Not Allowed' },
      { status: 405, headers: corsHeaders() },
    );
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
      return Response.json(
        { error: errorMessage },
        { status: response.status, headers: corsHeaders() },
      );
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
    return Response.json(
      { error: errorMessage },
      { status: 502, headers: corsHeaders() },
    );
  }
}

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
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
  };
}
