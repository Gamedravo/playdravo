import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, Rocket, Lock, Key, Smartphone, ChevronRight, LogIn } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, setupRecaptcha, signInWithPhone, auth } from '../firebase';
import { toast } from 'sonner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

type Tab = 'register' | 'login';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      // Cleanup recaptcha when modal closes
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha:", e);
        }
      }
    }
    return () => {
      window.setTimeout(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 280);
    };
  }, [isOpen]);

  const handleSocialLogin = async (method: 'google' | 'phone') => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (method === 'google') {
        await signInWithGoogle();
        onClose();
        toast.success(t('loginSuccess') || 'Successfully logged in!');
      }
      if (method === 'phone') {
        setAuthMethod('phone');
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error(`${method.charAt(0).toUpperCase() + method.slice(1)} login is not enabled.`, {
          description: "Please enable this provider in your Firebase Console (Authentication > Sign-in method).",
          duration: 6000
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked by browser.', {
          description: "Please allow popups or open the app in a new tab to log in.",
          duration: 6000
        });
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('Unauthorized domain.', {
          description: "Please add this URL to your Firebase Authorized Domains.",
          duration: 6000
        });
      } else if (error.code === 'auth/web-storage-unsupported' || error.message.includes('cookie')) {
        toast.error('Cookies Blocked', {
          description: "Your browser is blocking cookies. Please open the app in a new tab or enable cookies to log in.",
          duration: 8000
        });
      } else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast.error(t('loginError') || 'Failed to login. Try opening the app in a new tab.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      setIsLoading(true);
      if (!isOtpSent) {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = setupRecaptcha('recaptcha-container');
        }
        const result = await signInWithPhone(phoneNumber, window.recaptchaVerifier);
        setConfirmationResult(result);
        setIsOtpSent(true);
        toast.success('OTP sent to your phone number!');
      } else {
        await confirmationResult.confirm(otp);
        toast.success(t('loginSuccess') || 'Successfully logged in!');
        onClose();
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Phone authentication is not enabled.', {
          description: "Please enable 'Phone' in your Firebase Console (Authentication > Sign-in method).",
          duration: 6000
        });
      } else {
        toast.error(error.message || 'Phone authentication failed.');
      }
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.error("Error clearing recaptcha:", e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      if (activeTab === 'register') {
        await signUpWithEmail(email, password);
        toast.success('Account created successfully! Welcome to the arena.');
      } else {
        await signInWithEmail(email, password);
        toast.success(t('loginSuccess') || 'Successfully logged in!');
      }
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password authentication is not enabled.', {
          description: "Please enable 'Email/Password' in your Firebase Console (Authentication > Sign-in method).",
          duration: 6000
        });
      } else {
        toast.error(error.message || 'Authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <div 
            className="relative z-[2000] w-full h-full"
            onClick={onClose}
          >
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
              <motion.div
                key="login-modal-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`relative w-full max-w-lg max-h-[95dvh] flex flex-col border rounded-[2rem] shadow-2xl overflow-hidden m-auto ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
              >
              {/* Background Decorative Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-24 -right-24 w-64 h-64 bg-accent rounded-full blur-[80px]" 
                />
                <div className={`absolute inset-0 opacity-[0.03] ${isDarkMode ? 'bg-[radial-gradient(#fff_1px,transparent_1px)]' : 'bg-[radial-gradient(#000_1px,transparent_1px)]'} [background-size:20px_20px]`} />
              </div>

              {/* Close Button - Stays fixed in the corner outside scroll */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className={`absolute top-4 right-4 md:top-5 md:right-5 z-[60] w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-black/50 backdrop-blur-md border-white/10 hover:bg-white/10 text-white' : 'bg-white/80 backdrop-blur-md border-black/10 hover:bg-black/10 text-black'}`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 flex flex-col flex-1 overflow-y-auto w-full custom-scrollbar">
                {/* Tab Navigation */}
                <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-4 md:py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'register' ? 'text-accent' : isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60'}`}
                  >
                    {t('register')}
                    {activeTab === 'register' && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-4 md:py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === 'login' ? 'text-accent' : isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-black/40 hover:text-black/60'}`}
                  >
                    {t('signIn')}
                    {activeTab === 'login' && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
                    )}
                  </button>
                </div>

                <div className="p-4 md:p-8">
                  <AnimatePresence mode="wait">
                    {activeTab === 'register' ? (
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-3 md:space-y-6"
                      >
                        <div className="text-center mb-3 md:mb-6">
                          <div className="w-8 h-8 md:w-12 md:h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-2 md:mb-3">
                            <Rocket className="w-4 h-4 md:w-6 md:h-6 text-accent" />
                          </div>
                          <h3 className="text-base md:text-xl font-bold tracking-tight">{t('createAccount')}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <AuthButton 
                            onClick={() => handleSocialLogin('google')}
                            icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                            label="Google"
                            isDarkMode={isDarkMode}
                            compact
                            disabled={isLoading}
                          />
                          <AuthButton 
                            onClick={() => handleSocialLogin('phone')}
                            icon={<Smartphone className="w-5 h-5" />}
                            label="Phone"
                            isDarkMode={isDarkMode}
                            compact
                            disabled={isLoading}
                          />
                        </div>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />
                          </div>
                          <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.3em]">
                            <span className={`px-4 ${isDarkMode ? 'bg-bg-dark text-white/20' : 'bg-white text-black/20'}`}>Or use {authMethod === 'email' ? 'email' : 'phone'}</span>
                          </div>
                        </div>

                        {authMethod === 'email' ? (
                          <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                              <div className="relative">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                  placeholder={t('emailPlaceholder')}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="relative">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                  placeholder={t('passwordPlaceholder')}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="relative">
                                <ShieldCheck className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder={t('confirmPasswordPlaceholder')}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <button 
                                type="button"
                                onClick={() => setAuthMethod('phone')}
                                className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                              >
                                {t('usePhoneInstead')}
                              </button>
                            </div>
                            <button 
                              type="submit" disabled={isLoading}
                              className="w-full mt-2 py-3.5 md:py-4 bg-accent text-bg-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                            >
                              {isLoading ? t('processing') : t('createAccount')}
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handlePhoneAuth} className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                              <div className="relative">
                                <Smartphone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder={t('phoneNumberPlaceholder') || "Phone Number"}
                                  disabled={isOtpSent}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} disabled:opacity-50`}
                                />
                              </div>
                            </div>
                            {isOtpSent && (
                              <div className="space-y-2">
                                <div className="relative">
                                  <Key className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                  <input 
                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                    placeholder={t('verificationCodePlaceholder') || "Verification Code"}
                                    className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                  />
                                </div>
                              </div>
                            )}
                            <div id="recaptcha-container"></div>
                            <div className="flex justify-between items-center px-1">
                              <button 
                                type="button"
                                onClick={() => {
                                  setAuthMethod('email');
                                  setIsOtpSent(false);
                                  setConfirmationResult(null);
                                }}
                                className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                              >
                                {t('useEmailInstead')}
                              </button>
                              {isOtpSent && (
                                <button 
                                  type="button"
                                  onClick={() => setIsOtpSent(false)}
                                  className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                                >
                                  Change Number
                                </button>
                              )}
                            </div>
                            <button 
                              type="submit" disabled={isLoading}
                              className="w-full mt-2 py-3.5 md:py-4 bg-accent text-bg-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                            >
                              {isLoading ? 'Processing...' : isOtpSent ? 'Verify OTP' : 'Send OTP'}
                            </button>
                          </form>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-5 md:space-y-6"
                      >
                        <div className="text-center mb-5 md:mb-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-3">
                            <LogIn className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold tracking-tight">Welcome <span className="text-accent">Back</span></h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <AuthButton 
                            onClick={() => handleSocialLogin('google')}
                            icon={<svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                            label="Google"
                            isDarkMode={isDarkMode}
                            compact
                            disabled={isLoading}
                          />
                          <AuthButton 
                            onClick={() => handleSocialLogin('phone')}
                            icon={<Smartphone className="w-5 h-5" />}
                            label="Phone"
                            isDarkMode={isDarkMode}
                            compact
                            disabled={isLoading}
                          />
                        </div>

                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDarkMode ? 'border-white/5' : 'border-black/5'}`} />
                          </div>
                          <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-[0.3em]">
                            <span className={`px-4 ${isDarkMode ? 'bg-bg-dark text-white/20' : 'bg-white text-black/20'}`}>{t('signInWith') || 'Or sign in with '} {authMethod === 'email' ? 'email' : 'phone'}</span>
                          </div>
                        </div>

                        {authMethod === 'email' ? (
                          <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                              <div className="relative">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                  placeholder={t('emailPlaceholder')}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="relative">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                  placeholder={t('passwordLoginPlaceholder')}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <button 
                                type="button"
                                onClick={() => setAuthMethod('phone')}
                                className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                              >
                                {t('usePhoneInstead')}
                              </button>
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
                                  } catch (error: any) {
                                    toast.error(error.message || 'Failed to send password reset email.');
                                  }
                                }}
                                className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                              >
                                Forgot Password?
                              </button>
                            </div>
                            <button 
                              type="submit" disabled={isLoading}
                              className="w-full mt-2 py-3.5 md:py-4 bg-accent text-bg-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                            >
                              {isLoading ? t('processing') : t('signIn')}
                            </button>
                          </form>
                        ) : (
                          <form onSubmit={handlePhoneAuth} className="space-y-3 md:space-y-4">
                            <div className="space-y-2">
                              <div className="relative">
                                <Smartphone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                <input 
                                  type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                                  placeholder={t('phoneNumberPlaceholder') || "Phone Number"}
                                  disabled={isOtpSent}
                                  className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} disabled:opacity-50`}
                                />
                              </div>
                            </div>
                            {isOtpSent && (
                              <div className="space-y-2">
                                <div className="relative">
                                  <Key className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                                  <input 
                                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                    placeholder={t('verificationCodePlaceholder') || "Verification Code"}
                                    className={`w-full py-3.5 pl-10 pr-4 rounded-xl md:rounded-2xl border focus:outline-none focus:border-accent transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`}
                                  />
                                </div>
                              </div>
                            )}
                            <div id="recaptcha-container"></div>
                            <div className="flex justify-between items-center px-1">
                              <button 
                                type="button"
                                onClick={() => {
                                  setAuthMethod('email');
                                  setIsOtpSent(false);
                                  setConfirmationResult(null);
                                }}
                                className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                              >
                                {t('useEmailInstead')}
                              </button>
                              {isOtpSent && (
                                <button 
                                  type="button"
                                  onClick={() => setIsOtpSent(false)}
                                  className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-accent/60 hover:text-accent' : 'text-accent/80 hover:text-accent'}`}
                                >
                                  {t('changeNumber')}
                                </button>
                              )}
                            </div>
                            <button 
                              type="submit" disabled={isLoading}
                              className="w-full mt-2 py-3.5 md:py-4 bg-accent text-bg-dark font-bold rounded-xl md:rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-accent/20"
                            >
                              {isLoading ? t('processing') : isOtpSent ? t('verifyOTP') : t('sendOTP')}
                            </button>
                          </form>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={`p-5 md:p-6 border-t flex flex-col sm:flex-row shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] items-center justify-center gap-3 md:gap-4 shrink-0 ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
                  <ShieldCheck className="w-4 h-4 text-accent hidden sm:block" />
                  <p className={`text-[9px] font-semibold tracking-wide text-center uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
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

function AuthButton({ onClick, icon, label, isDarkMode, compact, disabled }: { onClick: () => void; icon: React.ReactNode; label: string; isDarkMode: boolean; compact?: boolean; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 md:py-4 md:px-6 rounded-xl md:rounded-2xl border flex items-center justify-center gap-3 md:gap-4 transition-all group ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-accent/50' : 'bg-black/5 border-black/10 hover:bg-black/10 hover:border-accent/50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-all">
        {icon}
      </div>
      <span className={`font-semibold tracking-wide ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{label}</span>
      {!compact && <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-100 transition-all" />}
    </motion.button>
  );
}
