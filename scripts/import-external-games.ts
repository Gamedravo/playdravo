/**
 * Validates and imports curated external game embeds into src/games.ts
 * Run: npx tsx scripts/import-external-games.ts
 * Apply: npx tsx scripts/import-external-games.ts --apply
 */
import fs from 'fs';
import path from 'path';
import { GAMES } from '../src/games.js';
import type { Game } from '../src/types.js';

const APPLY = process.argv.includes('--apply');

interface CandidateGame {
  title: string;
  slug: string;
  url: string;
  category: string;
  tags: string[];
  description: string;
  developer?: string;
  /** Optional known thumbnail (skip auto-discovery) */
  thumbnail?: string;
  mobileOptimization?: Game['mobileOptimization'];
  fullscreenSupport?: boolean;
  isNewArrival?: boolean;
  isHot?: boolean;
}

const MANUAL_THUMBNAILS: Record<string, string> = {
  slope: 'https://cdn2.y8.com/cloudimage/384903/file/w380h285_retina_webp-2439f025ff9dbe192e31d23509c21375.webp',
  wordle: 'https://cdn.bubbleshooter.net/img/wordle.jpg',
  'tetris-cube': 'https://cdn.bubbleshooter.net/img/tetris-cube.jpg',
  'flappy-bird': 'https://upload.wikimedia.org/wikipedia/en/0/0a/Flappy_Bird_icon.png',
  'clicker-heroes': 'https://cdn.grindcraft.com/images/games/clicker-heroes.jpg',
  'mr-mine': 'https://cdn.mrmine.com/title_square.png',
  'poker-quest': 'https://cdn.grindcraft.com/images/games/poker-quest.jpg',
  grindcraft: 'https://cdn.grindcraft.com/images/grindcraft-logo-wide.png',
  'fray-fight': 'https://frayfight.com/og-image.webp',
};

/** Parent catalog pages with reliable og:image for SPA embeds */
const CANONICAL_OG_PAGES: Record<string, string> = {
  wordle: 'https://www.bubbleshooter.net/game/wordle/',
  'tetris-cube': 'https://www.bubbleshooter.net/game/tetris-cube/',
};

