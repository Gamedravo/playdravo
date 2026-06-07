import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Wrench, Download } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

interface SubmitModModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user: any;
  activeGame: any;
}

export function SubmitModModal({ isOpen, onClose, isDarkMode, t, user, activeGame }: SubmitModModalProps) {
  const [newMod, setNewMod] = useState({ title: '', version: 'v1.0.0', description: '' });

  const handleGenerateMod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeGame) return;

    try {
      await api.submitMod(activeGame.id, {
        title: newMod.title,
        description: newMod.description,
        version: newMod.version,
      });
      onClose();
      setNewMod({ title: '', version: 'v1.0.0', description: '' });
      toast.success(t('modSubmitted') || 'Mod submitted successfully.');
    } catch (error) {
      console.error("Mod Submit Error:", error);
      toast.error(t('failedToSubmitMod') || 'Failed to submit mod.');
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
        className={`border w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
        <form onSubmit={handleGenerateMod} className="p-10 space-y-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Mod: Submission</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight leading-none">Submit <span className="text-accent">Mod</span></h2>
            </div>
            <button type="button" onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:rotate-90">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('modTitle') || 'Mod Title'} *</label>
            <input
              type="text"
              value={newMod.title}
              onChange={e => setNewMod(p => ({ ...p, title: e.target.value }))}
              placeholder={t('modTitlePlaceholder') || 'e.g. God Mode, Speed Boost...'}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('version') || 'Version'}</label>
            <input
              type="text"
              value={newMod.version}
              onChange={e => setNewMod(p => ({ ...p, version: e.target.value }))}
              placeholder="v1.0.0"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{t('description') || 'Description'}</label>
            <textarea
              value={newMod.description}
              onChange={e => setNewMod(p => ({ ...p, description: e.target.value }))}
              placeholder={t('modDescriptionPlaceholder') || 'Describe what this mod does...'}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:border-accent resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
          </div>
          <button
            type="submit"
            disabled={!newMod.title.trim()}
            className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <Wrench className="w-4 h-4" />
            {t('submitMod') || 'Submit Mod'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
