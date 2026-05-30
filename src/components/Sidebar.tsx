import React, { useRef, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  Settings, 
  HelpCircle, 
  AlertCircle, 
  FileText, 
  Bug, 
  LogOut, 
  User, 
  LogIn,
  Gamepad2,
  Bot,
  Sparkles,
  Dices,
  Coins,
  Plus
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarHovered: boolean;
  setIsSidebarHovered: (hovered: boolean) => void;
  isDarkMode: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryGroups: { title: string; items: string[] }[];
  getCategoryIcon: (cat: string) => React.ReactNode;
  categoryCounts: Record<string, number>;
  userProfile: UserProfile | null;
  setIsLoginModalOpen: (open: boolean) => void;
  logout: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  THEMES: { name: string; color: string; icon: any }[];
  setIsPreferencesModalOpen: (open: boolean) => void;
  setIsHelpCenterOpen: (open: boolean) => void;
  setIsStatusModalOpen: (open: boolean) => void;
  setIsLegalModalOpen: (open: boolean) => void;
  setIsBugReportModalOpen: (open: boolean) => void;
  setIsAIAssistantOpen: (open: boolean) => void;
  setIsShopModalOpen: (open: boolean) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  handleSurpriseMe: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: any) => string;
}

const categoryKeyMap: Record<string, string> = {
  'All': 'all',
  'Favorites': 'favorites',
  'Recommended': 'recommended',
  'History': 'history',
  'Trending': 'trending',
  'Mods': 'mods',
  'Shop': 'shop',
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
  'Main Menu': 'mainMenu',
  'Categories': 'categories'
};

