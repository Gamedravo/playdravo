import React from 'react';
import { motion } from 'motion/react';
import { X, Bot, BrainCircuit, Terminal, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  t: (key: string) => string;
  aiChatMessages: {role: 'user' | 'model', text: string}[];
  setAIChatMessages: (messages: {role: 'user' | 'model', text: string}[]) => void;
  isAITyping: boolean;
  handleAIChat: (message: string) => void;
  generateChatSummary: () => void;
  isGeneratingChatSummary: boolean;
  chatSummary: string | null;
}

export function AIAssistant({
  isOpen,
  setIsOpen,
  isDarkMode,
  t,
  aiChatMessages,
  setAIChatMessages,
  isAITyping,
  handleAIChat,
  generateChatSummary,
  isGeneratingChatSummary,
  chatSummary
}: AIAssistantProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide">{t('aiAssistant')}</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            onClick={generateChatSummary}
            disabled={isGeneratingChatSummary}
            className={`group relative p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-accent' : 'hover:bg-black/10 text-black/40 hover:text-accent'}`}
          >
            <BrainCircuit className={`w-4 h-4 ${isGeneratingChatSummary ? 'animate-spin text-accent' : ''}`} />
            <span className={`absolute -bottom-10 left-1/2 -translate-x-1/2 border text-[8px] font-bold uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}>
              {t('summarizeChat')}
            </span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setAIChatMessages([]);
              toast.success(t('gameHistoryCleared'));
            }}
            className={`group relative p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-accent' : 'hover:bg-black/10 text-black/40 hover:text-accent'}`}
          >
            <RotateCcw className="w-4 h-4 transition-colors" />
            <span className={`absolute -bottom-10 left-1/2 -translate-x-1/2 border text-[8px] font-bold uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 ${isDarkMode ? 'bg-bg-dark border-white/10 text-white' : 'bg-white border-black/10 text-black'}`}>
              {t('clearHistory')}
            </span>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className={`group relative p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-red-500' : 'hover:bg-black/10 text-black/40 hover:text-red-500'}`}
          >
            <X className="w-5 h-5 transition-colors" />
            <span className={`absolute -bottom-10 left-1/2 -translate-x-1/2 border text-[8px] font-bold uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 ${isDarkMode ? 'bg-bg-dark border-white/10 text-white' : 'bg-white border-black/10 text-black'}`}>
              {t('back')}
            </span>
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide mb-4">
        {chatSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-accent/5 border border-accent/10 rounded-2xl mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{t('chatSummaryTitle')}</span>
            </div>
            <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-white/80' : 'text-black/80'}`}>{chatSummary}</p>
          </motion.div>
        )}
        {aiChatMessages.length === 0 && !chatSummary && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <Terminal className="w-12 h-12 text-accent" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] max-w-[200px]">
              {t('awaitingInput')}
            </p>
          </div>
        )}
        {aiChatMessages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={`chat-msg-${msg.role}-${i}-${msg.text.substring(0, 30)}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-accent text-bg-dark font-medium rounded-tr-sm shadow-sm' 
                : (isDarkMode ? 'bg-white/[0.03] text-white/90' : 'bg-black/[0.03] text-black/90')} rounded-tl-sm
            `}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isAITyping && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl rounded-tl-sm flex gap-1.5 ${isDarkMode ? 'bg-white/[0.03]' : 'bg-black/[0.03]'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const input = (e.target as any).message;
          handleAIChat(input.value);
          input.value = '';
        }}
        className="relative shrink-0"
      >
        <input 
          name="message"
          type="text" 
          placeholder={t('typeMessage')}
          className={`w-full ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-black'} border rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-accent/40 transition-colors pr-14 placeholder:opacity-50`}
          autoComplete="off"
        />
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="submit" 
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-accent text-bg-dark rounded-xl"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </form>
    </motion.div>
  );
}
