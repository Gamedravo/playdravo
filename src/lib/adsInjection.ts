import type { Game } from '../types';

/**
 * Heuristic ad-injection detection for embedded game sources.
 *
 * Notes:
 * - We can't inspect cross-origin iframe DOM at runtime.
 * - Instead we rely on known domains + URL patterns that historically bundle ads.
 * - This is used to (1) flag ad-heavy games and (2) optionally exclude them from embeds.
 */
export function inferAdsInjectedFromUrl(gameUrl: string): boolean {
  try {
    const { hostname, pathname } = new URL(gameUrl);
    const host = hostname.toLowerCase();
    const path = pathname.toLowerCase();

    // Known ad-heavy embed portals / CDNs (best-effort).
    if (host === 'www.onlinegames.io' || host === 'onlinegames.io') return true;
    if (host === 'cloud.onlinegames.io') return true;

    // Generic ad-loader / portal patterns.
    if (path.includes('index-og.html')) return true;
    if (path.includes('game-og.html')) return true;

    return false;
  } catch {
    return false;
  }
}

export function withAdsInjectedFlag<T extends Pick<Game, 'url'> & Partial<Pick<Game, 'adsInjected'>>>(game: T): T {
  if (typeof game.adsInjected === 'boolean') return game;
  return { ...game, adsInjected: inferAdsInjectedFromUrl(game.url) };
}

