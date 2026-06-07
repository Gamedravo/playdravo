import { memo, useRef, RefObject } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { Game } from '../types';
import { GameCard } from './GameCard';

export type ShelfVariant = 'standard' | 'accent' | 'compact' | 'mobile';

interface HomePageShelfProps {
  title: string;
  subtitle: string;
  games: Game[];
  variant?: ShelfVariant;
  /** @deprecated — shelf manages its own ref now */
  shelfRef?: RefObject<HTMLDivElement | null>;
  /** @deprecated — shelf manages its own scroll now */
  onScroll?: (ref: RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
  isDarkMode: boolean;
  handleGameClick: (game: Game) => void;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  t: (key: string) => string;
  keyPrefix: string;
  cardClassName?: string;
}

const STAGGER_MAX = 10;
const STAGGER_STEP = 0.045;

export const HomePageShelf = memo(function HomePageShelf({
  title,
  subtitle,
  games,
  variant = 'standard',
  isDarkMode,
  handleGameClick,
  favorites,
  toggleFavorite,
  t,
  keyPrefix,
  cardClassName,
}: HomePageShelfProps) {
  if (!Array.isArray(games) || !games.length) return null;

  const shelfGames = games.filter((g): g is Game => Boolean(g?.id));
  if (!shelfGames.length) return null;

  const internalRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = internalRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  return (
    <section className={`shelf-section shelf-section--${variant} group/shelf`}>
      <div className="shelf-header shelf-header--premium">
        <div className="shelf-header-copy">
          <p className={`shelf-header-subtitle ${variant === 'mobile' ? 'flex items-center gap-1.5' : ''}`}>
            {variant === 'mobile' && <Smartphone className="w-3 h-3" />}
            {subtitle}
          </p>
          <h3 className="shelf-header-title">{title}</h3>
        </div>
        <div className="shelf-header-actions">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="shelf-nav-btn"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="shelf-nav-btn"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="shelf-scroll" ref={internalRef}>
        {shelfGames.map((game, index) => (
          <motion.div
            key={`${keyPrefix}-${game.id}-${index}`}
            className={cardClassName || 'shelf-card'}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
              delay: Math.min(index, STAGGER_MAX - 1) * STAGGER_STEP,
            }}
          >
            <GameCard
              game={game}
              isDarkMode={isDarkMode}
              handleGameClick={handleGameClick}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              t={t}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
});
