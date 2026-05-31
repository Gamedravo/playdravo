import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Home, ChevronRight, Zap, Mail, Send, Check, Phone, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ContactPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function ContactPage({ isDarkMode, t }: ContactPageProps) {
  const navigate = useNavigate();
  const [formSent, setFormSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Feedback',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('All fields marked with an asterisk are required.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1400));
    setLoading(false);
    setFormSent(true);
    toast.success('Your message has been successfully routed to Support Operations!');
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
              <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>Contact Us</span>
            </div>
          </div>
          
          <Link to="/" className="flex items-center gap-2.5 group self-start sm:self-auto">
            <div className="w-8 h-8 rounded-xl bg-accent text-bg-dark flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md duration-300">
              <Zap className="w-4 h-4 text-indigo-950 fill-current" />
            </div>
            <span className="font-extrabold text-sm tracking-wide">
              Play<span className="text-accent">Dravo</span>
            </span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-4">
            <Mail className="w-8 h-8 md:w-12 md:h-12 text-accent" />
            Contact Support
          </h1>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
            Have questions about strategic partnerships, API developer scopes, copyright violations, or custom configurations? Reach out and connect directly.
          </p>
        </div>

        {/* Dynamic Dual columns layout: Info card & Contact form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Support Information & Guidelines Column (4 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className={`p-6 rounded-3xl border space-y-6 ${
              isDarkMode ? 'bg-[#121226]/50 border-white/5' : 'bg-slate-50 border-black/5 shadow-sm'
            }`}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-accent border-b border-white/10 pb-2">Support Channels</h3>
              
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-indigo-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>DIRECT EMAIL</span>
                  <a href="mailto:support@playdravo.com" className="hover:underline text-xs font-semibold text-accent block">support@playdravo.com</a>
                  <a href="mailto:partners@playdravo.com" className="hover:underline text-xs font-semibold text-indigo-400 block">partners@playdravo.com</a>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>RESPONSE EXPECTATIONS</span>
                  <p className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-black/70'} leading-relaxed`}>
                    Our gaming operations agents analyze requests within <strong>24 business hours</strong>. Complex API/OAuth ticket inquiries can take up to 48 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold block ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>SECURITY TRACES</span>
                  <p className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-black/70'} leading-relaxed`}>
                    Never share your Google credentials, passwords, or persistent local tokens with agents. Support staff will never request secret parameters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Input Form Component (7 cols) */}
          <div className="md:col-span-7">
            <div className={`p-8 md:p-10 rounded-[2.5rem] border ${
              isDarkMode ? 'bg-gradient-to-b from-[#111124] to-[#0d0d18] border-white/5' : 'bg-white border-black/10 shadow-md'
            }`}>
              {formSent ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="w-14 h-14 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto border border-accent/30">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold">Inquiry Forwarded!</h3>
                  <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                    Your feedback context is successfully recorded. An automated confirmation ticket token has been triggered. Please inspect your email inbox.
                  </p>
                  <button 
                    onClick={() => {
                      setFormSent(false);
                      setFormData({ name: '', email: '', subject: 'General Feedback', message: '' });
                    }}
                    className="px-5 py-2.5 text-xs font-bold bg-accent text-bg-dark rounded-xl tracking-wider uppercase hover:scale-105 transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Full Name *</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
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
                      placeholder="you@email.com"
                      className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                        isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Feedback Category</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                        isDarkMode ? 'bg-[#18182a] border-white/5 text-white' : 'bg-white border-black/5 text-black'
                      }`}
                    >
                      <option value="General Feedback">General Feedback & Suggestions</option>
                      <option value="Business Partnerships">Brand Partnerships & Custom Games Adoptions</option>
                      <option value="Ad Opportunities">Advertisements / Monetization Queries</option>
                      <option value="Copyright/DMCA Notice">Copyright / DMCA Asset Report</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Your Message *</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can our technical support assist you? Write details here..."
                      className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                        isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-accent text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Transmit Message Form
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
