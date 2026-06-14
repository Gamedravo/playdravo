import React, { useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  LogOut, 
  Share2, 
  Edit3, 
  ChevronRight, 
  CheckCircle2,
  HelpCircle,
  X
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      if (!dropdownRef.current) return;
      
      // If this dropdown instance is hidden by CSS, ignore its handler
      if (dropdownRef.current.getBoundingClientRect().width === 0) return;

      // Check if we are clicking a toggle button
      const target = event.target as Element;
      const isProfileButton = target.closest('button[aria-label="User Profile"]');
      
      if (!dropdownRef.current.contains(target as Node) && !isProfileButton) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!user) return null;

  const menuItems = [
    { 
      icon: <Bell className="w-4 h-4" />, 
      label: t('notificationPrefs') || 'Notification preferences', 
      onClick: () => {
        openAccountSettings('notifications');
        onClose();
      } 
    },
    { 
      icon: <Shield className="w-4 h-4" />, 
      label: t('privacyPrefs') || 'Privacy preferences', 
      onClick: () => {
        openAccountSettings('privacy');
        onClose();
      } 
    },
    { 
      icon: <LogOut className="w-4 h-4 text-red-500" />, 
      label: t('logout') || 'Log out', 
      onClick: () => { logout(); onClose(); },
      danger: true
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-dropdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden`}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-dropdown-container"
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute top-full right-0 mt-4 w-[calc(100vw-32px)] md:w-[320px] max-h-[calc(100vh-100px)] overflow-hidden origin-top-right z-[110] rounded-3xl md:rounded-[2.5rem] border shadow-2xl flex flex-col mb-6 md:mb-0 ${
              isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-black/10'
            }`}
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Close Button for Mobile/Tablet */}
              <div className="lg:hidden flex justify-end p-4 pb-0">
                <button 
                  onClick={onClose}
                  className={`p-3 rounded-full transition-all flex items-center justify-center ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Header */}
              <div className="p-8 pb-6 pt-4 lg:pt-8">
                <div className="flex flex-col lg:flex-row items-center lg:justify-between mb-6 gap-4">
                  <div className="flex flex-col lg:flex-row items-center gap-4 text-center lg:text-left">
                    <div className="relative group">
                      <div className="w-24 h-24 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-accent shadow-lg shadow-accent/20">
                        <img 
                          src={userProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-5 lg:h-5 bg-green-500 border-4 border-[#0f0f1a] rounded-full" />
                    </div>
                    <div>
                      <div className="flex flex-col gap-3 w-full">
                        <div className="flex flex-col gap-1">
                          <h3 className={`text-xl lg:text-lg font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                            {userProfile?.displayName || 'Gamer'}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-lg uppercase tracking-widest border border-accent/20">{t('levelPrefix') || 'Lv.'} {Math.floor((userProfile?.xp || 0) / 1000) + 1}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{t('beginner') || 'Beginner'}</span>
                          </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="w-full mt-2">
                          <div className="flex justify-between items-end mb-1">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>XP</span>
                            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                              {(userProfile?.xp || 0) % 1000} / 1000
                            </span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                            <div 
                              className="h-full bg-accent rounded-full transition-all duration-1000 ease-out" 
                              style={{ width: `${((userProfile?.xp || 0) % 1000) / 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  <button 
                    onClick={() => {
                      navigate('/library/favorites');
                      onClose();
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-start justify-center border transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('favorites') || 'Favorites'}</span>
                    <span className="text-xl font-black text-accent">{userProfile?.favorites?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/library/history');
                      onClose();
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-start justify-center border transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/10'}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('totalSessions') || 'Total Sessions'}</span>
                    <span className="text-xl font-black">{Math.max(userProfile?.playHistory?.length || 0, userProfile?.totalPlaytime ? Math.floor(userProfile.totalPlaytime / 600) : 0)}</span>
                  </button>
                  <div className={`p-3 rounded-2xl flex flex-col items-start justify-center border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('topGenre') || 'Top Genre'}</span>
                    <span className="text-sm font-black truncate">{userProfile?.preferredCategories?.[0] || 'Arcade'}</span>
                  </div>
                  <div className={`p-3 rounded-2xl flex flex-col items-start justify-center border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{t('memberSince') || 'Member Since'}</span>
                    <span className="text-sm font-black">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString(undefined, {month: 'short', year: 'numeric'}) : 'Nov 2023'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      openAccountSettings('main');
                      onClose();
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {t('manageAccount') || 'Manage Account'}
                  </button>
                  <button 
                    onClick={() => { setIsUsernameModalOpen(true); onClose(); }}
                    className={`p-4 rounded-2xl border transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Settings Menu */}
              <div className="px-4 mb-6">
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl transition-all ${
                          isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-black/5 group-hover:bg-black/10'
                        }`}>
                          {item.icon}
                        </div>
                        <span className={`text-sm font-bold transition-all ${
                          item.danger ? 'text-red-500' : isDarkMode ? 'text-white/80 group-hover:text-white' : 'text-black/80 group-hover:text-black'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all opacity-0 group-hover:opacity-40 group-hover:translate-x-1 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Section intentionally removed: keep contact/support links on Footer/Contact/Support pages only. */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
