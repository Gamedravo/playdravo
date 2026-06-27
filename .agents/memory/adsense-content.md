---
name: AdSense Content System
description: Blog, category rich content, and homepage FAQ/features added to address Google AdSense "Low Value Content" rejection
---

## What was built

### Blog system
- `src/lib/blogContent.ts` — 7 articles (1000-2000 words each): best-browser-games-2026, action-games-guide, multiplayer-browser-games, puzzle-games-brain-training, racing-games-guide, html5-gaming-future, mobile-browser-gaming-guide
- `src/pages/BlogPage.tsx` — listing page at `/blog`
- `src/pages/BlogPostPage.tsx` — detail page at `/blog/:slug`
- Routes added to `src/App.tsx`; lazy imports `BlogPage` and `BlogPostPage`
- Footer updated to link to `/blog` under Company column

### Category rich content
- `src/lib/categoryContent.ts` — 250-500 word blocks per category: action, adventure, puzzle, racing, sports, multiplayer, shooter, casual, strategy, arcade, fighting, simulator, driving, mobile-games, trending, top-rated, new-arrivals, recommended
- `src/components/CategoryContentSection.tsx` — renders intro, what-to-expect, tips, why-players-love-it, related genres, FAQ; shown below games grid on CategoryPage
- `src/pages/CategoryPage.tsx` — imports and renders `<CategoryContentSection>` after the games grid

### Homepage additions
- `HomeFaqSection` component defined as module-level named function in `src/pages/HomePage.tsx` (NOT inside the main component, NOT inside a .map() — hooks must be at top level of named components)
- Added: "Why GameDravo" features 6-grid, "Explore by Category" 12-category grid, blog preview 3-card strip, FAQ accordion
- All new sections are conditional on `selectedCategory === 'All' && !searchQuery`

## Key constraint
`useState` inside `.map()` callbacks is invalid React. Always extract accordion items into a named component or use a single `openIdx` state at the parent level.
