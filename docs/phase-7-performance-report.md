# Phase 7 — Performance, Auth, Notifications, Sidebar

**Date:** 2026-05-31  
**Build:** `npm run build` ✓ · `npx tsc --noEmit` ✓

---

## 1. Auth loading bug — root cause & fix

### Root cause
| Issue | Effect |
|-------|--------|
| `signInWithRedirect` fallback on popup-blocked | Redirect promise **never resolves** in the same tab → spinner stuck forever |
| Some providers (Microsoft/GitHub) not rejecting when popup closed | Firebase popup promise hung without `auth/popup-closed-by-user` |
| No safety timeout or focus-return detection | UI stayed in `loadingProvider` state indefinitely |
| Modal stayed open with spinner active | User perceived frozen login |

### Fix (`src/lib/oauthSignIn.ts`)
- **Removed redirect fallback** — popup-only OAuth; errors surface immediately
- **Race detection:** popup promise vs 90s timeout vs window `focus` return (600ms debounce, uid unchanged → cancel)
- **`AuthCancelledError`** + `isAuthCancelError()` for all benign cancel codes
- **LoginModal:** `resetAuthLoading()` in every `finally`; clears on modal close; email flow fixed

### Before → After
| Scenario | Before | After |
|----------|--------|-------|
| Close Google popup | Spinner forever | Spinner clears in **<600ms** |
| Cancel Microsoft login | Frozen modal | Returns to provider list |
| Dismiss auth modal / cancel flow | Stuck loading | Loading cleared in `finally` |

---

## 2. Sidebar lag — root cause & fix

### Root cause
| Issue | Effect |
|-------|--------|
| `isSidebarOpen` in App root state | **Entire AppContent re-rendered** on every toggle |
| Width transitions on desktop | Layout recalculation on open/close |
| Prior hover width expansion (Phase 6) | Full-page reflow (already removed) |

### Fix
- **`SidebarProvider` context** — only Sidebar + Header subscribe to open state; main content does not
- **Desktop: `transition: none`** on sidebar width — instant open/close
- **Mobile: 75ms transform-only** slide
- **`contain: strict`** on sidebar shell
- **CSS-only tooltips** when collapsed (`::after` + `data-tooltip`)
- Sidebar auto-closes on mobile route change (no App callback needed)

### Before → After
| Metric | Before | After |
|--------|--------|-------|
| App re-render on sidebar toggle | Full tree | **Sidebar + Header only** |
| Desktop width animation | 75–150ms | **Instant (0ms)** |
| Hover layout reflow | None (Phase 6) | None |

---

## 3. Notification panel — fix

### Before
- Drawer below header, full remaining viewport height
- Still felt anchored to bell area

### After (`NotificationDrawer`)
- **Fixed to viewport right edge** (`right: 0`)
- **Top-right origin** (`top: max(8px, safe-area)`)
- **340px wide** (within 320–380px spec)
- **85vh height** (within 80–90vh spec)
- Slide-in from right (100ms)
- Light backdrop; internal scroll only
- Not a dropdown, not centered, not modal

---

## 4. Search black screen — root cause & fix

### Root cause
| Issue | Effect |
|-------|--------|
| Search route unmounted on navigation to game | Back button remounted SearchPage → blank frame |
| Route transition hid content before new page ready | 1–2s black `<main>` |

### Fix
- **Search keep-alive layer** — once visited, SearchPage stays mounted in an absolute overlay
- Hidden via `invisible pointer-events-none` when not on `/search` (state preserved)
- **Eager-loaded** HomePage, SearchPage, GamePage (no chunk wait)
- Themed `bg-bg-dark` on `<main>` always
- Per-route `LazyRoute` Suspense for secondary pages only

### Before → After
| Flow | Before | After |
|------|--------|-------|
| Search → Game → Back | Black 1–2s | **Instant** — cached search layer shown |
| Search query / results | Lost on return | **Preserved** |

---

## 5. Apple Login — removed

Confirmed removed from Firebase, auth providers, login modal, and error labels.

**Active:** Google · Microsoft · GitHub · Phone · Email

---

## 6. Global optimizations (Phase 7)

| Area | Change |
|------|--------|
| OAuth | No redirect hang; cancel detection |
| Sidebar | Context isolation; zero desktop transition |
| Notifications | Viewport-fixed drawer spec |
| Search | Keep-alive mount |
| `handleGameClick` | `useCallback` for stable reference |
| Auth modal | Loading reset on close + finally |

---

## Files changed

| File | Purpose |
|------|---------|
| `src/lib/oauthSignIn.ts` | **New** — popup OAuth with cancel/timeout |
| `src/contexts/SidebarContext.tsx` | **New** — isolated sidebar state |
| `src/firebase.ts` | OAuth via `oauthSignIn`; no redirect |
| `src/lib/authErrors.ts` | `isAuthCancelError` handling |
| `src/components/LoginModal.tsx` | Loading reset; auth flow fix |
| `src/components/Sidebar.tsx` | Context + route auto-close |
| `src/components/Header.tsx` | Context toggle |
| `src/components/NotificationDropdown.tsx` | Viewport-fixed drawer |
| `src/App.tsx` | SidebarProvider; search keep-alive; useCallback |
| `src/index.css` | Sidebar instant desktop toggle |

---

## Verification checklist

- [ ] Click Google → close popup → spinner stops, modal usable
- [ ] Repeat for Microsoft, GitHub
- [ ] Open auth modal → cancel/close → no stuck state
- [ ] Toggle sidebar on desktop → instant, no page jank
- [ ] Open notifications → right drawer, 85vh, slides from right
- [ ] Search → open game → browser back → search appears instantly with prior state
- [ ] No Apple login button visible
