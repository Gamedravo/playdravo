import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Star, 
  LayoutGrid, 
  ArrowLeft,
  Zap,
  Map,
  Flag,
  Trophy,
  Brain,
  Users2,
  Target,
  Smile,
  Settings2,
  Car,
  Cpu,
  Sparkles,
  Smartphone,
  Swords,
  Gamepad2,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { Game } from '../types';
import { SEO } from '../components/SEO';
import { GameCard } from '../components/GameCard';
import { filterGamesForCategorySlug, getCategoryDisplayName, getDefaultSortForSlug } from '../utils/categoryRoutes';

interface CategoryMeta {
  label: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  action: {
    label: 'Action',
    description: 'Fast-paced combat, fighting, survival and intense action experiences playable instantly in your browser.',
    seoTitle: 'Free Action Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play the best free action games online on GameDravo. No download, no sign-up. Instant browser action games — combat, survival, fighting and more.',
    seoKeywords: 'action games, free action games online, browser action games, combat games, GameDravo',
    icon: Zap,
    color: '#ef4444',
  },
  adventure: {
    label: 'Adventure',
    description: 'Explore vast worlds, uncover mysteries and embark on epic quests — all free and instant in your browser.',
    seoTitle: 'Free Adventure Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free adventure games online on GameDravo. Explore, discover and quest through browser adventure games with no download required.',
    seoKeywords: 'adventure games, free adventure games online, browser adventure games, quest games, GameDravo',
    icon: Map,
    color: '#22c55e',
  },
  racing: {
    label: 'Racing',
    description: 'Cars, bikes, drifting and high-speed challenges. Play free racing games instantly with no downloads.',
    seoTitle: 'Free Racing Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play the best free racing games online on GameDravo. No download needed. Instant browser racing games — cars, bikes, drift and more.',
    seoKeywords: 'racing games, free racing games online, car games, drift games, browser racing, GameDravo',
    icon: Flag,
    color: '#f59e0b',
  },
  sports: {
    label: 'Sports',
    description: 'Soccer, basketball, golf and more. Compete in free sports games that run instantly in your browser.',
    seoTitle: 'Free Sports Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free sports games online on GameDravo. Soccer, basketball, golf and more — instant browser sports games with no download required.',
    seoKeywords: 'sports games, free sports games online, browser sports games, soccer games, basketball games, GameDravo',
    icon: Trophy,
    color: '#16a34a',
  },
  puzzle: {
    label: 'Puzzle',
    description: 'Brain-teasing puzzles, logic challenges and match games. Train your mind with free puzzle games playable instantly.',
    seoTitle: 'Free Puzzle Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free puzzle games online on GameDravo. Logic puzzles, brain teasers and match games — no download, instant play in your browser.',
    seoKeywords: 'puzzle games, free puzzle games online, logic games, brain games, browser puzzles, GameDravo',
    icon: Brain,
    color: '#d946ef',
  },
  multiplayer: {
    label: 'Multiplayer',
    description: 'Battle friends or compete against strangers online. Free multiplayer browser games with no download needed.',
    seoTitle: 'Free Multiplayer Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free multiplayer games online on GameDravo. Compete with players worldwide — instant browser multiplayer games, no download required.',
    seoKeywords: 'multiplayer games, free multiplayer games online, .io games, browser multiplayer, online games, GameDravo',
    icon: Users2,
    color: '#e879f9',
  },
  shooter: {
    label: 'Shooter',
    description: 'FPS, snipers and top-down shooters. Aim, fire and dominate in free browser shooting games.',
    seoTitle: 'Free Shooter Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free shooting games online on GameDravo. FPS, sniper and top-down shooters — instant browser shooter games with no download.',
    seoKeywords: 'shooter games, FPS games, shooting games online, free shooter games, browser FPS, GameDravo',
    icon: Target,
    color: '#f97316',
  },
  casual: {
    label: 'Casual',
    description: 'Relaxing, fun and easy to pick up. Free casual games perfect for any mood, any moment, any device.',
    seoTitle: 'Free Casual Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free casual games online on GameDravo. Fun, relaxing and easy to play — instant browser casual games with no download required.',
    seoKeywords: 'casual games, free casual games online, fun games, easy games, browser casual games, GameDravo',
    icon: Smile,
    color: '#84cc16',
  },
  simulator: {
    label: 'Simulator',
    description: 'Build, manage and simulate real-world scenarios. Free simulation and tycoon games playable in your browser.',
    seoTitle: 'Free Simulator Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free simulator games online on GameDravo. Tycoon, management and simulation games — no download, instant play in your browser.',
    seoKeywords: 'simulator games, simulation games online, tycoon games, management games, browser simulator, GameDravo',
    icon: Settings2,
    color: '#64748b',
  },
  driving: {
    label: 'Driving',
    description: 'Steer through traffic, master tight corners and own the road. Free driving games — instant play, no downloads.',
    seoTitle: 'Free Driving Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free driving games online on GameDravo. Car, truck and traffic games — instant browser driving games with no download required.',
    seoKeywords: 'driving games, car games online, truck games, traffic games, free driving games, GameDravo',
    icon: Car,
    color: '#fbbf24',
  },
  strategy: {
    label: 'Strategy',
    description: 'Plan, build and outmaneuver opponents. Free browser strategy games that reward clever thinking.',
    seoTitle: 'Free Strategy Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free strategy games online on GameDravo. Tower defense, base building and tactical games — no download, instant browser play.',
    seoKeywords: 'strategy games, tower defense games, free strategy games online, tactical games, browser strategy, GameDravo',
    icon: Cpu,
    color: '#1d4ed8',
  },
  girls: {
    label: 'Girls Games',
    description: 'Fashion, makeovers, dress-up and style games. Free and playable instantly — no download required.',
    seoTitle: 'Free Girls Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free girls games online on GameDravo. Fashion, dress-up, makeover and beauty games — no download, instant play in your browser.',
    seoKeywords: 'girls games, dress up games, fashion games, makeover games, free girls games online, GameDravo',
    icon: Sparkles,
    color: '#f472b6',
  },
  'mobile-games': {
    label: 'Mobile Games',
    description: 'Optimized for touchscreens and on-the-go play. The best mobile-friendly browser games on GameDravo.',
    seoTitle: 'Free Mobile Games Online – Play on Any Device | GameDravo',
    seoDescription: 'Play free mobile games on GameDravo. Touch-friendly browser games optimized for phones and tablets — no app download needed.',
    seoKeywords: 'mobile games, free mobile games online, touch games, phone games, tablet games, GameDravo',
    icon: Smartphone,
    color: '#22d3ee',
  },
  fighting: {
    label: 'Fighting',
    description: 'Punch, kick and combo your way to victory. Free fighting games playable instantly in your browser.',
    seoTitle: 'Free Fighting Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free fighting games online on GameDravo. Combat, brawler and martial arts games — instant browser fighting games, no download.',
    seoKeywords: 'fighting games, combat games, free fighting games online, brawler games, browser fighting, GameDravo',
    icon: Swords,
    color: '#dc2626',
  },
  arcade: {
    label: 'Arcade',
    description: 'Classic arcade thrills reborn in the browser. Free arcade games with instant play — no coins, no downloads.',
    seoTitle: 'Free Arcade Games Online – Play Instantly | GameDravo',
    seoDescription: 'Play free arcade games online on GameDravo. Classic and modern arcade games — instant browser play with no download required.',
    seoKeywords: 'arcade games, free arcade games online, classic games, retro games, browser arcade, GameDravo',
    icon: Gamepad2,
    color: '#3b82f6',
  },
  trending: {
    label: 'Trending',
    description: 'The hottest games on GameDravo right now. See what the whole world is playing today.',
    seoTitle: 'Trending Games – Most Popular Right Now | GameDravo',
    seoDescription: 'Discover the most popular browser games trending on GameDravo right now. Play free, no download, instant play.',
    seoKeywords: 'trending games, popular games, hot games, most played games, GameDravo',
    icon: TrendingUp,
    color: '#7c3aed',
  },
  'new-arrivals': {
    label: 'New Arrivals',
    description: 'Fresh games added to GameDravo. Be the first to discover and play the newest browser games.',
    seoTitle: 'New Games Online – Latest Arrivals | GameDravo',
    seoDescription: 'Discover the newest free browser games on GameDravo. Play the latest arrivals instantly — no download, no sign-up.',
    seoKeywords: 'new games, latest games, newest games online, new browser games, GameDravo',
    icon: Clock,
    color: '#06b6d4',
  },
  'top-rated': {
    label: 'Top Rated',
    description: 'The highest-rated games on GameDravo, chosen by real players. Only the very best make the cut.',
    seoTitle: 'Top Rated Games Online – Best Free Browser Games | GameDravo',
    seoDescription: 'Play the top-rated free browser games on GameDravo. Highest-rated games selected by real players — instant play, no download.',
    seoKeywords: 'top rated games, best games, highest rated games, best browser games, GameDravo',
    icon: Star,
    color: '#eab308',
  },
  recommended: {
    label: 'Recommended',
    description: 'Curated picks based on quality, ratings and player love. GameDravo\'s seal of approval.',
    seoTitle: 'Recommended Games – Curated Free Browser Games | GameDravo',
    seoDescription: 'Play GameDravo\'s recommended free browser games. Handpicked for quality — instant play, no download required.',
    seoKeywords: 'recommended games, best games, curated games, quality games, GameDravo',
    icon: ThumbsUp,
    color: '#7c3aed',
  },
};

