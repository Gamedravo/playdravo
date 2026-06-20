import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  X,
  Bell,
  Shield,
  ShieldCheck,
  LogOut,
  ToggleRight,
  ToggleLeft,
  User,
  Mail,
  KeyRound,
  UserPen,
  Loader2,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
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
  onEditUsername?: () => void;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  isDarkMode,
  t,
  initialView = 'main',
  onEditUsername
}: AccountSettingsModalProps) {
  const [view, setView] = useState<AccountView>(initialView);
  const [newEmail, setNewEmail] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const email = user?.email || '';
  const displayName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
    return fullName || user?.username || 'GameDravo Player';
  }, [user?.firstName, user?.lastName, user?.username]);

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
      setNewEmail('');
    }
  }, [isOpen, initialView]);

  if (!user) return null;

  const handleClose = () => onClose();
  const handleBack = () => {
    if (view === 'main') handleClose();
    else setView('main');
  };

  const runAccountAction = async (action: () => Promise<void>, successMessage: string) => {
    setIsWorking(true);
    try {
      await action();
      toast.success(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast.error(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleLogout = () => {
    handleClose();
    window.location.href = '/api/logout';
  };

  const handlePasswordReset = () => {
    toast.info('To change your password, please use your Replit account settings.');
  };

  const handleEmailChange = (event: React.FormEvent) => {
    event.preventDefault();
    toast.info('To change your email, please use your Replit account settings.');
  };

  const handleVerifyEmail = () => {
    toast.info('Email verification is managed through your Replit account.');
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

  const AccountAction = ({ icon, title, desc, onClick, danger = false }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; danger?: boolean }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 transition-all group border-b last:border-b-0 ${
        danger
          ? isDarkMode ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50 border-red-200 hover:bg-red-100'
          : isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
      }`}
      type="button"
    >
      <div className="flex items-center gap-3">
        {icon}
        <div className="text-left">
          <p className={`text-sm font-bold ${danger ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-black'}`}>{title}</p>
          <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>{desc}</p>
        </div>
      </div>
    </button>
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
                {displayName}
              </p>
              <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {email || `@${user.username || user.id}`}
              </p>
            </div>
          </div>
          <div className={`p-4 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
              Signed in securely with GameDravo. Update your username, email, password, notifications, and privacy preferences here.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-wide mb-3 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Security
        </h4>
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <AccountAction icon={<UserPen className="w-5 h-5 text-accent" />} title="Change Username" desc="Edit the gamer tag shown on GameDravo" onClick={() => onEditUsername?.()} />
          <AccountAction icon={<Mail className="w-5 h-5 text-accent" />} title="Change Email" desc={email ? `Current email: ${email}` : 'Add or update your login email'} onClick={() => setView('email')} />
          <AccountAction icon={<KeyRound className="w-5 h-5 text-accent" />} title="Change Password" desc="Send a secure password change email" onClick={() => setView('password')} />
          <AccountAction icon={<ShieldCheck className="w-5 h-5 text-accent" />} title="Verify Email" desc="Manage email verification via Replit account" onClick={handleVerifyEmail} />
        </div>
      </section>

      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-wide mb-3 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('manageAccount') || 'Preferences'}
        </h4>
        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <AccountAction icon={<Bell className="w-5 h-5 text-accent" />} title={t('notificationPrefs') || 'Notification Preferences'} desc={t('manageAlerts') || 'Manage alerts and updates'} onClick={() => setView('notifications')} />
          <AccountAction icon={<Shield className="w-5 h-5 text-accent" />} title={t('privacyPrefs') || 'Privacy Settings'} desc={t('profileVisibility') || 'Profile visibility and data'} onClick={() => setView('privacy')} />
        </div>
      </section>

      <section>
        <button
          onClick={handleLogout}
          disabled={isWorking}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group disabled:cursor-not-allowed disabled:opacity-60 ${isDarkMode ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}
          type="button"
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
          {view === 'email' && (
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Change Email</p>
                <p className={`text-xs opacity-60 mt-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Enter a new email. Firebase will send a verification link before the email changes.
                </p>
              </div>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="new@email.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
              <button disabled={isWorking} className="w-full py-4 bg-accent text-white font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
                {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Change Email Link
              </button>
            </form>
          )}
          {view === 'password' && (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-black/5 bg-black/5'}`}>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Change Password</p>
                <p className={`text-xs opacity-60 mt-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  We will send a secure password change link to {email || 'your account email'}.
                </p>
              </div>
              <button onClick={handlePasswordReset} disabled={isWorking} className="w-full py-4 bg-accent text-white font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60" type="button">
                {isWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Send Password Change Email
              </button>
            </div>
          )}
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
