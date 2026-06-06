import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Play, Radio, Sparkles, Star, Video } from 'lucide-react';
import { Game } from '../types';
import { buildThumbnailFallbackChain } from '../utils/gameUtils';

interface FeaturedSpotlightProps {
  hero: Game;
  picks: Game[];
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
  t: (key: any) => string;
}

const particles = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 17) % 84)}%`,
  top: `${10 + ((index * 23) % 76)}%`,
  duration: 8 + (index % 5) * 1.7,
  delay: index * 0.22,
}));

function useDesktopAutoplay() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return enabled;
}

function getVideoType(url: string) {
  if (/\.webm(\?|#|$)/i.test(url)) return 'video/webm';
  if (/\.ogg|\.ogv(\?|#|$)/i.test(url)) return 'video/ogg';
  return 'video/mp4';
}

function hasPreview(game: Game) {
  return Boolean(game.previewVideoUrl || game.previewGifUrl || game.trailerUrl);
}

export const FeaturedSpotlight = memo(function FeaturedSpotlight({
  hero,
  picks,
  isDarkMode,
  onPlay,
  t,
}: FeaturedSpotlightProps) {
  const [activeGame, setActiveGame] = useState(hero);
  const sideGames = useMemo(() => {
    const seen = new Set<string>();
    return [hero, ...picks].filter((game) => {
      if (!game || seen.has(game.id)) return false;
      seen.add(game.id);
      return true;
    }).slice(0, 4);
  }, [hero, picks]);

  useEffect(() => {
    setActiveGame(hero);
  }, [hero]);

  return (
    <section className="featured-spotlight" aria-label="Featured games">
      <div className="featured-spotlight-aura" aria-hidden />
      <div className="featured-spotlight-orb featured-spotlight-orb--one" aria-hidden />
      <div className="featured-spotlight-orb featured-spotlight-orb--two" aria-hidden />
      <div className="featured-particles" aria-hidden>
        {particles.map((particle) => (
          <span
            key={particle.id}
            style={{
              left: particle.left,
              top: particle.top,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="featured-spotlight-header">
        <div>
          <motion.p
            className="featured-spotlight-eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Today&apos;s curated drop
          </motion.p>
          <motion.h2
            className="featured-spotlight-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          >
            Featured this week
          </motion.h2>
        </div>
        <motion.p
          className={`featured-spotlight-note hidden sm:flex ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
        >
          <Radio className="w-3.5 h-3.5 text-accent" />
          Auto-refreshes every 24 hours
        </motion.p>
      </div>

      <div className="featured-spotlight-grid">
        <PremiumHeroCard
          key={activeGame.id}
          game={activeGame}
          isDarkMode={isDarkMode}
          onPlay={onPlay}
          playLabel={t('playNow') || 'Play now'}
        />

        <div className="featured-picks" aria-label="Featured recommendations">
          <div className="featured-picks-header">
            <span>Recommended next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
          {sideGames.map((game, index) => (
            <FeaturedPickThumb
              key={game.id}
              game={game}
              isDarkMode={isDarkMode}
              active={game.id === activeGame.id}
              index={index}
              onSelect={setActiveGame}
              onPlay={onPlay}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

function PremiumHeroCard({
  game,
  isDarkMode,
  onPlay,
  playLabel,
}: {
  game: Game;
  isDarkMode: boolean;
  onPlay: (game: Game) => void;
  playLabel: string;
}) {
  const desktopAutoplay = useDesktopAutoplay();
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const imageChain = useMemo(
    () => buildThumbnailFallbackChain(game.id, game.thumbnail, 'lg', game.category),
    [game.id, game.thumbnail, game.category]
  );
  const heroArt = imageChain[imageIndex] ?? imageChain[imageChain.length - 1];
  const videoUrl = game.previewVideoUrl && !videoFailed ? game.previewVideoUrl : null;
  const showVideo = desktopAutoplay && Boolean(videoUrl);

  useEffect(() => {
    setImageIndex(0);
    setVideoFailed(false);
  }, [game.id]);

  const onHeroError = useCallback(() => {
    setImageIndex((index) => (index < imageChain.length - 1 ? index + 1 : index));
  }, [imageChain.length]);

  return (
    <motion.button
      type="button"
      onClick={() => onPlay(game)}
      className={`featured-hero group text-left ${isDarkMode ? 'featured-hero--dark' : 'featured-hero--light'}`}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="featured-hero-media">
        <AnimatePresence mode="wait">
          {showVideo ? (
            <motion.video
              key={`video-${game.id}`}
              className="featured-hero-art"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroArt}
              aria-hidden
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              onError={() => setVideoFailed(true)}
            >
              <source src={videoUrl ?? undefined} type={videoUrl ? getVideoType(videoUrl) : undefined} />
            </motion.video>
          ) : (
            <motion.img
              key={heroArt}
              src={heroArt}
              alt=""
              className="featured-hero-art"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={onHeroError}
              initial={{ opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.015 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="featured-hero-scrim" />
      <div className="featured-hero-gradient featured-hero-gradient--one" aria-hidden />
      <div className="featured-hero-gradient featured-hero-gradient--two" aria-hidden />
      <div className="featured-light-streak featured-light-streak--one" aria-hidden />
      <div className="featured-light-streak featured-light-streak--two" aria-hidden />
      <div className="featured-floating-chip featured-floating-chip--preview" aria-hidden>
        <Video className="w-3.5 h-3.5" />
        {showVideo ? 'Live preview' : 'Daily pick'}
      </div>
      <div className="featured-floating-chip featured-floating-chip--score" aria-hidden>
        <Star className="w-3.5 h-3.5 fill-current" />
        {(game.rating || 4.5).toFixed(1)}
      </div>

      <div className="featured-hero-content">
        <motion.span
          className="featured-hero-badge"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          Featured
        </motion.span>
        <motion.h3
          className="featured-hero-title"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
        >
          {game.title}
        </motion.h3>
        <motion.div
          className="featured-hero-meta-row"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <motion.span className="featured-category-tag" whileHover={{ y: -1, scale: 1.03 }}>
            {game.category}
          </motion.span>
          <motion.span className="featured-rating-badge" whileHover={{ y: -1, scale: 1.04 }}>
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            {(game.rating || 4.5).toFixed(1)}
          </motion.span>
          <span className="featured-play-count">{Math.max(1, Math.round((game.plays || 0) / 1000))}K plays</span>
        </motion.div>
        <motion.span
          className="featured-hero-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26, ease: 'easeOut' }}
        >
          <Play className="w-4 h-4 fill-current" />
          {playLabel}
        </motion.span>
      </div>
    </motion.button>
  );
}

function FeaturedPickThumb({
  game,
  isDarkMode,
  active,
  index,
  onSelect,
  onPlay,
}: {
  game: Game;
  isDarkMode: boolean;
  active: boolean;
  index: number;
  onSelect: (game: Game) => void;
  onPlay: (game: Game) => void;
}) {
  const chain = useMemo(
    () => buildThumbnailFallbackChain(game.id, game.thumbnail, 'md', game.category),
    [game.id, game.thumbnail, game.category]
  );
  const [imageIndex, setImageIndex] = useState(0);
  const art = chain[imageIndex] ?? chain[chain.length - 1];

  useEffect(() => {
    setImageIndex(0);
  }, [game.id]);

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onSelect(game)}
      onFocus={() => onSelect(game)}
      onClick={() => onPlay(game)}
      className={`featured-pick group ${active ? 'featured-pick--active' : ''} ${isDarkMode ? 'featured-pick--dark' : 'featured-pick--light'}`}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay: 0.08 + index * 0.05, ease: 'easeOut' }}
      whileHover={{ x: -3, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
    >
      <img
        key={art}
        src={art}
        alt=""
        className="featured-pick-art"
        loading="lazy"
        decoding="async"
        onError={() => setImageIndex((i) => (i < chain.length - 1 ? i + 1 : i))}
      />
      <div className="featured-pick-scrim" />
      <div className="featured-pick-preview-indicator">
        <span />
        {hasPreview(game) ? 'Preview ready' : 'Featured pick'}
      </div>
      <div className="featured-pick-content">
        <p className="featured-pick-title">{game.title}</p>
        <p className="featured-pick-meta">
          {game.category} · {(game.rating || 4.5).toFixed(1)} ★
        </p>
      </div>
      <div className="featured-pick-play">
        <Play className="w-3.5 h-3.5 fill-current" />
      </div>
    </motion.button>
  );
}
