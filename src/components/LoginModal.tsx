import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  verifyUserEmail,
  auth,
} from '../firebase';
import { appToast } from '../lib/appToast';
import { AuthProviderButtons, type AuthMethodId, type OAuthProviderId } from './AuthProviderButtons';
import { handleAuthError } from '../lib/authErrors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

type Tab = 'register' | 'login';

const OAUTH_HANDLERS: Record<OAuthProviderId, () => ReturnType<typeof signInWithGoogle>> = {
  google: signInWithGoogle,
  microsoft: signInWithMicrosoft,
  github: signInWithGithub,
};

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<AuthMethodId | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const resetAuthMethodState = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  const resetAuthLoading = useCallback(() => {
    setLoadingProvider(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      resetAuthMethodState();
      setAuthMethod(null);
      setLoadingProvider(null);
      setIsSendingReset(false);
    }
    return () => {
      window.setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 280);
    };
  }, [isOpen, resetAuthMethodState]);

  useEffect(() => {
    if (!isOpen || !loadingProvider) return;
    if (loadingProvider === 'email') return;

    let safetyTimer: number | undefined;
    const clearStuckLoading = () => {
      if (safetyTimer) window.clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(() => resetAuthLoading(), 650);
    };

    window.addEventListener('focus', clearStuckLoading);
    document.addEventListener('visibilitychange', clearStuckLoading);
    return () => {
      if (safetyTimer) window.clearTimeout(safetyTimer);
      window.removeEventListener('focus', clearStuckLoading);
      document.removeEventListener('visibilitychange', clearStuckLoading);
    };
  }, [isOpen, loadingProvider, resetAuthLoading]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setAuthMethod(null);
    resetAuthMethodState();
  };

  const handleOAuthLogin = async (provider: OAuthProviderId) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    try {
      await OAUTH_HANDLERS[provider]();
      onClose();
      appToast.success(t('loginSuccess') || 'Successfully logged in!');
    } catch (error) {
      handleAuthError(error, provider, t);
    } finally {
      resetAuthLoading();
    }
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const passwordStrengthScore = (value: string) => {
    const v = value ?? '';
    let score = 0;
    if (v.length >= 8) score += 1;
    if (v.length >= 12) score += 1;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score += 1;
    if (/\d/.test(v)) score += 1;
    if (/[^A-Za-z0-9]/.test(v)) score += 1;
    return Math.min(4, score);
  };

  const strength = passwordStrengthScore(password);
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Strong'][strength] ?? 'Weak';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingProvider) return;

    if (!isValidEmail(email)) {
      appToast.error('Please enter a valid email address.');
      return;
    }

    if (activeTab === 'register' && password !== confirmPassword) {
      appToast.error('Passwords do not match.');
      return;
    }

    try {
      setLoadingProvider('email');
      if (activeTab === 'register') {
        if (password.length < 8) {
          appToast.error('Password must be at least 8 characters.');
          setLoadingProvider(null);
          return;
        }
        await signUpWithEmail(email, password);
        try {
          await verifyUserEmail();
          appToast.success('Account created! We sent you a verification email.');
        } catch (verifyErr) {
          handleAuthError(verifyErr, 'email', t);
          appToast.success('Account created successfully!');
        }
      } else {
        await signInWithEmail(email, password);
        appToast.success(t('loginSuccess') || 'Successfully logged in!');
      }
      onClose();
    } catch (error) {
      handleAuthError(error, 'email', t);
    } finally {
      resetAuthLoading();
    }
  };

  const inputClass = `w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${
    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'
  }`;

  const submitClass =
    'w-full mt-2 py-3.5 md:py-4 bg-accent text-bg-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20';

  const linkClass = `text-[10px] font-semibold tracking-wide ${
    isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'
  }`;

  const dividerBg = isDarkMode ? 'bg-bg-dark text-white/20' : 'bg-white text-black/20';

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          <motion.div
            key="login-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 z-[1900]"
          />
          <div className="relative z-[2000] w-full h-full" onClick={onClose}>
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
              <motion.div
                key="login-modal-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className={`relative w-full max-w-lg max-h-[95dvh] flex flex-col border rounded-[2rem] shadow-2xl overflow-hidden m-auto ${
                  isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'
                }`}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full" />
                  <div
                    className={`absolute inset-0 opacity-[0.03] ${
                      isDarkMode
                        ? 'bg-[radial-gradient(#fff_1px,transparent_1px)]'
                        : 'bg-[radial-gradient(#000_1px,transparent_1px)]'
                    } [background-size:20px_20px]`}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className={`absolute top-4 right-4 md:top-5 md:right-5 z-[60] w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                    isDarkMode
                      ? 'bg-black/50 border-white/10 hover:bg-white/10 text-white'
                      : 'bg-white/90 border-black/10 hover:bg-black/10 text-black'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="relative z-10 flex flex-col flex-1 overflow-y-auto w-full custom-scrollbar">
                  <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                    <button
                      onClick={() => handleTabChange('register')}
                      className={`flex-1 py-4 md:py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === 'register'
                          ? 'text-accent'
                          : isDarkMode
                            ? 'text-white/40 hover:text-white/60'
                            : 'text-black/40 hover:text-black/60'
                      }`}
                    >
                      {t('register')}
                      {activeTab === 'register' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                      )}
                    </button>
                    <button
                      onClick={() => handleTabChange('login')}
                      className={`flex-1 py-4 md:py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                        activeTab === 'login'
                          ? 'text-accent'
                          : isDarkMode
                            ? 'text-white/40 hover:text-white/60'
                            : 'text-black/40 hover:text-black/60'
                      }`}
                    >
                      {t('signIn')}
                      {activeTab === 'login' && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                      )}
                    </button>
                  </div>

                  <div className="p-4 md:p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'register' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: activeTab === 'register' ? 10 : -10 }}
                        className="space-y-4 md:space-y-5"
                      >
                        <div className="text-center mb-1 md:mb-2">
                          <div className="mx-auto mb-2 flex justify-center">
                            <PlayDravoMark size={40} />
                          </div>
                          <h3 className="text-base md:text-lg font-bold tracking-tight">
                            {activeTab === 'register' ? (
                              t('createAccount')
                            ) : (
                              <>
                                Welcome <span className="text-accent">Back</span>
                              </>
                            )}
                          </h3>
                        </div>

                        <AuthProviderButtons
                          isDarkMode={isDarkMode}
                          loadingProvider={loadingProvider}
                          activeMethod={authMethod}
                          onOAuth={handleOAuthLogin}
                          onEmail={() => setAuthMethod('email')}
                        />

                        {authMethod && (
                          <>
                            <div className="relative py-1">
                              <div className="absolute inset-0 flex items-center">
                                <div
                                  className={`w-full border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}
                                />
                              </div>
                              <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.3em]">
                                <span className={`px-4 ${dividerBg}`}>
                                  Email sign-in
                                </span>
                              </div>
                            </div>

                            {authMethod === 'email' && (
                              <form onSubmit={handleEmailAuth} className="space-y-3 md:space-y-4">
                                <div className="relative">
                                  <Mail
                                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                      isDarkMode ? 'text-white/20' : 'text-black/20'
                                    }`}
                                  />
                                  <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('emailPlaceholder')}
                                    className={inputClass}
                                  />
                                </div>
                                <div className="relative">
                                  <Lock
                                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                      isDarkMode ? 'text-white/20' : 'text-black/20'
                                    }`}
                                  />
                                  <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={
                                      activeTab === 'register'
                                        ? t('passwordPlaceholder')
                                        : t('passwordLoginPlaceholder')
                                    }
                                    className={inputClass}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 ${
                                      isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-black/40 hover:text-black/70'
                                    }`}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                  >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                </div>
                                {activeTab === 'register' && (
                                  <>
                                    <div className="px-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                                          Password strength
                                        </span>
                                        <span className={`text-[10px] font-bold ${strength >= 3 ? 'text-green-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                                          {strengthLabel}
                                        </span>
                                      </div>
                                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}>
                                        <div
                                          className={`h-full rounded-full transition-all duration-150 ${
                                            strength >= 3 ? 'bg-green-500' : strength >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${(Math.max(1, strength) / 4) * 100}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className="relative">
                                      <ShieldCheck
                                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                          isDarkMode ? 'text-white/20' : 'text-black/20'
                                        }`}
                                      />
                                      <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('confirmPasswordPlaceholder')}
                                        className={inputClass}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 ${
                                          isDarkMode ? 'text-white/40 hover:text-white/70' : 'text-black/40 hover:text-black/70'
                                        }`}
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                      >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </button>
                                    </div>
                                  </>
                                )}
                                {activeTab === 'login' && (
                                  <div className="flex justify-end px-1">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (isSendingReset) return;
                                        if (!email) {
                                          appToast.error('Please enter your email address first.');
                                          return;
                                        }
                                        if (!isValidEmail(email)) {
                                          appToast.error('Please enter a valid email address first.');
                                          return;
                                        }
                                        try {
                                          setIsSendingReset(true);
                                          await resetPassword(email);
                                          appToast.success('Password reset link sent to your email.');
                                        } catch (error) {
                                          handleAuthError(error, 'email', t);
                                        } finally {
                                          setIsSendingReset(false);
                                        }
                                      }}
                                      className={linkClass}
                                    >
                                      {isSendingReset ? 'Sending…' : 'Forgot Password?'}
                                    </button>
                                  </div>
                                )}
                                <button
                                  type="submit"
                                  disabled={Boolean(loadingProvider)}
                                  className={submitClass}
                                >
                                  {loadingProvider === 'email'
                                    ? t('processing')
                                    : activeTab === 'register'
                                      ? t('createAccount')
                                      : t('signIn')}
                                </button>
                              </form>
                            )}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div
                    className={`p-5 md:p-6 border-t flex flex-col sm:flex-row shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] items-center justify-center gap-3 md:gap-4 shrink-0 ${
                      isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-accent hidden sm:block" />
                    <p
                      className={`text-[9px] font-semibold text-center uppercase tracking-widest ${
                        isDarkMode ? 'text-white/40' : 'text-black/40'
                      }`}
                    >
                      Secure Arena Authentication
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