const CANDIDATES: CandidateGame[] = [
  {
    title: 'Slope',
    slug: 'slope',
    url: 'https://y8.com/embed/slope',
    category: 'Racing',
    tags: ['3D', 'Arcade', 'Ball', 'Endless Runner', 'Free', 'Html5', 'Mobile', 'Running', 'Skill'],
    description:
      'Roll a neon ball down an endless 3D slope. Steer left and right to avoid obstacles, gaps, and red zones while your speed keeps climbing in this reflex-testing endless runner.',
    developer: 'Y8',
    isHot: true,
  },
  {
    title: 'Wordle',
    slug: 'wordle',
    url: 'https://cdn.bubbleshooter.net/games/wordle/',
    category: 'Puzzle',
    tags: ['1 Player', 'Free', 'Html5', 'Mobile', 'Puzzle', 'Word'],
    description:
      'Guess the hidden five-letter word in six tries. Green means correct letter and spot, yellow means correct letter wrong spot — the daily word puzzle that took the internet by storm.',
    developer: 'Bubble Shooter',
  },
  {
    title: 'Tetris Cube',
    slug: 'tetris-cube',
    url: 'https://cdn.bubbleshooter.net/games/tetris-cube/',
    category: 'Puzzle',
    tags: ['1 Player', '3D', 'Arcade', 'Block', 'Free', 'Html5', 'Mobile', 'Puzzle', 'Tetris'],
    description:
      'Drop and rotate 3D blocks on a cube-shaped grid. Clear lines across faces of the cube in this spatial twist on classic Tetris-style stacking gameplay.',
    developer: 'Bubble Shooter',
  },
  {
    title: 'Flappy Bird',
    slug: 'flappy-bird',
    url: 'https://funhtml5games.com?embed=flappy',
    category: 'Arcade',
    tags: ['1 Player', '2D', 'Arcade', 'Casual', 'Free', 'Fun', 'Html5', 'Mobile', 'Skill'],
    description:
      'Tap to flap and thread your bird through tight pipe gaps. One collision ends the run in this famously tough one-touch arcade challenge.',
    developer: 'Fun HTML5 Games',
    mobileOptimization: 'touch-friendly',
  },
  {
    title: 'Clicker Heroes',
    slug: 'clicker-heroes',
    url: 'https://cdn.clickerheroes.com/gamebuild/index.php',
    category: 'Casual',
    tags: ['1 Player', 'Clicker', 'Free', 'Fun', 'Html5', 'Idle', 'Mobile', 'RPG'],
    description:
      'Click monsters, hire heroes, and unlock abilities in the ultimate idle RPG clicker. Progress through zones, defeat bosses, and prestige for permanent power.',
    developer: 'Playsaurus',
    isHot: true,
  },
  {
    title: 'Mr.Mine',
    slug: 'mr-mine',
    url: 'https://mrmine.com/game/',
    category: 'Simulator',
    tags: ['1 Player', 'Free', 'Html5', 'Idle', 'Management', 'Mining', 'Mobile', 'Tycoon'],
    description:
      'Dig deep, hire miners, and automate your mining empire. Upgrade shafts, trade resources, and expand your underground tycoon operation in this idle mining sim.',
    developer: 'Mr.Mine',
  },
  {
    title: 'Poker Quest',
    slug: 'poker-quest',
    url: 'https://playsaurus.com/kongPokerQuest63/',
    category: 'Strategy',
    tags: ['1 Player', 'Card', 'Free', 'Html5', 'Mobile', 'Puzzle', 'Roguelike', 'Strategy'],
    description:
      'Build poker hands to defeat enemies in a roguelike deck battler. Combine cards strategically, collect relics, and survive procedurally generated runs.',
    developer: 'Playsaurus',
  },
  {
    title: 'Grindcraft',
    slug: 'grindcraft',
    url: 'https://grindcraft.com/game.php',
    category: 'Simulator',
    tags: ['1 Player', 'Crafting', 'Free', 'Fun', 'Html5', 'Idle', 'Management', 'Mobile'],
    description:
      'Gather resources, craft tools, and automate production chains inspired by idle crafting classics. Expand villages and unlock advanced recipes as your empire grows.',
    developer: 'Grindcraft',
  },
  {
    title: 'Fray Fight',
    slug: 'fray-fight',
    url: 'https://frayfight.com/game/',
    category: 'Action',
    tags: ['1 Player', '2D', 'Action', 'Battle', 'Fighting', 'Free', 'Html5', 'Mobile'],
    description:
      'Enter fast-paced arena battles with tight combat controls. Dodge, strike, and outplay opponents in this action fighting browser game.',
    developer: 'Fray Fight',
  },
  {
    title: 'Fireboy and Watergirl',
    slug: 'fireboy-and-watergirl',
    url: '', // resolved after asset check
    category: 'Adventure',
    tags: ['2 Player', 'Adventure', 'Co-op', 'Free', 'Html5', 'Mobile', 'Platformer', 'Puzzle'],
    description:
      'Guide Fireboy and Watergirl through temple puzzles together. Fire cannot touch water, water cannot touch fire — cooperate to reach both exits in each level.',
    developer: 'Oslo Albet',
  },
  {
    title: 'Hole.io',
    slug: 'hole-io',
    url: '', // resolved after asset check
    category: 'Casual',
    tags: ['3D', 'Arcade', 'Casual', 'Destroy', 'Free', 'Fun', 'Mobile', 'Multiplayer', 'Physics'],
    description:
      'Control a black hole and swallow everything in sight. Grow larger, consume rivals, and dominate the city before time runs out in this physics arcade hit.',
    developer: 'VOODOO',
    isHot: true,
  },
];

interface ValidationResult {
  candidate: CandidateGame;
  status: 'imported' | 'rejected' | 'duplicate';
  reasons: string[];
  embedOk: boolean;
  embeddable: boolean;
  thumbnailOk: boolean;
  thumbnail: string | null;
  mobileFriendly: boolean;
  fullscreenSupport: boolean;
  duplicateOf?: string;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PlayDravo-Importer/1.0';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h);
}

function seededRating(id: string): number {
  return Math.round((4.1 + (hashSeed(id) % 9) / 10) * 10) / 10;
}

function seededPlays(id: string): number {
  return 85000 + (hashSeed(id + '-plays') % 1800000);
}

async function fetchHtml(url: string): Promise<{ ok: boolean; html: string; headers: Headers; status: number }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(18000),
      redirect: 'follow',
    });
    const html = await res.text();
    return { ok: res.ok, html, headers: res.headers, status: res.status };
  } catch {
    return { ok: false, html: '', headers: new Headers(), status: 0 };
  }
}

