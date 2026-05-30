import { motion } from 'motion/react';
import { 
  Menu, 
  RefreshCw, 
  Search, 
  Sparkles, 
  Zap, 
  Command, 
  Plus, 
  User, 
  LogIn,
  Coins,
  ChevronDown,
  Bell,
  Trophy,
  Heart,
  Trash2,
  Check,
  Gamepad2,
  X
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { useEconomy } from './EconomyProvider';
import { useNotifications } from './NotificationsProvider';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarHovered?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsShopModalOpen: (open: boolean) => void;
  logout: () => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  setIsPreferencesModalOpen: (open: boolean) => void;
  setIsAccountSettingsOpen: (open: boolean) => void;
  setIsUsernameModalOpen: (open: boolean) => void;
  setIsHelpCenterOpen: (open: boolean) => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (open: boolean) => void;
  setSelectedCategory?: (category: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  accentColor: string;
  t: (key: any) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function Header({
  isDarkMode,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarHovered = false,
  searchQuery,
  setSearchQuery,
  user,
  userProfile,
  setIsLoginModalOpen,
  setIsShopModalOpen,
  logout,
  setIsCommandPaletteOpen,
  setIsSubmitModalOpen,
  setIsPreferencesModalOpen,
  setIsAccountSettingsOpen,
  setIsUsernameModalOpen,
  setIsHelpCenterOpen,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  setSelectedCategory,
  searchInputRef,
  accentColor,
  t,
  language,
  setLanguage
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<'all' | 'rewards' | 'system' | 'activity'>('all');
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'coins':
        return <Coins className="w-4 h-4 text-yellow-500 animate-bounce" />;
      case 'achievement':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-orange-500 animate-pulse" />;
      case 'social':
        return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
      default:
        return <Sparkles className="w-4 h-4 text-accent" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return n.type === 'coins' || n.type === 'achievement';
    if (activeTab === 'system') return n.type === 'system';
    if (activeTab === 'activity') return n.type === 'game' || n.type === 'social';
    return true;
  });

  const isExpanded = isSidebarOpen || isSidebarHovered;

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${isDarkMode ? 'bg-bg-dark border-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]' : 'bg-white border-black/5 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'}`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              if (setSelectedCategory) setSelectedCategory('All');
              if (setSearchQuery) setSearchQuery('');
              const main = document.querySelector('main');
              if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className={`flex items-center cursor-pointer group shrink-0 transition-all duration-300 ease-in-out origin-left gap-2.5
              ${isExpanded 
                ? 'md:opacity-0 md:max-w-0 md:-translate-x-4 md:pointer-events-none md:mr-0 overflow-hidden' 
                : 'md:opacity-100 md:max-w-[200px] md:translate-x-0 md:mr-4'
              }
            `}
            title="Home"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 bg-accent rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(var(--accent-rgb),0.4)] group-hover:rotate-12 transition-all duration-300">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-bg-dark fill-current" />
            </div>
            <span className="font-bold tracking-tight text-xl md:text-2xl transition-all duration-200 group-hover:opacity-80 hidden sm:block">
              Play<span className="text-accent">Dravo</span>
            </span>
          </a>
        </div>

        {/* Search Bar - Desktop/Tablet */}
        {!isSearchPage && (
          <div className="hidden md:flex flex-1 min-w-[120px] max-w-xl relative group ml-4 mr-4">
            <div className={`relative flex items-center w-full h-11 rounded-xl transition-all duration-300 border ${
              isDarkMode 
                ? 'bg-black/40 border-white/10 hover:border-white/20 group-focus-within:border-accent group-focus-within:bg-black/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]' 
                : 'bg-black/5 border-black/10 hover:border-black/20 group-focus-within:border-accent group-focus-within:bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]'
            }`}>
              <Search className={`ml-4 w-4 h-4 transition-colors duration-200 ${isDarkMode ? 'text-white/40 group-focus-within:text-white' : 'text-black/40 group-focus-within:text-black'}`} />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => navigate('/search')}
                placeholder={t('search')} 
                className={`flex-1 bg-transparent border-none outline-none focus:ring-0 text-[14px] font-medium px-3 tracking-wide placeholder:font-medium placeholder:uppercase placeholder:tracking-widest placeholder:text-[11px] ${isDarkMode ? 'text-white placeholder:text-white/50' : 'text-black placeholder:text-black/50'}`}
              />
              <div className="flex items-center gap-2 pr-2">
              </div>
            </div>
          </div>
        )}

        {/* Search Icon - Mobile Only */}
        {!isSearchPage && (
          <div className="flex md:hidden justify-end px-2 ml-auto">
            <Link
              to="/search"
              className={`p-2.5 rounded-full transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
            >
              <Search className={`w-4 h-4 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`} />
            </Link>
          </div>
        )}

        {/* Placeholder for spacing when search is hidden */}
        {isSearchPage && <div className="flex-1" />}

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher
                currentLanguage={language}
                setLanguage={setLanguage}
                isDarkMode={isDarkMode}
                align="right"
                minimal={true}
                variant="dropdown"
              />
            </div>
            <HeaderEconomy 
              isDarkMode={isDarkMode}
              setIsShopModalOpen={setIsShopModalOpen}
              user={user}
              t={t}
            />

            {userProfile?.role === 'admin' && (
              <button 
                onClick={() => setIsSubmitModalOpen(true)}
                aria-label="Submit a game"
                className={`hidden md:flex p-2 sm:p-3 rounded-2xl transition-all group bg-accent text-bg-dark hover:scale-110 active:scale-95`}
              >
                <Plus className="w-4 h-4 sm:w-5 h-5" />
              </button>
            )}

            <div className="relative" ref={notificationsDropdownRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                className={`p-2 sm:p-2.5 rounded-xl transition-all relative hover:scale-105 active:scale-95 ${isNotificationsOpen ? 'ring-2 ring-accent' : ''} ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}
              >
                <Bell className="w-4 h-4 sm:w-4 sm:h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-extrabold text-white bg-red-500 rounded-full border-2 border-[#12121e] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div 
                  className={`absolute right-0 top-full mt-2.5 w-[310px] sm:w-[360px] rounded-3xl border shadow-2xl z-[100] flex flex-col overflow-hidden transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-[#151525]/98 border-white/10 shadow-black/80 backdrop-blur-xl' 
                      : 'bg-white/98 border-black/10 shadow-black/10 backdrop-blur-xl'
                  }`}
                  style={{ transformOrigin: 'top right' }}
                >
                  {/* Dropdown Header */}
                  <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs font-extrabold tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-extrabold bg-accent/25 text-accent px-1.5 py-0.5 rounded-xl uppercase tracking-wider">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => {
                            markAllAsRead();
                            toast.success('All notifications marked as read');
                          }}
                          className="text-[10px] font-bold text-accent hover:underline transition-all flex items-center gap-1 focus:outline-none"
                        >
                          <Check className="w-3 h-3" /> Read all
                        </button>
                        <button 
                          onClick={() => {
                            clearAll();
                            toast.success('Cleared all notifications');
                          }}
                          className={`text-[10px] font-bold hover:underline transition-all flex items-center gap-1 focus:outline-none ${isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60'}`}
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className={`flex px-2 py-1.5 border-b gap-1 overflow-x-auto scrollbar-none ${isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-black/5 bg-black/[0.01]'}`}>
                    {(['all', 'rewards', 'system', 'activity'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-xl transition-all ${
                          activeTab === tab
                            ? 'bg-accent text-bg-dark font-extrabold shadow-sm'
                            : isDarkMode
                              ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                              : 'text-black/40 hover:text-black/70 hover:bg-black/5'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-[320px] overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDarkMode ? 'bg-white/5 text-white/30' : 'bg-black/5 text-black/30'}`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <p className={`text-[11px] font-bold ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                          {activeTab === 'all' ? 'All caught up!' : 'No notifications in this category'}
                        </p>
                        <p className={`text-[9px] mt-1 max-w-[200px] leading-relaxed ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                          {activeTab === 'all' 
                            ? 'Activity notifications (like plays, purchases, collection claims) will appear here as they happen.' 
                            : 'Try selecting another category panel to filter items.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 px-2">
                        {filteredNotifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-3 rounded-2xl flex items-start gap-3 transition-all duration-200 cursor-pointer group relative ${
                              !notif.read
                                ? isDarkMode
                                  ? 'bg-accent/5 border border-accent/20 hover:bg-accent/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]'
                                  : 'bg-accent/5 border border-accent/10 hover:bg-accent/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]'
                                : isDarkMode
                                  ? 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/5'
                                  : 'bg-transparent border border-transparent hover:bg-black/5 hover:border-black/5'
                            }`}
                          >
                            {/* Unread indicator active dot */}
                            {!notif.read && (
                              <span className="absolute top-1/2 left-2.5 -translate-y-1/2 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_6px_var(--accent-rgb)]" />
                            )}

                            {/* Icon Wrapper */}
                            <div className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                              {getNotificationIcon(notif.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-5">
                              <p className={`text-xs font-bold leading-tight truncate ${notif.read ? (isDarkMode ? 'text-white/80' : 'text-black/80') : (isDarkMode ? 'text-white font-extrabold' : 'text-black font-extrabold')}`}>
                                {notif.title}
                              </p>
                              <p className={`text-[10px] mt-1 leading-normal ${isDarkMode ? 'text-white/60' : 'text-black/60'} line-clamp-2 pr-1`}>
                                {notif.description}
                              </p>
                              <span className={`text-[9px] mt-1.5 block font-bold uppercase tracking-wider ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                                {formatTimeAgo(notif.timestamp)}
                              </span>
                            </div>

                            {/* Delete single notification button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notif.id);
                              }}
                              aria-label="Delete notification"
                              className={`absolute right-2.5 top-2.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transition-colors duration-150 ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/10 text-black/40 hover:text-black'}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {!user ? (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-bg-dark rounded-2xl font-semibold text-xs hover:bg-accent transition-all hover:scale-105 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 h-4" />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-label="User Profile"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-2xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} ${isProfileDropdownOpen ? 'ring-2 ring-accent' : ''}`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden border border-accent/20">
                    <img 
                      src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[60px] sm:max-w-[100px] truncate">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className="hidden md:block">
                  <ProfileDropdown 
                    isOpen={isProfileDropdownOpen}
                    onClose={() => setIsProfileDropdownOpen(false)}
                    user={user}
                    userProfile={userProfile}
                    isDarkMode={isDarkMode}
                    logout={logout}
                    setIsPreferencesModalOpen={setIsPreferencesModalOpen}
                    setIsAccountSettingsOpen={setIsAccountSettingsOpen}
                    setIsUsernameModalOpen={setIsUsernameModalOpen}
                    setIsHelpCenterOpen={setIsHelpCenterOpen}
                    setSelectedCategory={setSelectedCategory}
                    t={t}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeaderEconomy({ 
  isDarkMode, 
  setIsShopModalOpen,
  user,
  t
}: { 
  isDarkMode: boolean; 
  setIsShopModalOpen: (open: boolean) => void;
  user: any;
  t: (key: any) => string;
}) {
  const { coins, isNoAdsActive } = useEconomy();

  return (
    <div className="flex items-center gap-2">
      {isNoAdsActive && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-accent/20 bg-accent/5 text-accent">
          <Zap className="w-3 h-3 fill-accent" />
          <span className="text-xs font-semibold">No Ads</span>
        </div>
      )}
      <button
        onClick={() => setIsShopModalOpen(true)}
        aria-label="Open shop"
        className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 group shadow-sm ${
          isDarkMode 
            ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' 
            : 'bg-yellow-500/5 border-yellow-500/10 hover:bg-yellow-500/10'
        }`}
      >
        <div className="relative">
          <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:rotate-12 transition-transform duration-500" />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <span className={`text-[10px] font-bold uppercase text-yellow-500/60 transition-colors group-hover:text-yellow-500`}>
            {t('shop')}
          </span>
          <span className={`text-[10px] sm:text-xs font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {user ? coins.toLocaleString() : '0'}
          </span>
        </div>
      </button>
    </div>
  );
}
