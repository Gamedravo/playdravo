import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  useEffect(() => {
    if (isOpen) {
      window.location.href = '/api/login';
    }
  }, [isOpen]);

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
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-8 flex flex-col items-center gap-4 text-center">
                  <PlayDravoMark size={48} />
                  <h3 className="text-lg font-bold tracking-tight">
                    {t('login') || 'Sign In'}
                  </h3>
                  <p className={`text-sm opacity-60 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Redirecting to Replit authentication…
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    <p className={`text-[9px] font-semibold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                      Secure Replit Authentication
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
