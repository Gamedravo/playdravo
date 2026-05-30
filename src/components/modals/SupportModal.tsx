import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LifeBuoy } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  userProfile?: any;
  user?: any;
}

export function SupportModal({ isOpen, onClose, isDarkMode, t, userProfile, user }: SupportModalProps) {
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    setIsSubmittingSupport(true);
    try {
      const messageData: any = {
        subject: supportSubject,
        message: supportMessage,
        createdAt: serverTimestamp()
      };
      if (userProfile?.email || supportEmail) {
        messageData.email = userProfile?.email || supportEmail;
      }
      if (user?.uid) {
        messageData.userId = user.uid;
      }

      await addDoc(collection(db, 'contactMessages'), messageData);
      toast.success(t('supportTicketSubmitted') || 'Support ticket submitted successfully!');
      onClose();
      setSupportSubject('');
      setSupportMessage('');
      setSupportEmail('');
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      handleFirestoreError(error, OperationType.CREATE, 'contactMessages');
      toast.error("Failed to submit support ticket. Please try again.");
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <motion.div 
        initial={false}
        animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className={`absolute inset-0 transition-all duration-500 backdrop-blur-xl ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
      />
      <motion.div
        initial={false}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`relative w-full max-w-xl border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] transition-all duration-500 ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className={`p-8 border-b flex items-center justify-between shrink-0 transition-all ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20"
            >
              <LifeBuoy className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{(t('supportTicket') || 'Support Ticket').split(' ')[0]} <span className="text-accent">{(t('supportTicket') || 'Support Ticket').split(' ').slice(1).join(' ')}</span></h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('directSupportAccess') || 'Direct Support Access'}</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
        >
          <div className="space-y-4">
            {!user && (
              <div className="space-y-2">
                <label className={`text-[10px] font-semibold tracking-wide px-2 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('emailOptional') || 'Email (Optional)'}</label>
                <input 
                  type="email" 
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder={t('emailAddress') || "your@email.com"} 
                  className={`w-full border rounded-2xl py-4 px-5 text-[10px] font-semibold tracking-wide focus:outline-none focus:border-accent/50 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'}`}
                />
              </div>
            )}
            <div className="space-y-2">
              <label className={`text-[10px] font-semibold tracking-wide px-2 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('subject') || 'Subject'}</label>
              <input 
                type="text" 
                required
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder={t('issueCategory') || 'Issue Category'} 
                className={`w-full border rounded-2xl py-4 px-5 text-[10px] font-semibold tracking-wide focus:outline-none focus:border-accent/50 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'}`}
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-semibold tracking-wide px-2 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{t('issueDetails') || 'Issue Details'}</label>
              <textarea 
                required
                rows={4}
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder={t('describeGameIssue') || 'Describe your issue details...'} 
                className={`w-full border rounded-2xl py-4 px-5 text-[10px] font-semibold tracking-wide focus:outline-none focus:border-accent/50 transition-all resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40' : 'bg-black/5 border-black/10 text-black placeholder:text-black/40'}`}
              />
            </div>
          </div>
          <motion.button 
            type="submit"
            disabled={isSubmittingSupport}
            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(157,92,255,0.5)' }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-5 bg-accent text-bg-dark rounded-2xl font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(157,92,255,0.3)] ${isSubmittingSupport ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmittingSupport ? (t('processing') || 'Submitting...') : (t('submitSupportTicket') || 'SUBMIT TICKET')}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
