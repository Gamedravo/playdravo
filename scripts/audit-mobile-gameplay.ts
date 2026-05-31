/**
 * Mobile gameplay audit — embed reachability, engine heuristics, portal touch blockers.
 * Run: npx tsx scripts/audit-mobile-gameplay.ts
 *
 * Note: True touch interaction cannot be verified headlessly; this report documents
 * code-level fixes and classifies games by likely mobile input requirements.
 */
import fs from 'fs';
import path from 'path';

const CONCURRENCY = 10;
const SAMPLE_SIZE = 40;

interface GameEntry {
  id: string;
  title: string;
  url: string;
  mobileOptimization?: string;
  tags?: string[];
}

interface AuditReport {
  generatedAt: string;
  catalogSize: number;
  portalTouchBlockersFixed: string[];
  embedHosts: Record<string, number>;
  engineBuckets: Record<string, number>;
  sampledEmbeds: Array<{
    id: string;
    title: string;
    url: string;
    embedOk: boolean;
    status: number | string;
    engine: string;
    mobileHint: string;
    touchRisk: 'low' | 'medium' | 'high';
    notes: string;
  }>;
  likelyDesktopOnly: Array<{ id: string; title: string; reason: string }>;
  recommendations: string[];
}

function parseGamesFromTs(filePath: string): GameEntry[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const games: GameEntry[] = [];
  const blockRe = /\{\s*"id":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"url":\s*"([^"]+)"([\s\S]*?)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(raw)) !== null) {
    const tail = m[4];
    const mobile = tail.match(/"mobileOptimization":\s*"([^"]+)"/)?.[1];
    const tagsMatch = tail.match(/"tags":\s*(\[[\s\S]*?\])/);
    let tags: string[] | undefined;
    if (tagsMatch) {
      try {
        tags = JSON.parse(tagsMatch[1]);
      } catch {
        tags = undefined;
      }
    }
    games.push({ id: m[1], title: m[2], url: m[3], mobileOptimization: mobile, tags });
  }
  return games;
}

function inferEngine(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('/unity/')) return 'unity-webgl';
  if (u.includes('/construct/')) return 'construct';
  if (u.includes('cloud.onlinegames.io')) return 'construct-cloud';
  if (u.includes('html5')) return 'html5';
  return 'unknown';
}

function touchRisk(entry: GameEntry): { risk: 'low' | 'medium' | 'high'; notes: string } {
  const tags = (entry.tags || []).join(' ').toLowerCase();
  const engine = inferEngine(entry.url);
  if (/\b(first person|fps|keyboard|typing)\b/.test(tags)) {
    return { risk: 'high', notes: 'Tags suggest keyboard/mouse-heavy controls' };
  }
  if (engine === 'unity-webgl') {
    return { risk: 'medium', notes: 'Unity WebGL — touch works when game implements it; verify on device' };
  }
  if (/\bmobile\b/.test(tags) || entry.mobileOptimization === 'touch-friendly') {
    return { risk: 'low', notes: 'Tagged or marked touch-friendly' };
  }
  return { risk: 'medium', notes: 'Standard HTML5 embed — verify tap/drag on device' };
}

async function headOk(url: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'PlayDravo-MobileAudit/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok || res.status === 405) return { ok: true, status: res.status };
    const get = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'PlayDravo-MobileAudit/1.0' },
      signal: AbortSignal.timeout(12000),
    });
    return { ok: get.ok, status: get.status };
  } catch (e) {
    return { ok: false, status: 'FAIL' };
  }
}

async function mapPool<T, R>(items: T[], fn: (item: T) => Promise<R>, n: number): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    })
  );
  return out;
}

