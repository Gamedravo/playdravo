import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bug, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user?: any;
}

export function BugReportModal({ isOpen, onClose, isDarkMode, t, user }: BugReportModalProps) {
  const [bugGameName, setBugGameName] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);

  const handleBugReport = async () => {
    if (!bugGameName.trim() || !bugDescription.trim()) {
      toast.error(t('pleaseProvideBugDescription') || 'Please provide details about the bug.');
      return;
    }

    setIsSubmittingBug(true);
    try {
      await api.submitBugReport({
        gameName: bugGameName.trim(),
        description: bugDescription.trim(),
        email: bugEmail.trim() || undefined,
      });
      toast.success(t('submissionReceived') || 'Report submitted successfully.');
      onClose();
      setBugGameName('');
      setBugDescription('');
      setBugEmail('');
    } catch (error) {
      console.error("Bug Report Error:", error);
      toast.error(t('failedToSubmitBugReport') || 'Failed to submit bug report.');
    } finally {
      setIsSubmittingBug(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <motion.div 
        initial={false}
        animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
      />
      <motion.div 
        initial={false}
        animate={isOpen ? { scale: 1, y: 0 } : { scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`border w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <div className="p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">System: Report</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight leading-none">Report a <span className="text-accent">Bug</span></h2>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('gameName') || 'Game Name'}</label>
              <input
                type="text"
                value={bugGameName}
                onChange={e => setBugGameName(e.target.value)}
                placeholder={t('gameNamePlaceholder') || 'Which game has the bug?'}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('email') || 'Email (optional)'}</label>
              <input
                type="email"
                value={bugEmail}
                onChange={e => setBugEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('description') || 'Description'}</label>
              <textarea
                value={bugDescription}
                onChange={e => setBugDescription(e.target.value)}
                placeholder={t('bugDescriptionPlaceholder') || 'Describe the bug in detail...'}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
            <button
              onClick={handleBugReport}
              disabled={isSubmittingBug || !bugGameName.trim() || !bugDescription.trim()}
              className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {isSubmittingBug ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
              {isSubmittingBug ? (t('submitting') || 'Submitting...') : (t('submitBugReport') || 'Submit Report')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
