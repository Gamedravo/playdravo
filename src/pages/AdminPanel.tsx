import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  Gamepad2, 
  Clock, 
  Mail, 
  ExternalLink, 
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Reply
} from 'lucide-react';
import { api } from '../lib/api';
import { BugReport, GameRequest, ContactMessage } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface AdminPanelProps {
  isDarkMode: boolean;
  t: (key: string) => string;
  type: 'bug-reports' | 'game-requests' | 'support-tickets';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isDarkMode, t, type }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'unread'>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data: any[] = [];
        if (type === 'bug-reports') data = await api.getBugReports();
        else if (type === 'game-requests') data = await api.getGameRequests();
        else data = await api.getContactMessages();
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [type]);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (type === 'bug-reports') await api.updateBugReport(id, { read: !currentStatus });
      else if (type === 'game-requests') await api.updateGameRequest(id, { read: !currentStatus });
      else await api.updateContactMessage(id, { read: !currentStatus });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: !currentStatus } : s));
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (type === 'bug-reports') await api.deleteBugReport(id);
      else if (type === 'game-requests') await api.deleteGameRequest(id);
      else await api.deleteContactMessage(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting submission:", error);
    }
  };

  let filteredSubmissions = submissions.filter(sub => 
    sub.gameName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === 'oldest') {
    filteredSubmissions = [...filteredSubmissions].reverse();
  } else if (sortBy === 'unread') {
    filteredSubmissions = [...filteredSubmissions].sort((a, b) => {
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    });
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Just now';
    try { return new Date(dateStr).toLocaleString(); } catch { return 'Just now'; }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-none mb-2">
                Admin <span className="text-accent">{type === 'bug-reports' ? 'Bug Reports' : type === 'game-requests' ? 'Game Requests' : 'Support Tickets'}</span>
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-[0.3em] ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>
                {submissions.length} Total Submissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link to="/admin/bug-reports" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${type === 'bug-reports' ? 'bg-accent text-bg-dark' : (isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10')}`}>Bug Reports</Link>
            <Link to="/admin/game-requests" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${type === 'game-requests' ? 'bg-accent text-bg-dark' : (isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10')}`}>Game Requests</Link>
            <Link to="/admin/support-tickets" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${type === 'support-tickets' ? 'bg-accent text-bg-dark' : (isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10')}`}>Support Tickets</Link>
            <Link to="/admin/oauth-setup" className={`px-6 py-3 rounded-xl text-[10px] font-semibold tracking-wide transition-all ${isDarkMode ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>OAuth Setup</Link>
          </div>
        </div>

        <div className={`mb-8 p-4 rounded-[2rem] border flex flex-col md:flex-row items-center gap-4 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-black/[0.02] border-black/5'}`}>
          <div className="flex-1 relative w-full">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
            <input type="text" placeholder="Search submissions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`w-full bg-transparent border-none outline-none pl-12 pr-4 py-2 text-sm font-medium ${isDarkMode ? 'text-white placeholder:text-white/20' : 'text-black placeholder:text-black/20'}`} />
          </div>
          <div className={`hidden md:block w-px h-6 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
          <button onClick={() => { if (sortBy === 'newest') setSortBy('oldest'); else if (sortBy === 'oldest') setSortBy('unread'); else setSortBy('newest'); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-white/20' : 'text-black/20'}`} />
            <span className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/60' : 'text-black/60'}`}>{sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Unread First'}</span>
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Loading...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className={`py-24 text-center rounded-[3rem] border-2 border-dashed ${isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-black/[0.01]'}`}>
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-accent/40" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-2">No Submissions Found</h3>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>Try adjusting your search or check back later.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map((sub, idx) => (
                <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }} className={`p-6 md:p-8 rounded-[2.5rem] border group transition-all duration-300 hover:border-accent/30 ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-black/[0.02] border-black/5 hover:bg-black/[0.04]'}`}>
                  <div className={`flex flex-col md:flex-row md:items-start justify-between gap-6 ${sub.read ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${type === 'bug-reports' ? 'bg-red-500/10 border-red-500/20' : type === 'game-requests' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-accent/10 border-accent/20'}`}>
                          {type === 'bug-reports' ? <Bug className="w-6 h-6 text-red-500" /> : type === 'game-requests' ? <Gamepad2 className="w-6 h-6 text-blue-500" /> : <Mail className="w-6 h-6 text-accent" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold group-hover:text-accent transition-colors">{type === 'support-tickets' ? sub.subject : sub.gameName}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-2">
                              <Clock className={`w-3 h-3 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                              <span className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{formatDate(sub.createdAt)}</span>
                            </div>
                            {sub.email && (
                              <div className="flex items-center gap-2">
                                <Mail className={`w-3 h-3 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} />
                                <span className={`text-[10px] font-semibold tracking-wide ${isDarkMode ? 'text-white/40' : 'text-black/40'}`}>{sub.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`p-6 rounded-2xl text-sm leading-relaxed font-medium ${isDarkMode ? 'bg-white/5 text-white/80' : 'bg-black/5 text-black/80'}`}>
                        {type === 'support-tickets' ? sub.message : (sub.description || 'No description provided.')}
                      </div>
                      {sub.link && (
                        <a href={sub.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent hover:underline text-xs font-bold">
                          <ExternalLink className="w-4 h-4" />View Game Source
                        </a>
                      )}
                    </div>
                    <div className="flex md:flex-col items-center gap-2">
                      <button onClick={() => toggleReadStatus(sub.id, !!sub.read)} title={sub.read ? "Mark as unread" : "Mark as read"} className={`p-3 rounded-xl transition-all ${sub.read ? 'bg-emerald-500/20 text-emerald-500' : (isDarkMode ? 'bg-white/5 hover:bg-emerald-500/20 text-white/40 hover:text-emerald-500' : 'bg-black/5 hover:bg-emerald-500/20 text-black/40 hover:text-emerald-500')}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      {sub.email && (
                        <a href={`mailto:${sub.email}?subject=Re: ${type === 'support-tickets' ? sub.subject : sub.gameName}`} title="Reply via Email" className={`p-3 rounded-xl transition-all flex items-center justify-center ${isDarkMode ? 'bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-500' : 'bg-black/5 hover:bg-blue-500/20 text-black/40 hover:text-blue-500'}`}>
                          <Reply className="w-5 h-5" />
                        </a>
                      )}
                      {deletingId === sub.id ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => handleDelete(sub.id)} className="p-2 text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
                          <button onClick={() => setDeletingId(null)} className={`p-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(sub.id)} title="Delete submission" className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500' : 'bg-black/5 hover:bg-red-500/20 text-black/40 hover:text-red-500'}`}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
