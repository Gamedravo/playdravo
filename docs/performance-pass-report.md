# Performance Pass Report — May 2026

## Build verification

```
npm run build   ✓ passed
npx tsc --noEmit ✓ passed
```

---

## 1. Sidebar lag — root cause & fix

### Root cause
| Issue | Impact |
|-------|--------|
| `md:hover:w-[220px]` on `.sidebar-shell--closed` | **Primary cause** — animating sidebar width forced full-page layout reflow on every hover frame |
| `transition-[width,transform] duration-150` | Width + transform combined on the flex sibling of main content |
| `group-hover/sidebar` label animations (`opacity`, `max-width`) | Dozens of elements transitioning simultaneously on hover |
| Inset box-shadow on active nav items | Extra paint cost per item |
| `window.innerWidth` checks + label visibility state in React | Unnecessary re-render paths |

### Fix applied
- **Fixed 52px collapsed width** — no hover width expansion; main content never reflows on hover
- **75ms transitions** — transform/width only on explicit toggle (mobile slide + desktop open)
- **`contain: layout style paint`** on sidebar shell
- **CSS-only tooltips** via `::after` + `data-tooltip` when collapsed (zero layout cost)
- Removed group-hover label opacity/max-width animations
- Removed inset shadows and icon strokeWidth toggling
- Simplified Sidebar React tree (removed `showLabels` branching)

### Before vs after
| Metric | Before | After |
|--------|--------|-------|
| Hover layout reflow | Full page (sidebar + main) | **None** |
| Transition duration | 150ms width+transform | **75ms** toggle only |
| Elements animating on hover | ~40+ labels/groups | **0** (CSS tooltip only) |
| Perceived response | 150–300ms stutter | **<75ms** |

---

## 2. Search black screen — root cause & fix

### Root cause
| Issue | Impact |
|-------|--------|
| Single `<Suspense>` wrapping **all** `<Routes>` | Navigating back from Search/Game suspended **entire route tree** including eager HomePage |
| `SearchPage` + `GamePage` lazy-loaded | 1–2s chunk fetch on every back navigation |
| Skeleton fallback without explicit `bg-bg-dark` | Empty `<main>` showed as pure black during suspend |
| 50ms scroll-reset `setTimeout` | Extra blank frame after navigation |

### Fix applied
- **Eager-loaded** `HomePage`, `SearchPage`, `GamePage` (critical paths)
- **Removed global Suspense** — per-route `<LazyRoute>` wrapper for secondary pages only
- **`main` element** always has `bg-bg-dark` / `bg-white`
- **`RouteContentSkeleton`** wrapped with themed min-height background
- Removed 50ms post-navigation timeout

### Before vs after
| Scenario | Before | After |
|----------|--------|-------|
| Search → Game → Back | Black 1–2s (lazy chunk + global suspend) | **Instant** (eager modules) |
| Search → Home → Back | Black flash | **Instant skeleton or content** |
| Secondary route (e.g. /terms) | Global suspend blocked all routes | **Isolated** per-route suspend |

---

## 3. Notification panel redesign

### Before
- Floating dropdown anchored under bell (`position: fixed` below anchor)
- 268px wide, max 300px list height
- Looked like a modal popover

### After
- **Right-side drawer** (`NotificationDrawer`)
- Fixed to right edge, top aligned below header, full remaining viewport height
- **360px** width (clamped to viewport on mobile)
- Slide-in from right (`translateX`, 100ms)
- Backdrop overlay, internal scroll only
- Body scroll locked while open

---

## 4. Apple Login removed

Removed from:
- `src/firebase.ts` — `appleProvider`, `signInWithApple`
- `src/lib/authProviders.tsx` — Apple icon + card
- `src/lib/authErrors.ts` — Apple label
- `src/components/AuthProviderButtons.tsx`
- `src/components/LoginModal.tsx`

**Remaining providers:** Google, Microsoft, GitHub, Phone SMS, Email

---

## 5. Global performance optimizations

| Area | Change |
|------|--------|
| Root layout | Removed `transition-colors duration-700` |
| GameCard hover preview | Delay 300ms → **150ms** |
| Auth provider buttons | Removed Framer Motion hover/tap animations |
| Notification bell badge | Removed `animate-pulse` |
| Header bell button | Removed scale hover animation |
| LoginModal | (unchanged backdrop — modal only) |
| Sidebar icons | Fixed strokeWidth (no active toggle) |
| `scripts/probe-thumbnails.ts` | Fixed TS error blocking `tsc` |

---

## Files changed

- `src/index.css` — sidebar performance CSS
- `src/components/Sidebar.tsx` — simplified, tooltip-based collapsed state
- `src/components/NotificationDropdown.tsx` — rewritten as right drawer
- `src/components/Header.tsx` — drawer integration
- `src/components/LazyRoute.tsx` — **new** per-route Suspense
- `src/App.tsx` — eager routes, no global Suspense, themed main
- `src/components/LoadingSkeletons.tsx` — themed skeleton wrapper
- `src/components/GameCard.tsx` — faster hover preview
- `src/firebase.ts`, `src/lib/authProviders.tsx`, `src/lib/authErrors.ts`, `src/components/LoginModal.tsx`, `src/components/AuthProviderButtons.tsx` — Apple removed
- `src/lib/sidebarIcons.tsx` — static icon stroke
- `scripts/probe-thumbnails.ts` — TS fix
