import { memo, useState, useRef } from 'react';
import { Crown, Clock, ChevronLeft, ChevronRight, Play, X, Maximize2, Star, Flame, Zap, RefreshCw } from 'lucide-react';

interface KingTierSectionProps {
  isDarkMode: boolean;
}

type Badge = 'hot' | 'top' | 'updated' | 'new' | 'live';

interface KingGame {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  badge?: Badge;
  rating?: number;
  embedUrl?: string;
}

const KING_GAMES: KingGame[] = [
  {
    id: 'airplane-flight-simulator-evo',
    title: 'Airplane Flight Simulator EVO',
    category: 'Simulation',
    thumbnail: 'https://www.madkidgames.com/games/airplane-flight-simulator-evo/thumb_1.jpg',
    badge: 'hot',
    rating: 4.9,
    embedUrl: 'https://www.madkidgames.com/full/airplane-flight-simulator-evo',
  },
  {
    id: 'real-flight-simulator',
    title: 'Real Flight Simulator',
    category: 'Simulation',
    thumbnail: 'https://www.onlinegames.io/media/posts/342/responsive/Real-Flight-Simulator-2-lg.jpg',
    badge: 'top',
    rating: 4.8,
  },
  {
    id: 'hover-racer-pro',
    title: 'Hover Racer Pro',
    category: 'Racing',
    thumbnail: 'https://www.onlinegames.io/media/posts/572/responsive/Hover-Racer-Pro-lg.jpg',
    badge: 'updated',
    rating: 4.7,
  },
  {
    id: 'truck-racing',
    title: 'Truck Racing',
    category: 'Racing',
    thumbnail: 'https://www.onlinegames.io/media/posts/712/responsive/Truck-Racing-lg.jpg',
    badge: 'updated',
    rating: 4.6,
  },
  {
    id: 'dark-ninja-hanjo',
    title: 'Dark Ninja Hanjo',
    category: 'Fighting',
    thumbnail: 'https://www.onlinegames.io/media/posts/451/responsive/Dark-Ninja-Hanjo-lg.jpg',
    badge: 'new',
    rating: 4.6,
  },
  {
    id: 'alien-sky-invasion',
    title: 'Alien Sky Invasion',
    category: 'Shooter',
    thumbnail: 'https://www.onlinegames.io/media/posts/594/responsive/Alien-Sky-Invasion-lg.jpg',
    badge: 'live',
    rating: 4.5,
  },
  {
    id: 'drunken-duel',
    title: 'Drunken Duel',
    category: 'Fighting',
    thumbnail: 'https://www.onlinegames.io/media/posts/698/responsive/Drunken-Duel-lg.jpg',
    badge: 'top',
    rating: 4.6,
  },
  {
    id: 'bus-subway-runner',
    title: 'Bus Subway Runner',
    category: 'Arcade',
    thumbnail: 'https://www.onlinegames.io/media/posts/235/responsive/Bus-Subway-Runner-Game-lg.jpg',
    badge: 'updated',
    rating: 4.5,
  },
];

const BADGE_CONFIG: Record<Badge, { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }> = {
  hot:     { label: 'Hot',     className: 'kt-badge--hot',     Icon: Flame },
  top:     { label: 'Top',     className: 'kt-badge--top',     Icon: Star },
  updated: { label: 'Updated', className: 'kt-badge--updated', Icon: RefreshCw },
  new:     { label: 'New',     className: 'kt-badge--new',     Icon: Zap },
  live:    { label: 'Live',    className: 'kt-badge--live',    Icon: Zap },
};

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(() => Math.max(0, targetMs - Date.now()));
  const ref = useRef<number | null>(null);
  if (!ref.current) {
    ref.current = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1000));
    }, 1000);
  }
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const TARGET_TIME = Date.now() + 20 * 3600000 + 40 * 60000;

