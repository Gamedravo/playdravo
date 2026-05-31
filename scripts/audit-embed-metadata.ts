/**
 * Audits embedded game sources for automatic thumbnail/metadata extraction.
 * Run: npx tsx scripts/audit-embed-metadata.ts
 */
import { GAMES } from '../src/games.js';
import {
  getEmbedThumbnailCandidates,
  MANUAL_THUMBNAIL_OVERRIDES,
} from '../src/lib/embedThumbnailSources.js';

interface EmbedAuditRow {
  id: string;
  title: string;
  url: string;
  domain: string;
  ogImage: string | null;
  appleTouch: string | null;
  titleMeta: string | null;
  embedCandidates: string[];
  manualOverride: string | null;
  bestAutoSource: 'js13k-cover' | 'playcanvas' | 'og-image' | 'apple-touch' | 'manual' | 'svg-only';
}

async function fetchMeta(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'PlayDravo-Audit/1.0' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const appleMatch = html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    return {
      ogImage: ogMatch?.[1] ?? null,
      appleTouch: appleMatch?.[1] ?? null,
      titleMeta: titleMatch?.[1]?.trim() ?? null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function headOk(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(6000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function run() {
  console.log('\n=== EMBED METADATA AUDIT ===\n');
  const rows: EmbedAuditRow[] = [];

  for (const game of GAMES) {
    let domain = '';
    try {
      domain = new URL(game.url).hostname;
    } catch {
      domain = 'invalid';
    }

    const embedCandidates = getEmbedThumbnailCandidates(game.url).map((c) => c.url);
    const manualOverride = MANUAL_THUMBNAIL_OVERRIDES[game.id] ?? null;

    let meta: Awaited<ReturnType<typeof fetchMeta>> = null;
    if (domain !== 'invalid') {
      meta = await fetchMeta(game.url);
    }

    let bestAutoSource: EmbedAuditRow['bestAutoSource'] = 'svg-only';
    if (manualOverride) bestAutoSource = 'manual';
    else if (embedCandidates.some((u) => u.includes('js13kgames.com'))) bestAutoSource = 'js13k-cover';
    else if (embedCandidates.some((u) => u.includes('playcanv.as'))) bestAutoSource = 'playcanvas';
    else if (meta?.ogImage) bestAutoSource = 'og-image';
    else if (meta?.appleTouch || embedCandidates.some((u) => u.includes('apple-touch'))) bestAutoSource = 'apple-touch';

    rows.push({
      id: game.id,
      title: game.title,
      url: game.url,
      domain,
      ogImage: meta?.ogImage ?? null,
      appleTouch: meta?.appleTouch ?? null,
      titleMeta: meta?.titleMeta ?? null,
      embedCandidates,
      manualOverride,
      bestAutoSource,
    });
  }

  const bySource = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.bestAutoSource] = (acc[r.bestAutoSource] ?? 0) + 1;
    return acc;
  }, {});

  console.log('Summary by best auto thumbnail source:');
  Object.entries(bySource).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  console.log('\n--- FINDINGS ---');
  console.log('• js13kgames.com: /games/{slug}/cover.png returns 404 — NOT reliable; use local SVG art');
  console.log('• playcanv.as games: /p/{id}/thumb.png — RELIABLE');
  console.log('• github.io games: apple-touch-icon varies; og:image inconsistent');
  console.log('• Standalone domains (hextris.io, duckhunt.js.org): og:image or icons available');
  console.log('• mrdoob.com / educational tools: favicon only — SVG fallback required');
  console.log('• Automatic extraction: PARTIAL — use pattern-based URLs + SVG fallback chain\n');

  console.log('Games relying on SVG fallback only:');
  rows.filter((r) => r.bestAutoSource === 'svg-only').forEach((r) => {
    console.log(`  - ${r.title} (${r.id}) @ ${r.domain}`);
  });

  console.log('\nSample js13k cover verification (first 5):');
  const js13k = rows.filter((r) => r.bestAutoSource === 'js13k-cover').slice(0, 5);
  for (const row of js13k) {
    const cover = row.embedCandidates[0];
    const ok = cover ? await headOk(cover) : false;
    console.log(`  ${row.title}: ${cover} → ${ok ? 'OK' : 'FAIL'}`);
  }
}

run().catch(console.error);
