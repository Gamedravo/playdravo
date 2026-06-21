import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft,
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
    color1: '#160007', color2: '#5c0a1a', color3: '#8b0030',
    accent: '#ff1744',
    topPct: 8, leftPct: -2, rotate: -12, w: 140, h: 210,
    stripes: ['#ff174420', '#ff174410', '#ff174408'],
  },
  {
    title: 'SHADOW FIGHT',
    genre: 'ACTION',
    color1: '#030b1c', color2: '#08204d', color3: '#0d3380',
    accent: '#40c4ff',
    topPct: 38, leftPct: 5, rotate: 7, w: 130, h: 195,
    stripes: ['#40c4ff20', '#40c4ff10', '#40c4ff08'],
  },
  {
    title: 'DRIFT FURY',
    genre: 'RACING',
    color1: '#0f0400', color2: '#3d1000', color3: '#8b2800',
    accent: '#ff6d00',
    topPct: 68, leftPct: -1, rotate: -10, w: 135, h: 200,
    stripes: ['#ff6d0020', '#ff6d0010', '#ff6d0008'],
  },
];

const RIGHT_CARDS = [
  {
    title: 'NINJA ARASHI',
    genre: 'ACTION',
    color1: '#0b0014', color2: '#25004d', color3: '#4a0080',
    accent: '#ce93d8',
    topPct: 8, rightPct: -2, rotate: 12, w: 140, h: 210,
    stripes: ['#ce93d820', '#ce93d810', '#ce93d808'],
  },
  {
    title: 'STICKMAN FIGHT',
    genre: 'FIGHTING',
    color1: '#00041a', color2: '#000f47', color3: '#001a80',
    accent: '#82b1ff',
    topPct: 38, rightPct: 5, rotate: -7, w: 130, h: 195,
    stripes: ['#82b1ff20', '#82b1ff10', '#82b1ff08'],
  },
  {
    title: 'MOTO X3M',
    genre: 'RACING',
    color1: '#0f0800', color2: '#3d2000', color3: '#8b4a00',
    accent: '#ffca28',
    topPct: 68, rightPct: -1, rotate: 10, w: 135, h: 200,
    stripes: ['#ffca2820', '#ffca2810', '#ffca2808'],
  },
];

type CardData = typeof LEFT_CARDS[number] & { leftPct?: number; rightPct?: number };

