import type { VercelRequest, VercelResponse } from '@vercel/node';

const GAMEPIX_CATALOG_URL = 'https://feeds.gamepix.com/v2/json/';
const CACHE_SECONDS = 60 * 60 * 6;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const requestedLimit = Number(req.query.limit || 1200);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.floor(requestedLimit), 1), 1200) : 1200;
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
      });

      if (!response.ok) {
        throw new Error(`GamePix page ${page} failed: ${response.status}`);
      }

      const feed = await response.json();
      return Array.isArray(feed?.items) ? feed.items : [];
    })
  );

  const games = pageResults.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  if (games.length === 0) {
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
  }

  return res.status(200).json(games.slice(0, limit));
}
