import { memo, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Settings, HelpCircle, FileText, Bug, LogOut, LogIn, Sparkles } from 'lucide-react';
import { GameDravoLogo } from './GameDravoLogo';
import { UserProfile, Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SidebarIcon } from '../lib/sidebarIcons';
import { SidebarNavLink } from './SidebarNavItem';
import { useSidebar, useSidebarOpen } from '../contexts/SidebarContext';
import { getCategoryPath } from '../utils/categoryRoutes';

interface SidebarProps {
  isDarkMode: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categoryGroups: { title: string; items: string[] }[];
  userProfile: UserProfile | null;
  setIsLoginModalOpen: (open: boolean) => void;
  logout: () => void;
  setIsPreferencesModalOpen: (open: boolean) => void;
  setIsSubmitModalOpen: (open: boolean) => void;
  handleSurpriseMe: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const categoryKeyMap: Record<string, string> = {
  All: 'all',
  Favorites: 'favorites',
  Recommended: 'recommended',
  History: 'history',
  Trending: 'trending',
  'Mobile Games': 'mobileGames',
  'Best On Mobile': 'bestOnMobile',
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
  '1 Player': 'onePlayer',
  '2 Player': 'twoPlayer',
  '3 Player': 'threePlayer',
  '4 Player': 'fourPlayer',
};

const navItemClass = (active: boolean, isDarkMode: boolean) =>
  `sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''} ${
    isDarkMode ? 'sidebar-nav-item--dark' : 'sidebar-nav-item--light'
  }`;

export const Sidebar = memo(function Sidebar({
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  categoryGroups,
  userProfile,
  setIsLoginModalOpen,
  logout,
  setIsPreferencesModalOpen,
  handleSurpriseMe,
  language,
  setLanguage,
  t,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isSidebarOpen = useSidebarOpen();
  const { setOpen } = useSidebar();
  const isMobileOpen = isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (window.innerWidth < 768) setOpen(false);
  }, [location.pathname, setOpen]);

  const closeMobile = () => {
    if (window.innerWidth < 768) setOpen(false);
  };

  return (
    <aside
      className={`sidebar-shell ${isDarkMode ? 'sidebar-shell--dark' : 'sidebar-shell--light'} ${
        isSidebarOpen ? 'sidebar-shell--open' : 'sidebar-shell--closed'
      }`}
    >
      <div ref={scrollerRef} className="sidebar-scroll">
        <div className="sidebar-brand-row">
          <GameDravoLogo
            size="sm"
            showWordmark={isSidebarOpen || isMobileOpen}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setSelectedCategory('All');
              document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              closeMobile();
            }}
            className="sidebar-brand"
          />
          <span className="sidebar-brand-spacer" aria-hidden />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="sidebar-close md:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-block sidebar-top-actions">
            <button
              type="button"
              onClick={() => {
                setIsPreferencesModalOpen(true);
                closeMobile();
              }}
              className="sidebar-personalize"
              data-tooltip={t('personalize')}
            >
              <span className="sidebar-personalize-glow" aria-hidden />
              <span className="sidebar-icon sidebar-personalize-icon">
                <Sparkles className="w-[15px] h-[15px]" strokeWidth={2.1} />
              </span>
              <span className="sidebar-label">{t('personalize')}</span>
            </button>

            <button
              type="button"
              onClick={handleSurpriseMe}
              className="sidebar-cta"
              data-tooltip={t('randomGames')}
            >
              <SidebarIcon name="Trending" active />
              <span className="sidebar-label">{t('randomGames')}</span>
            </button>
          </div>

          {categoryGroups.map((group, groupIndex) => (
            <div key={`sidebar-group-${groupIndex}`} className="sidebar-block">
              {(isSidebarOpen || isMobileOpen) && group.title !== 'Main Menu' && (
                <p className="sidebar-group-label">{group.title}</p>
              )}
              <nav className="sidebar-nav" aria-label={group.title}>
                {group.items.map((cat) => {
                  const label = t(categoryKeyMap[cat] || cat);
                  const isActive =
                    selectedCategory === cat ||
                    (cat === 'All' && location.pathname === '/') ||
                    location.pathname === getCategoryPath(cat);
                  return (
                    <SidebarNavLink
                      key={`sidebar-${cat}`}
                      to={getCategoryPath(cat)}
                      label={label}
                      cat={cat}
                      isActive={isActive}
                      isDarkMode={isDarkMode}
                      onNavigate={() => {
                        setSelectedCategory(cat === 'All' ? 'All' : cat);
                        closeMobile();
                      }}
                    />
                  );
                })}
              </nav>
            </div>
          ))}

          <div className="sidebar-block sidebar-block--divider">
            <nav className="sidebar-nav" aria-label="Support">
              <Link
                to="/support"
                onClick={closeMobile}
                className={navItemClass(location.pathname.startsWith('/support'), isDarkMode)}
                data-tooltip={t('helpCenter')}
              >
                <span className="sidebar-icon">
                  <HelpCircle className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className="sidebar-label">{t('helpCenter')}</span>
              </Link>
              <Link
                to="/terms"
                onClick={closeMobile}
                className={navItemClass(location.pathname === '/terms', isDarkMode)}
                data-tooltip={t('legal')}
              >
                <span className="sidebar-icon">
                  <FileText className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className="sidebar-label">{t('legal')}</span>
              </Link>
              <Link
                to="/report-bug"
                onClick={closeMobile}
                className={navItemClass(location.pathname === '/report-bug', isDarkMode)}
                data-tooltip={t('bugReport')}
              >
                <span className="sidebar-icon">
                  <Bug className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className="sidebar-label">{t('bugReport')}</span>
              </Link>
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin/bug-reports"
                  className={navItemClass(location.pathname.startsWith('/admin'), isDarkMode)}
                  data-tooltip={t('adminPanel')}
                >
                  <span className="sidebar-icon">
                    <Settings className="w-[15px] h-[15px]" strokeWidth={1.85} />
                  </span>
                  <span className="sidebar-label">{t('adminPanel')}</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="sidebar-block sidebar-block--divider">
            <LanguageSwitcher
              currentLanguage={language}
              setLanguage={setLanguage}
              isDarkMode={isDarkMode}
              align="left"
              minimal={!isSidebarOpen && !isMobileOpen}
              variant={isSidebarOpen || isMobileOpen ? 'grid' : 'dropdown'}
            />
          </div>
        </div>

        <div className="sidebar-footer">
          {userProfile ? (
            <>
              {(isSidebarOpen || isMobileOpen) && (
                <div className="sidebar-profile">
                  <img
                    src={userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid}`}
                    alt=""
                    className="sidebar-profile-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <div className="sidebar-profile-meta">
                    <p className="sidebar-profile-name">{userProfile.displayName}</p>
                    <span className="sidebar-profile-role">{userProfile.role}</span>
                  </div>
                </div>
              )}
              <button type="button" onClick={logout} className="sidebar-logout" data-tooltip={t('logout')}>
                <LogOut className="w-4 h-4" />
                <span className="sidebar-label">{t('logout')}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="sidebar-login"
              data-tooltip={t('login')}
            >
              <LogIn className="w-4 h-4" />
              <span className="sidebar-label">{t('login')}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});