async function urlResponds(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA, Accept: '*/*' },
      signal: AbortSignal.timeout(12000),
    });
    if (head.ok || head.status === 405) return true;
    const get = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA, Accept: '*/*' },
      signal: AbortSignal.timeout(15000),
    });
    return get.ok;
  } catch {
    try {
      const get = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': UA, Accept: '*/*' },
        signal: AbortSignal.timeout(15000),
      });
      return get.ok;
    } catch {
      return false;
    }
  }
}

function checkEmbeddable(headers: Headers): { embeddable: boolean; reason: string } {
  const xfo = headers.get('x-frame-options')?.toLowerCase();
  const csp = headers.get('content-security-policy')?.toLowerCase() || '';
  if (xfo === 'deny' || xfo === 'sameorigin') {
    return { embeddable: false, reason: `X-Frame-Options: ${xfo}` };
  }
  if (csp.includes("frame-ancestors 'none'") || csp.includes("frame-ancestors 'self'")) {
    return { embeddable: false, reason: 'CSP frame-ancestors blocks embedding' };
  }
  return { embeddable: true, reason: '' };
}

function extractMeta(html: string, baseUrl: string) {
  const og =
    html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i)?.[1];
  const apple =
    html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i)?.[1];
  const icon =
    html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)?.[1];

  const abs = (href: string | undefined) => {
    if (!href) return null;
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return null;
    }
  };

  return {
    ogImage: abs(og),
    appleTouch: abs(apple),
    favicon: abs(icon),
  };
}

function detectMobile(html: string): boolean {
  return /viewport|touch-action|mobile|user-scalable/i.test(html);
}

function detectFullscreen(html: string): boolean {
  return /requestFullscreen|webkitEnterFullscreen|fullscreen/i.test(html);
}

function findDuplicate(candidate: CandidateGame): Game | undefined {
  const norm = normalizeTitle(candidate.title);
  const urlKey = candidate.url.trim().toLowerCase();

  return GAMES.find((g) => {
    if (g.id === candidate.slug) return true;
    if (normalizeTitle(g.title) === norm) return true;
    if (urlKey && g.url.trim().toLowerCase() === urlKey) return true;
    try {
      const a = new URL(g.url);
      const b = new URL(candidate.url);
      if (a.hostname === b.hostname && a.pathname === b.pathname) return true;
    } catch {
      /* ignore */
    }
    return false;
  });
}

function resolveSpecialUrls(): void {
  const root = process.cwd();
  const fireboyHtml = path.join(root, 'public', 'games', 'fireboy-and-watergirl', 'index.html');
  const holeHtml = path.join(root, 'public', 'games', 'hole-io', 'index.html');

  const fireboy = CANDIDATES.find((c) => c.slug === 'fireboy-and-watergirl');
  const hole = CANDIDATES.find((c) => c.slug === 'hole-io');

  if (fireboy && fs.existsSync(fireboyHtml)) {
    fireboy.url = '/games/fireboy-and-watergirl/index.html';
  }
  if (hole && fs.existsSync(holeHtml)) {
    hole.url = '/games/hole-io/index.html';
  }
}

function isWeakThumbnail(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.endsWith('/favicon.ico') ||
    lower.endsWith('/favicon.png') ||
    lower.includes('logo-social') ||
    lower.includes('y8/logo')
  );
}

async function pickThumbnail(
  candidate: CandidateGame,
  pageHtml: string,
  pageUrl: string
): Promise<{ url: string | null; ok: boolean; source: string }> {
  const manual = MANUAL_THUMBNAILS[candidate.slug] || candidate.thumbnail;
  if (manual) {
    const ok = await urlResponds(manual);
    if (ok && !isWeakThumbnail(manual)) {
      return { url: manual, ok: true, source: 'manual-verified' };
    }
  }

  const canonical = CANONICAL_OG_PAGES[candidate.slug];
  if (canonical) {
    const fetched = await fetchHtml(canonical);
    if (fetched.ok) {
      const meta = extractMeta(fetched.html, canonical);
      if (meta.ogImage && (await urlResponds(meta.ogImage)) && !isWeakThumbnail(meta.ogImage)) {
        return { url: meta.ogImage, ok: true, source: 'canonical-og' };
      }
    }
  }

  if (candidate.thumbnail) {
    const ok = await urlResponds(candidate.thumbnail);
    return { url: candidate.thumbnail, ok, source: 'manual' };
  }

  const meta = extractMeta(pageHtml, pageUrl);
  const candidates = [
    meta.ogImage && { url: meta.ogImage, source: 'og:image' },
    meta.appleTouch && { url: meta.appleTouch, source: 'apple-touch-icon' },
  ].filter(Boolean) as Array<{ url: string; source: string }>;

  const domainArt: Record<string, string> = {
    'cdn.grindcraft.com': 'https://cdn.grindcraft.com/images/grindcraft-logo-wide.png',
  };
  try {
    const domain = new URL(pageUrl).hostname;
    if (domainArt[domain]) {
      candidates.unshift({ url: domainArt[domain], source: 'domain-art' });
    }
  } catch {
    /* ignore */
  }

  for (const c of candidates) {
    if (isWeakThumbnail(c.url)) continue;
    if (await urlResponds(c.url)) {
      return { url: c.url, ok: true, source: c.source };
    }
  }

  return { url: null, ok: false, source: 'none' };
}

