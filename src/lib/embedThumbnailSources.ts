/**
 * Known real thumbnail sources for embedded games.
 * Priority: local SVG > verified remote artwork > category fallback UI.
 *
 * Embed metadata audit findings (Phase 3):
 * - js13kgames.com: /games/{slug}/cover.png returns 404 — NOT reliable; use local SVG
 * - playcanv.as: og:image per project — manual overrides required
 * - github.io: apple-touch-icon.png when present (varies)
 * - Standalone domains: manual overrides for hextris, 2048, duck hunt, etc.
 * - mrdoob.com / playkeepsafe.com: no useful og:image — SVG fallback
 */

export interface EmbedThumbnailCandidate {
  url: string;
  source: 'js13k-cover' | 'playcanvas' | 'og-image' | 'apple-touch' | 'manual';
}

/** Resolve remote cover/thumbnail candidates from a game's embed URL. */
export function getEmbedThumbnailCandidates(gameUrl: string): EmbedThumbnailCandidate[] {
  const candidates: EmbedThumbnailCandidate[] = [];

  try {
    const parsed = new URL(gameUrl);

    if (parsed.hostname === 'js13kgames.com') {
      // js13k cover.png paths are currently 404 on CDN — skip auto extraction
    }

    if (parsed.hostname === 'playcanv.as') {
      // og:image on embed page varies per project — add manual overrides per game
    }

    if (parsed.hostname.endsWith('github.io')) {
      const base = gameUrl.replace(/\/$/, '').replace(/\/index\.html$/, '');
      candidates.push({ url: `${base}/apple-touch-icon.png`, source: 'apple-touch' });
      candidates.push({ url: `${base}/meta/apple-touch-icon.png`, source: 'apple-touch' });
    }
  } catch {
    // ignore invalid URLs
  }

  return candidates;
}

/** Manual overrides where remote sources are verified stable gameplay/cover art. */
export const MANUAL_THUMBNAIL_OVERRIDES: Record<string, string> = {
  'slope': 'https://cdn2.y8.com/cloudimage/384903/file/w380h285_retina_webp-2439f025ff9dbe192e31d23509c21375.webp',
  'wordle': 'https://cdn.bubbleshooter.net/img/wordle.jpg',
  'tetris-cube': 'https://cdn.bubbleshooter.net/img/tetris-cube.jpg',
  'flappy-bird': 'https://upload.wikimedia.org/wikipedia/en/0/0a/Flappy_Bird_icon.png',
  'clicker-heroes': 'https://cdn.grindcraft.com/images/games/clicker-heroes.jpg',
  'mr-mine': 'https://cdn.mrmine.com/title_square.png',
  'poker-quest': 'https://cdn.grindcraft.com/images/games/poker-quest.jpg',
  'grindcraft': 'https://cdn.grindcraft.com/images/grindcraft-logo-wide.png',
  'fray-fight': 'https://frayfight.com/og-image.webp',
  'hextris-io': 'https://hextris.io/img/icons/apple-touch-icon.png',
  'duckhunt-js': 'https://duckhunt.js.org/favicon-196x196.png',
  'js-tiny-platformer': 'https://jakesgordon.github.io/javascript-tiny-platformer/touch-icon-iphone-retina.png',
  'js-racer': 'https://jakesgordon.github.io/javascript-racer/images/background.png',
  'hexgl': 'https://hexgl.bkcore.com/icon.png',
  'swooop-playcanvas': 'https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/projects/12/4763/TKYXB8-image-50.jpg',
};

export function resolveBestThumbnail(
  gameId: string,
  gameUrl: string,
  localThumbnail: string
): string {
  if (MANUAL_THUMBNAIL_OVERRIDES[gameId]) {
    return MANUAL_THUMBNAIL_OVERRIDES[gameId];
  }

  const embedCandidates = getEmbedThumbnailCandidates(gameUrl);
  if (embedCandidates.length > 0) {
    return embedCandidates[0].url;
  }

  return localThumbnail;
}
