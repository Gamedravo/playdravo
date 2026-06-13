import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://gamedravo.com';
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  loc: string;
  changefreq: 'daily' | 'monthly';
  priority: string;
}

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function absolute(pathname: string): string {
  if (pathname === '/') return `${BASE_URL}/`;
  return `${BASE_URL}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  if (parsed.pathname !== '/') parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  return parsed.toString();
}

function urlTag(entry: SitemapEntry): string {
  return [
    '  <url>',
    `    <loc>${xmlEscape(entry.loc)}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function generate(): string {
  const staticPaths = ['/', '/about', '/contact', '/cookies', '/privacy', '/terms'];

  const entries: SitemapEntry[] = staticPaths.map((pathname) => ({
    loc: absolute(pathname),
    changefreq: pathname === '/' ? 'daily' : 'monthly',
    priority: pathname === '/' ? '1.0' : '0.7',
  }));

  const deduped = Array.from(
    new Map(entries.map((entry) => [normalizeUrl(entry.loc), { ...entry, loc: normalizeUrl(entry.loc) }])).values()
  ).sort((a, b) => a.loc.localeCompare(b.loc));

  console.log(`Sitemap URLs: ${deduped.length}`);

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${deduped.map(urlTag).join('\n')}\n` +
    `</urlset>\n`;
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
try {
  fs.writeFileSync(outPath, generate(), 'utf8');
  console.log(`Wrote sitemap: ${outPath}`);
} catch (error) {
  console.error('Failed to generate sitemap:', error);
  process.exitCode = 1;
}
