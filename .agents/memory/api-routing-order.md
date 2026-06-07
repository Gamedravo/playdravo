---
name: API routing order in Express+Vite dev server
description: Express API routes must be registered at top level before startServer() or Vite middleware intercepts them
---

In this project, `server.ts` runs Express + Vite in the same process (middleware mode).
Any route registered *inside* `startServer()` after `app.use(vite.middlewares)` may be shadowed by Vite's SPA fallback.

**Rule:** `app.use("/api", apiRoutes)` must appear at top level (before `startServer()` is called), NOT inside the async `startServer()` function.

**Why:** Vite's `middlewareMode` serves the SPA `index.html` for any unmatched path. Routes registered inside the async `startServer()` may arrive too late in the middleware chain if Vite already handles the request. Routes registered at the top level (synchronously, before the async setup) are safe.

**How to apply:** Always register new Express API routes at the top of `server.ts` (after `app.use(cors())`) or in the same pattern as `/api/onlinegames-catalog` which works correctly.
