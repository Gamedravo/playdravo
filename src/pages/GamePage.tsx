import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Maximize2, 
  Minimize2,
  Share2, 
  ThumbsUp, 
  ThumbsDown,
  Heart, 
  Play, 
  ChevronRight, 
  Users, 
  Star, 
  Clock, 
  Zap,
  MessageSquare,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Download,
  Code,
  User as UserIcon,
  Info,
  ExternalLink,
  MoreHorizontal,
  LayoutGrid,
  Sparkles,
  Smartphone,
  Calendar,
  Monitor,
  Tag,
  Trophy,
  Shield,
  Award,
  CheckCircle,
  Gamepad2,
  ShieldCheck
} from 'lucide-react';
import { Game } from '../types';
import { SEO } from '../components/SEO';
import { GameCard } from '../components/GameCard';
import { appToast } from '../lib/appToast';
import { api } from '../lib/api';
import { GameThumbnail } from '../components/GameThumbnail';
import { Analytics } from '../lib/analytics';
import { getCategoryPath } from '../utils/categoryRoutes';

const safeFormatDate = (createdAt: any) => {
  try {
    if (!createdAt) return 'May 2026';
    let date: Date;
    if (typeof createdAt === 'object') {
      if (typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
      } else if (createdAt.seconds) {
        date = new Date(createdAt.seconds * 1000);
      } else if (createdAt._seconds) {
        date = new Date(createdAt._seconds * 1000);
      } else {
        date = new Date(createdAt);
      }
    } else {
      date = new Date(createdAt);
    }
    return isNaN(date.getTime()) ? 'May 2026' : date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch (e) {
    return 'May 2026';
  }
};

import { GamePageSkeleton } from '../components/LoadingSkeletons';

interface GamePageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  games: Game[];
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  handleGameClick: (game: Game) => void;
  user: any;
}


