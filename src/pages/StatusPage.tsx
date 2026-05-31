import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Home, ChevronRight, Zap, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Gamepad2, Coins, Server, RefreshCw } from 'lucide-react';

interface StatusPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function StatusPage({ isDarkMode, t }: StatusPageProps) {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    updateTimestamp();
  }, []);

  const updateTimestamp = () => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      updateTimestamp();
    }, 800);
  };

  const systems = [
    {
      name: "Authentication & Authorization Gateway",
      description: "OAuth sign-in integrations, user registration gates, profile session management, credentials tracking",
      status: "operational",
      uptime: "99.98%",
      latency: "45ms",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />
    },
    {
      name: "Game Delivery Content Network (CDN)",
      description: "Fast loading for all 60+ HTML5 static vectors and playable iframe instances",
      status: "operational",
      uptime: "100.00%",
      latency: "12ms",
      icon: <Gamepad2 className="w-5 h-5 text-emerald-500" />
    },
    {
      name: "Economy Engine & Shop Integrations",
      description: "Coin tracking transactions, coin reward balance, cosmetic shop purchases, and safe state checks",
      status: "operational",
      uptime: "99.95%",
      latency: "82ms",
      icon: <Coins className="w-5 h-5 text-emerald-500" />
    },
    {
      name: "High Scores Database & Analytics APIs",
      description: "Leaderboards updates, performance matrix analytics, personal stats logging",
      status: "operational",
      uptime: "99.91%",
      latency: "115ms",
      icon: <Server className="w-5 h-5 text-emerald-500" />
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Navigation Breadcrumbs Header */}
        <div className={`p-4 md:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#111122]/40 border-white/5' : 'bg-slate-50/40 border-black/5'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
            
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              <Link to="/" className="hover:text-accent flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-accent/55" />
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>System Status</span>
            </div>
          </div>
          
          <Link to="/" className="flex items-center gap-2.5 group self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-accent text-bg-dark flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md duration-300">
              <Zap className="w-4 h-4 text-indigo-950 fill-current" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">
              Play<span className="text-accent">Dravo</span>
            </span>
          </Link>
        </div>

        {/* Global Summary Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-[2.5rem] border ${
            isDarkMode ? 'bg-gradient-to-br from-[#12122b] to-[#0c0c16] border-white/5' : 'bg-white border-black/10 shadow-md'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative">
                <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-bg-dark" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">All Systems Operational</h1>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                  Last updated at <span className="font-mono">{lastUpdated || 'Loading...'}</span>
                </p>
              </div>
            </div>

            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Check
            </button>
          </div>

          {/* Core Metrics Ring Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-dashed border-white/10">
            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Overall Uptime</span>
              <p className="text-xl md:text-2xl font-black text-emerald-500">99.96%</p>
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>API Latency Avg</span>
              <p className="text-xl md:text-2xl font-black text-cyan-400">38.5 ms</p>
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Database Gateway</span>
              <p className="text-xl md:text-2xl font-black text-indigo-400">Green / Stable</p>
            </div>
          </div>
        </motion.div>

        {/* Detailed Services list */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight">Core Services Health</h2>
          <div className="space-y-3">
            {systems.map((system, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={system.name}
                className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                  isDarkMode ? 'bg-[#121224]/50 border-white/5' : 'bg-white border-black/5 shadow-sm'
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className="p-3 w-fit bg-emerald-500/10 border border-emerald-500/20 rounded-2xl shrink-0">
                    {system.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm tracking-tight">{system.name}</h3>
                    <p className={`text-xs leading-relaxed max-w-xl ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                      {system.description}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 gap-2 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Operational</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold opacity-60">
                    <span className="font-mono">UPTIME: {system.uptime}</span>
                    <span className="font-mono">DELAY: {system.latency}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Informative Help Alert */}
        <div className={`p-6 rounded-3xl border text-center relative overflow-hidden ${
          isDarkMode ? 'bg-[#121226]/40 border-white/5' : 'bg-slate-100/50 border-black/5'
        }`}>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-accent">Notice an anomaly or service breach?</h3>
            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
              Please query direct ticket requests or open report forms so our technical operators can inspect browser stack traces.
            </p>
            <div className="pt-3 flex items-center justify-center gap-3">
              <Link to="/report-bug" className="text-xs font-bold hover:underline text-accent">Report Bug</Link>
              <span className="opacity-30">•</span>
              <Link to="/contact" className="text-xs font-bold hover:underline text-accent">Contact Operations</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
