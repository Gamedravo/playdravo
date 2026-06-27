import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { SEO } from '../components/SEO';
import { FileCode, Scale, UserCheck, ShieldAlert, CheckCircle2, Home, ChevronRight, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function TermsPage({ isDarkMode, t }: TermsPageProps) {
  const lastUpdated = "May 31, 2026";

  const headers = [
    {
      icon: <Scale className="w-5 h-5 text-accent" />,
      title: "Legal Terms Binding",
      desc: "By accessing any domain or sub-components of GameDravo, you verified unconditional acceptance of these terms."
    },
    {
      icon: <UserCheck className="w-5 h-5 text-accent" />,
      title: "Fair & Ethical Use",
      desc: "We prioritize clean play. High score fraud, bot scripting, or reverse-engineering core games is strictly prohibited."
    },
    {
      icon: <FileCode className="w-5 h-5 text-accent" />,
      title: "IP Protection",
      desc: "All design materials, logos, brands, and custom gaming codes remains copyrighted by GameDravo or licensing partners."
    }
  ];

  return (
    <>
    <SEO
      title="Terms of Service | GameDravo"
      description="Review the GameDravo Terms of Service — the rules and guidelines governing your use of our free browser gaming platform."
      canonicalUrl="https://gamedravo.com/terms"
    />
    <div className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
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
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Terms of Service</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Official Terms of Service
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
          <div className="flex items-center gap-3 text-xs">
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Effective Date:</span>
            <span className="font-bold text-accent">{lastUpdated}</span>
            <span className={isDarkMode ? 'text-white/20' : 'text-black/20'}>|</span>
            <span className={isDarkMode ? 'text-white/40' : 'text-black/40'}>Author:</span>
            <span className="font-bold">GameDravo Operations Compliance Office</span>
          </div>
        </motion.div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {headers.map((hdr) => (
            <div 
              key={hdr.title} 
              className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'
              }`}
            >
              <div className="p-2 w-fit bg-accent/10 rounded-xl mb-3">{hdr.icon}</div>
              <h3 className="font-bold text-sm mb-1.5">{hdr.title}</h3>
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{hdr.desc}</p>
            </div>
          ))}
        </div>

        {/* Full Agreement Text */}
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
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Acceptance of the Terms</h2>
            </div>
            <p>
              These Terms of Service (referred to as "Terms" or "Agreement") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("User" or "you"), and GameDravo Gaming Portal ("GameDravo", "we", "us", or "our"), concerning your access to and use of the GameDravo website as well as any other media form, media channel, mobile website, or application related, linked, or otherwise connected thereto.
            </p>
            <p>
              By accessing the GameDravo gaming portal, you represent that you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with all of these Terms, then you are strictly prohibited from using the platform and must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">2</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Intellectual Property Rights</h2>
            </div>
            <p>
              Unless otherwise indicated, the GameDravo application, including all source code, databases, functionality, software, website designs, audio, video, text, branding patterns, and logos (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
            </p>
            <p>
              The Content and Marks are provided on GameDravo "AS IS" for your personal, non-commercial use only. Except as expressly provided in these Terms of Service, no part of GameDravo and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, sublicensed, or otherwise exploited for any commercial purpose whatsoever, without our prior written permission.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">3</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Prohibited Activities</h2>
            </div>
            <p>
              You may not access or use GameDravo for any purpose other than that for which we make the platform available. Standard user regulations require that users shall not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>Systematically retrieve data or other content from GameDravo to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
              <li>Exhaust, bypass, disable, or otherwise interfere with security-related components of GameDravo, including features that prevent or restrict the use or copying of any Content.</li>
              <li>Engage in unauthorized framing of or linking to the application.</li>
              <li>Use any automatic device, script, software robot, spider, or browser extension to manipulate gameplay, execute high score fraud, simulate plays, or alter statistical metrics.</li>
              <li>Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of GameDravo.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">4</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Disclaimers and Warranties</h2>
            </div>
            <p>
              THE APPLICATION IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF GAMEDRAVO AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST PERCENTAGE PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE PLATFORM AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY ERRORS, MISTAKES, OR INACCURACIES OF INTERACTIVE ASSETS, GAME SERVER TIMEOUTS, PERSONAL PROPERTY DAMAGE RESULTING FROM WEB BROWSER ACTIONS, OR UNAUTHORIZED SEIZURES OF ENCRYPTED PLATFORM SERVERS.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">5</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Governing Legislation & Dispute Resolution</h2>
            </div>
            <p>
              These Terms of Service and your use of GameDravo are governed by and construed in accordance with the internal system laws, without regard to conflict of law rules. Any legal dispute, claim, or arbitration arising from compliance issues shall be resolved via dedicated mutual consultations or submitted to authorized arbitration forums.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-accent text-bg-dark font-extrabold text-xs flex items-center justify-center">6</span>
              <h2 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-black'}`}>Contact</h2>
            </div>
            <p>
              For questions about these Terms, contact{' '}
              <a href="mailto:support@gamedravo.com" className="text-accent hover:underline font-semibold">support@gamedravo.com</a>.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
    </>
  );
}
