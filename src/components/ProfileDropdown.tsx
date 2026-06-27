import React, { useRef, useEffect, memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Shield,
  Bell,
  LogOut,
  Edit3,
  ChevronRight,
  X,
  Star,
  Clock,
  Gamepad2,
  Zap,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { UserProfile } from '../types';
import { type ReplitUser } from '../hooks/useReplitAuth';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: ReplitUser | null;
  userProfile: UserProfile | null;
  isDarkMode: boolean;
  logout: () => void;
  openAccountSettings: (view?: 'main' | 'email' | 'password' | 'logout-all' | 'delete' | 'notifications' | 'privacy') => void;
  setIsUsernameModalOpen: (open: boolean) => void;
  setIsHelpCenterOpen: (open: boolean) => void;
  setSelectedCategory?: (category: string) => void;
  t: (key: any) => string;
}

function getLevel(xp: number) {
  return Math.floor(xp / 1000) + 1;
}
function getXpProgress(xp: number) {
  return ((xp % 1000) / 1000) * 100;
}
function getRank(level: number) {
  if (level >= 50) return { label: 'Legend', color: 'text-yellow-400', bg: 'bg-yellow-400/20 border-yellow-400/30' };
  if (level >= 20) return { label: 'Elite', color: 'text-purple-400', bg: 'bg-purple-400/20 border-purple-400/30' };
  if (level >= 10) return { label: 'Pro', color: 'text-blue-400', bg: 'bg-blue-400/20 border-blue-400/30' };
  if (level >= 5) return { label: 'Veteran', color: 'text-green-400', bg: 'bg-green-400/20 border-green-400/30' };
  return { label: 'Beginner', color: 'text-white/50', bg: 'bg-white/10 border-white/10' };
}

