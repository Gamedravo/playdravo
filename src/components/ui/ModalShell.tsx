import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  children: React.ReactNode;
  maxWidth?: string;
  zIndex?: number;
  padding?: string;
  showCloseButton?: boolean;
}

export function ModalShell({
  isOpen,
  onClose,
  isDarkMode,
  children,
  maxWidth = 'max-w-md',
  zIndex = 50,
  padding = 'p-8',
  showCloseButton = true
}: ModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      window.setTimeout(() => {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = prevPadding;
      }, 280);
    };
  }, [isOpen]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 md:p-6"
          style={{ zIndex }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative w-full overflow-hidden rounded-[2rem] border shadow-2xl ${maxWidth} ${padding} ${
              isDarkMode ? 'bg-[#12121e] border-white/10 text-white' : 'bg-white border-black/10 text-black'
            }`}
          >
            {showCloseButton && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className={`absolute top-6 right-6 z-50 rounded-xl p-2 transition-all hover:scale-110 active:scale-95 ${
                  isDarkMode 
                    ? 'hover:bg-white/10 text-white/60 hover:text-white' 
                    : 'hover:bg-black/10 text-black/60 hover:text-black'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {/* Modal Body */}
            <div className="relative z-10 w-full">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
