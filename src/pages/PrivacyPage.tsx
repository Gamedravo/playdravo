import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { SEO } from '../components/SEO';
import { ShieldAlert, Fingerprint, Lock, Eye, FileText, CheckCircle, Home, ChevronRight, ArrowLeft } from 'lucide-react';

interface PrivacyPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function PrivacyPage({ isDarkMode, t }: PrivacyPageProps) {
  const lastUpdated = "May 31, 2026";

  const pillars = [
    {
      icon: <Eye className="w-5 h-5 text-accent" />,
      title: "Data Transparency",
      desc: "We clearly document every data point we collect, store, or process. No hidden tracking, no telemetry logging, and absolute clarity on what's utilized."
    },
    {
      icon: <Lock className="w-5 h-5 text-accent" />,
      title: "Secure Encryption",
      desc: "All transit communication and local persistent records are secured with industrial-standard encryption to minimize unauthorized access potentials."
    },
    {
      icon: <Fingerprint className="w-5 h-5 text-accent" />,
      title: "User Sovereignty",
      desc: "You retain absolute ownership over your profile, favorites, play statistics, and historic records. Delete your entire cloud or local presence with one click."
    }
  ];

  return (
    <>
    <SEO
      title="Privacy Policy | GameDravo"
      description="Read the GameDravo Privacy Policy to understand how we collect, use, and protect your personal data when you use our free browser gaming platform."
      canonicalUrl="https://gamedravo.com/privacy"
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
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Privacy Policy</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified Policy Document
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
          <div className="flex items-center gap-3 text-xs">
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Effective Date:</span>
            <span className="font-bold text-accent">{lastUpdated}</span>
            <span className={isDarkMode ? 'text-white/20' : 'text-black/20'}>|</span>
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Author:</span>
            <span className="font-bold">GameDravo Legal Compliance Division</span>
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
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Information We Collect</h2>
            </div>
            <p>
              At GameDravo, we believe in minimal data overhead. We only collect the necessary information required to provide, authenticate, and improve our high-fidelity gaming portal:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Account Credentials:</strong> Email addresses, hashed secure passwords, and display avatars provided during voluntary user registrations or OAuth authentications.</li>
              <li><strong>Local Interactions State:</strong> Interactive statistics including favorites lists, high score logs, recently played lists, and game preferences. This is primarily stored locally in the secure client sandbox or synchronized securely with certified Firestore backends.</li>
              <li><strong>Usage Analytics:</strong> Anonymous diagnostic information, system performance indicators (frame rates, load speed, display size errors), and game launch records to optimize bandwidth and frame sizing.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">2</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>How We Use Your Information</h2>
            </div>
            <p>
              Your information is exclusively utilized to maintain responsive platform gameplay and enforce a trustable security footprint:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>To synchronize and keep your favorites library updated across distinct device terminals.</li>
              <li>To evaluate request load times and maintain optimized server resources.</li>
              <li>To enforce standard security regulations of our cloud operations and block automated bot activities.</li>
              <li>To curate customized dashboard recommendations aligned with your verified gaming category interests.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">3</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Cookies and Storage Sandbox</h2>
            </div>
            <p>
              We utilize cookies, IndexedDB, and local client state configurations (localStorage) to process user selections and secure authentication details. These cookies do not aggregate cross-domain advertising insights. You may fully adjust or deny cookies via your system browser configurations, although certain localized library properties will cease persistence.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">4</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Third-Party Processing & Ad Policies</h2>
            </div>
            <p>
              We do not sell, exchange, or commercialize your personal information files. Third-party interactions inside our portal occur only in the following contexts:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li><strong>Google OAuth Identity:</strong> If you elect to register or login using Google, your name, email address, and avatar are verified against Google's authentication tokens.</li>
              <li><strong>Embedded Web Game Frame Permissions:</strong> Selected isolated free web games require standard sandboxed frame executions. They do not retain access to your core GameDravo system variables.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">5</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Compliance & Legal Contact</h2>
            </div>
            <p>
              We align with General Data Protection Regulations (GDPR) and California Consumer Privacy Act (CCPA) standards. If you have any inquiries regarding this document, require information erasure, or wish to audit your statistics files, you may submit a certified request via our Support panel or email{' '}
              <a href="mailto:support@gamedravo.com" className="text-accent hover:underline font-semibold">support@gamedravo.com</a> directly.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
    </>
  );
}
