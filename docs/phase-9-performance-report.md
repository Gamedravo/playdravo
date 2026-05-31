# Phase 9 – Final UX & Performance Audit

## Summary

Phase 9 targets perceived latency, stuck UI states, and layout polish across sidebar, notifications, navigation, auth, homepage shelves, and category grid.

---

## 1. Sidebar responsiveness

**Issues:** Hover tooltips, mobile transform transition, and inline nav links caused unnecessary work on every sidebar context update.

**Changes:**
- Extracted memoized `SidebarNavLink` (`src/components/SidebarNavItem.tsx`) for category nav items — isolates re-renders from footer/profile state.
- Removed mobile `transform 75ms` transition on `.sidebar-shell` — open/close is instant.
- Nav items use CSS classes only (no Tailwind transition stacks on hover).

**Target:** Sub-50ms perceived response on category clicks and collapse/expand.

---

## 2. Notification panel redesign

**Before:** Full-height right drawer (~340px), backdrop overlay, modal-like feel.

**After:** (`src/components/NotificationDropdown.tsx`)
- Compact **288px popover** anchored under the notification bell via `anchorRef`.
- Opens downward from top-right; no full-screen backdrop.
- **Game route:** max 3 notifications, compact rows, shorter max height.
- **Desktop:** tabbed filters; **mobile:** narrower panel (`min(288px, viewport - 16px)`).
- Dismiss via Escape, outside click, or close button.

**Wiring:** `Header.tsx` passes `bellRef` as `anchorRef`.

---

## 3. Search / back navigation black flash

**Root cause:** Lazy-loaded `HomePage` + `LazyRoute` Suspense fallback (`min-h-[60vh]` dark skeleton) on every revisit after navigating to game/search.

**Changes:**
- **Eager imports** for `HomePage` and `SearchPage` in `App.tsx` — home and search stay mounted in memory.
- `routeVisitCache.ts` + updated `LazyRoute.tsx` — revisited lazy routes use zero-height bg fallback instead of skeleton.
- Pre-mark `/` and `/search` as visited on app boot.
- Search keep-alive overlay unchanged — no Suspense wrapper on mounted search layer.

**Result:** Back from game/search returns to previous view without a 1–2s black frame.

---

## 4. Authentication flow

**Issues:** OAuth popup cancel sometimes left `loadingProvider` spinner active.

**Changes:**
- `oauthSignIn.ts`: focus + `visibilitychange` cancel detection (400ms after return, uid unchanged).
- `LoginModal.tsx`: safety net clears OAuth loading 650ms after window focus/visibility if still stuck.
- Modal close already resets `loadingProvider`; `finally` blocks unchanged for normal paths.

---

## 5. Homepage shelf density

**Changes:**
- Applied `densifyShelf()` to **Trending**, **New Arrivals**, and **Picked for You** shelves in `HomePage.tsx`.
- Fills sparse rows toward `SHELF_TARGET_GAMES` (28) from matching pool + play-count backfill.
- Curated blocks already densified via `homepageCuration.ts`.

---

## 6. Category section grid

**Changes:**
- Removed game **count** from `buildHomepageCategoryChips` return value (counts never shown in UI).
- Fixed column grid in `index.css`: 4 → 6 → 8 → 10 columns by breakpoint.
- Equal `h-[72px]` + `w-full` chips — consistent alignment on large monitors.

---

## 7. Performance audit checklist

| Area | Finding | Mitigation |
|------|---------|------------|
| Homepage | Sparse shelves | `densifyShelf` on primary rows |
| Search | Remount on back | Eager `SearchPage` + keep-alive |
| Game page | Lazy OK | `LazyRoute` revisit fallback minimized |
| Login | Stuck OAuth spinner | Focus/visibility cancel + safety timer |
| Sidebar | Transition lag | Removed shell transition; memo nav links |
| Notifications | Heavy drawer | Anchored compact popover |

---

## Files changed

- `src/components/Header.tsx` — bell anchor ref
- `src/components/NotificationDropdown.tsx` — popover redesign
- `src/components/Sidebar.tsx` + `SidebarNavItem.tsx` — memo nav
- `src/components/LoginModal.tsx` — OAuth loading safety
- `src/lib/oauthSignIn.ts` — visibility cancel
- `src/lib/routeVisitCache.ts` — visit tracking (new)
- `src/components/LazyRoute.tsx` — lightweight revisit fallback
- `src/App.tsx` — eager Home/Search, route cache
- `src/pages/HomePage.tsx` — shelf densification
- `src/lib/homepageCategories.ts` — no counts
- `src/index.css` — sidebar + category grid

---

## Manual verification

1. **Sidebar:** Toggle collapse, hover icons (desktop), tap categories — no animation delay.
2. **Notifications:** Open bell on home and in-game — panel under bell, compact on mobile.
3. **Back nav:** Home → game → back; Search → game → back — no black screen.
4. **OAuth:** Start Google login, close popup — spinner clears within ~1s.
5. **Homepage:** Trending / New Arrivals / Picked shelves look full on ultrawide.
6. **Categories:** Grid columns align evenly; no count badges.

---

## Bundle note

Eager-loading `HomePage` and `SearchPage` increases the main chunk slightly vs Phase 8 lazy routes. Trade-off: instant back navigation and first paint stability for the two highest-traffic views.
