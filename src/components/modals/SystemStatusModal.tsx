import React from 'react';
import { motion } from 'motion/react';
import { X, Zap, Wrench, Rocket } from 'lucide-react';

interface SystemStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  t: (key: string) => string;
}

export function SystemStatusModal({ isOpen, onClose, isDarkMode, t }: SystemStatusModalProps) {
  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 transition-[visibility] duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      <motion.div 
        initial={false}
        animate={isOpen ? { opacity: 1, pointerEvents: 'auto' } : { opacity: 0, pointerEvents: 'none' }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className={`absolute inset-0 transition-all duration-500 backdrop-blur-xl ${isDarkMode ? 'bg-bg-dark/90' : 'bg-white/90'}`}
      />
      <motion.div
        initial={false}
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`relative w-full max-w-2xl border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] transition-all duration-500 ${isDarkMode ? 'bg-bg-dark border-white/10' : 'bg-white border-black/10'}`}
      >
        <div className={`p-8 border-b flex items-center justify-between shrink-0 transition-all ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]'}`}>
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20"
            >
              <Zap className="w-6 h-6 text-accent" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {(t('systemStatus') || 'System Status').split(' ')[0]} <span className="text-accent">{(t('systemStatus') || 'System Status').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>
                {t('networkDiagnostics') || 'NETWORK DIAGNOSTICS'} v2.4.0
              </p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: t('uptime') || 'Uptime', value: '99.99%', color: 'text-emerald-500' },
              { label: t('latency') || 'Latency', value: '24ms', color: 'text-accent' },
              { label: t('users') || 'Users', value: '12.4K', color: 'text-white' },
              { label: t('load') || 'Load', value: 'LOW', color: 'text-emerald-500' }
            ].map((stat, idx) => (
              <div key={`stat-${stat.label}-${idx}`} className={`p-4 border rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                <p className={`text-[10px] font-semibold tracking-wide mb-1 ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{stat.label}</p>
                <p className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[
              { name: 'Modding API', status: t('operational') || 'Operational', latency: '12ms', icon: <Wrench className="w-5 h-5" /> },
              { name: 'Game Delivery', status: t('operational') || 'Operational', latency: '8ms', icon: <Rocket className="w-5 h-5" /> }
            ].map((item, idx) => (
              <div key={`service-${item.name}-${idx}`} className={`flex items-center justify-between p-6 border rounded-3xl group transition-all ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-accent/30' : 'bg-black/5 border-black/5 hover:border-accent/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white/5 text-white/40 group-hover:text-accent' : 'bg-black/5 text-black/40 group-hover:text-accent'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold">{item.name}</p>
                    <p className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/20' : 'text-black/20'}`}>{t('latency') || 'LATENCY'}: {item.latency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold tracking-wide ${item.status === (t('operational') || 'Operational') ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {item.status}
                  </span>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === (t('operational') || 'Operational') ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
