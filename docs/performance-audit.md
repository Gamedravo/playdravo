# Performance audit (Phase 4)

## Targets

| Area | Goal | Changes |
|------|------|---------|
| Initial load | Fast first paint | Removed framer-motion from notification panel; shorter route fade (120ms); no sidebar hover re-renders |
| Homepage | Less repetition, fewer DOM nodes | Curated shelf playlist (max 5 tag rows); redundant tag shelves removed |
| Search | Instant filter | Existing memoized `filteredGames` in App (unchanged) |
| Navigation | Snappy transitions | Route-aware skeleton fallbacks; no fullscreen blocking loaders |
| Notifications | Instant open | CSS-only panel (no AnimatePresence); 2px anchor gap |
| Card hover | No route prefetch jank | GamePage chunk not prefetched on hover |

## How to measure locally

```bash
npm run build
npm run preview
```

Chrome DevTools → Performance → record homepage load and bell click.

Lighthouse (mobile): target LCP &lt; 2.5s on mid-tier device with throttling.

## Thumbnails

```bash
npm run audit:thumbnails
npm run audit:thumbnails -- --apply
```

Probes `md` / `lg` variants per game and can rewrite `src/games.ts` with the best reachable asset.
