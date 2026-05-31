/**
 * Full production catalog health audit — thumbnails + embed URLs.
 * Run: node scripts/production-health-audit.mjs
 */
import fs from 'fs';
import path from 'path';

const CONCURRENCY = 8;

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
  if (/-md\.(jpg|jpeg|png)$/i.test(trimmed) && target === 'lg') {
    return trimmed.replace(/-md\.(jpg|jpeg|png)$/i, '-lg.$1');
  }
  return trimmed;
}

function resolveCardThumbnail(thumbnail) {
  return preferWebPUrl(upgradeThumbnailResolution(thumbnail.trim(), 'md'));
}

function parseGames(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const ids = [...raw.matchAll(/"id":\s*"([^"]+)"/g)].map((m) => m[1]);
  const titles = [...raw.matchAll(/"title":\s*"([^"]+)"/g)].map((m) => m[1]);
  const thumbs = [...raw.matchAll(/"thumbnail":\s*"([^"]+)"/g)].map((m) => m[1]);
  const urls = [...raw.matchAll(/"url":\s*"([^"]+)"/g)].map((m) => m[1]);
  return ids.map((id, i) => ({
    id,
    title: titles[i] ?? id,
    thumbnail: thumbs[i] ?? '',
    url: urls[i] ?? '',
  }));
}

async function probe(url, kind, attempt = 0) {
  if (!url?.trim()) return { ok: false, status: 'MISSING', kind };
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...(kind === 'thumb' ? { Range: 'bytes=0-0' } : {}),
        'User-Agent': 'PlayDravo-ProductionAudit/1.0',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });
    if (!res.ok && attempt < 1) {
      await new Promise((r) => setTimeout(r, 400));
      return probe(url, kind, attempt + 1);
    }
    return { ok: res.ok, status: res.status, kind };
  } catch {
    if (attempt < 1) {
      await new Promise((r) => setTimeout(r, 400));
      return probe(url, kind, attempt + 1);
    }
    return { ok: false, status: 'FAIL', kind };
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
      const thumbUrl = resolveCardThumbnail(g.thumbnail);
      const [thumb, embed] = await Promise.all([
        probe(thumbUrl, 'thumb'),
        probe(g.url, 'embed'),
      ]);
      rows.push({
        id: g.id,
        title: g.title,
        thumbUrl,
        embedUrl: g.url,
        thumbOk: thumb.ok,
        embedOk: embed.ok,
        thumbStatus: thumb.status,
        embedStatus: embed.status,
      });
    }
  })
);

const workingThumbs = rows.filter((r) => r.thumbOk).length;
const brokenThumbs = rows.filter((r) => !r.thumbOk);
const workingEmbeds = rows.filter((r) => r.embedOk).length;
const brokenEmbeds = rows.filter((r) => !r.embedOk);
const missingThumbs = rows.filter((r) => !r.thumbUrl?.trim());

const report = {
  generatedAt: new Date().toISOString(),
  totalGames: games.length,
  workingThumbnails: workingThumbs,
  brokenThumbnails: brokenThumbs.length,
  missingThumbnails: missingThumbs.length,
  workingEmbeds,
  brokenEmbeds: brokenEmbeds.length,
  brokenThumbSamples: brokenThumbs.slice(0, 15),
  brokenEmbedSamples: brokenEmbeds.slice(0, 15),
  additionalGamesVerified: {
    slope: rows.some((r) => r.id === 'slope' && r.embedOk),
    wordle: rows.some((r) => r.id === 'wordle' && r.embedOk),
    'tetris-cube': rows.some((r) => r.id === 'tetris-cube' && r.embedOk),
    'flappy-bird': rows.some((r) => r.id === 'flappy-bird' && r.embedOk),
    'clicker-heroes': rows.some((r) => r.id === 'clicker-heroes' && r.embedOk),
    'mr-mine': rows.some((r) => r.id === 'mr-mine' && r.embedOk),
    'poker-quest': rows.some((r) => r.id === 'poker-quest' && r.embedOk),
    grindcraft: rows.some((r) => r.id === 'grindcraft' && r.embedOk),
    'fray-fight': rows.some((r) => r.id === 'fray-fight' && r.embedOk),
  },
};

const outPath = path.resolve(process.cwd(), 'docs', 'final-production-audit.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('Production catalog health audit');
console.log('-----------------------------');
console.log(`Total games:          ${report.totalGames}`);
console.log(`Working thumbnails:   ${report.workingThumbnails}`);
console.log(`Broken thumbnails:    ${report.brokenThumbnails}`);
console.log(`Missing thumbnails:   ${report.missingThumbnails}`);
console.log(`Working embeds:       ${report.workingEmbeds}`);
console.log(`Broken embeds:        ${report.brokenEmbeds}`);
console.log(`Report: ${outPath}`);

if (brokenThumbs.length > 0 || brokenEmbeds.length > 0) process.exitCode = 1;
