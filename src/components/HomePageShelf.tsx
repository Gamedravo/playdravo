import { memo, RefObject } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Game } from '../types';
import { GameCard } from './GameCard';

export type ShelfVariant = 'standard' | 'accent' | 'compact';

interface HomePageShelfProps {
  title: string;
  subtitle: string;
  games: Game[];
  variant?: ShelfVariant;
  shelfRef?: RefObject<HTMLDivElement | null>;
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

export const HomePageShelf = memo(function HomePageShelf({
  title,
  subtitle,
  games,
  variant = 'standard',
  shelfRef,
  onScroll,
  onViewAll,
  viewAllLabel = 'View all',
  isDarkMode,
  handleGameClick,
  favorites,
  toggleFavorite,
  t,
  keyPrefix,
  cardClassName,
}: HomePageShelfProps) {
  if (!games.length) return null;

  return (
    <section className={`shelf-section shelf-section--${variant} group/shelf`}>
      <div className="shelf-header shelf-header--premium">
        <div className="shelf-header-copy">
          <p className="shelf-header-subtitle">{subtitle}</p>
          <h3 className="shelf-header-title">{title}</h3>
        </div>
        <div className="shelf-header-actions">
          {onScroll && shelfRef && (
            <div className="hidden md:flex items-center gap-1 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-100">
              <button
                type="button"
                onClick={() => onScroll(shelfRef, 'left')}
                className="shelf-nav-btn"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onScroll(shelfRef, 'right')}
                className="shelf-nav-btn"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {onViewAll && (
            <button type="button" onClick={onViewAll} className="shelf-view-all">
              {viewAllLabel}
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="shelf-scroll" ref={shelfRef}>
        {games.map((game, index) => (
          <div key={`${keyPrefix}-${game.id}-${index}`} className={cardClassName || 'shelf-card'}>
            <GameCard
              game={game}
              isDarkMode={isDarkMode}
              handleGameClick={handleGameClick}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              t={t}
            />
          </div>
        ))}
      </div>
    </section>
  );
});
