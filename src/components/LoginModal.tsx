import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft,
  CheckSquare, Square,
} from 'lucide-react';
import { GoogleIcon, GitHubIcon, MicrosoftIcon } from '../lib/authProviders';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

type Tab = 'signin' | 'register';

/* ── Real game cards using onlinegames.io CDN ── */
const CARDS = [
  {
    title: 'Drift Hunters Pro',
    genre: 'RACING',
    image: 'https://www.onlinegames.io/media/posts/397/responsive/Drift-Hunters-Pro-xs.jpg',
    accent: '#f97316',
    rotate: -14, top: '6%', left: '-4%',
    fallback: 'linear-gradient(145deg,#0f0400,#3d1000,#8b2800)',
  },
  {
    title: 'CS Online',
    genre: 'SHOOTER',
    image: 'https://www.onlinegames.io/media/posts/434/responsive/CS-Online-xs.jpg',
    accent: '#22d3ee',
    rotate: 7, top: '36%', left: '4%',
    fallback: 'linear-gradient(145deg,#00040f,#001a3d,#003380)',
  },
  {
    title: 'Madalin Stunt Cars',
    genre: 'RACING',
    image: 'https://www.onlinegames.io/media/posts/401/responsive/Madalin-Stunt-Cars-Pro-Game-xs.jpg',
    accent: '#facc15',
    rotate: -10, top: '66%', left: '-2%',
    fallback: 'linear-gradient(145deg,#0f0800,#3d2000,#8b4a00)',
  },
  {
    title: 'Special Forces FPS',
    genre: 'ACTION',
    image: 'https://www.onlinegames.io/media/posts/310/responsive/Masked-Special-Forces-FPS-xs.jpg',
    accent: '#4ade80',
    rotate: 13, top: '6%', right: '-4%',
    fallback: 'linear-gradient(145deg,#001a00,#003d00,#006600)',
  },
  {
    title: 'Stickman GTA City',
    genre: 'ACTION',
    image: 'https://www.onlinegames.io/media/posts/900/responsive/stickman-gta-city-free-xs.jpg',
    accent: '#a78bfa',
    rotate: -8, top: '36%', right: '4%',
    fallback: 'linear-gradient(145deg,#0b0014,#25004d,#4a0080)',
  },
  {
    title: 'Velocity Rush',
    genre: 'RACING',
    image: 'https://www.onlinegames.io/media/posts/1265/responsive/velocity-rush-xs.webp',
    accent: '#f43f5e',
    rotate: 10, top: '66%', right: '-2%',
    fallback: 'linear-gradient(145deg,#160007,#5c0a1a,#8b0030)',
  },
];

type CardDef = typeof CARDS[number];

