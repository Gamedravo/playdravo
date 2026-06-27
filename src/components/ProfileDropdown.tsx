import React, { useRef, useEffect, memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Shield, Bell, LogOut, Edit3, ChevronRight, X,
  Star, Clock, Gamepad2, TrendingUp, Zap
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

function getLevel(xp: number) { return Math.floor(xp / 1000) + 1; }
function getXpProgress(xp: number) { return ((xp % 1000) / 1000) * 100; }
function getRank(level: number) {
  if (level >= 50) return { label: 'Legend',   color: 'text-yellow-400', bg: 'bg-yellow-400/15 border-yellow-400/30' };
  if (level >= 20) return { label: 'Elite',    color: 'text-purple-300', bg: 'bg-purple-400/15 border-purple-400/30' };
  if (level >= 10) return { label: 'Pro',      color: 'text-blue-300',   bg: 'bg-blue-400/15 border-blue-400/30' };
  if (level >= 5)  return { label: 'Veteran',  color: 'text-green-300',  bg: 'bg-green-400/15 border-green-400/30' };
  return { label: 'Beginner', color: 'text-white/50', bg: 'bg-white/8 border-white/15' };
}

/* ─── Mobile bottom-sheet ─────────────────────────────────────────────────── */
function MobileSheet({
  isOpen, onClose, user, userProfile, isDarkMode, logout,
  openAccountSettings, setIsUsernameModalOpen, t
}: ProfileDropdownProps) {
  const navigate = useNavigate();

  const xp          = userProfile?.xp || 0;
  const level       = getLevel(xp);
  const xpProgress  = getXpProgress(xp);
  const rank        = getRank(level);
  const favorites   = userProfile?.favorites?.length || 0;
  const sessions    = userProfile?.playHistory?.length || 0;
  const topGenre    = userProfile?.preferredCategories?.[0] || 'Arcade';
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Nov 2023';
  const avatarUrl   = userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user!.id}`;
  const displayName = userProfile?.displayName || user?.username || 'Gamer';

  const navItems = [
    { icon: <Bell   className="w-4 h-4" />,  label: t('notificationPrefs') || 'Notifications', onClick: () => { openAccountSettings('notifications'); onClose(); } },
    { icon: <Shield className="w-4 h-4" />,  label: t('privacyPrefs')      || 'Privacy',       onClick: () => { openAccountSettings('privacy');       onClose(); } },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mob-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-[6px] z-[200]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sheet — anchored to bottom, never taller than 90dvh */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mob-sheet"
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0,      opacity: 1   }}
            exit={{   y: '100%', opacity: 0   }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-[210] flex flex-col"
            style={{ maxHeight: '90dvh' }}
          >
            <div
              className="w-full rounded-t-[28px] flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(180deg,#131224 0%,#0d0d1c 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderBottom: 'none',
                boxShadow: '0 -8px 48px rgba(0,0,0,0.6), 0 -2px 0 rgba(124,58,237,0.18)',
                maxHeight: '90dvh',
              }}
            >
              {/* ── Drag handle ─────────────────────────────────── */}
              <div className="flex justify-center pt-3 pb-0 shrink-0">
                <div className="w-9 h-[3px] rounded-full bg-white/20" />
              </div>

              {/* ── STICKY HEADER: avatar + XP ──────────────────── */}
              <div className="relative shrink-0 px-4 pt-3 pb-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-28 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />

                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/70" />
                </button>

                {/* Avatar row */}
                <div className="flex items-center gap-3 relative">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/15 shadow-lg shadow-black/40">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-[#131224] rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0 pr-10">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-[15px] leading-tight truncate">{displayName}</span>
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-widest ${rank.bg} ${rank.color}`}>
                        {rank.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3 h-3 text-violet-400" />
                      <span className="text-[11px] font-bold text-violet-300">Lv.{level}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-[11px] text-white/35">{xp.toLocaleString()} XP</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/35">Progress to Lv.{level + 1}</span>
                        <span className="text-[9px] font-bold text-white/50">{xp % 1000}/1000</span>
                      </div>
                      <div className="h-[5px] w-full rounded-full bg-white/8 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg,#7C3AED,#818CF8)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SCROLLABLE MIDDLE: stats + nav ──────────────── */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain min-h-0"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Stats 2×2 */}
                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { navigate('/library/favorites'); onClose(); }}
                    className="flex items-center gap-3 p-3 rounded-2xl active:bg-white/8 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(250,204,21,0.12)' }}>
                      <Star className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-[18px] font-black text-violet-400 leading-none">{favorites}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 mt-0.5">Favorites</div>
                    </div>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => { navigate('/library/history'); onClose(); }}
                    className="flex items-center gap-3 p-3 rounded-2xl active:bg-white/8 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(96,165,250,0.12)' }}>
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-[18px] font-black text-white leading-none">{sessions}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 mt-0.5">Sessions</div>
                    </div>
                  </motion.button>

                  <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(52,211,153,0.12)' }}>
                      <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-[13px] font-black text-white leading-tight truncate">{topGenre}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 mt-0.5">Top Genre</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(244,114,182,0.12)' }}>
                      <TrendingUp className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-[13px] font-black text-white leading-tight">{memberSince}</div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 mt-0.5">Member Since</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-4 mb-1 h-px bg-white/5" />

                {/* Nav items (non-destructive only) */}
                <div className="px-3 pb-3">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={item.onClick}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-2xl mb-0.5 active:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5">
                          {item.icon}
                        </div>
                        <span className="text-[13px] font-semibold text-white/70">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20" />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ── PINNED FOOTER: primary actions + logout ──────── */}
              <div
                className="shrink-0 px-4 pt-3 border-t border-white/5"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
              >
                {/* Manage Account + Edit username row */}
                <div className="flex gap-2 mb-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { openAccountSettings('main'); onClose(); }}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-[13px] uppercase tracking-widest text-white"
                    style={{ background: 'linear-gradient(135deg,#7C3AED,#6366F1)', boxShadow: '0 4px 20px rgba(124,58,237,0.30)' }}
                  >
                    <Settings className="w-4 h-4" />
                    Manage Account
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setIsUsernameModalOpen(true); onClose(); }}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                    title="Edit username"
                  >
                    <Edit3 className="w-4 h-4 text-white/70" />
                  </motion.button>
                </div>

                {/* Logout — full width, always visible */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { logout(); onClose(); }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl font-bold text-[13px] text-red-400 transition-colors active:bg-red-500/10"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout') || 'Log out'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Desktop / tablet dropdown ───────────────────────────────────────────── */
function DesktopDropdown({
  isOpen, onClose, user, userProfile, isDarkMode, logout,
  openAccountSettings, setIsUsernameModalOpen, t
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate    = useNavigate();

  const xp          = userProfile?.xp || 0;
  const level       = getLevel(xp);
  const xpProgress  = getXpProgress(xp);
  const rank        = getRank(level);
  const favorites   = userProfile?.favorites?.length || 0;
  const sessions    = userProfile?.playHistory?.length || 0;
  const topGenre    = userProfile?.preferredCategories?.[0] || 'Arcade';
  const memberSince = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : 'Nov 2023';
  const avatarUrl   = userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user!.id}`;
  const displayName = userProfile?.displayName || user?.username || 'Gamer';

  useEffect(() => {
    const handler = (e: MouseEvent | PointerEvent) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.getBoundingClientRect().width === 0) return;
      const target = e.target as Element;
      if (!dropdownRef.current.contains(target) && !target.closest('button[aria-label="User Profile"]')) onClose();
    };
    if (isOpen) document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [isOpen, onClose]);

  const menuItems = [
    { icon: <Bell   className="w-4 h-4" />,               label: t('notificationPrefs') || 'Notifications', onClick: () => { openAccountSettings('notifications'); onClose(); } },
    { icon: <Shield className="w-4 h-4" />,               label: t('privacyPrefs')      || 'Privacy',       onClick: () => { openAccountSettings('privacy');       onClose(); } },
    { icon: <LogOut className="w-4 h-4 text-red-400" />,  label: t('logout')            || 'Log out',       onClick: () => { logout(); onClose(); }, danger: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="desktop-dd"
          ref={dropdownRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute top-full right-0 mt-3 w-[340px] lg:w-[360px] max-h-[calc(100vh-90px)] overflow-hidden origin-top-right z-[110] rounded-3xl border shadow-2xl shadow-black/40 flex flex-col ${
            isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Hero */}
            <div className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/35 via-purple-700/25 to-indigo-800/35" />
              <div className="relative flex justify-end p-4 pb-0">
                <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative px-5 pb-5 pt-2 flex items-end gap-4">
                <div className="relative shrink-0">
                  <div className="w-[66px] h-[66px] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 border-2 border-[#0f0f1a] rounded-full w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-bold text-[15px] truncate">{displayName}</h3>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-widest ${rank.bg} ${rank.color}`}>{rank.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Zap className="w-3 h-3 text-violet-400" /><span className="text-xs font-bold text-violet-300">Lv.{level}</span>
                    <span className="text-white/20">·</span><span className="text-xs text-white/35">{xp.toLocaleString()} XP</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-white/35 mb-1 uppercase tracking-widest"><span>XP</span><span>{xp % 1000}/1000</span></div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#7C3AED,#818CF8)' }}
                      initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 pt-4 pb-3 grid grid-cols-2 gap-2.5">
              {[
                { icon: <Star className="w-4 h-4 text-yellow-400" />, value: favorites,   label: 'Favorites',    onClick: () => { navigate('/library/favorites'); onClose(); } },
                { icon: <Clock className="w-4 h-4 text-blue-400" />, value: sessions,     label: 'Sessions',     onClick: () => { navigate('/library/history');   onClose(); } },
                { icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />, value: topGenre, label: 'Top Genre',  onClick: undefined },
                { icon: <TrendingUp className="w-4 h-4 text-pink-400" />,  value: memberSince, label: 'Member Since', onClick: undefined },
              ].map((s) =>
                s.onClick ? (
                  <button key={s.label} onClick={s.onClick}
                    className={`p-3 rounded-2xl flex flex-col items-start transition-all hover:scale-[1.03] active:scale-[0.97] border ${isDarkMode ? 'bg-white/5 border-white/8 hover:bg-white/10' : 'bg-black/5 border-black/8 hover:bg-black/10'}`}>
                    {s.icon}
                    <span className="text-lg font-black text-accent leading-none mt-1.5">{s.value}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{s.label}</span>
                  </button>
                ) : (
                  <div key={s.label} className={`p-3 rounded-2xl flex flex-col items-start border ${isDarkMode ? 'bg-white/5 border-white/8' : 'bg-black/5 border-black/8'}`}>
                    {s.icon}
                    <span className={`text-sm font-black truncate w-full leading-none mt-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>{s.value}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{s.label}</span>
                  </div>
                )
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-3 flex gap-2.5">
              <button onClick={() => { openAccountSettings('main'); onClose(); }}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
                <Settings className="w-3.5 h-3.5" />Manage Account
              </button>
              <button onClick={() => { setIsUsernameModalOpen(true); onClose(); }}
                className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 shrink-0 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}>
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className={`mx-4 mb-2 h-px ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />

            {/* Menu */}
            <div className="px-3 pb-4 space-y-0.5">
              {menuItems.map((item) => (
                <button key={item.label} onClick={item.onClick}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-2xl transition-all group ${
                    item.danger ? isDarkMode ? 'hover:bg-red-500/8' : 'hover:bg-red-50' : isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-all ${item.danger ? 'bg-red-500/10' : isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-black/5 group-hover:bg-black/10'}`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm font-semibold transition-all ${item.danger ? 'text-red-400' : isDarkMode ? 'text-white/75 group-hover:text-white' : 'text-black/75 group-hover:text-black'}`}>
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5 transition-all ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Root component ──────────────────────────────────────────────────────── */
export const ProfileDropdown = memo(function ProfileDropdown(props: ProfileDropdownProps) {
  const { isOpen, user } = props;
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!user) return null;
  return isMobile ? <MobileSheet {...props} /> : <DesktopDropdown {...props} />;
});
