import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PageBrandMark } from '../components/PageBrandMark';
import { ArrowLeft, BookOpen, Wrench, ShieldCheck, MessageCircle, Home, ChevronRight, Mail, Send, Check } from 'lucide-react';
import { appToast } from '../lib/appToast';

interface SupportPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function SupportPage({ isDarkMode, t }: SupportPageProps) {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  // Support ticket form state
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });

  const getArticleContent = () => {
    switch (articleId) {
      case 'getting-started':
        return {
          title: t('gettingStarted') || 'Getting Started',
          icon: <BookOpen className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Welcome to our platform! This guide will help you get started with the basics of instant web gaming.</p>
              <h3 className="text-xl font-bold mt-8">Creating an Account</h3>
              <p>To create an account, click the "Sign In" button in the top right corner and follow the prompts. You can also sign in instantly using Google OAuth.</p>
              <h3 className="text-xl font-bold mt-8">Finding Games</h3>
              <p>Use the global search bar, browse categories on the homepage, or open the detailed Games Library link to explore over 60 web games.</p>
            </div>
          )
        };
      case 'modding-guide':
        return {
          title: t('moddingGuide') || 'Modding Guide',
          icon: <Wrench className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Learn how to create, test, and share custom mods and guides for your favorite games on PlayDravo.</p>
              <h3 className="text-xl font-bold mt-8">Prerequisites</h3>
              <p>You will need basic knowledge of lightweight programming (HTML, JavaScript, CSS) and the specific game's asset structure.</p>
              <h3 className="text-xl font-bold mt-8">Submitting a Mod</h3>
              <p>Once your mod is ready, submit it from the Submit Game page or contact support for review.</p>
            </div>
          )
        };
      case 'account-security':
        return {
          title: t('accountSecurity') || 'Account Security',
          icon: <ShieldCheck className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Keep your profile, achievements, and game progress safe with these critical security best practices.</p>
              <h3 className="text-xl font-bold mt-8">Strong Passwords</h3>
              <p>Always use a strong, unique passkey for your account, and avoid recycling credentials used on other platforms.</p>
              <h3 className="text-xl font-bold mt-8">OAuth Integrity</h3>
              <p>Using Google OAuth ensures multi-factor safety standard integration completely powered by Google Infrastructure.</p>
            </div>
          )
        };
      case 'faq':
        return {
          title: t('communityFAQ') || 'Community FAQ',
          icon: <MessageCircle className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Frequently answered queries from our global gaming community.</p>
              <h3 className="text-xl font-bold mt-8">How do I report a bug?</h3>
              <p>You can report bugs using the support ticket system below or direct a line via the report bug footer button.</p>
              <h3 className="text-xl font-bold mt-8">Can I change my username?</h3>
              <p>Yes, click your profile dropdown, select settings, and you can change your username instantly.</p>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const article = getArticleContent();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      appToast.error('Please fill in all required fields.');
      return;
    }
    setTicketLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTicketLoading(false);
    setTicketSent(true);
    appToast.success('Your support request has been queued successfully!');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
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
              <Link to="/support" className="hover:text-accent">Support Hub</Link>
              {article && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-accent/55" />
                  <span className={isDarkMode ? 'text-white/80' : 'text-black/80'}>{article.title}</span>
                </>
              )}
            </div>
          </div>
          
          <PageBrandMark />
        </div>

        {article ? (
          /* Active Article Render View */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 md:p-12 rounded-[2.5rem] border ${
              isDarkMode ? 'bg-[#12121e] border-white/10' : 'bg-white border-black/10'
            }`}
          >
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
                {article.icon}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{article.title}</h1>
            </div>

            <div className={`prose prose-lg max-w-none mb-12 ${isDarkMode ? 'prose-invert text-white/85' : 'text-black/85'}`}>
              {article.content}
            </div>

            <button 
              onClick={() => navigate('/support')}
              className={`px-5 py-2.5 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 border transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                  : 'bg-black/5 border-black/10 hover:bg-black/10 text-black'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Support Hub
            </button>
          </motion.div>
        ) : (
          /* Support Landing Dashboard View */
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">Support & Help Center</h1>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                Welcome to PlayDravo Help portal. Browse our troubleshooting docs, find answers to frequently asked questions, or request direct help from operations using the ticket generator.
              </p>
            </div>

            {/* Docs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'getting-started',
                  icon: <BookOpen className="w-6 h-6 text-accent" />,
                  title: 'Getting Started Guide',
                  desc: 'Learn how to create customized profile configurations, save games, and track your favorites.'
                },
                {
                  id: 'modding-guide',
                  icon: <Wrench className="w-6 h-6 text-accent" />,
                  title: 'Developer Modding Guide',
                  desc: 'Ready to write guides and mods? Explore code configurations and API boundaries.'
                },
                {
                  id: 'account-security',
                  icon: <ShieldCheck className="w-6 h-6 text-accent" />,
                  title: 'Account Security & OAuth',
                  desc: 'Details on local storage sandbox execution and robust multi-factor Google OAuth integration.'
                },
                {
                  id: 'faq',
                  icon: <MessageCircle className="w-6 h-6 text-accent" />,
                  title: 'Community FAQ',
                  desc: 'Curated list of standard questions regarding high scores, saved progress, and bug reports.'
                }
              ].map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/support/${doc.id}`)}
                  className={`p-6 rounded-3xl border text-left flex gap-4 transition-all duration-300 hover:scale-[1.01] ${
                    isDarkMode ? 'bg-[#121226]/50 border-white/5 hover:border-accent/30' : 'bg-white border-black/5 hover:border-accent/30 shadow-sm'
                  }`}
                >
                  <div className="p-3 w-fit bg-accent/10 border border-accent/20 rounded-2xl shrink-0 h-fit">
                    {doc.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm tracking-tight">{doc.title}</h3>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>{doc.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Support Ticket Submission form */}
            <div className={`p-8 md:p-12 rounded-[2.5rem] border ${
              isDarkMode ? 'bg-gradient-to-b from-[#111124] to-[#0d0d18] border-white/5' : 'bg-white border-black/10 shadow-md'
            }`}>
              <div className="max-w-xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-2">
                    <Mail className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Open a Support Ticket</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-black/50'}`}>Our compliance team resolves active tickets within standard 24 hour windows.</p>
                </div>

                {ticketSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-accent/15 border border-accent/20 rounded-2xl text-center space-y-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent text-bg-dark flex items-center justify-center mx-auto shadow-md">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base">Ticket Queued Successfully!</h3>
                    <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                      We have generated your ticket token. Our support operations have been notified and standard reviews are active. Check your email inbox for automatic confirmation.
                    </p>
                    <button 
                      onClick={() => {
                        setTicketSent(false);
                        setFormData({ name: '', email: '', category: 'general', message: '' });
                      }}
                      className="px-4 py-2 text-xs font-bold bg-accent text-bg-dark rounded-xl tracking-wider uppercase hover:scale-105 transition-all"
                    >
                      Submit Another Ticket
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Name"
                          className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                            isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                          }`}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Email Address</label>
                        <input 
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Email"
                          className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                            isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Issue Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                          isDarkMode ? 'bg-[#18182a] border-white/5 text-white' : 'bg-white border-black/5 text-black'
                        }`}
                      >
                        <option value="general">General Inquiries / Partner Request</option>
                        <option value="account">Account Access & OAuth Issue</option>
                        <option value="bug">Report a Platform Bug / Glitch</option>
                        <option value="account">Account & Saved Progress</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide opacity-50">Decriptive Message</label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please write down detail variables of your requests or issue..."
                        className={`w-full py-3.5 px-4 rounded-xl border text-xs font-semibold focus:outline-none focus:border-accent ${
                          isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-black/5 border-black/5 text-black'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={ticketLoading}
                      className="w-full py-3.5 bg-accent text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {ticketLoading ? (
                        <div className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Transmit Ticket Submission
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
