import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  X,
  Mail,
  ShieldCheck,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Bell,
  Shield,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { User as FirebaseUser, updateEmail, deleteUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalShell';

type AccountView = 'main' | 'email' | 'logout-all' | 'delete' | 'notifications' | 'privacy';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
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
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;

    setIsLoading(true);
    try {
      await updateEmail(user, newEmail);
      toast.success('Email updated successfully!');
      setView('main');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to perform this sensitive action.');
      } else {
        toast.error(error.message || 'Failed to update email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('Account deleted successfully');
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to delete your account.');
      } else {
        toast.error(error.message || 'Failed to delete account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      toast.success('Logged out successfully');
      onClose();
    } catch {
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (view === 'main') {
      handleClose();
    } else {
      setView('main');
    }
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
          {t('manageAccount') || 'Account Settings'}
        </h4>
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <button onClick={() => setView('email')} className={`w-full flex items-center justify-between p-4 transition-all group border-b ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('emailPlaceholder') || 'Email Address'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{user.email}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>
          <button onClick={() => setView('notifications')} className={`w-full flex items-center justify-between p-4 transition-all group border-b ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('notificationPrefs') || 'Notification Preferences'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('manageAlerts') || 'Manage alerts and updates'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>
          <button onClick={() => setView('privacy')} className={`w-full flex items-center justify-between p-4 transition-all group ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('privacyPrefs') || 'Privacy Settings'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('profileVisibility') || 'Profile visibility and data'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>
        </div>
      </section>

      <section>
        <button onClick={() => setView('logout-all')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <div className="text-left">
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Log out</p>
              <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Sign out from your current session</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
        </button>
      </section>

      <section>
        <button onClick={() => setView('delete')} className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-500/20 bg-red-500/5 transition-all group hover:bg-red-500/10">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-red-500">Delete your account</p>
              <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Permanently remove all your data</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-red-500 opacity-30 group-hover:opacity-100" />
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
          {view === 'email' && (
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-accent ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                required
              />
              <button type="submit" disabled={isLoading || !newEmail || newEmail === user.email} className="w-full py-4 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Update Email
              </button>
            </form>
          )}
          {view === 'delete' && (
            <div className="space-y-6 text-center py-4">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Are you sure?</h3>
                <p className={`text-sm opacity-60 mt-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  This action is permanent. All your games, progress, and favorites will be lost.
                </p>
              </div>
              <button onClick={handleDeleteAccount} disabled={isLoading} className="w-full py-4 bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Yes, Delete My Account
              </button>
              <button onClick={() => setView('main')} className={`w-full py-4 font-bold rounded-xl text-xs uppercase ${isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}>Cancel</button>
            </div>
          )}
          {view === 'logout-all' && (
            <div className="space-y-6 text-center py-4">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto" />
              <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>You will be signed out from your current device.</p>
              <button onClick={handleLogoutAll} disabled={isLoading} className="w-full py-4 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
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