export const KingTierSection = memo(function KingTierSection({ isDarkMode }: KingTierSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeEmbed, setActiveEmbed] = useState<KingGame | null>(null);
  const countdown = useCountdown(TARGET_TIME);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const handleCardClick = (game: KingGame) => {
    if (game.embedUrl) setActiveEmbed(game);
  };

  return (
    <>
      <section className={`kt-section ${isDarkMode ? 'kt-section--dark' : 'kt-section--light'}`}>
        {/* Header */}
        <div className="kt-header">
          <div className="kt-header-left">
            <div className="kt-icon-wrap">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="kt-title-row">
                <h3 className="kt-title">King Tier Games</h3>
                <button className="kt-view-more">View more</button>
              </div>
              <div className="kt-subtitle-row">
                <span className="kt-rank-pill">
                  <span className="kt-rank-dot" />
                  {KING_GAMES.length * 36}K ranked
                </span>
                <span className={`kt-subtitle-text ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                  Compete and claim the crown each season
                </span>
              </div>
            </div>
          </div>
          <div className="kt-header-right">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className={`kt-timer ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
              Ends in {countdown}
            </span>
            <div className="kt-nav-btns">
              <button onClick={() => scroll('left')} className={`kt-nav-btn ${isDarkMode ? 'kt-nav-btn--dark' : 'kt-nav-btn--light'}`}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => scroll('right')} className={`kt-nav-btn ${isDarkMode ? 'kt-nav-btn--dark' : 'kt-nav-btn--light'}`}>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Game shelf */}
        <div className="kt-shelf" ref={scrollRef}>
          {KING_GAMES.map((game) => (
            <KingCard
              key={game.id}
              game={game}
              isDarkMode={isDarkMode}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </section>

      {/* Embed modal */}
      {activeEmbed && (
        <div className="kt-modal-overlay" onClick={() => setActiveEmbed(null)}>
          <div className="kt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kt-modal-header">
              <span className="kt-modal-title">
                <Crown className="w-4 h-4 text-amber-400" />
                {activeEmbed.title}
              </span>
              <div className="kt-modal-controls">
                <button
                  className="kt-modal-btn"
                  onClick={() => {
                    const el = document.querySelector('.kt-modal') as HTMLElement;
                    el?.requestFullscreen?.();
                  }}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button className="kt-modal-btn kt-modal-btn--close" onClick={() => setActiveEmbed(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="kt-modal-frame">
              <iframe
                src={activeEmbed.embedUrl}
                title={activeEmbed.title}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="fullscreen; autoplay"
                allowFullScreen
                scrolling="no"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ display: 'block', border: 'none' }}
              />
            </div>
            <div className="kt-modal-footer">
              <span>Game by <a href="https://www.madkidgames.com/game/airplane-flight-simulator-evo" target="_blank" rel="noopener noreferrer" className="kt-attribution-link">MadKidGames</a></span>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

function KingCard({ game, isDarkMode, onClick }: { game: KingGame; isDarkMode: boolean; onClick: (g: KingGame) => void }) {
  const [imgError, setImgError] = useState(false);
  const cfg = game.badge ? BADGE_CONFIG[game.badge] : null;

  return (
    <button
      className={`kt-card ${isDarkMode ? 'kt-card--dark' : 'kt-card--light'}`}
      onClick={() => onClick(game)}
      title={game.title}
    >
      {/* Thumbnail */}
      <div className="kt-card-thumb">
        {!imgError ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            className="kt-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <div className="kt-card-img-fallback">
            <Crown className="w-6 h-6 text-amber-400/50" />
          </div>
        )}

        {/* Badge */}
        {cfg && (
          <span className={`kt-badge ${cfg.className}`}>
            <cfg.Icon className="w-2.5 h-2.5" />
            {cfg.label}
          </span>
        )}

        {/* Play overlay on hover */}
        <div className="kt-card-play-overlay">
          <Play className="w-5 h-5 fill-current text-white" />
        </div>

        {/* Embed indicator */}
        {game.embedUrl && (
          <span className="kt-embed-dot" title="Playable here" />
        )}
      </div>

      {/* Info */}
      <div className="kt-card-info">
        <p className="kt-card-title">{game.title}</p>
        <div className="kt-card-meta">
          <span className={`kt-card-cat ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>{game.category}</span>
          {game.rating && (
            <span className="kt-card-rating">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {game.rating}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
