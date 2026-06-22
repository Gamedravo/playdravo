import fs from 'node:fs';
import path from 'node:path';
import { CATEGORY_LIST } from '../src/games';

const BASE_URL = 'https://gamedravo.com';
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
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
  return `${BASE_URL}${pathname === '/' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`}`;
}

function slugifyCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
  const entries: SitemapEntry[] = [];

  const staticPages: [string, SitemapEntry['changefreq'], string][] = [
    ['/', 'daily', '1.0'],
    ['/search', 'weekly', '0.7'],
    ['/html-sitemap', 'weekly', '0.7'],
    ['/about', 'monthly', '0.6'],
    ['/contact', 'monthly', '0.5'],
    ['/support', 'monthly', '0.5'],
    ['/submit-game', 'monthly', '0.5'],
    ['/status', 'weekly', '0.4'],
    ['/report-bug', 'monthly', '0.4'],
    ['/privacy', 'yearly', '0.3'],
    ['/terms', 'yearly', '0.3'],
    ['/cookies', 'yearly', '0.3'],
  ];

  for (const [pathname, changefreq, priority] of staticPages) {
    entries.push({ loc: absolute(pathname), changefreq, priority });
  }

  const categorySlugs = new Set<string>([
    'trending',
    'new-arrivals',
    'top-rated',
    'recommended',
    'best-on-mobile',
  ]);

  const skipCategories = new Set(['All', 'Favorites', 'History', 'Mods']);
  for (const category of CATEGORY_LIST) {
    if (!skipCategories.has(category)) categorySlugs.add(slugifyCategory(category));
  }

  for (const slug of [...categorySlugs].sort()) {
    entries.push({
      loc: absolute(`/category/${slug}`),
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  const deduped = Array.from(
    new Map(entries.map((entry) => [normalizeUrl(entry.loc), { ...entry, loc: normalizeUrl(entry.loc) }])).values()
  ).sort((a, b) => {
    if (a.loc === `${BASE_URL}/`) return -1;
    if (b.loc === `${BASE_URL}/`) return 1;
    const priorityDelta = parseFloat(b.priority) - parseFloat(a.priority);
    if (priorityDelta !== 0) return priorityDelta;
    return a.loc.localeCompare(b.loc);
  });

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${deduped.map(urlTag).join('\n')}\n` +
    `</urlset>\n`
  );
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outPath, generate(), 'utf8');
console.log(`Wrote sitemap: ${outPath}`);
