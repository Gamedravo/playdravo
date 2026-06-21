import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { GameDravoMark } from './GameDravoLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

const GAME_THUMBS = [
  'https://img.gamepix.com/games/subway-surfers/icon/subway-surfers.png',
  'https://img.gamepix.com/games/temple-run-2/icon/temple-run-2.png',
  'https://img.gamepix.com/games/stickman-hook/icon/stickman-hook.png',
  'https://img.gamepix.com/games/angry-birds-reloaded/icon/angry-birds-reloaded.png',
  'https://img.gamepix.com/games/slope/icon/slope.png',
  'https://img.gamepix.com/games/paper-io-2/icon/paper-io-2.png',
  'https://img.gamepix.com/games/snake-io/icon/snake-io.png',
];

const FAN_TRANSFORMS = [
  { rotate: -28, x: -110, y: 18, z: 1, scale: 0.82 },
  { rotate: -16, x: -68, y: 4, z: 2, scale: 0.9 },
  { rotate: -6,  x: -30, y: -4, z: 3, scale: 0.96 },
  { rotate: 0,   x: 0,   y: -8, z: 4, scale: 1 },
  { rotate: 6,   x: 30,  y: -4, z: 3, scale: 0.96 },
  { rotate: 16,  x: 68,  y: 4,  z: 2, scale: 0.9 },
  { rotate: 28,  x: 110, y: 18, z: 1, scale: 0.82 },
];

function GameFan() {
  return (
    <div className="relative flex items-end justify-center" style={{ height: 110, width: '100%' }}>
      {GAME_THUMBS.map((src, i) => {
        const t = FAN_TRANSFORMS[i];
        return (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden"
            style={{
              width: 64,
              height: 64,
              bottom: 0,
              left: '50%',
              transformOrigin: 'bottom center',
              transform: `translateX(calc(-50% + ${t.x}px)) translateY(${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
              zIndex: t.z,
              boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </motion.div>
        );
      })}

      {/* Logo centered on top of fan */}
      <motion.div
        className="absolute z-10 flex items-center justify-center rounded-2xl"
        style={{
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 60,
          height: 60,
          background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.12), 0 0 30px rgba(124,58,237,0.5)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <GameDravoMark size={36} />
      </motion.div>
    </div>
  );
}

type Tab = 'oauth' | 'email';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>('oauth');
  const [emailTab, setEmailTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEmail(''); setPassword(''); setUsername('');
      setError(''); setSuccess(''); setLoading(false);
      setTab('oauth'); setEmailTab('signin');
    }
  }, [isOpen]);

  const handleLogin = () => { window.location.href = '/api/login'; };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const endpoint = emailTab === 'register' ? '/api/auth/email/register' : '/api/auth/email/login';
      const body: Record<string, string> = { email, password };
      if (emailTab === 'register' && username) body.username = username;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); return; }
      setSuccess(emailTab === 'register' ? 'Account created! Welcome to GameDravo.' : 'Welcome back!');
      setTimeout(() => { onClose(); window.location.reload(); }, 900);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="lm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[2001] w-full max-w-sm"
            style={{
              background: 'linear-gradient(160deg, #111827 0%, #0d1117 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pt-8 pb-7 px-6 flex flex-col gap-5">
              {/* Fan header */}
              <GameFan />

              {/* Title */}
              <motion.div
                className="text-center mt-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-white tracking-tight">Welcome to GameDravo</h2>
                <p className="text-sm text-white/45 mt-1">Keep your gaming journey in one place</p>
              </motion.div>

              <AnimatePresence mode="wait">
                {tab === 'oauth' ? (
                  <motion.div
                    key="oauth"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Primary login button */}
                    <motion.button
                      onClick={handleLogin}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        boxShadow: '0 0 24px rgba(124,58,237,0.4)',
                      }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                      </svg>
                      Log in with Replit
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <span className="text-xs text-white/25 font-medium">or</span>
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    {/* Email/password link */}
                    <button
                      onClick={() => setTab('email')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Continue with Email
                    </button>

                    <p className="text-center text-xs text-white/20 mt-1">
                      Free to play — no payment required
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Back + tab toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTab('oauth')}
                        className="text-white/40 hover:text-white/80 transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex flex-1 rounded-lg p-0.5 gap-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {(['signin', 'register'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => { setEmailTab(t); setError(''); }}
                            className="flex-1 py-1.5 rounded-md text-xs font-semibold transition-all"
                            style={{
                              color: emailTab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                              background: emailTab === t ? 'rgba(124,58,237,0.7)' : 'transparent',
                            }}
                          >
                            {t === 'signin' ? 'Sign In' : 'Sign Up'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2.5">
                      <AnimatePresence>
                        {emailTab === 'register' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            <InputField icon={<User className="w-4 h-4" />} placeholder="Username (optional)" value={username} onChange={setUsername} type="text" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <InputField icon={<Mail className="w-4 h-4" />} placeholder="Email address" value={email} onChange={setEmail} type="email" />

                      <div className="relative">
                        <InputField icon={<Lock className="w-4 h-4" />} placeholder="Password" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                            {error}
                          </motion.p>
                        )}
                        {success && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                            {success}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : emailTab === 'signin' ? 'Sign In' : 'Create Account'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputField({ icon, placeholder, value, onChange, type }: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${focused ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.1)' : 'none',
      }}
    >
      <span style={{ color: focused ? '#7c3aed' : 'rgba(255,255,255,0.25)' }} className="transition-colors shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'username'}
      />
    </div>
  );
}
