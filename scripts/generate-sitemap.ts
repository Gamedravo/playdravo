import fs from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/games';
import { HOMEPAGE_CATEGORY_CHIPS } from '../src/lib/homepageCategories';

const BASE_URL = 'https://www.gamedravo.com';
const TODAY = new Date().toISOString().split('T')[0];

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function urlTag(entry: UrlEntry): string {
  const lines = [`    <loc>${xmlEscape(entry.loc)}</loc>`];
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
  return `  <url>\n${lines.join('\n')}\n  </url>`;
}

function generate(): string {
  const entries: UrlEntry[] = [];

  // Homepage - highest priority
  entries.push({
    loc: `${BASE_URL}/`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: 1.0
  });

  // Static pages
  const staticPages = [
    { path: '/search', priority: 0.8, changefreq: 'daily' as const },
    { path: '/about', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/support', priority: 0.6, changefreq: 'weekly' as const },
    { path: '/contact', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/cookies', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/status', priority: 0.4, changefreq: 'weekly' as const },
  ];

  for (const page of staticPages) {
    entries.push({
      loc: `${BASE_URL}${page.path}`,
      lastmod: TODAY,
      changefreq: page.changefreq,
      priority: page.priority
    });
  }

  // Categories: include both curated chips and all dataset categories
  const specialCategorySlugs = ['trending', 'new-arrivals', 'top-rated', 'recommended'];
  const chipSlugs = HOMEPAGE_CATEGORY_CHIPS.map((c) => c.slug);
  const datasetSlugs = Array.from(
    new Set(
      GAMES.map((g) => (g.category ?? '').toString().trim()).filter(Boolean).map((label) =>
        label.toLowerCase().replace(/\s+/g, '-')
      )
    )
  );

  const categorySlugs = Array.from(new Set([...specialCategorySlugs, ...chipSlugs, ...datasetSlugs]))
    .filter((slug) => slug !== 'all');

  for (const slug of categorySlugs) {
    entries.push({
      loc: `${BASE_URL}/category/${slug}`,
      lastmod: TODAY,
      changefreq: 'daily',
      priority: 0.7
    });
  }

  // Game pages - high priority
  const gameIds = new Set<string>();
  for (const game of GAMES) {
    if (gameIds.has(game.id)) continue;
    gameIds.add(game.id);
    
    // Parse createdAt for lastmod
    let lastmod = TODAY;
    if (game.createdAt) {
      try {
        const date = new Date(game.createdAt as string);
        if (!isNaN(date.getTime())) {
          lastmod = date.toISOString().split('T')[0];
        }
      } catch {
        // Use TODAY as fallback
      }
    }

    entries.push({
      loc: `${BASE_URL}/games/${game.id}`,
      lastmod,
      changefreq: 'weekly',
      priority: 0.8
    });
  }

  const urlsXml = entries.map(urlTag).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;
}

const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(outPath, generate(), 'utf8');
console.log(`Wrote sitemap: ${outPath} (${GAMES.length} games)`);