function GameCard({ card, idx }: { card: CardDef; idx: number }) {
  const [imgOk, setImgOk] = useState(true);
  const posStyle: React.CSSProperties = {
    position: 'absolute',
    top: card.top,
    ...('left' in card && card.left !== undefined ? { left: card.left } : {}),
    ...('right' in card && card.right !== undefined ? { right: card.right } : {}),
    width: 148,
    height: 210,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: (card.rotate ?? 0) * 0.5 }}
      animate={{ opacity: 1, scale: 1, rotate: card.rotate ?? 0 }}
      transition={{ delay: 0.05 + idx * 0.1, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      style={posStyle}
    >
      <motion.div
        animate={{ y: [0, idx % 2 === 0 ? -8 : -5, 0] }}
        transition={{ duration: 4.5 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.35 }}
        style={{ width: '100%', height: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden' }}
      >
        {/* Photo or fallback gradient */}
        {imgOk ? (
          <img
            src={card.image}
            alt={card.title}
            onError={() => setImgOk(false)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: card.fallback }} />
        )}

        {/* Overlay layers */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.92) 100%)` }} />

        {/* Neon border */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16,
          border: `1.5px solid ${card.accent}55`,
          boxShadow: `0 0 0 1px ${card.accent}22, inset 0 0 20px ${card.accent}08, 0 8px 40px rgba(0,0,0,0.8), 0 0 30px ${card.accent}18`,
          pointerEvents: 'none',
        }} />

        {/* Top glare */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: `linear-gradient(160deg, ${card.accent}14 0%, transparent 60%)`,
          borderRadius: '16px 16px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Scanlines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)',
        }} />

        {/* Animated top-right accent */}
        <motion.div
          animate={{ scaleX: [1, 0.5, 1], opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: 2.5 + idx * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 11, right: 10,
            width: 28, height: 3, borderRadius: 2,
            background: `linear-gradient(90deg, ${card.accent}, ${card.accent}30)`,
            transformOrigin: 'right',
          }}
        />
        <div style={{ position: 'absolute', top: 18, right: 10, width: 16, height: 2, borderRadius: 2, background: `${card.accent}50` }} />

        {/* 3 status dots */}
        <div style={{ position: 'absolute', top: 12, left: 10, display: 'flex', gap: 4 }}>
          {[0.9, 0.5, 0.25].map((o, j) => (
            <div key={j} style={{ width: 5, height: 5, borderRadius: 1, background: card.accent, opacity: o }} />
          ))}
        </div>

        {/* Bottom info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 10px 12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: `${card.accent}28`, border: `1px solid ${card.accent}60`,
            color: card.accent, fontSize: 7.5, fontWeight: 800, letterSpacing: '0.2em',
            padding: '2px 6px', borderRadius: 4, marginBottom: 5,
          }}>
            {card.genre}
          </div>
          <div style={{
            color: '#fff', fontSize: 11.5, fontWeight: 900,
            letterSpacing: '0.04em', lineHeight: 1.25,
            textShadow: '0 1px 8px rgba(0,0,0,1)',
          }}>
            {card.title}
          </div>
        </div>

        {/* Edge neon strip */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '15%', bottom: '15%', width: 2, borderRadius: 1,
            background: `linear-gradient(to bottom, transparent, ${card.accent}, transparent)`,
            ...('left' in card ? { left: 0 } : { right: 0 }),
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ── Cyber grid floor ── */
function CyberGrid() {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
      perspective: '600px', pointerEvents: 'none', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ backgroundPosition: ['0px 0px', '0px 60px'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', inset: '-100% 0 0',
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.25) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'rotateX(65deg)',
          transformOrigin: 'top center',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.15) 100%)',
        }}
      />
    </div>
  );
}

/* ── Star field ── */
function Stars() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => {
        const size = i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: size, height: size, borderRadius: '50%',
              left: `${(i * 37.3 + 11) % 100}%`,
              top: `${(i * 53.7 + 7) % 70}%`,
              background: i % 6 === 0 ? '#c084fc' : i % 4 === 0 ? '#818cf8' : '#fff',
            }}
            animate={{ opacity: [0.1, i % 2 === 0 ? 0.8 : 0.5, 0.1] }}
            transition={{ duration: 2.5 + (i % 7) * 0.6, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
}

/* ── Floating energy orbs ── */
function Orbs() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {[
        { x: '15%', y: '25%', w: 600, h: 500, c: 'rgba(109,40,217,0.28)', dur: 5 },
        { x: '55%', y: '50%', w: 500, h: 420, c: 'rgba(79,27,170,0.22)', dur: 7 },
        { x: '32%', y: '38%', w: 360, h: 300, c: 'rgba(168,85,247,0.14)', dur: 6 },
        { x: '72%', y: '8%',  w: 300, h: 260, c: 'rgba(99,102,241,0.16)', dur: 4.5 },
        { x: '-2%', y: '60%', w: 280, h: 240, c: 'rgba(236,72,153,0.10)', dur: 8 },
      ].map((o, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute', left: o.x, top: o.y,
            width: o.w, height: o.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${o.c} 0%, transparent 70%)`,
            filter: 'blur(48px)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}
    </div>
  );
}

