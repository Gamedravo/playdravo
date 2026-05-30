import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Wrench, Download } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

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
    if (!user || !activeGame) {
      return;
    }

    try {
      const modId = Math.random().toString(36).substr(2, 9);
      const newModData = {
        title: newMod.title,
        description: newMod.description,
        author: user.displayName || 'Anonymous',
        authorId: user.uid,
        version: newMod.version,
        downloads: 0,
        rating: 5.0,
        thumbnail: `https://picsum.photos/seed/${modId}/200/200`,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'games', activeGame.id, 'mods'), newModData);
      
      onClose();
      setNewMod({ title: '', version: 'v1.0.0', description: '' });
      toast.success(t('modSubmitted') || 'Mod submitted successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `games/${activeGame.id}/mods`);
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
        className={`border w-full max-w-lg rounded-[3rem] shadow-2xl relative transition-all duration-500 flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className="flex justify-between items-start p-12 pb-6 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">{t('systemModification') || 'System Modification'}</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-none">
              {(t('generateMod') || 'Generate Mod').split(' ')[0]} <span className="text-accent">{(t('generateMod') || 'Generate Mod').split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>
          <button onClick={onClose} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
            <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 pt-0 scrollbar-hide">
          <form className="space-y-6" onSubmit={handleGenerateMod}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('modTitle') || 'Mod Title'}</label>
                <input 
                  type="text" 
                  required 
                  value={newMod.title}
                  onChange={(e) => setNewMod({...newMod, title: e.target.value})}
                  className={`w-full rounded-xl px-5 py-3 focus:border-accent/50 outline-none transition-all font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`} 
                  placeholder={t('modTitlePlaceholder') || 'Enter mod title'} 
                />
              </div>
              <div>
                <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('version') || 'Version'}</label>
                <input 
                  type="text" 
                  required 
                  value={newMod.version}
                  onChange={(e) => setNewMod({...newMod, version: e.target.value})}
                  className={`w-full rounded-xl px-5 py-3 focus:border-accent/50 outline-none transition-all font-mono ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`} 
                  placeholder={t('versionPlaceholder') || 'v1.0.0'} 
                />
              </div>
              <div>
                <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('authorAlias') || 'Author Alias'}</label>
                <input 
                  type="text" 
                  disabled
                  value={user?.displayName || 'Anonymous'}
                  className={`w-full rounded-xl px-5 py-3 opacity-50 outline-none transition-all font-bold ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'}`} 
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>{t('modDescription') || 'Mod Description'}</label>
              <textarea 
                required
                value={newMod.description}
                onChange={(e) => setNewMod({...newMod, description: e.target.value})}
                className={`w-full rounded-xl px-5 py-3 focus:border-accent/50 outline-none transition-all h-32 resize-none text-sm ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-black/5 border-black/10 text-black placeholder:text-black/20'}`} 
                placeholder={t('describeChangesPlaceholder') || 'Describe what your mod does'} 
              ></textarea>
            </div>

            <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${isDarkMode ? 'border-white/5 bg-white/2 hover:bg-white/5' : 'border-black/5 bg-black/2 hover:bg-black/5'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                <Download className={`w-8 h-8 group-hover:text-accent transition-colors ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">{t('uploadModPackage') || 'Upload Mod Package'}</p>
                <p className={`text-[11px] uppercase tracking-widest mt-1 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{t('uploadModDesc') || 'Drag and drop .zip or .rar files'}</p>
              </div>
            </div>

            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-5 font-bold rounded-2xl hover:bg-accent hover:text-bg-dark transition-all uppercase tracking-[0.2em] text-xs ${isDarkMode ? 'bg-white text-bg-dark' : 'bg-black text-white'}`}
            >
              {t('authorizeGeneration') || 'AUTHORIZE GENERATION'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
