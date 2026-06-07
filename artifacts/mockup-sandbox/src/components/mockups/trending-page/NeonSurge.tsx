import { useState } from "react";
import { TrendingUp, Flame, Zap, Play, Users, Star, ChevronRight, ArrowUp } from "lucide-react";

const GAMES = [
  { id: 1, title: "Tekken 3", category: "Fighting", plays: 18000000, rating: 4.9, delta: +34, thumb: "https://www.onlinegames.io/media/posts/680/responsive/Tekken-3-md.jpg", heat: 99 },
  { id: 2, title: "Snaker.io", category: "Multiplayer", plays: 12000000, rating: 4.9, delta: +21, thumb: "https://img.onlinegames.io/snakerio-md.jpg", heat: 91 },
  { id: 3, title: "Subway Surfers", category: "Arcade", plays: 9500000, rating: 4.8, delta: +15, thumb: "https://www.onlinegames.io/media/posts/875/responsive/Subway-Surfers-md.jpg", heat: 85 },
  { id: 4, title: "Slope", category: "Casual", plays: 7800000, rating: 4.7, delta: +12, thumb: "https://www.onlinegames.io/media/posts/773/responsive/Slope-md.jpg", heat: 78 },
  { id: 5, title: "1v1.LOL", category: "Shooter", plays: 6200000, rating: 4.8, delta: +9, thumb: "https://www.onlinegames.io/media/posts/892/responsive/1v1-lol-md.jpg", heat: 72 },
  { id: 6, title: "Basketball Stars", category: "Sports", plays: 5100000, rating: 4.6, delta: +7, thumb: "https://www.onlinegames.io/media/posts/672/responsive/Basketball-Stars-md.jpg", heat: 65 },
  { id: 7, title: "Krunker.io", category: "Shooter", plays: 4400000, rating: 4.7, delta: +5, thumb: "https://www.onlinegames.io/media/posts/831/responsive/Krunker-md.jpg", heat: 60 },
  { id: 8, title: "Paper.io 2", category: "Arcade", plays: 3900000, rating: 4.6, delta: +4, thumb: "https://www.onlinegames.io/media/posts/769/responsive/Paper-io-2-md.jpg", heat: 54 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function HeatBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(0,245,255,0.1)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: pct > 80 ? "linear-gradient(90deg, #ff00c8, #ff4444)" : pct > 60 ? "linear-gradient(90deg, #ff8800, #ff00c8)" : "linear-gradient(90deg, #00f5ff, #ff8800)",
            boxShadow: pct > 80 ? "0 0 6px #ff00c8" : pct > 60 ? "0 0 6px #ff8800" : "0 0 6px #00f5ff",
          }}
        />
      </div>
      <span className="text-[9px] font-mono tabular-nums" style={{ color: pct > 80 ? "#ff00c8" : pct > 60 ? "#ff8800" : "#00f5ff" }}>
        {pct}
      </span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const colors = [
    { text: "#ffd700", glow: "#ffd700", bg: "rgba(255,215,0,0.08)" },
    { text: "#c0c0c0", glow: "#c0c0c0", bg: "rgba(192,192,192,0.08)" },
    { text: "#cd7f32", glow: "#cd7f32", bg: "rgba(205,127,50,0.08)" },
  ];
  const c = rank <= 3 ? colors[rank - 1] : { text: "rgba(255,255,255,0.3)", glow: "transparent", bg: "transparent" };

  return (
    <div className="flex items-center justify-center w-8 shrink-0" style={{ position: "relative" }}>
      <span
        className="font-['Orbitron',monospace] font-black text-lg leading-none"
        style={{ color: c.text, textShadow: rank <= 3 ? `0 0 12px ${c.glow}, 0 0 24px ${c.glow}` : "none" }}
      >
        {rank}
      </span>
    </div>
  );
}

