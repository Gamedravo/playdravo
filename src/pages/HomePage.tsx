import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Play,
  Share2,
  Star,
  Wrench,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Trophy,
  Compass,
  Heart,
  Clock,
  TrendingUp,
  Twitter,
  MessageSquare,
  Youtube,
  Github,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Game, UserProfile, Language } from '../types';
import { GAMES } from '../games';
import { GameGrid } from '../components/GameGrid';
import { SEO } from '../components/SEO';
import { SectionErrorBoundary } from '../components/SectionErrorBoundary';
import { GameCard } from '../components/GameCard';

interface HomePageProps {
  isDarkMode: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  featuredGame: Game | null;
  newArrivals: Game[];
  recommendedGames: Game[];
  isGeneratingRecommendations: boolean;
  recommendationError: string | null;
  generateRecommendations: () => void;
  recentlyPlayedGames: Game[];
  setPlayHistory: (history: any) => void;
  filteredGames: Game[];
  sortBy: "title" | "plays" | "rating" | "latest";
  setSortBy: (sort: "title" | "plays" | "rating" | "latest") => void;
  displayLimit: number;
  setDisplayLimit: (limit: number | ((prev: number) => number)) => void;
  handleGameClick: (game: Game) => void;
  userProfile: UserProfile | null;
  toggleFavorite: (gameId: string) => void;
  isNewsletterLoading: boolean;
  isNewsletterSubscribed: boolean;
  setIsNewsletterLoading: (loading: boolean) => void;
  setIsNewsletterSubscribed: (subscribed: boolean) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  setIsSubmitModModalOpen: (open: boolean) => void;
  setIsStatusModalOpen: (open: boolean) => void;
  setIsHelpCenterOpen: (open: boolean) => void;
  setIsSupportModalOpen: (open: boolean) => void;
  setIsBugReportModalOpen: (open: boolean) => void;
  setIsLegalModalOpen: (open: boolean) => void;
  setLegalContent: (content: any) => void;
  t: (key: any) => string;
  toast: any;
}

import { useHorizontalScroll } from '../hooks/useHorizontalScroll';
import { buildHomepageShelves } from '../utils/recommendations';
import { HOMEPAGE_CATEGORY_CHIPS } from '../lib/homepageCategories';
import { buildCuratedHomepageBlocks, pickFeaturedSpotlight, densifyShelf } from '../lib/homepageCuration';
import { FeaturedSpotlight } from '../components/FeaturedSpotlight';
import { HomePageShelf } from '../components/HomePageShelf';
import { LazyShelf } from '../components/LazyShelf';
import { KingTierSection } from '../components/KingTierSection';

