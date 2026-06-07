import React, { useState } from 'react';
import { X, Check, ShieldAlert } from 'lucide-react';
import { PlayDravoMark } from './PlayDravoLogo';
import { toast } from 'sonner';
import { ModalShell } from './ui/ModalShell';
import { api } from '../lib/api';

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
      await api.updateProfile({ displayName: username, usernameSet: true, username });
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
      className="max-w-md"
    >
      <div className="p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <PlayDravoMark className="w-12 h-12 mb-4 text-accent" />
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em]">Setup: Username</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight leading-none mb-2">Choose Your <span className="text-accent">Name</span></h2>
          <p className="text-sm opacity-60">Pick a username that other players will see</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.trim())}
              placeholder="YourGamerTag"
              maxLength={20}
              className={`w-full px-5 py-4 rounded-2xl border text-base font-bold focus:outline-none focus:border-accent transition-all text-center ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-black/5 border-black/10 text-black placeholder-black/30'}`}
            />
            <div className="flex justify-between mt-2 px-1">
              <div className="flex items-center gap-1 text-xs opacity-60">
                <Check className={`w-3 h-3 ${isLengthValid ? 'text-green-400' : 'opacity-30'}`} />
                <span>6–20 chars</span>
              </div>
              <div className="flex items-center gap-1 text-xs opacity-60">
                <Check className={`w-3 h-3 ${isCharsValid && username.length > 0 ? 'text-green-400' : 'opacity-30'}`} />
                <span>Letters, numbers, . _</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={generateRandomUsername}
            className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
          >
            🎲 Generate Random
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full py-4 bg-accent text-white font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
          >
            {isSubmitting ? 'Setting up...' : 'Set Username'}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}
