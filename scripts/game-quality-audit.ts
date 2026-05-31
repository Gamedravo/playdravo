/**
 * Full game quality audit — thumbnails, URLs, duplicates, metadata.
 * Run: npx tsx scripts/game-quality-audit.ts
 */
import fs from 'fs';
import path from 'path';
import { GAMES } from '../src/games.js';
import { resolveGameThumbnail } from '../src/utils/gameUtils.js';

interface GameAudit {
  id: string;
  title: string;
  category: string;
  rating: number;
  thumbnail: string;
  resolvedThumbnail: string;
  localSvgExists: boolean;
  url: string;
  urlStatus: number | 'FAIL';
  thumbnailStatus: number | 'MISSING' | 'FAIL';
  fullscreenSupport: boolean;
  mobileOptimization: string;
  validationState: string;
  issues: string[];
}

async function checkUrl(url: string): Promise<number | 'FAIL'> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'PlayDravo-Audit/1.0' },
    });
    return res.status;
  } catch {
    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'PlayDravo-Audit/1.0' },
      });
      return res.status;
    } catch {
      return 'FAIL';
    }
  }
}

async function checkThumbnail(thumb: string, baseUrl: string): Promise<number | 'MISSING' | 'FAIL'> {
  if (!thumb) return 'MISSING';
  const url = thumb.startsWith('/')
    ? new URL(thumb, baseUrl).href
    : thumb;
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'PlayDravo-Audit/1.0' },
    });
    return res.status;
  } catch {
    return 'FAIL';
  }
}

async function run() {
  const baseUrl = 'http://localhost:4173';
  const publicRoot = path.resolve(process.cwd(), 'public');
  const thumbMap = new Map<string, string[]>();
  const results: GameAudit[] = [];

  for (const game of GAMES) {
    const resolved = resolveGameThumbnail(game.id, game.thumbnail);
    const svgPath = path.join(publicRoot, 'images', 'games', `${game.id}.svg`);
    const localSvgExists = fs.existsSync(svgPath);

    const list = thumbMap.get(resolved) ?? [];
    list.push(game.id);
    thumbMap.set(resolved, list);

    const issues: string[] = [];
    if (!localSvgExists) issues.push('missing-local-svg');
    if (!game.title) issues.push('missing-title');
    if (!game.category) issues.push('missing-category');
    if (!game.rating) issues.push('missing-rating');

    const urlStatus = await checkUrl(game.url);
    if (urlStatus === 'FAIL' || (typeof urlStatus === 'number' && urlStatus >= 400)) {
      issues.push('launch-failure');
    }

    const thumbnailStatus = await checkThumbnail(resolved, baseUrl);
    if (thumbnailStatus === 'MISSING' || thumbnailStatus === 'FAIL') {
      issues.push('thumbnail-failure');
    }

    results.push({
      id: game.id,
      title: game.title,
      category: game.category,
      rating: game.rating,
      thumbnail: game.thumbnail,
      resolvedThumbnail: resolved,
      localSvgExists,
      url: game.url,
      urlStatus,
      thumbnailStatus,
      fullscreenSupport: !!game.fullscreenSupport,
      mobileOptimization: game.mobileOptimization ?? 'unknown',
      validationState: game.validationState ?? 'unknown',
      issues,
    });
  }

  const duplicateArt = [...thumbMap.entries()].filter(([, ids]) => ids.length > 1);
  const broken = results.filter((r) => r.issues.includes('launch-failure'));
  const missingThumbs = results.filter((r) => r.issues.includes('thumbnail-failure') || !r.localSvgExists);

  console.log('\n=== GAME QUALITY AUDIT REPORT ===\n');
  console.log(`Total games: ${results.length}`);
  console.log(`Broken launch URLs: ${broken.length}`);
  console.log(`Thumbnail issues: ${missingThumbs.length}`);
  console.log(`Duplicate artwork groups: ${duplicateArt.length}`);

  if (broken.length) {
    console.log('\n--- BROKEN GAMES ---');
    broken.forEach((g) => console.log(`• ${g.title} (${g.id}) — ${g.url} [${g.urlStatus}]`));
  }

  if (missingThumbs.length) {
    console.log('\n--- THUMBNAIL ISSUES ---');
    missingThumbs.forEach((g) => console.log(`• ${g.title} (${g.id}) — ${g.resolvedThumbnail} [${g.thumbnailStatus}]`));
  }

  if (duplicateArt.length) {
    console.log('\n--- DUPLICATE ARTWORK ---');
    duplicateArt.forEach(([thumb, ids]) => console.log(`• ${thumb} → ${ids.join(', ')}`));
  }

  console.log('\n--- ALL GAMES SUMMARY ---');
  results.forEach((g) => {
    const flag = g.issues.length ? ` ⚠ ${g.issues.join(',')}` : ' ✓';
    console.log(`${flag} [${g.category}] ${g.title} | thumb:${g.thumbnailStatus} url:${g.urlStatus} mobile:${g.mobileOptimization}`);
  });

  const reportPath = path.resolve(process.cwd(), 'docs', 'game-quality-audit.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    `# Game Quality Audit\n\nGenerated: ${new Date().toISOString()}\n\n` +
      `| Metric | Count |\n|--------|-------|\n| Total | ${results.length} |\n| Broken URLs | ${broken.length} |\n| Thumbnail issues | ${missingThumbs.length} |\n| Duplicate art groups | ${duplicateArt.length} |\n\n` +
      `## Broken games\n\n${broken.map((g) => `- **${g.title}** (\`${g.id}\`) — ${g.url}`).join('\n') || 'None'}\n\n` +
      `## Thumbnail issues\n\n${missingThumbs.map((g) => `- **${g.title}** — ${g.resolvedThumbnail}`).join('\n') || 'None'}\n`
  );
  console.log(`\nReport written to ${reportPath}`);
}

run().catch(console.error);
