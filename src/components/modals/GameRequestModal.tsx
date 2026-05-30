import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MessageCircle, HelpCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { toast } from 'sonner';

interface GameRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  user: any;
}

export function GameRequestModal({ isOpen, onClose, isDarkMode, t, user }: GameRequestModalProps) {
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user || !requestTitle.trim() || !requestDescription.trim()) {
      if (!user) toast.error(t('authRequiredToSubmit') || 'Authentication required to submit.');
      return;
    }
    setIsSubmittingRequest(true);
    try {
      await addDoc(collection(db, 'gameRequests'), {
        userId: user.uid,
        userEmail: user.email || '',
        displayName: user.displayName || 'Anonymous Player',
        gameName: requestTitle,
        description: requestDescription,
        status: 'pending',
        createdAt: serverTimestamp(),
        votes: 0
      });
      onClose();
      setRequestTitle('');
      setRequestDescription('');
      toast.success(t('gameRequestSubmitted') || 'Game feature request submitted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gameRequests');
    } finally {
      setIsSubmittingRequest(false);
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
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">{t('systemFeatureRequest') || 'System Feature Request'}</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight leading-none">
              {(t('request') || 'Request')} <span className="text-accent">{(t('feature') || 'Feature')}</span>
            </h2>
          </div>
          <button onClick={onClose} className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}>
            <X className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 pt-0 scrollbar-hide">
          <div className="space-y-6">
            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                {t('featureTitle') || 'Feature Title'}
              </label>
              <input 
                type="text" 
                required 
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                className={`w-full rounded-xl px-5 py-3 focus:border-accent/50 outline-none transition-all font-bold ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40' : 'bg-black/10 border-black/20 text-black placeholder:text-black/40'}`} 
                placeholder={t('featureTitlePlaceholder') || 'What feature?'} 
              />
            </div>
            
            <div>
              <label className={`block text-[11px] font-semibold tracking-wide mb-2 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>
                {t('descriptionLogic') || 'Description Logic'}
              </label>
              <textarea 
                required
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                className={`w-full rounded-xl px-5 py-3 focus:border-accent/50 outline-none transition-all h-40 resize-none text-sm ${isDarkMode ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40' : 'bg-black/10 border-black/20 text-black placeholder:text-black/40'}`} 
                placeholder={t('explainFeature') || 'Explain...'} 
              ></textarea>
            </div>

            <div className={`p-6 rounded-2xl border flex items-start gap-4 ${isDarkMode ? 'bg-accent/10 border-accent/30' : 'bg-accent/10 border-accent/30'}`}>
              <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className={`text-[11px] font-medium leading-relaxed ${isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                {t('featureRegistryDesc') || 'Features are reviewed.'}
              </p>
            </div>

            <motion.button 
              onClick={handleSubmitRequest}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmittingRequest || !requestTitle.trim() || !requestDescription.trim()}
              className={`w-full py-5 font-bold rounded-2xl hover:bg-accent hover:text-bg-dark transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-white text-bg-dark' : 'bg-black text-white'}`}
            >
              {isSubmittingRequest ? (t('submitting') || 'Submitting...') : (t('submitToRegistry') || 'Submit To Registry')}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
