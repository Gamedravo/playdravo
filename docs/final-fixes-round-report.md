# PlayDravo — Final Fixes Round (Report)

Generated: 2026-06-02

## 1) Sitemap + robots.txt

### ✅ Fixes applied
- **Valid sitemap.xml (sitemaps.org schema)** is now generated automatically at build time:
  - Build step runs `scripts/generate-sitemap.ts` → outputs **`public/sitemap.xml`**.
  - Includes static routes:
    - `/`, `/search`, `/about`, `/support`, `/status`, `/contact`, `/privacy`, `/terms`, `/cookies`
  - Includes **every game page** automatically: `/games/:gameId`
- **Correct Content-Type for sitemap** in production server:
  - `GET /sitemap.xml` explicitly returns **`application/xml`**.
- **robots.txt verified**
  - Contains:
    - `User-agent: *`
    - `Allow: /`
    - `Sitemap: https://www.gamedravo.com/sitemap.xml`

### Files changed
- `scripts/generate-sitemap.ts`
- `package.json` (build pipeline)
- `server.ts` (explicit sitemap/robots routes)
- `public/sitemap.xml` (generated)

---

## 2) Mobile double PlayDravo logo

### ✅ Fixes applied
- Login overlay opacity increased so the header brand behind it does **not** show through on mobile:
  - Reduced the chance of “double branding” (header logo + login logo visible simultaneously).

### Files changed
- `src/components/LoginModal.tsx`

---

## 3) Google login delay (logged out until refresh)

### ✅ Fixes applied
- Auth initialization now **awaits Firebase persistence** before installing auth listeners:
  - Prevents missed/late auth state propagation after OAuth popup completes.
- `onAuthStateChanged` still remains the single source of truth for user/session state.

### Files changed
- `src/App.tsx`

---

## 4) Embedded game ads (ad injection)

### ✅ Fixes applied
- Added `adsInjected: boolean` flag (derived automatically from embed URL patterns/domains).
- UX protection:
  - Ad-injecting games are excluded from general discovery surfaces by default (still visible via **direct search**, **Favorites**, and **History**).
  - Ad-injecting games are blocked from embedding on the Game page and opened in **standalone** mode instead.
- Generated an ads audit report (heuristic-based):
  - `docs/ads-injection-report.md`
  - `docs/ads-injection-report.json`

### Files changed / added
- `src/types.ts` (adds `adsInjected`)
- `src/lib/adsInjection.ts` (flag inference)
- `src/utils/gameUtils.ts` (ensures Firebase-parsed games carry the flag)
- `src/App.tsx` (filters discovery surfaces)
- `src/pages/GamePage.tsx` (blocks embeds when `adsInjected`)
- `scripts/audit-ads-injection.ts` (+ `npm run audit:ads`)
- `docs/ads-injection-report.*` (generated)

---

## 5) Restore video preview feature

### ✅ Fixes applied
- Restored preview system supporting:
  - **YouTube** previews via `trailerUrl`
  - **MP4** previews via `previewVideoUrl`
- Preview display locations:
  - **Game details page** (“Screenshots & Media” section)
  - **Featured spotlight** (Preview button opens a modal)
- Video behavior:
  - Lazy-loads (loads only after user click + in-viewport)
  - No autoplay with sound
  - Poster shown before playback

### Files changed / added
- `src/components/GamePreviewPlayer.tsx` (new)
- `src/pages/GamePage.tsx`
- `src/components/FeaturedSpotlight.tsx`

---

## 6) SEO & indexing

### ✅ Fixes applied
- Canonical URLs:
  - `SEO` component now emits `<link rel="canonical">` (and uses canonical for `og:url`)
  - Strips common tracking params (`utm_*`, `gclid`, `fbclid`, etc.)
- Open Graph improvements:
  - Adds `og:site_name`
- Structured data:
  - Home page: basic `WebSite`
  - Game page: `VideoGame` JSON-LD

### Files changed
- `src/components/SEO.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/GamePage.tsx`

---

## 7) Final QA summary

### ✅ Automated checks run
- `npm run lint` (TypeScript) — **PASS**
- `npm run build` — **PASS**
- `npm run audit:ads` — **PASS** (report generated)

### Lighthouse score
- Not generated in this environment: `npx lighthouse` failed with **“No Chrome installations found.”**
- Recommended local run (on a machine with Chrome installed):
  - Start the app: `npm run build && npm start`
  - Then run: `npx lighthouse https://www.gamedravo.com --view`

### Remaining risks / follow-ups
- **Ads injection detection is heuristic-based.** Some embeds may still inject ads dynamically even if not flagged by URL pattern. Use the `--fetch` option in `scripts/audit-ads-injection.ts` for slower keyword scanning if needed.
- If Google Search Console reports indexing issues, next steps typically include:
  - verifying canonical URLs on key templates,
  - verifying sitemap fetch/parse in GSC,
  - ensuring all important pages return 200 in production (no SPA fallback for `sitemap.xml` / `robots.txt`).

