import { Settings, X, Zap } from 'lucide-react';
import { ModalShell } from './ui/ModalShell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Language, UserProfile } from '../types';

interface ThemeOption {
  name: string;
  key: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  accentColor: string;
  setAccentColor: (color: string) => void;
  THEMES: ThemeOption[];
  language: Language;
  setLanguage: (lang: Language) => void;
  userProfile: UserProfile | null;
}

export function PreferencesModal({
  isOpen,
  onClose,
  isDarkMode,
  t,
  accentColor,
  setAccentColor,
  THEMES,
  language,
  setLanguage,
}: PreferencesModalProps) {
  const prefTitle = t('preferences');
  const prefParts = prefTitle.split(' ');

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      isDarkMode={isDarkMode}
      maxWidth="max-w-xl"
      zIndex={110}
      padding="p-0"
      showCloseButton={false}
    >
      <div className={`pref-shell flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
        <span className="pref-orb -top-10 right-8 h-28 w-28 bg-accent/25" aria-hidden />
        <span className="pref-orb bottom-20 -left-10 h-32 w-32 bg-amber-400/15" aria-hidden />
        <div className={`relative z-10 p-6 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Settings className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {prefParts[0]} {prefParts.length > 1 && <span className="text-accent">{prefParts.slice(1).join(' ')}</span>}
              </h2>
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>
                {t('tailorGamingStats')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-black/5 border-black/10 hover:bg-black/10 text-black'}`}
            aria-label="Close preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto p-6 custom-scrollbar bolt-reveal-stagger">
          <section>
          <h3 className={`text-[11px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {t('visualInterfaceTheme')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">

            {THEMES.map((theme) => (
              <button
                key={theme.key}
                onClick={() => setAccentColor(theme.color)}
                className={`pref-option neon-panel p-3 rounded-xl flex flex-col items-center gap-2 border ${
                  accentColor === theme.color
                    ? 'bg-accent/10 border-accent shadow-[0_0_24px_rgba(124,58,237,0.20)]'
                    : isDarkMode ? 'bg-white/5 border-white/10 hover:border-accent/40 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:border-accent/40 hover:bg-white'
                }`}

              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${theme.color}20`, color: theme.color }}>
                  <theme.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-semibold ${accentColor === theme.color ? 'text-accent' : isDarkMode ? 'text-white/70' : 'text-black/70'}`}>
                  {t(theme.key)}
                </span>
              </button>
            ))}
          </div>
          </section>

          <section>
          <h3 className={`text-[10px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('language')}</h3>
          <div className="mb-8 pref-card p-3 border border-accent/10 bg-accent/[0.03]">
            <LanguageSwitcher currentLanguage={language} setLanguage={setLanguage} isDarkMode={isDarkMode} variant="grid" />
          </div>
          </section>

          <button
            onClick={onClose}
            className="pref-save neon-panel w-full py-3 bg-accent text-bg-dark rounded-xl font-semibold text-xs"
          >
            {t('savePreferences')}
          </button>

        </div>
      </div>
    </ModalShell>
  );
}
