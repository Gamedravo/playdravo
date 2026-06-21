import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Zap } from 'lucide-react';
import { GameDravoMark } from './GameDravoLogo';
import { GoogleIcon, MicrosoftIcon, GitHubIcon } from '../lib/authProviders';

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

const PROVIDERS = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: <GoogleIcon className="w-[18px] h-[18px]" />,
  },
  {
    id: 'microsoft',
    label: 'Continue with Microsoft',
    icon: <MicrosoftIcon className="w-[18px] h-[18px]" />,
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: <GitHubIcon className="w-[18px] h-[18px]" />,
  },
] as const;

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const handleLogin = () => {
    window.location.href = '/api/login';
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
                        {t('login') || 'Sign In'}
                      </h3>
                      {isDarkMode && (
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                          <Zap className="w-3 h-3 text-cyan-400" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400/70">
                            Secure Access
                          </p>
                        </div>
                      )}
                      {!isDarkMode && (
                        <p className="mt-1 text-sm text-black/55">
                          Welcome back. Sign in to continue your GameDravo session.
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Divider */}
                  {isDarkMode && (
                    <div className="w-full h-px"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.25), rgba(124,58,237,0.2), transparent)' }} />
                  )}

                  {/* Provider buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                    className="flex flex-col gap-2.5"
                  >
                    {PROVIDERS.map((provider, i) => (
                      <motion.button
                        key={provider.id}
                        onClick={handleLogin}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.22 }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                          isDarkMode
                            ? 'bg-white/[0.05] border border-white/[0.09] hover:bg-white/[0.09] hover:border-white/[0.16] text-white/90'
                            : 'bg-black/[0.03] border border-black/[0.09] hover:bg-black/[0.07] text-black/85'
                        }`}
                      >
                        <span className="shrink-0">{provider.icon}</span>
                        <span className="flex-1 text-left">{provider.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>

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
