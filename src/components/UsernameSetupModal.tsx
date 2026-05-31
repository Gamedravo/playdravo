import React, { useState } from 'react';
import { X, Check, ShieldAlert } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalShell';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onComplete: (newUsername: string) => void;
  isDarkMode: boolean;
}

export function UsernameSetupModal({ isOpen, onClose, userId, onComplete, isDarkMode }: UsernameSetupModalProps) {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states
  const isLengthValid = username.length >= 6 && username.length <= 20;
  const isCharsValid = /^[a-zA-Z0-9._]+$/.test(username);
  const isValid = isLengthValid && isCharsValid;

  const generateRandomUsername = () => {
    const adjectives = ['Epic', 'Swift', 'Dark', 'Neon', 'Cyber', 'Hyper', 'Mega', 'Ultra', 'Shadow', 'Frost'];
    const nouns = ['Gamer', 'Warrior', 'Ninja', 'Pilot', 'Ghost', 'Knight', 'Hunter', 'Blade', 'Storm', 'Volt'];
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    setUsername(`${adj}${noun}${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        displayName: username,
        usernameSet: true
      });
      onComplete(username);
      toast.success('Username set successfully!');
      onClose();
    } catch (error) {
      console.error("Error setting username:", error);
      toast.error('Failed to set username. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      isDarkMode={isDarkMode}
      maxWidth="max-w-md"
      zIndex={3000}
    >
      <div className="text-center">
        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
          Sign up
        </span>
        <h2 className={`mt-4 text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Set your username
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className={`w-full rounded-2xl border-2 bg-transparent px-6 py-4 text-lg font-bold outline-none transition-all ${
              isDarkMode 
                ? 'border-white/10 text-white focus:border-pink-500/50' 
                : 'border-black/10 text-black focus:border-pink-500/50'
            } ${!isValid && username.length > 0 ? 'border-red-500/50' : ''}`}
          />
          <button
            type="button"
            onClick={generateRandomUsername}
            className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-xl p-2 transition-all hover:bg-white/10 ${
              isDarkMode ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
            }`}
          >
            <PlayDravoMark size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <ValidationItem 
            isValid={isLengthValid} 
            text="6 to 20 characters" 
            isDarkMode={isDarkMode} 
            showStatus={username.length > 0}
          />
          <ValidationItem 
            isValid={isCharsValid} 
            text="Only letters, numbers, '.' and '_'" 
            isDarkMode={isDarkMode}
            showStatus={username.length > 0}
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full rounded-2xl py-4 text-sm font-semibold tracking-wide transition-all ${
            isValid && !isSubmitting
              ? 'bg-accent text-bg-dark hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Setting up...' : 'Continue'}
        </button>

        <div className={`flex gap-3 rounded-2xl p-4 ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
          <p className={`text-[10px] leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            We will <span className="font-bold underline text-white">permanently ban</span> accounts with toxic & inappropriate usernames without any notice. So let's keep the community nice and safe for everybody!
          </p>
        </div>
      </form>
    </ModalShell>
  );
}

function ValidationItem({ isValid, text, isDarkMode, showStatus }: { isValid: boolean; text: string; isDarkMode: boolean; showStatus: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-2 transition-all ${
      showStatus 
        ? (isValid ? 'bg-green-500/10' : 'bg-red-500/10') 
        : (isDarkMode ? 'bg-white/5' : 'bg-black/5')
    }`}>
      {showStatus ? (
        isValid ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <X className="h-4 w-4 text-red-500" />
        )
      ) : (
        <div className={`h-4 w-4 rounded-full border ${isDarkMode ? 'border-white/20' : 'border-black/20'}`} />
      )}
      <span className={`text-xs font-bold ${
        showStatus 
          ? (isValid ? 'text-green-500' : 'text-red-500') 
          : (isDarkMode ? 'text-white/40' : 'text-black/40')
      }`}>
        {text}
      </span>
    </div>
  );
}
