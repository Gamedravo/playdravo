import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MessageCircle, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface GameRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user: any;
}

export function GameRequestModal({ isOpen, onClose, isDarkMode, t, user }: GameRequestModalProps) {
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user || !requestTitle.trim() || !requestDescription.trim()) {
      if (!user) toast.error(t('authRequiredToSubmit') || 'Authentication required to submit.');
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await api.submitGameRequest({
        gameName: requestTitle.trim(),
        description: requestDescription.trim(),
      });
      onClose();
      setRequestTitle('');
      setRequestDescription('');
      toast.success(t('gameRequestSubmitted') || 'Game feature request submitted.');
    } catch (error) {
      console.error("Game Request Error:", error);
      toast.error(t('failedToSubmitRequest') || 'Failed to submit request.');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}
    >
      <motion.div 
        initial={false}
        animate={isOpen ? { scale: 1, y: 0 } : { scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`border w-full max-w-lg rounded-[3rem] shadow-2xl relative transition-all duration-500 flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50 shrink-0" />
        <div className="p-10 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Request: Game</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight leading-none">Request a <span className="text-accent">Game</span></h2>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('gameTitle') || 'Game Title'}</label>
              <input
                type="text"
                value={requestTitle}
                onChange={e => setRequestTitle(e.target.value)}
                placeholder={t('gameTitlePlaceholder') || 'e.g. Among Us, Minecraft...'}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('description') || 'Why do you want it?'}</label>
              <textarea
                value={requestDescription}
                onChange={e => setRequestDescription(e.target.value)}
                placeholder={t('requestDescriptionPlaceholder') || 'Tell us why this game should be added...'}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
            <button
              onClick={handleSubmitRequest}
              disabled={isSubmittingRequest || !requestTitle.trim() || !requestDescription.trim()}
              className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              {isSubmittingRequest ? (t('submitting') || 'Submitting...') : (t('submitRequest') || 'Submit Request')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