export const HomePage = React.memo(function HomePage({
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  featuredGame,
  newArrivals,
  recentlyPlayedGames,
  setPlayHistory,
  filteredGames,
  sortBy,
  setSortBy,
  displayLimit,
  setDisplayLimit,
  handleGameClick,
  userProfile,
  toggleFavorite,
  isNewsletterLoading,
  isNewsletterSubscribed,
  setIsNewsletterLoading,
  setIsNewsletterSubscribed,
  setIsSubmitModalOpen,
  setIsSubmitModModalOpen,
  setIsStatusModalOpen,
  setIsHelpCenterOpen,
  setIsSupportModalOpen,
  setIsBugReportModalOpen,
  setIsLegalModalOpen,
  setLegalContent,
  t,
  toast
}: HomePageProps) {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Mystery Match State
  const [isFindingMysteryMatch, setIsFindingMysteryMatch] = React.useState(false);
  const [mysteryMatchTitle, setMysteryMatchTitle] = React.useState('');
  const [showAllCategories, setShowAllCategories] = React.useState(false);
  const [featuredRotationTick, setFeaturedRotationTick] = React.useState(0);

  React.useEffect(() => {
    const interval = window.setInterval(() => setFeaturedRotationTick((tick) => tick + 1), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const triggerMysteryMatch = () => {
    if (filteredGames.length === 0 || isFindingMysteryMatch) return;

    // Filter out games the user just played for better discovery
    const unplayedGames = filteredGames.filter(g => !recentlyPlayedGames.some(r => r.id === g.id));
    const candidates = unplayedGames.length > 0 ? unplayedGames : filteredGames;

    // Prefer highly rated games (top 50% of the candidate pool)
    const sortedByRating = [...candidates].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const topHalfCandidates = sortedByRating.slice(0, Math.max(1, Math.ceil(sortedByRating.length / 2)));

    setIsFindingMysteryMatch(true);
    let duration = 0;
    let speed = 60;
    const interval = setInterval(() => {
      // Spin using full list for visual variety
      const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
      setMysteryMatchTitle(randomGame.title);
      duration += speed;
      if (duration > 1500) {
        clearInterval(interval);
        // choose random game from high-quality pool
        const finalGame = topHalfCandidates[Math.floor(Math.random() * topHalfCandidates.length)];
        setMysteryMatchTitle(finalGame.title);
        setTimeout(() => {
          setIsFindingMysteryMatch(false);
          toast.success(`Matched! Launching "${finalGame.title}"...`, {
            icon: <Sparkles className="w-5 h-5 text-accent animate-bounce" />,
            className: isDarkMode ? 'bg-[#151525] border-accent/40 text-white font-bold' : 'bg-white border-accent/20 text-black font-bold'
          });
          handleGameClick(finalGame);
        }, 600);
      }
    }, speed);
  };

  // Scroll Refs for Horizontal Carousels
  const categoriesRef = React.useRef<HTMLDivElement>(null);
  const newArrivalsRef = React.useRef<HTMLDivElement>(null);
  const lovedRef = React.useRef<HTMLDivElement>(null);
  const trendingRef = React.useRef<HTMLDivElement>(null);
  const recentRef = React.useRef<HTMLDivElement>(null);

  useHorizontalScroll(categoriesRef);
  useHorizontalScroll(newArrivalsRef);
  useHorizontalScroll(lovedRef);
  useHorizontalScroll(trendingRef);
  useHorizontalScroll(recentRef);

  const handleScroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getAchievementProgress = (gameId: string) => {
    try {
      const saved = localStorage.getItem(`topg_achievements_${gameId}`);
      if (saved) {
        const achievementsObj = JSON.parse(saved);
        if (Array.isArray(achievementsObj)) {
          return achievementsObj.length;
        }
      }
    } catch (e) {
      console.error("Failed to parse progress track:", e);
    }
    return 0;
  };

  const curatedCategoryOrder = React.useMemo(
    () => ['action', 'adventure', 'racing', 'sports', 'puzzle', 'arcade', 'multiplayer', 'strategy', 'shooter', 'casual', 'simulation', 'mobile'],
    []
  );

  const curatedCategoryIds = React.useMemo(() => new Set(curatedCategoryOrder), [curatedCategoryOrder]);

  const curatedCategories = React.useMemo(
    () => curatedCategoryOrder
      .map((id) => HOMEPAGE_CATEGORY_CHIPS.find((chip) => chip.id === id))
      .filter((chip): chip is (typeof HOMEPAGE_CATEGORY_CHIPS)[number] => Boolean(chip)),
    [curatedCategoryOrder]
  );

  const extraCategories = React.useMemo(
    () => HOMEPAGE_CATEGORY_CHIPS.filter((chip) => !curatedCategoryIds.has(chip.id)),
    [curatedCategoryIds]
  );

  const exploreCategories = showAllCategories ? [...curatedCategories, ...extraCategories] : curatedCategories;

  const homepageShelves = React.useMemo(
    () => buildHomepageShelves(filteredGames),
    [filteredGames]
  );

  const denseTrending = React.useMemo(
    () => densifyShelf(homepageShelves.trending, filteredGames),
    [homepageShelves.trending, filteredGames]
  );

  const denseNewArrivals = React.useMemo(
    () => densifyShelf(newArrivals, filteredGames),
    [newArrivals, filteredGames]
  );

  const curatedBlocks = React.useMemo(
    () => buildCuratedHomepageBlocks(homepageShelves, [], filteredGames, 4),
    [homepageShelves, filteredGames]
  );

  const featuredSpotlight = React.useMemo(
    () => {
      featuredRotationTick;
      return pickFeaturedSpotlight(
        featuredGame,
        homepageShelves.topRated,
        homepageShelves.trending
      );
    },
    [featuredGame, homepageShelves.topRated, homepageShelves.trending, featuredRotationTick]
  );

  const renderShelf = (
    title: string,
    eyebrow: string,
    shelfGames: Game[],
    keyPrefix: string,
    shelfRef?: React.RefObject<HTMLDivElement | null>,
    EyebrowIcon?: React.ComponentType<{ className?: string }>
  ) => {
    if (!shelfGames.length) return null;
    const Icon = EyebrowIcon;
    return (
      <section className="shelf-section group/shelf">
        <div className="shelf-header">
          <div className="section-heading-stack">
            <div className="section-eyebrow">
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{eyebrow}</span>
            </div>
            <h3 className="section-title">{title}</h3>
          </div>
          {shelfRef && (
            <div className="hidden md:flex items-center gap-1 opacity-0 group-hover/shelf:opacity-100 transition-opacity">

              <button onClick={() => handleScroll(shelfRef, 'left')} className="p-2 rounded-lg border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent transition-all active:scale-95 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleScroll(shelfRef, 'right')} className="p-2 rounded-lg border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent transition-all active:scale-95 cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="shelf-scroll" ref={shelfRef}>
          {shelfGames.map((game, index) => (
            <div key={`${keyPrefix}-${game.id}-${index}`} className="shelf-card">
              <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  const favorites = userProfile?.favorites || [];
  const [trendHero, ...trendRail] = denseTrending.slice(0, 9);

  const renderTrendCard = (game: Game, index: number) => (
    <button
      key={`trend-matrix-${game.id}-${index}`}
      type="button"
      onClick={() => handleGameClick(game)}
      className="trend-matrix-card group"
      title={game.title}
    >
      <img src={game.thumbnail} alt="" className="trend-matrix-card-art" loading="lazy" />
      <div className="trend-matrix-card-scan" aria-hidden />
      <div className="trend-matrix-rank">#{String(index + 2).padStart(2, '0')}</div>
      <div className="trend-matrix-card-body">
        <p className="trend-matrix-card-title">{game.title}</p>
        <div className="trend-matrix-card-meta">
          <span>{game.category}</span>
          <span>{(game.rating || 4.5).toFixed(1)} ★</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="homepage-stack">
      <SEO
        title="Lightweight Futuristic Browser Games – Play Instantly"
        description="GameDravo is a lightweight futuristic gaming portal built for instant play: fast browser games, clean discovery, no downloads, and mobile-friendly action, puzzle, arcade, sports, and strategy games."
        keywords="futuristic browser games, lightweight online games, no download games, instant play games, free HTML5 games, mobile games, arcade games, puzzle games"
        canonicalUrl={`${window.location.origin}/`}
        url={`${window.location.origin}/`}

        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'GameDravo',
            url: window.location.origin,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${window.location.origin}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'GameDravo',
            url: window.location.origin,
            description: 'Lightweight futuristic online games platform for instant browser play.',
            logo: `${window.location.origin}/logo.svg`,
          },
        ]}
      />

      {/* Continue Playing — square thumbnail shelf — TOP of page */}
      <SectionErrorBoundary sectionName="Recently Played">

        {selectedCategory === 'All' && !searchQuery && recentlyPlayedGames.length > 0 && (
          <LazyShelf eager minHeight={200}>
          <section className="shelf-section group/shelf">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {t('continuePlaying')}
                </h3>
                <button
                  onClick={() => setPlayHistory([])}
                  className={`text-[10px] font-semibold uppercase tracking-widest transition-colors mt-0.5 ${isDarkMode ? 'text-white/25 hover:text-red-400' : 'text-black/25 hover:text-red-500'}`}
                >
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1 opacity-0 group-hover/shelf:opacity-100 transition-opacity">
                  <button onClick={() => handleScroll(recentRef, 'left')} className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent' : 'border-black/10 hover:border-accent text-black hover:text-accent'}`}>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleScroll(recentRef, 'right')} className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent' : 'border-black/10 hover:border-accent text-black hover:text-accent'}`}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setPlayHistory([])}
                  className="text-sm font-bold text-accent hover:opacity-80 transition-opacity"
                >
                  Show all
                </button>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-2.5 pb-1 scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" ref={recentRef}>
              {recentlyPlayedGames.map((game, index) => (
                <button
                  key={`recent-${game.id}-${index}`}
                  onClick={() => handleGameClick(game)}
                  className="relative shrink-0 snap-start w-[148px] sm:w-[168px] md:w-[186px] aspect-square rounded-2xl overflow-hidden group/card cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Resume ${game.title}`}
                >
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/10">
                    <Play className="w-2.5 h-2.5 text-accent fill-accent" />
                    <span className="text-[9px] font-black uppercase tracking-wide text-white/90 leading-none">
                      {game.category?.slice(0, 6) || 'Game'}
                    </span>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-accent text-white text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md">
                      Resume
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-2.5">
                    <p className="text-white text-[11px] font-bold leading-tight line-clamp-2 drop-shadow-md">
                      {game.title}
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={triggerMysteryMatch}
                disabled={isFindingMysteryMatch}
                className={`relative shrink-0 snap-start w-[148px] sm:w-[168px] md:w-[186px] aspect-square rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/[0.03] border-white/10 hover:border-accent/50 text-accent'
                    : 'bg-black/[0.02] border-black/10 hover:border-accent/40 text-accent'
                }`}
              >
                <Sparkles className={`w-7 h-7 transition-transform hover:scale-110 ${isFindingMysteryMatch ? 'animate-pulse' : ''}`} />
                <span className={`text-xs font-bold text-center leading-tight px-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {isFindingMysteryMatch ? (mysteryMatchTitle || 'Finding…') : 'Mystery Match'}
                </span>
                <span className={`text-[9px] uppercase tracking-widest font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                  {isFindingMysteryMatch ? 'Searching…' : 'Random pick'}
                </span>
              </button>
            </div>
          </section>
          </LazyShelf>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Featured Spotlight">
        {selectedCategory === 'All' && !searchQuery && featuredSpotlight.hero && (
          <FeaturedSpotlight
            hero={featuredSpotlight.hero}
            picks={featuredSpotlight.picks}
            isDarkMode={isDarkMode}
            onPlay={handleGameClick}
            t={t}
          />
        )}
      </SectionErrorBoundary>

      {selectedCategory === 'All' && !searchQuery && (
        <SectionErrorBoundary sectionName="King Tier">
          <KingTierSection isDarkMode={isDarkMode} games={filteredGames} handleGameClick={handleGameClick} />
        </SectionErrorBoundary>
      )}

      {selectedCategory === 'All' && !searchQuery && (
        <div className="value-props-bar" aria-label="Why GameDravo">
          <div className="value-prop-item">
            <span className="value-prop-icon" aria-hidden>⚡</span>
            <p className="value-prop-text">
              <strong>1,000+ free games</strong> — play instantly, no waiting
            </p>
          </div>
          <div className="value-prop-divider" aria-hidden />
          <div className="value-prop-item">
            <span className="value-prop-icon" aria-hidden>🖥️</span>
            <p className="value-prop-text">
              <strong>No download needed</strong> — just your browser
            </p>
          </div>
          <div className="value-prop-divider" aria-hidden />
          <div className="value-prop-item">
            <span className="value-prop-icon" aria-hidden>📱</span>
            <p className="value-prop-text">
              <strong>Works everywhere</strong> — mobile, tablet &amp; desktop
            </p>
          </div>
        </div>
      )}

      {selectedCategory === 'All' && !searchQuery && (
        <section
          className={`rounded-2xl border px-4 py-3 ${
            isDarkMode ? 'bg-white/[0.025] border-white/10 text-white/60' : 'bg-black/[0.02] border-black/10 text-black/60'
          }`}
          aria-labelledby="app-purpose-title"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <Gamepad2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <h2 id="app-purpose-title" className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  What is GameDravo?
                </h2>
                <p className="mt-1 text-xs leading-5">
                  GameDravo is a free browser gaming hub for instant HTML5 game play, game discovery, favorites, play history, and optional profile preferences. Login helps keep your account, saved games, theme, and language synced.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
              <Check className="h-3 w-3" />
              No downloads
            </span>
          </div>
        </section>
      )}

      {/* Trending Now */}

<SectionErrorBoundary sectionName="Trending Now">
        {selectedCategory === 'All' && !searchQuery && trendHero && (
          <LazyShelf eager minHeight={360}>
            <section className={`trend-matrix ${isDarkMode ? 'trend-matrix--dark' : 'trend-matrix--light'}`}>
              <div className="trend-matrix-bg" aria-hidden />
              <div className="trend-matrix-header">
                <div className="section-heading-stack">
                  <div className="section-eyebrow trend-matrix-eyebrow">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Live velocity chart</span>
                  </div>
                  <h3 className="trend-matrix-title">Trending Hyperdrive</h3>
                  <p className={`trend-matrix-subtitle ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>
                    Games spiking right now, ranked like a futuristic command feed.
                  </p>
                </div>
              </div>

              <div className="trend-matrix-grid">
                <button
                  type="button"
                  onClick={() => handleGameClick(trendHero)}
                  className="trend-matrix-hero group"
                  title={trendHero.title}
                >
                  <img src={trendHero.thumbnail} alt="" className="trend-matrix-hero-art" loading="lazy" />
                  <div className="trend-matrix-hero-glass" aria-hidden />
                  <div className="trend-matrix-hero-rank">#01</div>
                  <div className="trend-matrix-wave" aria-hidden>
                    {Array.from({ length: 18 }).map((_, index) => (
                      <span key={`wave-${index}`} style={{ height: `${18 + ((index * 13) % 58)}%` }} />
                    ))}
                  </div>
                  <div className="trend-matrix-hero-body">
                    <div className="trend-matrix-live-pill">
                      <span />
                      hot signal detected
                    </div>
                    <h4>{trendHero.title}</h4>
                    <div className="trend-matrix-hero-stats">
                      <span><strong>{(trendHero.rating || 4.5).toFixed(1)}</strong> rating</span>
                      <span><strong>{Math.max(1, Math.round((trendHero.plays || 0) / 1000))}K</strong> plays</span>
                      <span><strong>{trendHero.category}</strong> sector</span>
                    </div>
                    <span className="trend-matrix-play">
                      <Play className="w-4 h-4 fill-current" />
                      Launch now
                    </span>
                  </div>
                </button>

                <div className="trend-matrix-rail" ref={trendingRef}>
                  {trendRail.map(renderTrendCard)}
                </div>
              </div>
            </section>
          </LazyShelf>
        )}
      </SectionErrorBoundary>

      {/* Popular Categories */}

<SectionErrorBoundary sectionName="Popular Categories Ticker">
        {selectedCategory === 'All' && !searchQuery && (
          <LazyShelf minHeight={280}>
          <section className="shelf-section">
            <div className="shelf-header">
              <div className="section-heading-stack">
                <div className="section-eyebrow">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{t('exploreByGenre') || 'Explore Categories'}</span>
                </div>
                <h3 className="section-title">Browse by genre</h3>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleScroll(categoriesRef, 'left')} className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white/60 hover:text-accent' : 'border-black/10 hover:border-accent text-black/60 hover:text-accent'}`}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleScroll(categoriesRef, 'right')} className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white/60 hover:text-accent' : 'border-black/10 hover:border-accent text-black/60 hover:text-accent'}`}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className={`category-chip-grid ${showAllCategories ? 'category-chip-grid--expanded' : ''}`} ref={categoriesRef}>
              {exploreCategories.map((cat) => (
                <button
                  key={`cat-chip-${cat.slug}`}
                  type="button"
                  onClick={() => {
                    const main = document.querySelector('main');
                    if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    navigate(`/category/${cat.slug}`);
                  }}
                  className={`category-chip bg-gradient-to-br ${cat.bg} ${isDarkMode ? 'category-chip--dark' : 'category-chip--light'}`}
                >
                  <span className="category-chip-icon" aria-hidden>{cat.icon}</span>
                  <span className="category-chip-label">{cat.title}</span>
                </button>
              ))}
            </div>
          </section>
          </LazyShelf>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Curated Shelves">
        {selectedCategory === 'All' &&
          !searchQuery &&
          curatedBlocks.map((block, blockIndex) => (
            <LazyShelf key={block.id} eager={blockIndex === 0} minHeight={260}>
            <HomePageShelf
              title={block.title}
              subtitle={block.subtitle}
              games={block.games}
              variant={block.variant}
              keyPrefix={block.id}
              isDarkMode={isDarkMode}
              handleGameClick={handleGameClick}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              t={t}
            />
            </LazyShelf>
          ))}
      </SectionErrorBoundary>

      {/* New Arrivals */}

<SectionErrorBoundary sectionName="New Arrivals">
        {selectedCategory === 'All' && !searchQuery && denseNewArrivals.length > 0 && (
          <LazyShelf minHeight={260}>
          <section className="shelf-section group/shelf">
            <div className="shelf-header">
              <div className="section-heading-stack">
                <div className="section-eyebrow">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('discover') || 'DISCOVER'}</span>
                </div>
                <h3 className="section-title">{t('newArrivals')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleScroll(newArrivalsRef, 'left')}
                  className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white/60 hover:text-accent' : 'border-black/10 hover:border-accent text-black/60 hover:text-accent'}`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleScroll(newArrivalsRef, 'right')}
                  className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${isDarkMode ? 'border-white/10 hover:border-accent bg-black/40 text-white/60 hover:text-accent' : 'border-black/10 hover:border-accent text-black/60 hover:text-accent'}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
 
            <div className="shelf-scroll" ref={newArrivalsRef}>
                {denseNewArrivals.map((game, index) => (
                  <div key={`new-arrival-${game.id}-${index}`} className="shelf-card">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
            </div>
          </section>
          </LazyShelf>
        )}
      </SectionErrorBoundary>

      {/* Game Grid */}

      <SectionErrorBoundary sectionName="Game Grid">
        <LazyShelf minHeight={400}>
        <GameGrid 
          filteredGames={filteredGames}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        isDarkMode={isDarkMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        displayLimit={displayLimit}
        handleGameClick={handleGameClick}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
        favorites={userProfile?.favorites || []}
        toggleFavorite={toggleFavorite}
        t={t}
        setDisplayLimit={setDisplayLimit}
      />

      {displayLimit < filteredGames.length && (
        <div className="homepage-load-more">
          <button
            onClick={() => setDisplayLimit((prev: number) => prev + 40)}
            className="btn-primary"
          >
            {t('loadMore')}
          </button>
        </div>
      )}

        </LazyShelf>
      </SectionErrorBoundary>

      {/* Footer wrapped in hidden container */}
      <div className="hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-12 lg:mb-24">
            <div className="lg:col-span-5">
              <div 
                className="flex items-center gap-3 mb-6 lg:mb-8 group cursor-pointer" 
                onClick={() => scrollToTop()}
              >
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-105 transition-all duration-300">
                  <Gamepad2 className={`w-7 h-7 ${isDarkMode ? 'text-white' : 'text-accent'}`} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight leading-none">
                  Play<span className="text-accent">Dravo</span>
                </h1>
              </div>
              
              <p className={`text-lg leading-relaxed mb-8 lg:mb-10 max-w-md ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {t('footerDescription')}
              </p>

              <div className="flex gap-4">
                {[
                  { icon: <Twitter className="w-5 h-5" />, label: 'Twitter' },
                  { icon: <MessageSquare className="w-5 h-5" />, label: 'Discord' },
                  { icon: <Youtube className="w-5 h-5" />, label: 'YouTube' },
                  { icon: <Github className="w-5 h-5" />, label: 'GitHub' }
                ].map((social, idx) => (
                  <a
                    key={`footer-social-${social.label}-${idx}`}
                    href={`https://${social.label.toLowerCase()}.com/gamedravo`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center hover:bg-accent hover:text-bg-dark hover:border-accent transition-all duration-300 group ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                  >
                    <span className="sr-only">{social.label}</span>
                    <div className="group-hover:scale-110 transition-transform">
                      {social.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-accent/90 mb-6 lg:mb-8">{t('platform')}</h4>
                <ul className={`space-y-5 text-sm font-bold ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {[
                    { label: t('gamesLibrary'), action: () => { setSelectedCategory('All'); scrollToTop(); } },
                    { label: t('submitGame'), action: () => setIsSubmitModalOpen(true) },
                    { label: t('generateMod'), action: () => setIsSubmitModModalOpen(true) },
                    { label: t('bugReport'), action: () => setIsBugReportModalOpen(true) }
                  ].map((item, idx) => (
                    <li 
                      key={`footer-platform-${item.label}-${idx}`} 
                      onClick={item.action}
                      className={`cursor-pointer transition-all duration-300 flex items-center gap-2 group hover:text-accent`}
                    >
                      <div className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-accent/90 mb-6 lg:mb-8">{t('support')}</h4>
                <ul className={`space-y-5 text-sm font-bold ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                  {[
                    { label: t('aboutUs') || 'About GameDravo', key: 'About' },
                    { label: t('helpCenter'), key: 'Help Center' },
                    { label: t('termsOfService'), key: 'Terms of Service' },
                    { label: t('privacyPolicy'), key: 'Privacy Policy' },
                    { label: t('contactUs'), key: 'Contact Us' },
                    { label: t('reportBug'), key: 'Report a Bug' }
                  ].map((item, idx) => (
                    <li 
                      key={`footer-support-${item.key}-${idx}`} 
                      onClick={() => {
                        if (item.key === 'Help Center') {
                          setIsHelpCenterOpen(true);
                        } else if (item.key === 'Contact Us') {
                          setIsSupportModalOpen(true);
                        } else if (item.key === 'Report a Bug') {
                          setIsBugReportModalOpen(true);
                        } else if (item.key === 'About') {
                          setLegalContent({
                            title: item.label,
                            content: "GameDravo is an advanced online gaming portal dedicated to providing the fastest, cleanest, and most immersive web gaming experience. Our platform is built on modern web technologies ensuring secure, optimized, and cross-platform compatible gameplay. Join us in making browser gaming excellent again."
                          });
                          setIsLegalModalOpen(true);
                        } else {
                          setLegalContent({
                            title: item.label,
                            content: item.key === 'Terms of Service' 
                              ? t('termsOfServiceContent')
                              : t('privacyPolicyContent')
                          });
                          setIsLegalModalOpen(true);
                        }
                      }}
                      className={`cursor-pointer transition-all duration-300 flex items-center gap-2 group hover:text-accent`}
                    >
                      <div className="w-1 h-1 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1">
                <h4 className="text-sm font-semibold tracking-tight text-accent/90 mb-6 lg:mb-8">{t('newsletter')}</h4>
                <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('newsletterDescription')}</p>
                {isNewsletterSubscribed ? (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-bg-dark" />
                    </div>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('subscribed')}</span>
                  </div>
                ) : (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const email = (e.target as any).email.value;
                      if (email) {
                        setIsNewsletterLoading(true);
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        toast.success(t('subscriptionConfirmed'));
                        setIsNewsletterSubscribed(true);
                        setIsNewsletterLoading(false);
                      }
                    }}
                    className="relative"
                  >
                    <input 
                      name="email"
                      type="email" 
                      required
                      disabled={isNewsletterLoading}
                      placeholder={isNewsletterLoading ? t('synchronizing') : t('emailPlaceholder')} 
                      className={`w-full border rounded-2xl py-4 px-5 text-[10px] font-semibold tracking-wide focus:outline-none focus:border-accent/50 transition-all disabled:opacity-50 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`}
                    />
                    <button 
                      type="submit" 
                      disabled={isNewsletterLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent transition-transform disabled:opacity-50"
                    >
                      {isNewsletterLoading ? (
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className={`flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <p className={`text-xs font-semibold text-accent/80 tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                © 2026 GameDravo GAMING. {t('allRightsReserved')}
              </p>
                <div className="flex gap-6">
                  {[
                    { label: t('security'), key: 'Security' },
                    { label: t('privacy'), key: 'Privacy' },
                    { label: t('cookies'), key: 'Cookies' }
                  ].map((item, idx) => (
                    <button 
                      key={`footer-legal-${item.key}-${idx}`} 
                      onClick={() => {
                        setLegalContent({
                          title: item.label,
                          content: item.key === 'Security' 
                            ? t('securityContent')
                            : item.key === 'Privacy'
                            ? t('privacyPolicyContent')
                            : t('cookiesContent')
                        });
                        setIsLegalModalOpen(true);
                      }}
                      className={`text-xs font-semibold text-accent/80 tracking-tight transition-all hover:text-accent ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
            </div>
            
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-mono tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>v2.4.1</span>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
});