export const Sidebar = memo(function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarHovered,
  setIsSidebarHovered,
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  categoryGroups,
  getCategoryIcon,
  categoryCounts,
  userProfile,
  setIsLoginModalOpen,
  logout,
  accentColor,
  setAccentColor,
  THEMES,
  setIsPreferencesModalOpen,
  setIsHelpCenterOpen,
  setIsStatusModalOpen,
  setIsLegalModalOpen,
  setIsBugReportModalOpen,
  setIsAIAssistantOpen,
  setIsShopModalOpen,
  setIsSubmitModalOpen,
  isAIAssistantOpen,
  handleSurpriseMe,
  language,
  setLanguage,
  t
}: SidebarProps) {
  const isExpanded = (isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768) || isSidebarHovered;
  const location = useLocation();
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsSidebarHovered(true);
  };

  const handleMouseLeave = () => {
    setIsSidebarHovered(false);
  };

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        fixed md:sticky top-0 left-0 z-[60] h-screen transition-all duration-300 ease-in-out group shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isSidebarOpen ? (isExpanded ? 'w-64' : 'w-20') : 'w-0 overflow-hidden'}
        ${isDarkMode 
          ? `bg-bg-dark ${isSidebarOpen ? 'border-r border-white/5' : 'border-none'}` 
          : `bg-white ${isSidebarOpen ? 'border-r border-black/5' : 'border-none'}`
        }
      `}
    >
      <div 
        ref={scrollerRef}
        className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              if (setSelectedCategory) setSelectedCategory('All');
              const main = document.querySelector('main');
              if (main) main.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="flex items-center gap-3 group/logo transition-all hover:opacity-80 active:scale-95 cursor-pointer"
            title="Home"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover/logo:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5 text-bg-dark" />
            </div>
            <span className={`font-bold text-xl transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              Play<span className="text-accent">Dravo</span>
            </span>
          </a>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Content */}
        <div className="flex-1 px-4 py-6 space-y-10">
          {/* Quick Actions Section */}
          <div className="space-y-1">
            <button 
              onClick={handleSurpriseMe}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 bg-accent/10 text-accent hover:bg-accent hover:text-bg-dark group`}
            >
              <div className="shrink-0 w-6 flex justify-center">
                <Dices className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-xs font-semibold tracking-tight transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                {t('randomGames')}
              </span>
            </button>
            <button 
              onClick={() => {
                setIsPreferencesModalOpen(true);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 group`}
            >
              <div className="shrink-0 w-6 flex justify-center">
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-xs font-semibold tracking-tight transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                {t('personalize')}
              </span>
            </button>
            <button 
              onClick={() => {
                setIsShopModalOpen(true);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 group`}
            >
              <div className="shrink-0 w-6 flex justify-center">
                <Coins className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className={`text-xs font-semibold tracking-tight transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                {t('shop')}
              </span>
            </button>
          </div>

          {categoryGroups.map((group, groupIndex) => {
            return (
              <div key={`group-${groupIndex}-${group.title}`} className="space-y-1">
                <div className="space-y-1">
                  {group.items.map((cat, catIndex) => {
                    const isSelected = selectedCategory === cat;
                    const getCategoryUrl = (cat: string) => {
                      if (cat === 'All') return '/';
                      if (cat === 'Favorites') return '/library/favorites';
                      if (cat === 'History') return '/library/history';
                      return `/category/${cat.toLowerCase()}`;
                    };
                    const categoryUrl = getCategoryUrl(cat);
                    
                    return (
                      <Link
                        key={`cat-${groupIndex}-${catIndex}-${cat}`}
                        to={categoryUrl}
                        onClick={() => {
                          // Allow natural navigation to category page, but keep the homepage state clean
                          setSelectedCategory('All');
                          if (window.innerWidth < 768) setIsSidebarOpen(false);
                        }}
                        className={`
                          w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 relative
                          ${isSelected 
                            ? 'bg-accent/10 text-accent' 
                            : (isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black')}
                        `}
                      >
                        {isSelected && (
                          <div className="absolute left-0 w-1 h-6 bg-accent rounded-r-full" />
                        )}
                        <div className="shrink-0 w-6 flex justify-center">
                          {getCategoryIcon(cat)}
                        </div>
                        <span className={`text-xs font-semibold transition-all duration-200 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                          {t(categoryKeyMap[cat] || cat)}
                        </span>
                        {isExpanded && categoryCounts[cat] > 0 && (
                          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-accent text-bg-dark' : 'bg-white/5 text-white/30'}`}>
                            {categoryCounts[cat]}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}


          <div className="space-y-1 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <button 
                onClick={() => setIsPreferencesModalOpen(true)}
                className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'}`}
              >
                <div className="shrink-0 w-6 flex justify-center"><Settings className="w-5 h-5" /></div>
                <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('settings')}</span>
              </button>
              <button 
                onClick={() => setIsHelpCenterOpen(true)}
                className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'}`}
              >
                <div className="shrink-0 w-6 flex justify-center"><HelpCircle className="w-5 h-5" /></div>
                <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('helpCenter')}</span>
              </button>
              <button 
                onClick={() => setIsLegalModalOpen(true)}
                className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'}`}
              >
                <div className="shrink-0 w-6 flex justify-center"><FileText className="w-5 h-5" /></div>
                <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('legal')}</span>
              </button>
              <button 
                onClick={() => setIsBugReportModalOpen(true)}
                className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'}`}
              >
                <div className="shrink-0 w-6 flex justify-center"><Bug className="w-5 h-5" /></div>
                <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('bugReport')}</span>
              </button>
              {userProfile?.role === 'admin' && (
                <button 
                  onClick={() => setIsSubmitModalOpen(true)}
                  className={`md:hidden w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black'}`}
                >
                  <div className="shrink-0 w-6 flex justify-center"><Plus className="w-5 h-5" /></div>
                  <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('submitGameButton')}</span>
                </button>
              )}
              {userProfile?.role === 'admin' && (
                <Link 
                  to="/admin/bug-reports"
                  className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin') ? 'bg-accent/10 text-accent' : (isDarkMode ? 'hover:bg-white/5 text-white/70 hover:text-white' : 'hover:bg-black/5 text-black/70 hover:text-black')}`}
                >
                  <div className="shrink-0 w-6 flex justify-center"><Settings className="w-5 h-5" /></div>
                  <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('adminPanel')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Language Switcher for Mobile/Sidebar */}
          <div className={`mt-4 px-4 py-4 border-t transition-all duration-200 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex justify-start">
              <LanguageSwitcher 
                currentLanguage={language}
                setLanguage={setLanguage}
                isDarkMode={isDarkMode}
                align="left"
                minimal={!isExpanded}
                variant={isExpanded ? 'grid' : 'dropdown'}
              />
            </div>
          </div>
        </div>

        {/* User Profile / Auth */}
        <div className={`p-4 border-t transition-all duration-200 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          {userProfile ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 ${isExpanded ? 'bg-white/5' : ''}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-accent/20">
                  <img src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid}`} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className={`transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                  <p className="text-sm font-bold tracking-tight truncate w-32">{userProfile.displayName}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-semibold text-accent uppercase">{userProfile.role}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={logout}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-red-500/10 text-red-500/60 hover:text-red-500' : 'hover:bg-red-500/10 text-red-500/60 hover:text-red-500'}`}
              >
                <div className="shrink-0 w-6 flex justify-center"><LogOut className="w-4 h-4" /></div>
                <span className={`text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full group/login relative overflow-hidden bg-accent text-white font-bold py-3 text-sm rounded-xl transition-all flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/login:translate-x-[100%] transition-transform duration-1000" />
              <LogIn className="w-4 h-4 relative z-10" />
              <span className={`relative z-10 text-xs font-semibold transition-all duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});
