/**
 * Best-effort audit for embedded-game ad injection.
 *
 * Why best-effort:
 * - Cross-origin iframes cannot be inspected from the browser.
 * - Some games load ads at runtime via remote JS.
 * - We therefore combine domain heuristics + HTML keyword scanning.
 *
 * Run:
 *   npx tsx scripts/audit-ads-injection.ts
 *
 * Output:
 *   docs/ads-injection-report.json
 *   docs/ads-injection-report.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/games';
import { inferAdsInjectedFromUrl } from '../src/lib/adsInjection';

const OUT_JSON = path.join(process.cwd(), 'docs', 'ads-injection-report.json');
const OUT_MD = path.join(process.cwd(), 'docs', 'ads-injection-report.md');
const DO_FETCH = process.argv.includes('--fetch');

const AD_KEYWORDS = [
  'adsbygoogle',
  'googlesyndication',
  'doubleclick',
  'adservice',
  'amazon-adsystem',
  'prebid',
  'taboola',
  'outbrain',
  'adsterra',
  'propellerads',
  'adroll',
] as const;

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function fetchHtml(url: string): Promise<{ ok: boolean; html: string; contentType: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PlayDravo-Audit/1.0', Accept: 'text/html,application/xhtml+xml' },
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) return { ok: false, html: '', contentType };
    if (!contentType.toLowerCase().includes('text/html')) {
      // Some game hosts return HTML with a generic content-type; still read but keep it.
    }
    const html = await res.text();
    return { ok: true, html, contentType };
  } catch {
    return { ok: false, html: '', contentType: '' };
  } finally {
    clearTimeout(timeout);
  }
}

async function run() {
  console.log('\n=== ADS INJECTION AUDIT ===\n');
  if (!DO_FETCH) {
    console.log('Mode: heuristic-only (fast). Pass --fetch for keyword scanning (slow).\n');
  }

  const rows: Array<{
    id: string;
    title: string;
    url: string;
    domain: string;
    heuristicFlag: boolean;
    keywordHits: string[];
    adsInjected: boolean;
    notes: string;
  }> = [];

  for (const game of GAMES) {
    let domain = 'invalid';
    try {
      domain = new URL(game.url).hostname;
    } catch {
      // ignore
    }

    const heuristicFlag = inferAdsInjectedFromUrl(game.url);
    let keywordHits: string[] = [];
    let notes = '';

    // Optional keyword scan (slow) — only when heuristics already suspect ads.
    if (DO_FETCH && heuristicFlag && domain !== 'invalid') {
      const fetched = await fetchHtml(game.url);
      if (!fetched.ok) {
        notes = 'Fetch failed (could be blocked or offline)';
      } else {
        const lower = fetched.html.toLowerCase();
        keywordHits = AD_KEYWORDS.filter((k) => lower.includes(k)).map(String);
        if (keywordHits.length === 0) {
          // Some portals inject ads via remote JS; keyword absence isn't definitive.
          notes = `No ad keywords found in initial HTML (${fetched.contentType || 'unknown content-type'})`;
        }
      }
    }

    const adsInjected = heuristicFlag || keywordHits.length > 0;
    if (!adsInjected) continue;

    rows.push({
      id: game.id,
      title: game.title,
      url: game.url,
      domain,
      heuristicFlag,
      keywordHits: uniq(keywordHits),
      adsInjected,
      notes,
    });
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), total: rows.length, rows }, null, 2));

  const md =
    `# Ads Injection Report\n\n` +
    `Generated: ${new Date().toISOString()}\n\n` +
    `Mode: ${DO_FETCH ? 'heuristic + keyword scan' : 'heuristic-only'}\n\n` +
    `Total flagged games: **${rows.length}**\n\n` +
    `| Game | Domain | Evidence |\n|---|---|---|\n` +
    rows
      .map((r) => {
        const name = `${r.title} (\`${r.id}\`)`;
        const evidence = r.keywordHits.length
          ? `keywords: ${r.keywordHits.join(', ')}`
          : r.heuristicFlag
            ? 'heuristic (domain/pattern)'
            : r.notes || '';
        return `| ${name} | ${r.domain} | ${evidence.replaceAll('|', '\\|')} |`;
      })
      .join('\n') +
    `\n`;

  fs.writeFileSync(OUT_MD, md, 'utf8');

  console.log(`Flagged games: ${rows.length}`);
  console.log(`Wrote: ${OUT_JSON}`);
  console.log(`Wrote: ${OUT_MD}\n`);
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
