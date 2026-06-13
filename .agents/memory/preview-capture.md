---
name: Preview Capture System
description: Architecture and decisions for Phase 2 automatic game hover preview system
---

## Architecture

- `server/routes/previews.ts` — Express router mounted at `/api/previews`; reads/writes `public/previews/manifest.json`
- `public/previews/` — runtime storage for locally-downloaded preview files; served via `express.static` at `/previews/`
- `src/hooks/usePreviewManifest.ts` — singleton fetch with module-level cache; `fetchPreviewManifest()` (async) + `usePreviewManifest()` (hook)
- `src/pages/PreviewDashboardPage.tsx` — admin UI at `/admin/previews`; probe/save/delete per game; bulk probe top-50

## Key Decisions

**Manifest is a JSON file, not a DB table.**
**Why:** Previews are curated metadata, not user data. JSON file is simpler, survives DB resets, and is portable.

**Frontend merges manifest into game objects at startup.**
**Why:** `getPreviewMediaCandidates` already handles `previewVideoUrl`/`previewGifUrl` as priority #1; no need to change the preview rendering pipeline — just inject the URL into the right game field.
**How:** `useEffect` in App.tsx calls `fetchPreviewManifest()` after catalog load; maps over games; skips games that already have explicit `previewVideoUrl`/`previewGifUrl`.

**Scraper uses regex, not a DOM parser.**
**Why:** No additional dependencies (cheerio/jsdom) needed. Regex covers `src`/`data-src` attributes for `.mp4`, `.webm`, `.gif`; `og:video` meta; JSON-LD `contentUrl`.

**Save has two modes: `local=false` (store remote URL) and `local=true` (download file).**
**Why:** Remote URLs are instant; local copies are CORS-safe and don't depend on upstream CDN availability.

## API Endpoints

- `GET  /api/previews/manifest` — returns `{[gameId]: PreviewEntry}`
- `GET  /api/previews/stats` — summary counts by kind/source
- `POST /api/previews/probe` — body: `{gameId, gameUrl, gameTitle?}` → `{candidates: [{url, kind}]}`
- `POST /api/previews/save` — body: `{gameId, url, kind, gameTitle?, local?}` → `{ok, url}`
- `DELETE /api/previews/:gameId` — removes entry + local file if applicable

## Limitations

Cross-origin game iframes cannot be screen-recorded server-side. The scraper finds preview media that the game's *marketing page* exposes (og:video, `<video src>`, etc.) — not actual gameplay capture. Many game pages embed the game as an opaque iframe with no surrounding media URLs, so probe may return zero candidates.
