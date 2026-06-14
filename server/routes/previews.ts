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

function loadManifest(): Manifest {
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

export default router;