function GameRow({ game, rank }: { game: typeof GAMES[0]; rank: number }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 relative overflow-hidden"
      style={{
        borderBottom: "1px solid rgba(0,245,255,0.06)",
        background: rank <= 3 ? "rgba(0,245,255,0.02)" : "transparent",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.05)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = rank <= 3 ? "rgba(0,245,255,0.02)" : "transparent";
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(180deg, transparent, #00f5ff, transparent)", boxShadow: "0 0 8px #00f5ff" }}
      />

      <RankBadge rank={rank} />

      <div className="relative w-14 h-10 rounded overflow-hidden shrink-0" style={{ border: "1px solid rgba(0,245,255,0.15)" }}>
        {!imgErr ? (
          <img src={game.thumb} alt={game.title} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "rgba(0,245,255,0.05)" }}>
            <Play className="w-4 h-4" style={{ color: "#00f5ff" }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.1) 0%, transparent 60%)" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm truncate text-white group-hover:text-cyan-300 transition-colors">{game.title}</span>
          {rank <= 3 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0"
              style={{ background: "rgba(255,0,200,0.1)", color: "#ff00c8", border: "1px solid rgba(255,0,200,0.2)" }}>
              🔥 HOT
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{game.category}</span>
          <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
          <span className="text-[10px] font-mono" style={{ color: "#00f5ff", opacity: 0.7 }}>{fmt(game.plays)} plays</span>
        </div>
        <div className="mt-1.5">
          <HeatBar pct={game.heat} />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5" style={{ color: "#ffd700" }} fill="#ffd700" />
          <span className="text-xs font-mono font-bold text-white">{game.rating}</span>
        </div>
        <div className="flex items-center gap-0.5" style={{ color: "#00ff88" }}>
          <ArrowUp className="w-2.5 h-2.5" />
          <span className="text-[10px] font-mono">+{game.delta}%</span>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#00f5ff" }} />
    </div>
  );
}

export function NeonSurge() {
  const [filter, setFilter] = useState("24h");
  const filters = ["1h", "24h", "7d", "All"];

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ background: "#050510", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap');
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes flicker {
          0%, 96%, 100% { opacity: 1; }
          97% { opacity: 0.6; }
          98% { opacity: 1; }
          99% { opacity: 0.7; }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.5) 2px, rgba(0,245,255,0.5) 3px)", backgroundSize: "100% 4px" }} />

      <div className="relative max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: "rgba(0,245,255,0.5)" }}>
              GameDravo
            </span>
            <span className="text-[10px] font-mono" style={{ color: "rgba(0,245,255,0.2)" }}>/</span>
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: "rgba(0,245,255,0.5)" }}>
              Trending
            </span>
          </div>

          <div className="flex items-end gap-4 mt-3">
            <div className="flex-1">
              <h1 className="font-['Orbitron',monospace] font-black text-3xl leading-none tracking-tight"
                style={{
                  color: "#fff",
                  textShadow: "0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.3)",
                  animation: "flicker 8s infinite"
                }}>
                TRENDING
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#ff00c8", boxShadow: "0 0 6px #ff00c8", animation: "pulse-glow 1.2s ease-in-out infinite" }} />
                  <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: "#ff00c8" }}>Live Data</span>
                </span>
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>8 games surging</span>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.1)" }}>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: filter === f ? "rgba(0,245,255,0.15)" : "transparent",
                    color: filter === f ? "#00f5ff" : "rgba(255,255,255,0.3)",
                    boxShadow: filter === f ? "0 0 8px rgba(0,245,255,0.2)" : "none",
                    border: filter === f ? "1px solid rgba(0,245,255,0.2)" : "1px solid transparent",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Total Plays", value: "67.2M", icon: <Play className="w-3.5 h-3.5" />, color: "#00f5ff" },
            { label: "Live Players", value: "142K", icon: <Users className="w-3.5 h-3.5" />, color: "#ff00c8" },
            { label: "Trending ↑", value: "+18%", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "#00ff88" },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className="font-['Orbitron',monospace] font-black text-lg leading-none mb-0.5" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}` }}>
                {stat.value}
              </div>
              <div className="text-[9px] font-mono tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,245,255,0.1)", boxShadow: "0 0 40px rgba(0,245,255,0.04)" }}>
          <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,245,255,0.08)", background: "rgba(0,245,255,0.03)" }}>
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5" style={{ color: "#ff00c8" }} />
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>
                Hot Right Now
              </span>
            </div>
            <span className="text-[9px] font-mono" style={{ color: "rgba(0,245,255,0.4)" }}>Updated 2m ago</span>
          </div>

          <div className="flex text-[9px] font-mono uppercase tracking-widest px-4 py-2" style={{ color: "rgba(255,255,255,0.2)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <span className="w-8">#</span>
            <span className="ml-3 w-14 shrink-0">Game</span>
            <span className="flex-1 ml-3">Title</span>
            <span className="w-20 text-right">Heat</span>
          </div>

          {GAMES.map((game, i) => (
            <GameRow key={game.id} game={game} rank={i + 1} />
          ))}

          <div className="px-4 py-3 text-center" style={{ borderTop: "1px solid rgba(0,245,255,0.06)" }}>
            <button
              className="flex items-center gap-2 mx-auto text-[10px] font-mono font-bold uppercase tracking-[0.2em] transition-all hover:gap-3"
              style={{ color: "#00f5ff" }}
            >
              <Zap className="w-3 h-3" />
              Load More Games
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-0.5 rounded-full transition-all" style={{
              width: i === 0 ? "24px" : "6px",
              background: i === 0 ? "#00f5ff" : "rgba(255,255,255,0.1)",
              boxShadow: i === 0 ? "0 0 4px #00f5ff" : "none"
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
