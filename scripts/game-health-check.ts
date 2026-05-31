/**
 * Validates every game in src/games.ts (embed + thumbnail).
 * Writes docs/game-health-report.json and optionally regenerates catalog.
 *
 * Run: npx tsx scripts/game-health-check.ts
 * Apply: npx tsx scripts/game-health-check.ts --apply
 */
import fs from 'fs';
import path from 'path';
import { GAMES } from '../src/games.js';
import type { Game } from '../src/types.js';

const CONCURRENCY = 10;

interface GameHealthRow {
  id: string;
  title: string;
  category: string;
  embed: string;
  thumbnail: string;
  embedOk: boolean;
  thumbnailOk: boolean;
  mobileFriendly: boolean;
  issues: string[];
}

interface HealthReport {
  checkedAt: string;
  total: number;
  working: number;
  broken: number;
  workingGames: Array<{ id: string; title: string }>;
  brokenGames: Array<{ id: string; title: string; issues: string[] }>;
  removedGames: Array<{ id: string; title: string; issues: string[] }>;
}

async function urlOk(url: string): Promise<boolean> {
  const headers = {
    'User-Agent': 'Mozilla/5.0 PlayDravo-HealthCheck/1.0',
    Accept: '*/*',
  };
  try {
    const head = await fetch(url, { method: 'HEAD', headers, signal: AbortSignal.timeout(12000) });
    if (head.ok || head.status === 405) return true;
    if (head.status < 500) {
      const get = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(15000) });
      return get.ok;
    }
  } catch {
    try {
      const get = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(15000) });
      return get.ok;
    } catch {
      return false;
    }
  }
  return false;
}

async function mapPool<T, R>(items: T[], fn: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function isLegacyGame(game: Game): boolean {
  if (game.sourceId === 'onlinegames-io') return false;
  if (game.authorUid === 'onlinegames-io') return false;
  if (game.thumbnail?.startsWith('/images/games/')) return true;
  if (game.authorUid === 'system' && !game.sourceId) return true;
  return false;
}

async function checkGame(game: Game): Promise<GameHealthRow> {
  const issues: string[] = [];
  if (isLegacyGame(game)) issues.push('legacy-ai-studio-or-placeholder');
  if (!game.title?.trim()) issues.push('missing-title');
  if (!game.url?.trim()) issues.push('missing-embed');
  if (!game.thumbnail?.trim()) issues.push('missing-thumbnail');
  if (game.thumbnail?.startsWith('/images/games/')) issues.push('local-svg-placeholder');

  const [embedOk, thumbnailOk] = await Promise.all([
    game.url ? urlOk(game.url) : Promise.resolve(false),
    game.thumbnail && !game.thumbnail.startsWith('/images/')
      ? urlOk(game.thumbnail)
      : Promise.resolve(false),
  ]);

  if (!embedOk) issues.push('broken-embed');
  if (!thumbnailOk) issues.push('broken-thumbnail');

  const tagHaystack = [...(game.tags || []), game.mobileOptimization || ''].join(' ').toLowerCase();
  const mobileFriendly =
    game.mobileOptimization === 'touch-friendly' ||
    game.mobileOptimization === 'responsive' ||
    /\bmobile\b/i.test(tagHaystack);

  return {
    id: game.id,
    title: game.title,
    category: game.category,
    embed: game.url,
    thumbnail: game.thumbnail,
    embedOk,
    thumbnailOk,
    mobileFriendly,
    issues,
  };
}

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`Health-checking ${GAMES.length} catalog games...\n`);

  const rows = await mapPool(GAMES, checkGame, CONCURRENCY);

  const workingRows = rows.filter((r) => r.embedOk && r.thumbnailOk && r.issues.length === 0);
  const brokenRows = rows.filter((r) => !(r.embedOk && r.thumbnailOk && r.issues.length === 0));

  const report: HealthReport = {
    checkedAt: new Date().toISOString(),
    total: GAMES.length,
    working: workingRows.length,
    broken: brokenRows.length,
    workingGames: workingRows.map((r) => ({ id: r.id, title: r.title })),
    brokenGames: brokenRows.map((r) => ({ id: r.id, title: r.title, issues: r.issues })),
    removedGames: brokenRows.map((r) => ({ id: r.id, title: r.title, issues: r.issues })),
  };

  const reportPath = path.resolve(process.cwd(), 'docs', 'game-health-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('=== GAME HEALTH REPORT ===');
  console.log(`Total:    ${report.total}`);
  console.log(`Working:  ${report.working}`);
  console.log(`Broken:   ${report.broken}`);
  console.log(`Report:   ${reportPath}\n`);

  if (brokenRows.length) {
    console.log('Broken / removed:');
    brokenRows.slice(0, 30).forEach((r) => {
      console.log(`  - ${r.title} (${r.id}): ${r.issues.join(', ')}`);
    });
    if (brokenRows.length > 30) console.log(`  ... and ${brokenRows.length - 30} more`);
  }

  if (apply && brokenRows.length > 0) {
    const workingIds = new Set(workingRows.map((r) => r.id));
    const kept = GAMES.filter((g) => workingIds.has(g.id));
    const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
    const content = fs.readFileSync(gamesPath, 'utf8');
    const match = content.match(/export const GAMES: Game\[\] = (\[[\s\S]*\]);/);
    if (!match) {
      console.error('Could not parse games.ts for rewrite');
      process.exit(1);
    }
    const header = content.slice(0, content.indexOf('export const GAMES'));
    const tagsMatch = content.match(/export const TAGS_LIST[\s\S]*?;\n\n/);
    const tagsBlock = tagsMatch ? tagsMatch[0] : '';
    const gamesJson = JSON.stringify(kept, null, 2);
    const out = `${header}export const GAMES: Game[] = ${gamesJson};\n`;
    fs.writeFileSync(gamesPath, out, 'utf8');
    console.log(`\nApplied: wrote ${kept.length} working games to src/games.ts`);
  } else if (apply) {
    console.log('\nNo changes needed — all games passed.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
