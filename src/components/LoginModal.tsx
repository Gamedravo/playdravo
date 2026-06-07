import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Shield, Cpu } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

function HudCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const base = 'absolute w-5 h-5 pointer-events-none';
  const styles: Record<string, string> = {
    tl: 'top-3 left-3 border-t-2 border-l-2',
    tr: 'top-3 right-3 border-t-2 border-r-2',
    bl: 'bottom-3 left-3 border-b-2 border-l-2',
    br: 'bottom-3 right-3 border-b-2 border-r-2',
  };
  return <div className={`${base} ${styles[pos]} border-cyan-400/70 rounded-sm`} />;
}

function ScanLine() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent z-10"
      initial={{ top: '0%' }}
      animate={{ top: '100%' }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
    />
  );
}

function GridBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(34,211,238,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  );
}

function GlitchTitle({ text }: { text: string }) {
  return (
    <div className="relative select-none">
      <span
        className="absolute inset-0 text-2xl font-black tracking-tight text-cyan-400/30 blur-[1px]"
        style={{ transform: 'translate(-1px, 0)', clipPath: 'inset(40% 0 50% 0)' }}
        aria-hidden
      >
        {text}
      </span>
      <span
        className="absolute inset-0 text-2xl font-black tracking-tight text-purple-400/25 blur-[1px]"
        style={{ transform: 'translate(1px, 0)', clipPath: 'inset(20% 0 70% 0)' }}
        aria-hidden
      >
        {text}
      </span>
      <motion.span
        className="relative text-2xl font-black tracking-tight text-white"
        animate={{ opacity: [1, 0.92, 1, 0.96, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.span>
    </div>
  );
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="login-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,8,25,0.97) 0%, rgba(0,0,0,0.98) 100%)' }}
            onClick={onClose}
          />

          {/* Backdrop grid */}
          <motion.div
            key="login-backdrop-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(34,211,238,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Glow orbs on backdrop */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute rounded-full"
              style={{ width: 480, height: 480, top: '15%', left: '25%', background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 70%)', filter: 'blur(40px)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.14, 0.22, 0.14] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute rounded-full"
              style={{ width: 360, height: 360, bottom: '15%', right: '20%', background: 'radial-gradient(circle, rgba(34,211,238,0.3), transparent 70%)', filter: 'blur(35px)' }}
            />
          </div>

          {/* Modal */}
          <motion.div
            ref={containerRef}
            key="login-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(145deg, rgba(6,8,20,0.98) 0%, rgba(10,12,28,0.98) 100%)',
              border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: '1.25rem',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.12), 0 0 60px rgba(34,211,238,0.1), 0 0 120px rgba(124,58,237,0.08), 0 40px 80px rgba(0,0,0,0.7)',
            }}
          >
            <HudCorner pos="tl" />
            <HudCorner pos="tr" />
            <HudCorner pos="bl" />
            <HudCorner pos="br" />
            <GridBg />
            <ScanLine />

            {/* Top cyan line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
            {/* Bottom purple line */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute top-4 right-4 z-30 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 text-white/40 hover:text-cyan-400"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 p-8 flex flex-col items-center gap-6">
              {/* Logo mark */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex items-center justify-center"
              >
                <motion.div
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute w-20 h-20 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent 70%)', filter: 'blur(8px)' }}
                />
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(124,58,237,0.12))',
                    border: '1px solid rgba(34,211,238,0.3)',
                    boxShadow: '0 0 20px rgba(34,211,238,0.15), inset 0 1px 0 rgba(34,211,238,0.1)',
                  }}
                >
                  <Zap className="w-7 h-7 text-cyan-400" strokeWidth={2.5} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.3 }}
                className="text-center flex flex-col gap-1.5"
              >
                <GlitchTitle text="ACCESS TERMINAL" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/60">
                  GameDravo · Secure Auth
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="w-full h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.3), rgba(124,58,237,0.3), transparent)' }}
              />

              {/* Info rows */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.3 }}
                className="w-full flex flex-col gap-2.5"
              >
                {[
                  { icon: Shield, label: 'End-to-end encrypted session', color: 'text-emerald-400' },
                  { icon: Cpu, label: 'Sync favorites & play history', color: 'text-purple-400' },
                  { icon: Zap, label: 'Instant access — no passwords', color: 'text-cyan-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${color}`}
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-white/60">{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="w-full"
              >
                <motion.button
                  onClick={handleLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative w-full overflow-hidden rounded-xl py-4 font-black text-sm tracking-[0.08em] uppercase text-black flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(135deg, rgb(34,211,238) 0%, rgb(124,58,237) 100%)',
                    boxShadow: '0 0 30px rgba(34,211,238,0.35), 0 0 60px rgba(124,58,237,0.2), 0 8px 24px rgba(0,0,0,0.4)',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  }}
                >
                  {/* Shine sweep */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                  />
                  <Zap className="w-4 h-4 shrink-0" strokeWidth={3} />
                  <span>Connect with Replit</span>
                </motion.button>
              </motion.div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20 text-center"
              >
                Secured by Replit OpenID Connect
              </motion.p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
