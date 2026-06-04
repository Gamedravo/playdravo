import type { Game } from '../types';

/**
 * Heuristic ad-injection detection for embedded game sources.
 *
 * Notes:
 * - We can't inspect cross-origin iframe DOM at runtime.
 * - Instead we rely on known domains + URL patterns that historically bundle ads.
 * - This is used to (1) flag ad-heavy games and (2) optionally exclude them from embeds.
 */
/**
 * Normalize known "ad wrapper" URLs to their clean embed equivalents.
 *
 * onlinegames.io hosts some games with "-og" variants that are known to add
 * portal chrome / ad wrappers. For safety we rewrite to the plain HTML entrypoint.
 */
export function normalizeEmbedUrl(gameUrl: string): string {
  try {
    const u = new URL(gameUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const p = u.pathname;
    // Only rewrite known onlinegames.io patterns.
    if (host === 'cloud.onlinegames.io' || host === 'onlinegames.io') {
      if (p.toLowerCase().endsWith('/index-og.html')) {
        u.pathname = p.replace(/index-og\.html$/i, 'index.html');
      } else if (p.toLowerCase().endsWith('/game-og.html')) {
        u.pathname = p.replace(/game-og\.html$/i, 'game.html');
      }
    }
    return u.toString();
  } catch {
    return gameUrl;
  }
}

export function inferAdsInjectedFromUrl(gameUrl: string): boolean {
  try {
    const { hostname, pathname } = new URL(gameUrl);
    const host = hostname.toLowerCase().replace(/^www\./, '');
    const path = pathname.toLowerCase();

    // Known wrapper variants that frequently bundle ads/popups.
    if (path.includes('index-og.html')) return true;
    if (path.includes('game-og.html')) return true;

    // Other ad-heavy portals can be added here if verified.
    if (host.endsWith('itch.io')) return true;

    return false;
  } catch {
    return false;
  }
}

export function inferPopupRiskFromUrl(gameUrl: string): boolean {
  try {
    const { hostname, pathname } = new URL(gameUrl);
    const host = hostname.toLowerCase().replace(/^www\./, '');
    const path = pathname.toLowerCase();

    if (path.includes('index-og.html') || path.includes('game-og.html')) return true;
    if (host.endsWith('itch.io')) return true;
    if (host === 'y8.com') return true;
    return false;
  } catch {
    return false;
  }
}

export function inferRedirectRiskFromUrl(gameUrl: string): boolean {
  try {
    const { hostname, pathname } = new URL(gameUrl);
    const host = hostname.toLowerCase().replace(/^www\./, '');
    const path = pathname.toLowerCase();

    if (path.includes('index-og.html') || path.includes('game-og.html')) return true;
    if (host.endsWith('itch.io')) return true;
    if (host === 'y8.com') return true;
    return false;
  } catch {
    return false;
  }
}

export function withSafetyMetadata<
  T extends Pick<Game, 'url'> &
    Partial<Pick<Game, 'adsInjected' | 'popupRisk' | 'redirectRisk'>>
>(game: T): T {
  const url = normalizeEmbedUrl(game.url);
  return {
    ...game,
    url,
    adsInjected: typeof game.adsInjected === 'boolean' ? game.adsInjected : inferAdsInjectedFromUrl(url),
    popupRisk: typeof game.popupRisk === 'boolean' ? game.popupRisk : inferPopupRiskFromUrl(url),
    redirectRisk: typeof game.redirectRisk === 'boolean' ? game.redirectRisk : inferRedirectRiskFromUrl(url),
  };
}
