import React, { useRef, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { X, Settings, HelpCircle, FileText, Bug, LogOut, LogIn, Dices, Plus } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SidebarIcon } from '../lib/sidebarIcons';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
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
};

function categoryUrl(cat: string): string {
  if (cat === 'All') return '/';
  if (cat === 'Favorites') return '/library/favorites';
  if (cat === 'History') return '/library/history';
  return `/category/${cat.toLowerCase()}`;
}

export const Sidebar = memo(function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isDarkMode,
  selectedCategory,
  setSelectedCategory,
  categoryGroups,
  userProfile,
  setIsLoginModalOpen,
  logout,
  setIsPreferencesModalOpen,
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
  const showLabels = mobileExpanded;

  const navItemClass = (active: boolean) =>
    `sidebar-nav-item ${active ? 'sidebar-nav-item--active' : ''} ${isDarkMode ? 'sidebar-nav-item--dark' : 'sidebar-nav-item--light'}`;

  return (
    <aside
      className={`sidebar-shell group/sidebar ${isDarkMode ? 'sidebar-shell--dark' : 'sidebar-shell--light'} ${
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
            }}
            className="sidebar-brand"
            title="Home"
          >
            <span className="sidebar-brand-mark">
              <Dices className="w-4 h-4 text-bg-dark" />
            </span>
            <span className={`sidebar-brand-text ${showLabels ? 'sidebar-brand-text--visible' : ''}`}>
              Play<span className="text-accent">Dravo</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close md:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="sidebar-body">
          <div className="sidebar-block">
            <button type="button" onClick={handleSurpriseMe} className="sidebar-cta">
              <SidebarIcon name="Trending" active />
              <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                {t('randomGames')}
              </span>
            </button>
          </div>

          {categoryGroups.map((group, groupIndex) => (
            <div key={`sidebar-group-${groupIndex}`} className="sidebar-block">
              {group.title !== 'Main Menu' && (
                <p className={`sidebar-group-label ${showLabels ? 'sidebar-group-label--visible' : ''}`}>
                  {group.title}
                </p>
              )}
              <nav className="sidebar-nav" aria-label={group.title}>
                {group.items.map((cat) => {
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
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      className={navItemClass(isActive)}
                      title={t(categoryKeyMap[cat] || cat)}
                    >
                      <SidebarIcon name={cat} active={isActive} />
                      <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                        {t(categoryKeyMap[cat] || cat)}
                      </span>
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
                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                className={navItemClass(location.pathname.startsWith('/support'))}
              >
                <span className="sidebar-icon">
                  <HelpCircle className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                  {t('helpCenter')}
                </span>
              </Link>
              <Link
                to="/terms"
                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                className={navItemClass(location.pathname === '/terms')}
              >
                <span className="sidebar-icon">
                  <FileText className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                  {t('legal')}
                </span>
              </Link>
              <Link
                to="/report-bug"
                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                className={navItemClass(location.pathname === '/report-bug')}
              >
                <span className="sidebar-icon">
                  <Bug className="w-[15px] h-[15px]" strokeWidth={1.85} />
                </span>
                <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                  {t('bugReport')}
                </span>
              </Link>
              {userProfile?.role === 'admin' && (
                <Link
                  to="/admin/bug-reports"
                  className={navItemClass(location.pathname.startsWith('/admin'))}
                >
                  <span className="sidebar-icon">
                    <Settings className="w-[15px] h-[15px]" strokeWidth={1.85} />
                  </span>
                  <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                    {t('adminPanel')}
                  </span>
                </Link>
              )}
            </nav>
          </div>

          <div className="sidebar-block sidebar-block--divider">
            <button
              type="button"
              onClick={() => {
                setIsPreferencesModalOpen(true);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={navItemClass(false)}
            >
              <span className="sidebar-icon">
                <Settings className="w-[15px] h-[15px]" strokeWidth={1.85} />
              </span>
              <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                {t('personalize')}
              </span>
            </button>
            <LanguageSwitcher
              currentLanguage={language}
              setLanguage={setLanguage}
              isDarkMode={isDarkMode}
              align="left"
              minimal={!showLabels}
              variant={showLabels ? 'grid' : 'dropdown'}
            />
          </div>
        </div>

        <div className="sidebar-footer">
          {userProfile ? (
            <>
              <div className={`sidebar-profile ${showLabels ? 'sidebar-profile--visible' : ''}`}>
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
              <button type="button" onClick={logout} className="sidebar-logout">
                <LogOut className="w-4 h-4" />
                <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                  {t('logout')}
                </span>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsLoginModalOpen(true)} className="sidebar-login">
              <LogIn className="w-4 h-4" />
              <span className={showLabels ? 'sidebar-label sidebar-label--visible' : 'sidebar-label'}>
                {t('login')}
              </span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});
