import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, LogIn } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const handleLogin = () => {
    window.location.href = '/api/login';
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

                <div className="p-8 flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <PlayDravoMark size={48} />
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {t('login') || 'Sign In'}
                      </h3>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-white/55' : 'text-black/55'}`}>
                        Sign in to save favorites, track history, and personalize PlayDravo.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <LogIn className="w-4 h-4" />
                    Log in
                  </button>

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
