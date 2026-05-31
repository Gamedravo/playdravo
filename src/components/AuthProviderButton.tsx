import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthProviderButtonProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  isDarkMode: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function AuthProviderButton({
  label,
  icon,
  onClick,
  isDarkMode,
  disabled,
  loading,
}: AuthProviderButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      whileHover={isDisabled ? {} : { scale: 1.01, y: -1 }}
      whileTap={isDisabled ? {} : { scale: 0.99 }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={`auth-provider-btn w-full py-3 px-4 rounded-xl md:rounded-2xl border flex items-center gap-3 transition-all group ${
        isDarkMode
          ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-accent/40'
          : 'bg-black/[0.03] border-black/10 hover:bg-black/[0.06] hover:border-accent/40'
      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span
        className={`auth-provider-icon shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
          isDarkMode
            ? 'bg-white/10 border-white/10 group-hover:border-accent/30'
            : 'bg-white border-black/10 shadow-sm group-hover:border-accent/30'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : icon}
      </span>
      <span className={`flex-1 text-left text-sm font-semibold tracking-tight ${isDarkMode ? 'text-white/90' : 'text-black/85'}`}>
        {label}
      </span>
    </motion.button>
  );
}