export const ProfileDropdown = memo(function ProfileDropdown({
  isOpen,
  onClose,
  user,
  userProfile,
  isDarkMode,
  logout,
  openAccountSettings,
  setIsUsernameModalOpen,
  setIsHelpCenterOpen,
  setSelectedCategory,
  t
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.getBoundingClientRect().width === 0) return;
      const target = event.target as Element;
      const isProfileButton = target.closest('button[aria-label="User Profile"]');
      if (!dropdownRef.current.contains(target as Node) && !isProfileButton) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen, onClose, isMobile]);

  if (!user) return null;

  const xp = userProfile?.xp || 0;
  const level = getLevel(xp);
  const xpProgress = getXpProgress(xp);
  const rank = getRank(level);
  const favorites = userProfile?.favorites?.length || 0;
  const sessions = userProfile?.playHistory?.length || 0;
  const topGenre = userProfile?.preferredCategories?.[0] || 'Arcade';
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Nov 2023';
  const avatarUrl = userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;
  const displayName = userProfile?.displayName || user?.username || 'Gamer';

  const menuItems = [
    {
      icon: <Bell className="w-4 h-4" />,
      label: t('notificationPrefs') || 'Notifications',
      onClick: () => { openAccountSettings('notifications'); onClose(); }
    },
    {
      icon: <Shield className="w-4 h-4" />,
      label: t('privacyPrefs') || 'Privacy',
      onClick: () => { openAccountSettings('privacy'); onClose(); }
    },
    {
      icon: <LogOut className="w-4 h-4 text-red-400" />,
      label: t('logout') || 'Log out',
      onClick: () => { logout(); onClose(); },
      danger: true
    },
  ];

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Gradient Hero Header */}
      <div className="relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-purple-700/30 to-indigo-800/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.3),transparent_60%)]" />

        {/* Close button */}
        <div className="relative flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="relative px-5 pb-5 pt-2">
          <div className="flex items-end gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg shadow-black/30">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0f0f1a] rounded-full" />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-white font-bold text-base sm:text-lg truncate">{displayName}</h3>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${rank.bg} ${rank.color}`}>
                  {rank.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white/60">Lv.{level}</span>
                <span className="text-white/20">·</span>
                <span className="text-xs text-white/40">{xp.toLocaleString()} XP total</span>
              </div>
              {/* XP bar */}
              <div>
                <div className="flex justify-between text-[9px] font-bold text-white/40 mb-1 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>{(xp % 1000)} / 1000</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Stats grid */}
        <div className="px-4 pt-4 pb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => { navigate('/library/favorites'); onClose(); }}
            className={`p-3 rounded-2xl border flex flex-col items-start transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isDarkMode ? 'bg-white/5 border-white/8 hover:bg-white/10' : 'bg-black/5 border-black/8 hover:bg-black/10'
            }`}
          >
            <Star className="w-4 h-4 text-yellow-400 mb-1.5" />
            <span className="text-lg font-black text-accent leading-none">{favorites}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>Favorites</span>
          </button>
          <button
            onClick={() => { navigate('/library/history'); onClose(); }}
            className={`p-3 rounded-2xl border flex flex-col items-start transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isDarkMode ? 'bg-white/5 border-white/8 hover:bg-white/10' : 'bg-black/5 border-black/8 hover:bg-black/10'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400 mb-1.5" />
            <span className={`text-lg font-black leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>{sessions}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>Sessions</span>
          </button>
          <div className={`p-3 rounded-2xl border flex flex-col items-start ${isDarkMode ? 'bg-white/5 border-white/8' : 'bg-black/5 border-black/8'}`}>
            <Gamepad2 className="w-4 h-4 text-green-400 mb-1.5" />
            <span className={`text-sm font-black leading-none truncate w-full ${isDarkMode ? 'text-white' : 'text-black'}`}>{topGenre}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>Top Genre</span>
          </div>
          <div className={`p-3 rounded-2xl border flex flex-col items-start ${isDarkMode ? 'bg-white/5 border-white/8' : 'bg-black/5 border-black/8'}`}>
            <TrendingUp className="w-4 h-4 text-pink-400 mb-1.5" />
            <span className={`text-sm font-black leading-none ${isDarkMode ? 'text-white' : 'text-black'}`}>{memberSince}</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-50 ${isDarkMode ? 'text-white' : 'text-black'}`}>Member Since</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="px-4 pb-3 flex gap-2.5">
          <button
            onClick={() => { openAccountSettings('main'); onClose(); }}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage Account
          </button>
          <button
            onClick={() => { setIsUsernameModalOpen(true); onClose(); }}
            className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 shrink-0 ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'
            }`}
            title="Edit username"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className={`mx-4 mb-3 h-px ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />

        {/* Menu items */}
        <div className="px-3 pb-4 space-y-0.5">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-3 py-3.5 rounded-2xl transition-all group ${
                item.danger
                  ? isDarkMode ? 'hover:bg-red-500/8' : 'hover:bg-red-50'
                  : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all ${
                  item.danger
                    ? 'bg-red-500/10'
                    : isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-black/5 group-hover:bg-black/10'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-sm font-semibold transition-all ${
                  item.danger ? 'text-red-400' : isDarkMode ? 'text-white/75 group-hover:text-white' : 'text-black/75 group-hover:text-black'
                }`}>
                  {item.label}
                </span>
              </div>
              <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5 transition-all ${isDarkMode ? 'text-white' : 'text-black'}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  /* ── MOBILE: bottom sheet ────────────────────────────────────────── */
  if (isMobile) {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-[210] rounded-t-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col ${
                isDarkMode ? 'bg-[#0f0f1a] border-t border-white/10' : 'bg-white border-t border-black/10'
              }`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/20'}`} />
              </div>
              {panelContent}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  /* ── DESKTOP / TABLET: dropdown panel ───────────────────────────── */
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="desktop-dropdown"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute top-full right-0 mt-3 w-[340px] lg:w-[360px] max-h-[calc(100vh-90px)] overflow-hidden origin-top-right z-[110] rounded-3xl border shadow-2xl shadow-black/40 flex flex-col ${
              isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-black/10'
            }`}
          >
            {panelContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