/* ── Input field ── */
function InputField({
  icon, placeholder, value, onChange, type, rightSlot,
}: {
  icon: React.ReactNode; placeholder: string; value: string;
  onChange: (v: string) => void; type: string; rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 14px', height: 50, borderRadius: 12,
      background: focused ? 'rgba(139,92,246,0.09)' : 'rgba(255,255,255,0.04)',
      border: `1.5px solid ${focused ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.14), inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      transition: 'all 0.18s ease',
    }}>
      <span style={{ color: focused ? '#a78bfa' : 'rgba(255,255,255,0.25)', flexShrink: 0, transition: 'color 0.18s' }}>
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontWeight: 500 }}
        className="placeholder-white/20"
      />
      {rightSlot}
    </div>
  );
}

/* ══════════════════════════════ MAIN EXPORT ══════════════════════════════ */
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), credentials: 'include',
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="login-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: '#03000a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflowY: 'auto',
          }}
        >
          {/* ── Background layers ── */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Deep radial gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 30%, #1e0546 0%, #0d0126 45%, #03000a 100%)',
            }} />
            {/* Subtle noise texture */}
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.032,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
              backgroundSize: '180px 180px',
            }} />
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 45%, rgba(3,0,10,0.9) 100%)',
            }} />
          </div>

          <Stars />
          <Orbs />
          <CyberGrid />

          {/* ── Back button ── */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 20, left: 20, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: 10, padding: '8px 14px 8px 10px',
              cursor: 'pointer', color: 'rgba(255,255,255,0.65)',
              fontSize: 13, fontWeight: 600,
            }}
            whileHover={{ background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.5)', color: '#fff' }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={15} />
            Back
          </motion.button>

          {/* ── Game cards ── */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            {CARDS.map((card, i) => <GameCard key={card.title} card={card} idx={i} />)}
          </div>

          {/* ── Center column ── */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: '100%', maxWidth: 420, padding: '24px 20px',
          }}>

            {/* ══ LOGO + BRAND ══ */}
            <motion.div
              initial={{ opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, gap: 12 }}
            >
              {/* Glowing logo */}
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 12px rgba(168,85,247,0.7)) drop-shadow(0 0 30px rgba(109,40,217,0.4))',
                    'drop-shadow(0 0 22px rgba(168,85,247,0.9)) drop-shadow(0 0 50px rgba(109,40,217,0.6))',
                    'drop-shadow(0 0 12px rgba(168,85,247,0.7)) drop-shadow(0 0 30px rgba(109,40,217,0.4))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src="/logo.svg" alt="GameDravo" width={64} height={64} style={{ display: 'block' }} />
              </motion.div>

              {/* Site name */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 36, fontWeight: 900, letterSpacing: '0.14em',
                  lineHeight: 1, userSelect: 'none',
                  background: 'linear-gradient(90deg, #ffffff 0%, #e9d5ff 40%, #a855f7 70%, #818cf8 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 18px rgba(168,85,247,0.45))',
                }}>
                  GAME<span style={{
                    background: 'linear-gradient(90deg, #c084fc, #818cf8)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>DRAVO</span>
                </div>
                <motion.div
                  style={{
                    fontSize: 13, fontWeight: 700, marginTop: 6,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.0)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(168,85,247,0.8), rgba(255,255,255,0.5))',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}
                  animate={{ backgroundPosition: ['100% 0%', '0% 0%', '100% 0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Play · Compete · Win
                </motion.div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                  Continue your gaming journey
                </div>
              </div>
            </motion.div>

            {/* ══ LOGIN CARD ══ */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                background: 'linear-gradient(160deg, rgba(20,10,50,0.92) 0%, rgba(10,4,28,0.96) 100%)',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 20,
                padding: '26px 26px 22px',
                boxShadow: '0 0 0 1px rgba(139,92,246,0.08), 0 24px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)',
                backdropFilter: 'blur(28px)',
              }}
            >
              {/* Tab switcher */}
              <div style={{
                display: 'flex', background: 'rgba(0,0,0,0.35)', borderRadius: 10,
                padding: 4, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {(['signin', 'register'] as const).map(t => (
                  <motion.button
                    key={t}
                    onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                    style={{
                      flex: 1, height: 36, borderRadius: 7, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, letterSpacing: '0.01em',
                      background: tab === t
                        ? 'linear-gradient(135deg, #6d28d9, #7c3aed, #9333ea)'
                        : 'transparent',
                      color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                      boxShadow: tab === t ? '0 2px 16px rgba(109,40,217,0.5)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t === 'signin' ? 'Sign In' : 'Register'}
                  </motion.button>
                ))}
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                  {tab === 'signin' ? 'Welcome Back!' : 'Join GameDravo!'}
                </h2>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', marginTop: 4, marginBottom: 0 }}>
                  {tab === 'signin' ? 'Log in to your GameDravo account' : 'Create your free account today'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <AnimatePresence mode="wait">
                  {tab === 'register' && (
                    <motion.div key="uname"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 50 }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}>
                      <InputField icon={<User size={16} />} placeholder="Username (optional)" value={username} onChange={setUsername} type="text" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <InputField icon={<Mail size={16} />} placeholder={tab === 'signin' ? 'Email or Username' : 'Email address'} value={email} onChange={setEmail} type="email" />
                <InputField
                  icon={<Lock size={16} />} placeholder="Password" value={password} onChange={setPassword}
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
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.45)', fontSize: 13, padding: 0 }}>
                      {remember ? <CheckSquare size={16} color="#a855f7" /> : <Square size={16} />}
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
                  type="submit" disabled={!!loading}
                  whileHover={{ boxShadow: '0 8px 40px rgba(109,40,217,0.7)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 4, width: '100%', height: 50, borderRadius: 12, border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #9333ea 100%)',
                    boxShadow: '0 4px 28px rgba(109,40,217,0.5)',
                    color: '#fff', fontSize: 15, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.75 : 1, letterSpacing: '0.02em', transition: 'opacity 0.15s',
                  }}
                >
                  {loading === 'email' ? <span>Please wait…</span>
                    : tab === 'signin' ? <><span>Log In</span><ArrowRight size={17} /></>
                    : <><span>Create Account</span><ArrowRight size={17} /></>}
                </motion.button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 14px' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 600, letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* OAuth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <motion.button
                  onClick={() => handleOAuth('google')} disabled={!!loading}
                  whileHover={{ boxShadow: '0 4px 24px rgba(0,0,0,0.5)', transform: 'translateY(-1px)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: '100%', height: 48, borderRadius: 12, background: '#fff', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: 14, fontWeight: 700, color: '#1a1a1a',
                    opacity: loading ? 0.7 : 1, boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  {loading === 'google' ? <span style={{ color: '#555' }}>Redirecting…</span>
                    : <><GoogleIcon className="w-5 h-5" /><span>Continue with Google</span></>}
                </motion.button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { id: 'github' as const, Icon: GitHubIcon, label: 'GitHub' },
                    { id: 'microsoft' as const, Icon: MicrosoftIcon, label: 'Microsoft' },
                  ]).map(({ id, Icon, label }) => (
                    <motion.button key={id} onClick={() => handleOAuth(id)} disabled={!!loading}
                      whileHover={{ background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
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

              <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 18, marginBottom: 0 }}>
                {tab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setTab(tab === 'signin' ? 'register' : 'signin'); setError(''); setSuccess(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a855f7', fontWeight: 700, fontSize: 13, padding: 0 }}
                >
                  {tab === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ marginTop: 16, marginBottom: 8, fontSize: 11, color: 'rgba(255,255,255,0.16)', textAlign: 'center' }}
            >
              © 2026 <span style={{ color: 'rgba(168,85,247,0.45)', fontWeight: 600 }}>GameDravo</span>. All rights reserved.
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
