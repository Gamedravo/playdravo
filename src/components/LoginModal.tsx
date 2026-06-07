import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import { AuthProviderButtons, type AuthMethodId, type OAuthProviderId } from './AuthProviderButtons';
import {
  resetPassword,
  signInWithEmail,
  signInWithGithub,
  signInWithGoogle,
  signInWithMicrosoft,
  signUpWithEmail,
} from '../firebase';
import { handleAuthError } from '../lib/authErrors';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const [activeMethod, setActiveMethod] = useState<'email' | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<AuthMethodId | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors ${
    isDarkMode
      ? 'bg-white/[0.04] border-white/10 focus:border-accent/60 placeholder:text-white/30'
      : 'bg-black/[0.03] border-black/10 focus:border-accent/60 placeholder:text-black/35'
  }`;

  const runAuth = async (provider: AuthMethodId, action: () => Promise<unknown>) => {
    setLoadingProvider(provider);
    setMessage(null);
    try {
      await action();
      onClose();
    } catch (error) {
      const err = error as { message?: string };
      setMessage(err.message || 'Login failed. Please try again.');
      handleAuthError(error, provider, t);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleOAuth = (provider: OAuthProviderId) => {
    const providers = {
      google: signInWithGoogle,
      microsoft: signInWithMicrosoft,
      github: signInWithGithub,
    };
    runAuth(provider, providers[provider]);
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setMessage('Enter your email and password to continue.');
      return;
    }

    runAuth('email', () =>
      isCreatingAccount
        ? signUpWithEmail(normalizedEmail, password)
        : signInWithEmail(normalizedEmail, password)
    );
  };

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setMessage('Enter your email first, then request a reset link.');
      return;
    }

    setLoadingProvider('email');
    setMessage(null);
    try {
      await resetPassword(normalizedEmail);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error) {
      const err = error as { message?: string };
      setMessage(err.message || 'Could not send reset email.');
      handleAuthError(error, 'email', t);
    } finally {
      setLoadingProvider(null);
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
            className="fixed inset-0 bg-black/90 z-[1900]"
          />
          <div className="relative z-[2000] w-full h-full overflow-y-auto" onClick={onClose}>
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
              <motion.div
                key="login-modal-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className={`relative w-full max-w-lg flex flex-col border rounded-[2rem] shadow-2xl overflow-hidden m-auto ${
                  isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className={`absolute top-4 right-4 z-[60] w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                    isDarkMode ? 'bg-black/50 border-white/10 hover:bg-white/10 text-white' : 'bg-white/90 border-black/10 hover:bg-black/10 text-black'
                  }`}
                  aria-label="Close login modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-8 flex flex-col gap-5">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <PlayDravoMark size={48} />
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {isCreatingAccount ? 'Create your account' : t('login') || 'Sign In'}
                      </h3>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/55' : 'text-black/55'}`}>
                        {isCreatingAccount
                          ? 'Register to save favorites, track history, and personalize PlayDravo.'
                          : 'Welcome back. Sign in to continue your PlayDravo session.'}
                      </p>
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-3 flex items-center justify-between gap-3 ${
                    isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-black/[0.03]'
                  }`}>
                    <div>
                      <p className="text-sm font-bold">
                        {isCreatingAccount ? 'Already registered?' : 'Not registered yet?'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        {isCreatingAccount ? 'Switch back to login.' : 'Create a free account in seconds.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingAccount((value) => !value);
                        setMessage(null);
                      }}
                      className="shrink-0 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                    >
                      {isCreatingAccount ? 'Sign in' : 'Register'}
                    </button>
                  </div>

                  {activeMethod === 'email' ? (
                    <form className="flex flex-col gap-3" onSubmit={handleEmailSubmit}>
                      <button
                        type="button"
                        onClick={() => setActiveMethod(null)}
                        className={`self-start inline-flex items-center gap-2 text-xs font-semibold ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'}`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {isCreatingAccount ? 'Back to register options' : 'Back to login options'}
                      </button>
                      <input
                        className={inputClass}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Email address"
                        autoComplete="email"
                      />
                      <input
                        className={inputClass}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
                      />
                      <button
                        type="submit"
                        disabled={loadingProvider === 'email'}
                        className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loadingProvider === 'email' ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Please wait…
                          </span>
                        ) : isCreatingAccount ? 'Create account' : 'Sign in with email'}
                      </button>
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingAccount((value) => !value);
                            setMessage(null);
                          }}
                          className="text-accent hover:opacity-80"
                        >
                          {isCreatingAccount ? 'Already registered? Sign in' : 'Not registered yet? Register'}
                        </button>
                        {!isCreatingAccount && (
                          <button
                            type="button"
                            onClick={handlePasswordReset}
                            className={isDarkMode ? 'text-white/55 hover:text-white' : 'text-black/55 hover:text-black'}
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <AuthProviderButtons
                      isDarkMode={isDarkMode}
                      loadingProvider={loadingProvider}
                      activeMethod={activeMethod}
                      onOAuth={handleOAuth}
                      onEmail={() => setActiveMethod('email')}
                    />
                  )}

                  {message && (
                    <p className={`rounded-xl border px-3 py-2 text-xs ${
                      isDarkMode ? 'border-white/10 bg-white/[0.04] text-white/70' : 'border-black/10 bg-black/[0.03] text-black/65'
                    }`}>
                      {message}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                      Secure Authentication
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
