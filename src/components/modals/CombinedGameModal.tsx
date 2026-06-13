import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, Rocket, Heart, Play, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { GAMES } from '../../games';
import { UserProfile, Game } from '../../types';
import { useNavigate } from 'react-router-dom';

interface CombinedGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user: any;
  userProfile: UserProfile | null;
}

export function CombinedGameModal({ isOpen, onClose, isDarkMode, t, user, userProfile }: CombinedGameModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'request' | 'favorites'>('request');
  const [gameRequest, setGameRequest] = useState({ gameName: '', link: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const favoriteIds: string[] = userProfile?.favorites || [];
  const favoriteGames: Game[] = (GAMES as Game[]).filter((g) => favoriteIds.includes(g.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameRequest.gameName.trim()) {
      toast.error('Please enter a game title.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitGameRequest({
        gameName: gameRequest.gameName.trim(),
        link: gameRequest.link.trim() || undefined,
        description: gameRequest.description.trim() || undefined,
      });
      setSubmitted(true);
      setGameRequest({ gameName: '', link: '', description: '' });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setActiveTab('request');
    onClose();
  };

  const handlePlayFavorite = (game: Game) => {
    handleClose();
    navigate(`/games/${game.id}`);
  };

  return (

    <motion.div
      initial={false}
      animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.25 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl ${isOpen ? 'visible' : 'invisible'}`}
    >
      <motion.div
        initial={false}
        animate={isOpen ? { scale: 1, y: 0 } : { scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`border w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 shrink-0" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center px-10 pt-10 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">GameDravo</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-none">
              {activeTab === 'request' ? (
                <>Request <span className="text-accent">Game</span></>
              ) : (
                <>My <span className="text-accent">Favorites</span></>
              )}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-4 rounded-2xl transition-all hover:rotate-90 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-10 pb-4 shrink-0">
          <div className={`flex gap-2 p-1 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
            <button
              onClick={() => { setActiveTab('request'); setSubmitted(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'request'
                  ? 'bg-accent text-white shadow-lg'
                  : isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Request Game
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'favorites'
                  ? 'bg-accent text-white shadow-lg'
                  : isDarkMode ? 'text-white/60 hover:text-white' : 'text-black/60 hover:text-black'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
              {favoriteIds.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'favorites' ? 'bg-white/20' : 'bg-accent/20 text-accent'}`}>
                  {favoriteIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-10 pb-10">
          <AnimatePresence mode="wait">
            {activeTab === 'request' && (
              <motion.div
                key="request"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {submitted ? (
                  <div className="flex flex-col items-center text-center py-8 gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Request Sent!</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                        We got your game request. Our team will review it shortly.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubmitted(false)}
                      className={`mt-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                    >
                      Submit Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        Game Title *
                      </label>
                      <input
                        type="text"
                        value={gameRequest.gameName}
                        onChange={(e) => setGameRequest((p) => ({ ...p, gameName: e.target.value }))}
                        placeholder="e.g. Minecraft, Among Us..."
                        className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        Game Link (optional)
                      </label>
                      <input
                        type="url"
                        value={gameRequest.link}
                        onChange={(e) => setGameRequest((p) => ({ ...p, link: e.target.value }))}
                        placeholder="https://..."
                        className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                        Description (optional)
                      </label>
                      <textarea
                        value={gameRequest.description}
                        onChange={(e) => setGameRequest((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Tell us more about this game..."
                        rows={3}
                        className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !gameRequest.gameName.trim()}
                      className="w-full py-4 bg-accent text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                      {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="pt-2"
              >
                {!user ? (
                  <div className="flex flex-col items-center text-center py-12 gap-4">
                    <Heart className={`w-12 h-12 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                      Sign in to see your favorite games
                    </p>
                  </div>
                ) : favoriteGames.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-12 gap-4">
                    <Heart className={`w-12 h-12 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>No favorites yet</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                        Click the heart on any game to save it here
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                        {favoriteGames.length} saved game{favoriteGames.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => { handleClose(); navigate('/library/favorites'); }}
                        className="text-xs font-bold text-accent flex items-center gap-1 hover:opacity-80 transition-opacity"
                      >
                        View All <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {favoriteGames.slice(0, 8).map((game) => (
                      <div
                        key={game.id}
                        className={`flex items-center gap-4 p-3 rounded-2xl border transition-all group ${isDarkMode ? 'bg-white/3 border-white/8 hover:bg-white/8' : 'bg-black/3 border-black/8 hover:bg-black/8'}`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5">
                          <img
                            src={game.thumbnail}
                            alt={game.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{game.title}</p>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{game.category}</p>
                        </div>
                        <button
                          onClick={() => handlePlayFavorite(game)}
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          Play
                        </button>
                      </div>
                    ))}
                    {favoriteGames.length > 8 && (
                      <button
                        onClick={() => { handleClose(); navigate('/library/favorites'); }}
                        className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                      >
                        View {favoriteGames.length - 8} More <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
