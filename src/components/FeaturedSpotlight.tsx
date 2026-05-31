import { memo, useMemo, useState, useCallback } from 'react';
import { Play, Star } from 'lucide-react';
import { Game } from '../types';
import { buildThumbnailFallbackChain } from '../utils/gameUtils';

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
  const heroChain = useMemo(
    () => buildThumbnailFallbackChain(hero.id, hero.thumbnail, 'lg', hero.category),
    [hero.id, hero.thumbnail, hero.category]
  );
  const [heroIndex, setHeroIndex] = useState(0);
  const heroArt = heroChain[heroIndex] ?? heroChain[heroChain.length - 1];
  const onHeroError = useCallback(() => {
    setHeroIndex((i) => (i < heroChain.length - 1 ? i + 1 : i));
  }, [heroChain.length]);

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
            key={heroArt}
            src={heroArt}
            alt=""
            className="featured-hero-art"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={onHeroError}
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
            <FeaturedPickThumb
              key={game.id}
              game={game}
              isDarkMode={isDarkMode}
              onPlay={onPlay}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

function FeaturedPickThumb({
  game,
  isDarkMode,
  onPlay,
}: {
  game: Game;
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
}) {
  const chain = useMemo(
    () => buildThumbnailFallbackChain(game.id, game.thumbnail, 'md', game.category),
    [game.id, game.thumbnail, game.category]
  );
  const [index, setIndex] = useState(0);
  const art = chain[index] ?? chain[chain.length - 1];

  return (
            <button
              type="button"
              onClick={() => onPlay(game)}
              className={`featured-pick group ${isDarkMode ? 'featured-pick--dark' : 'featured-pick--light'}`}
            >
              <img
                key={art}
                src={art}
                alt=""
                className="featured-pick-art"
                loading="lazy"
                decoding="async"
                onError={() => setIndex((i) => (i < chain.length - 1 ? i + 1 : i))}
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
  );
}
