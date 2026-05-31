import { memo, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Settings, HelpCircle, FileText, Bug, LogOut, LogIn } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import { UserProfile, Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SidebarIcon } from '../lib/sidebarIcons';
import { useSidebar, useSidebarOpen } from '../contexts/SidebarContext';

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
};

function categoryUrl(cat: string): string {
  if (cat === 'All') return '/';
  if (cat === 'Favorites') return '/library/favorites';
  if (cat === 'History') return '/library/history';
  return `/category/${cat.toLowerCase()}`;
}

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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
              setSelectedCategory('All');
              document.querySelector('main')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              closeMobile();
            }}
            className="sidebar-brand max-md:hidden"
            title="Home"
          >
            <PlayDravoMark size={32} />
            {isSidebarOpen && (
              <span className="sidebar-brand-text">
                Play<span className="text-accent">Dravo</span>
              </span>
            )}
          </a>
          <span className="md:hidden flex-1" aria-hidden />
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
          <div className="sidebar-block">
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
                    location.pathname === categoryUrl(cat);
                  return (
                    <Link
                      key={`sidebar-${cat}`}
                      to={categoryUrl(cat)}
                      onClick={() => {
                        setSelectedCategory(cat === 'All' ? 'All' : cat);
                        closeMobile();
                      }}
                      className={navItemClass(isActive, isDarkMode)}
                      title={label}
                      data-tooltip={label}
                    >
                      <SidebarIcon name={cat} active={isActive} />
                      <span className="sidebar-label">{label}</span>
                    </Link>
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
            <button
              type="button"
              onClick={() => {
                setIsPreferencesModalOpen(true);
                closeMobile();
              }}
              className={navItemClass(false, isDarkMode)}
              data-tooltip={t('personalize')}
            >
              <span className="sidebar-icon">
                <Settings className="w-[15px] h-[15px]" strokeWidth={1.85} />
              </span>
              <span className="sidebar-label">{t('personalize')}</span>
            </button>
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
