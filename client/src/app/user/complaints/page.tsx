'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, ChevronRight, MapPin, AlertCircle,
  CheckCircle2, TrendingUp, RefreshCcw, PlusCircle,
  Tag, LogIn, Inbox
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';

interface Complaint {
  _id: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: any;
  tags: string[];
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { style: string; icon: React.JSX.Element }> = {
  pending:   { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   icon: <Clock className="w-3 h-3" /> },
  resolved:  { style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  escalated: { style: 'bg-rose-500/10 text-rose-400 border-rose-500/20',      icon: <AlertCircle className="w-3 h-3" /> },
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-rose-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500',
};

export default function MyComplaintsPage() {
  const router = useRouter();
  const { user, token, t } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/complaints/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data as Complaint[]);
      } else {
        setError(data.error || 'Failed to fetch complaints');
      }
    } catch {
      setError('Cannot connect to backend. Please ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchComplaints();

    // ── Real-time auto-refresh ──────────────────────────────────
    const unsubStats = onEvent('stats_updated', () => {
      fetchComplaints();
    });
    const unsubUpdated = onEvent('complaint_updated', (updated) => {
      setComplaints(prev =>
        prev.map(c => c._id === updated._id ? updated : c)
      );
    });

    return () => {
      unsubStats();
      unsubUpdated();
    };
  }, [fetchComplaints]);

  // Prompt login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-blue-400" />
        </div>
        <h2 suppressHydrationWarning className="text-2xl font-bold text-white mb-2">{t ? t('loginPrompt') : 'Login Required'}</h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          {t ? t('loginDesc') : 'You must be logged in to view your complaints.'}
        </p>
        <button
          onClick={() => router.push('/login')}
          suppressHydrationWarning
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
        >
          {t ? t('login') : 'Go to Login'}
        </button>
      </div>
    );
  }

  const pending   = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;
  const resolved  = complaints.filter(c => c.status?.toLowerCase() === 'resolved').length;
  const escalated = complaints.filter(c => c.status?.toLowerCase() === 'escalated').length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">{t ? t('myComplaints') : 'My Complaints'}</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {t ? t('welcomeBack') : 'Welcome back'}, <span className="text-blue-400 font-semibold">{user.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchComplaints}
              suppressHydrationWarning
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCcw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/user/complaints/new')}
              suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              {t ? t('submitComplaint') : 'New Complaint'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!isLoading && complaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {[
              { label: t ? t('pending') : 'Pending',   count: pending,   color: 'text-amber-400',   bg: 'bg-amber-500/5',   border: 'border-amber-500/20' },
              { label: t ? t('resolved') : 'Resolved',  count: resolved,  color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
              { label: t ? t('escalated') : 'Escalated', count: escalated, color: 'text-rose-400',    bg: 'bg-rose-500/5',    border: 'border-rose-500/20' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Complaint List */}
        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-3xl bg-white/[0.03] border border-white/10 animate-pulse" />
            ))
          ) : complaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 rounded-3xl bg-white/[0.02] border-2 border-dashed border-white/10"
            >
              <Inbox className="w-14 h-14 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">No Complaints Yet</h3>
              <p className="text-slate-600 text-sm mb-8 max-w-sm mx-auto">
                You haven't filed any grievances. Submit your first complaint and track its resolution in real-time.
              </p>
              <button
                onClick={() => router.push('/user/complaints/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                File Your First Complaint
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {complaints.map((c, i) => {
                const statusKey = c.status?.toLowerCase() || 'pending';
                const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                const areaStr = typeof c.location === 'object' ? c.location?.area : c.location;
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => router.push(`/user/complaints/${c._id}`)}
                    className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.06] transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Left accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500 opacity-0 group-hover:opacity-100 rounded-l-2xl transition-opacity" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span 
                            suppressHydrationWarning
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${statusConfig.style}`}
                          >
                            {statusConfig.icon}
                            {c.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            {c.category}
                          </span>
                          {c.priority && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500">
                              <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[c.priority] || 'bg-slate-600'}`} />
                              {c.priority}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-blue-300 transition-colors mb-2">
                          {c.description}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                          {areaStr && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {areaStr}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {c.tags?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {c.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
