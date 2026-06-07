import { useState } from "react";
import { TrendingUp, BarChart2, Play, Users, Star, ChevronRight, Activity, Cpu } from "lucide-react";

const GAMES = [
  { id: 1, title: "Tekken 3", category: "Fighting", plays: 18000000, rating: 4.9, delta: +34, thumb: "https://www.onlinegames.io/media/posts/680/responsive/Tekken-3-md.jpg", velocity: 94 },
  { id: 2, title: "Snaker.io", category: "Multiplayer", plays: 12000000, rating: 4.9, delta: +21, thumb: "https://img.onlinegames.io/snakerio-md.jpg", velocity: 87 },
  { id: 3, title: "Subway Surfers", category: "Arcade", plays: 9500000, rating: 4.8, delta: +15, thumb: "https://www.onlinegames.io/media/posts/875/responsive/Subway-Surfers-md.jpg", velocity: 78 },
  { id: 4, title: "Slope", category: "Casual", plays: 7800000, rating: 4.7, delta: +12, thumb: "https://www.onlinegames.io/media/posts/773/responsive/Slope-md.jpg", velocity: 71 },
  { id: 5, title: "1v1.LOL", category: "Shooter", plays: 6200000, rating: 4.8, delta: +9, thumb: "https://www.onlinegames.io/media/posts/892/responsive/1v1-lol-md.jpg", velocity: 63 },
  { id: 6, title: "Basketball Stars", category: "Sports", plays: 5100000, rating: 4.6, delta: +7, thumb: "https://www.onlinegames.io/media/posts/672/responsive/Basketball-Stars-md.jpg", velocity: 55 },
  { id: 7, title: "Krunker.io", category: "Shooter", plays: 4400000, rating: 4.7, delta: +5, thumb: "https://www.onlinegames.io/media/posts/831/responsive/Krunker-md.jpg", velocity: 48 },
  { id: 8, title: "Paper.io 2", category: "Arcade", plays: 3900000, rating: 4.6, delta: +4, thumb: "https://www.onlinegames.io/media/posts/769/responsive/Paper-io-2-md.jpg", velocity: 41 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function VelocityBar({ pct, rank }: { pct: number; rank: number }) {
  const hue = rank === 1 ? "0, 170, 255" : rank === 2 ? "0, 210, 200" : rank === 3 ? "80, 200, 120" : "100, 160, 220";
  return (
    <div className="relative h-1.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, rgba(${hue},0.6), rgba(${hue},1))`,
          boxShadow: `0 0 4px rgba(${hue}, 0.5)`,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

function HoloBadge({ rank }: { rank: number }) {
  const top3 = [
    { bg: "rgba(255,215,0,0.08)", border: "rgba(255,215,0,0.3)", text: "#ffd700", label: "1ST" },
    { bg: "rgba(192,192,192,0.08)", border: "rgba(192,192,192,0.25)", text: "#c0c0c0", label: "2ND" },
    { bg: "rgba(205,127,50,0.08)", border: "rgba(205,127,50,0.25)", text: "#cd7f32", label: "3RD" },
  ];
  if (rank <= 3) {
    const c = top3[rank - 1];
    return (
      <div className="flex items-center justify-center w-10 h-6 rounded text-[9px] font-mono font-bold shrink-0"
        style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, letterSpacing: "0.1em" }}>
        {c.label}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-10 h-6 rounded shrink-0" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="font-mono text-xs font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{rank}</span>
    </div>
  );
}

function GameCard({ game, rank }: { game: typeof GAMES[0]; rank: number }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="group relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderLeft: "2px solid transparent",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(0,160,255,0.04)";
        el.style.borderLeftColor = "rgba(0,160,255,0.4)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "transparent";
        el.style.borderLeftColor = "transparent";
      }}
    >
      <HoloBadge rank={rank} />

      <div className="relative w-12 h-9 rounded overflow-hidden shrink-0" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        {!imgErr ? (
          <img src={game.thumb} alt={game.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(0,160,255,0.05)" }}>
            <Play className="w-3.5 h-3.5" style={{ color: "rgba(0,160,255,0.5)" }} />
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(135deg, rgba(0,160,255,0.15) 0%, transparent 60%)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-semibold text-sm text-white truncate group-hover:text-blue-300 transition-colors">{game.title}</span>
          <span className="font-mono text-[9px] shrink-0 px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {game.category}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex-1">
            <VelocityBar pct={game.velocity} rank={rank} />
          </div>
          <span className="text-[9px] font-mono shrink-0 tabular-nums" style={{ color: "rgba(255,255,255,0.25)" }}>
            {fmt(game.plays)}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5" style={{ color: "#00aaff" }} fill="#00aaff" />
          <span className="font-mono text-xs font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>{game.rating}</span>
        </div>
        <div className="flex items-center gap-0.5 font-mono text-[9px]" style={{ color: "#00ff99" }}>
          <TrendingUp className="w-2.5 h-2.5" />
          <span>+{game.delta}%</span>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: "#00aaff" }} />
    </div>
  );
}

export function HoloGrid() {
  const [sort, setSort] = useState("velocity");
  const sorts = ["velocity", "plays", "rating"];

  const maxVel = Math.max(...GAMES.map(g => g.velocity));
  const sparkBars = GAMES.map(g => Math.round((g.velocity / maxVel) * 32));

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ background: "#040814", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes shift { 0% { background-position: 0 0; } 100% { background-position: 60px 60px; } }
      `}</style>

      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,140,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,140,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "shift 30s linear infinite",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded" style={{ background: "rgba(0,140,255,0.08)", border: "1px solid rgba(0,140,255,0.15)" }}>
              <Cpu className="w-3 h-3" style={{ color: "#00aaff" }} />
              <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "#00aaff" }}>DRAVO/SYS</span>
            </div>
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
            <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>TREND_ANALYSIS</span>
            <span className="font-mono text-[9px] ml-auto" style={{ color: "rgba(0,140,255,0.5)", animation: "blink 1.4s step-start infinite" }}>█</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-1" style={{ color: "rgba(255,255,255,0.92)", fontFamily: "'Space Mono', monospace" }}>
            Trending
          </h1>
          <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Live velocity analysis · <span style={{ color: "#00aaff" }}>8</span> games indexed · Last sync{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>2m ago</span>
          </p>
        </div>

        <div className="flex items-end gap-3 mb-5">
          <div className="flex-1 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-mono text-[9px] mb-2 tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
              Velocity Spectrum
            </div>
            <div className="flex items-end gap-0.5 h-8">
              {sparkBars.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{
                  height: `${h}px`,
                  background: i < 2 ? "rgba(0,170,255,0.8)" : i < 4 ? "rgba(0,170,255,0.5)" : "rgba(0,170,255,0.25)",
                  boxShadow: i < 2 ? "0 0 4px rgba(0,170,255,0.4)" : "none",
                }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Users className="w-3 h-3" />, val: "142K", lbl: "Players", c: "#00aaff" },
              { icon: <Activity className="w-3 h-3" />, val: "+18%", lbl: "Surge", c: "#00ff99" },
              { icon: <BarChart2 className="w-3 h-3" />, val: "67.2M", lbl: "Plays", c: "#8866ff" },
              { icon: <Star className="w-3 h-3" />, val: "4.76", lbl: "Avg Rating", c: "#ffaa00" },
            ].map(s => (
              <div key={s.lbl} className="px-3 py-2 rounded" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: s.c }}>{s.icon}</div>
                <div className="font-mono text-sm font-bold mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>{s.val}</div>
                <div className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" style={{ color: "#00aaff" }} />
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>
                Game Index
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[9px] mr-1" style={{ color: "rgba(255,255,255,0.2)" }}>Sort:</span>
              {sorts.map(s => (
                <button key={s}
                  onClick={() => setSort(s)}
                  className="px-2 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all"
                  style={{
                    background: sort === s ? "rgba(0,160,255,0.12)" : "transparent",
                    color: sort === s ? "#00aaff" : "rgba(255,255,255,0.25)",
                    border: sort === s ? "1px solid rgba(0,160,255,0.2)" : "1px solid transparent",
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="font-mono text-[8px] tracking-widest uppercase w-10 shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>Rank</span>
            <span className="font-mono text-[8px] tracking-widest uppercase w-12 shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>Cover</span>
            <span className="font-mono text-[8px] tracking-widest uppercase flex-1" style={{ color: "rgba(255,255,255,0.18)" }}>Title / Velocity</span>
            <span className="font-mono text-[8px] tracking-widest uppercase shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>Score</span>
          </div>

          {GAMES.map((game, i) => (
            <GameCard key={game.id} game={game} rank={i + 1} />
          ))}

          <div className="px-4 py-3 flex items-center justify-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <button className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-all group" style={{ color: "rgba(0,170,255,0.6)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00aaff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(0,170,255,0.6)"; }}>
              <BarChart2 className="w-3 h-3" />
              Load More Data
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>
            DRAVO © 2025
          </span>
          <span className="font-mono text-[9px]" style={{ color: "rgba(255,255,255,0.15)" }}>
            v2.4.1 · trend_engine
          </span>
        </div>
      </div>
    </div>
  );
}
