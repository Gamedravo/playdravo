import { useState, useMemo, useEffect, useRef, Component, ErrorInfo, ReactNode, lazy, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { 
  Gamepad2, 
  Search, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Star, 
  ChevronRight, 
  ChevronUp,
  X, 
  Maximize2, 
  Share2, 
  ThumbsUp, 
  Play,
  Menu,
  Heart,
  Zap,
  Sparkles,
  Dices,
  Users,
  Bell,
  Settings,
  Flame,
  Rocket,
  Plus,
  Wrench,
  Video,
  Twitter,
  Disc,
  Youtube,
  Github,
  ArrowRight,
  MessageSquare,
  RotateCcw,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  AlertTriangle,
  AlertCircle,
  Command,
  ChevronLeft,
  ArrowUp,
  HelpCircle,
  Check,
  FileText,
  ShieldCheck,
  Mail,
  LifeBuoy,
  BrainCircuit,
  ShieldAlert,
  Sun,
  Moon,
  Target,
  Ban,
  BookOpen,
  MessageCircle,
  Bot,
  Terminal,
  ExternalLink,
  Tag as TagIcon,
  Filter,
  Bug,
  LayoutGrid,
} from 'lucide-react';
import { GameThumbnail } from './components/GameThumbnail';
import { Footer } from './components/Footer';
import { useModals } from './hooks/useModals';

import { Toaster } from 'sonner';
import { appToast } from './lib/appToast';
import { ToastGameModeSync } from './components/ToastGameModeSync';
import { Analytics } from './lib/analytics';
import { GAMES as STATIC_GAMES, CATEGORY_LIST as CATEGORIES, TAGS_LIST } from './games';
import { parseFirebaseGame } from './utils/gameUtils';
import { buildRecommendations } from './utils/recommendations';
import { Game, Mod, ChatMessage, UserProfile, GameRequest, BugReport, Category, Tag, Theme } from './types';
import { 
  db, 
  auth, 
  signInWithGoogle, 
  logout, 
  handleFirestoreError, 
  OperationType,
  runTransaction,
  serverTimestamp,
  persistencePromise
} from './firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  setDoc,
  getDoc,
  getDocs,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, getRedirectResult } from 'firebase/auth';
import { NotificationsProvider, useNotifications } from './components/NotificationsProvider';
import { SEO } from './components/SEO';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileDropdown } from './components/ProfileDropdown';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { HighlightText } from './components/HighlightText';
import { Language, translations, TranslationKey } from './lib/translations';
import { LazyRoute } from './components/LazyRoute';
import { SidebarProvider } from './contexts/SidebarContext';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { markRouteVisited } from './lib/routeVisitCache';
import { isAdminEmail } from './lib/brandContact';
import { devLog } from './lib/devLog';

