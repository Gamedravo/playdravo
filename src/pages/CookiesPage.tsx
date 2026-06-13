import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { SEO } from '../components/SEO';
import { ShieldCheck, Flame, Info, Eye, FileText, CheckCircle, Home, ChevronRight, ArrowLeft } from 'lucide-react';

interface CookiesPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function CookiesPage({ isDarkMode, t }: CookiesPageProps) {
  const lastUpdated = "May 31, 2026";

  const pillars = [
    {
      icon: <Eye className="w-5 h-5 text-accent" />,
      title: "Essential Cookies",
      desc: "These cookies are strictly required to verify OAuth sessions, track logged-in users, and save your game preferences seamlessly."
    },
    {
      icon: <Info className="w-5 h-5 text-accent" />,
      title: "Preferences Tracking",
      desc: "Used to persist client-side preferences such as dark mode toggle values, language selectors, volume attributes, and mute states."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-accent" />,
      title: "Security Shield",
      desc: "Protects against request forging, cross-site scripting vulnerabilities, and verifies secure sandbox token exchanges."
    }
  ];

  return (
    <>
    <SEO
      title="Cookie Policy | GameDravo"
      description="Learn how GameDravo uses cookies to improve your experience, save preferences, and keep our free browser gaming platform secure."
      canonicalUrl="https://gamedravo.com/cookies"
    />
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        {/* Navigation Breadcrumbs Header */}
        <div className={`p-4 md:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#111122]/40 border-white/5' : 'bg-slate-50/40 border-black/5'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <Link 
              to="/" 
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
            
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              <Link to="/" className="hover:text-accent flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-accent/55" />
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Cookie Policy</span>
            </div>
          </div>
          
          <PageBrandMark />
        </div>

        {/* Header Block */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            Active Cookie Statement
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Cookie Policy</h1>
          <div className="flex items-center gap-3 text-xs">
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Effective Date:</span>
            <span className="font-bold text-accent">{lastUpdated}</span>
            <span className={isDarkMode ? 'text-white/20' : 'text-black/20'}>|</span>
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Compliance:</span>
            <span className="font-bold">GDPR & ePrivacy Compliant</span>
          </div>
        </motion.div>

        {/* Pillars Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.map((pil) => (
            <div 
              key={pil.title} 
              className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'
              }`}
            >
              <div className="p-2 w-fit bg-accent/10 rounded-xl mb-3">{pil.icon}</div>
              <h3 className="font-bold text-sm mb-1.5">{pil.title}</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{pil.desc}</p>
            </div>
          ))}
        </div>

        {/* Detailed Document Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-8 md:p-12 rounded-[2.5rem] border space-y-8 leading-relaxed text-sm ${
            isDarkMode ? 'bg-white/[0.01] border-white/5 text-white/80' : 'bg-black/[0.01] border-black/5 text-black/80'
          }`}
        >
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">1</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>What Are Cookies?</h2>
            </div>
            <p>
              Cookies are small block files stored securely in your web browser environment. At GameDravo, we use standard local browser storage (`localStorage`, `sessionStorage`) alongside browser session identifiers. We minimize persistent tracking and never sell accumulated telemetry signals to marketing agencies.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">2</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>How We Classify Storage Use</h2>
            </div>
            <p>
              We classify storage items based on their core system utility requirement:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Local Profiles State:</strong> Keeps track of game points, level achievements, custom avatars, and inventory details cleanly on browser storage profiles to prevent progress loss.</li>
              <li><strong>Technical Session Tokens:</strong> Identifies your authentic session to the backend Firestore when performing store transactions or syncing leaderboards.</li>
              <li><strong>Aesthetics:</strong> Retains selections like dark/light mode toggles directly on browser reloads.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">3</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Managing Your Preferences</h2>
            </div>
            <p>
              You can adjust, clear, or suspend site storage in your browser settings. Clearing local storage will reset your high scores and play history unless they are saved to your account.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
    </>
  );
}
