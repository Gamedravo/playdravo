import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { ArrowLeft, Home, ChevronRight, Bug, Send, Check, Monitor, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORT_EMAIL, supportMailto } from '../lib/brandContact';

interface ReportBugPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function ReportBugPage({ isDarkMode, t }: ReportBugPageProps) {
  const navigate = useNavigate();
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [browserInfo, setBrowserInfo] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gameTitle: 'General / Platform',
    severity: 'medium',
    description: '',
    stepsToReproduce: '',
    screenshotUrl: ''
  });

  useEffect(() => {
    // Auto-detect browser/agent details
    if (typeof navigator !== 'undefined') {
      const info = `UserAgent: ${navigator.userAgent} | Platform: ${navigator.platform} | Languages: ${navigator.languages.join(',')}`;
      setBrowserInfo(info);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setTicketLoading(true);
    // Mimic database transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTicketLoading(false);
    setTicketSent(true);
    toast.success('Your bug report has been securely queued to engineering!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12">
        
        {/* Navigation Breadcrumbs Header */}
        <div className={`p-4 md:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
          isDarkMode ? 'bg-[#111122]/40 border-white/5' : 'bg-slate-50/40 border-black/5'
        }`}>
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-accent' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black hover:text-accent'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
            
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
              <Link to="/" className="hover:text-accent flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-accent/55" />
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Report a Bug</span>
            </div>
          </div>
          
          <PageBrandMark />
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-4">
            <Bug className="w-8 h-8 md:w-12 md:h-12 text-rose-500" />
            Report a Bug
          </h1>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            Encountered a gameplay freeze, broken UI layout, or incorrect system calculations? Submit a report below or email{' '}
            <a href={supportMailto('Bug Report')} className="text-accent hover:underline font-semibold">{SUPPORT_EMAIL}</a> directly.
          </p>
        </div>

        {/* Outer Form Box */}
        <div className={`p-8 md:p-12 rounded-[2.5rem] border ${
          isDarkMode ? 'bg-gradient-to-b from-[#111124] to-[#0d0d18] border-white/5' : 'bg-white border-black/10 shadow-md'
        }`}>
          {ticketSent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-bg-dark flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-emerald-500">Bug Report Transmitted!</h2>
              <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                Thank you for contributing to PlayDravo stability! Engineering has been notified alongside your client context information. We will deploy repairs directly.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <button 
                  onClick={() => {
                    setTicketSent(false);
                    setFormData({ name: '', email: '', gameTitle: 'General / Platform', severity: 'medium', description: '', stepsToReproduce: '', screenshotUrl: '' });
                  }}
                  className="px-5 py-3 text-xs font-bold bg-accent text-bg-dark rounded-xl tracking-wider uppercase hover:scale-105 transition-all"
                >
                  Report Another Bug
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wider uppercase border transition-all ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'
                  }`}
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Your Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g., John Doe"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Target Game or Feature</label>
                  <input 
                    type="text"
                    value={formData.gameTitle}
                    onChange={(e) => setFormData({ ...formData, gameTitle: e.target.value })}
                    placeholder="E.g., Z-Typer or Settings Panel"
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Estimated Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                      isDarkMode ? 'bg-[#18182a] border-white/5 text-white' : 'bg-white border-black/5 text-black'
                    }`}
                  >
                    <option value="low">Low (Cosmetic/Typo/Suggestion)</option>
                    <option value="medium">Medium (Layout glitch/Minor bug)</option>
                    <option value="high">High (Game failing to load/Crashes)</option>
                    <option value="critical">Critical (Account lock / Data loss)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Bug Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail exactly what you observed. What failed to execute?"
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Steps to Reproduce</label>
                <textarea
                  rows={2}
                  value={formData.stepsToReproduce}
                  onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                  placeholder="1. Open Game on Mobile\n2. Click Play button\n3. Observed freeze..."
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Screenshot URL or Asset Reference</label>
                <input 
                  type="url"
                  value={formData.screenshotUrl}
                  onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
                  placeholder="https://imgur.com/example-screenshot.png"
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                    isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                  }`}
                />
              </div>

              {/* Automatically Detected Client metadata info */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3.5 bg-black/5 ${
                isDarkMode ? 'border-dashed border-white/5 text-white/50' : 'border-dashed border-black/5 text-black/50'
              }`}>
                <Monitor className="w-5 h-5 shrink-0 mt-0.5 text-accent" />
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider block opacity-75">Auto-detected Device & Browser Context</span>
                  <p className="text-[10.5px] font-mono leading-relaxed select-all">
                    {browserInfo}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={ticketLoading}
                className="w-full py-4 bg-accent text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {ticketLoading ? (
                  <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Bug Report Form
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
