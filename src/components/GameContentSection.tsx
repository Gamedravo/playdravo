import React, { useState } from 'react';
import { BookOpen, PlayCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Game } from '../types';
import { generateGameOverview, generateHowToPlay, generateFeatures } from '../lib/gameContent';

interface Props {
  game: Game;
  isDarkMode: boolean;
}

type Tab = 'about' | 'howtoplay' | 'features';

export const GameContentSection: React.FC<Props> = ({ game, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [expanded, setExpanded] = useState(false);

  const overview = generateGameOverview(game);
  const { steps, note } = generateHowToPlay(game);
  const features = generateFeatures(game);

  const bg = isDarkMode ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-black/[0.02] border-black/[0.05]';
  const tabActive = isDarkMode
    ? 'bg-accent/15 text-accent border-accent/30'
    : 'bg-accent/10 text-accent border-accent/25';
  const tabInactive = isDarkMode
    ? 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/[0.04]'
    : 'text-black/50 border-transparent hover:text-black/80 hover:bg-black/[0.04]';
  const prose = isDarkMode ? 'text-white/70' : 'text-black/65';
  const heading = isDarkMode ? 'text-white/90' : 'text-black/85';

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'about',     label: 'About',       icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'howtoplay', label: 'How to Play',  icon: <PlayCircle className="w-3.5 h-3.5" /> },
    { id: 'features',  label: 'Features',     icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <section
      aria-label={`About ${game.title}`}
      className={`rounded-2xl border p-5 md:p-6 space-y-4 ${bg}`}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setExpanded(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide border transition-all ${
              activeTab === tab.id ? tabActive : tabInactive
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* About */}
      {activeTab === 'about' && (
        <div className="space-y-3">
          <h2 className={`text-base font-bold ${heading}`}>About {game.title}</h2>
          <div className={`text-sm leading-relaxed ${prose}`}>
            <p className={!expanded && overview.length > 320 ? 'line-clamp-4' : ''}>
              {overview}
            </p>
          </div>
          {overview.length > 320 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-accent hover:underline`}
            >
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" />Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" />Read more</>
              )}
            </button>
          )}
          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {game.tags.slice(0, 8).map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${
                    isDarkMode ? 'bg-white/[0.04] border-white/[0.07] text-white/45' : 'bg-black/[0.04] border-black/[0.07] text-black/45'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How to Play */}
      {activeTab === 'howtoplay' && (
        <div className="space-y-3">
          <h2 className={`text-base font-bold ${heading}`}>How to Play {game.title}</h2>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-accent/15 border border-accent/25 text-accent text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className={`text-sm leading-relaxed ${prose}`}>{step}</span>
              </li>
            ))}
          </ol>
          {note && (
            <p className={`text-xs leading-relaxed mt-2 italic ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              {note}
            </p>
          )}
          {(game.instructions || game.controls) && (
            <div className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
              isDarkMode ? 'bg-white/[0.03] border-white/[0.06] text-white/55' : 'bg-black/[0.03] border-black/[0.06] text-black/55'
            }`}>
              <span className="font-bold uppercase tracking-wide block mb-1 text-[10px]">Controls</span>
              {game.controls || game.instructions}
            </div>
          )}
        </div>
      )}

      {/* Features */}
      {activeTab === 'features' && (
        <div className="space-y-3">
          <h2 className={`text-base font-bold ${heading}`}>{game.title} – Game Features</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </span>
                <span className={`text-sm ${prose}`}>{feat}</span>
              </li>
            ))}
          </ul>
          {game.whyYoullLikeIt && (
            <div className={`mt-3 p-3 rounded-xl border text-sm leading-relaxed ${
              isDarkMode ? 'bg-accent/5 border-accent/15 text-white/65' : 'bg-accent/5 border-accent/15 text-black/65'
            }`}>
              <span className="font-bold text-accent text-[11px] uppercase tracking-wide block mb-1">Why You'll Like It</span>
              {game.whyYoullLikeIt}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