function GameCard({ card, idx, side }: { card: CardData; idx: number; side: 'left' | 'right' }) {
  const posStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${card.topPct}%`,
    ...(side === 'left' ? { left: `${card.leftPct}%` } : { right: `${card.rightPct}%` }),
    width: card.w,
    height: card.h,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, rotate: card.rotate * 0.5 }}
      animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
      transition={{ delay: 0.08 + idx * 0.13, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={posStyle}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + idx * 0.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
        style={{
          width: '100%', height: '100%',
          borderRadius: 16,
          background: `linear-gradient(155deg, ${card.color1} 0%, ${card.color2} 50%, ${card.color3} 100%)`,
          border: `1px solid ${card.accent}35`,
          boxShadow: `0 0 0 1px ${card.accent}15, 0 8px 32px rgba(0,0,0,0.7), 0 0 40px ${card.accent}12`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Screen glare */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: `linear-gradient(160deg, ${card.accent}18 0%, transparent 70%)`,
          borderRadius: '16px 16px 0 0',
        }} />

        {/* Scanline texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)',
        }} />

        {/* Animated accent bar top-right */}
        <motion.div
          animate={{ scaleX: [1, 0.6, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2.5 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 32, height: 4, borderRadius: 2,
            background: `linear-gradient(90deg, ${card.accent}, ${card.accent}40)`,
            transformOrigin: 'right',
          }}
        />
        <div style={{
          position: 'absolute', top: 21, right: 12,
          width: 20, height: 2.5, borderRadius: 2,
          background: `linear-gradient(90deg, ${card.accent}60, transparent)`,
        }} />

        {/* Pixel art dots */}
        <div style={{ position: 'absolute', top: 14, left: 12, display: 'flex', gap: 4 }}>
          {[card.accent, `${card.accent}80`, `${card.accent}40`].map((c, j) => (
            <div key={j} style={{ width: 5, height: 5, borderRadius: 1, background: c }} />
          ))}
        </div>

        {/* Center icon area */}
        <div style={{
          position: 'absolute', top: '30%', left: 0, right: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: `${card.accent}18`,
            border: `1px solid ${card.accent}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: `linear-gradient(135deg, ${card.accent}60, ${card.accent}20)`,
            }} />
          </div>
        </div>

        {/* Bottom info */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)`,
          padding: '32px 12px 14px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: `${card.accent}22`,
            border: `1px solid ${card.accent}55`,
            color: card.accent,
            fontSize: 8, fontWeight: 800, letterSpacing: '0.2em',
            padding: '2px 7px', borderRadius: 4, marginBottom: 6,
          }}>
            {card.genre}
          </div>
          <div style={{
            color: '#fff', fontSize: 12, fontWeight: 900,
            letterSpacing: '0.08em', lineHeight: 1.25,
            textShadow: `0 2px 12px rgba(0,0,0,0.9), 0 0 20px ${card.accent}30`,
          }}>
            {card.title}
          </div>
        </div>

        {/* Side edge glow */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          ...(side === 'left' ? { right: 0, width: 2 } : { left: 0, width: 2 }),
          background: `linear-gradient(to bottom, transparent, ${card.accent}60, transparent)`,
        }} />
      </motion.div>
    </motion.div>
  );
}

function FloatingOrb({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }}
      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 32 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: i % 4 === 0 ? 3 : i % 4 === 1 ? 2 : i % 4 === 2 ? 1.5 : 1,
            height: i % 4 === 0 ? 3 : i % 4 === 1 ? 2 : i % 4 === 2 ? 1.5 : 1,
            borderRadius: '50%',
            background: i % 5 === 0 ? '#a855f7' : i % 5 === 1 ? '#7c3aed' : i % 5 === 2 ? '#06b6d4' : i % 5 === 3 ? '#e879f9' : '#fff',
            left: `${(i * 37 + 5) % 100}%`,
            top: `${(i * 53 + 8) % 100}%`,
          }}
          animate={{
            y: [0, -(18 + (i % 3) * 8), 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * (i % 4) * 3, 0],
            opacity: [0, i % 2 === 0 ? 0.8 : 0.45, 0],
            scale: [0.4, 1.1, 0.4],
          }}
          transition={{
            duration: 3 + (i % 5) * 0.8,
            delay: i * 0.21,
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
      padding: '0 14px', height: 50, borderRadius: 12,
      background: focused ? 'rgba(139,92,246,0.07)' : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${focused ? 'rgba(139,92,246,0.65)' : 'rgba(255,255,255,0.09)'}`,
      boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.12), 0 2px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
      transition: 'all 0.2s ease',
    }}>
      <span style={{ color: focused ? '#a78bfa' : 'rgba(255,255,255,0.28)', flexShrink: 0, transition: 'color 0.2s' }}>
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
        className="placeholder-white/20"
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
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: '#05010f',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {/* ── Rich layered background ── */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {/* Base mesh gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 90% 70% at 50% 35%, #1a0535 0%, #0d0126 40%, #05010f 100%)',
            }} />

            {/* Animated orbs */}
            <FloatingOrb x="10%" y="20%" size={520} color="rgba(124,58,237,0.22)" delay={0} />
            <FloatingOrb x="60%" y="60%" size={440} color="rgba(79,27,170,0.18)" delay={1.5} />
            <FloatingOrb x="35%" y="45%" size={320} color="rgba(168,85,247,0.12)" delay={2.8} />
            <FloatingOrb x="75%" y="10%" size={280} color="rgba(99,102,241,0.14)" delay={0.8} />
            <FloatingOrb x="5%" y="70%" size={260} color="rgba(236,72,153,0.08)" delay={2} />

            {/* Subtle grid overlay */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.025,
              backgroundImage: `
                linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }} />

            {/* Top vignette */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 200,
              background: 'linear-gradient(to bottom, rgba(5,1,15,0.6) 0%, transparent 100%)',
            }} />
            {/* Bottom vignette */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
              background: 'linear-gradient(to top, rgba(5,1,15,0.7) 0%, transparent 100%)',
            }} />
            {/* Side vignettes */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(5,1,15,0.85) 100%)',
            }} />
          </div>

          <Particles />

          {/* ── Back button ── */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 24, left: 24, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '8px 14px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
              fontSize: 13, fontWeight: 600,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.2s ease',
            }}
            whileHover={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(168,85,247,0.5)' }}
            whileTap={{ scale: 0.96 }}
          >
            <ArrowLeft size={15} />
            Back
          </motion.button>

          {/* ── Floating game cards ── */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            {LEFT_CARDS.map((card, i) => (
              <GameCard key={card.title} card={card} idx={i} side="left" />
            ))}
            {RIGHT_CARDS.map((card, i) => (
              <GameCard key={card.title} card={card} idx={i} side="right" />
            ))}
          </div>

          {/* ── Center content ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '100%', maxWidth: 440, padding: '20px 20px 0',
          }}>

            {/* Logo + tagline */}
            <motion.div
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22, gap: 10 }}
            >
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 16px #7c3aed55)',
                    'drop-shadow(0 0 30px #a855f788)',
                    'drop-shadow(0 0 16px #7c3aed55)',
                  ]
                }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <GameDravoMark size={52} />
              </motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '0.12em', color: '#fff', lineHeight: 1 }}>
                  GAME<span style={{
                    background: 'linear-gradient(90deg, #a855f7, #818cf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>DRAVO</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginTop: 5, letterSpacing: '0.06em' }}>
                  Play. Compete. Win.
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                  Continue your gaming journey
                </div>
              </div>
            </motion.div>

            {/* ── Login card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.14, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                background: 'rgba(10,5,28,0.88)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 20,
                padding: '28px 28px 22px',
                boxShadow: '0 8px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Tab switcher */}
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.04)',
                borderRadius: 10, padding: 4, marginBottom: 20,
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                {(['signin', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                    style={{
                      flex: 1, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, transition: 'all 0.2s ease',
                      background: tab === t ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'transparent',
                      color: tab === t ? '#fff' : 'rgba(255,255,255,0.4)',
                      boxShadow: tab === t ? '0 2px 12px rgba(124,58,237,0.4)' : 'none',
                    }}
                  >
                    {t === 'signin' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                  {tab === 'signin' ? 'Welcome Back!' : 'Join GameDravo!'}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 4, marginBottom: 0 }}>
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
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 50 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,0.28)', lineHeight: 1, flexShrink: 0 }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                {tab === 'signin' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 1 }}>
                    <button type="button" onClick={() => setRemember(!remember)}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: 0 }}>
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
                  whileHover={{ boxShadow: '0 6px 32px rgba(124,58,237,0.6)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 4, width: '100%', height: 50, borderRadius: 12,
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 60%, #a855f7 100%)',
                    boxShadow: '0 4px 24px rgba(124,58,237,0.42)',
                    color: '#fff', fontSize: 15, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.75 : 1,
                    letterSpacing: '0.01em',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {loading === 'email'
                    ? <span style={{ opacity: 0.85 }}>Please wait…</span>
                    : tab === 'signin'
                      ? <><span>Log In</span><ArrowRight size={17} /></>
                      : <><span>Create Account</span><ArrowRight size={17} /></>}
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <motion.button
                  onClick={() => handleOAuth('google')}
                  disabled={!!loading}
                  whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', height: 48, borderRadius: 12,
                    background: '#ffffff',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: 14, fontWeight: 700, color: '#1a1a1a',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {loading === 'google'
                    ? <span style={{ color: '#555' }}>Redirecting…</span>
                    : <><GoogleIcon className="w-5 h-5" /><span>Continue with Google</span></>}
                </motion.button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { id: 'github' as const, Icon: GitHubIcon, label: 'GitHub' },
                    { id: 'microsoft' as const, Icon: MicrosoftIcon, label: 'Microsoft' },
                  ]).map(({ id, Icon, label }) => (
                    <motion.button
                      key={id}
                      onClick={() => handleOAuth(id)}
                      disabled={!!loading}
                      whileHover={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(168,85,247,0.35)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.055)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.72)',
                        opacity: loading === id ? 0.5 : loading ? 0.65 : 1,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {loading === id ? '…' : label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Switch tab */}
              <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 18, marginBottom: 0 }}>
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              style={{
                display: 'flex', justifyContent: 'center', gap: 0,
                marginTop: 24, width: '100%',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 18,
              }}
            >
              {FEATURES.map(({ Icon, top, sub }, i) => (
                <div key={top} style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '0 8px',
                  borderRight: i < FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={16} style={{ color: '#a855f7' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{top}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', lineHeight: 1.3 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            <div style={{ marginTop: 14, marginBottom: 20, fontSize: 11, color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>
              © 2026 <span style={{ color: 'rgba(168,85,247,0.5)', fontWeight: 600 }}>GameDravo</span>. All rights reserved.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
