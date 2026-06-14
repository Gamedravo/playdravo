import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const PREVIEWS_DIR = path.resolve(process.cwd(), 'public/previews');
const MANIFEST_FILE = path.join(PREVIEWS_DIR, 'manifest.json');

function ensureDir() {
  try {
    if (!fs.existsSync(PREVIEWS_DIR)) {
      fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
    }
  } catch {
    // Non-fatal: read-only filesystem or permission issue. Manifest will return {} safely.
  }
}

try { ensureDir(); } catch { /* ignore startup errors */ }

export interface PreviewEntry {
  url: string;
  kind: 'mp4' | 'webm' | 'gif';
  source: 'scraped' | 'manual' | 'local';
  capturedAt: string;
  gameTitle?: string;
}

type Manifest = Record<string, PreviewEntry>;

export function loadManifest(): Manifest {
  try {
    if (fs.existsSync(MANIFEST_FILE)) {
      return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    }
  } catch {}
  return {};
}

function saveManifest(m: Manifest): void {
  ensureDir();
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(m, null, 2), 'utf-8');
}

// GET /api/previews/manifest
// Publicly accessible — returns {} if no previews have been captured yet.
// Must never return a non-2xx status so Googlebot doesn't flag it as a failed resource.
router.get('/manifest', (_req, res) => {
  try {
    const manifest = loadManifest();
    res
      .set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
      .set('Content-Type', 'application/json; charset=utf-8')
      .json(manifest);
  } catch {
    res
      .set('Cache-Control', 'no-store')
      .set('Content-Type', 'application/json; charset=utf-8')
      .json({});
  }
});

// GET /api/previews/stats
router.get('/stats', (_req, res) => {
  const manifest = loadManifest();
  const entries = Object.entries(manifest);
  const byKind = entries.reduce<Record<string, number>>((acc, [, e]) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});
  res.json({
    total: entries.length,
    byKind,
    bySource: entries.reduce<Record<string, number>>((acc, [, e]) => {
      acc[e.source] = (acc[e.source] ?? 0) + 1;
      return acc;
    }, {}),
  });
});

export interface ScrapedCandidate {
  url: string;
  kind: 'mp4' | 'webm' | 'gif';
  size?: number;
}

async function scrapeGamePage(pageUrl: string): Promise<ScrapedCandidate[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9_000);

  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const found: ScrapedCandidate[] = [];
    const seen = new Set<string>();

    const add = (rawUrl: string, kind: 'mp4' | 'webm' | 'gif') => {
      if (!rawUrl) return;
      try {
        const abs = new URL(rawUrl.trim(), pageUrl).href;
        if (!seen.has(abs)) {
          seen.add(abs);
          found.push({ url: abs, kind });
        }
      } catch {}
    };

    // <video src> / <source src> / data-src
    for (const m of html.matchAll(/(?:src|data-src)=["']([^"']+\.mp4(?:[?#][^"']*)?)["']/gi)) add(m[1], 'mp4');
    for (const m of html.matchAll(/(?:src|data-src)=["']([^"']+\.webm(?:[?#][^"']*)?)["']/gi)) add(m[1], 'webm');
    for (const m of html.matchAll(/(?:src|data-src)=["']([^"']+\.gif(?:[?#][^"']*)?)["']/gi)) add(m[1], 'gif');

    // og:video meta (both attribute orderings)
    for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["']og:video(?::url)?["'][^>]+content=["']([^"']+)["']/gi)) {
      const u = m[1];
      add(u, u.includes('.webm') ? 'webm' : u.includes('.gif') ? 'gif' : 'mp4');
    }
    for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:video(?::url)?["']/gi)) {
      const u = m[1];
      add(u, u.includes('.webm') ? 'webm' : u.includes('.gif') ? 'gif' : 'mp4');
    }

    // JSON-LD contentUrl / thumbnailUrl video
    const jsonLdMatch = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const obj = JSON.parse(jsonLdMatch[1]);
        const check = (v: string) => {
          if (typeof v === 'string' && /\.(mp4|webm|gif)(\?|#|$)/i.test(v)) {
            const ext = v.match(/\.(mp4|webm|gif)/i)?.[1]?.toLowerCase() as 'mp4' | 'webm' | 'gif';
            if (ext) add(v, ext);
          }
        };
        check(obj?.contentUrl);
        check(obj?.thumbnailUrl);
        check(obj?.video?.contentUrl);
      } catch {}
    }

    return found;
  } finally {
    clearTimeout(timer);
  }
}

// POST /api/previews/probe  { gameId, gameUrl, gameTitle? }
router.post('/probe', async (req, res) => {
  const { gameId, gameUrl, gameTitle } = req.body ?? {};
  if (!gameId || !gameUrl) {
    return res.status(400).json({ error: 'gameId and gameUrl required' });
  }
  try {
    const candidates = await scrapeGamePage(gameUrl);
    res.json({ gameId, gameTitle, candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? 'Scrape failed' });
  }
});

// POST /api/previews/save  { gameId, url, kind, gameTitle?, local? }
router.post('/save', async (req, res) => {
  const { gameId, url, kind, gameTitle, local = false } = req.body ?? {};
  if (!gameId || !url || !kind) {
    return res.status(400).json({ error: 'gameId, url, kind required' });
  }

  const manifest = loadManifest();

  if (local) {
    ensureDir();
    const ext = kind as string;
    const filename = `${gameId}.${ext}`;
    const filePath = path.join(PREVIEWS_DIR, filename);

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'GameDravo-Preview/1.0' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buf = await response.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buf));

      manifest[gameId] = {
        url: `/previews/${filename}`,
        kind: ext as 'mp4' | 'webm' | 'gif',
        source: 'local',
        capturedAt: new Date().toISOString(),
        gameTitle,
      };
      saveManifest(manifest);
      return res.json({ ok: true, url: `/previews/${filename}` });
    } catch (err: any) {
      return res.status(502).json({ error: err.message });
    }
  } else {
    manifest[gameId] = {
      url,
      kind: kind as 'mp4' | 'webm' | 'gif',
      source: 'scraped',
      capturedAt: new Date().toISOString(),
      gameTitle,
    };
    saveManifest(manifest);
    return res.json({ ok: true, url });
  }
});