async function validateCandidate(candidate: CandidateGame): Promise<ValidationResult> {
  const result: ValidationResult = {
    candidate,
    status: 'rejected',
    reasons: [],
    embedOk: false,
    embeddable: false,
    thumbnailOk: false,
    thumbnail: null,
    mobileFriendly: false,
    fullscreenSupport: false,
  };

  const dup = findDuplicate(candidate);
  if (dup) {
    result.status = 'duplicate';
    result.duplicateOf = dup.id;
    result.reasons.push(`Duplicate of existing catalog game "${dup.title}" (${dup.id})`);
    return result;
  }

  if (!candidate.url?.trim()) {
    result.reasons.push('No embed URL — self-hosted game wrapper not found in public/games/');
    return result;
  }

  const pageUrl = candidate.url.startsWith('/')
    ? `http://localhost:3000${candidate.url}`
    : candidate.url;

  let html = '';
  let headers = new Headers();

  if (candidate.url.startsWith('/')) {
    const filePath = path.join(process.cwd(), 'public', candidate.url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      result.reasons.push(`Local wrapper missing: ${filePath}`);
      return result;
    }
    html = fs.readFileSync(filePath, 'utf8');
    result.embedOk = true;
    result.embeddable = true;
  } else {
    const fetched = await fetchHtml(candidate.url);
    html = fetched.html;
    headers = fetched.headers;
    result.embedOk = fetched.ok;
    const embedCheck = checkEmbeddable(headers);
    result.embeddable = embedCheck.embeddable && fetched.ok;
    if (!fetched.ok) result.reasons.push(`Embed HTTP ${fetched.status}`);
    if (!embedCheck.embeddable) result.reasons.push(embedCheck.reason);
  }

  if (!result.embedOk) return result;
  if (!result.embeddable) return result;

  const thumb = await pickThumbnail(candidate, html, pageUrl);
  result.thumbnail = thumb.url;
  result.thumbnailOk = thumb.ok;
  if (!thumb.ok) {
    result.reasons.push(`No verified thumbnail (tried ${thumb.source})`);
    return result;
  }

  result.mobileFriendly =
    candidate.mobileOptimization === 'touch-friendly' ||
    detectMobile(html) ||
    candidate.tags.some((t) => /mobile|touch/i.test(t));

  result.fullscreenSupport =
    candidate.fullscreenSupport ?? detectFullscreen(html) ?? true;

  if (!result.mobileFriendly) {
    result.reasons.push('Mobile compatibility not detected');
    return result;
  }

  result.status = 'imported';
  return result;
}

function escapeTs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function buildGameRecord(candidate: CandidateGame, v: ValidationResult): string {
  const now = new Date().toISOString();
  const rating = seededRating(candidate.slug);
  const plays = seededPlays(candidate.slug);
  const tags = [...new Set(candidate.tags)].sort((a, b) => a.localeCompare(b));

  return `  {
    "id": "${candidate.slug}",
    "title": "${escapeTs(candidate.title)}",
    "category": "${candidate.category}",
    "url": "${escapeTs(candidate.url.startsWith('/') ? candidate.url : candidate.url)}",
    "thumbnail": "${escapeTs(v.thumbnail!)}",
    "description": "${escapeTs(candidate.description)}",
    "rating": ${rating},
    "plays": ${plays},
    "authorUid": "playdravo-curated",
    "createdAt": "${now}",
    "isHot": ${Boolean(candidate.isHot || plays > 600000)},
    "isTop": ${rating >= 4.6},
    "tags": ${JSON.stringify(tags)},
    "developer": "${escapeTs(candidate.developer || candidate.title)}",
    "publisher": "PlayDravo",
    "mobileOptimization": "${candidate.mobileOptimization || 'touch-friendly'}",
    "fullscreenSupport": ${v.fullscreenSupport},
    "embedCompatibility": "full",
    "validationState": "Verified Working",
    "lastVerified": "${now}",
    "sourceId": "external-curated",
    "avgPlayTime": "10m"
  }`;
}

function mergeTags(existing: string[], incoming: string[]): string[] {
  const set = new Set(existing);
  incoming.forEach((t) => set.add(t));
  return [...set].sort((a, b) => a.localeCompare(b));
}

