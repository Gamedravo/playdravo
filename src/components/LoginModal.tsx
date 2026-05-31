import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, Lock, Key, Smartphone } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  auth,
} from '../firebase';
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  clearRecaptchaVerifier,
  prewarmRecaptcha,
  toE164,
  isPhoneAuthDebugEnabled,
  type RecaptchaState,
  type PhoneAuthState,
} from '../lib/phoneAuth';
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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<import('firebase/auth').ConfirmationResult | null>(null);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<AuthMethodId | null>(null);
  const [recaptchaState, setRecaptchaState] = useState<RecaptchaState>('idle');
  const [phoneAuthState, setPhoneAuthState] = useState<PhoneAuthState>('idle');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [lastFirebaseCode, setLastFirebaseCode] = useState<string | null>(null);
  const showPhoneDebug = isPhoneAuthDebugEnabled();

  const resetPhoneState = useCallback(() => {
    setIsOtpSent(false);
    setConfirmationResult(null);
    setOtp('');
    setPhoneAuthState('idle');
    setNormalizedPhone('');
    setLastFirebaseCode(null);
    setRecaptchaState(clearRecaptchaVerifier());
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
      resetPhoneState();
      setAuthMethod(null);
      setLoadingProvider(null);
    }
    return () => {
      window.setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 280);
    };
  }, [isOpen, resetPhoneState]);

  // Pre-warm invisible reCAPTCHA once phone UI + container are mounted
  useEffect(() => {
    if (!isOpen || authMethod !== 'phone' || isOtpSent) return;
    const timer = window.setTimeout(async () => {
      setRecaptchaState('initializing');
      const state = await prewarmRecaptcha();
      setRecaptchaState(state);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [isOpen, authMethod, isOtpSent]);

  useEffect(() => {
    if (!isOpen || !loadingProvider) return;
    if (loadingProvider === 'email' || loadingProvider === 'phone') return;

    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    const clearStuckLoading = () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      safetyTimer = window.setTimeout(() => resetAuthLoading(), 650);
    };

    window.addEventListener('focus', clearStuckLoading);
    document.addEventListener('visibilitychange', clearStuckLoading);
    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener('focus', clearStuckLoading);
      document.removeEventListener('visibilitychange', clearStuckLoading);
    };
  }, [isOpen, loadingProvider, resetAuthLoading]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setAuthMethod(null);
    resetPhoneState();
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

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingProvider) return;
    setLoadingProvider('phone');
    setLastFirebaseCode(null);
    try {
      if (!isOtpSent) {
        const { confirmation, e164 } = await sendPhoneOtp(phoneNumber, (state, detail) => {
          setPhoneAuthState(state);
          if (detail && state === 'otp-sent') setNormalizedPhone(detail);
          if (detail && state === 'error') setLastFirebaseCode(detail);
        });
        setNormalizedPhone(e164);
        setConfirmationResult(confirmation);
        setIsOtpSent(true);
        setRecaptchaState('rendered');
        appToast.success('OTP sent to your phone number!');
      } else {
        await verifyPhoneOtp(confirmationResult!, otp, setPhoneAuthState);
        appToast.success(t('loginSuccess') || 'Successfully logged in!');
        onClose();
      }
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'unknown';
      setLastFirebaseCode(code);
      setPhoneAuthState('error');
      handleAuthError(error, 'phone', t);
      if (!isOtpSent) resetPhoneState();
    } finally {
      resetAuthLoading();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register' && password !== confirmPassword) {
      appToast.error('Passwords do not match.');
      return;
    }

    try {
      setLoadingProvider('email');
      if (activeTab === 'register') {
        await signUpWithEmail(email, password);
        appToast.success('Account created successfully! Welcome to the arena.');
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
            className="fixed inset-0 bg-black/70 z-[1900]"
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
                          onPhone={() => {
                            setAuthMethod('phone');
                            resetPhoneState();
                          }}
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
                                  {authMethod === 'email' ? 'Email sign-in' : 'Phone sign-in'}
                                </span>
                              </div>
                            </div>

                            {authMethod === 'email' ? (
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
                                    type="password"
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
                                </div>
                                {activeTab === 'register' && (
                                  <div className="relative">
                                    <ShieldCheck
                                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                        isDarkMode ? 'text-white/20' : 'text-black/20'
                                      }`}
                                    />
                                    <input
                                      type="password"
                                      required
                                      value={confirmPassword}
                                      onChange={(e) => setConfirmPassword(e.target.value)}
                                      placeholder={t('confirmPasswordPlaceholder')}
                                      className={inputClass}
                                    />
                                  </div>
                                )}
                                {activeTab === 'login' && (
                                  <div className="flex justify-end px-1">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (!email) {
                                          appToast.error('Please enter your email address first.');
                                          return;
                                        }
                                        try {
                                          await resetPassword(email);
                                          appToast.success('Password reset link sent to your email.');
                                        } catch (error) {
                                          handleAuthError(error, 'email', t);
                                        }
                                      }}
                                      className={linkClass}
                                    >
                                      Forgot Password?
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
                            ) : (
                              <form onSubmit={handlePhoneAuth} className="space-y-3 md:space-y-4">
                                <div className="relative">
                                  <Smartphone
                                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                      isDarkMode ? 'text-white/20' : 'text-black/20'
                                    }`}
                                  />
                                  <input
                                    type="tel"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={t('phoneNumberPlaceholder') || 'Phone (+351 9xx xxx xxx)'}
                                    disabled={isOtpSent}
                                    className={`${inputClass} disabled:opacity-50`}
                                  />
                                  {showPhoneDebug && phoneNumber && !isOtpSent && (
                                    <p className="mt-1 text-[10px] font-mono text-accent/80 px-1">
                                      E.164 preview: {toE164(phoneNumber) || '—'}
                                    </p>
                                  )}
                                </div>
                                {isOtpSent && (
                                  <div className="relative">
                                    <Key
                                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
                                        isDarkMode ? 'text-white/20' : 'text-black/20'
                                      }`}
                                    />
                                    <input
                                      type="text"
                                      required
                                      value={otp}
                                      onChange={(e) => setOtp(e.target.value)}
                                      placeholder={t('verificationCodePlaceholder') || 'Verification Code'}
                                      className={inputClass}
                                    />
                                  </div>
                                )}
                                {/* Invisible reCAPTCHA anchor — must exist before render() */}
                                <div
                                  id="recaptcha-container"
                                  className="min-h-[1px]"
                                  aria-hidden="true"
                                />
                                {showPhoneDebug && (
                                  <div
                                    className={`rounded-xl border p-3 text-[10px] font-mono space-y-1 ${
                                      isDarkMode
                                        ? 'bg-black/40 border-white/10 text-white/70'
                                        : 'bg-black/5 border-black/10 text-black/70'
                                    }`}
                                  >
                                    <p className="font-bold text-accent uppercase tracking-wider">
                                      Phone auth debug
                                    </p>
                                    <p>reCAPTCHA: {recaptchaState}</p>
                                    <p>Phone flow: {phoneAuthState}</p>
                                    {normalizedPhone && <p>E.164: {normalizedPhone}</p>}
                                    {lastFirebaseCode && (
                                      <p className="text-red-400">Last Firebase code: {lastFirebaseCode}</p>
                                    )}
                                    <p className="opacity-60">
                                      Domain: {window.location.hostname} — must be in Firebase Authorized domains
                                    </p>
                                  </div>
                                )}
                                {isOtpSent && (
                                  <div className="flex justify-end px-1">
                                    <button type="button" onClick={resetPhoneState} className={linkClass}>
                                      {t('changeNumber') || 'Change Number'}
                                    </button>
                                  </div>
                                )}
                                <button
                                  type="submit"
                                  disabled={Boolean(loadingProvider)}
                                  className={submitClass}
                                >
                                  {loadingProvider === 'phone'
                                    ? t('processing')
                                    : isOtpSent
                                      ? t('verifyOTP') || 'Verify OTP'
                                      : t('sendOTP') || 'Send OTP'}
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
