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
  LogIn,
  Gamepad2,
  Sparkles,
  Dices,
  Plus,
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
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
  setIsSubmitModalOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  handleSurpriseMe: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: any) => string;
}

const categoryKeyMap: Record<string, string> = {
  All: 'all',
  Favorites: 'favorites',
  Recommended: 'recommended',
  History: 'history',
  Trending: 'trending',
  Mods: 'mods',
  Action: 'action',
  Adventure: 'adventure',
  Arcade: 'arcade',
  Casual: 'casual',
  Horror: 'horror',
  Puzzle: 'puzzle',
  Simulator: 'simulator',
  Obby: 'obby',
  Sports: 'sports',
  Strategy: 'strategy',
  Multiplayer: 'multiplayer',
  '2 Player': 'twoPlayer',
  '3 Player': 'threePlayer',
  '4 Player': 'fourPlayer',
  'Main Menu': 'mainMenu',
  Categories: 'categories',
};

const labelClass =
  'text-xs font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-100 ease-out max-w-0 opacity-0 md:group-hover/sidebar:max-w-[140px] md:group-hover/sidebar:opacity-100';

const mobileLabelClass = (open: boolean) =>
  `text-xs font-medium whitespace-nowrap transition-opacity duration-100 ${open ? 'opacity-100 max-w-[140px]' : 'max-w-0 opacity-0 md:max-w-0 md:opacity-0'}`;

