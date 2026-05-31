# Final UX / Performance Polish Report

**Date:** May 31, 2026  
**Scope:** Logo unification, mobile notifications, global performance trim

---

## Executive Summary

PlayDravo now uses a **single official brand identity** (`/logo.svg` via shared components), **eliminates duplicate header/sidebar logos**, and routes all toasts through a **queued, game-aware system** with compact mobile/in-game behavior. A broad performance pass reduced transition durations, removed expensive blur/scale effects on hot paths, and fixed notification state bugs that caused unnecessary rerenders.

**Target feel:** Poki / CrazyGames — instant clicks, lightweight UI, no toast spam during gameplay.

---

## 1. Logo Duplication Bug — FIXED

### Root cause
Header used a `Zap` placeholder + wordmark; Sidebar used `Dices` + wordmark. Both were visible simultaneously on desktop.

### Fix
| Location | Before | After |
|----------|--------|-------|
| **Header** | Zap icon + "PlayDravo" always | `HeaderBrand`: mobile always; desktop only when sidebar collapsed |
| **Sidebar** | Dices icon + wordmark | `PlayDravoMark` + wordmark (desktop only) |
| **Mobile sidebar** | Duplicate brand row | Brand hidden; header owns identity; close button retained |

### New shared components
- `src/components/PlayDravoLogo.tsx` — wordmark + `/logo.svg`
- `src/components/PlayDravoMark.tsx` — icon-only mark
- `src/components/HeaderBrand.tsx` — single-brand visibility rules
- `src/components/PageBrandMark.tsx` — static page headers

---

## 2. Official Logo Rollout

Replaced placeholder icons in:

| Area | File(s) |
|------|---------|
| Header | `Header.tsx` → `HeaderBrand` |
| Sidebar | `Sidebar.tsx` |
| Login | `LoginModal.tsx` |
| Footer | `Footer.tsx` |
| Username setup | `UsernameSetupModal.tsx` |
| Static pages | Support, Privacy, Cookies, Terms, Contact, Status, Report Bug, Submit Game, About |

**Intentionally unchanged:** Category sidebar icons (`sidebarIcons.tsx`), achievement UI icons, theme picker icons — these are semantic icons, not brand marks.

---

## 3. Global Performance Audit

### Biggest remaining bottlenecks (pre-fix)

| Bottleneck | Impact | Severity |
|------------|--------|----------|
| `transition-all duration-300/500` on Header, GameCard, GamePage | Janky hover/route feel | High |
| `backdrop-blur-md/xl` on GamePage controls + LoginModal | GPU compositing cost on mobile | High |
| `hover:scale-*` on Header buttons, GameCard play overlay | Layout thrash | Medium |
| GameCard hover delay 150ms + heavy shadow | Sluggish shelf browsing | Medium |
| NotificationsProvider stale closure + toast on every `addNotification` | Extra rerenders + toast spam | High |
| Guest prompt `setTimeout(1500ms)` | Artificial delay on first visit | Low |
| LoginModal spring animation + infinite blur orb | Heavy modal open | Medium |

### Fixes applied

| Component | Change | Before → After |
|-----------|--------|----------------|
| **Header** | `transition-colors duration-150`, removed scale transforms | 300ms all-properties → 150ms colors only |
| **GameCard** | Hover delay 150→80ms; duration 300→150ms; lighter shadows; removed `-translate-y` | Snappier shelf hover |
| **GamePage** | Removed `backdrop-blur-xl` from action bar; solid backgrounds on fullscreen controls | Fewer GPU layers during play |
| **LoginModal** | Removed overlay blur; 150ms fade vs spring; static accent orb | Faster modal open |
| **Footer** | Removed scale hover on brand | Less layout work |
| **NotificationsProvider** | Functional `setState`; memoized context value; skip toast for `game` type | Fewer rerenders, no launch spam |
| **App guest prompt** | 1500ms → 800ms delay | Faster first interaction |
| **App toasts** | Centralized `appToast` with queue | Rate-limited, max 2 visible |

### Components still worth future profiling

- `App.tsx` main bundle (~1.6MB) — candidate for route-level code splitting beyond current lazy routes
- `GameCardHoverPreview` — video preview iframes on hover (already gated to `(hover: hover)`)
- Firestore `onSnapshot` listeners in App — necessary but heavy on low-end devices

---

## 4. Mobile Notifications — FIXED

### New system: `src/lib/appToast.ts`

| Requirement | Implementation |
|-------------|----------------|
| Auto-dismiss 7–8s | Default `7500ms` (game: `4500–5000ms`) |
| Max 1–2 visible | Sonner `visibleToasts={2}` |
| Queue excess | `enqueueToast` + 1.2s drain gap, cap queue at 6 |
| Safe below header | `top-right` + `max(56px, safe-area-inset-top)` offset |
| In-game compact | `ToastGameModeSync` on `/games/:id` routes |
| Never block gameplay | Smaller padding/font; top-right; game toasts dropped when queue > 2 |
| No game-launch spam | `type: 'game'` notifications → drawer only, no toast |

### CSS: `index.css` `.app-toast` / `.app-toast--game`

Mobile-specific max-width and padding for compact stacking.

---

## 5. Before vs After Impact

| Metric | Before | After |
|--------|--------|-------|
| Visible brand logos (desktop, sidebar open) | 2 | 1 |
| Toast on every game click | Yes | No (drawer only) |
| Max simultaneous toasts | Unlimited | 2 |
| Toast position (mobile) | bottom-right (covers controls) | top-right below header |
| GameCard hover delay | 150ms | 80ms |
| Header search transition | 300ms all | 150ms colors |
| Login overlay | backdrop-blur | solid `bg-black/70` |
| Notification state updates | Stale closure bugs | Functional updates |

---

## Files Changed (this pass)

### New
- `src/components/PlayDravoLogo.tsx`
- `src/components/HeaderBrand.tsx`
- `src/components/PageBrandMark.tsx`
- `src/components/ToastGameModeSync.tsx`
- `src/lib/appToast.ts`
- `docs/final-ux-performance-report.md`

### Modified (key)
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Footer.tsx`
- `src/components/LoginModal.tsx`
- `src/components/NotificationsProvider.tsx`
- `src/components/GameCard.tsx`
- `src/components/UsernameSetupModal.tsx`
- `src/App.tsx`
- `src/pages/GamePage.tsx`
- `src/index.css`
- 9 static pages (PageBrandMark)

---

## Verification

```bash
npm run build   # ✓
npx tsc --noEmit # ✓
```

### Manual QA checklist
- [ ] Desktop: sidebar open → only sidebar shows brand
- [ ] Desktop: sidebar collapsed → header shows brand
- [ ] Mobile: header shows brand; sidebar overlay has no duplicate logo
- [ ] Launch game → no "Game Starting" toast; appears in notification drawer
- [ ] Play game → XP/achievement toasts compact, top-right
- [ ] Rapid favorites → max 2 toasts, queued spacing
- [ ] Login modal opens without blur lag

---

## Recommended Next Steps (optional)

1. **Code-split App.tsx** — extract modals and admin into lazy chunks
2. **Virtualize game shelves** — if catalog grows past ~100 visible cards
3. **Reduce modal backdrop-blur** in `LegalModal`, `BugReportModal`, `SubmitGameModal` (same pattern as LoginModal)
4. **React.memo ProfileDropdown / NotificationDrawer** if profiler shows parent-driven rerenders
