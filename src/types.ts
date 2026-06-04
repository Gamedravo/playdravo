export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it';

export interface Mod {
  id: string;
  title: string;
  description: string;
  url: string;
  downloads: number;
  authorUid: string;
  createdAt: any;
}

export interface Game {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  url: string;
  description: string;
  rating: number;
  ratingCount?: number;
  totalRating?: number;
  plays: number;
  authorUid: string;
  createdAt: any;
  trailerUrl?: string;
  isHot?: boolean;
  isTop?: boolean;
  avgPlayTime?: string;
  commonCategoryPlay?: string;
  winRatio?: string;
  lossRatio?: string;
  instructions?: string;
  howToPlay?: string;
  controls?: string;
  tipsAndTricks?: string;
  whyYoullLikeIt?: string;
  similarGamesRef?: string[];
  tags?: string[];
  mods?: Mod[];
  developer?: string;
  publisher?: string;
  mobileOptimization?: 'touch-friendly' | 'desktop-only' | 'responsive';
  fullscreenSupport?: boolean;
  orientation?: 'landscape' | 'portrait' | 'any';
  screenshots?: string[];
  /** Hover preview MP4/WebM (desktop) */
  previewVideoUrl?: string;
  /** Hover preview GIF fallback when no MP4 */
  previewGifUrl?: string;

  /** True when the embed source is known to inject intrusive third-party ads. */
  adsInjected?: boolean;
  /** True when the embed source is known/suspected to open popups (window.open, new tabs). */
  popupRisk?: boolean;
  /** True when the embed source is known/suspected to trigger external redirects. */
  redirectRisk?: boolean;

  // Authenticity & Quality Control metrics
  sourceId?: string;
  validationState?: 'Verified Working' | 'Needs Review' | 'Unavailable';
  lastVerified?: string;
  embedCompatibility?: 'full' | 'standalone-only' | 'needs-review';
  contentRating?: string;
  version?: string;
}

export interface ChatMessage {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  timestamp: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'user' | 'admin';
  favorites: string[];
  preferredCategories?: string[];
  xp?: number;
  level?: number;
  achievements?: string[];
  totalPlaytime?: number; // in seconds or minutes
  createdAt: string;
  gamerPersona?: {
    title: string;
    description: string;
  };
  accentColor?: string;
  isDarkMode?: boolean;
  playHistory?: string[];
  usernameSet?: boolean;
}

export interface Report {
  id: string;
  gameId: string;
  gameTitle: string;
  uid: string;
  reason: string;
  timestamp: any;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface GameRequest {
  id?: string;
  userId?: string;
  gameName: string;
  link?: string;
  description?: string;
  createdAt: any;
  read?: boolean;
}

export interface BugReport {
  id?: string;
  userId?: string;
  gameName: string;
  description: string;
  email?: string;
  createdAt: any;
  read?: boolean;
}

export interface ContactMessage {
  id?: string;
  userId?: string;
  subject: string;
  message: string;
  email?: string;
  createdAt: any;
  read?: boolean;
}

export type Tag = string;
export type Theme = 'dark' | 'light';

export type Category = 'All' | 'Favorites' | 'Trending' | 'Casual' | 'Action' | 'Puzzle' | 'Simulator' | 'Obby' | 'Adventure' | 'Sports' | 'Strategy' | 'Multiplayer' | 'Arcade' | 'Horror' | '2 Player' | '3 Player' | '4 Player';