export const Sidebar = memo(function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  categoryGroups,
  getCategoryIcon,
  categoryCounts,
  userProfile,
  setIsLoginModalOpen,
  logout,
  setIsPreferencesModalOpen,
  setIsHelpCenterOpen,
  setIsLegalModalOpen,
  setIsBugReportModalOpen,
  setIsSubmitModalOpen,
  handleSurpriseMe,
  language,
  setLanguage,
  t,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const mobileExpanded = isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <aside
      className={`
        group/sidebar peer/sidebar fixed md:sticky top-0 left-0 z-[60] h-screen shrink-0
        transition-[width,transform] duration-150 ease-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 overflow-hidden'}
        md:translate-x-0 md:w-14 md:hover:w-56 md:overflow-visible
        ${isDarkMode ? 'bg-bg-dark border-r border-white/5' : 'bg-white border-r border-black/5'}
      `}
    >
      <div ref={scrollerRef} className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col">
        <div className="px-2.5 py-2.5 flex items-center justify-between shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setSelectedCategory('All');
              document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className="flex items-center gap-2.5 hover:opacity-90 active:scale-[0.98] cursor-pointer min-w-0"
            title="Home"
          >
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <Gamepad2 className="w-5 h-5 text-bg-dark" />
            </div>
            <span
              className={`font-bold text-lg truncate ${mobileExpanded ? 'opacity-100' : labelClass} ${isDarkMode ? 'text-white' : 'text-black'}`}
            >
              Play<span className="text-accent">Dravo</span>
            </span>
          </a>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-2 py-2 space-y-3">
          <div className="space-y-0.5">
            <button
              onClick={handleSurpriseMe}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 bg-accent/10 text-accent hover:bg-accent hover:text-bg-dark"
            >
              <div className="shrink-0 w-7 flex justify-center">
                <Dices className="w-4 h-4" />
              </div>
              <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('randomGames')}</span>
            </button>
            <button
              onClick={() => {
                setIsPreferencesModalOpen(true);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            >
              <div className="shrink-0 w-7 flex justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('personalize')}</span>
            </button>
          </div>

          {categoryGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}-${group.title}`} className="space-y-0.5">
              {group.title !== 'Main Menu' && (
                <p
                  className={`px-2 pt-2 pb-0.5 text-[9px] font-bold uppercase tracking-widest truncate ${
                    mobileExpanded
                      ? 'opacity-100'
                      : 'md:opacity-0 md:max-h-0 md:group-hover/sidebar:opacity-100 md:group-hover/sidebar:max-h-6'
                  } transition-opacity duration-100 ${isDarkMode ? 'text-white/30' : 'text-black/35'}`}
                >
                  {group.title}
                </p>
              )}
              {group.items.map((cat, catIndex) => {
                const isSelected = selectedCategory === cat;
                const categoryUrl =
                  cat === 'All'
                    ? '/'
                    : cat === 'Favorites'
                      ? '/library/favorites'
                      : cat === 'History'
                        ? '/library/history'
                        : `/category/${cat.toLowerCase()}`;

                return (
                  <Link
                    key={`cat-${groupIndex}-${catIndex}-${cat}`}
                    to={categoryUrl}
                    onClick={() => {
                      setSelectedCategory('All');
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-75 relative
                      ${
                        isSelected
                          ? 'bg-accent/15 text-accent font-semibold shadow-[inset_0_0_0_1px_rgba(157,92,255,0.2)]'
                          : isDarkMode
                            ? 'hover:bg-white/[0.06] text-white/65 hover:text-white'
                            : 'hover:bg-black/[0.04] text-black/65 hover:text-black'
                      }
                    `}
                  >
                    {isSelected && <div className="absolute left-0 w-0.5 h-4 bg-accent rounded-r-full" />}
                    <div className="shrink-0 w-7 flex justify-center">{getCategoryIcon(cat)}</div>
                    <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>
                      {t(categoryKeyMap[cat] || cat)}
                    </span>
                    {(mobileExpanded || false) && categoryCounts[cat] > 0 && (
                      <span
                        className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full md:hidden ${isSelected ? 'bg-accent text-bg-dark' : 'bg-white/5 text-white/30'}`}
                      >
                        {categoryCounts[cat]}
                      </span>
                    )}
                    <span
                      className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden md:inline-flex md:opacity-0 md:group-hover/sidebar:opacity-100 transition-opacity duration-100 ${
                        isSelected ? 'bg-accent text-bg-dark' : 'bg-white/5 text-white/30'
                      } ${categoryCounts[cat] > 0 ? '' : 'invisible'}`}
                    >
                      {categoryCounts[cat] || 0}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}

          <div className="space-y-0.5 pt-2 border-t border-white/5">
            <Link
              to="/support"
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${isDarkMode ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
            >
              <div className="shrink-0 w-7 flex justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('helpCenter')}</span>
            </Link>
            <Link
              to="/terms"
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${isDarkMode ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
            >
              <div className="shrink-0 w-7 flex justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('legal')}</span>
            </Link>
            <Link
              to="/report-bug"
              onClick={() => {
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${isDarkMode ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
            >
              <div className="shrink-0 w-7 flex justify-center">
                <Bug className="w-4 h-4" />
              </div>
              <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('bugReport')}</span>
            </Link>
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className={`md:hidden w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${isDarkMode ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
              >
                <div className="shrink-0 w-7 flex justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className={mobileLabelClass(true)}>{t('submitGameButton')}</span>
              </button>
            )}
            {userProfile?.role === 'admin' && (
              <Link
                to="/admin/bug-reports"
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 ${location.pathname.startsWith('/admin') ? 'bg-accent/10 text-accent' : isDarkMode ? 'hover:bg-white/5 text-white/70' : 'hover:bg-black/5 text-black/70'}`}
              >
                <div className="shrink-0 w-7 flex justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('adminPanel')}</span>
              </Link>
            )}
          </div>

          <div className={`pt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <LanguageSwitcher
              currentLanguage={language}
              setLanguage={setLanguage}
              isDarkMode={isDarkMode}
              align="left"
              minimal={!mobileExpanded}
              variant={mobileExpanded ? 'grid' : 'dropdown'}
            />
          </div>
        </div>

        <div className={`p-2.5 border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          {userProfile ? (
            <div className="space-y-1.5">
              <div className={`flex items-center gap-2 p-1.5 rounded-lg ${mobileExpanded ? 'bg-white/5' : 'md:group-hover/sidebar:bg-white/5'}`}>
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-accent/20">
                  <img
                    src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className={`min-w-0 ${mobileExpanded ? 'opacity-100' : labelClass}`}>
                  <p className="text-sm font-bold truncate">{userProfile.displayName}</p>
                  <span className="text-[9px] font-semibold text-accent uppercase">{userProfile.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 text-red-500/70 hover:text-red-500 hover:bg-red-500/10`}
              >
                <div className="shrink-0 w-7 flex justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className={mobileExpanded ? mobileLabelClass(true) : labelClass}>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-accent text-white font-bold py-2 text-sm rounded-lg transition-colors duration-100 hover:brightness-110 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span className={mobileExpanded ? '' : labelClass}>{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});
