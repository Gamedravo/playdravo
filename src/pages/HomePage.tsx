import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Play, 
  Share2, 
  Star, 
  Users, 
  Wrench, 
  Sparkles, 
  Target,
  ChevronRight, 
  ChevronLeft,
  Trophy,
  Compass,
  Heart,
  BrainCircuit, 
  RotateCcw, 
  Clock, 
  AlertCircle,
  Twitter,
  MessageSquare,
  Youtube,
  Github,
  Check,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Hourglass
} from 'lucide-react';
import { Game, UserProfile, Language } from '../types';
import { GameGrid } from '../components/GameGrid';
import { SEO } from '../components/SEO';
import { SectionErrorBoundary } from '../components/SectionErrorBoundary';
import { GameThumbnail } from '../components/GameThumbnail';
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
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  TAGS_LIST: string[];
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

export const HomePage = React.memo(function HomePage({
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  featuredGame,
  newArrivals,
  recommendedGames,
  isGeneratingRecommendations,
  recommendationError,
  generateRecommendations,
  recentlyPlayedGames,
  setPlayHistory,
  filteredGames,
  sortBy,
  setSortBy,
  selectedTags,
  setSelectedTags,
  TAGS_LIST,
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
  const recRef = React.useRef<HTMLDivElement>(null);
  const trendingRef = React.useRef<HTMLDivElement>(null);
  const recentRef = React.useRef<HTMLDivElement>(null);

  useHorizontalScroll(categoriesRef);
  useHorizontalScroll(newArrivalsRef);
  useHorizontalScroll(lovedRef);
  useHorizontalScroll(recRef);
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

  const POPULAR_CATEGORIES = [
    { id: 'Puzzle', title: 'Puzzle', icon: '🧩', count: filteredGames.filter(g => g.category.toLowerCase() === 'puzzle').length, bg: 'from-blue-500/10 to-indigo-500/5 hover:border-blue-500/30' },
    { id: 'Arcade', title: 'Arcade', icon: '👾', count: filteredGames.filter(g => g.category.toLowerCase() === 'arcade').length, bg: 'from-purple-500/10 to-pink-500/5 hover:border-purple-500/30' },
    { id: 'Racing', title: 'Racing', icon: '🏎️', count: filteredGames.filter(g => g.category.toLowerCase() === 'racing').length, bg: 'from-amber-500/10 to-orange-500/5 hover:border-amber-500/30' },
    { id: 'Sports', title: 'Sports', icon: '⚽', count: filteredGames.filter(g => g.category.toLowerCase() === 'sports').length, bg: 'from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30' },
    { id: 'Adventure', title: 'Adventure', icon: '🗺️', count: filteredGames.filter(g => g.category.toLowerCase() === 'adventure').length, bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30' },
    { id: 'Action', title: 'Action', icon: '⚔️', count: filteredGames.filter(g => g.category.toLowerCase() === 'action').length, bg: 'from-rose-500/10 to-red-500/5 hover:border-rose-500/30' },
    { id: 'Strategy', title: 'Strategy', icon: '🧠', count: filteredGames.filter(g => g.category.toLowerCase() === 'strategy').length, bg: 'from-violet-500/10 to-fuchsia-500/5 hover:border-violet-500/30' },
    { id: 'Multiplayer', title: 'Multiplayer', icon: '👥', count: filteredGames.filter(g => g.category.toLowerCase() === 'multiplayer').length, bg: 'from-teal-500/10 to-green-500/5 hover:border-teal-500/30' }
  ];

  // Dynamically generated personalized section based on user activity
  const topCategory = (userProfile?.preferredCategories && userProfile.preferredCategories.length > 0) 
    ? userProfile.preferredCategories[0] 
    : (recentlyPlayedGames.length > 0 ? recentlyPlayedGames[0]?.category : null);
    
  const personalizedRecommendations = topCategory 
    ? filteredGames
        .filter(g => g.category === topCategory && !recentlyPlayedGames.some(r => r.id === g.id))
        .sort((a,b) => b.plays - a.plays)
        .slice(0, 12)
    : [];

  return (
    <div
      className="space-y-12 px-4 md:px-8 mt-4"
    >
      <SEO 
        title="Play Best Online Games Free" 
        description="Play the best online games for free on PlayDravo. Discover a wide variety of action, puzzle, arcade, and multiplayer games instantly in your browser."
        keywords="free online games, play games online, browser games, 2048, hextris, slope, tetris"
        url={window.location.href}
      />

            {/* Featured Section */}

<SectionErrorBoundary sectionName="Featured Game">
        {selectedCategory === 'All' && !searchQuery && featuredGame && (
          <section className="relative h-[450px] md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden group border border-white/5">
            <div className="absolute inset-0">
              <GameThumbnail 
                src={(featuredGame.thumbnail || '').replace('400/300', '1920/1080')} 
                alt={featuredGame.title || 'Featured Game'}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 ${isDarkMode ? 'from-black via-black/40 to-transparent' : 'from-white via-white/40 to-transparent'}`} />
            </div>

            <div className="absolute inset-0 p-8 md:p-16 flex flex-col items-center justify-end text-center md:items-start md:text-left md:justify-center">
              <div
                className="max-w-3xl space-y-4 md:space-y-6"
              >
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-3 md:px-4 py-1.5 bg-accent text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
                    {t('featuredGame')}
                  </span>
                  <span className={`px-3 md:px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                    Tap to play instantly
                  </span>
                  <span className={`px-3 md:px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-black/5 border-black/10 text-black'}`}>
                    No downloads
                  </span>
                </div>
                
                <h2 className={`text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {featuredGame.title}
                </h2>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 pt-4">
                  <button 
                    onClick={() => handleGameClick(featuredGame)}
                    className="btn-primary w-full md:w-auto"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    {t('playNow')}
                  </button>
                  <div className={`hidden md:flex items-center gap-4 px-6 py-3 border rounded-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-accent fill-current" />
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{featuredGame.rating}</span>
                    </div>
                    <div className={`w-px h-6 ${isDarkMode ? 'bg-white/20' : 'bg-black/20'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{featuredGame.category}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      {/* Continue Playing */}

<SectionErrorBoundary sectionName="Recently Played">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">{t('history') || 'CONTINUE PLAYING'}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                  {t('continuePlaying')}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Scroll Navigation Arrows */}
                {recentlyPlayedGames.length > 0 && (
                  <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleScroll(recentRef, 'left')}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleScroll(recentRef, 'right')}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {recentlyPlayedGames.length > 0 && (
                  <button 
                    onClick={() => setPlayHistory([])}
                    className={`text-[10px] font-semibold tracking-wide hover:text-red-500 transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}
                  >
                    {t('clear')}
                  </button>
                )}
              </div>
            </div>

            {recentlyPlayedGames.length > 0 ? (
              <div className="relative -mx-4 md:-mx-8">
                <div 
                  ref={recentRef}
                  className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {recentlyPlayedGames.map((game, index) => (
                  <div key={`recent-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start relative">
                    {index === 0 && (
                      <div className="absolute -top-1.5 -left-1.5 z-30 bg-accent text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-lg pointer-events-none border border-white/20">
                        Quick Resume
                      </div>
                    )}
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
                
                {/* Persistent Mystery Match Card */}
                <div className="w-[160px] md:w-[200px] shrink-0 snap-start relative flex flex-col">
                  <button
                    onClick={triggerMysteryMatch}
                    disabled={isFindingMysteryMatch}
                    title="Find a random game"
                    className={`flex-1 w-full aspect-[4/5] rounded-xl md:rounded-2xl border flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-sm group overflow-hidden relative cursor-pointer ${
                      isDarkMode
                      ? 'bg-gradient-to-br from-[#121225] via-black/[0.2] to-[#0a0a1a] border-accent/20 hover:border-accent/40 text-accent'
                      : 'bg-gradient-to-br from-[#f5f0ff] via-white to-[#eff4ff] border-purple-500/10 hover:border-purple-500/30 text-[#8b46ff]'
                    }`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(139,70,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,70,255,0.015)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
                    <div className="relative mb-3 z-10">
                        <Sparkles className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-500 group-hover:scale-110" />
                        {isFindingMysteryMatch && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                          </span>
                        )}
                    </div>
                    <span className="text-sm font-black text-center tracking-tight leading-tight z-10 px-2 line-clamp-2">
                       {isFindingMysteryMatch ? (mysteryMatchTitle || "CALCULATING") : "Mystery Match"}
                    </span>
                    <span className="text-[9px] md:text-[10px] opacity-70 mt-1.5 uppercase tracking-widest font-bold z-10">
                       {isFindingMysteryMatch ? "SEARCHING..." : "Feeling Lucky?"}
                    </span>
                  </button>
                </div>
              </div>
             </div>
            ) : (
              <div className={`p-8 md:p-12 rounded-[2rem] border overflow-hidden relative transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#121225] via-black/[0.1] to-[#0a0a1a] border-accent/10' 
                  : 'bg-gradient-to-br from-[#f5f0ff] via-[#fafafa] to-[#eff4ff] border-purple-500/5'
              }`}>
                {/* Visual background mesh */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,70,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(139,70,255,0.015)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                
                <div className="max-w-xl mx-auto text-center space-y-6 relative z-10">
                  <div className="inline-flex relative">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border animate-bounce shadow-md ${
                      isDarkMode ? 'bg-[#1a1a35] border-[#8b46ff]/20 text-accent' : 'bg-white border-purple-500/10 text-[#8b46ff]'
                    }`}>
                      <Sparkles className="w-8 h-8" />
                    </div>
                    {isFindingMysteryMatch && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl md:text-2xl font-black tracking-tight">
                      {isFindingMysteryMatch ? (
                        <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                          Finding a random classic mismatch...
                        </span>
                      ) : (
                        "Ready for a Wild Card?"
                      )}
                    </h4>
                    <p className={`text-xs md:text-sm leading-relaxed max-w-sm mx-auto ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                      {isFindingMysteryMatch 
                        ? "Selecting an exciting hand-picked title from our classic retro arcade games list..."
                        : "Unsure of what to play? Let our matching algorithm choose a handpicked classic favorite directly from our retro library!"
                      }
                    </p>
                  </div>

                  {isFindingMysteryMatch ? (
                    <div className="py-2 space-y-3">
                      <div className={`text-base font-black font-mono tracking-wider animate-pulse ${isDarkMode ? 'text-accent' : 'text-[#8b46ff]'}`}>
                        {mysteryMatchTitle || "CALCULATING"}
                      </div>
                      <div className={`w-32 mx-auto bg-white/10 h-1.5 rounded-full overflow-hidden shadow-inner`}>
                        <div className="bg-accent h-full rounded-full animate-pulse w-full" />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={triggerMysteryMatch}
                      className="btn-primary inline-flex items-center gap-2 text-xs font-semibold px-8 py-4 bg-accent hover:bg-accent/90 text-white rounded-2xl shadow-md cursor-pointer transition-transform duration-200 active:scale-95"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      FIND MYSTERY MATCH
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </SectionErrorBoundary>

      {/* Trending Now */}

<SectionErrorBoundary sectionName="Trending Now">
        {selectedCategory === 'All' && !searchQuery && filteredGames.length > 0 && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">{t('trending') || 'TRENDING'}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{t('trendingNow') || 'Trending Now'}</h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Scroll Navigation Arrows */}
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => handleScroll(trendingRef, 'left')}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleScroll(trendingRef, 'right')}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    navigate('/category/trending');
                  }}
                  className={`flex items-center gap-2 text-[10px] font-semibold tracking-wide hover:text-accent transition-colors group ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                >
                  {t('viewAll') || 'View All'}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
 
            <div className="relative -mx-4 md:-mx-8">
              <div 
                ref={trendingRef}
                className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {[...filteredGames].sort((a,b)=>b.plays-a.plays).slice(0,12).map((game, index) => (
                  <div key={`trending-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
             </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      {/* Popular Categories */}

<SectionErrorBoundary sectionName="Popular Categories Ticker">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-4 pt-2">
            <div className="flex items-center gap-2 mb-6">
              <Compass className="w-4 h-4 text-accent" />
              <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('exploreByGenre') || 'BROWSE CATEGORIES'}</span>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div 
                ref={categoriesRef}
                className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {POPULAR_CATEGORIES.map((cat, idx) => (
                  <div
                    key={`cat-pill-${cat.id}-${idx}`}
                    onClick={() => {
                      const main = document.querySelector('main');
                      if (main) {
                        main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                      } else {
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                      }
                      navigate(`/category/${cat.id.toLowerCase()}`);
                    }}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl border min-w-[170px] shrink-0 bg-gradient-to-br transition-all duration-300 snap-start select-none ${
                    isDarkMode 
                      ? `${cat.bg} border-white/5 bg-white/[0.01]` 
                      : `${cat.bg.replace('/10', '/5')} border-black/5 bg-black/[0.01]`
                  }`}
                >
                  <span className="text-3xl select-none">{cat.icon}</span>
                  <div>
                    <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>{cat.title}</h4>
                    <p className={`text-[10px] font-medium tracking-wide ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{cat.count} {t('games') || 'games'}</p>
                  </div>
                </div>
              ))}
             </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      {/* Recommended */}

<SectionErrorBoundary sectionName="Recommended Games">
        {selectedCategory === 'All' && !searchQuery && (recommendedGames.length > 0 || isGeneratingRecommendations) && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">{t('personalized')}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{t('pickedForYou')}</h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Scroll Navigation Arrows */}
                {recommendedGames.length > 0 && (
                  <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => handleScroll(recRef, 'left')}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleScroll(recRef, 'right')}
                      className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {(isGeneratingRecommendations || recommendedGames.length > 0 || recommendationError) && (
                  <button 
                    onClick={generateRecommendations}
                    disabled={isGeneratingRecommendations}
                    className={`flex items-center gap-2 text-[10px] font-semibold tracking-wide hover:text-accent transition-colors disabled:opacity-50 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}
                  >
                    <RotateCcw className={`w-3 h-3 ${isGeneratingRecommendations ? 'animate-spin' : ''}`} />
                    {t('refresh')}
                  </button>
                )}
              </div>
            </div>
 
            {recommendationError ? (
              <div className="glass p-12 rounded-[2rem] text-center border-red-500/20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-white/60 mb-6">{recommendationError}</p>
                <button 
                  onClick={generateRecommendations}
                  className="px-8 py-3 bg-accent text-white font-bold rounded-xl transition-all uppercase tracking-widest text-[10px]"
                >
                  {t('retry')}
                </button>
              </div>
            ) : isGeneratingRecommendations && recommendedGames.length === 0 ? (
              <div className="flex gap-4 overflow-hidden pb-4">
                {[...Array(6)].map((_, i) => (
                  <div key={`skeleton-${i}`} className={`aspect-[4/5] w-[170px] sm:w-[200px] md:w-[220px] shrink-0 rounded-2xl border overflow-hidden relative shadow-sm ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                    <div className="absolute inset-0 shimmer-overlay z-10 opacity-50" />
                  </div>
                ))}
              </div>
            ) : recommendedGames.length > 0 ? (
              <div className="relative -mx-4 md:-mx-8">
                <div 
                  ref={recRef}
                  className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {recommendedGames.map((game, index) => (
                  <div key={`rec-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
               </div>
              </div>
            ) : null}
          </section>
        )}
      </SectionErrorBoundary>

<SectionErrorBoundary sectionName="Because You Played">
        {selectedCategory === 'All' && !searchQuery && personalizedRecommendations.length > 0 && (
          <section className="mb-8 lg:mb-10 lg:mb-16">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">EXPLORE</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                  {topCategory === 'Trending' ? 'Trending Right Now' : `Because you played ${topCategory}`}
                </h3>
              </div>
            </div>
            
            <div className="relative -mx-4 md:-mx-8">
              <div 
                className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {personalizedRecommendations.map((game, index) => (
                  <div key={`because-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      {/* New Arrivals */}

<SectionErrorBoundary sectionName="New Arrivals">
        {selectedCategory === 'All' && !searchQuery && newArrivals.length > 0 && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">{t('discover') || 'DISCOVER'}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">{t('newArrivals')}</h3>
              </div>
              <div className="flex items-center gap-4">
                {/* Scroll Navigation Arrows */}
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover/shelf:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => handleScroll(newArrivalsRef, 'left')}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleScroll(newArrivalsRef, 'right')}
                    className="p-2.5 rounded-xl border border-white/10 hover:border-accent bg-black/40 text-white hover:text-accent backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={() => {
                    navigate('/category/new-arrivals');
                  }}
                  className={`flex items-center gap-2 text-[10px] font-semibold tracking-wide hover:text-accent transition-colors group ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}
                >
                  {t('viewAll')}
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
 
            <div className="relative -mx-4 md:-mx-8">
              <div 
                ref={newArrivalsRef}
                className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide scroll-smooth snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                {newArrivals.map((game, index) => (
                  <div key={`new-arrival-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
             </div>
          </section>
        )}
      </SectionErrorBoundary>

      {/* Game Grid */}

      <SectionErrorBoundary sectionName="Quick Sessions">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">QUICK PLAY</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Quick 2-Minute Games</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {filteredGames.filter(g => g.avgPlayTime === '2m' || g.avgPlayTime === '5m' || (g.tags && g.tags.includes('Quick'))).slice(0, 10).map((game, index) => (
                  <div key={`quick-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Mobile Friendly">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">ON THE GO</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Good on Mobile</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {filteredGames.filter(g => g.mobileOptimization === 'touch-friendly' || (g.tags && g.tags.includes('Mobile'))).slice(0, 10).map((game, index) => (
                  <div key={`mobile-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Most Played">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">CLASSICS</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Most Played</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {[...filteredGames].sort((a, b) => b.plays - a.plays).slice(0, 10).map((game, index) => (
                  <div key={`most-played-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Hidden Gems">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">HIDDEN GEMS</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Highly Rated, Barely Played</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {[...filteredGames].sort((a, b) => b.rating - a.rating).filter(g => g.plays < 60000).slice(0, 10).map((game, index) => (
                  <div key={`hidden-gems-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Deep Dives">
        {selectedCategory === 'All' && !searchQuery && (
          <section className="mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Hourglass className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">LONG SESSIONS</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Deep Dives & Campaigns</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-4 pt-1 lg:pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {filteredGames.filter(g => g.avgPlayTime === '20m' || g.avgPlayTime === '30m+').slice(0, 10).map((game, index) => (
                  <div key={`deep-dives-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Game Grid">
        <GameGrid 
          filteredGames={filteredGames}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        isDarkMode={isDarkMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        TAGS_LIST={TAGS_LIST}
        displayLimit={displayLimit}
        handleGameClick={handleGameClick}
        setSearchQuery={setSearchQuery}
        setSelectedCategory={setSelectedCategory}
        favorites={userProfile?.favorites || []}
        toggleFavorite={toggleFavorite}
        t={t}
      />

      {displayLimit < filteredGames.length && (
        <div className="mt-12 flex justify-center">
          <button 
            onClick={() => setDisplayLimit((prev: number) => prev + 40)}
            className="btn-primary"
          >
            {t('loadMore')}
          </button>
        </div>
      )}
      </SectionErrorBoundary>

      {/* Continue Playing */}

      {/* Popular Categories Selection */}

      {/* New Arrivals Section */}

      {/* Most Loved Section */}

            <SectionErrorBoundary sectionName="Try Something Different">
        {selectedCategory === 'All' && !searchQuery && recentlyPlayedGames.length > 0 && userProfile?.preferredCategories && userProfile.preferredCategories.length > 0 && (
          <section className="mb-8 lg:mb-10 lg:mb-16 relative group/shelf">
            <div className="flex items-end justify-between mb-6 lg:mb-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-accent">
                  <Compass className="w-4 h-4" />
                  <span className="text-xs font-semibold text-accent/80 tracking-tight">HIDDEN GEMS</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Try Something Different</h3>
              </div>
            </div>
            <div className="relative -mx-4 md:-mx-8">
              <div className="flex overflow-x-auto gap-4 lg:gap-5 pb-6 px-4 md:px-8 scrollbar-hide snap-x flex-nowrap">
                {filteredGames.filter(g => g.category !== userProfile.preferredCategories![0] && !recentlyPlayedGames.some(rg => rg.id === g.id)).slice(0, 10).map((game, index) => (
                  <div key={`diff-${game.id}-${index}`} className="w-[160px] md:w-[200px] shrink-0 snap-start">
                    <GameCard game={game} isDarkMode={isDarkMode} handleGameClick={handleGameClick} favorites={userProfile?.favorites || []} toggleFavorite={toggleFavorite} t={t} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </SectionErrorBoundary>
      {/* Recommended for You Section */}

      {/* Trending Now Section */}

      {/* Footer */}
      <footer className={`relative pt-16 lg:pt-32 pb-8 lg:pb-16 overflow-hidden border-t ${isDarkMode ? 'border-white/5 bg-bg-dark/40' : 'border-black/5 bg-white/40'}`}>
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
                    href={`https://${social.label.toLowerCase()}.com/playdravo`}
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
                    { label: t('aboutUs') || 'About PlayDravo', key: 'About' },
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
                            content: "PlayDravo is an advanced online gaming portal dedicated to providing the fastest, cleanest, and most immersive web gaming experience. Our platform is built on modern web technologies ensuring secure, optimized, and cross-platform compatible gameplay. Join us in making browser gaming excellent again."
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
                © 2026 PlayDravo GAMING. {t('allRightsReserved')}
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
                <span className={`text-[10px] font-mono tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>v2.4.0</span>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
});
