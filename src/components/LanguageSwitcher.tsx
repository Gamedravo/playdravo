import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Language } from '../lib/translations';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  isDarkMode: boolean;
  align?: 'left' | 'right';
  minimal?: boolean;
  variant?: 'dropdown' | 'grid';
}

const LANGUAGES: { code: Language; name: string; countryCode: string }[] = [
  { code: 'en', name: 'English', countryCode: 'us' },
  { code: 'es', name: 'Español', countryCode: 'es' },
  { code: 'de', name: 'Deutsch', countryCode: 'de' },
  { code: 'it', name: 'Italiano', countryCode: 'it' },
  { code: 'pt', name: 'Português', countryCode: 'pt' },
  { code: 'fr', name: 'Français', countryCode: 'fr' },
];

export function LanguageSwitcher({ 
  currentLanguage, 
  setLanguage, 
  isDarkMode, 
  align = 'right', 
  minimal = false,
  variant = 'dropdown'
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  const renderFlag = (countryCode: string, name: string, size: 'sm' | 'lg' = 'sm') => (
    <img 
      src={`https://flagcdn.com/w40/${countryCode}.png`} 
      alt={name}
      className={`${size === 'lg' ? 'w-8 h-5' : 'w-5 h-3.5'} object-cover rounded-sm shadow-sm group-hover:scale-110 transition-transform duration-200`}
      referrerPolicy="no-referrer"
    />
  );

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-3 gap-2 w-full">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 group border ${
              currentLanguage === lang.code
                ? 'bg-accent text-bg-dark border-accent'
                : isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border-white/10'
                  : 'bg-black/5 hover:bg-black/10 text-black/70 hover:text-black border-black/10'
            }`}
            title={lang.name}
          >
            <div className="mb-2">
              {renderFlag(lang.countryCode, lang.name, 'lg')}
            </div>
            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60">{lang.code}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${minimal ? '' : 'w-full'}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center transition-all duration-300 group border ${
          minimal 
            ? 'px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 gap-2'
            : 'gap-3 w-full px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white border-white/10'
        } ${isDarkMode ? '' : 'bg-black/5 hover:bg-black/10 text-black border-black/10'}`}
      >
        <div className="flex items-center justify-center">
          {renderFlag(currentLangObj.countryCode, currentLangObj.name)}
        </div>
        <span className={`text-[10px] font-semibold tracking-wide ${minimal ? 'hidden sm:block' : 'flex-1 text-left'}`}>
          {minimal ? currentLangObj.code : currentLangObj.name}
        </span>
        {!minimal && (
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-accent' : 'text-gray-500'}`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: minimal ? 10 : -10, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: minimal ? 10 : -10, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className={`absolute ${minimal ? 'top-full mt-2' : 'bottom-full mb-4'} ${align === 'right' ? 'right-0' : 'left-0'} w-full min-w-[200px] rounded-[2rem] overflow-hidden z-[110] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border backdrop-blur-3xl ${
              isDarkMode 
                ? 'bg-[#0a0a0a]/95 border-white/10' 
                : 'bg-white/95 border-black/10'
            }`}
          >
            <div className="p-3 space-y-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group relative ${
                    currentLanguage === lang.code
                      ? 'bg-accent text-bg-dark'
                      : isDarkMode
                        ? 'hover:bg-white/10 text-white/70 hover:text-white'
                        : 'hover:bg-black/10 text-black/70 hover:text-black'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {renderFlag(lang.countryCode, lang.name)}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider truncate flex-1 text-left">{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
