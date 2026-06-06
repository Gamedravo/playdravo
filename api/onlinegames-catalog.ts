import type { VercelRequest, VercelResponse } from '@vercel/node';

const ONLINE_GAMES_CATALOG_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const CACHE_SECONDS = 60 * 60;

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

  try {
    const response = await fetch(ONLINE_GAMES_CATALOG_URL, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'PlayDravo-CatalogLoader/1.0',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Could not load game catalog.' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('OnlineGames catalog proxy failed:', error);
    return res.status(502).json({ error: 'Could not load game catalog.' });
  }
}
