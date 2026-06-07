import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface GameIssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  activeGame: any;
  user: any;
}

export function GameIssueReportModal({ isOpen, onClose, isDarkMode, t, activeGame, user }: GameIssueReportModalProps) {
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReportGame = async () => {
    if (!user || !activeGame || !reportReason.trim()) return;
    
    setIsReporting(true);
    try {
      await api.submitGameReport({
        gameId: activeGame.id,
        gameTitle: activeGame.title,
        reason: reportReason.trim(),
      });
      toast.success(t('gameIssueReportSubmitted') || 'Game issue report submitted.');
      onClose();
      setReportReason('');
    } catch (error) {
      console.error("Report Error:", error);
      toast.error(t('failedToSubmitGameReport') || 'Failed to submit game report.');
    } finally {
      setIsReporting(false);
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
        className={`border w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
        <div className="p-10 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.3em]">Report: Issue</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight leading-none">Report <span className="text-red-500">Issue</span></h2>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>
          {activeGame && (
            <p className="text-sm opacity-60">Reporting: <span className="font-bold opacity-100">{activeGame.title}</span></p>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('reason') || 'Reason'} *</label>
            <textarea
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder={t('reportReasonPlaceholder') || 'Describe the issue with this game...'}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-red-500 resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <button
            onClick={handleReportGame}
            disabled={isReporting || !reportReason.trim()}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <AlertTriangle className="w-4 h-4" />
            {isReporting ? (t('submitting') || 'Submitting...') : (t('submitReport') || 'Submit Report')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
