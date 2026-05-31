const CATEGORY_FALLBACK_SVG: Record<string, string> = {
  action: '/images/categories/action.svg',
  adventure: '/images/categories/adventure.svg',
  arcade: '/images/categories/arcade.svg',
  educational: '/images/categories/educational.svg',
  multiplayer: '/images/categories/multiplayer.svg',
  platformer: '/images/categories/platformer.svg',
  puzzle: '/images/categories/puzzle.svg',
  racing: '/images/categories/racing.svg',
  sports: '/images/categories/sports.svg',
  strategy: '/images/categories/strategy.svg',
  casual: '/images/categories/arcade.svg',
  horror: '/images/categories/action.svg',
  simulator: '/images/categories/racing.svg',
  obby: '/images/categories/platformer.svg',
  card: '/images/categories/puzzle.svg',
};

const DEFAULT_FALLBACK = '/images/categories/arcade.svg';

/** Local SVG used when remote thumbnails fail. */
export function getCategoryFallbackThumbnail(category?: string): string {
  if (!category?.trim()) return DEFAULT_FALLBACK;
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_FALLBACK_SVG[key] ?? DEFAULT_FALLBACK;
}
