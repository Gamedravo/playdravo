import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LifeBuoy } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

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
      await api.submitContactMessage({
        subject: supportSubject,
        message: supportMessage,
        email: userProfile?.email || supportEmail || undefined,
      });
      toast.success(t('supportTicketSubmitted') || 'Support ticket submitted successfully!');
      onClose();
      setSupportSubject('');
      setSupportMessage('');
      setSupportEmail('');
    } catch (error) {
      console.error("Error submitting support ticket:", error);
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
        className={`absolute inset-0 backdrop-blur-xl transition-all duration-500 ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
      />
      <motion.div 
        initial={false}
        animate={isOpen ? { scale: 1, y: 0 } : { scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`border w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Support: Ticket</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight leading-none">Get <span className="text-accent">Support</span></h2>
            </div>
            <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>
          {!userProfile?.email && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('email') || 'Email'}</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                placeholder="your@email.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('subject') || 'Subject'} *</label>
            <input
              type="text"
              value={supportSubject}
              onChange={e => setSupportSubject(e.target.value)}
              placeholder={t('supportSubjectPlaceholder') || 'What do you need help with?'}
              required
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('message') || 'Message'} *</label>
            <textarea
              value={supportMessage}
              onChange={e => setSupportMessage(e.target.value)}
              placeholder={t('supportMessagePlaceholder') || 'Describe your issue in detail...'}
              rows={5}
              required
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingSupport || !supportSubject || !supportMessage}
            className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <LifeBuoy className="w-4 h-4" />
            {isSubmittingSupport ? (t('submitting') || 'Submitting...') : (t('submitTicket') || 'Submit Ticket')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
