import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  X,
  Bell,
  Shield,
  ShieldCheck,
  LogOut,
  ToggleRight,
  ToggleLeft,
  User
} from 'lucide-react';
import { ModalShell } from './ui/ModalShell';
import { type ReplitUser } from '../hooks/useReplitAuth';

type AccountView = 'main' | 'email' | 'password' | 'logout-all' | 'delete' | 'notifications' | 'privacy';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ReplitUser | null;
  isDarkMode: boolean;
  t: (key: string) => string;
  initialView?: AccountView;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  isDarkMode,
  t,
  initialView = 'main'
}: AccountSettingsModalProps) {
  const [view, setView] = useState<AccountView>(initialView);

  const [notifications, setNotifications] = useState({
    gameUpdates: true,
    trendingGames: false,
    friendAlerts: true,
    marketing: false,
    pushNotifications: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    activityVisible: true,
    showOnline: true,
    allowFriendRequests: true,
    searchEngineVisible: false,
    dataCollection: false
  });

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
    }
  }, [isOpen, initialView]);

  if (!user) return null;

  const handleClose = () => onClose();
  const handleBack = () => {
    if (view === 'main') handleClose();
    else setView('main');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const ToggleItem = ({ title, desc, value, onChange }: { title: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className={`flex items-center justify-between p-4 border-b last:border-b-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
      <div className="flex-1 pr-4">
        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</p>
        <p className={`text-xs opacity-60 mt-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} className="relative shrink-0" type="button">
        {value ? (
          <ToggleRight className="w-8 h-8 text-accent" />
        ) : (
          <ToggleLeft className={`w-8 h-8 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
        )}
      </button>
    </div>
  );

  const renderMainView = () => (
    <div className="space-y-6">
      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-wide mb-3 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Account
        </h4>
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className={`p-4 flex items-center gap-3 border-b ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
            <User className="w-5 h-5 text-accent" />
            <div>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {user.firstName || user.username || 'Replit User'}
              </p>
              <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                @{user.username || user.id}
              </p>
            </div>
          </div>
          <div className={`p-4 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Signed in via Replit. Manage your account at{' '}
              <a
                href="https://replit.com/account"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                replit.com/account
              </a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-wide mb-3 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('manageAccount') || 'Preferences'}
        </h4>
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <button onClick={() => setView('notifications')} className={`w-full flex items-center justify-between p-4 transition-all group border-b ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('notificationPrefs') || 'Notification Preferences'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('manageAlerts') || 'Manage alerts and updates'}</p>
              </div>
            </div>
          </button>
          <button onClick={() => setView('privacy')} className={`w-full flex items-center justify-between p-4 transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('privacyPrefs') || 'Privacy Settings'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('profileVisibility') || 'Profile visibility and data'}</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      <section>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isDarkMode ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-red-500">{t('logout') || 'Log out'}</p>
              <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Sign out from your current session</p>
            </div>
          </div>
        </button>
      </section>
    </div>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isDarkMode={isDarkMode}
      maxWidth="max-w-xl"
      zIndex={200}
      padding="p-0"
      showCloseButton={false}
    >
      <div className={`flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <button onClick={handleBack} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`} type="button">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Account <span className="text-accent">Settings</span>
          </h2>
          <button onClick={handleClose} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`} type="button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {view === 'main' && renderMainView()}
          {view === 'logout-all' && (
            <div className="space-y-6 text-center py-4">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto" />
              <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>You will be signed out from your current device.</p>
              <button onClick={handleLogout} className="w-full py-4 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Log out
              </button>
              <button onClick={() => setView('main')} className={`w-full py-4 font-bold rounded-xl text-xs uppercase ${isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}>Cancel</button>
            </div>
          )}
          {view === 'notifications' && (
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <ToggleItem title="Game Updates" desc="Get notified when games you play have new content" value={notifications.gameUpdates} onChange={(v) => setNotifications(prev => ({ ...prev, gameUpdates: v }))} />
              <ToggleItem title="Trending Games" desc="Weekly wrap-up of what the community is playing" value={notifications.trendingGames} onChange={(v) => setNotifications(prev => ({ ...prev, trendingGames: v }))} />
              <ToggleItem title="Friend Activity" desc="Alerts when friends come online" value={notifications.friendAlerts} onChange={(v) => setNotifications(prev => ({ ...prev, friendAlerts: v }))} />
              <ToggleItem title="Marketing Emails" desc="Occasional offers and promotional content" value={notifications.marketing} onChange={(v) => setNotifications(prev => ({ ...prev, marketing: v }))} />
              <ToggleItem title="Push Notifications" desc="Enable instant browser push alerts" value={notifications.pushNotifications} onChange={(v) => setNotifications(prev => ({ ...prev, pushNotifications: v }))} />
            </div>
          )}
          {view === 'privacy' && (
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
              <ToggleItem title="Profile Visibility" desc="Allow anyone to view your profile and game history" value={privacy.profileVisible} onChange={(v) => setPrivacy(prev => ({ ...prev, profileVisible: v }))} />
              <ToggleItem title="Activity Visibility" desc="Show what game you are currently playing" value={privacy.activityVisible} onChange={(v) => setPrivacy(prev => ({ ...prev, activityVisible: v }))} />
              <ToggleItem title="Online Status" desc="Display when you are active" value={privacy.showOnline} onChange={(v) => setPrivacy(prev => ({ ...prev, showOnline: v }))} />
              <ToggleItem title="Allow Friend Requests" desc="Permit other users to send friend requests" value={privacy.allowFriendRequests} onChange={(v) => setPrivacy(prev => ({ ...prev, allowFriendRequests: v }))} />
              <ToggleItem title="Search Engine Indexing" desc="Allow search engines to index your profile" value={privacy.searchEngineVisible} onChange={(v) => setPrivacy(prev => ({ ...prev, searchEngineVisible: v }))} />
              <ToggleItem title="Personalized Recommendations" desc="Use gameplay data to improve recommendations" value={privacy.dataCollection} onChange={(v) => setPrivacy(prev => ({ ...prev, dataCollection: v }))} />
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
