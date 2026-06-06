import { Link } from 'react-router-dom';
import { Activity, Bug } from 'lucide-react';
import { PlayDravoLogo } from './PlayDravoLogo';
import { SUPPORT_EMAIL, supportMailto } from '../lib/brandContact';

interface FooterProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function Footer({ isDarkMode, t }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Redesigned navigation links matching Poker, CrazyGames, and GamePix structures
  const navigationColumns = {
    platform: [
      { label: "Games Library", path: "/library" },
      { label: "Categories", path: "/library" },
      { label: "Trending", path: "/category/trending" },
      { label: "Submit Game", path: "/submit-game" }
    ],
    company: [
      { label: "About GameDravo", path: "/about" },
      { label: "Contact", path: "/contact" },
      { label: "Support Center", path: "/support" }
    ],
    legal: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Service", path: "/terms" },
      { label: "Cookie Policy", path: "/cookies" }
    ],
    system: [
      { label: "Status", path: "/status" },
      { label: "Report Bug", path: "/report-bug" }
    ]
  };

  return (
    <footer className={`mt-8 border-t transition-colors relative overflow-hidden rounded-2xl mb-4 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-[#111122]/80 to-[#0e0e1a]/95 border-white/5 text-white/70' 
        : 'bg-gradient-to-b from-slate-50/80 to-slate-100/95 border-black/5 text-black/70'
    }`}>
      {/* Decors */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Core Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 relative z-10 grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand Column */}
        <div className="col-span-2 md:col-span-4 space-y-6">
          <PlayDravoLogo size="sm" showWordmark href="/" className="group" />
          <p className={`text-xs leading-relaxed max-w-sm ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
            GameDravo is an instant-access web gaming portal curating premier, lightweight, and hardware-optimized HTML5 game configurations for cross-platform desktop & mobile play.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white/45' : 'text-black/45'}`}>
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Platform Links */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/90' : 'text-black/90'}`}>
            Platform
          </h4>
          <ul className="space-y-3 text-xs">
            {navigationColumns.platform.map((link) => (
              <li key={link.label}>
                <Link 
                  to={link.path} 
                  className={`hover:text-accent font-semibold leading-loose transition-colors block py-1 ${
                    isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/90' : 'text-black/90'}`}>
            Company
          </h4>
          <ul className="space-y-3 text-xs">
            {navigationColumns.company.map((link) => (
              <li key={link.label}>
                <Link 
                  to={link.path} 
                  className={`hover:text-accent font-semibold leading-loose transition-colors block py-1 ${
                    isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Links */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/90' : 'text-black/90'}`}>
            Legal
          </h4>
          <ul className="space-y-3 text-xs">
            {navigationColumns.legal.map((link) => (
              <li key={link.label}>
                <Link 
                  to={link.path} 
                  className={`hover:text-accent font-bold leading-loose transition-all block py-1 flex items-center gap-1.5 ${
                    isDarkMode ? 'text-white/60 hover:text-white text-accent' : 'text-black/60 hover:text-black text-accent'
                  }`}
                >
                  <span className="text-[10px]">●</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* System Links */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-white/90' : 'text-black/90'}`}>
            System
          </h4>
          <ul className="space-y-3 text-xs">
            {navigationColumns.system.map((link) => (
              <li key={link.label}>
                <Link 
                  to={link.path} 
                  className={`hover:text-accent font-semibold leading-loose transition-colors block py-1 flex items-center gap-1.5 ${
                    isDarkMode ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                  }`}
                >
                  {link.label === "Status" && <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />}
                  {link.label === "Report Bug" && <Bug className="w-3.5 h-3.5 text-rose-500" />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Bottom Credentials Bar */}
      <div className={`border-t px-6 py-6 transition-all duration-300 ${
        isDarkMode ? 'border-white/5 bg-black/20' : 'border-black/5 bg-black/[0.01]'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`text-[11px] font-medium text-center md:text-left space-y-1 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
            <p>
              &copy; {currentYear} GameDravo Gaming Hub. All rights reserved.
              All games run sandboxed under compliant license configurations.
            </p>
            <p>
              Support:{' '}
              <a href={supportMailto()} className="text-accent hover:underline font-semibold">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
