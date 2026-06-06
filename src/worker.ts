const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const CACHE_SECONDS = 60 * 60;
const GAMEPIX_CACHE_SECONDS = 60 * 60 * 6;

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

    return env.ASSETS.fetch(request);

  },
};

async function handleOnlineGamesCatalog(request: Request): Promise<Response> {
  return proxyJsonCatalog(request, ONLINE_GAMES_CATALOG_URL, CACHE_SECONDS, 'Could not load game catalog.');
}

async function handleGamePixCatalog(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') || 1000);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 1000) : 1000;
  const sourceUrl = `${GAMEPIX_CATALOG_URL}?order=quality&page=1&pagination=${limit}&sid=1`;
  const response = await proxyJsonCatalog(request, sourceUrl, GAMEPIX_CACHE_SECONDS, 'Could not load GamePix catalog.');

  if (!response.ok || request.method !== 'GET') return response;

  const feed = await response.json();
  return Response.json(Array.isArray(feed?.items) ? feed.items : [], {
    headers: {
      ...corsHeaders(),
      'Cache-Control': `public, max-age=${GAMEPIX_CACHE_SECONDS}, stale-while-revalidate=${GAMEPIX_CACHE_SECONDS}`,
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
        'User-Agent': 'PlayDravo-CatalogLoader/1.0',
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

function corsHeaders(): Record<string, string> {

  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
