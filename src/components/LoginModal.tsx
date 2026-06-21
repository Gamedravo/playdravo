import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  Gamepad2, Trophy, Users, ShieldCheck, CheckSquare, Square
} from 'lucide-react';
import { GameDravoMark } from './GameDravoLogo';
import { GoogleIcon, GitHubIcon, MicrosoftIcon } from '../lib/authProviders';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

type Tab = 'signin' | 'register';

const FEATURES = [
  { Icon: Gamepad2, top: 'Thousands', sub: 'of Games' },
  { Icon: Trophy,   top: 'Achievements', sub: '& Rewards' },
  { Icon: Users,    top: 'Play with', sub: 'Friends' },
  { Icon: ShieldCheck, top: 'Safe & Secure', sub: 'Experience' },
];

const LEFT_CARDS = [
  {
    title: 'TEKKEN 3',
    genre: 'FIGHTING',
    bg: 'linear-gradient(145deg,#160007 0%,#5c0a1a 55%,#8b0030 100%)',
    accent: '#ff1744',
    top: '5%', left: '-3%', rotate: -9, w: 148, h: 200,
  },
  {
    title: 'SHADOW FIGHT 2',
    genre: 'ACTION',
    bg: 'linear-gradient(145deg,#030b1c 0%,#08204d 55%,#0d3380 100%)',
    accent: '#40c4ff',
    top: '33%', left: '6%', rotate: 6, w: 148, h: 200,
  },
  {
    title: 'DRIFT FURY',
    genre: 'RACING',
    bg: 'linear-gradient(145deg,#0f0400 0%,#3d1000 55%,#8b2800 100%)',
    accent: '#ff6d00',
    bottom: '12%', left: '-1%', rotate: -13, w: 148, h: 200,
  },
];

const RIGHT_CARDS = [
  {
    title: 'NINJA ARASHI 2',
    genre: 'ACTION',
    bg: 'linear-gradient(145deg,#0b0014 0%,#25004d 55%,#4a0080 100%)',
    accent: '#ce93d8',
    top: '5%', right: '-3%', rotate: 9, w: 148, h: 200,
  },
  {
    title: 'STICKMAN FIGHT',
    genre: 'FIGHTING',
    bg: 'linear-gradient(145deg,#00041a 0%,#000f47 55%,#001a80 100%)',
    accent: '#82b1ff',
    top: '33%', right: '6%', rotate: -6, w: 148, h: 200,
  },
  {
    title: 'MOTO X3M',
    genre: 'RACING',
    bg: 'linear-gradient(145deg,#0f0800 0%,#3d2000 55%,#8b4a00 100%)',
    accent: '#ffca28',
    bottom: '12%', right: '-1%', rotate: 11, w: 148, h: 200,
  },
];

