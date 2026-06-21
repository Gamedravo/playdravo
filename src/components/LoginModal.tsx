import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Eye, EyeOff, Mail, Lock, User,
  Sword, Shield, Star, Zap, Trophy, Crown,
  Gamepad2, Flame, Loader2
} from 'lucide-react';
import { GameDravoMark } from './GameDravoLogo';
import { GoogleIcon, MicrosoftIcon, GitHubIcon } from '../lib/authProviders';
import { signInWithGoogle, signInWithMicrosoft, signInWithGithub } from '../firebase';
import { isAuthCancelError } from '../lib/oauthSignIn';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

const FLOATING_ICONS = [
  { Icon: Sword,    x: 8,  y: 15, size: 22, delay: 0,    duration: 7,  color: '#7c3aed' },
  { Icon: Shield,   x: 88, y: 20, size: 18, delay: 1.2,  duration: 8,  color: '#06b6d4' },
  { Icon: Star,     x: 20, y: 70, size: 14, delay: 2,    duration: 6,  color: '#f59e0b' },
  { Icon: Trophy,   x: 80, y: 65, size: 20, delay: 0.5,  duration: 9,  color: '#7c3aed' },
  { Icon: Crown,    x: 50, y: 8,  size: 16, delay: 3,    duration: 7,  color: '#f59e0b' },
  { Icon: Flame,    x: 5,  y: 45, size: 18, delay: 1.5,  duration: 8,  color: '#ef4444' },
  { Icon: Zap,      x: 93, y: 45, size: 15, delay: 2.5,  duration: 6,  color: '#06b6d4' },
  { Icon: Gamepad2, x: 55, y: 90, size: 20, delay: 0.8,  duration: 9,  color: '#7c3aed' },
  { Icon: Star,     x: 35, y: 85, size: 12, delay: 3.5,  duration: 7,  color: '#06b6d4' },
  { Icon: Sword,    x: 75, y: 88, size: 16, delay: 1.8,  duration: 8,  color: '#f59e0b' },
];

function FloatingIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {FLOATING_ICONS.map(({ Icon, x, y, size, delay, duration, color }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${x}%`, top: `${y}%` }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, i % 2 === 0 ? 12 : -12, 0],
            opacity: [0.18, 0.45, 0.18],
          }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon style={{ color, width: size, height: size, filter: `drop-shadow(0 0 6px ${color})` }} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

function GlowOrb({ x, y, color, size }: { x: string; y: string; color: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x, top: y,
        width: size, height: size,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: 'blur(40px)',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

type Tab = 'signin' | 'register';

export function LoginModal({ isOpen, onClose, isDarkMode, t }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEmail(''); setPassword(''); setUsername('');
      setError(''); setSuccess(''); setLoading(null); setTab('signin');
    }
  }, [isOpen]);

  const handleOAuth = async (provider: 'google' | 'microsoft' | 'github') => {
    setError('');
    setLoading(provider);
    try {
      const signIn =
        provider === 'google' ? signInWithGoogle :
        provider === 'microsoft' ? signInWithMicrosoft :
        signInWithGithub;

      const credential = await signIn();
      const idToken = await credential.user.getIdToken();

      const res = await fetch('/api/auth/firebase/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Sign-in failed. Please try again.');
        return;
      }

      setSuccess('Welcome to GameDravo!');
      setTimeout(() => { onClose(); window.location.reload(); }, 700);
    } catch (err: any) {
      if (!isAuthCancelError(err)) {
        const code: string = err?.code || '';
        if (code === 'auth/unauthorized-domain') {
          setError(
            `This preview URL is not authorized in Firebase. Error: ${code}. ` +
            `To fix: go to Firebase Console → Authentication → Settings → Authorized domains → add this site's domain.`
          );
        } else {
          setError(`${err?.message || 'Sign-in failed.'} (${code || 'unknown'})`);
        }
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading('email');
    try {
      const endpoint = tab === 'register' ? '/api/auth/email/register' : '/api/auth/email/login';
      const body: Record<string, string> = { email, password };
      if (tab === 'register' && username) body.username = username;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Something went wrong.'); return; }

      setSuccess(tab === 'register' ? 'Account created! Welcome to GameDravo.' : 'Welcome back!');
      setTimeout(() => { onClose(); window.location.reload(); }, 900);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          {/* Backdrop */}
          <motion.div
            key="lm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[1900]"
            style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(7,5,30,0.97) 0%, rgba(0,0,0,0.98) 100%)' }}
            onClick={onClose}
          />

          {/* Grid overlay */}
          <div
            className="pointer-events-none fixed inset-0 z-[1901]"
            style={{
              backgroundImage: 'linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Background glow orbs */}
          <div className="pointer-events-none fixed inset-0 z-[1902] overflow-hidden">
            <GlowOrb x="20%" y="30%" color="rgba(124,58,237,0.4)" size={400} />
            <GlowOrb x="80%" y="70%" color="rgba(6,182,212,0.3)" size={320} />
            <GlowOrb x="60%" y="20%" color="rgba(239,68,68,0.2)" size={260} />
          </div>

          {/* Floating game icons */}
          <div className="pointer-events-none fixed inset-0 z-[1903]">
            <FloatingIcons />
          </div>

          {/* Modal */}
          <div className="relative z-[2000] w-full h-full overflow-y-auto flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md"
              style={{
                background: 'linear-gradient(145deg, rgba(10,8,30,0.97) 0%, rgba(14,10,38,0.97) 100%)',
                border: '1px solid rgba(124,58,237,0.3)',
                borderRadius: '1.5rem',
                boxShadow: '0 0 0 1px rgba(124,58,237,0.1), 0 0 60px rgba(124,58,237,0.15), 0 0 120px rgba(6,182,212,0.08), 0 40px 80px rgba(0,0,0,0.8)',
              }}
            >
              {/* Top neon bar */}
              <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, #7c3aed, transparent)' }} />

              {/* Corner accents */}
              {['top-3 left-3 border-t-2 border-l-2', 'top-3 right-3 border-t-2 border-r-2', 'bottom-3 left-3 border-b-2 border-l-2', 'bottom-3 right-3 border-b-2 border-r-2'].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 pointer-events-none rounded-sm ${cls}`}
                  style={{ borderColor: 'rgba(6,182,212,0.4)' }} />
              ))}

              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 text-white/40 hover:text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-7 flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-2xl blur-xl"
                      style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.6), transparent 70%)' }}
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <GameDravoMark size={52} />
                  </motion.div>

                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.28 }}
                  >
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      {tab === 'signin' ? 'Welcome Back' : 'Join GameDravo'}
                    </h2>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: '#06b6d4' }}>
                      {tab === 'signin' ? '⚡ Ready to play?' : '🎮 Create your account'}
                    </p>
                  </motion.div>
                </div>

                {/* Tab switcher */}
                <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {(['signin', 'register'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError(''); }}
                      className="flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all relative"
                      style={{
                        color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                        background: tab === t ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'transparent',
                        boxShadow: tab === t ? '0 0 20px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                      }}
                    >
                      {t === 'signin' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <AnimatePresence mode="wait">
                    {tab === 'register' && (
                      <motion.div
                        key="username-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <InputField
                          icon={<User className="w-4 h-4" />}
                          placeholder="Username (optional)"
                          value={username}
                          onChange={setUsername}
                          type="text"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputField
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="Email address"
                    value={email}
                    onChange={setEmail}
                    type="email"
                  />

                  <div className="relative">
                    <InputField
                      icon={<Lock className="w-4 h-4" />}
                      placeholder={tab === 'register' ? 'Password (min 6 chars)' : 'Password'}
                      value={password}
                      onChange={setPassword}
                      type={showPw ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Error / success */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                      >
                        {error}
                      </motion.p>
                    )}
                    {success && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                      >
                        {success}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={!!loading}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white overflow-hidden transition-all disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #06b6d4 100%)',
                      boxShadow: '0 0 30px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
                    />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : tab === 'signin'
                          ? <><Zap className="w-4 h-4" /> Enter the Arena</>
                          : <><Crown className="w-4 h-4" /> Create Account</>
                      }
                    </span>
                  </motion.button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">or continue with</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* OAuth buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { icon: <GoogleIcon className="w-4 h-4" />, label: 'Google', id: 'google' },
                    { icon: <MicrosoftIcon className="w-4 h-4" />, label: 'Microsoft', id: 'microsoft' },
                    { icon: <GitHubIcon className="w-4 h-4" />, label: 'GitHub', id: 'github' },
                  ] as const).map(({ icon, label, id }) => (
                    <button
                      key={label}
                      onClick={() => handleOAuth(id)}
                      disabled={!!loading}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait text-white/50 hover:text-white/80"
                      style={{
                        background: loading === id ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${loading === id ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}
                      title={`Continue with ${label}`}
                    >
                      {loading === id ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : icon}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Guest note */}
                <p className="text-center text-[10px] text-white/20 font-medium">
                  Free to play — no payment required
                </p>
              </div>
            </motion.div>
          </div>
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
      className="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${focused ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12), 0 0 20px rgba(124,58,237,0.15)' : 'none',
      }}
    >
      <span style={{ color: focused ? '#7c3aed' : 'rgba(255,255,255,0.25)' }} className="transition-colors shrink-0">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none font-medium"
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'username'}
      />
    </div>
  );
}
