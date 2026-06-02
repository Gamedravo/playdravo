import fs from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/games';

const BASE_URL = 'https://www.gamedravo.com';

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function urlTag(loc: string): string {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n  </url>`;
}

function generate(): string {
  const staticPaths = [
    '/',
    '/search',
    '/about',
    '/support',
    '/status',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  // Root uses trailing slash in canonical form.
  const staticUrls = staticPaths.map((p) => (p === '/' ? `${BASE_URL}/` : `${BASE_URL}${p}`));
  const gameUrls = Array.from(new Set(GAMES.map((g) => `${BASE_URL}/games/${g.id}`)));

  const urls = [...staticUrls, ...gameUrls].map(urlTag).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urls}\n` +
    `</urlset>\n`;
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outPath, generate(), 'utf8');
console.log(`Wrote sitemap: ${outPath}`);