function getCategoryMeta(slug: string): CategoryMeta {
  const lower = (slug || 'all').toLowerCase().trim();
  return CATEGORY_META[lower] ?? {
    label: lower.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Discover and play free browser games instantly — no download, no sign-up required.',
    seoTitle: `Free ${lower.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Games Online | GameDravo`,
    seoDescription: `Play free ${lower.replace(/-/g, ' ')} games online on GameDravo. Instant browser play, no download required.`,
    seoKeywords: `${lower.replace(/-/g, ' ')} games, free games online, browser games, GameDravo`,
    icon: Gamepad2,
    color: '#7c3aed',
  };
}

interface CategoryPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  games: Game[];
  handleGameClick: (game: Game) => void;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = React.memo(({ 
  isDarkMode, 
  t, 
  games, 
  handleGameClick,
  favorites,
  toggleFavorite
}) => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [sortBy, setSortBy] = useState<'plays' | 'rating' | 'title' | 'latest'>(() =>
    getDefaultSortForSlug(categoryId || 'all')
  );

  const meta = useMemo(() => getCategoryMeta(categoryId || 'all'), [categoryId]);
  const IconComponent = meta.icon;

  const categoryGames = useMemo(() => {
    const filtered = filterGamesForCategorySlug(categoryId || 'all', games);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'latest') {
        const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
        const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'plays') return b.plays - a.plays;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [categoryId, games, sortBy]);

  const categoryName = useMemo(
    () => getCategoryDisplayName(categoryId || 'all', categoryGames),
    [categoryId, categoryGames]
  );

  useEffect(() => {
    setSortBy(getDefaultSortForSlug(categoryId || 'all'));
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [categoryId]);

  const breadcrumbLabel = `${meta.label} Games`;

  return (
    <div className="min-h-screen">
      <SEO
        title={meta.seoTitle}
        description={meta.seoDescription}
        keywords={meta.seoKeywords}
        canonicalUrl={`https://gamedravo.com/category/${categoryId}`}
        url={`https://gamedravo.com/category/${categoryId}`}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${meta.label} Games – GameDravo`,
            description: meta.seoDescription,
            url: `https://gamedravo.com/category/${categoryId}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'GameDravo',
              url: 'https://gamedravo.com',
            },
            about: {
              '@type': 'Thing',
              name: `${meta.label} Games`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gamedravo.com' },
              { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `https://gamedravo.com/category/${categoryId}` },
            ],
          },
          ...(categoryGames.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Top ${meta.label} Games on GameDravo`,
            description: `The best free ${meta.label} browser games — play instantly, no download.`,
            url: `https://gamedravo.com/category/${categoryId}`,
            numberOfItems: Math.min(categoryGames.length, 10),
            itemListElement: categoryGames.slice(0, 10).map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://gamedravo.com/games/${g.id}`,
              image: g.thumbnail,
              ...(g.rating && g.ratingCount && g.ratingCount >= 3 ? {
                item: {
                  '@type': 'VideoGame',
                  name: g.title,
                  url: `https://gamedravo.com/games/${g.id}`,
                  image: g.thumbnail,
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: g.rating.toFixed(1),
                    ratingCount: g.ratingCount,
                    bestRating: '5',
                    worstRating: '1',
                  },
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                },
              } : {
                item: {
                  '@type': 'VideoGame',
                  name: g.title,
                  url: `https://gamedravo.com/games/${g.id}`,
                  image: g.thumbnail,
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                },
              }),
            })),
          }] : []),
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-[10px] font-semibold tracking-wide">
            <li>
              <Link
                to="/"
                className={`transition-colors hover:text-accent ${isDarkMode ? 'text-white/50 hover:text-accent' : 'text-black/50 hover:text-accent'}`}
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className={`w-3 h-3 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`} />
            </li>
            <li aria-current="page" className="text-accent">
              {breadcrumbLabel}
            </li>
          </ol>
        </nav>

        {/* Category Hero */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border"
          style={{
            borderColor: `${meta.color}25`,
            background: `radial-gradient(ellipse at top left, ${meta.color}12 0%, transparent 60%)`,
          }}
        >
          <div className="px-8 py-10 md:px-12 md:py-12">
            <div className="flex items-start gap-6">
              {/* Icon badge */}
              <div
                className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border"
                style={{
                  background: `${meta.color}18`,
                  borderColor: `${meta.color}35`,
                }}
              >
                <IconComponent
                  className="w-8 h-8 md:w-10 md:h-10"
                  style={{ color: meta.color }}
                />
              </div>

              {/* Text */}
              <div className="space-y-3 min-w-0">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
                  {meta.label}{' '}
                  <span style={{ color: meta.color }}>Games</span>
                </h1>
                <p className={`text-sm md:text-base max-w-2xl font-medium leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {meta.description}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                    style={{ borderColor: `${meta.color}40`, color: meta.color, background: `${meta.color}12` }}
                  >
                    Free to Play
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                    style={{ borderColor: `${meta.color}40`, color: meta.color, background: `${meta.color}12` }}
                  >
                    No Download
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                    style={{ borderColor: `${meta.color}40`, color: meta.color, background: `${meta.color}12` }}
                  >
                    Instant Play
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {categoryGames.length > 0 ? (
          <div className="space-y-16">

            {/* Top Picks */}
            {categoryGames.length >= 4 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-5 h-5" style={{ color: meta.color }} />
                  <h2 className="text-xl font-bold tracking-tight">Top Rated {meta.label}</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                  {[...categoryGames].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4).map((game, idx) => (
                    <GameCard 
                      key={`top-${game.id}-${idx}`}
                      game={game}
                      isDarkMode={isDarkMode}
                      handleGameClick={handleGameClick}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Games Grid */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5" style={{ color: meta.color }} />
                  <h2 className="text-xl font-bold tracking-tight">All {meta.label} Games</h2>
                </div>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 -mb-4 md:mb-0 scrollbar-hide py-1">
                  <div className={`flex items-center p-1 rounded-xl border min-w-max shadow-sm ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    {[
                      { id: 'plays', label: 'Popular', icon: TrendingUp },
                      { id: 'rating', label: 'Rating', icon: Star },
                      { id: 'latest', label: 'Newest', icon: Clock }
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 md:py-2 rounded-lg text-[11px] md:text-xs font-semibold tracking-tight transition-all shrink-0 ${
                          sortBy === option.id 
                            ? 'bg-accent text-bg-dark shadow-sm' 
                            : `hover:text-accent ${isDarkMode ? 'text-white/40' : 'text-black/40'}`
                        }`}
                      >
                        <option.icon className="w-3.5 h-3.5" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {categoryGames.map((game, idx) => (
                  <GameCard 
                    key={`cat-game-${game.id}-${idx}`}
                    game={game}
                    isDarkMode={isDarkMode}
                    handleGameClick={handleGameClick}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    t={t}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-24 space-y-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto border"
              style={{ background: `${meta.color}12`, borderColor: `${meta.color}30` }}
            >
              <IconComponent className="w-10 h-10 opacity-40" style={{ color: meta.color }} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">No games found in this category</h2>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-bg-dark rounded-2xl font-semibold tracking-wide text-xs hover:scale-105 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});