// DELETE /api/previews/:gameId
router.delete('/:gameId', (req, res) => {
  const { gameId } = req.params;
  const manifest = loadManifest();

  if (!manifest[gameId]) {
    return res.status(404).json({ error: 'Not found' });
  }

  const entry = manifest[gameId];
  if (entry.source === 'local' && entry.url.startsWith('/previews/')) {
    const filePath = path.join(PREVIEWS_DIR, path.basename(entry.url));
    try { fs.unlinkSync(filePath); } catch {}
  }

  delete manifest[gameId];
  saveManifest(manifest);
  res.json({ ok: true });
});

// ─── Auto-Probe Pipeline ─────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'game';
}

async function headOk(url: string): Promise<boolean> {
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3_500),
      headers: {
        'User-Agent': 'GameDravo-Preview/1.0',
        Referer: 'https://www.onlinegames.io/',
      },
    });
    const ct = r.headers.get('content-type') ?? '';
    return r.ok && r.status === 200 && !ct.startsWith('text/html');
  } catch {
    return false;
  }
}

interface RawOnlineGame {
  title: string;
  embed: string;
  image: string;
}

function extractEmbedSlug(embedUrl: string): string | null {
  try {
    const parts = new URL(embedUrl).pathname.split('/').filter(Boolean);
    // Remove trailing 'index.html' or similar
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) parts.pop();
    return parts[parts.length - 1] ?? null;
  } catch {
    return null;
  }
}

function cdnCandidatesForOnlineGame(
  embedUrl: string,
  titleSlug: string,
): { url: string; kind: 'mp4' | 'gif' }[] {
  const candidates: { url: string; kind: 'mp4' | 'gif' }[] = [];
  try {
    const u = new URL(embedUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.includes('.')) parts.pop();
    const embedSlug = parts[parts.length - 1] ?? titleSlug;
    const base = `${u.protocol}//${u.host}/${parts.join('/')}/`;

    candidates.push(
      { url: `${base}preview.mp4`, kind: 'mp4' },
      { url: `${base}gameplay.mp4`, kind: 'mp4' },
      { url: `${base}video.mp4`, kind: 'mp4' },
      { url: `${base}preview.gif`, kind: 'gif' },
      { url: `https://www.onlinegames.io/media/cache/preview/${embedSlug}.mp4`, kind: 'mp4' },
      { url: `https://www.onlinegames.io/media/cache/preview/${embedSlug}.gif`, kind: 'gif' },
      { url: `https://cdn.onlinegames.io/preview/${embedSlug}.mp4`, kind: 'mp4' },
    );
  } catch {
    // malformed URL
  }
  return candidates;
}

