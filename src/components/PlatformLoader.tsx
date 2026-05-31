import { motion } from 'motion/react';

interface PlatformLoaderProps {
  message?: string;
  compact?: boolean;
}

export function PlatformLoader({ message = 'Loading games...', compact = false }: PlatformLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? 'gap-3 min-h-[40vh]' : 'gap-5'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <img
          src="/logo.svg"
          alt="PlayDravo"
          className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl shadow-[0_8px_32px_rgba(157,92,255,0.25)]`}
        />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-white/50 tracking-wide`}
      >
        {message}
      </motion.p>
    </div>
  );
}
