import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { SEO } from '../components/SEO';
import { Gamepad2, Sparkles, Zap, Trophy, Shield, Users, Home, ChevronRight, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function AboutPage({ isDarkMode, t }: AboutPageProps) {
  const stats = [
    { label: "Curated Games", value: "60+" },
    { label: "Monthly Players", value: "150K+" },
    { label: "Active Servers", value: "Global" },
    { label: "Platform Latency", value: "<15ms" }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-accent" />,
      title: "Instant Play",
      desc: "Zero installations or plugins required. Launch high-fidelity web games directly in your browser with optimized loading times."
    },
    {
      icon: <Trophy className="w-6 h-6 text-accent" />,
      title: "Tournaments & Achievements",
      desc: "Compete with global players, track high scores, earn unique achievements, and climb up the real-time leaderboards."
    },
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: "Secure Sandbox",
      desc: "All game applications run in isolated, highly secure container layers to protect your local system environments."
    },
    {
      icon: <Users className="w-6 h-6 text-accent" />,
      title: "Community First",
      desc: "Customize your gaming profile, save your favorite games to a custom library, request new games, and report tickets live."
    }
  ];

  return (
    <>
    <SEO
      title="About GameDravo | Free Instant Browser Games"
      description="Learn about GameDravo — a lightweight futuristic portal for free, instant, no-download browser games across action, puzzle, arcade, sports, and more."
      canonicalUrl="https://gamedravo.com/about"
    />
    <div className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12">
        {/* Navigation Breadcrumbs Header */}
        <div className={`p-4 md:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#111122]/40 border-white/5' : 'bg-slate-50/40 border-black/5'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/" 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              <Link to="/" className="hover:text-accent flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-accent/55" />
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>About Us</span>
            </div>
          </div>
          
          <PageBrandMark />
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto space-y-6 pt-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Discover GameDravo
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            The Ultimate <span className="text-accent">Web Gaming</span> Destination
          </h1>
          <p className={`text-base md:text-xl leading-relaxed ${isDarkMode ? 'text-white/65' : 'text-black/65'}`}>
            GameDravo is a cutting-edge web portal designed for instant gaming access. We curate, optimize, and deliver the world's finest HTML5 web games into a singular premium experience.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-3xl border text-center transition-all ${
                isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'
              }`}
            >
              <div className="text-3xl md:text-4xl font-extrabold text-accent mb-1">{stat.value}</div>
              <div className={`text-xs uppercase tracking-widest font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Core Philosophy & Image Mockup container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Mission</h2>
            <p className={`leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
              We believe great games should be accessible instantly to everyone, anywhere, on any device. GameDravo completely bypasses the friction of heavy client downloads, hardware constraints, and app store paywalls.
            </p>
            <p className={`leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
              By focusing on lightning-fast performance, elegant fluid UI typography, high-contrast dark visual aesthetics, and strong local persistence, we turn simple web browsing into a dedicated, desktop-class gaming console experience.
            </p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-white/5' : 'bg-gradient-to-br from-slate-100 to-indigo-50 border-black/5'
          }`}>
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative z-10 flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-accent/15 border border-accent/20 rounded-full mb-6">
                <Gamepad2 className="w-12 h-12 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Ready to play?</h3>
              <p className={`text-xs max-w-xs mb-6 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>Jump straight into any game inside our catalog without registering. Your high scores and preferences save automatically.</p>
              <a href="/" className="px-6 py-3 bg-accent text-bg-dark font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all">Start Playing Now</a>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-8 pt-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-center">Engineered for Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat) => (
              <div 
                key={feat.title}
                className={`p-6 rounded-3xl border flex gap-4 ${
                  isDarkMode ? 'bg-white/[0.01] border-white/5' : 'bg-black/[0.01] border-black/5'
                }`}
              >
                <div className="p-3 rounded-2xl bg-accent/10 border border-accent/15 shrink-0 h-fit">
                  {feat.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">{feat.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact/Support Footer Promo */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] border text-center ${
          isDarkMode ? 'bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-white/5' : 'bg-gradient-to-r from-accent/5 via-transparent to-accent/5 border-black/5'
        }`}>
          <h3 className="text-2xl font-black mb-3">Have feedback or want to partner?</h3>
          <p className={`text-sm max-w-xl mx-auto mb-6 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            We're always looking for talented developers to host their games, write mod guides, or help build community tooling. Drop our support division a direct line.
          </p>
          <a href="/support" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-wider font-bold rounded-xl border border-white/10 transition-all inline-block">Support & Partner Portal</a>
        </div>
      </div>
    </div>
    </>
  );
}
