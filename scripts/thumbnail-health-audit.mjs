/**
 * Full catalog thumbnail health audit.
 * Run: node scripts/thumbnail-health-audit.mjs
 */
import fs from 'fs';
import path from 'path';

const CONCURRENCY = 16;

function preferWebPUrl(url) {
  const trimmed = url.trim();
  if (!trimmed.includes('onlinegames.io')) return trimmed;
  if (/\.webp(\?|$)/i.test(trimmed)) return trimmed;
  return trimmed;
}

function upgradeThumbnailResolution(url, size = 'md') {
  const trimmed = url.trim();
  if (!trimmed.includes('onlinegames.io')) return trimmed;
  const target = size === 'lg' ? 'lg' : 'md';
  if (/-lg\.webp$/i.test(trimmed) && target === 'md') return trimmed.replace(/-lg\.webp$/i, '-md.webp');
  if (/-lg\.(jpg|jpeg|png)$/i.test(trimmed) && target === 'md') {
    return trimmed.replace(/-lg\.(jpg|jpeg|png)$/i, '-md.$1');
  }
  if (/-xs\.webp$/i.test(trimmed)) return trimmed.replace(/-xs\.webp$/i, `-${target}.webp`);
  if (/-md\.webp$/i.test(trimmed) && target === 'lg') return trimmed.replace(/-md\.webp$/i, '-lg.webp');
  if (/-xs\.(jpg|jpeg|png)$/i.test(trimmed)) {
    return trimmed.replace(/-xs\.(jpg|jpeg|png)$/i, `-${target}.$1`);
  }
  if (/-md\.(jpg|jpeg|png)$/i.test(trimmed) && target === 'lg') {
    return trimmed.replace(/-md\.(jpg|jpeg|png)$/i, '-lg.$1');
  }
  if (/\/responsive\/[^/]+-xs\./i.test(trimmed)) return trimmed.replace(/-xs\./, `-${target}.`);
  if (/\/responsive\/[^/]+-md\./i.test(trimmed) && target === 'lg') {
    return trimmed.replace(/-md\./, '-lg.');
  }
  return trimmed;
}

function resolveGameThumbnail(thumbnail, size = 'md') {
  return preferWebPUrl(upgradeThumbnailResolution(thumbnail.trim(), size));
}

function parseGames(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /"id":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"thumbnail":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    out.push({ id: m[1], title: m[2], thumbnail: m[3] });
  }
  return out;
}

async function probe(url) {
  if (!url?.trim()) return { ok: false, status: 'MISSING' };
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0', 'User-Agent': 'PlayDravo-ThumbAudit/2.0' },
      signal: AbortSignal.timeout(12000),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 'FAIL' };
  }
}

const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
const games = parseGames(gamesPath);

let i = 0;
const rows = [];

await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (i < games.length) {
      const idx = i++;
      const g = games[idx];
      const cardUrl = resolveGameThumbnail(g.thumbnail, 'md');
      const { ok, status } = await probe(cardUrl);
      rows.push({
        id: g.id,
        title: g.title,
        catalog: g.thumbnail,
        cardUrl,
        ok,
        status,
      });
    }
  })
);

const working = rows.filter((r) => r.ok);
const broken = rows.filter((r) => !r.ok && r.catalog.trim());
const missing = rows.filter((r) => !r.catalog.trim());

const report = {
  generatedAt: new Date().toISOString(),
  totalGames: games.length,
  workingThumbnails: working.length,
  brokenThumbnails: broken.length,
  missingThumbnails: missing.length,
  brokenSamples: broken.slice(0, 25).map((r) => ({
    id: r.id,
    title: r.title,
    cardUrl: r.cardUrl,
    status: r.status,
  })),
};

const outPath = path.resolve(process.cwd(), 'docs', 'thumbnail-health-audit.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('Thumbnail health audit');
console.log('----------------------');
console.log(`Total games:        ${report.totalGames}`);
console.log(`Working thumbnails: ${report.workingThumbnails}`);
console.log(`Broken thumbnails:  ${report.brokenThumbnails}`);
console.log(`Missing thumbnails: ${report.missingThumbnails}`);
console.log(`Report: ${outPath}`);

if (broken.length > 0) process.exitCode = 1;
