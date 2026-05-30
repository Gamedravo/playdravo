import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

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
    const path = 'reports';
    try {
      const reportsRef = collection(db, path);
      await addDoc(reportsRef, {
        gameId: activeGame.id,
        gameTitle: activeGame.title,
        uid: user.uid,
        reason: reportReason,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      toast.success(t('gameIssueReportSubmitted') || 'Game issue report submitted.');
      onClose();
      setReportReason('');
    } catch (error) {
      console.error("Report Error:", error);
      try {
        handleFirestoreError(error, OperationType.CREATE, path);
      } catch (e) {
        // Error already logged and re-thrown
      }
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
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`relative w-full max-w-xl border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] transition-all duration-500 ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20"
            >
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {(t('gameIssue') || 'Game Issue').split(' ')[0]} <span className="text-red-500">{(t('gameIssue') || 'Game Issue').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>
                {t('reportIntegrityBreach') || 'Report Integrity Breach'}
              </p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <div className="mb-8">
            <p className={`text-[10px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{t('targetGame') || 'Target Game'}</p>
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <p className="text-sm font-bold text-white/60">{activeGame?.title || 'Unknown Game'}</p>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-1">ID: {activeGame?.id || 'Unknown ID'}</p>
            </div>
          </div>

          <div className="mb-8">
            <p className={`text-[10px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{t('violationDetails') || 'Violation Details'}</p>
            <textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder={t('describeIssuePlaceholder') || 'Describe the issue...'}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-red-500/50 outline-none transition-all resize-none placeholder:text-white/10"
            />
          </div>

          <div className="flex gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold tracking-wide text-xs hover:bg-white/10 transition-all"
            >
              {t('abort') || 'ABORT'}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReportGame}
              disabled={isReporting || !reportReason.trim()}
              className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-semibold tracking-wide text-xs shadow-[0_0_30px_rgba(239,68,68,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReporting ? (t('transmitting') || 'TRANSMITTING...') : (t('transmitReport') || 'TRANSMIT REPORT')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
