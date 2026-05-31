import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, Rocket, Lock, Key, Smartphone, LogIn } from 'lucide-react';
import {
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithGithub,
  signInWithEmail,
  signUpWithEmail,
  setupRecaptcha,
  signInWithPhone,
  auth,
} from '../firebase';
import { toast } from 'sonner';
import { AuthProviderButtons, type AuthMethodId, type OAuthProviderId } from './AuthProviderButtons';
import { handleAuthError } from '../lib/authErrors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

type Tab = 'register' | 'login';

declare global {
  interface Window {
    recaptchaVerifier: import('firebase/auth').RecaptchaVerifier | null;
  }
}

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

  const resetPhoneState = useCallback(() => {
    setIsOtpSent(false);
    setConfirmationResult(null);
    setOtp('');
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      } catch (e) {
        console.error('Error clearing recaptcha:', e);
      }
    }
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
      toast.success(t('loginSuccess') || 'Successfully logged in!');
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
    try {
      if (!isOtpSent) {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
        }
        const result = await signInWithPhone(phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(result);
        setIsOtpSent(true);
        toast.success('OTP sent to your phone number!');
      } else {
        await confirmationResult!.confirm(otp);
        toast.success(t('loginSuccess') || 'Successfully logged in!');
        onClose();
      }
    } catch (error) {
      handleAuthError(error, 'phone', t);
      resetPhoneState();
    } finally {
      resetAuthLoading();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoadingProvider('email');
      if (activeTab === 'register') {
        await signUpWithEmail(email, password);
        toast.success('Account created successfully! Welcome to the arena.');
      } else {
        await signInWithEmail(email, password);
        toast.success(t('loginSuccess') || 'Successfully logged in!');
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900]"
          />
          <div className="relative z-[2000] w-full h-full" onClick={onClose}>
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
              <motion.div
                key="login-modal-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`relative w-full max-w-lg max-h-[95dvh] flex flex-col border rounded-[2rem] shadow-2xl overflow-hidden m-auto ${
                  isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'
                }`}
              >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-24 -right-24 w-64 h-64 bg-accent rounded-full blur-[80px]"
                  />
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
                  className={`absolute top-4 right-4 md:top-5 md:right-5 z-[60] w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                    isDarkMode
                      ? 'bg-black/50 backdrop-blur-md border-white/10 hover:bg-white/10 text-white'
                      : 'bg-white/80 backdrop-blur-md border-black/10 hover:bg-black/10 text-black'
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
                          <div className="w-9 h-9 md:w-11 md:h-11 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-2">
                            {activeTab === 'register' ? (
                              <Rocket className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                            ) : (
                              <LogIn className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                            )}
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
                                          toast.error('Please enter your email address first.');
                                          return;
                                        }
                                        try {
                                          const { sendPasswordResetEmail } = await import('firebase/auth');
                                          await sendPasswordResetEmail(auth, email);
                                          toast.success('Password reset link sent to your email.');
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
                                    placeholder={t('phoneNumberPlaceholder') || 'Phone Number (+1...)'}
                                    disabled={isOtpSent}
                                    className={`${inputClass} disabled:opacity-50`}
                                  />
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
                                <div id="recaptcha-container" />
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
