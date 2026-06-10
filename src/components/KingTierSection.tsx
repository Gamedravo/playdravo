import { memo, useRef } from 'react';
import { Crown, ChevronLeft, ChevronRight, Star, Flame, Zap, RefreshCw, Users } from 'lucide-react';
import { Game } from '../types';

interface KingTierSectionProps {
  isDarkMode: boolean;
  games: Game[];
  handleGameClick: (game: Game) => void;
}

const EXCLUDED_KEYWORDS = /barbie|princess|dress|makeup|fashion|salon|cooking|baby|princess|girly|nail|wedding|dollhouse|unicorn|pony|mermaid|fairy/i;
const EXCLUDED_CATEGORIES = new Set(['Girls', 'Educational']);
const PREFERRED_CATEGORIES = new Set(['Action', 'Racing', 'Sports', 'Multiplayer', 'Shooter', 'Fighting', 'Adventure']);

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickKingGames(games: Game[], count = 16): Game[] {
  const filtered = games.filter((g) => {
    if (EXCLUDED_CATEGORIES.has(g.category)) return false;
    if (EXCLUDED_KEYWORDS.test(g.title)) return false;
    return true;
  });

  const scored = filtered
    .map((g) => {
      const bonus = PREFERRED_CATEGORIES.has(g.category) ? 5 : 0;
      return { g, score: (g.rating || 4) * Math.log10((g.plays || 100) + 10) + bonus };
    })
    .sort((a, b) => b.score - a.score);

  // Take top 40 candidates and rotate them daily using a deterministic seed
  const pool = scored.slice(0, 40).map((x) => x.g);
  const daySeed = Math.floor(Date.now() / 86_400_000);
  return seededShuffle(pool, daySeed).slice(0, count);
}

const BADGE_MAP: Array<{ label: string; Icon: React.ComponentType<{ className?: string }>; className: string }> = [
  { label: 'Hot',     Icon: Flame,     className: 'kt-badge--hot' },
  { label: 'Top',     Icon: Star,      className: 'kt-badge--top' },
  { label: 'Updated', Icon: RefreshCw, className: 'kt-badge--updated' },
  { label: 'New',     Icon: Zap,       className: 'kt-badge--new' },
  { label: 'Live',    Icon: Zap,       className: 'kt-badge--live' },
];

export const KingTierSection = memo(function KingTierSection({ isDarkMode, games, handleGameClick }: KingTierSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const kingGames = pickKingGames(games);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  if (kingGames.length === 0) return null;

  const livePlayers = `${(kingGames.length * 312 + 841).toLocaleString()} playing`;

  return (
    <section className={`kt-section ${isDarkMode ? 'kt-section--dark' : 'kt-section--light'}`}>
      <div className="kt-header">
        <div className="kt-header-left">
          <div className="kt-icon-wrap">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="kt-title-row">
              <h3 className="kt-title">King Tier Games</h3>
            </div>
            <div className="kt-subtitle-row">
              <span className="kt-rank-pill">
                <span className="kt-rank-dot" />
                {kingGames.length * 36}K ranked
              </span>
              <span className={`kt-subtitle-text ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                Compete and claim the crown
              </span>
            </div>
          </div>
        </div>
        <div className="kt-header-right">
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
            <Users className="w-3 h-3" />
            {livePlayers}
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

      <div className="kt-shelf" ref={scrollRef}>
        {kingGames.map((game, index) => {
          const badge = BADGE_MAP[index % BADGE_MAP.length];
          return (
            <KingCard
              key={game.id}
              game={game}
              isDarkMode={isDarkMode}
              badge={badge}
              onClick={handleGameClick}
            />
          );
        })}
      </div>
    </section>
  );
});

function KingCard({
  game,
  isDarkMode,
  badge,
  onClick,
}: {
  game: Game;
  isDarkMode: boolean;
  badge: { label: string; Icon: React.ComponentType<{ className?: string }>; className: string };
  onClick: (g: Game) => void;
}) {
  const { Icon } = badge;

  return (
    <button
      className={`kt-card ${isDarkMode ? 'kt-card--dark' : 'kt-card--light'}`}
      onClick={() => onClick(game)}
      title={game.title}
    >
      <div className="kt-card-thumb">
        <img
          src={game.thumbnail}
          alt={game.title}
          className="kt-card-img"
          loading="lazy"
          draggable={false}
        />

        <span className={`kt-badge ${badge.className}`}>
          <Icon className="w-2.5 h-2.5" />
          {badge.label}
        </span>

        <div className="kt-card-play-overlay">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400/30" />
        </div>
      </div>

      <div className="kt-card-info">
        <p className="kt-card-title">{game.title}</p>
        <div className="kt-card-meta">
          <span className={`kt-card-cat ${isDarkMode ? 'text-white/35' : 'text-black/35'}`}>{game.category}</span>
          <span className="kt-card-rating">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {(game.rating || 4.5).toFixed(1)}
          </span>
        </div>
      </div>
    </button>
  );
}