function GameCard({ card, idx }: { card: typeof LEFT_CARDS[number]; idx: number }) {
  const { title, genre, bg, accent, rotate, w, h, ...pos } = card;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, rotate }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ delay: 0.1 + idx * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        width: w,
        height: h,
        background: bg,
        borderRadius: 14,
        border: `1px solid ${accent}30`,
        boxShadow: `0 0 32px ${accent}18, 0 8px 40px #0008`,
        overflow: 'hidden',
        ...pos,
      }}
    >
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)`,
        }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 3.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(to top,rgba(0,0,0,0.9) 0%,transparent 100%)',
        padding: '40px 12px 14px',
      }}>
        <div style={{
          display: 'inline-block',
          background: `${accent}22`,
          border: `1px solid ${accent}55`,
          color: accent,
          fontSize: 8,
          fontWeight: 800,
          letterSpacing: '0.18em',
          padding: '2px 7px',
          borderRadius: 4,
          marginBottom: 5,
        }}>
          {genre}
        </div>
        <div style={{
          color: '#fff',
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: '0.06em',
          lineHeight: 1.2,
          textShadow: '0 2px 8px #000a',
        }}>
          {title}
        </div>
      </div>
      <div style={{
        position: 'absolute', top: 12, right: 12, width: 28, height: 4, borderRadius: 2,
        background: `linear-gradient(90deg, ${accent}90, ${accent}20)`,
      }} />
      <div style={{
        position: 'absolute', top: 22, right: 12, width: 18, height: 3, borderRadius: 2,
        background: `linear-gradient(90deg, ${accent}50, transparent)`,
      }} />
    </motion.div>
  );
}

function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
            height: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1,
            borderRadius: '50%',
            background: i % 4 === 0 ? '#a855f7' : i % 4 === 1 ? '#7c3aed' : i % 4 === 2 ? '#06b6d4' : '#ffffff',
            left: `${(i * 37 + 5) % 100}%`,
            top: `${(i * 53 + 8) % 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, i % 2 === 0 ? 0.7 : 0.4, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3.5 + (i % 5) * 0.7,
            delay: i * 0.22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function InputField({
  icon, placeholder, value, onChange, type, rightSlot,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px', height: 48, borderRadius: 10,
      background: 'rgba(255,255,255,0.05)',
      border: `1px solid ${focused ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <span style={{ color: focused ? '#a78bfa' : 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'color 0.2s' }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          color: '#fff', fontSize: 14, fontWeight: 500,
        }}
        className="placeholder-white/25"
      />
      {rightSlot}
    </div>
  );
}

export function LoginModal({ isOpen, onClose, isDarkMode: _, t: __ }: LoginModalProps) {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setEmail(''); setPassword(''); setUsername('');
      setError(''); setSuccess(''); setLoading(null); setTab('signin');
      setShowPw(false); setRemember(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleOAuth = (provider: 'google' | 'microsoft' | 'github') => {
    setLoading(provider);
    window.location.href = `/api/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (tab === 'register' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
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
        <motion.div
          key="login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%,#1a0535 0%,#0a001f 50%,#040010 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <Particles />

          {/* Purple ambient glow blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '15%', left: '20%', width: 500, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', bottom: '20%', right: '22%', width: 420, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,27,170,0.16) 0%,transparent 70%)', filter: 'blur(60px)' }} />
            <div style={{ position: 'absolute', top: '40%', left: '40%', width: 300, height: 260, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.1) 0%,transparent 70%)', filter: 'blur(50px)' }} />
          </div>

          {/* Left game cards */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {LEFT_CARDS.map((card, i) => <GameCard key={card.title} card={card} idx={i} />)}
            {RIGHT_CARDS.map((card, i) => <GameCard key={card.title} card={card} idx={i} />)}
          </div>

          {/* Center content */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
            width: '100%', maxWidth: 460, padding: '20px 20px 0',
          }}>
            {/* Logo + tagline */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.45 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 10 }}
            >
              <motion.div
                animate={{ filter: ['drop-shadow(0 0 18px #7c3aed60)', 'drop-shadow(0 0 32px #a855f780)', 'drop-shadow(0 0 18px #7c3aed60)'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <GameDravoMark size={56} />
              </motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '0.1em', color: '#fff', lineHeight: 1 }}>
                  GAME<span style={{ color: '#a855f7' }}>DRAVO</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: '0.02em' }}>
                  Play. Compete. Win.
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  Continue your gaming journey
                </div>
              </div>
            </motion.div>

            {/* Login card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                background: 'rgba(8,4,24,0.92)',
                border: '1px solid rgba(139,92,246,0.22)',
                borderRadius: 18,
                padding: '28px 28px 24px',
                boxShadow: '0 4px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div style={{ marginBottom: 20, textAlign: 'center' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
                  {tab === 'signin' ? 'Welcome Back!' : 'Join GameDravo!'}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                  {tab === 'signin'
                    ? 'Log in to your GameDravo account'
                    : 'Create your free account today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence mode="wait">
                  {tab === 'register' && (
                    <motion.div
                      key="username"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 48, marginBottom: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <InputField
                        icon={<User size={16} />}
                        placeholder="Username (optional)"
                        value={username}
                        onChange={setUsername}
                        type="text"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputField
                  icon={<Mail size={16} />}
                  placeholder={tab === 'signin' ? 'Email or Username' : 'Email address'}
                  value={email}
                  onChange={setEmail}
                  type="email"
                />

                <InputField
                  icon={<Lock size={16} />}
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  type={showPw ? 'text' : 'password'}
                  rightSlot={
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.3)', lineHeight: 1, flexShrink: 0 }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                {tab === 'signin' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                    <button type="button" onClick={() => setRemember(!remember)}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', fontSize: 13, padding: 0 }}>
                      {remember
                        ? <CheckSquare size={16} color="#a855f7" />
                        : <Square size={16} />}
                      Remember me
                    </button>
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', fontSize: 13, fontWeight: 600, padding: 0 }}>
                      Forgot password?
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 12, fontWeight: 600, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', margin: 0 }}>
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 12, fontWeight: 600, padding: '8px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80', margin: 0 }}>
                      {success}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={!!loading}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 4,
                    width: '100%', height: 48, borderRadius: 10,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg,#7c3aed 0%,#9333ea 100%)',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.45)',
                    color: '#fff', fontSize: 15, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.7 : 1,
                    letterSpacing: '0.02em',
                  }}
                >
                  {loading === 'email'
                    ? <span style={{ opacity: 0.8 }}>Please wait…</span>
                    : tab === 'signin'
                      ? <><span>Log In</span><ArrowRight size={17} /></>
                      : <><span>Create Account</span><ArrowRight size={17} /></>}
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Google - prominent */}
                <motion.button
                  onClick={() => handleOAuth('google')}
                  disabled={!!loading}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', height: 46, borderRadius: 10,
                    background: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: 14, fontWeight: 700, color: '#1a1a1a',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {loading === 'google'
                    ? <span style={{ color: '#555' }}>Redirecting…</span>
                    : <><GoogleIcon className="w-5 h-5" /><span>Continue with Google</span></>}
                </motion.button>

                {/* GitHub + Microsoft - secondary row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { id: 'github' as const, Icon: GitHubIcon, label: 'GitHub' },
                    { id: 'microsoft' as const, Icon: MicrosoftIcon, label: 'Microsoft' },
                  ]).map(({ id, Icon, label }) => (
                    <motion.button
                      key={id}
                      onClick={() => handleOAuth(id)}
                      disabled={!!loading}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        height: 42, borderRadius: 10,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.75)',
                        opacity: loading === id ? 0.5 : loading ? 0.6 : 1,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {loading === id ? '…' : label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Switch tab */}
              <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 18, marginBottom: 0 }}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setTab(tab === 'signin' ? 'register' : 'signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', fontWeight: 700, fontSize: 13, padding: 0 }}
                >
                  {tab === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>

            {/* Features bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                display: 'flex', justifyContent: 'center', gap: 0,
                marginTop: 28, width: '100%',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingTop: 20,
              }}
            >
              {FEATURES.map(({ Icon, top, sub }, i) => (
                <div key={top} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '0 8px',
                  borderRight: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}>
                  <Icon size={20} style={{ color: 'rgba(168,85,247,0.8)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', lineHeight: 1.2 }}>{top}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Copyright */}
            <div style={{ marginTop: 16, marginBottom: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
              © 2026 <span style={{ color: 'rgba(168,85,247,0.6)', fontWeight: 600 }}>GameDravo</span>. All rights reserved.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
