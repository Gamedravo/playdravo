import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Wrench, ShieldCheck, MessageCircle } from 'lucide-react';

interface SupportPageProps {
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function SupportPage({ isDarkMode, t }: SupportPageProps) {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();

  const getArticleContent = () => {
    switch (articleId) {
      case 'getting-started':
        return {
          title: t('gettingStarted'),
          icon: <BookOpen className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Welcome to our platform! This guide will help you get started with the basics.</p>
              <h3 className="text-xl font-bold mt-8">Creating an Account</h3>
              <p>To create an account, click the "Sign In" button in the top right corner and follow the prompts.</p>
              <h3 className="text-xl font-bold mt-8">Finding Games</h3>
              <p>Use the search bar or browse categories to find games you want to play.</p>
            </div>
          )
        };
      case 'modding-guide':
        return {
          title: t('moddingGuide'),
          icon: <Wrench className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Learn how to create and share mods for your favorite games.</p>
              <h3 className="text-xl font-bold mt-8">Prerequisites</h3>
              <p>You will need basic knowledge of programming and the specific game's modding tools.</p>
              <h3 className="text-xl font-bold mt-8">Submitting a Mod</h3>
              <p>Once your mod is ready, you can submit it through the developer portal.</p>
            </div>
          )
        };
      case 'account-security':
        return {
          title: t('accountSecurity'),
          icon: <ShieldCheck className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Keep your account safe with these security best practices.</p>
              <h3 className="text-xl font-bold mt-8">Strong Passwords</h3>
              <p>Always use a strong, unique password for your account.</p>
              <h3 className="text-xl font-bold mt-8">Two-Factor Authentication</h3>
              <p>Enable 2FA in your account settings for an extra layer of security.</p>
            </div>
          )
        };
      case 'faq':
        return {
          title: t('communityFAQ'),
          icon: <MessageCircle className="w-8 h-8 text-accent" />,
          content: (
            <div className="space-y-6">
              <p>Frequently asked questions from our community.</p>
              <h3 className="text-xl font-bold mt-8">How do I report a bug?</h3>
              <p>You can report bugs using the support ticket system or the bug report form.</p>
              <h3 className="text-xl font-bold mt-8">Can I change my username?</h3>
              <p>Yes, you can change your username in your profile settings.</p>
            </div>
          )
        };
      default:
        return {
          title: 'Support Center',
          icon: <BookOpen className="w-8 h-8 text-accent" />,
          content: <p>Select an article to read.</p>
        };
    }
  };

  const article = getArticleContent();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button 
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-xl transition-all ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 md:p-12 rounded-[2.5rem] border ${
            isDarkMode ? 'bg-[#12121e] border-white/10' : 'bg-white border-black/10'
          }`}
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
              {article.icon}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{article.title}</h1>
          </div>

          <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
            {article.content}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
