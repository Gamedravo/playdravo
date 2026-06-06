const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const CACHE_SECONDS = 60 * 60;

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

    return env.ASSETS.fetch(request);
  },
};

async function handleOnlineGamesCatalog(request: Request): Promise<Response> {
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
    const response = await fetch(ONLINE_GAMES_CATALOG_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PlayDravo-CatalogLoader/1.0',
      },
      cf: {
        cacheTtl: CACHE_SECONDS,
        cacheEverything: true,
      },
    } as RequestInit & { cf: { cacheTtl: number; cacheEverything: boolean } });

    if (!response.ok) {
      return Response.json(
        { error: 'Could not load game catalog.' },
        { status: response.status, headers: corsHeaders() },
      );
    }

    const data = await response.json();
    return Response.json(data, {
      headers: {
        ...corsHeaders(),
        'Cache-Control': `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error('OnlineGames catalog proxy failed:', error);
    return Response.json(
      { error: 'Could not load game catalog.' },
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
