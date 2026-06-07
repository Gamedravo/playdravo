import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface SubmitGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user: any;
}

export function SubmitGameModal({ isOpen, onClose, isDarkMode, t, user }: SubmitGameModalProps) {
  const [newGameRequest, setNewGameRequest] = useState({ gameName: '', link: '', description: '' });
  const [isSubmittingGameRequest, setIsSubmittingGameRequest] = useState(false);

  const handleGameRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameRequest.gameName.trim()) {
      toast.error(t('gameTitlePlaceholder') || 'Please enter a game title.');
      return;
    }

    setIsSubmittingGameRequest(true);
    try {
      await api.submitGameRequest({
        gameName: newGameRequest.gameName.trim(),
        link: newGameRequest.link.trim() || undefined,
        description: newGameRequest.description.trim() || undefined,
      });
      toast.success(t('submissionReceived') || 'Submission received successfully.');
      onClose();
      setNewGameRequest({ gameName: '', link: '', description: '' });
    } catch (error) {
      console.error("Game Request Error:", error);
      toast.error(t('failedToSubmit') || 'Failed to submit.');
    } finally {
      setIsSubmittingGameRequest(false);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}
    >
      <motion.div 
        initial={false}
        animate={isOpen ? { scale: 1, y: 0, rotateX: 0 } : { scale: 0.95, y: 20, rotateX: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`border w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden group transition-all duration-500 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 shrink-0" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-1000 pointer-events-none" />
        
        <div className="flex justify-between items-start p-12 pb-6 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Game: Submission</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tight leading-none">Submit <span className="text-accent">New Game</span></h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleGameRequest} className="p-12 pt-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('gameTitle') || 'Game Title'} *</label>
            <input
              type="text"
              value={newGameRequest.gameName}
              onChange={e => setNewGameRequest(prev => ({ ...prev, gameName: e.target.value }))}
              placeholder={t('gameTitlePlaceholder') || 'e.g. Minecraft, Among Us...'}
              className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('gameLink') || 'Game Link (optional)'}</label>
            <input
              type="url"
              value={newGameRequest.link}
              onChange={e => setNewGameRequest(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://..."
              className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('description') || 'Description (optional)'}</label>
            <textarea
              value={newGameRequest.description}
              onChange={e => setNewGameRequest(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('gameDescriptionPlaceholder') || 'Tell us more about this game...'}
              rows={3}
              className={`w-full px-5 py-4 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingGameRequest || !newGameRequest.gameName.trim()}
            className="w-full py-4 bg-accent text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            {isSubmittingGameRequest ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {isSubmittingGameRequest ? (t('submitting') || 'Submitting...') : (t('submitGame') || 'Submit Game')}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
