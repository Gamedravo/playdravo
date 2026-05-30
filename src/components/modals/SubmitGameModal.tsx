import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, RefreshCw, Rocket } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

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
    const path = 'gameRequests';
    try {
      const requestData: any = {
        gameName: newGameRequest.gameName.trim(),
        createdAt: serverTimestamp()
      };

      if (user?.uid) requestData.userId = user.uid;
      if (newGameRequest.link && newGameRequest.link.trim()) requestData.link = newGameRequest.link.trim();
      if (newGameRequest.description && newGameRequest.description.trim()) requestData.description = newGameRequest.description.trim();

      await addDoc(collection(db, path), requestData);
      toast.success(t('submissionReceived') || 'Submission received successfully.');
      onClose();
      setNewGameRequest({ gameName: '', link: '', description: '' });
    } catch (error) {
      console.error("Game Request Error:", error);
      handleFirestoreError(error, OperationType.CREATE, path);
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

        <div className="flex-1 overflow-y-auto p-12 pt-0 scrollbar-hide">
          <form className="space-y-8" onSubmit={handleGameRequest}>
            <div className="group/input">
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 group-focus-within/input:text-accent transition-colors ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('gameNameLabel') || 'Game Name'}</label>
              <input 
                type="text" 
                required 
                value={newGameRequest.gameName}
                onChange={(e) => setNewGameRequest({...newGameRequest, gameName: e.target.value})}
                className={`w-full rounded-2xl px-6 py-4 focus:border-accent/50 outline-none transition-all font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20 focus:bg-black/10'}`} 
                placeholder="Enter game name" 
              />
            </div>
            <div className="group/input">
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 group-focus-within/input:text-accent transition-colors ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('gameLinkLabel') || 'Game Link'}</label>
              <input 
                type="url" 
                value={newGameRequest.link}
                onChange={(e) => setNewGameRequest({...newGameRequest, link: e.target.value})}
                className={`w-full rounded-2xl px-6 py-4 focus:border-accent/50 outline-none transition-all font-mono text-xs ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20 focus:bg-black/10'}`} 
                placeholder="https://example.com/game" 
              />
            </div>
            <div className="group/input">
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 group-focus-within/input:text-accent transition-colors ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('gameDescriptionLabel') || 'Game Description'}</label>
              <textarea 
                value={newGameRequest.description}
                onChange={(e) => setNewGameRequest({...newGameRequest, description: e.target.value})}
                className={`w-full h-32 rounded-2xl px-6 py-4 focus:border-accent/50 outline-none transition-all font-medium text-sm resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20 focus:bg-black/10'}`} 
                placeholder="Tell us about the game..." 
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmittingGameRequest}
              className="w-full py-6 bg-accent text-bg-dark font-bold rounded-3xl shadow-[0_20px_40px_rgba(var(--accent-rgb),0.3)] hover:shadow-[0_30px_60px_rgba(var(--accent-rgb),0.4)] transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {isSubmittingGameRequest ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('transmitting') || 'Transmitting...'}
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  {t('submitRequestButton') || 'Submit Request'}
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