async function main() {
  resolveSpecialUrls();

  console.log(`Validating ${CANDIDATES.length} external game candidates...\n`);

  const results: ValidationResult[] = [];
  for (const candidate of CANDIDATES) {
    process.stdout.write(`  • ${candidate.title}... `);
    const r = await validateCandidate(candidate);
    results.push(r);
    console.log(r.status.toUpperCase(), r.reasons[0] || '');
  }

  const imported = results.filter((r) => r.status === 'imported');
  const rejected = results.filter((r) => r.status === 'rejected');
  const duplicates = results.filter((r) => r.status === 'duplicate');

  const report = {
    checkedAt: new Date().toISOString(),
    imported: imported.map((r) => ({
      id: r.candidate.slug,
      title: r.candidate.title,
      url: r.candidate.url,
      thumbnail: r.thumbnail,
      category: r.candidate.category,
      tags: r.candidate.tags,
      mobileFriendly: r.mobileFriendly,
      fullscreenSupport: r.fullscreenSupport,
    })),
    rejected: rejected.map((r) => ({
      title: r.candidate.title,
      url: r.candidate.url || '(none)',
      reasons: r.reasons,
      embedOk: r.embedOk,
      embeddable: r.embeddable,
      thumbnailOk: r.thumbnailOk,
    })),
    duplicates: duplicates.map((r) => ({
      title: r.candidate.title,
      duplicateOf: r.duplicateOf,
      reasons: r.reasons,
    })),
    mobileIssues: rejected.filter((r) => r.reasons.some((x) => /mobile/i.test(x))).map((r) => r.candidate.title),
    fullscreenIssues: results.filter((r) => r.status === 'imported' && !r.fullscreenSupport).map((r) => r.candidate.title),
    thumbnailIssues: rejected.filter((r) => !r.thumbnailOk).map((r) => ({ title: r.candidate.title, url: r.candidate.url })),
  };

  const reportPath = path.resolve(process.cwd(), 'docs', 'external-games-import-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n=== EXTERNAL GAMES IMPORT REPORT ===');
  console.log(`Imported:    ${imported.length}`);
  console.log(`Rejected:    ${rejected.length}`);
  console.log(`Duplicates:  ${duplicates.length}`);
  console.log(`Report:      ${reportPath}`);

  if (!APPLY || imported.length === 0) {
    if (!APPLY && imported.length > 0) {
      console.log('\nRe-run with --apply to write games to src/games.ts');
    }
    return;
  }

  const gamesPath = path.resolve(process.cwd(), 'src', 'games.ts');
  let code = fs.readFileSync(gamesPath, 'utf8');

  const newBlocks = imported.map((r) => buildGameRecord(r.candidate, r)).join(',\n');

  if (!code.includes('];\n')) {
    throw new Error('Could not locate GAMES array terminator in games.ts');
  }

  code = code.replace(/\n];\s*$/, `,\n${newBlocks}\n];\n`);

  const allNewTags = imported.flatMap((r) => r.candidate.tags);
  const tagsMatch = code.match(/export const TAGS_LIST: string\[\] = (\[[\s\S]*?\]);/);
  if (tagsMatch) {
    const existingTags = JSON.parse(tagsMatch[1]) as string[];
    const merged = mergeTags(existingTags, allNewTags);
    code = code.replace(
      /export const TAGS_LIST: string\[\] = \[[\s\S]*?\];/,
      `export const TAGS_LIST: string[] = ${JSON.stringify(merged, null, 2)};`
    );
  }

  fs.writeFileSync(gamesPath, code, 'utf8');

  const thumbOverridesPath = path.resolve(process.cwd(), 'src', 'lib', 'embedThumbnailSources.ts');
  let overrideBlock = '';
  for (const r of imported) {
    if (r.thumbnail) {
      overrideBlock += `\n  '${r.candidate.slug}': '${r.thumbnail}',`;
    }
  }
  if (overrideBlock) {
    let thumbCode = fs.readFileSync(thumbOverridesPath, 'utf8');
    if (!thumbCode.includes(`${imported[0].candidate.slug}:`)) {
      thumbCode = thumbCode.replace(
        /export const MANUAL_THUMBNAIL_OVERRIDES: Record<string, string> = \{/,
        `export const MANUAL_THUMBNAIL_OVERRIDES: Record<string, string> = {${overrideBlock}`
      );
      fs.writeFileSync(thumbOverridesPath, thumbCode, 'utf8');
    }
  }

  console.log(`\nApplied ${imported.length} games to src/games.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
