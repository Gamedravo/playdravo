import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Search, 
  Sparkles, 
  Zap, 
  Command, 
  Plus, 
  User, 
  LogIn,
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
  logout: () => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  openAccountSettings: (view?: 'main' | 'email' | 'logout-all' | 'delete' | 'notifications' | 'privacy') => void;
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
  logout,
  setIsCommandPaletteOpen,
  setIsSubmitModalOpen,
  openAccountSettings,
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
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
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
      case 'achievement':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-orange-400" />;
      case 'social':
        return <Heart className="w-4 h-4 text-rose-400" fill="currentColor" />;
      default:
        return <Sparkles className="w-4 h-4 text-accent" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rewards') return n.type === 'achievement';
    if (activeTab === 'system') return n.type === 'system';
    if (activeTab === 'activity') return n.type === 'game' || n.type === 'social';
    return true;
  });

  const isExpanded = isSidebarOpen || isSidebarHovered;

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${isDarkMode ? 'bg-bg-dark border-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]' : 'bg-white border-black/5 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
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
                  className="fixed inset-0 z-[110] bg-black/40 sm:hidden"
                  onClick={() => setIsNotificationsOpen(false)}
                  aria-hidden="true"
                />
              )}
              <AnimatePresence>
                {isNotificationsOpen && (
                    <motion.div
                      key="notification-panel"
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      className={`fixed left-0 right-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[400px] max-h-[min(70vh,calc(100dvh-4.5rem))] rounded-b-2xl sm:rounded-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.5)] z-[120] flex flex-col overflow-hidden ${
                        isDarkMode
                          ? 'bg-[#0f0e1c]/98 text-white backdrop-blur-xl'
                          : 'bg-white/98 text-black backdrop-blur-xl'
                      }`}
                      style={{ transformOrigin: 'top right' }}
                      id="header-notification-panel"
                    >
                  {/* Panel Header */}
                  <div className={`p-4 pb-3 border-b flex flex-col gap-3 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-accent text-bg-dark rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isDarkMode ? 'hover:bg-white/5 text-white/50 hover:text-white' : 'hover:bg-black/5 text-black/50 hover:text-black'
                        }`}
                        title="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {notifications.length > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/5">
                        <button
                          onClick={() => { markAllAsRead(); toast.success('All notifications marked as read'); }}
                          className="text-[11px] font-semibold text-accent hover:opacity-80 transition-all flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-lg"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                        <button
                          onClick={() => { clearAll(); toast.success('Cleared all notifications'); }}
                          className="text-[11px] font-semibold transition-all flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg"
                        >
                          <Trash2 className="w-3 h-3" /> Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className={`flex px-3 py-1.5 border-b gap-1 overflow-x-auto scrollbar-none ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    {([
                      { id: 'all' as const, label: 'All' },
                      { id: 'rewards' as const, label: 'Rewards' },
                      { id: 'system' as const, label: 'System' },
                      { id: 'activity' as const, label: 'Activity' },
                    ]).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-accent text-bg-dark font-extrabold shadow-md shadow-accent/25'
                            : isDarkMode
                              ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                              : 'text-black/40 hover:text-black/70 hover:bg-black/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Notification List */}
                  <div
                    className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-white/10 space-y-2"
                    id="notification-scroller-body"
                  >
                    {filteredNotifications.length === 0 ? (
                      <div className="py-10 px-6 flex flex-col items-center justify-center text-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${
                          isDarkMode ? 'bg-white/5 border-white/5 text-accent' : 'bg-black/5 border-black/10 text-accent'
                        }`}>
                          <Check className="w-5 h-5" />
                        </div>
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                          You're all caught up
                        </p>
                        <p className={`text-xs mt-1 max-w-[220px] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                          {activeTab === 'all'
                            ? 'No new updates. Check back for rewards and events.'
                            : 'No alerts in this filter.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredNotifications.map((notif) => {
                          let themeBg = 'bg-accent/[0.02] hover:bg-accent/5 border-accent/20';
                          let iconThemeBg = 'bg-accent/15 text-accent border-accent/10';
                          let unreadBorder = 'border-l-2 border-l-accent';

                          if (notif.type === 'achievement') {
                            themeBg = 'bg-emerald-500/[0.02] hover:bg-emerald-500/[0.05] border-emerald-500/20';
                            iconThemeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
                          } else if (notif.type === 'game') {
                            themeBg = 'bg-orange-500/[0.02] hover:bg-orange-500/[0.05] border-orange-500/20';
                            iconThemeBg = 'bg-orange-500/10 text-orange-400 border-orange-500/10';
                          } else if (notif.type === 'social') {
                            themeBg = 'bg-rose-500/[0.02] hover:bg-rose-500/[0.05] border-rose-500/20';
                            iconThemeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/10';
                          } else if (notif.type === 'system') {
                            themeBg = 'bg-cyan-500/[0.02] hover:bg-cyan-500/[0.05] border-cyan-500/20';
                            iconThemeBg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10';
                          }

                          return (
                            <div
                              key={notif.id}
                              onClick={() => markAsRead(notif.id)}
                              className={`group p-3 rounded-xl flex items-center gap-3 transition-all duration-150 cursor-pointer border relative select-none ${
                                !notif.read
                                  ? `${themeBg} ${unreadBorder}`
                                  : isDarkMode
                                    ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                                    : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.03]'
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border ${iconThemeBg}`}>
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h5 className={`text-xs font-semibold truncate ${!notif.read ? (isDarkMode ? 'text-white' : 'text-black') : (isDarkMode ? 'text-white/70' : 'text-black/70')}`}>
                                    {notif.title}
                                  </h5>
                                  {!notif.read && <span className="w-1.5 h-1.5 shrink-0 bg-accent rounded-full" />}
                                </div>
                                <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                                  {notif.description}
                                </p>
                                <span className={`text-[9px] mt-1 block font-medium uppercase tracking-wide ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
                                  {formatTimeAgo(notif.timestamp)}
                                </span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); toast.success('Notification removed'); }}
                                className={`shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                                  isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/10 text-black/40 hover:text-black'
                                }`}
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                    </motion.div>
                )}
              </AnimatePresence>
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
                    openAccountSettings={openAccountSettings}
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
