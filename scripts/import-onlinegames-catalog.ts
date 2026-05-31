/**
 * Fetches https://www.onlinegames.io/media/plugins/genGames/embed.json
 * Validates entries and generates src/games.ts + import report.
 *
 * Run: npx tsx scripts/import-onlinegames-catalog.ts
 * Audit only: npx tsx scripts/import-onlinegames-catalog.ts --audit-only
 */
import fs from 'fs';
import path from 'path';

const SOURCE_URL = 'https://www.onlinegames.io/media/plugins/genGames/embed.json';
const CONCURRENCY = 12;

export interface RawOnlineGame {
  title: string;
  embed: string;
  image: string;
  tags: string;
  description: string;
}

export interface ImportReport {
  fetchedAt: string;
  sourceUrl: string;
  totalGames: number;
  validGames: number;
  brokenEmbeds: number;
  brokenThumbnails: number;
  duplicatesRemoved: number;
  missingFields: number;
  invalidEntries: string[];
  brokenEmbedList: Array<{ title: string; embed: string; reason: string }>;
  brokenThumbnailList: Array<{ title: string; image: string; reason: string }>;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base.slice(0, 72) || 'game';
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .map((t) =>
      t
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );
}

function inferCategory(tagList: string[]): string {
  const t = tagList.join(' ').toLowerCase();
  if (/\b(first person shooter|shooting|fps|gun|battle royale)\b/.test(t)) return 'Action';
  if (/\b(racing|drift|driving|traffic|car)\b/.test(t)) return 'Racing';
  if (/\b(multiplayer|io games)\b/.test(t)) return 'Multiplayer';
  if (/\b(puzzle|logic|mahjong|sudoku|match 3)\b/.test(t)) return 'Puzzle';
  if (/\b(sports|soccer|football|golf|basketball|baseball)\b/.test(t)) return 'Sports';
  if (/\b(simulator|tycoon|management|organizing)\b/.test(t)) return 'Simulator';
  if (/\b(strategy|tower defense)\b/.test(t)) return 'Strategy';
  if (/\b(adventure|parkour|running|platformer)\b/.test(t)) return 'Adventure';
  if (/\b(horror|scary|zombie|survival)\b/.test(t)) return 'Adventure';
  if (/\b(arcade|retro|classic)\b/.test(t)) return 'Arcade';
  if (/\b(action|battle|war|fighting)\b/.test(t)) return 'Action';
  if (/\b(casual|fun|kids)\b/.test(t)) return 'Casual';
  return 'Arcade';
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function seededRating(id: string): number {
  const h = hashSeed(id);
  return Math.round((4.0 + (h % 10) / 10) * 10) / 10;
}

function seededPlays(id: string): number {
  const h = hashSeed(id + '-plays');
  return 15000 + (h % 2500000);
}

async function urlResponds(url: string): Promise<{ ok: boolean; status: number | string }> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PlayDravo-Importer/1.0',
    Accept: '*/*',
  };
  try {
    const head = await fetch(url, { method: 'HEAD', headers, signal: AbortSignal.timeout(10000) });
    if (head.ok || head.status === 405) return { ok: true, status: head.status };
    if (head.status >= 400) {
      const get = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(12000) });
      return { ok: get.ok, status: get.status };
    }
    return { ok: head.ok, status: head.status };
  } catch (e) {
    try {
      const get = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(12000) });
      return { ok: get.ok, status: get.status };
    } catch {
      return { ok: false, status: 'FAIL' };
    }
  }
}

