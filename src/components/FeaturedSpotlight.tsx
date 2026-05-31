import { memo } from 'react';
import { Play, Star } from 'lucide-react';
import { Game } from '../types';
import { resolveGameThumbnail } from '../utils/gameUtils';

interface FeaturedSpotlightProps {
  hero: Game;
  picks: Game[];
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
  t: (key: any) => string;
}

export const FeaturedSpotlight = memo(function FeaturedSpotlight({
  hero,
  picks,
  isDarkMode,
  onPlay,
  t,
}: FeaturedSpotlightProps) {
  const heroArt = resolveGameThumbnail(hero.id, hero.thumbnail, 'lg');

  return (
    <section className="featured-spotlight" aria-label="Featured games">
      <div className="featured-spotlight-header">
        <div>
          <p className="featured-spotlight-eyebrow">Editor&apos;s spotlight</p>
          <h2 className="featured-spotlight-title">Featured this week</h2>
        </div>
        <p className={`featured-spotlight-note hidden sm:block ${isDarkMode ? 'text-white/40' : 'text-black/45'}`}>
          Hand-picked hits — updated daily
        </p>
      </div>

      <div className="featured-spotlight-grid">
        <button
          type="button"
          onClick={() => onPlay(hero)}
          className={`featured-hero group text-left ${isDarkMode ? 'featured-hero--dark' : 'featured-hero--light'}`}
        >
          <img
            src={heroArt}
            alt=""
            className="featured-hero-art"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="featured-hero-scrim" />
          <div className="featured-hero-content">
            <span className="featured-hero-badge">Featured</span>
            <h3 className="featured-hero-title">{hero.title}</h3>
            <p className="featured-hero-meta">
              {hero.category}
              <span className="opacity-50"> · </span>
              <Star className="inline w-3.5 h-3.5 text-yellow-400 fill-yellow-400 -mt-0.5" />
              {(hero.rating || 4.5).toFixed(1)}
            </p>
            <span className="featured-hero-cta">
              <Play className="w-4 h-4 fill-current" />
              {t('playNow') || 'Play now'}
            </span>
          </div>
        </button>

        <div className="featured-picks">
          {picks.slice(0, 4).map((game) => (
            <button
              key={game.id}
              type="button"
              onClick={() => onPlay(game)}
              className={`featured-pick group ${isDarkMode ? 'featured-pick--dark' : 'featured-pick--light'}`}
            >
              <img
                src={resolveGameThumbnail(game.id, game.thumbnail, 'md')}
                alt=""
                className="featured-pick-art"
                loading="lazy"
                decoding="async"
              />
              <div className="featured-pick-scrim" />
              <div className="featured-pick-content">
                <p className="featured-pick-title">{game.title}</p>
                <p className="featured-pick-meta">{game.category}</p>
              </div>
              <div className="featured-pick-play">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
});
