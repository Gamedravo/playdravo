import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { GameDravoMark } from './GameDravoLogo';
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

function HudCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const styles: Record<string, string> = {
    tl: 'top-3 left-3 border-t-2 border-l-2',
    tr: 'top-3 right-3 border-t-2 border-r-2',
    bl: 'bottom-3 left-3 border-b-2 border-l-2',
    br: 'bottom-3 right-3 border-b-2 border-r-2',
  };
  return (
    <div className={`absolute w-4 h-4 pointer-events-none border-cyan-400/60 rounded-sm ${styles[pos]}`} />
  );
}

function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-px z-10"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)' }}
      initial={{ top: '0%' }}
      animate={{ top: '100%' }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
    />
  );
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
      ? 'bg-white/[0.04] border-white/[0.1] focus:border-cyan-400/50 placeholder:text-white/30 text-white'
      : 'bg-black/[0.03] border-black/10 focus:border-cyan-500/50 placeholder:text-black/35'
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
          {/* Backdrop */}
          <motion.div
            key="login-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1900]"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,5,20,0.97) 0%, rgba(0,0,0,0.97) 100%)' }}
          />

          {/* Backdrop grid */}
          <div
            className="pointer-events-none fixed inset-0 z-[1901] opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Glow orbs */}
          <div className="pointer-events-none fixed inset-0 z-[1902] overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{ width: 500, height: 500, top: '10%', left: '20%', background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)', filter: 'blur(50px)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute rounded-full"
              style={{ width: 380, height: 380, bottom: '10%', right: '15%', background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent 70%)', filter: 'blur(40px)' }}
            />
          </div>

          {/* Click-outside */}
          <div className="relative z-[2000] w-full h-full overflow-y-auto" onClick={onClose}>
            <div className="min-h-[100dvh] flex items-center justify-center p-4">
              <motion.div
                key="login-modal-container"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 10 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg flex flex-col overflow-hidden m-auto"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(145deg, rgba(5,7,18,0.99) 0%, rgba(8,10,24,0.99) 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  border: isDarkMode ? '1px solid rgba(34,211,238,0.18)' : '1px solid rgba(124,58,237,0.15)',
                  borderRadius: '1.5rem',
                  boxShadow: isDarkMode
                    ? '0 0 0 1px rgba(124,58,237,0.1), 0 0 50px rgba(34,211,238,0.08), 0 0 100px rgba(124,58,237,0.06), 0 40px 80px rgba(0,0,0,0.7)'
                    : '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(124,58,237,0.08)',
                }}
              >
                {/* HUD corners */}
                <HudCorner pos="tl" />
                <HudCorner pos="tr" />
                <HudCorner pos="bl" />
                <HudCorner pos="br" />

                {/* Scan line */}
                {isDarkMode && <ScanLine />}

                {/* Top neon line */}
                <div className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), rgba(124,58,237,0.4), transparent)' }} />

                {/* Close button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className={`absolute top-4 right-4 z-[60] w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${
                    isDarkMode
                      ? 'bg-white/[0.05] border border-white/[0.08] hover:bg-cyan-400/10 hover:border-cyan-400/30 text-white/50 hover:text-cyan-400'
                      : 'bg-black/[0.04] border border-black/10 hover:bg-black/10 text-black/50 hover:text-black'
                  }`}
                  aria-label="Close login modal"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-8 flex flex-col gap-5">
                  {/* Header */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative"
                    >
                      {isDarkMode && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl blur-xl"
                          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)' }}
                        />
                      )}
                      <GameDravoMark size={48} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.25 }}
                    >
                      <h3 className="text-xl font-black tracking-tight">
                        {isCreatingAccount ? 'Create Account' : t('login') || 'Sign In'}
                      </h3>
                      {isDarkMode && (
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400/70">
                            {isCreatingAccount ? 'Join GameDravo' : 'Secure Access'}
                          </p>
                        </div>
                      )}
                      {!isDarkMode && (
                        <p className="mt-1 text-sm text-black/55">
                          {isCreatingAccount
                            ? 'Register to save favorites, track history, and personalize GameDravo.'
                            : 'Welcome back. Sign in to continue your GameDravo session.'}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Divider */}
                  {isDarkMode && (
                    <div className="w-full h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), rgba(124,58,237,0.2), transparent)' }} />
                  )}

                  {/* Toggle card */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    className={`rounded-2xl border p-3 flex items-center justify-between gap-3 ${
                      isDarkMode
                        ? 'border-white/[0.07] bg-white/[0.03]'
                        : 'border-black/10 bg-black/[0.03]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">
                        {isCreatingAccount ? 'Already registered?' : 'Not registered yet?'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-white/45' : 'text-black/50'}`}>
                        {isCreatingAccount ? 'Switch back to login.' : 'Create a free account in seconds.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsCreatingAccount((v) => !v); setMessage(null); }}
                      className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.9), rgba(124,58,237,0.9))',
                        boxShadow: isDarkMode ? '0 0 16px rgba(34,211,238,0.2)' : 'none',
                      }}
                    >
                      {isCreatingAccount ? 'Sign in' : 'Register'}
                    </button>
                  </motion.div>

                  {/* Auth content */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.25 }}
                  >
                    {activeMethod === 'email' ? (
                      <form className="flex flex-col gap-3" onSubmit={handleEmailSubmit}>
                        <button
                          type="button"
                          onClick={() => setActiveMethod(null)}
                          className={`self-start inline-flex items-center gap-2 text-xs font-semibold transition-colors ${
                            isDarkMode ? 'text-white/55 hover:text-cyan-400' : 'text-black/60 hover:text-black'
                          }`}
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          {isCreatingAccount ? 'Back to register options' : 'Back to login options'}
                        </button>
                        <input
                          className={inputClass}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          autoComplete="email"
                        />
                        <input
                          className={inputClass}
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
                        />
                        <button
                          type="submit"
                          disabled={loadingProvider === 'email'}
                          className="w-full rounded-xl py-3 text-sm font-black text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                          style={{
                            background: 'linear-gradient(135deg, rgb(34,211,238), rgb(124,58,237))',
                            boxShadow: isDarkMode ? '0 0 24px rgba(34,211,238,0.25)' : 'none',
                          }}
                        >
                          {loadingProvider === 'email' ? (
                            <span className="inline-flex items-center gap-2 justify-center">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Please wait…
                            </span>
                          ) : isCreatingAccount ? 'Create account' : 'Sign in with email'}
                        </button>
                        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => { setIsCreatingAccount((v) => !v); setMessage(null); }}
                            className={`transition-colors ${isDarkMode ? 'text-cyan-400/80 hover:text-cyan-400' : 'text-accent hover:opacity-80'}`}
                          >
                            {isCreatingAccount ? 'Already registered? Sign in' : 'Not registered yet? Register'}
                          </button>
                          {!isCreatingAccount && (
                            <button
                              type="button"
                              onClick={handlePasswordReset}
                              className={`transition-colors ${isDarkMode ? 'text-white/45 hover:text-white' : 'text-black/55 hover:text-black'}`}
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
                  </motion.div>

                  {/* Message */}
                  {message && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border px-3 py-2.5 text-xs ${
                        isDarkMode
                          ? 'border-cyan-400/20 bg-cyan-400/[0.05] text-white/70'
                          : 'border-black/10 bg-black/[0.03] text-black/65'
                      }`}
                    >
                      {message}
                    </motion.p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <ShieldCheck className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-accent'}`} />
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/35' : 'text-black/40'}`}>
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
