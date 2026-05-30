import React from 'react';
import { motion } from 'motion/react';
import { X, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  legalContent: {
    title: string;
    content: string;
  };
}

export function LegalModal({ isOpen, onClose, isDarkMode, t, legalContent }: LegalModalProps) {
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
              <FileText className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{legalContent.title}</h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{t('lastUpdated') || 'LAST UPDATED'}: March 2026</p>
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

        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <p className={`text-sm italic font-medium mb-8 leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            "{legalContent.content}"
          </p>
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 border rounded-2xl font-bold transition-all uppercase tracking-widest text-xs ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
          >
            {t('acknowledgeStatus') || 'ACKNOWLEDGE'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