async function main() {
  const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
  const games = parseGamesFromTs(gamesPath);

  const embedHosts: Record<string, number> = {};
  const engineBuckets: Record<string, number> = {};
  const likelyDesktopOnly: AuditReport['likelyDesktopOnly'] = [];

  for (const g of games) {
    try {
      const host = new URL(g.url).hostname;
      embedHosts[host] = (embedHosts[host] || 0) + 1;
    } catch {
      embedHosts['invalid'] = (embedHosts['invalid'] || 0) + 1;
    }
    const engine = inferEngine(g.url);
    engineBuckets[engine] = (engineBuckets[engine] || 0) + 1;

    const tags = (g.tags || []).join(' ').toLowerCase();
    if (/\b(first person shooter|typing|keyboard only)\b/.test(tags)) {
      likelyDesktopOnly.push({ id: g.id, title: g.title, reason: 'Tag suggests keyboard/mouse-first gameplay' });
    }
  }

  const sample = [...games]
    .sort((a, b) => a.id.localeCompare(b.id))
    .filter((_, i, arr) => i % Math.ceil(arr.length / SAMPLE_SIZE) === 0)
    .slice(0, SAMPLE_SIZE);

  const sampledEmbeds = await mapPool(
    sample,
    async (g) => {
      const check = await headOk(g.url);
      const engine = inferEngine(g.url);
      const { risk, notes } = touchRisk(g);
      return {
        id: g.id,
        title: g.title,
        url: g.url,
        embedOk: check.ok,
        status: check.status,
        engine,
        mobileHint: g.mobileOptimization || 'unknown',
        touchRisk: risk,
        notes,
      };
    },
    CONCURRENCY
  );

  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    catalogSize: games.length,
    portalTouchBlockersFixed: [
      'Removed touch-action: none (Tailwind touch-none) from game iframe',
      'Stopped setting document/body touchAction:none during theater mode',
      'touchmove preventDefault now skips events targeting iframe/player shell',
      'Pseudo-fullscreen top bar title no longer captures pointer events',
      'Mobile play no longer auto-enters theater mode (use fullscreen button)',
      'iframe allowFullScreen + touch-manipulation enabled',
    ],
    embedHosts,
    engineBuckets,
    sampledEmbeds,
    likelyDesktopOnly: likelyDesktopOnly.slice(0, 50),
    recommendations: [
      'Manually verify tap/drag on Android Chrome + iPhone Safari after portal fixes',
      'Games with high touchRisk need per-title device QA — loading ≠ playable',
      'Use fullscreen button for immersive mobile play; inline player preserves touch',
      'Report broken titles via in-app bug report with game ID',
    ],
  };

  const outPath = path.resolve(process.cwd(), 'docs', 'mobile-gameplay-audit.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  const mdPath = path.resolve(process.cwd(), 'docs', 'mobile-gameplay-audit.md');
  const embedOk = sampledEmbeds.filter((s) => s.embedOk).length;
  const low = sampledEmbeds.filter((s) => s.touchRisk === 'low').length;
  const med = sampledEmbeds.filter((s) => s.touchRisk === 'medium').length;
  const high = sampledEmbeds.filter((s) => s.touchRisk === 'high').length;

  fs.writeFileSync(
    mdPath,
    `# Mobile Gameplay Audit

Generated: ${report.generatedAt}

## Summary

| Metric | Value |
|--------|-------|
| Catalog size | ${report.catalogSize} |
| Sample probed (embed HTTP) | ${sampledEmbeds.length} |
| Sample embed reachable | ${embedOk}/${sampledEmbeds.length} |
| Touch risk (sample heuristic) | low ${low}, medium ${med}, high ${high} |

## Root cause (portal — fixed)

${report.portalTouchBlockersFixed.map((f) => `- ${f}`).join('\n')}

The iframe used \`touch-none\` (\`touch-action: none\`), which blocks touch delivery to embedded games on iOS/Android. Theater mode also set \`touch-action: none\` on \`document.body\` and called \`preventDefault()\` on all \`touchmove\` events, which interfered with in-game drags.

## Embed engines (catalog)

${Object.entries(engineBuckets)
  .map(([k, v]) => `- **${k}**: ${v}`)
  .join('\n')}

## Sample probe (${sampledEmbeds.length} games)

| Game | Engine | Embed | Touch risk |
|------|--------|-------|------------|
${sampledEmbeds.map((s) => `| ${s.title} | ${s.engine} | ${s.embedOk ? 'OK' : s.status} | ${s.touchRisk} |`).join('\n')}

## Working vs issues (honest scope)

**Portal layer:** After fixes, touch events should reach the iframe. Fullscreen remains available via the action bar.

**Per-game:** Many OnlineGames.io titles support tap (per their docs). Unity/Construct games vary. **Loading the embed does not prove touch works** — device QA is required for each engine class.

**Likely desktop-first (tag heuristic):** ${likelyDesktopOnly.length} titles flagged — see JSON for list.

## Device test checklist

1. Open game on phone → tap Play → tap inside game (not chrome UI)
2. Verify virtual buttons / drag / tap-to-jump
3. Tap fullscreen → confirm controls still work
4. Rotate device if game is landscape-first

Full data: \`docs/mobile-gameplay-audit.json\`
`
  );

  console.log(`Wrote ${outPath}`);
  console.log(`Wrote ${mdPath}`);
  console.log(`Catalog: ${games.length} | Sample embed OK: ${embedOk}/${sampledEmbeds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