const GamePage = lazy(() => import('./pages/GamePage').then((m) => ({ default: m.GamePage })));
const GlobalModals = lazy(() => import('./components/GlobalModals').then((m) => ({ default: m.GlobalModals })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const PreferencesModal = lazy(() => import('./components/PreferencesModal').then((m) => ({ default: m.PreferencesModal })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then((m) => ({ default: m.AIAssistant })));

const CategoryPage = lazy(() => import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then((module) => ({ default: module.AdminPanel })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(module => ({ default: module.SupportPage })));
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(module => ({ default: module.LibraryPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({ default: module.TermsPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const StatusPage = lazy(() => import('./pages/StatusPage').then(module => ({ default: module.StatusPage })));
const ReportBugPage = lazy(() => import('./pages/ReportBugPage').then(module => ({ default: module.ReportBugPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const SubmitGamePage = lazy(() => import('./pages/SubmitGamePage').then(module => ({ default: module.SubmitGamePage })));
const CookiesPage = lazy(() => import('./pages/CookiesPage').then(module => ({ default: module.CookiesPage })));

const categoryKeyMap: Record<string, keyof typeof translations['en']> = {
  'Action': 'action',
  'Adventure': 'adventure',
  'Arcade': 'arcade',
  'Casual': 'casual',
  'Horror': 'horror',
  'Puzzle': 'puzzle',
  'Simulator': 'simulator',
  'Obby': 'obby',
  'Sports': 'sports',
  'Strategy': 'strategy',
  'Multiplayer': 'multiplayer',
  '2 Player': 'twoPlayer',
  '3 Player': 'threePlayer',
  '4 Player': 'fourPlayer',
  'RPG': 'rpg',
  'Simulation': 'simulation',
  'Racing': 'racing',
  'Platformer': 'platformer',
  'Shooter': 'shooter',
  'Fighting': 'fighting',
  'Sandbox': 'sandbox',
  'Stealth': 'stealth',
  'Survival': 'survival',
  'Rhythm': 'rhythm',
  'Educational': 'educational',
  'Card': 'card',
  'Board': 'board',
  'Indie': 'indie',
  'All': 'all',
  'Favorites': 'favorites',
  'Recommended': 'recommended',
  'History': 'history',
  'Trending': 'trending'
};

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const language = (localStorage.getItem('language') || 'en') as Language;
      const t = (key: string) => {
        if (!key) return '';
        const langData = (translations as any)[language] || translations['en'];
        const result = langData[key] || (translations['en'] as any)[key];
        if (result) return result;
        
        const isVariable = /^[a-zA-Z0-9_-]+$/.test(key) && 
                           (/[A-Z]/.test(key) || /_[a-zA-Z]/.test(key) || /-[a-zA-Z]/.test(key) || key === 'history');
        if (isVariable) {
          return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_-]+/g, ' ')
            .trim()
            .split(/\s+/)
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
            .join(' ');
        }
        return key;
      };
      
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-3">Something went wrong</h2>
            <p className="text-sm opacity-70 mb-8 leading-relaxed">
              We encountered an unexpected error while loading this page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-accent hover:text-white transition-all uppercase tracking-widest text-xs"
            >
              Retry Loading
            </button>
            {this.state.error && (
              <pre className="mt-6 p-4 bg-black/20 rounded-xl text-[10px] font-mono opacity-50 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { SectionErrorBoundary } from './components/SectionErrorBoundary';

const PageLayout = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0.9, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="w-full"
  >
    <SectionErrorBoundary sectionName="Page Content">
      {children}
    </SectionErrorBoundary>
  </motion.div>
);

const ACCENT_COLORS = [
  { name: 'Electric Blue', value: '#3B82F6' },
  { name: 'Royal Blue', value: '#2563EB' },
  { name: 'Deep Blue', value: '#1D4ED8' },
  { name: 'Indigo Blue', value: '#4F46E5' },
  { name: 'Sky Blue', value: '#0EA5E9' },
];

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ToastGameModeSync />
        <ErrorBoundary>
          <NotificationsProvider>
              <AppContent />
          </NotificationsProvider>
        </ErrorBoundary>
      </Router>
    </HelmetProvider>
  );
}


function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const t = useMemo(() => (key: string) => {
    if (!key) return '';
    const langData = (translations as any)[language] || translations['en'];
    const result = langData[key] || (translations['en'] as any)[key];
    if (result) return result;

    // Explicit translations for common internal keys
    if (key === 'continuePlaying') return language === 'pt' ? 'Continuar Jogando' : language === 'es' ? 'Continuar Jugando' : language === 'fr' ? 'Continuer à Jouer' : language === 'de' ? 'Weiterspielen' : language === 'it' ? 'Continua a Giocare' : 'Continue Playing';
    if (key === 'playersAlsoLiked') return language === 'pt' ? 'Jogadores Também Gostaram' : language === 'es' ? 'A otros jugadores también les gustó' : language === 'fr' ? 'Les joueurs ont aussi aimé' : language === 'de' ? 'Anderen Spielern gefiel auch' : language === 'it' ? 'Anche ai giocatori è piaciuto' : 'Players Also Liked';
    if (key === 'quickResume') return language === 'pt' ? 'Retomar Rápido' : language === 'es' ? 'Reanudación Rápida' : language === 'fr' ? 'Reprise Rapide' : language === 'de' ? 'Schnellfortsetzung' : language === 'it' ? 'Ripristino Rapido' : 'Quick Resume';
    
    // Dynamic category translation for "moreFrom" keys
    if (key.startsWith('moreFrom')) {
      const cat = key.slice(8);
      const categoryLabel = cat
        .replace(/([A-Z])/g, ' $1')
        .trim();
      
      if (language === 'pt') return `Mais de ${categoryLabel}`;
      if (language === 'es') return `Más de ${categoryLabel}`;
      if (language === 'fr') return `Plus de ${categoryLabel}`;
      if (language === 'de') return `Mehr von ${categoryLabel}`;
      if (language === 'it') return `Di più da ${categoryLabel}`;
      return `More from ${categoryLabel}`;
    }

    // High fidelity auto-formatting for other camelCase, snake_case, PascalCase labels
    const isVariable = /^[a-zA-Z0-9_-]+$/.test(key) && 
                       (/[A-Z]/.test(key) || /_[a-zA-Z]/.test(key) || /-[a-zA-Z]/.test(key) || key === 'history');
    if (isVariable) {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .map(word => {
          if (!word) return '';
          if (word === word.toUpperCase() && word.length > 1) return word;
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    }

    return key;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const [games, setGames] = useState<Game[]>(STATIC_GAMES);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const mainRef = useRef<HTMLDivElement>(null);
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedCategory, setSelectedCategoryRaw] = useState('All');
  const setSelectedCategory = useCallback((cat: string) => {
    setSelectedCategoryRaw(cat);
    if (cat !== 'All') {
      Analytics.trackCategoryVisit(cat);
    }
  }, []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeGameMods, setActiveGameMods] = useState<Mod[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchMounted, setSearchMounted] = useState(() => location.pathname === '/search');
  const [isScrolled, setIsScrolled] = useState(false);
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(() => {
    const saved = localStorage.getItem('topg_newsletter');
    return saved === 'true';
  });
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [dailyBonus, setDailyBonus] = useState(3000);
  const [canClaimBonus, setCanClaimBonus] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiChatMessages, setAIChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [isAITyping, setIsAITyping] = useState(false);
  
  // Modal states from hook
  const modalsState = useModals();
  const {
    isCommandPaletteOpen, setIsCommandPaletteOpen,
    isHelpCenterOpen, setIsHelpCenterOpen,
    isStatusModalOpen, setIsStatusModalOpen,
    isSupportModalOpen, setIsSupportModalOpen,
    isLegalModalOpen, setIsLegalModalOpen,
    isPreferencesModalOpen, setIsPreferencesModalOpen,
    isReportModalOpen, setIsReportModalOpen,
    isLoginModalOpen, setIsLoginModalOpen,
    isUsernameModalOpen, setIsUsernameModalOpen,
    isBugReportModalOpen, setIsBugReportModalOpen,
    openAccountSettings,
    accountSettingsView,
    isProfileDropdownOpen, setIsProfileDropdownOpen,
    isSubmitModalOpen, setIsSubmitModalOpen,
    isSubmitModModalOpen, setIsSubmitModModalOpen,
    isGameRequestModalOpen, setIsGameRequestModalOpen,
  } = modalsState;

  const [lastScrollY, setLastScrollY] = useState(0);

  // Redundant window listener removed. Merged into mainRef listener for performance.
  useEffect(() => {
    const mainCol = mainRef.current;
    
    // 1. Immediate reset
    if (mainCol) mainCol.scrollTop = 0;
    window.scrollTo(0, 0);

    // Frame-delayed reset only — no timeout (avoids post-navigation flash)
    requestAnimationFrame(() => {
      if (mainCol) mainCol.scrollTop = 0;
      window.scrollTo(0, 0);
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    markRouteVisited('/');
    markRouteVisited('/search');
  }, []);

  useEffect(() => {
    markRouteVisited(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/search') setSearchMounted(true);
  }, [location.pathname]);

  const isSearchActive = location.pathname === '/search';

  const [reportReason, setReportReason] = useState('');
  const [isSubmittingGameRequest, setIsSubmittingGameRequest] = useState(false);
  const [chatSummary, setChatSummary] = useState<string | null>(null);
  const [isGeneratingChatSummary, setIsGeneratingChatSummary] = useState(false);

  const [gamerPersona, setGamerPersona] = useState<{ title: string; description: string } | null>(() => {
    const saved = localStorage.getItem('topg_persona');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAnalyzingPersona, setIsAnalyzingPersona] = useState(false);
  const [relatedGames, setRelatedGames] = useState<Game[]>([]);
  const [isGeneratingRelatedGames, setIsGeneratingRelatedGames] = useState(false);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [newArrivals, setNewArrivals] = useState<Game[]>([]);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });
  
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('topg_favorites');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.from(new Set(parsed));
  });
  const [playHistory, setPlayHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('topg_history');
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.from(new Set(parsed));
  });
  const [preferredCategories, setPreferredCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('topg_preferred_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('topg_dark_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('topg_accent');
    return saved || '#3B82F6';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    document.documentElement.style.setProperty('--color-accent', accentColor);
    localStorage.setItem('topg_accent', accentColor);
    if (user && userProfile && userProfile.accentColor !== accentColor) {
      updateDoc(doc(db, 'users', user.uid), { accentColor }).catch(console.error);
    }
  }, [accentColor, user, userProfile]);

  useEffect(() => {
    localStorage.setItem('topg_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    if (user && userProfile && userProfile.isDarkMode !== isDarkMode) {
      updateDoc(doc(db, 'users', user.uid), { isDarkMode }).catch(console.error);
    }
  }, [isDarkMode, user, userProfile]);

  const THEMES = [
    { name: 'Cyber Blue', key: 'cyberBlue', color: '#3B82F6', icon: Zap },
    { name: 'Neon Pulse', key: 'neonPulse', color: '#EC4899', icon: Flame },
    { name: 'Toxic Green', key: 'toxicGreen', color: '#10B981', icon: ShieldAlert },
    { name: 'Solar Flare', key: 'solarFlare', color: '#F59E0B', icon: Sun },
    { name: 'Void Purple', key: 'voidPurple', color: '#8B5CF6', icon: Moon },
    { name: 'Crimson Tide', key: 'crimsonTide', color: '#EF4444', icon: Target },
  ];

  const categoryGroups = useMemo(() => {
    const mainMenu = ['All', 'Favorites', 'Recommended', 'History', 'Trending'];
    const multiplayer = ['Multiplayer', '2 Player', '3 Player', '4 Player'];
    
    // Any category not in mainMenu or multiplayer goes into general Categories
    const allKnown = [...mainMenu, ...multiplayer];
    const gameCategories = CATEGORIES.filter(c => !allKnown.includes(c)).sort();

    return [
      {
        title: 'Main Menu',
        items: mainMenu.filter(cat => CATEGORIES.includes(cat))
      },
      {
        title: 'Categories',
        items: gameCategories
      },
      {
        title: 'Multiplayer',
        items: multiplayer.filter(cat => CATEGORIES.includes(cat))
      }
    ];
  }, []);

  // Real-time Games Listener
  useEffect(() => {
    // Combined auth initialization
    let unsubscribeAuth: (() => void) | undefined;
    
    // Safety timeout for auth initialization
    const authTimeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Auth initialization timed out, forcing isAuthReady=true");
        setIsAuthReady(true);
      }
    }, 12000); // 12 second safety net

    // Monitor for redirect results
    const redirectPromise = getRedirectResult(auth).then((result) => {
      if (result?.user) {
        appToast.success(t('loginSuccess') || 'Successfully logged in!');
      }
    }).catch((error) => {
      console.error("Redirect login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        appToast.error('Unauthorized domain.', {
          description: "Please add this URL to your Firebase Authorized Domains.",
          duration: 6000
        });
      } else if (error.code === 'auth/web-storage-unsupported' || error.message.includes('cookie')) {
        appToast.error('Cookies Blocked', {
          description: "Your browser is blocking cookies. Please open the app in a new tab or enable cookies to log in.",
          duration: 8000
        });
      }
    });

    // Main auth listener
    unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      devLog('onAuthStateChanged triggered. User:', firebaseUser?.uid);
      setUser(firebaseUser);
      clearTimeout(authTimeout);
      
      if (firebaseUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            // Force admin role for the designated email
            if (isAdminEmail(firebaseUser.email)) {
              profile.role = 'admin';
            }
            setUserProfile(profile);
            if (!profile.usernameSet) {
              setIsUsernameModalOpen(true);
            }
            if (profile.accentColor) setAccentColor(profile.accentColor);
            if (profile.isDarkMode !== undefined) setIsDarkMode(profile.isDarkMode);
            if (profile.favorites) setFavorites([...new Set(profile.favorites)]);
            if (profile.playHistory) setPlayHistory([...new Set(profile.playHistory)]);
            if (profile.preferredCategories) setPreferredCategories(profile.preferredCategories);
            if (profile.gamerPersona) {
              setGamerPersona(profile.gamerPersona);
            }
          } else {
            devLog('Creating new profile for user:', firebaseUser.uid);
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || '',
              role: isAdminEmail(firebaseUser.email) ? 'admin' : 'user',
              favorites: [],
              xp: 0,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
            setIsUsernameModalOpen(true);
          }
        } catch (error: any) {
          console.error("Error fetching or creating user profile:", error);
          handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
          // Fallback so the user is still logged in locally even if Firestore fails
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Anonymous',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: isAdminEmail(firebaseUser.email) ? 'admin' : 'user',
            favorites: [],
            xp: 0,
            createdAt: new Date().toISOString()
          });
        } finally {
          setIsAuthReady(true);
        }
      } else {
        setUserProfile(null);
        setGamerPersona(null);
        setIsAuthReady(true);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      clearTimeout(authTimeout);
    };
  }, [t]);

  // Alert guest users to sign in for a better experience on startup
  useEffect(() => {
    if (isAuthReady && !user) {
      const hasShownPrompt = sessionStorage.getItem('playdravo_guest_prompt_shown');
      if (!hasShownPrompt) {
        sessionStorage.setItem('playdravo_guest_prompt_shown', 'true');
        
        // Let user settle in, then trigger the recommendation toast with login access
        const timer = setTimeout(() => {
          appToast.message("Sign in for a better experience! 🔑", {
            description: "Log in or sign up to save your game scores, track achievements, and personalize your gaming experience!",
            duration: 7500,
            action: {
              label: "Log In Now",
              onClick: () => {
                setIsLoginModalOpen(true);
              }
            }
          });
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthReady, user, setIsLoginModalOpen]);

  // Global XP Listener
  useEffect(() => {
    const handleAddXp = async (e: any) => {
      const { amount, reason } = e.detail;
      if (amount && user && userProfile) {
        const newXp = (userProfile.xp || 0) + amount;
        const currentLevel = Math.floor((userProfile.xp || 0) / 1000) + 1;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        setUserProfile({ ...userProfile, xp: newXp, level: newLevel });
        
        addNotification({
          title: `XP Gained! 📈`,
          description: `You earned +${amount} XP: "${reason || 'Playing Games'}".`,
          type: 'achievement'
        });

        if (newLevel > currentLevel) {
          appToast.success(`Level Up! You are now level ${newLevel} 🎉`, {
            icon: '🎊',
            style: {
              background: isDarkMode ? '#1a1a1a' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              border: '1px solid rgba(139, 92, 246, 0.4)'
            }
          });
          addNotification({
            title: `Level Up! Level ${newLevel} 🎉`,
            description: `Awesome! You have advanced to Level ${newLevel}. Keep scaling the leaderboards!`,
            type: 'achievement'
          });
        }
        
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            xp: newXp,
            level: newLevel
          });
        } catch (error) {
          console.error("Failed to update XP:", error);
        }
      }
    };
    
    window.addEventListener('add-xp', handleAddXp);
    return () => window.removeEventListener('add-xp', handleAddXp);
  }, [user, userProfile, isDarkMode]);

  // One-time Database Initialization/Verification for Admin
  useEffect(() => {
    if (userProfile?.role !== 'admin') return;
    
    let isMounted = true;
    
    const initDatabase = async () => {
      devLog('[Admin init] Starting one-time database verification...');
      
      try {
        // 1. Verify/Populate games
        const gamesColRef = collection(db, 'games');
        const gamesSnapshot = await getDocs(gamesColRef);
        if (!isMounted) return;
        
        const existingGamesIds = new Set(gamesSnapshot.docs.map(doc => doc.id));
        const missingGames = STATIC_GAMES.filter(g => !existingGamesIds.has(g.id));
        
        if (missingGames.length > 0) {
          devLog(`[Admin init] Found ${missingGames.length} missing games. Populating...`);
          const batch_size = 5;
          for (let i = 0; i < missingGames.length; i += batch_size) {
            if (!isMounted) return;
            const batch = missingGames.slice(i, i + batch_size);
            await Promise.all(batch.map(async (game) => {
              const gameData = {
                ...game,
                description: game.description || '',
                rating: game.rating || 0,
                plays: game.plays || 0,
                authorUid: game.authorUid || 'system',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              };
              await setDoc(doc(db, 'games', game.id), gameData);
            }));
            devLog(`[Admin init] Populated missing games batch ${Math.floor(i / batch_size) + 1}`);
          }
        }
        
        // 2. Verify/Populate game requests
        const reqColRef = collection(db, 'gameRequests');
        const reqSnapshot = await getDocs(query(reqColRef, limit(1)));
        if (!isMounted) return;
        
        if (reqSnapshot.empty) {
          devLog('[Admin init] gameRequests collection is empty. Populating with sample request...');
          await addDoc(reqColRef, {
            userId: 'system',
            gameName: 'Grand Theft Auto VI',
            description: 'The most anticipated game of the decade. We need it here!',
            status: 'planned',
            votes: 1337,
            createdAt: serverTimestamp()
          });
        }
        
        // 3. Verify/Populate chat
        const chatColRef = collection(db, 'chat');
        const chatSnapshot = await getDocs(query(chatColRef, limit(1)));
        if (!isMounted) return;
        
        if (chatSnapshot.empty) {
          devLog('[Admin init] chat collection is empty. Populating with welcome message...');
          await addDoc(chatColRef, {
            uid: 'system',
            displayName: 'PlayDravo AI',
            text: 'Welcome to the ultimate gaming platform! Systems operational. Type /help for commands.',
            timestamp: serverTimestamp()
          });
        }
        
        devLog('[Admin init] One-time database verification complete.');
      } catch (err) {
        console.error("[Admin init] Failed during database initialization:", err);
      }
    };
    
    initDatabase();
    
    return () => {
      isMounted = false;
    };
  }, [userProfile?.role]);

  // Real-time Games Listener
  useEffect(() => {
    const q = query(collection(db, 'games'), orderBy('plays', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gamesData = snapshot.docs.map(doc => parseFirebaseGame(doc.id, doc.data()));
      
      // Catalog-only: merge Firestore stats into verified games, never add legacy/AI entries
      const gamesMap = new Map(STATIC_GAMES.map((g) => [g.id, { ...g }]));
      gamesData.forEach((game) => {
        const catalog = gamesMap.get(game.id);
        if (!catalog) return;
        gamesMap.set(game.id, {
          ...catalog,
          plays: typeof game.plays === 'number' ? game.plays : catalog.plays,
          rating: typeof game.rating === 'number' && game.rating > 0 ? game.rating : catalog.rating,
          ratingCount: game.ratingCount ?? catalog.ratingCount,
        });
      });
      
      setGames(Array.from(gamesMap.values()));
    }, (error) => {
      console.error("Games listener failed:", error);
      handleFirestoreError(error, OperationType.LIST, 'games');
      // Fallback to static games on error
      setGames(STATIC_GAMES);
    });
    return () => unsubscribe();
  }, []);

  // Real-time New Arrivals Listener
  useEffect(() => {
    const q = query(
      collection(db, 'games'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribe = onSnapshot(q, () => {
      setNewArrivals(
        [...STATIC_GAMES]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 12)
      );
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'games');
    });
    return () => unsubscribe();
  }, []);

  // Real-time Mods Listener for Active Game
  useEffect(() => {
    if (!activeGame) {
      setActiveGameMods([]);
      return;
    }
    const q = query(collection(db, 'games', activeGame.id, 'mods'), orderBy('downloads', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const modsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mod));
      setActiveGameMods(modsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `games/${activeGame.id}/mods`);
    });
    return () => unsubscribe();
  }, [activeGame]);

  // Real-time Game Requests Listener
  useEffect(() => {
    const q = query(
      collection(db, 'gameRequests'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameRequest));
      setGameRequests(requests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gameRequests');
    });
    return () => unsubscribe();
  }, []);

  // Real-time User Rating Listener
  useEffect(() => {
    if (!activeGame || !userProfile) {
      setUserRating(null);
      return;
    }
    const ratingDocRef = doc(db, 'games', activeGame.id, 'ratings', userProfile.uid);
    const unsubscribe = onSnapshot(ratingDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserRating(snapshot.data().value);
      } else {
        setUserRating(null);
      }
    }, (error) => {
      // Silently handle or log
      console.error("Error fetching user rating:", error);
    });
    return () => unsubscribe();
  }, [activeGame, userProfile]);

  const handleRate = async (value: number) => {
    if (!activeGame || !userProfile) {
      if (!userProfile) {
        signInWithGoogle();
      }
      return;
    }

    setIsRatingLoading(true);
    const gameRef = doc(db, 'games', activeGame.id);
    const ratingRef = doc(db, 'games', activeGame.id, 'ratings', userProfile.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const gameDoc = await transaction.get(gameRef);
        if (!gameDoc.exists()) throw new Error("Game does not exist!");

        const ratingDoc = await transaction.get(ratingRef);
        const gameData = gameDoc.data() as Game;
        
        const oldRatingCount = gameData.ratingCount || 0;
        const oldTotalRating = gameData.totalRating || 0;
        
        let newRatingCount = oldRatingCount;
        let newTotalRating = oldTotalRating;

        if (ratingDoc.exists()) {
          const oldRatingValue = ratingDoc.data().value;
          newTotalRating = oldTotalRating - oldRatingValue + value;
        } else {
          newRatingCount = oldRatingCount + 1;
          newTotalRating = oldTotalRating + value;
        }

        const newAverageRating = Number((newTotalRating / newRatingCount).toFixed(1));

        transaction.set(ratingRef, {
          uid: userProfile.uid,
          value: value,
          timestamp: serverTimestamp()
        });

        transaction.update(gameRef, {
          rating: newAverageRating,
          ratingCount: newRatingCount,
          totalRating: newTotalRating
        });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `games/${activeGame.id}/ratings/${userProfile.uid}`);
    } finally {
      setIsRatingLoading(false);
    }
  };

  useEffect(() => {
    // Handled in consolidated effect
  }, [accentColor]);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (!mainElement) return;

    const handleScroll = () => {
      const sTop = mainElement.scrollTop;
      const show = sTop > 300;
      const scrolled = sTop > 100;
      
      setShowScrollTop(prev => prev !== show ? show : prev);
      setIsScrolled(prev => prev !== scrolled ? scrolled : prev);

      if (location.pathname === '/') {
        const scrollHeight = mainElement.scrollHeight;
        const clientHeight = mainElement.clientHeight;
        if (sTop + clientHeight >= scrollHeight - 800) {
          setDisplayLimit(prev => prev + 20);
        }
      }
    };
    mainElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainElement.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        else if (activeGame) setActiveGame(null);
      }
      if (e.key === '/' && !activeGame && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, activeGame]);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Real-time Chat Listener
  useEffect(() => {
    if (!userProfile) {
      setChatMessages([]);
      return;
    }
    const q = query(collection(db, 'chat'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
      setChatMessages(messages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chat');
    });
    return () => unsubscribe();
  }, [userProfile?.uid]);

  const [activeTab, setActiveTab] = useState<'game' | 'mods' | 'trailer' | 'coach' | 'requests'>('game');
  const [gameRequests, setGameRequests] = useState<GameRequest[]>([]);
  const [modSearchQuery, setModSearchQuery] = useState('');
  const [modSortBy, setModSortBy] = useState<'downloads' | 'rating' | 'newest'>('downloads');
  const [displayLimit, setDisplayLimit] = useState(28);

  const handleGenerateDescriptions = () => {
    appToast.error('AI automatic generations have been disabled for performance.');
  };

  const toggleFavorite = async (gameId: string) => {
    const isAdding = !favorites.includes(gameId);
    
    Analytics.trackFavorite(gameId, isAdding ? 'add' : 'remove');
    
    const newFavorites = isAdding
      ? [...favorites, gameId]
      : favorites.filter(id => id !== gameId);
    
    setFavorites(newFavorites);
    localStorage.setItem('topg_favorites', JSON.stringify(newFavorites));
    
    const targetGame = games.find(g => g.id === gameId);
    if (targetGame) {
      if (isAdding) {
        appToast.success(`Added ${targetGame.title} to Favorites`, {
          icon: '❤️',
          style: {
            background: isDarkMode ? '#1a1a1a' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            border: '1px solid rgba(255, 0, 0, 0.2)'
          }
        });
        addNotification({
          title: 'Added to Collection ❤️',
          description: `You favorited "${targetGame.title}". It has been successfully added to your dynamic library quick-panel.`,
          type: 'social'
        });
        // Reward user for building their collection
        window.dispatchEvent(new CustomEvent('add-xp', { 
          detail: { amount: 20, reason: `Favorited ${targetGame.title}` } 
        }));
      } else {
        addNotification({
          title: 'Removed from Collection 🗑️',
          description: `You removed "${targetGame.title}" from your Favorites collection.`,
          type: 'social'
        });
      }
    }

    if (user && userProfile) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          favorites: newFavorites
        });
        setUserProfile({ ...userProfile, favorites: newFavorites });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  useEffect(() => {
    if (isAIAssistantOpen && aiChatMessages.length === 0) {
      setAIChatMessages([{ role: 'model', text: "Hi, I'm the PlayDravo support assistant. I can help you find games, troubleshoot issues, or answer questions about the platform. How can I help you today?" }]);
    }
  }, [isAIAssistantOpen, aiChatMessages.length]);

  const lastAIChatTime = useRef<number>(0);
  const aiChatCache = useRef<Map<string, string>>(new Map());

  const handleAIChat = async (message: string) => {
    if (!message.trim()) return;
    
    // Cooldown check (5 seconds)
    const now = Date.now();
    if (now - lastAIChatTime.current < 5000) {
      appToast.error("Neural processing cooling down. Please wait a moment.");
      return;
    }

    const newMessages = [...aiChatMessages, { role: 'user' as const, text: message }];
    setAIChatMessages(newMessages);
    setIsAITyping(true);

    // Cache check
    const cacheKey = message.trim().toLowerCase();
    if (aiChatCache.current.has(cacheKey)) {
      const cachedResponse = aiChatCache.current.get(cacheKey)!;
      setTimeout(() => {
        setAIChatMessages([...newMessages, { role: 'model', text: cachedResponse }]);
        setIsAITyping(false);
      }, 500); 
      return;
    }

    try {
      lastAIChatTime.current = now;
      // Gather context about the platform
      const platformContext = {
        name: "PlayDravo",
        description: "A high-performance gaming portal featuring a wide range of games and community-created mods.",
        categories: CATEGORIES.filter(c => c !== 'All' && c !== 'Favorites' && c !== 'History' && c !== 'Mods'),
        features: [
          "AI Game Assistant: Real-time help and strategies.",
          "AI Game Coach: Personalized tips based on your play style.",
          "Modding: Users can generate and apply mods to games.",
          "Game Requests: Users can request new games or features.",
          "Gamer Persona: AI analysis of your gaming habits.",
          "Credits & XP: Earn rewards by playing and interacting.",
          "Deep Search: AI-powered game discovery."
        ],
        stats: {
          totalGames: games.length,
          totalMods: games.reduce((acc, g) => acc + (g.mods?.length || 0), 0)
        }
      };

      const systemInstruction = `You are a helpful and friendly gaming assistant on the PlayDravo platform. 
          Your personality is helpful, friendly, and welcoming to all players.
          
          Platform Context:
          - Name: ${platformContext.name}
          - Description: ${platformContext.description}
          - Available Categories: ${platformContext.categories.join(', ')}
          - Key Features: ${platformContext.features.join('; ')}
          - Current Stats: ${platformContext.stats.totalGames} games available, ${platformContext.stats.totalMods} mods across various titles.
          
          User Context:
          - User: ${user?.displayName || 'Guest'}
          - Persona: ${userProfile?.gamerPersona?.title || 'Unknown'}
          - XP: ${userProfile?.xp || 0}
          - Current Language: ${language}
          
          Your Goals:
          1. Provide elite-level gaming advice, strategies, and technical insights.
          2. Help users navigate the platform with precision.
          3. Recommend games using the available library: ${games.slice(0, 20).map(g => g.title).join(', ')} (and many more).
          4. Analyze user queries with deep understanding of gaming mechanics.
          
          Guidelines:
          - Respond in the user's current language (${language}).
          - Be concise but provide high-value, "pro" insights.
          - Use advanced gaming terminology (Meta, Mechanics, Optimization, Frame-perfect, Strat).
          - Maintain an elite, high-performance vibe.`;

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          systemInstruction,
          language
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to connect to AI server");
      }
      const data = await res.json();

      if (data.text) {
        aiChatCache.current.set(cacheKey, data.text);
        setAIChatMessages([...newMessages, { role: 'model', text: data.text }]);
      } else {
        throw new Error("Empty response from AI.");
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      const errorMessage = error.message || "Connection lost. Game Assistant connection interrupted.";
      setAIChatMessages([...newMessages, { role: 'model', text: errorMessage }]);
      appToast.error(errorMessage);
    } finally {
      setIsAITyping(false);
    }
  };


  const generateRelatedGames = (game: Game) => {
    setIsGeneratingRelatedGames(true);
    // Local similarity algorithm
    const related = games
      .filter(g => g.id !== game.id)
      .map(g => {
        let score = 0;
        if (g.category === game.category) score += 5;
        
        const gameTags = game.tags || [];
        const otherTags = g.tags || [];
        const commonTags = gameTags.filter(t => otherTags.includes(t));
        score += commonTags.length * 2;
        
        return { game: g, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.game);

    setRelatedGames(related);
    setIsGeneratingRelatedGames(false);
  };

  const generateRecommendations = () => {
    setIsGeneratingRecommendations(true);
    const recommendations = buildRecommendations(games, {
      limit: 12,
      playHistory,
      preferredCategories: userProfile?.preferredCategories || preferredCategories,
    });
    setRecommendedGames(recommendations);
    setIsGeneratingRecommendations(false);
  };

  const updatePreferredCategories = async (categories: string[]) => {
    setPreferredCategories(categories);
    localStorage.setItem('topg_preferred_categories', JSON.stringify(categories));

    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        preferredCategories: categories
      });
      setUserProfile(prev => prev ? { ...prev, preferredCategories: categories } : null);
      appToast.success(t('userPreferencesUpdated'));
      generateRecommendations();
    } catch (error) {
      console.error("Error updating preferences:", error);
      appToast.error(t('failedToUpdateUserPreferences'));
    }
  };

  const togglePreferredCategory = (category: string) => {
    const current = preferredCategories;
    const next = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updatePreferredCategories(next);
  };


  const generateChatSummary = () => {
    if (chatMessages.length < 3) return;
    
    setIsGeneratingChatSummary(true);
    // Simple local summary
    const trendingGames = [...new Set(chatMessages.map(m => m.text.match(/\b\w+\b/g)).flat())]
      .filter(w => w && w.length > 4)
      .slice(0, 2);
      
    const summary = `The atmosphere is energetic with players discussing strategies. ${trendingGames.length > 0 ? `Topic of interest: ${trendingGames.join(', ')}.` : ''}`;
    
    setChatSummary(summary);
    setIsGeneratingChatSummary(false);
    setTimeout(() => setChatSummary(null), 5000);
  };

  const analyzeGamerPersona = async () => {
    if (!user || (!userProfile?.favorites?.length && !playHistory.length)) {
      appToast.error(t('addGamesToFavorites'));
      return;
    }
    setIsAnalyzingPersona(true);
    
    // Local persona analysis based on favorite categories and tags
    const favoriteGames = games.filter(g => userProfile?.favorites?.includes(g.id) || playHistory.includes(g.id));
    
    const categories = favoriteGames.map(g => g.category);
    const categoryCounts: Record<string, number> = {};
    categories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
    
    const topCategory = Object.keys(categoryCounts).length > 0 
      ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
      : 'Action';

    let title = "The Explorer";
    let description = "You enjoy trying a bit of everything and finding hidden gems across genres.";

    if (topCategory === 'Action' || topCategory === 'Shooter' || topCategory === 'Fighting') {
      title = "The Adrenaline Junkie";
      description = "You thrive in fast-paced, high-stakes environments where reaction time is everything.";
    } else if (topCategory === 'Strategy' || topCategory === 'Puzzle') {
      title = "The Mastermind";
      description = "Calculated and precise. You enjoy outsmarting your opponents and solving complex systems.";
    } else if (topCategory === 'Adventure' || topCategory === 'RPG') {
      title = "The Storyteller";
      description = "Immersion is key. You love losing yourself in sprawling worlds and rich narratives.";
    } else if (topCategory === 'Arcade' || topCategory === 'Casual') {
      title = "The Chill Gamer";
      description = "Gaming is your escape. You prefer quick, fun sessions to unwind and relax.";
    } else if (topCategory === 'Horror' || topCategory === 'Survival') {
      title = "The Survivor";
      description = "You love the thrill of danger and overcoming seemingly insurmountable odds.";
    }

    const persona = { title, description };
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { gamerPersona: persona });
      setGamerPersona(persona);
      setUserProfile(prev => prev ? { ...prev, gamerPersona: persona } : null);
      appToast.success(t('aiPersonaUpdated') || "Persona analyzed successfully!");
    } catch (error) {
      console.error("Persona Update Error:", error);
      appToast.error("Failed to update persona.");
    } finally {
      setIsAnalyzingPersona(false);
    }
  };


  const handleHelpCardClick = (id: string) => {
    if (id === 'ai-assistant') {
      setIsAIAssistantOpen(true);
      return;
    }
    setIsHelpCenterOpen(false);
    navigate(`/support/${id}`);
  };

  useEffect(() => {
    if ((playHistory.length > 0 || (userProfile?.preferredCategories && userProfile.preferredCategories.length > 0)) && recommendedGames.length === 0) {
      generateRecommendations();
    }
  }, [playHistory, userProfile?.preferredCategories]);
  const [sortBy, setSortBy] = useState<'plays' | 'rating' | 'title' | 'latest'>(() => {
    const saved = localStorage.getItem('topg_sort_by');
    return (saved as 'plays' | 'rating' | 'title' | 'latest') || 'plays';
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && activeGame) {
      setActiveGame(null);
    }
  }, [searchQuery, activeGame]);

  useEffect(() => {
    localStorage.setItem('topg_history', JSON.stringify(playHistory));
    if (user && userProfile && JSON.stringify(userProfile.playHistory) !== JSON.stringify(playHistory)) {
      updateDoc(doc(db, 'users', user.uid), { playHistory }).catch(console.error);
    }
  }, [playHistory, user, userProfile]);

  useEffect(() => {
    localStorage.setItem('topg_favorites', JSON.stringify(favorites));
    if (user && userProfile && JSON.stringify(userProfile.favorites) !== JSON.stringify(favorites)) {
      updateDoc(doc(db, 'users', user.uid), { favorites }).catch(console.error);
    }
  }, [favorites, user, userProfile]);

  useEffect(() => {
    localStorage.setItem('topg_preferred_categories', JSON.stringify(preferredCategories));
    if (user && userProfile && JSON.stringify(userProfile.preferredCategories) !== JSON.stringify(preferredCategories)) {
      updateDoc(doc(db, 'users', user.uid), { preferredCategories }).catch(console.error);
    }
  }, [preferredCategories, user, userProfile]);

  useEffect(() => {
    if (gamerPersona) {
      localStorage.setItem('topg_persona', JSON.stringify(gamerPersona));
      if (user && userProfile && JSON.stringify(userProfile.gamerPersona) !== JSON.stringify(gamerPersona)) {
        updateDoc(doc(db, 'users', user.uid), { gamerPersona }).catch(console.error);
      }
    }
  }, [gamerPersona, user, userProfile]);

  useEffect(() => {
    localStorage.setItem('topg_sort_by', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('topg_newsletter', isNewsletterSubscribed.toString());
  }, [isNewsletterSubscribed]);

  useEffect(() => {
    setDisplayLimit(48);
  }, [selectedCategory, searchQuery, sortBy, selectedTags]);

  const filteredGames = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    const filteredWithScores = games.map(game => {
      let score = 0;
      if (query) {
        const title = (game.title || '').toLowerCase();
        if (title === query) score += 100;
        else if (title.startsWith(query)) score += 50;
        else if (title.includes(query)) score += 10;
        
        if (game.category?.toLowerCase().includes(query)) score += 8;
        
        if (game.tags?.some(t => t.toLowerCase() === query)) score += 8;
        else if (game.tags?.some(t => t.toLowerCase().includes(query))) score += 4;
        
        if (game.developer?.toLowerCase().includes(query)) score += 3;
        if (game.description?.toLowerCase().includes(query)) score += 1;
      }
      return { game, score };
    }).filter(({ game, score }) => {
      const matchesCategory = selectedCategory === 'All' || selectedCategory === 'Trending'
        ? true 
        : selectedCategory === 'Favorites' 
          ? favorites.includes(game.id)
          : selectedCategory === 'Recommended'
            ? recommendedGames.some(rg => rg.id === game.id)
            : selectedCategory === 'History'
              ? playHistory.includes(game.id)
              : selectedCategory === 'Mods'
                ? (game.mods && game.mods.length > 0)
                : game.category === selectedCategory;
      
      const matchesTags = selectedTags.length === 0 
        ? true 
        : selectedTags.some(tag => {
            const gameTags = game.tags || [game.category];
            return gameTags.some(gameTag => gameTag?.toLowerCase() === tag.toLowerCase());
          });

      const matchesSearch = !query ? true : score > 0;
      
      return matchesCategory && matchesTags && matchesSearch;
    });

    return filteredWithScores.sort((a, b) => {
      if (query && a.score !== b.score) {
        return b.score - a.score; // prioritize relevance when searching
      }
      const ga = a.game;
      const gb = b.game;
      if (sortBy === 'latest') {
        const timeA = typeof ga.createdAt === 'string' ? new Date(ga.createdAt).getTime() : typeof ga.createdAt?.toMillis === 'function' ? ga.createdAt.toMillis() : 0;
        const timeB = typeof gb.createdAt === 'string' ? new Date(gb.createdAt).getTime() : typeof gb.createdAt?.toMillis === 'function' ? gb.createdAt.toMillis() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'plays') return gb.plays - ga.plays;
      if (sortBy === 'rating') return (gb.rating || 0) - (ga.rating || 0);
      if (sortBy === 'title') return ga.title.localeCompare(gb.title);
      return 0;
    }).map(item => item.game);
  }, [selectedCategory, selectedTags, searchQuery, sortBy, games, favorites, playHistory, recommendedGames]);

  const displayedGames = useMemo(() => {
    return filteredGames.slice(0, displayLimit);
  }, [filteredGames, displayLimit]);

  const recentlyPlayedGames = useMemo(() => {
    return playHistory
      .map(id => games.find(g => g.id === id))
      .filter((g): g is Game => !!g)
      .slice(0, 20);
  }, [playHistory, games]);

  const featuredGame = games[0] || STATIC_GAMES[0];

  const handleClaimBonus = () => {
    if (!canClaimBonus) return;
    setDailyBonus(prev => prev + 500);
    setCanClaimBonus(false);
    appToast.success(t('dailyBonusActivated'), {
      icon: <Sparkles className="w-4 h-4 text-accent" />,
      className: "bg-bg-dark border-accent/50 text-white font-bold italic",
    });
    // Reset after 24h (simulated)
    setTimeout(() => setCanClaimBonus(true), 10000); 
  };

  const togglePremium = () => {
    setIsPremium(!isPremium);
    appToast.info(isPremium ? t('adsRestored') : t('adsEliminated'), {
      icon: <ShieldCheck className="w-4 h-4 text-accent" />,
      className: "bg-bg-dark border-accent/50 text-white font-bold italic",
    });
  };

  const handleGameClick = useCallback(async (game: Game) => {
    Analytics.trackGameOpen(game.id, game.title);
    navigate(`/games/${game.id}`);
    setActiveTab('game');
    generateRelatedGames(game);
    setPlayHistory(prev => {
      const filtered = prev.filter(id => id !== game.id);
      return [game.id, ...filtered].slice(0, 20);
    });
    
    addNotification({
      title: 'Game Starting! 🎮',
      description: `You launched "${game.title}". Play, achieve goals, and scale the ranks.`,
      type: 'game'
    });
    
    scrollToTop();

    try {
      const gameRef = doc(db, 'games', game.id);
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        await updateDoc(gameRef, {
          plays: increment(1)
        });
      } else {
        console.warn(`Game document ${game.id} does not exist in Firestore.`);
      }
    } catch (error) {
      console.warn('Failed to increment plays:', error);
    }
  }, [navigate, addNotification, generateRelatedGames, scrollToTop]);

  const handleSurpriseMe = () => {
    if (games.length === 0) {
      appToast.info(t('scanningForGames'));
      return;
    }
    const randomGame = games[Math.floor(Math.random() * games.length)];
    handleGameClick(randomGame);
  };

  const closePlayer = () => {
    setActiveGame(null);
    scrollToTop();
  };

  const handleSendMessage = async (text: string) => {
    if (!user) {
      return;
    }
    if (!text.trim()) return;

    try {
      await addDoc(collection(db, 'chat'), {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        text: text.trim(),
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chat');
    }
  };

  const handleVote = async (requestId: string, currentVotes: number) => {
    if (!user) {
      appToast.error(t('authRequiredForVoting'));
      return;
    }
    try {
      await updateDoc(doc(db, 'gameRequests', requestId), {
        votes: increment(1)
      });
      appToast.success(t('voteRecorded'));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `gameRequests/${requestId}`);
    }
  };

  return (
    <SidebarProvider>
    <div className={`h-[100dvh] flex flex-col font-sans selection:bg-accent selection:text-bg-dark ${isDarkMode ? 'bg-bg-dark text-white' : 'bg-white text-black'}`}>
      <div className="flex flex-col h-full">
            {/* Global Background Effects Removed for Performance */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar 
          isDarkMode={isDarkMode}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryGroups={categoryGroups}
          userProfile={userProfile}
          setIsLoginModalOpen={setIsLoginModalOpen}
          logout={logout}
          setIsPreferencesModalOpen={setIsPreferencesModalOpen}
          setIsSubmitModalOpen={setIsSubmitModalOpen}
          handleSurpriseMe={handleSurpriseMe}
          language={language}
          setLanguage={setLanguage}
          t={t}
        />

        <div className={`flex-1 flex flex-col overflow-hidden`}>
          {/* Header - Redesigned to match PlayDravo style */}
          <Header 
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userProfile={userProfile}
            setIsLoginModalOpen={setIsLoginModalOpen}
            logout={logout}
            accentColor={accentColor}
            setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            openAccountSettings={openAccountSettings}
            setIsUsernameModalOpen={setIsUsernameModalOpen}
            setIsHelpCenterOpen={setIsHelpCenterOpen}
            setIsSubmitModalOpen={setIsSubmitModalOpen}
            isProfileDropdownOpen={isProfileDropdownOpen}
            setIsProfileDropdownOpen={setIsProfileDropdownOpen}
            user={user}
            searchInputRef={searchInputRef}
            setSelectedCategory={setSelectedCategory}
            language={language}
            setLanguage={setLanguage}
            t={t}
          />

          {/* Mobile Profile Dropdown - Mounted in document flow to avoid Header backdrop-blur clipping bug on iOS Safari */}
          <div className="md:hidden relative z-[100] px-4">
            <ProfileDropdown 
              isOpen={isProfileDropdownOpen}
              onClose={() => setIsProfileDropdownOpen(false)}
              user={user}
              userProfile={userProfile}
              isDarkMode={isDarkMode}
              logout={logout}
              openAccountSettings={openAccountSettings}
              setIsUsernameModalOpen={setIsUsernameModalOpen}
              setIsHelpCenterOpen={setIsHelpCenterOpen}
              setSelectedCategory={setSelectedCategory}
              t={t}
            />
          </div>

          <main ref={mainRef} className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-bg-dark' : 'bg-white'} ${isSearchActive ? 'p-0' : activeGame ? 'p-0 md:p-5' : 'p-3 md:p-5'} relative`}>
            {searchMounted && (
              <div
                className={`absolute inset-0 z-[2] overflow-y-auto ${isDarkMode ? 'bg-bg-dark' : 'bg-white'} ${
                  isSearchActive ? '' : 'invisible pointer-events-none'
                }`}
                aria-hidden={!isSearchActive}
              >
                <SearchPage
                  isDarkMode={isDarkMode}
                  t={t}
                  toggleFavorite={toggleFavorite}
                  userProfile={userProfile}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            )}
            <div className={isSearchActive ? 'hidden' : 'relative min-h-full'}>
            <Routes>
                <Route path="/" element={
                  <PageLayout>
                    <HomePage 
                      isDarkMode={isDarkMode}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      featuredGame={featuredGame}
                      newArrivals={newArrivals}
                      recommendedGames={recommendedGames}
                      isGeneratingRecommendations={isGeneratingRecommendations}
                      recommendationError={recommendationError}
                      generateRecommendations={generateRecommendations}
                      recentlyPlayedGames={recentlyPlayedGames}
                      setPlayHistory={setPlayHistory}
                      filteredGames={filteredGames}
                      sortBy={sortBy}
                      setSortBy={setSortBy as (sort: "title" | "plays" | "rating") => void}
                      selectedTags={selectedTags}
                      setSelectedTags={setSelectedTags}
                      TAGS_LIST={TAGS_LIST}
                      displayLimit={displayLimit}
                      setDisplayLimit={setDisplayLimit}
                      handleGameClick={handleGameClick}
                      userProfile={userProfile}
                      toggleFavorite={toggleFavorite}
                      isNewsletterLoading={isNewsletterLoading}
                      isNewsletterSubscribed={isNewsletterSubscribed}
                      setIsNewsletterLoading={setIsNewsletterLoading}
                      setIsNewsletterSubscribed={setIsNewsletterSubscribed}
                      setIsSubmitModalOpen={setIsSubmitModalOpen}
                      setIsSubmitModModalOpen={setIsSubmitModModalOpen}
                      setIsStatusModalOpen={setIsStatusModalOpen}
                      setIsHelpCenterOpen={setIsHelpCenterOpen}
                      setIsSupportModalOpen={setIsSupportModalOpen}
                      setIsBugReportModalOpen={setIsBugReportModalOpen}
                      setIsLegalModalOpen={setIsLegalModalOpen}
                      setLegalContent={setLegalContent}
                      t={t}
                      toast={appToast}
                    />
                  </PageLayout>
                } />
                <Route path="/games/:gameId" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                    <GamePage 
                      isDarkMode={isDarkMode}
                      t={t}
                      games={games}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      handleGameClick={handleGameClick}
                      user={user}
                    />
                  </LazyRoute>
                } />
                <Route path="/category/:categoryId" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                    <PageLayout>
                      <CategoryPage 
                      isDarkMode={isDarkMode}
                      t={t}
                      games={games}
                      handleGameClick={handleGameClick}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                    />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/library/*" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <LibraryPage
                      isDarkMode={isDarkMode}
                      t={t}
                      games={games}
                      favorites={favorites}
                      playHistory={playHistory}
                      handleGameClick={handleGameClick}
                      toggleFavorite={toggleFavorite}
                      userProfile={userProfile}
                    />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/support/:articleId" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <SupportPage
                      isDarkMode={isDarkMode}
                      t={t}
                    />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/support" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <SupportPage
                      isDarkMode={isDarkMode}
                      t={t}
                    />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/admin/bug-reports" element={
                  userProfile?.role === 'admin' ? (
                    <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                    <PageLayout>
                      <AdminPanel isDarkMode={isDarkMode} t={t} type="bug-reports" />
                    </PageLayout>
                    </LazyRoute>
                  ) : (
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold tracking-tight">{t('unauthorizedAdmin')}</h2>
                        <Link to="/" className="mt-6 px-8 py-3 bg-accent text-bg-dark font-bold rounded-xl uppercase tracking-widest text-xs inline-block">Return Home</Link>
                      </div>
                    </div>
                  )
                } />
                <Route path="/admin/game-requests" element={
                  userProfile?.role === 'admin' ? (
                    <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                    <PageLayout>
                      <AdminPanel isDarkMode={isDarkMode} t={t} type="game-requests" />
                    </PageLayout>
                    </LazyRoute>
                  ) : (
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold tracking-tight">{t('unauthorizedAdmin')}</h2>
                        <Link to="/" className="mt-6 px-8 py-3 bg-accent text-bg-dark font-bold rounded-xl uppercase tracking-widest text-xs inline-block">Return Home</Link>
                      </div>
                    </div>
                  )
                } />
                <Route path="/admin/support-tickets" element={
                  userProfile?.role === 'admin' ? (
                    <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                    <PageLayout>
                      <AdminPanel isDarkMode={isDarkMode} t={t} type="support-tickets" />
                    </PageLayout>
                    </LazyRoute>
                  ) : (
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold tracking-tight">{t('unauthorizedAdmin')}</h2>
                        <Link to="/" className="mt-6 px-8 py-3 bg-accent text-bg-dark font-bold rounded-xl uppercase tracking-widest text-xs inline-block">Return Home</Link>
                      </div>
                    </div>
                  )
                } />
                <Route path="/privacy" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <PrivacyPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/terms" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <TermsPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/about" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <AboutPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/status" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <StatusPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/report-bug" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <ReportBugPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/contact" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <ContactPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/submit-game" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <SubmitGamePage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/cookies" element={
                  <LazyRoute pathname={location.pathname} isDarkMode={isDarkMode}>
                  <PageLayout>
                    <CookiesPage isDarkMode={isDarkMode} t={t} />
                  </PageLayout>
                  </LazyRoute>
                } />
                <Route path="/search" element={null} />
          </Routes>

          {!isSearchActive && location.pathname !== '/search' && !location.pathname.startsWith('/games/') && (
            <Footer isDarkMode={isDarkMode} t={t} />
          )}
            </div>
          </main>
        </div>
      </div>

        <Suspense fallback={null}>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredGames={filteredGames}
          handleGameClick={handleGameClick}
          categories={CATEGORIES}
          recentlyPlayedGames={recentlyPlayedGames}
          setSelectedCategory={setSelectedCategory}
          categoryKeyMap={categoryKeyMap as any}
        />
        </Suspense>



        {/* Help Center Modal */}
        <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-[visibility] duration-300 ${isHelpCenterOpen ? 'visible' : 'invisible'}`}>
          <motion.div 
            initial={false}
            animate={isHelpCenterOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsHelpCenterOpen(false);
              setIsAIAssistantOpen(false);
            }}
            className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
          />
          <motion.div
            initial={false}
            animate={isHelpCenterOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
            className={`relative w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}
          >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20"
                    >
                      <HelpCircle className="w-6 h-6 text-accent" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{t('supportCenter').split(' ')[0]} <span className="text-accent">{t('supportCenter').split(' ').slice(1).join(' ')}</span></h2>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('knowledgeBase')} v1.0.4</p>
                    </div>
                  </div>
                  <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-full transition-all ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                    <Search className={`w-4 h-4 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                    <input 
                      type="text" 
                      placeholder={t('search')} 
                      value={helpSearchQuery}
                      onChange={(e) => setHelpSearchQuery(e.target.value)}
                      className={`bg-transparent border-none outline-none text-[11px] font-medium w-48 ${isDarkMode ? 'placeholder:text-white/20 text-white' : 'placeholder:text-black/20 text-black'}`}
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsHelpCenterOpen(false);
                      setIsAIAssistantOpen(false);
                    }}
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className={`flex-1 overflow-y-auto scrollbar-hide relative z-10 ${isAIAssistantOpen ? 'flex flex-col p-6' : 'p-8'}`}>
                  {isAIAssistantOpen ? (
                    <Suspense fallback={<div className="p-8 text-center text-white/40 text-sm">Loading assistant…</div>}>
                    <AIAssistant
                      isOpen={true}
                      setIsOpen={setIsAIAssistantOpen}
                      isDarkMode={isDarkMode}
                      t={t}
                      aiChatMessages={aiChatMessages}
                      setAIChatMessages={setAIChatMessages}
                      isAITyping={isAITyping}
                      handleAIChat={handleAIChat}
                      generateChatSummary={generateChatSummary}
                      isGeneratingChatSummary={isGeneratingChatSummary}
                      chatSummary={chatSummary}
                    />
                    </Suspense>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {[
                          { id: 'ai-assistant', icon: <Bot className="w-5 h-5 text-accent" />, title: 'Ask PlayDravo AI', desc: 'Get instant recommendations and troubleshooting support from our smart assistant.' },
                          { id: 'getting-started', icon: <BookOpen className="w-5 h-5 text-accent" />, title: t('gettingStarted'), desc: t('gettingStartedDesc') },
                          { id: 'modding-guide', icon: <Wrench className="w-5 h-5 text-accent" />, title: t('moddingGuide'), desc: t('moddingGuideDesc') },
                          { id: 'account-security', icon: <ShieldCheck className="w-5 h-5 text-accent" />, title: t('accountSecurity'), desc: t('accountSecurityDesc') },
                          { id: 'faq', icon: <MessageCircle className="w-5 h-5 text-accent" />, title: t('communityFAQ'), desc: t('communityFAQDesc') }
                        ].filter(item => 
                          item.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(helpSearchQuery.toLowerCase())
                        ).map((item, idx) => (
                          <motion.div 
                            key={`help-item-${item.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, borderColor: 'rgba(157, 92, 255, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleHelpCardClick(item.id)}
                            className="bento-card p-6 group cursor-pointer transition-all relative z-20"
                          >
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              {item.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                            <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{item.desc}</p>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-accent/5 border border-accent/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(157,92,255,0.3)]"
                          >
                            <LifeBuoy className="w-8 h-8 text-bg-dark" />
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-bold mb-1">{t('stillNeedAssistance')}</h3>
                            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('supportAgentsAvailable')}</p>
                          </div>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setIsHelpCenterOpen(false);
                            setIsAIAssistantOpen(false);
                            setIsSupportModalOpen(true);
                          }}
                          className="px-8 py-4 bg-accent text-bg-dark rounded-2xl font-bold transition-all whitespace-nowrap relative z-20"
                        >
                          {t('contactSupport')}
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>

                <div className={`p-6 border-t text-center transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>
                    PlayDravo GAME SUPPORT • EST. 2026
                  </p>
                </div>
              </motion.div>
            </div>

        {isPreferencesModalOpen && (
        <Suspense fallback={null}>
        <PreferencesModal
          isOpen={isPreferencesModalOpen}
          onClose={() => setIsPreferencesModalOpen(false)}
          isDarkMode={isDarkMode}
          t={t}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          THEMES={THEMES}
          language={language}
          setLanguage={setLanguage}
          userProfile={userProfile}
          togglePreferredCategory={togglePreferredCategory}
          categoryKeyMap={categoryKeyMap}
          categories={CATEGORIES}
          gamerPersona={gamerPersona}
          isAnalyzingPersona={isAnalyzingPersona}
          analyzeGamerPersona={analyzeGamerPersona}
          handleGenerateDescriptions={handleGenerateDescriptions}
        />
        </Suspense>
        )}

        {/* Floating Actions */}
        <div className="fixed bottom-10 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col gap-4">
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top-footer"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={scrollToTop}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 border bg-bg-dark border-white/20 text-white hover:bg-accent`}
              >
                <ChevronUp className="w-6 h-6 md:w-8 md:h-8" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      <Suspense fallback={null}>
      <GlobalModals
        modalsState={modalsState}
        user={user}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        legalContent={legalContent}
        isDarkMode={isDarkMode}
        t={t}
        activeGame={activeGame}
        accountSettingsView={accountSettingsView}
      />
      </Suspense>

      <Toaster
        position="top-right"
        visibleToasts={2}
        expand={false}
        closeButton
        offset={{ top: 'max(56px, env(safe-area-inset-top, 0px))', right: 12 }}
        mobileOffset={{ top: 'max(56px, env(safe-area-inset-top, 0px))', right: 12 }}
        toastOptions={{
          duration: 7500,
          unstyled: false,
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            borderRadius: '0.75rem',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          },
        }}
      />
    </div>
    </div>
    </SidebarProvider>
  );
}
