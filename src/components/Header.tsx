import {
  Menu,
  Search,
  LogIn,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { HeaderBrand } from './HeaderBrand';
import { UserProfile, Language } from '../types';
import { type ReplitUser } from '../hooks/useReplitAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { memo, useState, useRef } from 'react';
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
  const bellRef = useRef<HTMLButtonElement>(null);
  const { unreadCount } = useNotifications();
  const isSearchPage = location.pathname === '/search';

  const handleMobileSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!isSearchPage) navigate('/search');
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-150 ${isDarkMode ? 'bg-bg-dark border-white/5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]' : 'bg-white border-black/5 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            aria-label="Toggle menu"
            aria-expanded={isSidebarOpen}
            className={`p-2.5 rounded-xl transition-colors border flex items-center justify-center ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'}`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <HeaderBrand
            onHome={() => {
              if (setSelectedCategory) setSelectedCategory('All');
              if (setSearchQuery) setSearchQuery('');
            }}
          />
        </div>

        {/* Search Bar - Desktop/Tablet */}
        {!isSearchPage && (
          <div className="hidden md:flex flex-1 min-w-[120px] max-w-xl relative group ml-4 mr-4">
            <div className={`relative flex items-center w-full h-11 rounded-xl transition-colors duration-150 border ${
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

        {/* Search Bar - Mobile */}
        {!isSearchPage && (
          <div className="flex md:hidden flex-1 min-w-[118px] max-w-[220px] relative ml-auto">
            <div className={`relative flex items-center w-full h-10 rounded-2xl border transition-colors ${
              isDarkMode
                ? 'bg-black/45 border-cyan-300/15 focus-within:border-cyan-300/45'
                : 'bg-black/5 border-black/10 focus-within:border-accent/50'
            }`}>
              <Search className={`ml-3 h-4 w-4 shrink-0 ${isDarkMode ? 'text-cyan-200/70' : 'text-black/45'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleMobileSearchChange(e.target.value)}
                onFocus={() => navigate('/search')}
                placeholder="Search"
                className={`min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold outline-none placeholder:text-xs placeholder:font-bold ${
                  isDarkMode ? 'text-white placeholder:text-white/35' : 'text-black placeholder:text-black/40'
                }`}
              />
            </div>
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
            <button
              ref={bellRef}
              onClick={() => setIsNotificationsOpen((o) => !o)}
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
              className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-colors border ${
                isNotificationsOpen
                  ? isDarkMode
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-black/10 border-black/20 text-black'
                  : isDarkMode
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70 hover:text-white'
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black/60 hover:text-black'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
            
            {!user ? (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-bg-dark rounded-2xl font-semibold text-xs hover:bg-accent transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t('login')}</span>
              </button>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  aria-label="User Profile"
                  aria-expanded={isProfileDropdownOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-2xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} ${isProfileDropdownOpen ? 'ring-2 ring-accent' : ''}`}
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden border border-accent/20">
                    <img 
                      src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold max-w-[60px] sm:max-w-[100px] truncate">
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
