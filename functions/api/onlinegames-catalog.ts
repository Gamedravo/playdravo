const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const CACHE_SECONDS = 60 * 60;

export async function onRequestGet() {
  try {
    const requestInit: RequestInit & { cf?: { cacheTtl: number; cacheEverything: boolean } } = {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PlayDravo-CatalogLoader/1.0',
      },
      cf: {
        cacheTtl: CACHE_SECONDS,
        cacheEverything: true,
      },
    };

    const response = await fetch(ONLINE_GAMES_CATALOG_URL, requestInit);

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

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