async function probeOnlineGame(
  rawGame: RawOnlineGame,
): Promise<{ gameId: string; url: string; kind: 'mp4' | 'gif'; title: string } | null> {
  const gameId = slugify(rawGame.title);

  // Strategy 1: Fast HEAD checks against known CDN patterns
  const cdnCandidates = cdnCandidatesForOnlineGame(rawGame.embed, gameId);
  for (const { url, kind } of cdnCandidates) {
    if (await headOk(url)) {
      return { gameId, url, kind, title: rawGame.title };
    }
  }

  // Strategy 2: Scrape the OnlineGames.io listing page for og:video / embedded videos
  const embedSlug = extractEmbedSlug(rawGame.embed);
  if (embedSlug) {
    try {
      const scraped = await scrapeGamePage(`https://www.onlinegames.io/${embedSlug}/`);
      const hit = scraped.find((c) => c.kind === 'mp4' || c.kind === 'webm' || c.kind === 'gif');
      if (hit) {
        const kind: 'mp4' | 'gif' = hit.kind === 'gif' ? 'gif' : 'mp4';
        return { gameId, url: hit.url, kind, title: rawGame.title };
      }
    } catch {
      // Non-fatal: listing page scrape failed
    }
  }

  return null;
}

// ─── Auto-probe state ────────────────────────────────────────────────────────

interface ProbeState {
  running: boolean;
  total: number;
  done: number;
  found: number;
  startedAt: string | null;
  finishedAt: string | null;
}

const probeState: ProbeState = {
  running: false,
  total: 0,
  done: 0,
  found: 0,
  startedAt: null,
  finishedAt: null,
};

/**
 * Background batch CDN probe for all OnlineGames.io games.
 * Skips games already in the manifest.
 * Rate-limited: CONCURRENCY parallel probes, DELAY_MS between batches.
 */
export async function startAutoProbe(rawGames: RawOnlineGame[]): Promise<void> {
  if (probeState.running) return;

  const manifest = loadManifest();
  const toProbe = rawGames.filter((g) => g.title && g.embed && !manifest[slugify(g.title)]);

  probeState.running = true;
  probeState.total = toProbe.length;
  probeState.done = 0;
  probeState.found = 0;
  probeState.startedAt = new Date().toISOString();
  probeState.finishedAt = null;

  const CONCURRENCY = 6;
  const DELAY_MS = 250;

  try {
    for (let i = 0; i < toProbe.length; i += CONCURRENCY) {
      const batch = toProbe.slice(i, i + CONCURRENCY);
      const results = await Promise.all(batch.map(probeOnlineGame));

      const m = loadManifest(); // re-read to avoid overwrite races
      let batchFound = 0;
      for (const r of results) {
        if (r && !m[r.gameId]) {
          m[r.gameId] = {
            url: r.url,
            kind: r.kind,
            source: 'scraped',
            capturedAt: new Date().toISOString(),
            gameTitle: r.title,
          };
          batchFound++;
        }
      }
      if (batchFound > 0) saveManifest(m);

      probeState.done += batch.length;
      probeState.found += batchFound;

      if (i + CONCURRENCY < toProbe.length) {
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    }
  } finally {
    probeState.running = false;
    probeState.finishedAt = new Date().toISOString();
    const m = loadManifest();
    console.log(
      `[AutoProbe] Done — scanned ${probeState.done} games, found ${probeState.found} previews, manifest total: ${Object.keys(m).length}`,
    );
  }
}

// GET /api/previews/probe-status
router.get('/probe-status', (_req, res) => {
  res.json({
    ...probeState,
    manifestSize: Object.keys(loadManifest()).length,
  });
});

// POST /api/previews/auto-probe  — trigger manually (admin)
router.post('/auto-probe', async (req, res) => {
  if (probeState.running) {
    return res.status(409).json({ error: 'Probe already running', state: probeState });
  }
  const { games } = req.body ?? {};
  if (!Array.isArray(games) || games.length === 0) {
    return res.status(400).json({ error: 'games array required' });
  }
  res.json({ ok: true, queued: games.length, message: 'Auto-probe started in background' });
  startAutoProbe(games as RawOnlineGame[]).catch(() => {});
});

export default router;
