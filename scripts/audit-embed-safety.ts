/**
 * Audit embedded game sources for ads/popups/redirect risk.
 *
 * Run:
 *   npx tsx scripts/audit-embed-safety.ts
 *
 * Output:
 *   docs/unsafe-embed-report.json
 *   docs/unsafe-embed-report.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { GAMES } from '../src/games';
import {
  normalizeEmbedUrl,
  inferAdsInjectedFromUrl,
  inferPopupRiskFromUrl,
  inferRedirectRiskFromUrl,
} from '../src/lib/adsInjection';

type RiskFlags = { adsInjected: boolean; popupRisk: boolean; redirectRisk: boolean };

function flagsFor(url: string): RiskFlags {
  return {
    adsInjected: inferAdsInjectedFromUrl(url),
    popupRisk: inferPopupRiskFromUrl(url),
    redirectRisk: inferRedirectRiskFromUrl(url),
  };
}

function anyRisk(f: RiskFlags) {
  return f.adsInjected || f.popupRisk || f.redirectRisk;
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'invalid';
  }
}

async function run() {
  const rows = GAMES.map((g) => {
    const normalizedUrl = normalizeEmbedUrl(g.url);
    const original = flagsFor(g.url);
    const normalized = flagsFor(normalizedUrl);
    return {
      id: g.id,
      title: g.title,
      category: g.category,
      domain: safeHostname(normalizedUrl),
      originalUrl: g.url,
      normalizedUrl,
      urlChanged: g.url !== normalizedUrl,
      original,
      normalized,
    };
  });

  const safeGames = rows.filter((r) => !anyRisk(r.normalized));
  const adInjected = rows.filter((r) => r.normalized.adsInjected);
  const popupRisk = rows.filter((r) => r.normalized.popupRisk);
  const redirectRisk = rows.filter((r) => r.normalized.redirectRisk);
  const changedUrls = rows.filter((r) => r.urlChanged);

  const outJson = path.join(process.cwd(), 'docs', 'unsafe-embed-report.json');
  const outMd = path.join(process.cwd(), 'docs', 'unsafe-embed-report.md');

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totals: {
          catalog: rows.length,
          safe: safeGames.length,
          adInjected: adInjected.length,
          popupRisk: popupRisk.length,
          redirectRisk: redirectRisk.length,
          normalizedUrlChanges: changedUrls.length,
        },
        rows,
      },
      null,
      2
    ),
    'utf8'
  );

  const md =
    `# Unsafe Embed Report\n\n` +
    `Generated: ${new Date().toISOString()}\n\n` +
    `## Totals\n\n` +
    `- Catalog games: **${rows.length}**\n` +
    `- Safe (no flags after normalization): **${safeGames.length}**\n` +
    `- adsInjected=true: **${adInjected.length}**\n` +
    `- popupRisk=true: **${popupRisk.length}**\n` +
    `- redirectRisk=true: **${redirectRisk.length}**\n` +
    `- URL normalized (rewritten): **${changedUrls.length}**\n\n` +
    `## URL normalizations (rewrites applied)\n\n` +
    (changedUrls.length
      ? `| Game | From | To |\n|---|---|---|\n` +
        changedUrls
          .map((r) => `| ${r.title} (\`${r.id}\`) | ${r.originalUrl} | ${r.normalizedUrl} |`)
          .join('\n') +
        `\n\n`
      : `No URLs required normalization.\n\n`) +
    `## Flagged games (post-normalization)\n\n` +
    (rows.length - safeGames.length
      ? `| Game | Domain | adsInjected | popupRisk | redirectRisk | URL |\n|---|---|---:|---:|---:|---|\n` +
        rows
          .filter((r) => anyRisk(r.normalized))
          .map(
            (r) =>
              `| ${r.title} (\`${r.id}\`) | ${r.domain} | ${r.normalized.adsInjected ? '✅' : ''} | ${
                r.normalized.popupRisk ? '✅' : ''
              } | ${r.normalized.redirectRisk ? '✅' : ''} | ${r.normalizedUrl} |`
          )
          .join('\n') +
        `\n`
      : `No games are flagged after normalization.\n`);

  fs.writeFileSync(outMd, md, 'utf8');

  console.log(`Wrote: ${outJson}`);
  console.log(`Wrote: ${outMd}`);
  console.log(`Safe: ${safeGames.length}/${rows.length}`);
  console.log(`Flagged: ${rows.length - safeGames.length}/${rows.length}`);
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

