import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  X,
  Mail,
  Lock,
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
import {
  User as FirebaseUser,
  deleteUser,
  signOut as firebaseSignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db, githubProvider, googleProvider, microsoftProvider, resetPassword, verifyUserEmail } from '../firebase';
import { getAuthActionCodeSettings } from '../lib/authEmailConfig';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalShell';

type AccountView = 'main' | 'email' | 'password' | 'logout-all' | 'delete' | 'notifications' | 'privacy';

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
  const [emailVerified, setEmailVerified] = useState<boolean>(Boolean(user?.emailVerified));

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteConfirmChecked, setDeleteConfirmChecked] = useState(false);

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
      setEmailVerified(Boolean(user?.emailVerified));
      setIsLoading(false);
      setNewEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setDeletePassword('');
      setDeleteConfirmText('');
      setDeleteConfirmChecked(false);
    }
  }, [isOpen, initialView, user?.emailVerified]);

  if (!user) return null;

  const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
  const canDoSensitiveActions = emailVerified;

  const refreshVerificationStatus = async () => {
    try {
      await user.reload();
      setEmailVerified(Boolean(user.emailVerified));
      toast.success(user.emailVerified ? 'Email verified!' : 'Email not verified yet.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to refresh verification status');
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await verifyUserEmail();
      toast.success('Verification email sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send verification email');
    }
  };

  const reauthenticateIfNeeded = async (password?: string) => {
    if (hasPasswordProvider) {
      if (!user.email) throw new Error('Missing email on user');
      if (!password) throw Object.assign(new Error('Password required'), { code: 'auth/wrong-password' });
      const cred = EmailAuthProvider.credential(user.email, password);
      return reauthenticateWithCredential(user, cred);
    }

    const providerId = user.providerData[0]?.providerId;
    if (providerId === 'google.com') return reauthenticateWithPopup(user, googleProvider);
    if (providerId === 'microsoft.com') return reauthenticateWithPopup(user, microsoftProvider);
    if (providerId === 'github.com') return reauthenticateWithPopup(user, githubProvider);

    throw new Error('Unsupported provider for re-authentication');
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;
    if (!canDoSensitiveActions) {
      toast.error('Verify your email before changing it.');
      return;
    }

    setIsLoading(true);
    try {
      // Sends a confirmation email to the new address; only updates after the user confirms.
      await verifyBeforeUpdateEmail(user, newEmail, getAuthActionCodeSettings('/'));
      toast.success('Email change requested. Check your new email to confirm.');
      setView('main');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('For security, please re-authenticate and try again.');
      } else {
        toast.error(error.message || 'Failed to update email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDoSensitiveActions) {
      toast.error('Verify your email before changing your password.');
      return;
    }
    if (!hasPasswordProvider) {
      toast.error('This account does not use an email/password login method.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await reauthenticateIfNeeded(currentPassword);
      await updatePassword(user, newPassword);
      toast.success('Password updated successfully!');
      setView('main');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Current password is incorrect.');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('For security, please sign in again and retry.');
      } else {
        toast.error(error.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user.email) {
      toast.error('No email found for this account.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(user.email);
      toast.success('Password reset email sent.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!canDoSensitiveActions) {
      toast.error('Verify your email before deleting your account.');
      return;
    }
    if (!deleteConfirmChecked || deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please confirm by checking the box and typing DELETE.');
      return;
    }
    if (!window.confirm('Delete your GameDravo account permanently? This cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      // Firebase requires recent sign-in for deletion. Re-authenticate explicitly first.
      await reauthenticateIfNeeded(hasPasswordProvider ? deletePassword : undefined);

      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      toast.success('Account deleted successfully');
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error('For security, please re-authenticate and try again.');
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
          Authentication
        </h4>

        <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className={`p-4 border-b ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Email</p>
                  <p className={`text-xs opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>{user.email || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                    emailVerified
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}
                >
                  {emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>

            {!emailVerified && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-accent text-bg-dark font-bold rounded-xl text-[10px] uppercase tracking-wide disabled:opacity-50"
                >
                  Resend verification email
                </button>
                <button
                  type="button"
                  onClick={refreshVerificationStatus}
                  disabled={isLoading}
                  className={`flex-1 py-3 font-bold rounded-xl text-[10px] uppercase tracking-wide disabled:opacity-50 ${
                    isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'
                  }`}
                >
                  Refresh status
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setView('password')}
            disabled={!hasPasswordProvider || !canDoSensitiveActions}
            className={`w-full flex items-center justify-between p-4 transition-all group border-b disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Change password</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {hasPasswordProvider ? 'Requires email verification' : 'Not available for this sign-in method'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>

          <button
            type="button"
            onClick={handleSendPasswordReset}
            disabled={isLoading || !user.email}
            className={`w-full flex items-center justify-between p-4 transition-all group border-b disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Reset password</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Send a password reset email</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>

          <button
            onClick={() => setView('email')}
            disabled={!canDoSensitiveActions}
            className={`w-full flex items-center justify-between p-4 transition-all group border-b disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Change email</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Requires email verification</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100" />
          </button>

          <button
            onClick={() => setView('delete')}
            disabled={!canDoSensitiveActions}
            className={`w-full flex items-center justify-between p-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode ? 'bg-red-500/5 hover:bg-red-500/10' : 'bg-red-500/5 hover:bg-red-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-red-500">Delete account</p>
                <p className={`text-xs opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Requires email verification</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-500 opacity-30 group-hover:opacity-100" />
          </button>
        </div>
      </section>

      <section>
        <h4 className={`text-[10px] font-bold uppercase tracking-wide mb-3 opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          {t('manageAccount') || 'Account Settings'}
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
              {!emailVerified && (
                <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200' : 'border-yellow-200 bg-yellow-50 text-yellow-900'}`}>
                  <p className="text-sm font-bold">Verify your email first</p>
                  <p className="text-xs opacity-80 mt-1">
                    You must verify your current email address before changing it.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={resendVerificationEmail} className="flex-1 py-3 rounded-xl bg-accent text-bg-dark font-bold text-[10px] uppercase tracking-wide">
                      Resend verification
                    </button>
                    <button type="button" onClick={refreshVerificationStatus} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wide ${isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}>
                      Refresh
                    </button>
                  </div>
                </div>
              )}
              <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>New Email Address</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                disabled={!emailVerified}
                className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-accent ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                required
              />
              <button
                type="submit"
                disabled={isLoading || !emailVerified || !newEmail || newEmail === user.email}
                className="w-full py-4 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Request Email Change
              </button>
            </form>
          )}
          {view === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {!emailVerified && (
                <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-200' : 'border-yellow-200 bg-yellow-50 text-yellow-900'}`}>
                  <p className="text-sm font-bold">Email verification required</p>
                  <p className="text-xs opacity-80 mt-1">Verify your email to change your password.</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={resendVerificationEmail} className="flex-1 py-3 rounded-xl bg-accent text-bg-dark font-bold text-[10px] uppercase tracking-wide">
                      Resend verification
                    </button>
                    <button type="button" onClick={refreshVerificationStatus} className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wide ${isDarkMode ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`}>
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {!hasPasswordProvider && (
                <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/5 text-white' : 'border-black/10 bg-black/5 text-black'}`}>
                  <p className="text-sm font-bold">Password not available</p>
                  <p className="text-xs opacity-70 mt-1">
                    This account uses an external provider (Google/Microsoft/GitHub). Password changes are managed by that provider.
                  </p>
                </div>
              )}

              <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-accent ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                required={hasPasswordProvider}
                disabled={!hasPasswordProvider}
              />

              <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-accent ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                required={hasPasswordProvider}
                disabled={!hasPasswordProvider}
              />

              <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>Confirm new password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-accent ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                required={hasPasswordProvider}
                disabled={!hasPasswordProvider}
              />

              <button
                type="submit"
                disabled={isLoading || !hasPasswordProvider || !emailVerified}
                className="w-full py-4 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Change Password
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

              {hasPasswordProvider && (
                <div className="space-y-3 text-left">
                  <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                    required
                  />
                </div>
              )}

              <div className="space-y-3 text-left">
                <label className={`text-[10px] font-semibold tracking-wide opacity-40 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Type <span className="font-black">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className={`w-full p-4 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                />

                <label className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                  <input
                    type="checkbox"
                    checked={deleteConfirmChecked}
                    onChange={(e) => setDeleteConfirmChecked(e.target.checked)}
                    className="accent-red-500"
                  />
                  I understand this action is permanent.
                </label>
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || !emailVerified}
                className="w-full py-4 bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete My Account
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
