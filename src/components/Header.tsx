import {
  Menu,
  Search,
  LogIn,
  ChevronDown,
  Bell,
  Flame,
  Zap,
  Trophy,
  Users,
  Map,
  CarFront,
} from 'lucide-react';
import { HeaderBrand } from './HeaderBrand';
import { UserProfile, Language } from '../types';
import { type ReplitUser } from '../hooks/useReplitAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { memo, startTransition, useEffect, useRef, useState } from 'react';
import { NotificationDrawer } from './NotificationDropdown';
import { useNotifications } from './NotificationsProvider';
import { useSidebar, useSidebarOpen } from '../contexts/SidebarContext';

interface HeaderProps {
  isDarkMode: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: ReplitUser | null;
  userProfile: UserProfile | null;
  setIsLoginModalOpen: (open: boolean) => void;
  logout: () => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
  openAccountSettings: (view?: 'main' | 'email' | 'password' | 'logout-all' | 'delete' | 'notifications' | 'privacy') => void;
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
  setIsSubmitModalOpen: (open: boolean) => void;
}

const QUICK_CATEGORIES = [
  { label: 'Action', icon: Flame },
  { label: 'Racing', icon: CarFront },
  { label: 'Sports', icon: Trophy },
  { label: 'Multiplayer', icon: Users },
  { label: 'Adventure', icon: Map },
];

