import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Star, 
  Filter, 
  LayoutGrid, 
  ArrowLeft
} from 'lucide-react';
import { Game } from '../types';
import { SEO } from '../components/SEO';
import { GameCard } from '../components/GameCard';
import { filterGamesForCategorySlug, getCategoryDisplayName, getDefaultSortForSlug } from '../utils/categoryRoutes';

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

  return (
    <div className="min-h-screen">
      <SEO
        title={`Best Free ${categoryName} Games Online – Play ${categoryGames.length > 0 ? `${categoryGames.length}+` : 'Instantly'} | GameDravo`}
        description={`Discover and play ${categoryGames.length}+ free ${categoryName} games online on GameDravo. Top-rated ${categoryName} games with instant browser play — no download, no sign-up required.`}
        keywords={`${categoryName} games, free ${categoryName} games online, play ${categoryName} games, browser ${categoryName} games, GameDravo`}
        canonicalUrl={`https://gamedravo.com/category/${categoryId}`}
        url={`https://gamedravo.com/category/${categoryId}`}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${categoryName} Games – GameDravo`,
            description: `Browse and play ${categoryGames.length}+ free ${categoryName} games instantly in your browser. No download required.`,
            url: `https://gamedravo.com/category/${categoryId}`,
            isPartOf: {
              '@type': 'WebSite',
              name: 'GameDravo',
              url: 'https://gamedravo.com',
            },
            about: {
              '@type': 'Thing',
              name: `${categoryName} Games`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gamedravo.com' },
              { '@type': 'ListItem', position: 2, name: `${categoryName} Games`, item: `https://gamedravo.com/category/${categoryId}` },
            ],
          },
          ...(categoryGames.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Top ${categoryName} Games on GameDravo`,
            description: `The best free ${categoryName} browser games — play instantly, no download.`,
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
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide mb-8 opacity-60">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-accent">{categoryName} Games</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20">
                <Gamepad2 className="w-6 h-6 text-accent" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight capitalize">
                {categoryName} <span className="text-accent">Games</span>
              </h1>
            </div>
            <p className={`text-sm md:text-lg max-w-2xl font-medium leading-relaxed opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Challenge your skills and immerse yourself. Discover our handpicked collection of {categoryGames.length} {categoryName} games. Play instantly for free in your browser.
            </p>
          </div>
        </div>

        {categoryGames.length > 0 ? (
          <div className="space-y-16">
            
            {/* Top Picks Section */}
            {categoryGames.length >= 4 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-bold tracking-tight">Top Rated {categoryName}</h2>
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

            {/* Main Grid Section */}
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-bold tracking-tight">All {categoryName} Games</h2>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    {categoryGames.length}
                  </span>
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
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <LayoutGrid className="w-10 h-10 text-accent opacity-40" />
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
