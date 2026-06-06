import { Settings, X, Zap, Trophy, BrainCircuit, RotateCcw } from 'lucide-react';
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
  gamerPersona: { title: string; description: string } | null;
  isAnalyzingPersona: boolean;
  analyzeGamerPersona: () => void;
  handleGenerateDescriptions: () => void;
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
  userProfile,
  gamerPersona,
  isAnalyzingPersona,
  analyzeGamerPersona,
  handleGenerateDescriptions,
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
      <div className={`flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-bg-dark' : 'bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
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

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <h3 className={`text-[11px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {t('visualInterfaceTheme')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {THEMES.map((theme) => (
              <button
                key={theme.key}
                onClick={() => setAccentColor(theme.color)}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all border ${
                  accentColor === theme.color
                    ? 'bg-accent/10 border-accent'
                    : isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-black/5 border-black/10 hover:border-black/20'
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

          <h3 className={`text-[11px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {t('gamerPersonaAnalysis')}
          </h3>
          <div className={`p-5 border rounded-2xl mb-8 relative overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/10'}`}>
            {gamerPersona ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-accent">{gamerPersona.title}</h4>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-white/40">{t('aiPersonaLocked')}</span>
                  </div>
                </div>
                <p className={`text-sm italic ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>"{gamerPersona.description}"</p>
                <button
                  onClick={analyzeGamerPersona}
                  disabled={isAnalyzingPersona}
                  className="mt-4 text-[11px] font-semibold text-white/60 hover:text-white flex items-center gap-2"
                >
                  <RotateCcw className={`w-3 h-3 ${isAnalyzingPersona ? 'animate-spin' : ''}`} />
                  {t('reAnalyzePersona')}
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <BrainCircuit className="w-8 h-8 text-accent/60 mx-auto mb-3" />
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{t('analyzeGamesUnlock')}</p>
                <button
                  onClick={analyzeGamerPersona}
                  disabled={isAnalyzingPersona}
                  className="px-6 py-2.5 bg-accent text-bg-dark text-[11px] font-bold rounded-xl uppercase tracking-wide"
                >
                  {isAnalyzingPersona ? t('analyzing') : t('initializeAnalysis')}
                </button>
              </div>
            )}
          </div>

          <h3 className={`text-[10px] font-semibold tracking-wide mb-4 ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{t('language')}</h3>
          <div className="mb-8">
            <LanguageSwitcher currentLanguage={language} setLanguage={setLanguage} isDarkMode={isDarkMode} variant="grid" />
          </div>

          <div className="p-5 bg-accent/5 border border-accent/20 rounded-2xl mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-bold">{t('aiImprovementActive')}</h4>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{t('aiImprovementDesc')}</p>
          </div>

          {userProfile?.role === 'admin' && (
            <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-2xl mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-4 h-4 text-red-500" />
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-wide">{t('adminTools')}</h4>
              </div>
              <p className={`text-xs mb-4 ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{t('adminToolsDesc')}</p>
              <button onClick={handleGenerateDescriptions} className="w-full py-2.5 bg-red-500 text-white rounded-xl font-semibold text-[10px]">
                {t('optimizeGameDescriptions')}
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-3 bg-accent text-bg-dark rounded-xl font-semibold text-xs"
          >
            {t('savePreferences')}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
