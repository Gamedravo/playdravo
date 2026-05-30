import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bug, RefreshCw } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

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
    const path = 'bugReports';
    try {
      const reportData: any = {
        gameName: bugGameName.trim(),
        description: bugDescription.trim(),
        createdAt: serverTimestamp()
      };

      if (user?.uid) reportData.userId = user.uid;
      if (bugEmail && bugEmail.trim()) reportData.email = bugEmail.trim();

      await addDoc(collection(db, path), reportData);
      toast.success(t('submissionReceived') || 'Report submitted successfully.');
      onClose();
      setBugGameName('');
      setBugDescription('');
      setBugEmail('');
    } catch (error) {
      console.error("Bug Report Error:", error);
      handleFirestoreError(error, OperationType.CREATE, path);
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
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`relative w-full max-w-xl border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] transition-all duration-500 ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <Bug className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {(t('reportBug') || 'Report Bug').split(' ')[0]} <span className="text-red-500">{(t('reportBug') || 'Report Bug').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                {t('technicalIssueReport') || 'Technical Issue Report'}
              </p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black'}`}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="p-8 overflow-y-auto scrollbar-hide">
          <div className="space-y-6">
            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {t('gameNameLabel') || 'Game Name'}
              </label>
              <input 
                type="text" 
                value={bugGameName}
                onChange={(e) => setBugGameName(e.target.value)}
                placeholder="Enter game name"
                className={`w-full px-6 py-4 rounded-2xl border transition-all text-sm font-medium focus:ring-2 focus:ring-red-500/50 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {t('problemDescriptionLabel') || 'Problem Description'}
              </label>
              <textarea 
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder={t('bugDescriptionPlaceholder') || 'Describe the issue...'}
                className={`w-full h-40 p-6 rounded-3xl border transition-all resize-none text-sm font-medium focus:ring-2 focus:ring-red-500/50 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-3 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {t('optionalEmailLabel') || 'Email (Optional)'}
              </label>
              <input 
                type="email" 
                value={bugEmail}
                onChange={(e) => setBugEmail(e.target.value)}
                placeholder="your@email.com (optional)"
                className={`w-full px-6 py-4 rounded-2xl border transition-all text-sm font-medium focus:ring-2 focus:ring-red-500/50 outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`}
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBugReport}
            disabled={isSubmittingBug}
            className="w-full mt-8 py-4 bg-red-500 text-white rounded-2xl font-semibold tracking-wide text-xs shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmittingBug ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t('submitting') || 'Submitting...'}
              </>
            ) : (
              <>
                <Bug className="w-4 h-4" />
                {t('submitButton') || 'Submit'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
