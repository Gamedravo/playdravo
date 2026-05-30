import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Eye,
  Settings2,
  ToggleRight,
  ToggleLeft
} from 'lucide-react';
import { User as FirebaseUser, updateEmail, deleteUser, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FirebaseUser | null;
  isDarkMode: boolean;
  t: (key: string) => string;
  initialView?: 'main' | 'email' | 'logout-all' | 'delete' | 'notifications' | 'privacy';
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  isDarkMode,
  t,
  initialView = 'main'
}: AccountSettingsModalProps) {
  const [view, setView] = React.useState<'main' | 'email' | 'logout-all' | 'delete' | 'notifications' | 'privacy'>(initialView);
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

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setView(initialView), 300);
    }
  }, [isOpen, initialView]);

  React.useEffect(() => {
    const handleSetView = (e: CustomEvent) => setView(e.detail);
    window.addEventListener('set-account-view', handleSetView as EventListener);
    return () => window.removeEventListener('set-account-view', handleSetView as EventListener);
  }, []);

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
      // Delete Firestore data first
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete Auth user
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
      toast.success('Logged out of all devices');
      onClose();
    } catch (error: any) {
      toast.error('Failed to log out');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMainView = () => (
    <div className="space-y-8">
      {/* Account Settings */}
      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('manageAccount') || 'Account Settings'}
        </h4>
        <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <button 
            onClick={() => setView('email')}
            className={`w-full flex items-center justify-between p-5 transition-all group border-b ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('emailPlaceholder') || 'Email Address'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{user.email}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
          
          <button 
            onClick={() => setView('notifications')}
            className={`w-full flex items-center justify-between p-5 transition-all group border-b ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <Bell className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('notificationPrefs') || 'Notification Preferences'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('manageAlerts') || 'Manage alerts and updates'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>

          <button 
            onClick={() => setView('privacy')}
            className={`w-full flex items-center justify-between p-5 transition-all group ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('privacyPrefs') || 'Privacy Settings'}</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{t('profileVisibility') || 'Profile visibility and data'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </section>

      {/* Security Section */}
      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Secure your account
        </h4>
        <button 
          onClick={() => setView('logout-all')}
          className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all group ${
            isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-left">
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Log out</p>
              <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Sign out from your current session</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      </section>

      {/* Danger Zone */}
      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Delete account
        </h4>
        <button 
          onClick={() => setView('delete')}
          className={`w-full flex items-center justify-between p-5 rounded-3xl border border-red-500/20 bg-red-500/5 transition-all group hover:bg-red-500/10`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-red-500">Delete your account</p>
              <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Permanently remove all your data</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-500 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>
      </section>
    </div>
  );

  const renderEmailView = () => (
    <form onSubmit={handleUpdateEmail} className="space-y-6">
      <div className="space-y-2">
        <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          New Email Address
        </label>
        <input 
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Enter new email"
          className={`w-full p-5 rounded-2xl border bg-transparent outline-none focus:ring-2 focus:ring-accent transition-all ${
            isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'
          }`}
          required
        />
      </div>
      <button 
        type="submit"
        disabled={isLoading || !newEmail || newEmail === user.email}
        className="w-full py-5 bg-accent text-bg-dark font-bold rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Update Email
      </button>
    </form>
  );

  const renderDeleteView = () => (
    <div className="space-y-8 text-center py-4">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      <div className="space-y-2">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Are you sure?</h3>
        <p className={`text-sm opacity-60 max-w-xs mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
          This action is permanent and cannot be undone. All your games, coins, and progress will be lost.
        </p>
      </div>
      <div className="space-y-3">
        <button 
          onClick={handleDeleteAccount}
          disabled={isLoading}
          className="w-full py-5 bg-red-500 text-white font-bold rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Yes, Delete My Account
        </button>
        <button 
          onClick={() => setView('main')}
          className={`w-full py-5 font-bold rounded-2xl uppercase tracking-widest text-xs transition-all ${
            isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-black hover:bg-black/10'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderLogoutAllView = () => (
    <div className="space-y-8 text-center py-4">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto border border-accent/20">
        <ShieldCheck className="w-10 h-10 text-accent" />
      </div>
      <div className="space-y-2">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Secure Account</h3>
        <p className={`text-sm opacity-60 max-w-xs mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
          You will be signed out from your current device. Note: Firebase Auth clients do not currently support global sign out natively.
        </p>
      </div>
      <div className="space-y-3">
        <button 
          onClick={handleLogoutAll}
          disabled={isLoading}
          className="w-full py-5 bg-accent text-bg-dark font-bold rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Log out cleanly
        </button>
        <button 
          onClick={() => setView('main')}
          className={`w-full py-5 font-bold rounded-2xl uppercase tracking-widest text-xs transition-all ${
            isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-black hover:bg-black/10'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const ToggleItem = ({ title, desc, value, onChange }: { title: string, desc: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className={`flex items-center justify-between p-5 border-b last:border-b-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
      <div className="flex-1 pr-4">
        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{title}</p>
        <p className={`text-xs opacity-60 mt-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>{desc}</p>
      </div>
      <button 
        onClick={() => onChange(!value)}
        className="relative shrink-0"
      >
        {value ? (
          <ToggleRight className="w-8 h-8 text-accent transition-all" />
        ) : (
          <ToggleLeft className={`w-8 h-8 transition-all ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
        )}
      </button>
    </div>
  );

  const renderNotificationsView = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 border border-accent/20">
          <Bell className="w-8 h-8 text-accent" />
        </div>
        <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Choose what you want to be notified about. These settings apply to push notifications and emails.
        </p>
      </div>
      
      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
        <ToggleItem 
          title="Game Updates" 
          desc="Get notified when games you play have new content or patches" 
          value={notifications.gameUpdates} 
          onChange={(v) => setNotifications(prev => ({...prev, gameUpdates: v}))} 
        />
        <ToggleItem 
          title="Trending Games" 
          desc="Weekly wrap-up of what the community is playing" 
          value={notifications.trendingGames} 
          onChange={(v) => setNotifications(prev => ({...prev, trendingGames: v}))} 
        />
        <ToggleItem 
          title="Friend Activity" 
          desc="Alerts when friends come online or invite you to play" 
          value={notifications.friendAlerts} 
          onChange={(v) => setNotifications(prev => ({...prev, friendAlerts: v}))} 
        />
        <ToggleItem 
          title="Marketing Emails" 
          desc="Occasional offers and promotional content" 
          value={notifications.marketing} 
          onChange={(v) => setNotifications(prev => ({...prev, marketing: v}))} 
        />
        <ToggleItem 
          title="Push Notifications" 
          desc="Enable instant browser or mobile push alerts" 
          value={notifications.pushNotifications} 
          onChange={(v) => setNotifications(prev => ({...prev, pushNotifications: v}))} 
        />
      </div>
    </div>
  );

  const renderPrivacyView = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 border border-accent/20">
          <Shield className="w-8 h-8 text-accent" />
        </div>
        <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Control how your profile and data appear to others on the platform.
        </p>
      </div>

      <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
        <ToggleItem 
          title="Profile Visibility" 
          desc="Allow anyone to view your profile and game history" 
          value={privacy.profileVisible} 
          onChange={(v) => setPrivacy(prev => ({...prev, profileVisible: v}))} 
        />
        <ToggleItem 
          title="Activity Visibility" 
          desc="Show what game you are currently playing to others" 
          value={privacy.activityVisible} 
          onChange={(v) => setPrivacy(prev => ({...prev, activityVisible: v}))} 
        />
        <ToggleItem 
          title="Online Status" 
          desc="Display the green dot when you are active" 
          value={privacy.showOnline} 
          onChange={(v) => setPrivacy(prev => ({...prev, showOnline: v}))} 
        />
        <ToggleItem 
          title="Allow Friend Requests" 
          desc="Permit other users to send you friend requests" 
          value={privacy.allowFriendRequests} 
          onChange={(v) => setPrivacy(prev => ({...prev, allowFriendRequests: v}))} 
        />
        <ToggleItem 
          title="Search Engine Indexing" 
          desc="Allow search engines like Google to index your profile" 
          value={privacy.searchEngineVisible} 
          onChange={(v) => setPrivacy(prev => ({...prev, searchEngineVisible: v}))} 
        />
        <ToggleItem 
          title="Personalized Recommendations" 
          desc="Use your gameplay data to improve AI recommendations" 
          value={privacy.dataCollection} 
          onChange={(v) => setPrivacy(prev => ({...prev, dataCollection: v}))} 
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence initial={false}>
      <div className={`fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 transition-[visibility,pointer-events] duration-300 ${isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        <motion.div 
          key="account-settings-overlay"
          initial={false}
          animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className={`absolute inset-0 backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
        />
        
        <motion.div
          key="account-settings-modal"
          initial={false}
          animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`relative w-full max-w-xl h-full md:h-auto md:max-h-[90vh] border md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
            isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'
          }`}
        >
            {/* Header */}
            <div className={`p-8 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
              <button 
                onClick={() => view === 'main' ? onClose() : setView('main')}
                className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Account <span className="text-accent">Settings</span>
              </h2>

              <button 
                onClick={onClose}
                className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {view === 'main' && renderMainView()}
              {view === 'email' && renderEmailView()}
              {view === 'delete' && renderDeleteView()}
              {view === 'logout-all' && renderLogoutAllView()}
              {view === 'notifications' && renderNotificationsView()}
              {view === 'privacy' && renderPrivacyView()}
            </div>
          </motion.div>
      </div>
    </AnimatePresence>
  );
}
