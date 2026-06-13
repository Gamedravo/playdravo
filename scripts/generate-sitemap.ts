import fs from 'node:fs';
import path from 'node:path';
import { GAMES, CATEGORY_LIST, fetchOnlineGamesCatalog } from '../src/games';
import { HOMEPAGE_CATEGORY_CHIPS } from '../src/lib/homepageCategories';
import { getCategoryPath } from '../src/utils/categoryRoutes';

const BASE_URL = 'https://gamedravo.com';
const TODAY = new Date().toISOString().slice(0, 10);

interface SitemapEntry {

  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
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

function slugifyCategory(label: string): string {
  return label.toLowerCase().trim().replace(/\s+/g, '-');
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

async function getCatalogGames() {
  try {
    return await fetchOnlineGamesCatalog();
  } catch (error) {
    console.warn('Remote catalog unavailable while generating sitemap; using bundled verified games only.', error);
    return GAMES;
  }
}

async function generate(): Promise<string> {
  const catalogGames = await getCatalogGames();

  const staticPaths = [
    '/',
    '/search',
    '/about',
    '/support',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/status',
    '/report-bug',
    '/submit-game',
  ];

  const specialCategoryLabels = ['Trending', 'Recommended', 'Mobile Games', 'Best On Mobile'];

  const chipCategoryPaths = HOMEPAGE_CATEGORY_CHIPS.map((chip) => `/category/${chip.slug}`);
  const listCategoryPaths = CATEGORY_LIST
    .filter((label) => !['All', 'Favorites', 'History', 'Mods'].includes(label))
    .map(getCategoryPath)
    .filter((pathname) => pathname.startsWith('/category/'));
  const datasetCategoryPaths = Array.from(
    new Set(
      catalogGames
        .map((game) => game.category?.trim())
        .filter((category): category is string => Boolean(category))
        .map((category) => `/category/${slugifyCategory(category)}`)
    )
  );
  const specialCategoryPaths = specialCategoryLabels.map(getCategoryPath);

  const entries: SitemapEntry[] = [
    ...staticPaths.map((pathname) => ({ loc: absolute(pathname), changefreq: 'weekly' as const, priority: pathname === '/' ? '1.0' : '0.7' })),
    ...Array.from(new Set([...specialCategoryPaths, ...chipCategoryPaths, ...listCategoryPaths, ...datasetCategoryPaths]))
      .map((pathname) => ({ loc: absolute(pathname), changefreq: 'daily' as const, priority: '0.8' })),
    ...catalogGames
      .filter((game) => game.id && game.validationState !== 'Unavailable' && !game.adsInjected && !game.popupRisk && !game.redirectRisk)
      .map((game) => ({ loc: absolute(`/games/${game.id}`), changefreq: 'weekly' as const, priority: game.isTop || game.isHot ? '0.9' : '0.8' })),
  ];

  const deduped = Array.from(
    new Map(entries.map((entry) => [normalizeUrl(entry.loc), { ...entry, loc: normalizeUrl(entry.loc) }])).values()
  ).sort((a, b) => a.loc.localeCompare(b.loc));

  console.log(`Sitemap URLs: ${deduped.length}`);
  console.log(`Sitemap games: ${catalogGames.length}`);

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${deduped.map(urlTag).join('\n')}\n` +
    `</urlset>\n`;
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
generate()
  .then((xml) => {
    fs.writeFileSync(outPath, xml, 'utf8');
    console.log(`Wrote sitemap: ${outPath}`);
  })
  .catch((error) => {
    console.error('Failed to generate sitemap:', error);
    process.exitCode = 1;
  });
