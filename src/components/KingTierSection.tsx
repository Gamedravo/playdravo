import { memo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  Play,
  Star,
  Maximize2,
  Minimize2,
  Zap,
  Shield,
  Award,
  Globe,
  Gamepad2,
} from 'lucide-react';

interface KingTierSectionProps {
  isDarkMode: boolean;
}

const KING_GAME = {
  title: 'Airplane Flight Simulator EVO',
  category: 'Simulation',
  rating: 4.9,
  plays: '2.4M',
  embedUrl: 'https://www.madkidgames.com/full/airplane-flight-simulator-evo',
  attributionUrl: 'https://www.madkidgames.com/game/airplane-flight-simulator-evo',
  tagline: 'Rule the Skies. Command Every Altitude.',
  description: 'Take the throne of the skies in the most immersive flight simulation experience in browser gaming. Pilot legendary aircraft across stunning environments — no download required.',
  tags: ['Flight', 'Simulation', 'Open World', '3D'],
  stats: [
    { label: 'Rating', value: '4.9★', icon: Star },
    { label: 'Players', value: '2.4M+', icon: Globe },
    { label: 'Category', value: 'Sim', icon: Gamepad2 },
    { label: 'King Rank', value: '#1', icon: Crown },
  ],
};

const scanlines = Array.from({ length: 18 }, (_, i) => i);
const particles = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 13 + 5) % 92}%`,
  top: `${(i * 19 + 8) % 88}%`,
  dur: 6 + (i % 6) * 1.4,
  delay: i * 0.28,
  size: 1 + (i % 3),
}));

export const KingTierSection = memo(function KingTierSection({ isDarkMode }: KingTierSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlay = () => setIsPlaying(true);

  const handleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <section
      className="king-tier-section"
      aria-label="King Tier Featured Game"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Background layers */}
      <div className="king-bg-base" aria-hidden />
      <div className="king-bg-grid" aria-hidden />
      <div className="king-bg-vignette" aria-hidden />

      {/* Gold aura orbs */}
      <div className="king-orb king-orb--gold" aria-hidden />
      <div className="king-orb king-orb--cyan" aria-hidden />
      <div className="king-orb king-orb--purple" aria-hidden />

      {/* Scanlines */}
      <div className="king-scanlines" aria-hidden>
        {scanlines.map((i) => (
          <div key={i} className="king-scanline" style={{ top: `${(i / scanlines.length) * 100}%` }} />
        ))}
      </div>

      {/* Floating particles */}
      <div className="king-particles" aria-hidden>
        {particles.map((p) => (
          <span
            key={p.id}
            className="king-particle"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* === HEADER === */}
      <motion.div
        className="king-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="king-crown-badge">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>KING TIER EXCLUSIVE</span>
          <Crown className="w-4 h-4 text-amber-400" />
        </div>
        <div className="king-title-block">
          <h2 className="king-main-title">
            {KING_GAME.title.split(' ').map((word, i) => (
              <span key={i} className={i === 2 || i === 3 ? 'king-title-accent' : ''}>{word} </span>
            ))}
          </h2>
          <p className="king-tagline">{KING_GAME.tagline}</p>
        </div>
      </motion.div>

      {/* === STATS ROW === */}
      <motion.div
        className="king-stats-row"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        {KING_GAME.stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="king-stat-chip">
            <Icon className="w-3.5 h-3.5 text-amber-400" />
            <span className="king-stat-value">{value}</span>
            <span className="king-stat-label">{label}</span>
          </div>
        ))}
        <div className="king-stat-chip king-stat-chip--live">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="king-stat-value" style={{ color: 'rgb(52 211 153)' }}>LIVE</span>
          <span className="king-stat-label">Instant Play</span>
        </div>
      </motion.div>

      {/* === MAIN CONTENT: Game + Sidebar === */}
      <div className="king-content">
        {/* Game iframe container */}
        <motion.div
          className="king-game-container"
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
        >
          {/* HUD corners */}
          <span className="king-hud-corner king-hud-corner--tl" aria-hidden />
          <span className="king-hud-corner king-hud-corner--tr" aria-hidden />
          <span className="king-hud-corner king-hud-corner--bl" aria-hidden />
          <span className="king-hud-corner king-hud-corner--br" aria-hidden />

          {/* Gold border glow */}
          <div className="king-game-border-glow" aria-hidden />

          {/* Pre-play overlay */}
          {!isPlaying && (
            <div className="king-play-overlay">
              <div className="king-play-bg-art" aria-hidden />
              <div className="king-play-center">
                <motion.div
                  className="king-crown-ring"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className="king-ring-dot"
                      style={{ transform: `rotate(${i * 45}deg) translateX(38px)` }}
                    />
                  ))}
                </motion.div>
                <Crown className="king-play-crown" aria-hidden />
                <motion.button
                  className="king-play-btn"
                  onClick={handlePlay}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.97 }}
                  aria-label="Play Airplane Flight Simulator EVO"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Play Now — Free
                </motion.button>
                <p className="king-play-note">No download · No login required · Instant in browser</p>
              </div>
            </div>
          )}

          {/* iframe */}
          {isPlaying && (
            <iframe
              src={KING_GAME.embedUrl}
              title={KING_GAME.title}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="fullscreen; autoplay"
              allowFullScreen
              scrolling="no"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ display: 'block', border: 'none', width: '100%', height: '100%' }}
            />
          )}

          {/* Controls bar */}
          <div className="king-controls-bar">
            <span className="king-controls-label">
              <Zap className="w-3 h-3" />
              {KING_GAME.title}
            </span>
            <div className="king-controls-right">
              {isPlaying && (
                <button
                  className="king-ctrl-btn"
                  onClick={handleFullscreen}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              )}
              <a
                href={KING_GAME.attributionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="king-ctrl-btn king-ctrl-btn--link"
              >
                <Globe className="w-3.5 h-3.5" />
                Source
              </a>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.aside
          className="king-sidebar"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: 'easeOut' }}
        >
          {/* Rank badge */}
          <div className="king-rank-card">
            <div className="king-rank-inner">
              <Crown className="w-8 h-8 text-amber-400" />
              <div>
                <p className="king-rank-label">Platform Rank</p>
                <p className="king-rank-value">#1 KING</p>
              </div>
            </div>
            <div className="king-rank-bar-wrap">
              <div className="king-rank-bar" />
            </div>
          </div>

          {/* Description */}
          <div className="king-desc-card">
            <p className="king-desc-eyebrow">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              About This Title
            </p>
            <p className="king-desc-text">{KING_GAME.description}</p>
          </div>

          {/* Tags */}
          <div className="king-tags-card">
            <p className="king-tags-label">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Tags
            </p>
            <div className="king-tags-list">
              {KING_GAME.tags.map((tag) => (
                <span key={tag} className="king-tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Achievements row */}
          <div className="king-achievements">
            {[
              { label: 'Editor\'s Pick', icon: '👑' },
              { label: 'Top Rated', icon: '⭐' },
              { label: 'Most Played', icon: '🔥' },
            ].map(({ label, icon }) => (
              <div key={label} className="king-achievement-chip">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!isPlaying && (
            <motion.button
              className="king-sidebar-play-btn"
              onClick={handlePlay}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Crown className="w-4 h-4" />
              Play Like a King
            </motion.button>
          )}
        </motion.aside>
      </div>

      {/* Bottom attribution */}
      <div className="king-attribution">
        <p>
          Game by{' '}
          <a
            href={KING_GAME.attributionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="king-attribution-link"
          >
            MadKidGames
          </a>{' '}
          · Embedded with permission
        </p>
      </div>
    </section>
  );
});