function escapeTsString(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

async function mapPool<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function runImport(auditOnly = false): Promise<ImportReport> {
  console.log(`Fetching ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
  const raw = (await res.json()) as RawOnlineGame[];

  const report: ImportReport = {
    fetchedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    totalGames: raw.length,
    validGames: 0,
    brokenEmbeds: 0,
    brokenThumbnails: 0,
    duplicatesRemoved: 0,
    missingFields: 0,
    invalidEntries: [],
    brokenEmbedList: [],
    brokenThumbnailList: [],
  };

  const seenEmbed = new Set<string>();
  const seenSlug = new Set<string>();
  const candidates: Array<RawOnlineGame & { id: string; tagList: string[] }> = [];

  for (const entry of raw) {
    if (!entry.title?.trim() || !entry.embed?.trim() || !entry.image?.trim()) {
      report.missingFields++;
      report.invalidEntries.push(entry.title || '(untitled)');
      continue;
    }
    const embedKey = entry.embed.trim().toLowerCase();
    if (seenEmbed.has(embedKey)) {
      report.duplicatesRemoved++;
      continue;
    }
    seenEmbed.add(embedKey);

    let id = slugify(entry.title);
    if (seenSlug.has(id)) {
      let n = 2;
      while (seenSlug.has(`${id}-${n}`)) n++;
      id = `${id}-${n}`;
      report.duplicatesRemoved++;
    }
    seenSlug.add(id);

    candidates.push({
      ...entry,
      id,
      tagList: parseTags(entry.tags || ''),
    });
  }

  console.log(`Validating ${candidates.length} candidates (${CONCURRENCY} concurrent)...`);

  const validated = await mapPool(
    candidates,
    async (entry) => {
      const [embedCheck, thumbCheck] = await Promise.all([
        urlResponds(entry.embed.trim()),
        urlResponds(entry.image.trim()),
      ]);
      return { entry, embedCheck, thumbCheck };
    },
    CONCURRENCY
  );

  const validGames: typeof candidates = [];

  for (const { entry, embedCheck, thumbCheck } of validated) {
    if (!embedCheck.ok) {
      report.brokenEmbeds++;
      report.brokenEmbedList.push({
        title: entry.title,
        embed: entry.embed,
        reason: String(embedCheck.status),
      });
      continue;
    }
    if (!thumbCheck.ok) {
      report.brokenThumbnails++;
      report.brokenThumbnailList.push({
        title: entry.title,
        image: entry.image,
        reason: String(thumbCheck.status),
      });
      continue;
    }
    validGames.push(entry);
  }

  report.validGames = validGames.length;

  const reportPath = path.resolve(process.cwd(), 'docs', 'onlinegames-import-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n=== ONLINEGAMES.IO IMPORT REPORT ===');
  console.log(`Total in dataset:     ${report.totalGames}`);
  console.log(`Valid games:          ${report.validGames}`);
  console.log(`Broken embeds:        ${report.brokenEmbeds}`);
  console.log(`Broken thumbnails:    ${report.brokenThumbnails}`);
  console.log(`Duplicates removed:   ${report.duplicatesRemoved}`);
  console.log(`Missing fields:       ${report.missingFields}`);
  console.log(`Report: ${reportPath}`);

  if (auditOnly) return report;

  const allTags = new Set<string>();
  validGames.forEach((g) => g.tagList.forEach((t) => allTags.add(t)));

  const sortedTags = [...allTags].sort((a, b) => a.localeCompare(b));

  const gamesTs = `import { Game } from './types';

/** Auto-generated from ${SOURCE_URL} */
export const CATALOG_SOURCE = 'onlinegames.io' as const;

export const CATEGORY_LIST = [
  "All",
  "Favorites",
  "Recommended",
  "History",
  "Trending",
  "Mods",
  "Action",
  "Adventure",
  "Arcade",
  "Card",
  "Casual",
  "Educational",
  "Multiplayer",
  "2 Player",
  "3 Player",
  "4 Player",
  "Platformer",
  "Puzzle",
  "Racing",
  "Simulator",
  "Sports",
  "Strategy"
];

export const TAGS_LIST: string[] = ${JSON.stringify(sortedTags, null, 2)};

export const GAMES: Game[] = [
${validGames
  .map((g) => {
    const category = inferCategory(g.tagList);
    const rating = seededRating(g.id);
    const plays = seededPlays(g.id);
    const isHot = plays > 500000;
    const isTop = rating >= 4.7;
    const mobile = g.tagList.some((t) => /Mobile/i.test(t)) ? 'touch-friendly' : 'responsive';
    const desc = escapeTsString((g.description || '').slice(0, 500));
    const title = escapeTsString(g.title.trim());
    const embed = escapeTsString(g.embed.trim());
    const image = escapeTsString(g.image.trim());
    const tagsJson = JSON.stringify(g.tagList);

    return `  {
    "id": "${g.id}",
    "title": "${title}",
    "category": "${category}",
    "url": "${embed}",
    "thumbnail": "${image}",
    "description": "${desc}",
    "rating": ${rating},
    "plays": ${plays},
    "authorUid": "onlinegames-io",
    "createdAt": "${report.fetchedAt}",
    "isHot": ${isHot},
    "isTop": ${isTop},
    "tags": ${tagsJson},
    "developer": "OnlineGames.io",
    "publisher": "OnlineGames.io",
    "mobileOptimization": "${mobile}",
    "fullscreenSupport": true,
    "embedCompatibility": "full",
    "validationState": "Verified Working",
    "lastVerified": "${report.fetchedAt}",
    "sourceId": "onlinegames-io",
    "avgPlayTime": "10m"
  }`;
  })
  .join(',\n')}
];
`;

  const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
  fs.writeFileSync(gamesPath, gamesTs, 'utf8');
  console.log(`\nWrote ${validGames.length} games to ${gamesPath}`);

  return report;
}

const auditOnly = process.argv.includes('--audit-only');
runImport(auditOnly).catch((err) => {
  console.error(err);
  process.exit(1);
});