export const Header = memo(function Header({
  isDarkMode,
  searchQuery,
  setSearchQuery,
  user,
  userProfile,
  setIsLoginModalOpen,
  logout,
  setIsCommandPaletteOpen,
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
  setLanguage,
  setIsSubmitModalOpen,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSidebarOpen = useSidebarOpen();
  const { toggle: toggleSidebar } = useSidebar();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const { unreadCount } = useNotifications();
  const isSearchPage = location.pathname === '/search';

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const updateSearch = (query: string) => {
    setLocalSearchQuery(query);
    startTransition(() => setSearchQuery(query));
  };

  const openSearch = () => {
    if (!isSearchPage) startTransition(() => navigate('/search'));
  };

  const preloadAccountUi = () => {
    void import('./GlobalModals');
    void import('./LoginModal');
    void import('./AccountSettingsModal');
  };

  const handleMobileSearchChange = (query: string) => {
    updateSearch(query);
    openSearch();
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat === activeCategory ? null : cat);
    if (setSelectedCategory) {
      setSelectedCategory(cat === activeCategory ? 'All' : cat);
    }
    if (location.pathname !== '/') startTransition(() => navigate('/'));
  };

  return (
    <header className="sticky top-0 z-50 w-full px-2 md:px-3 pt-2 pb-0">
      <div className={`rounded-2xl border backdrop-blur-xl transition-all duration-200 ${
        isDarkMode
          ? `bg-[#09090f]/85 border-white/[0.07] ${scrolled ? 'shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.04)]' : 'shadow-[0_4px_24px_rgba(0,0,0,0.35)]'}`
          : `bg-white/90 border-black/[0.06] ${scrolled ? 'shadow-[0_12px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]' : 'shadow-[0_4px_18px_rgba(0,0,0,0.07)]'}`
      }`}>
        <div className="header-inner px-3 md:px-5 py-2 flex items-center gap-2 md:gap-3">

          {/* ── Left: Toggle + Logo ── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              aria-expanded={isSidebarOpen}
              className={`p-2 rounded-xl transition-all border flex items-center justify-center active:scale-95 ${
                isDarkMode
                  ? 'bg-white/[0.05] border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.15] text-white/70 hover:text-white'
                  : 'bg-black/[0.04] border-black/[0.08] hover:bg-black/[0.08] hover:border-black/[0.15] text-black/60 hover:text-black'
              }`}
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            <HeaderBrand
              onHome={() => {
                if (setSelectedCategory) setSelectedCategory('All');
                if (setSearchQuery) setSearchQuery('');
                setActiveCategory(null);
              }}
            />
          </div>

          {/* ── Center: Quick Category Pills + Search ── */}
          <div className="flex flex-1 items-center gap-2 xl:gap-3 min-w-0">

            {/* Quick Category Pills — visible at xl (1280px) and above */}
            {!isSearchPage && (
              <nav className="hidden xl:flex items-center gap-1 shrink-0">
                {QUICK_CATEGORIES.map(({ label, icon: Icon }) => {
                  const isActive = activeCategory === label;
                  return (
                    <button
                      key={label}
                      onClick={() => handleCategoryClick(label)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all duration-150 border whitespace-nowrap active:scale-95 ${
                        isActive
                          ? isDarkMode
                            ? 'bg-violet-600/25 border-violet-500/40 text-violet-200'
                            : 'bg-violet-100 border-violet-300/60 text-violet-700'
                          : isDarkMode
                          ? 'bg-white/[0.04] border-white/[0.06] text-white/55 hover:bg-white/[0.09] hover:border-white/[0.14] hover:text-white/90'
                          : 'bg-black/[0.03] border-black/[0.07] text-black/50 hover:bg-black/[0.07] hover:border-black/[0.12] hover:text-black/80'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Divider — only shown when categories are visible */}
            {!isSearchPage && (
              <div className={`hidden xl:block h-5 w-px shrink-0 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
            )}

            {/* Search Bar — Desktop */}
            {!isSearchPage && (
              <div className="hidden md:flex flex-1 min-w-[180px] relative group">
                <div className={`relative flex items-center w-full h-10 rounded-xl transition-all duration-150 border ${
                  isDarkMode
                    ? 'bg-white/[0.05] border-white/[0.08] hover:border-white/[0.15] group-focus-within:border-violet-500/50 group-focus-within:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'bg-black/[0.04] border-black/[0.08] hover:border-black/[0.15] group-focus-within:border-violet-500/40 group-focus-within:bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]'
                }`}>
                  <Search className={`ml-3.5 w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isDarkMode ? 'text-white/30 group-focus-within:text-violet-400' : 'text-black/35 group-focus-within:text-violet-500'
                  }`} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => updateSearch(e.target.value)}
                    onFocus={openSearch}
                    placeholder={t('search')}
                    className={`flex-1 bg-transparent border-none outline-none focus:ring-0 text-[13.5px] font-medium px-3 tracking-wide placeholder:font-semibold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10.5px] ${
                      isDarkMode ? 'text-white placeholder:text-white/28' : 'text-black placeholder:text-black/38'
                    }`}
                  />
                  {/* Keyboard shortcut hint */}
                  <div className={`mr-3 hidden lg:flex items-center gap-1 shrink-0 select-none pointer-events-none`}>
                    <kbd className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
                      isDarkMode ? 'bg-white/[0.06] border-white/[0.12] text-white/30' : 'bg-black/[0.05] border-black/[0.10] text-black/35'
                    }`}>⌘</kbd>
                    <kbd className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${
                      isDarkMode ? 'bg-white/[0.06] border-white/[0.12] text-white/30' : 'bg-black/[0.05] border-black/[0.10] text-black/35'
                    }`}>K</kbd>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Search */}
            {!isSearchPage && (
              <div className="flex md:hidden flex-1 min-w-[80px] relative">
                <div className={`relative flex items-center w-full h-9 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-white/[0.05] border-white/[0.08] focus-within:border-violet-500/50'
                    : 'bg-black/[0.04] border-black/[0.08] focus-within:border-violet-500/40'
                }`}>
                  <Search className={`ml-2.5 h-3.5 w-3.5 shrink-0 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                  <input
                    type="text"
                    value={localSearchQuery}
                    onChange={(e) => handleMobileSearchChange(e.target.value)}
                    onFocus={openSearch}
                    placeholder="Search"
                    className={`min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold outline-none placeholder:text-xs placeholder:font-bold ${
                      isDarkMode ? 'text-white placeholder:text-white/30' : 'text-black placeholder:text-black/35'
                    }`}
                  />
                </div>
              </div>
            )}

            {isSearchPage && <div className="flex-1" />}
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Language Selector */}
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

            {/* Notifications Bell */}
            <button
              ref={bellRef}
              onClick={() => setIsNotificationsOpen((o) => !o)}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all border active:scale-95 ${
                isNotificationsOpen
                  ? isDarkMode
                    ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                    : 'bg-violet-100 border-violet-300/60 text-violet-700'
                  : isDarkMode
                  ? 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.13] text-white/55 hover:text-white'
                  : 'bg-black/[0.03] border-black/[0.07] hover:bg-black/[0.08] text-black/50 hover:text-black'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(124,58,237,0.9)]" />
              )}
            </button>

            {/* Divider */}
            <div className={`hidden sm:block h-5 w-px mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />

            {/* Login / Profile */}
            {!user ? (
              <button
                onPointerEnter={preloadAccountUi}
                onFocus={preloadAccountUi}
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-[12px] text-white transition-all active:scale-95 hover:brightness-110 uppercase tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  boxShadow: '0 4px 18px rgba(124,58,237,0.40)',
                }}
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onPointerEnter={preloadAccountUi}
                  onFocus={preloadAccountUi}
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-label="User Profile"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-xl transition-all border ${
                    isDarkMode
                      ? 'bg-white/[0.04] border-white/[0.07] hover:bg-white/[0.09] hover:border-white/[0.13]'
                      : 'bg-black/[0.03] border-black/[0.07] hover:bg-black/[0.07]'
                  } ${isProfileDropdownOpen ? 'ring-2 ring-violet-500/60' : ''}`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-violet-500/25">
                    <img
                      src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[60px] sm:max-w-[90px] truncate">
                    {userProfile?.displayName || 'User'}
                  </span>
                  <ChevronDown className={`hidden sm:block w-3 h-3 transition-transform duration-150 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
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

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        isDarkMode={isDarkMode}
        anchorRef={bellRef}
      />
    </header>
  );
});
