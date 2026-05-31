import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Home, ChevronRight, Zap, Target, Send, Check, Rocket, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SubmitGamePageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function SubmitGamePage({ isDarkMode, t }: SubmitGamePageProps) {
  const navigate = useNavigate();
  const [submissionSent, setSubmissionSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    devName: '',
    devEmail: '',
    gameTitle: '',
    gameUrl: '',
    category: 'Arcade',
    description: '',
    githubOrPortfolioUrl: ''
  });

  const categories = [
    'Action', 'Arcade', 'Casual', 'Adventure', 'Horror', 'Puzzle',
    'Strategy', 'Sports', 'Racing', 'Platformer', 'Multiplayer'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.devName || !formData.devEmail || !formData.gameTitle || !formData.gameUrl) {
      toast.error('Please fill in all required developer and game file specifications.');
      return;
    }

    setLoading(true);
    // Mimic database transaction delay
    await new Promise(resolve => setTimeout(resolve, 1600));
    setLoading(false);
    setSubmissionSent(true);
    toast.success('Your HTML5 game configuration has been added to our sandbox review queue!');
  };

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
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Submit a Game</span>
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

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-4">
            <Rocket className="w-8 h-8 md:w-12 md:h-12 text-accent" />
            Submit Your Game
          </h1>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            Are you an indie game developer writing lightweight HTML5, JS13k, WebGL, or Canvas games? Submit your game iframe URL to showcase your artwork to our monthly active gamer network.
          </p>
        </div>

        {/* Outer Form Box */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] border ${
          isDarkMode ? 'bg-gradient-to-b from-[#111124] to-[#0d0d18] border-white/5' : 'bg-white border-black/10 shadow-md'
        }`}>
          {submissionSent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-accent text-bg-dark flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Game Submitted Successfully!</h2>
              <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                Excellent! Your file payload is secure. Our operations team reviews all submissions in sandboxed environments for security checks before publication.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button 
                  onClick={() => {
                    setSubmissionSent(false);
                    setFormData({ devName: '', devEmail: '', gameTitle: '', gameUrl: '', category: 'Arcade', description: '', githubOrPortfolioUrl: '' });
                  }}
                  className="px-5 py-3 text-xs font-bold bg-accent text-bg-dark rounded-xl tracking-wider uppercase hover:scale-105 transition-all"
                >
                  Submit Another Game
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wider uppercase border transition-all ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'
                  }`}
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-accent border-b border-white/5 pb-2">1. Developer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Developer / Studio Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.devName}
                    onChange={(e) => setFormData({ ...formData, devName: e.target.value })}
                    placeholder="Your Name or Studio Name"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Contact Email *</label>
                  <input 
                    type="email"
                    required
                    value={formData.devEmail}
                    onChange={(e) => setFormData({ ...formData, devEmail: e.target.value })}
                    placeholder="email@developer.com"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Github or Portfolio Profile Link</label>
                <input 
                  type="url"
                  value={formData.githubOrPortfolioUrl}
                  onChange={(e) => setFormData({ ...formData, githubOrPortfolioUrl: e.target.value })}
                  placeholder="https://github.com/yourusername"
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              <h3 className="text-sm font-extrabold uppercase tracking-wider text-accent border-b border-white/5 pt-4 pb-2">2. Game Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Game Title *</label>
                  <input 
                    type="text"
                    required
                    value={formData.gameTitle}
                    onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                    placeholder="E.g., Starship Defender"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Primary Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-[#18182a] border-white/5 text-white' : 'bg-white border-black/5 text-black'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">HTML5 Playable Game URL *</label>
                <input 
                  type="url"
                  required
                  value={formData.gameUrl}
                  onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                  placeholder="https://js13kgames.com/games/your-game/index.html"
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Description & Keybinds Help</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about the mechanics, story, instructions, and controls (e.g. arrows to move, space to warp)..."
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Game Payload
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