export const GamePage: React.FC<GamePageProps> = ({ 
  isDarkMode, 
  t, 
  games, 
  favorites, 
  toggleFavorite,
  handleGameClick,
  user,
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPseudoFullScreen, setIsPseudoFullScreen] = useState(false);
  const [showRotateHint, setShowRotateHint] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerShellRef = useRef<HTMLDivElement>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [claimedAchievements, setClaimedAchievements] = useState<string[]>([]);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [embedStatus, setEmbedStatus] = useState<{ checked: boolean, embeddable: boolean, reason?: string, error?: boolean }>({ checked: false, embeddable: true });

  // Reset states when game changes
  useEffect(() => {
    setIsPlaying(false);
    setIframeLoaded(false);
    setLoadingTimeout(false);
    setEmbedStatus({ checked: false, embeddable: true });
  }, [gameId]);

  // Check embed compatibility
  useEffect(() => {
    // Hard-block risky embeds (ads/popups/redirects) from running inside GameDravo.
    // These sources can open popups or navigate away from the portal.
    if (game?.adsInjected || game?.popupRisk || game?.redirectRisk) {
      setEmbedStatus({
        checked: true,
        embeddable: false,
        reason: 'Blocked: this game source is flagged as unsafe (ads/popups/redirects).',
      });
      return;
    }

    if (game?.url && !embedStatus.checked) {
      const checkEmbed = async () => {
        try {
          const res = await fetch('/api/check-embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: game.url })
          });
          if (res.ok) {
            const data = await res.json();
            setEmbedStatus({
              checked: true,
              embeddable: data.embeddable,
              reason: data.reason,
              error: data.error
            });
          } else {
            setEmbedStatus({ checked: true, embeddable: true });
          }
        } catch (e) {
          console.warn('Could not check embed status:', e);
          // Default to true if check fails to not falsely block games
          setEmbedStatus({ checked: true, embeddable: true });
        }
      };
      checkEmbed();
    }
  }, [game?.url, game?.adsInjected, embedStatus.checked]);

  // Monitor loading timeout
  useEffect(() => {
    setLoadingTimeout(false);
  }, [gameId, isPlaying, reloadKey]);

  useEffect(() => {
    if (isPlaying && !iframeLoaded) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, iframeLoaded]);

  // Load claimed achievements on mount
  useEffect(() => {
    if (gameId) {
      const saved = localStorage.getItem(`topg_achievements_${gameId}`);
      if (saved) {
        try {
          setClaimedAchievements(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      } else {
        setClaimedAchievements([]);
      }
    }
  }, [gameId]);

  // Handle claiming achievements
  const handleClaimAchievement = async (achievementId: string, points: number, acName: string) => {
    if (claimedAchievements.includes(achievementId)) return;
    const updated = [...claimedAchievements, achievementId];
    setClaimedAchievements(updated);
    localStorage.setItem(`topg_achievements_${gameId}`, JSON.stringify(updated));

    // Grant XP via global event (handles local state + Firestore sync for XP/level)
    window.dispatchEvent(new CustomEvent('add-xp', { 
      detail: { amount: points, reason: `Achievement: ${acName}` } 
    }));

    // Toast reward feedback - compact, bottom-positioned
    appToast.achievement(`${acName}`, points);
  };

  const getGameAchievements = (gameTitle: string) => [
    { id: 'ac-session-1', name: 'First Play', desc: `Play ${gameTitle} for the first time.`, points: 50, icon: <Gamepad2 className="w-5 h-5 text-purple-400" /> },
    { id: 'ac-session-2', name: 'Learning the Ropes', desc: 'Master the basic controls and mechanics.', points: 100, icon: <Shield className="w-5 h-5 text-blue-400" /> },
    { id: 'ac-session-3', name: 'High Score', desc: `Reach a new personal best in ${gameTitle}.`, points: 250, icon: <Award className="w-5 h-5 text-amber-500 animate-pulse" /> }
  ];

  useEffect(() => {
    setIsPlaying(false);
    setLiked(null);
    setIframeLoaded(false);
  }, [gameId]);

  useEffect(() => {
    let rotateTimer: NodeJS.Timeout;
    if (isPseudoFullScreen) {
      setShowRotateHint(true);
      rotateTimer = setTimeout(() => setShowRotateHint(false), 4000);
    } else {
      setShowRotateHint(false);
    }
    return () => {
      clearTimeout(rotateTimer);
    };
  }, [isPseudoFullScreen]);

  useEffect(() => {
    setIframeLoaded(false);
  }, [reloadKey]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPseudoFullScreen) return;
      const target = e.target as Node;
      if (iframeRef.current?.contains(target)) return;
      if (playerShellRef.current?.contains(target)) return;
      e.preventDefault();
    };

    if (isPseudoFullScreen) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isPseudoFullScreen]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
      document.documentElement.style.overscrollBehavior = '';
      document.documentElement.style.touchAction = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
    };
  }, []);

  useEffect(() => {
    const foundGame = games.find(g => g.id === gameId);
    if (foundGame) {
      setGame(foundGame);
      window.scrollTo(0, 0);
    } else {
      navigate('/');
    }
  }, [gameId, games, navigate]);

  const relatedGames = useMemo(() => {
    if (!game) return [];
    return games
      .filter(g => g && g.id !== game.id && (g.category === game.category || (g.tags && game.tags && g.tags.some(tag => game.tags?.includes(tag)))))
      .sort((a, b) => {
        const aTagsMatched = a.tags && game.tags ? a.tags.filter(t => game.tags!.includes(t)).length : 0;
        const bTagsMatched = b.tags && game.tags ? b.tags.filter(t => game.tags!.includes(t)).length : 0;
        return (bTagsMatched - aTagsMatched) || (b.rating - a.rating);
      })
      .slice(0, 12);
  }, [games, game]);

  const recommendedGames = useMemo(() => {
    if (!game) return [];
    return games
      .filter(g => g && g.id !== game.id)
      .sort((a, b) => (b.plays * b.rating) - (a.plays * a.rating))
      .slice(0, 8);
  }, [games, game]);

  if (!game) {
    return <GamePageSkeleton isDarkMode={isDarkMode} />;
  }

  const isFavorite = favorites.includes(game.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    appToast.success(t('linkCopied'));
  };

  const disablePseudoFullScreen = () => {
    setIsPseudoFullScreen(false);
    if (window.innerWidth < 1024) {
      setIsPlaying(false);
    }
    const scrollY = document.body.style.top;
    document.documentElement.style.overscrollBehavior = '';
    document.documentElement.style.touchAction = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.overscrollBehavior = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
    (document.body.style as any).webkitUserSelect = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
  };

  const toggleFullScreen = () => {
    if (!iframeRef.current) return;
    
    const element = iframeRef.current as any;
    
    // If already in pseudo-fullscreen, exit it
    if (isPseudoFullScreen) {
      disablePseudoFullScreen();
      return;
    }

    if (!document.fullscreenElement) {
      const requestMethod = element.requestFullscreen || 
                           element.webkitRequestFullscreen || 
                           element.mozRequestFullScreen || 
                           element.msRequestFullscreen;
      
      if (requestMethod) {
        try {
          const promise = requestMethod.call(element);
          if (promise && promise.catch) {
            promise.catch((err: any) => {
              console.warn(`Native fullscreen failed, falling back to pseudo-fullscreen: ${err.message}`);
              enablePseudoFullScreen();
            });
          }
        } catch (err: any) {
          console.warn(`Native fullscreen failed, falling back to pseudo-fullscreen: ${err.message}`);
          enablePseudoFullScreen();
        }
      } else {
        // Fallback for iOS and other browsers that don't support native iframe fullscreen
        enablePseudoFullScreen();
      }
    } else {
      const exitMethod = document.exitFullscreen || 
                        (document as any).webkitExitFullscreen || 
                        (document as any).mozCancelFullScreen || 
                        (document as any).msExitFullscreen;
      
      if (exitMethod) {
        exitMethod.call(document);
      }
    }
  };

  const enablePseudoFullScreen = () => {
    setIsPseudoFullScreen(true);
    const scrollY = window.scrollY;
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';
    appToast.info("Entering theater mode (native fullscreen not supported on this device)");
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      <SEO 
        title={`${game.title} – Free Online ${game.category} Game | GameDravo`}
        description={`Play ${game.title} free online — no download, no sign-up. ${game.description ? game.description.substring(0, 120).trim() + '…' : `A free ${game.category} game you can play instantly in your browser on GameDravo.`}`}
        keywords={`${game.title}, play ${game.title} online, free ${game.category} game, ${game.category} games, browser games, GameDravo${game.tags ? ', ' + game.tags.slice(0, 5).join(', ') : ''}`}
        image={game.thumbnail}
        canonicalUrl={`https://www.gamedravo.com/games/${game.id}`}
        url={`https://www.gamedravo.com/games/${game.id}`}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'VideoGame',
          name: game.title,
          description: game.description || `Play ${game.title} online for free on GameDravo.`,
          url: `https://www.gamedravo.com/games/${game.id}`,
          image: game.thumbnail,
          genre: game.category,
          operatingSystem: 'Web Browser',
          applicationCategory: 'Game',
          gamePlatform: 'Web Browser',
          playMode: 'SinglePlayer',
          ...(game.rating && game.ratingCount ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: game.rating.toFixed(1),
              ratingCount: game.ratingCount,
              bestRating: '5',
              worstRating: '1',
            },
          } : {}),
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gamedravo.com' },
              { '@type': 'ListItem', position: 2, name: `${game.category} Games`, item: `https://www.gamedravo.com/category/${game.category.toLowerCase().replace(/\s+/g, '-')}` },
              { '@type': 'ListItem', position: 3, name: game.title, item: `https://www.gamedravo.com/games/${game.id}` },
            ],
          },
        }}
      />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 py-3 md:py-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold tracking-tight uppercase mb-3 md:mb-4 opacity-70">
          <Link to="/" className="hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">Home</Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <Link to={getCategoryPath(game.category)} className="hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">{game.category}</Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span className="text-accent truncate flex-1" aria-current="page">{game.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0 space-y-4 md:space-y-5">
            {/* Unified Player & Action Bar Container */}
            <div className={`flex flex-col rounded-[1.5rem] lg:rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#0f0f13] border-white/5' : 'bg-white border-black/5'}`}>
              
              {/* Hero / Player Section */}
              <div className={`group shrink-0 ${
                isPseudoFullScreen 
                  ? 'fixed inset-0 z-[99999] rounded-none border-none w-screen h-[100dvh] bg-black m-0 p-0 flex flex-col items-center justify-center' 
                  : 'relative bg-black transition-all duration-300 aspect-[4/3] md:aspect-video w-full'
              }`}>
              {!isPlaying && !isPseudoFullScreen ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-4">
                  <GameThumbnail 
                    src={game.thumbnail} 
                    alt={game.title} 
                    category={game.category}
                    className="absolute inset-0 w-full h-full object-cover blur-sm opacity-40 scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Mobile: Compact instant-play layout */}
                  <div className="relative z-10 w-full h-full flex flex-col lg:hidden">
                    {/* Top: Minimal info bar */}
                    <div className="flex items-center justify-between px-2 pt-2 pb-1">
                      <span className="px-2 py-0.5 bg-accent/90 text-white text-[8px] font-bold tracking-tight uppercase rounded-md">
                        {game.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-[10px] font-semibold">{(typeof game.rating === 'number' ? game.rating : Number(game.rating || 0)).toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Center: Large play button area */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const isMobile = window.innerWidth < 1024;
                          if (isMobile && game.mobileOptimization === 'desktop-only' && !showMobileWarning) {
                            setShowMobileWarning(true);
                            return;
                          }
                          if (game.adsInjected || game.popupRisk || game.redirectRisk) {
                            appToast.error('This game is temporarily disabled due to safety risks.');
                            return;
                          }
                          setIsPlaying(true);
                          window.dispatchEvent(new CustomEvent('add-xp', { 
                            detail: { amount: 50, reason: `Played ${game.title}` } 
                          }));
                        }}
                        className="w-20 h-20 rounded-full bg-accent hover:bg-accent/90 text-white flex items-center justify-center shadow-xl shadow-accent/30"
                      >
                        <Play className="w-10 h-10 fill-current ml-1" />
                      </motion.button>
                      <span className="text-[11px] text-white/60 font-medium">Tap to play</span>
                    </div>
                    
                    {/* Bottom: Game title */}
                    <div className="px-3 pb-3 text-center">
                      <p className="text-lg font-bold tracking-tight text-white line-clamp-1 mb-1">
                        {game.title}
                      </p>
                      <div className="flex items-center justify-center gap-3 text-[10px] text-white/50">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {Number(game.plays || 0).toLocaleString()}
                        </span>
                        {game.mobileOptimization === 'touch-friendly' && (
                          <span className="flex items-center gap-1 text-green-400">
                            <Smartphone className="w-3 h-3" />
                            Mobile Ready
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Full hero layout */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden lg:flex relative z-10 text-center px-4 sm:px-6 w-full max-w-2xl mx-auto flex-col items-center justify-center h-full"
                  >
                    <div className="mb-4 lg:mb-6 relative shrink-0">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl mx-auto">
                        <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} className="w-full h-full object-cover shadow-lg" />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent text-bg-dark text-[10px] font-semibold tracking-tight uppercase rounded-full shadow-md whitespace-nowrap">
                        {game.category}
                      </div>
                    </div>

                    <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-white mb-4 lg:mb-6 drop-shadow-2xl line-clamp-2">
                      {game.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4 opacity-90">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur border border-green-500/30 text-green-400 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified for Browser
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 backdrop-blur border border-white/10 text-white/80 rounded-full text-xs font-semibold tracking-wide shadow-sm">
                        <LayoutGrid className="w-3.5 h-3.5 opacity-70" />
                        Safe Launch
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (game.adsInjected || game.popupRisk || game.redirectRisk) {
                          appToast.error('This game is temporarily disabled due to safety risks.');
                          return;
                        }
                        setIsPlaying(true);
                        window.dispatchEvent(new CustomEvent('add-xp', { 
                          detail: { amount: 50, reason: `Played ${game.title}` } 
                        }));
                      }}
                      className="group relative px-10 py-4 bg-accent hover:bg-accent/90 text-white rounded-2xl font-bold text-base overflow-hidden shrink-0 shadow-lg"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="flex items-center gap-3">
                        <Play className="w-5 h-5 fill-current" />
                        {t('playNow')}
                      </div>
                    </motion.button>
                    
                    <div className="text-[10px] text-white/50 tracking-wide pt-1">
                      Works on Chrome, Safari, Edge, Firefox, iOS, & Android
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div ref={playerShellRef} className="relative w-full h-full bg-black touch-auto">
                  {(!iframeLoaded || !embedStatus.embeddable) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a0a0a] px-4 pointer-events-auto">
                      <div className="absolute inset-0 shimmer-overlay opacity-20" />
                      <div className="relative z-30 flex flex-col items-center gap-6 max-w-sm text-center">
                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl animate-pulse">
                          <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col items-center gap-3">
                          {!embedStatus.embeddable ? (
                            <div className="space-y-4">
                              <span className="text-sm font-semibold text-red-400 block leading-relaxed">
                                This game is disabled for safety (ads/popups/redirects).
                              </span>
                              <span className="text-[10px] text-white/50 block uppercase tracking-wider mb-2">
                                Disabled on GameDravo
                              </span>
                              <div className="flex justify-center gap-3 pt-2">
                                <button 
                                  onClick={() => {
                                    setIsPlaying(false);
                                    if (isPseudoFullScreen) {
                                      disablePseudoFullScreen();
                                    }
                                  }}
                                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[11px] font-bold uppercase transition focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          ) : !loadingTimeout ? (
                            <div className="w-full max-w-xs space-y-3">
                              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div className="h-full w-1/3 rounded-full bg-accent/60 animate-[loader-slide_1s_ease-in-out_infinite]" />
                              </div>
                              <span className="text-[10px] font-medium tracking-wide text-white/40 uppercase">Starting game</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <span className="text-xs font-semibold text-amber-500 block leading-relaxed">
                                Loading is taking unusually long. Some secure sandboxes restrict raw frames.
                              </span>
                              <div className="flex justify-center gap-3">
                                <button 
                                  onClick={() => setReloadKey(prev => prev + 1)}
                                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase transition"
                                >
                                  Retry
                                </button>
                                <button 
                                  onClick={() => {
                                    setIsPlaying(false);
                                    if (isPseudoFullScreen) {
                                      disablePseudoFullScreen();
                                    }
                                  }}
                                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase transition"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {embedStatus.embeddable && (
                    <iframe
                      key={reloadKey}
                      ref={iframeRef}
                      src={game.url}
                      className={`w-full border-0 touch-auto touch-manipulation transition-opacity duration-700 ${iframeLoaded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} ${isPseudoFullScreen ? 'h-[100dvh]' : 'h-full min-h-[240px]'}`}
                      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
                      allow="autoplay; fullscreen; gamepad; keyboard *"
                      allowFullScreen
                      title={game.title}
                      scrolling="no"
                      referrerPolicy="no-referrer"
                      onLoad={() => setIframeLoaded(true)}
                      onError={(e) => {
                        console.warn('Iframe error event trigged', e);
                        setLoadingTimeout(true);
                      }}
                    />
                  )}
                  


                  {/* Pseudo Full Screen Mobile / Desktop Top Bar */}
                  {isPseudoFullScreen && (
                    <>
                      {/* Rotate Device Recommendation */}
                      <AnimatePresence>
                        {showRotateHint && game.orientation !== 'any' && (
                          <div className={`absolute bottom-8 inset-x-0 justify-center pointer-events-none z-[10001]
                            ${(!game.orientation || game.orientation === 'landscape') ? 'portrait:flex landscape:hidden' : ''}
                            ${game.orientation === 'portrait' ? 'landscape:flex portrait:hidden' : ''}
                          `}>
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.5 }}
                              className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-medium px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 shadow-lg"
                            >
                              <Smartphone className={`w-3.5 h-3.5 opacity-80 ${(!game.orientation || game.orientation === 'landscape') ? 'rotate-90' : 'rotate-0'}`} />
                              {(!game.orientation || game.orientation === 'landscape') ? 'Rotate to landscape' : 'Rotate to portrait'} for best experience
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      <div className={`absolute top-0 inset-x-0 px-4 pb-4 pt-[max(env(safe-area-inset-top,16px),16px)] flex items-center justify-between z-[10000] pointer-events-none transition-opacity duration-500 touch-pan-x touch-pan-y opacity-100`}>
                        {/* Top Bar Background Gradient */}
                        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent -z-10 pointer-events-none" />
                        
                        {/* Left: Back */}
                        <div className="flex-1 flex justify-start pointer-events-auto">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={disablePseudoFullScreen}
                            className="p-2 sm:p-2.5 bg-black/55 hover:bg-black/70 text-white rounded-full border border-white/10 transition-colors shadow-sm"
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Center: Title */}
                        <div className="flex-[2] flex justify-center items-center gap-2 pointer-events-none cursor-default">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded overflow-hidden shadow-sm border border-white/10 hidden sm:block">
                            <GameThumbnail src={game.thumbnail} alt="" category={game.category} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-white/90 font-medium tracking-wide text-[11px] sm:text-sm drop-shadow-md truncate pointer-events-none">{game.title}</span>
                        </div>
                        
                        {/* Right: Reload */}
                        <div className="flex-1 flex justify-end pointer-events-auto">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setReloadKey(prev => prev + 1)}
                            className="p-2 sm:p-2.5 bg-black/55 hover:bg-black/70 text-white rounded-full border border-white/10 transition-colors shadow-sm"
                          >
                            <RefreshCw className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar - Compact on Mobile */}
            <div className={`p-3 sm:p-6 flex items-center justify-between gap-3 sm:gap-6 transition-colors duration-150 z-40 relative border-t ${isDarkMode ? 'bg-bg-dark border-white/5' : 'bg-white border-black/5'} w-full`}>
              {/* Mobile: Minimal info */}
              <div className="flex lg:hidden items-center gap-2 min-w-0 flex-1">
                <div className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {game.title}
                </div>
                {(game.isHot || game.isTop) && (
                  <div className="px-1.5 py-0.5 bg-accent/20 text-accent text-[7px] font-semibold tracking-wide rounded shrink-0">
                    {game.isHot ? 'HOT' : 'TOP'}
                  </div>
                )}
              </div>

              {/* Desktop: Full info */}
              <div className="hidden lg:flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                  <GameThumbnail src={game.thumbnail} alt={game.title} category={game.category} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {game.title}
                    </h2>
                    {(game.isHot || game.isTop) && (
                      <div className="px-2 py-0.5 bg-accent/20 text-accent text-[8px] font-semibold tracking-wide rounded-md border border-accent/30">
                        {game.isHot ? 'HOT' : 'TOP'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold opacity-70">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {Number(game.plays || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {(typeof game.rating === 'number' ? game.rating : Number(game.rating || 0)).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {game.fullscreenSupport && (
                      <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                        <Maximize2 className="w-3 h-3" /> Fullscreen
                      </span>
                    )}
                    {game.mobileOptimization && (
                      <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                         <Smartphone className="w-3 h-3" /> {game.mobileOptimization === 'touch-friendly' ? 'Touch Controls' : 'Mobile Ready'}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified Working
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons - compact row on mobile */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Like/Dislike - hidden on small mobile */}
                <div className={`hidden sm:flex items-center gap-1 p-1 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLiked(liked === true ? null : true)}
                    className={`p-2.5 rounded-xl transition-all ${liked === true ? 'bg-green-500 text-white' : 'hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${liked === true ? 'fill-current' : ''}`} />
                  </motion.button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLiked(liked === false ? null : false)}
                    className={`p-2.5 rounded-xl transition-all ${liked === false ? 'bg-red-500 text-white' : 'hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${liked === false ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                {/* Core actions - always visible */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {[
                    { id: 'favorite', icon: Heart, onClick: handleToggleFavorite, active: isFavorite, color: 'text-red-500', mobileVisible: true },
                    { id: 'share', icon: Share2, onClick: handleShare, mobileVisible: true },
                    { id: 'fullscreen', icon: Maximize2, onClick: toggleFullScreen, mobileVisible: true },
                    { id: 'embed', icon: Code, onClick: () => {
                      const embedCode = `<iframe src="${window.location.origin}/games/${game.id}" width="800" height="600" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
                      navigator.clipboard.writeText(embedCode);
                      appToast.success('Embed code copied to clipboard!');
                      Analytics.trackShare(game.id);
                    }, mobileVisible: false },
                    { id: 'new-tab', icon: ExternalLink, onClick: () => {
                      if (game.adsInjected || game.popupRisk || game.redirectRisk) {
                        appToast.error('This game is disabled due to safety risks.');
                        return;
                      }
                      Analytics.trackGameOpen(game.id, game.title);
                      window.open(game.url, '_blank');
                    }, mobileVisible: false },
                  ].map((action) => (
                    <motion.button
                      key={`game-action-${action.id}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={action.onClick}
                      className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all ${
                        action.mobileVisible === false ? 'hidden sm:flex' : 'flex'
                      } ${
                        action.active 
                          ? 'bg-accent border-accent text-white shadow-sm' 
                          : isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/20 text-white/60 hover:text-white' : 'bg-black/5 border-black/5 hover:border-black/20 text-black/60 hover:text-black'
                      }`}
                    >
                      <action.icon className={`w-4 h-4 ${action.active ? 'fill-current' : ''} ${action.active ? '' : action.color || ''}`} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
            </div>

            {/* Game Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mt-2">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    About {game.title}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className={`leading-relaxed text-sm ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                      {game.description}
                    </p>
                    <p className={`leading-relaxed text-sm mt-3 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                      {game.title} is a {game.category.toLowerCase()} game that you can play directly in your browser.
                    </p>
                  </div>

                  {/* Verified Badges / Social Proof Checklist */}
                  <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: 'Instant Play', value: 'Zero Install', desc: 'No local downloads' },
                      { 
                        label: 'Optimization', 
                        value: game.mobileOptimization === 'touch-friendly' ? 'Mobile Ready' : 'Desktop Best', 
                        desc: game.mobileOptimization === 'touch-friendly' ? 'Full touch support' : 'Keyboard required' 
                      },
                      { 
                        label: 'Display', 
                        value: game.fullscreenSupport ? 'Immersive' : 'Windowed', 
                        desc: game.fullscreenSupport ? 'Native fullscreen UI' : 'Fixed aspect ratio' 
                      }
                    ].map((badge, idx) => (
                      <div key={`badge-${idx}`} className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.01] border-black/5'}`}>
                        <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                          <CheckCircle className="w-3.5 h-3.5 fill-current opacity-85" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{badge.label}</span>
                        </div>
                        <div className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{badge.value}</div>
                        <div className={`text-[9px] font-semibold opacity-50`}>{badge.desc}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className={`border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'}`} />

                <section>
                  <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    How to play
                  </h3>
                  <div className={`p-6 rounded-2xl border space-y-4 mb-6 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                      {game.howToPlay || game.instructions || `Use your mouse or keyboard to play ${game.title}. Follow the on-screen interactive tutorial to understand the core loop, and master the timing to get comfortable with the mechanics.`}
                    </p>

                    {/* Desktop control layouts */}
                    {game.controls ? (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                         <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Controls</span>
                         <p className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-black/70'} whitespace-pre-wrap`}>{String(game.controls).replace(/\\n/g, '\n')}</p>
                      </div>
                    ) : (
                      ['Action', 'Adventure', 'Sports', 'Multiplayer', 'Arcade'].includes(game.category) ? (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Desktop Key Bindings</span>
                          <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex gap-1">
                              {['W', 'A', 'S', 'D'].map((key) => (
                                <kbd key={key} className={`px-2.5 py-1.5 rounded text-xs font-bold font-mono border shadow-sm ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'}`}>{key}</kbd>
                              ))}
                            </div>
                            <span className="text-[11px] font-bold opacity-60">Move Character / Vehicle</span>
                            <kbd className={`px-4 py-1.5 rounded text-xs font-bold font-mono border shadow-sm whitespace-nowrap ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'}`}>SPACEBAR</kbd>
                            <span className="text-[11px] font-bold opacity-60">Jump / Nitro</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Desktop Key Bindings</span>
                          <div className="flex flex-wrap gap-4 items-center">
                            <kbd className={`px-3 py-1.5 rounded text-xs font-bold font-mono border shadow-sm whitespace-nowrap ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'}`}>Left Mouse Click</kbd>
                            <span className="text-[11px] font-bold opacity-60">Drag, Drop & Highlight Items</span>
                            <kbd className={`px-2 py-1.5 rounded text-xs font-bold font-mono border shadow-sm ${isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-black/5 text-black border-black/10'}`}>ESC</kbd>
                            <span className="text-[11px] font-bold opacity-60">Pause</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  
                  {game.tipsAndTricks && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold tracking-tight mb-2 opacity-80">Tips & Tricks</h4>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                        {String(game.tipsAndTricks).replace(/\\n/g, '\n')}
                      </p>
                    </div>
                  )}

                  {game.whyYoullLikeIt && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold tracking-tight mb-2 opacity-80">Why You'll Like It</h4>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                        {String(game.whyYoullLikeIt).replace(/\\n/g, '\n')}
                      </p>
                    </div>
                  )}
                </section>

              </div>

              <div className="space-y-6 lg:border-l lg:pl-10 lg:ml-2">
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold tracking-wide mb-6 opacity-70 uppercase">Game Information</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Platform', value: 'Browser (HTML5)', icon: Monitor },
                      { label: 'Best For', value: game.mobileOptimization === 'touch-friendly' ? 'Mobile Contexts' : 'Desktop/Mouse', icon: Smartphone },
                      { label: 'Session Style', value: parseInt(game.avgPlayTime || '10') <= 5 ? 'Quick Breaks' : 'Deep Dives', icon: Clock },
                      { label: 'Category', value: game.category, icon: LayoutGrid },
                      { label: 'Rating', value: `${(typeof game.rating === 'number' ? game.rating : Number(game.rating || 0)).toFixed(1)}/5.0`, icon: Star },
                      { label: 'Total Plays', value: `${Number(game.plays || 0).toLocaleString()}`, icon: Users },
                      { label: 'Developer', value: game.developer || 'GameDravo Studios', icon: UserIcon }
                    ].map((stat, idx) => (
                      <div key={`game-stat-${stat.label}-${idx}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 opacity-70">
                          <stat.icon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <span className="text-xs font-semibold tracking-tight uppercase text-accent truncate max-w-[120px] text-right" title={stat.value}>{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {game.tags && game.tags.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-4 opacity-70">
                        <Tag className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {game.tags.map(tag => (
                          <span key={tag} className={`px-2.5 py-1 text-[10px] font-semibold tracking-wide rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/10 text-white/80' : 'bg-black/5 border-black/10 text-black/80'}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Game Milestones & Badges Tray */}
            <section className="space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-accent/20 rounded-xl text-accent shrink-0">
                    <Trophy className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>Achievements</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>Complete challenges in {game.title} to earn XP.</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                  claimedAchievements.length === 3 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {claimedAchievements.length} / 3 Completed
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {getGameAchievements(game.title).map((ac, idx) => {
                  const isClaimed = claimedAchievements.includes(ac.id);
                  return (
                    <div 
                      key={ac.id}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                        isClaimed 
                          ? isDarkMode ? 'bg-[#151525]/30 border-green-500/20 opacity-80' : 'bg-green-500/5 border-green-500/20 opacity-80'
                          : isDarkMode ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-black/[0.02] border-black/5 hover:border-black/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2 rounded-lg ${isClaimed ? 'bg-green-500/10 text-green-500' : 'bg-white/5 opacity-85'}`}>
                            {ac.icon}
                          </div>
                          <span className={`text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                            isClaimed ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'
                          }`}>
                            +{ac.points} XP
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>{ac.name}</h4>
                        <p className={`text-[10px] leading-relaxed mb-4 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{ac.desc}</p>
                      </div>

                      <motion.button
                        whileHover={!isClaimed ? { scale: 1.02 } : {}}
                        whileTap={!isClaimed ? { scale: 0.98 } : {}}
                        disabled={isClaimed}
                        onClick={() => handleClaimAchievement(ac.id, ac.points, ac.name)}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isClaimed 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default'
                            : 'bg-accent hover:bg-accent/90 text-white'
                        }`}
                      >
                        {isClaimed ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            Claimed
                          </>
                        ) : (
                          'Claim Badge'
                        )}
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Related Games Grid */}
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  <div className="w-1.5 h-6 bg-accent rounded-full" />
                  {t('playersAlsoLiked') || 'Players Also Liked'}
                </h2>
                <Link to={getCategoryPath(game.category)} className="text-xs font-semibold tracking-tight uppercase text-accent hover:underline">
                  {t('moreFrom' + game.category) || `More from ${game.category}`}
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {relatedGames.map((relatedGame, idx) => (
                  <GameCard 
                    key={`related-${relatedGame.id}-${idx}`}
                    game={relatedGame}
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

          {/* Right Sidebar - Recommended Games */}
          <div className="lg:w-80 shrink-0 space-y-4 md:space-y-6">
            <div className={`p-6 rounded-[1.5rem] lg:rounded-[2.5rem] border sticky top-24 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
              <h2 className={`text-lg font-bold tracking-tight mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <Sparkles className="w-5 h-5 text-accent" />
                {t('recommended')}
              </h2>
              <div className="space-y-4">
                {recommendedGames.map((recGame, idx) => (
                  <motion.div
                    key={`rec-${recGame.id}-${idx}`}
                    whileHover={{ x: 2 }}
                    className="group cursor-pointer"
                    onClick={() => handleGameClick(recGame)}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/5 shrink-0 relative bg-white/[0.02]">
                        <GameThumbnail src={recGame.thumbnail} alt={recGame.title} category={recGame.category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className={`text-xs font-bold leading-tight truncate group-hover:text-accent transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          {recGame.title}
                        </h4>
                        <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest mb-2">{recGame.category}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                            <span className="text-[9px] font-bold opacity-90">{(typeof recGame.rating === 'number' ? recGame.rating : Number(recGame.rating || 0)).toFixed(1)}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-white/10" />
                          <span className="text-[10px] font-semibold opacity-90 uppercase tracking-tight">{Number(recGame.plays || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="w-full mt-8 py-4 bg-accent text-bg-dark rounded-2xl font-semibold tracking-wide text-[10px] shadow-lg"
              >
                {t('exploreMore')}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop-Only Game Warning Modal */}
      <AnimatePresence>
        {showMobileWarning && (
          <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMobileWarning(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">Desktop Recommended</h3>
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                This game requires a physical keyboard and mouse to play optimally. You might experience broken controls on this touch device.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setShowMobileWarning(false);
                    setIsPlaying(true);
                    enablePseudoFullScreen();
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Play Anyway
                </button>
                <button 
                  onClick={() => setShowMobileWarning(false)}
                  className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
