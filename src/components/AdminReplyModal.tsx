import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, ChevronDown, ChevronUp } from 'lucide-react';

interface AdminReplyModalProps {
  isDarkMode: boolean;
  ticket: {
    id: string;
    subject?: string;
    gameName?: string;
    message?: string;
    description?: string;
    email: string;
    createdAt?: string;
  };
  type: 'bug-reports' | 'game-requests' | 'support-tickets';
  onClose: () => void;
}

export const AdminReplyModal: React.FC<AdminReplyModalProps> = ({ isDarkMode, ticket, type, onClose }) => {
  const originalSubject = ticket.subject || ticket.gameName || 'Your submission';
  const originalBody = ticket.message || ticket.description || '';
  const formattedDate = ticket.createdAt
    ? new Date(ticket.createdAt).toLocaleString()
    : 'recently';

  const [subject, setSubject] = useState(`Re: ${originalSubject}`);
  const [body, setBody] = useState(
    `Hi,\n\nThank you for reaching out to GameDravo!\n\n[Write your reply here]\n\nBest regards,\nGameDravo Support Team`
  );
  const [showQuote, setShowQuote] = useState(false);
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const pos = body.indexOf('[Write your reply here]');
    if (pos !== -1) {
      textareaRef.current?.setSelectionRange(pos, pos + '[Write your reply here]'.length);
    }
  }, []);

  const quotedSection = `\n\n--- Original message from ${formattedDate} ---\n${originalBody}`;

  const fullBody = showQuote ? body + quotedSection : body;

  const handleSend = () => {
    const mailtoSubject = encodeURIComponent(subject);
    const mailtoBody = encodeURIComponent(fullBody);
    const mailtoUrl = `mailto:${ticket.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
    window.open(mailtoUrl, '_blank');
    setSent(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={`relative w-full sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] border shadow-2xl flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#0d1020] border-white/10' : 'bg-white border-black/10'}`}
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-8 pt-8 pb-6 border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Compose Reply</h2>
                <p className={`text-[10px] font-semibold tracking-widest uppercase ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                  to {ticket.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-black/40 hover:text-black'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
            {/* To */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
              <span className={`text-[10px] font-bold tracking-widest uppercase w-12 shrink-0 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>To</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{ticket.email}</span>
            </div>

            {/* Subject */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
              <span className={`text-[10px] font-bold tracking-widest uppercase w-12 shrink-0 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Re</span>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm font-medium ${isDarkMode ? 'text-white placeholder:text-white/20' : 'text-black placeholder:text-black/20'}`}
              />
            </div>

            {/* Body */}
            <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={9}
                className={`w-full bg-transparent border-none outline-none p-4 text-sm font-medium leading-relaxed resize-none ${isDarkMode ? 'text-white/90 placeholder:text-white/20' : 'text-black/90 placeholder:text-black/20'}`}
              />
            </div>

            {/* Quote toggle */}
            {originalBody && (
              <button
                onClick={() => setShowQuote(v => !v)}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-white/30 hover:text-white/60' : 'text-black/30 hover:text-black/60'}`}
              >
                {showQuote ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showQuote ? 'Hide quoted message' : 'Include original message'}
              </button>
            )}

            {/* Quoted preview */}
            {showQuote && originalBody && (
              <div className={`px-4 py-3 rounded-2xl border-l-4 border-accent/40 text-sm leading-relaxed ${isDarkMode ? 'bg-white/[0.02] text-white/40' : 'bg-black/[0.02] text-black/40'}`}>
                <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 ${isDarkMode ? 'text-white/25' : 'text-black/25'}`}>
                  Original message — {formattedDate}
                </p>
                <p className="whitespace-pre-wrap font-medium text-xs">{originalBody}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`px-8 py-6 border-t flex items-center justify-between gap-4 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
            <p className={`text-[10px] font-medium ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>
              Opens your email client to send
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-black/5 hover:bg-black/10 text-black/60'}`}
              >
                Cancel
              </button>
              {sent ? (
                <div className="px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-500 flex items-center gap-2">
                  <span>Opened!</span>
                </div>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!subject.trim() || !body.trim()}
                  className="px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest bg-accent text-white hover:bg-accent/90 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Reply
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
