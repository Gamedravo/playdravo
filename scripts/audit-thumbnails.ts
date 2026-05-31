/**
 * Audits all catalog thumbnails: probes md/lg variants, flags broken URLs.
 * Run: npm run audit:thumbnails
 * Apply best URLs to games.ts: npm run audit:thumbnails -- --apply
 */
import fs from 'fs';
import path from 'path';

const CONCURRENCY = 12;

interface GameThumb {
  id: string;
  title: string;
  thumbnail: string;
}

function candidates(url: string): string[] {
  const list = [url];
  if (url.includes('-md.')) list.push(url.replace(/-md\./g, '-lg.'));
  if (url.includes('-xs.')) {
    list.push(url.replace(/-xs\./g, '-md.'));
    list.push(url.replace(/-xs\./g, '-lg.'));
  }
  return [...new Set(list)];
}

async function probe(url: string): Promise<{ ok: boolean; bytes: number }> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'PlayDravo-ThumbAudit/1.0', Range: 'bytes=0-0' },
      signal: AbortSignal.timeout(12000),
    });
    const len = Number(res.headers.get('content-length') || 0);
    return { ok: res.ok, bytes: len };
  } catch {
    return { ok: false, bytes: 0 };
  }
}

function parseGames(file: string): GameThumb[] {
  const raw = fs.readFileSync(file, 'utf8');
  const out: GameThumb[] = [];
  const re = /"id":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"thumbnail":\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    out.push({ id: m[1], title: m[2], thumbnail: m[3] });
  }
  return out;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
  let gamesTs = fs.readFileSync(gamesPath, 'utf8');
  const games = parseGames(gamesPath);

  let i = 0;
  const results: Array<{
    id: string;
    title: string;
    original: string;
    best: string;
    upgraded: boolean;
    lowQuality: boolean;
  }> = [];

  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < games.length) {
        const idx = i++;
        const g = games[idx];
        const urls = candidates(g.thumbnail);
        let best = g.thumbnail;
        let bestBytes = 0;

        for (const url of urls) {
          const { ok, bytes } = await probe(url);
          if (ok && bytes >= bestBytes) {
            best = url;
            bestBytes = bytes;
          } else if (ok && bestBytes === 0) {
            best = url;
            bestBytes = bytes || 1;
          }
        }

        const upgraded = best !== g.thumbnail;
        const lowQuality = !best.includes('-lg.') && !best.includes('-md.') && best.includes('onlinegames.io');

        results.push({
          id: g.id,
          title: g.title,
          original: g.thumbnail,
          best,
          upgraded,
          lowQuality,
        });

      }
    })
  );

  if (apply) {
    for (const r of results) {
      if (r.best === r.original) continue;
      const block = new RegExp(
        `("id":\\s*"${r.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"thumbnail":\\s*")${r.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(")`,
        'm'
      );
      gamesTs = gamesTs.replace(block, `$1${r.best}$2`);
    }
    fs.writeFileSync(gamesPath, gamesTs, 'utf8');
    console.log('Applied best thumbnail URLs to src/games.ts');
  }

  const upgraded = results.filter((r) => r.upgraded).length;
  const lowQuality = results.filter((r) => r.lowQuality).length;
  const broken = results.filter((r) => r.best === r.original && !(r.original.includes('onlinegames.io')));

  const report = {
    generatedAt: new Date().toISOString(),
    total: games.length,
    upgradedToBetterVariant: upgraded,
    flaggedLowQuality: lowQuality,
    samplesUpgraded: results.filter((r) => r.upgraded).slice(0, 20),
    samplesLowQuality: results.filter((r) => r.lowQuality).slice(0, 20),
  };

  const outPath = path.resolve(process.cwd(), 'docs', 'thumbnail-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Audited ${games.length} games. Upgraded: ${upgraded}. Low-quality flags: ${lowQuality}.`);
  console.log(`Report: ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
