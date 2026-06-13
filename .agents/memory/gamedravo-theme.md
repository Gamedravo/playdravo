---
name: GameDravo Theme System
description: Color palette, sidebar default state, floating header pattern, and component conventions for the AAA redesign
---

## Color Palette (dark navy/purple)
- Background: `#080B16`
- Card bg: `#0D1024`
- Card border: `#1A1F3A`
- Accent: `#7C3AED` (violet/purple)
- Neon variants: `#A78BFA` (neon-cyan slot), `#C084FC` (neon-pink slot)
- CSS vars live in `:root` in `src/index.css` under `@theme` and `@layer base`

## Floating Header Pattern
- Header is `sticky top-0 z-50` with outer `px-2 md:px-3 pt-2` padding
- Inner div uses `rounded-2xl border backdrop-blur-xl` for glassmorphism effect
- Shadow increases on scroll via `scrolled` state (useEffect on scroll event)
- `HeaderBrand` hides itself when sidebar is open (`useSidebarOpen`) to avoid duplicate logos

## Sidebar Default State + Hover Expand
- `SidebarContext` defaults to `isOpen = false` (was: `window.innerWidth >= 768`)
- On desktop md+: closed state shows 60px icon-only column (defined in `.sidebar-shell--closed`)
- On mobile: closed state slides off-screen completely
- Hover expand: `Sidebar.tsx` has local `hoverExpanded` state + `onMouseEnter`/`onMouseLeave` on the `aside`; 120ms delay before expansion via a `hoverTimerRef`
- `isVisuallyOpen = isSidebarOpen || hoverExpanded` controls all render gates (group labels, profile, LanguageSwitcher variant)
- Hover state gets `.sidebar-shell--hover` CSS class adding a violet box-shadow and `z-index: 65` so it floats over content

**Why:** Design spec requires hover-to-expand for premium UX without changing persistent sidebar state.

## Ultrawide Layout (2560px, 3440px+)
- `game-card-grid`: 6 cols at xl (1280px), 7 at 2000px, 8 at 2560px, 10 at 3440px — all via `@media` in CSS
- `shelf-card`: 200px at 2560px, 228px at 3440px — also via `@media`
- `.main-content-container`: max-width 2400px at 2560px+, 3200px at 3440px+ with `mx-auto`; applied to the Routes wrapper div in App.tsx
- Header inner div uses `max-w-[1800px] mx-auto` so it never looks empty on ultrawide

## GameCard Enhancements
- Play count badge (bottom right, `Play` icon + formatted count)
- HOT/TOP badges use gradient backgrounds with colored box-shadows
- Play button overlay appears centered on hover
- Image zooms to `scale-[1.04]` on hover (was: no zoom)
- Hover color: violet (`violet-400/40` border, violet sheen gradient)
