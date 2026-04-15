'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, ListTodo, ChevronRight,
  Clock, CheckCircle2, AlertCircle,
  Inbox, LogIn, Zap, Activity, Navigation, Bell
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';
import toast from 'react-hot-toast';

interface Complaint {
  _id: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: any;
  createdAt: string;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, token, t } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      const res = await fetch('/api/complaints/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setComplaints(data.data as Complaint[]);
    } catch {
      // fail silently on dashboard
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { 
    fetchComplaints();

    // ── Real-time Listeners ──────────────────────────────────────────
    const unsubStats = onEvent('stats_updated', () => {
      fetchComplaints();
    });

    const unsubCreated = onEvent('complaint_created', (complaint) => {
      toast.success(`Broadcasting: New ${complaint.category} issue reported nearby.`, {
        icon: '📢',
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
    });

    const unsubEscalated = onEvent('complaint_escalated', (complaint) => {
      toast.error(`Emergency Update: A grievance has been escalated in your zone.`, {
        icon: '🚨',
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      });
    });

    return () => {
      unsubStats();
      unsubCreated();
      unsubEscalated();
    };
  }, [fetchComplaints]);

  // Guard: not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <LogIn className="w-8 h-8 text-blue-400" />
        </div>
        <h2 suppressHydrationWarning className="text-2xl font-bold text-white mb-2">{t ? t('loginPrompt') : 'Login to Access Dashboard'}</h2>
        <p className="text-slate-500 mb-8 max-w-sm">
          {t ? t('loginDesc') : 'Sign in to view your personal grievance dashboard and track your complaints.'}
        </p>
        <button
          onClick={() => router.push('/login')}
          suppressHydrationWarning
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all"
        >
          {t ? t('login') : 'Sign In'}
        </button>
      </div>
    );
  }

  const pending   = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;
  const resolved  = complaints.filter(c => c.status?.toLowerCase() === 'resolved').length;
  const escalated = complaints.filter(c => c.status?.toLowerCase() === 'escalated').length;
  const total     = complaints.length;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-8 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Welcome Header ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">{t('liveIntelligence')}</p>
            <h1 className="text-3xl font-black text-white">{user.name}</h1>
            <p className="text-slate-500 mt-1 text-sm">{user.email} • Citizen Portal</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-1 h-full bg-blue-500/50" />
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Live Updates</p>
              <p className="text-sm font-black text-blue-400">{t('connected')}</p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ────────────────────────────────────────── */}
        {!isLoading && total > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            {[
              { label: t('total'),     count: total,     icon: Inbox,         color: 'text-blue-400',    bg: 'bg-blue-500/5',    border: 'border-blue-500/20' },
              { label: t('pending'),   count: pending,   icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/5',   border: 'border-amber-500/20' },
              { label: t('resolved'),  count: resolved,  icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
              { label: t('escalated'), count: escalated, icon: AlertCircle,   color: 'text-rose-400',    bg: 'bg-rose-500/5',    border: 'border-rose-500/20' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5 shadow-lg`}>
                  <Icon className={`w-4 h-4 ${s.color} mb-3`} />
                  <p className={`text-4xl font-black ${s.color}`}>{s.count}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ── Action Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {/* File Complaint */}
          <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => router.push('/user/complaints/new')}
            className="group col-span-1 p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 text-left relative overflow-hidden shadow-2xl shadow-blue-500/20"
          >
            <PlusCircle className="w-10 h-10 text-white mb-5 group-hover:rotate-90 transition-transform duration-500" />
            <h2 className="text-xl font-black text-white mb-1">{t('reportIssue')}</h2>
            <p className="text-blue-100/60 text-sm leading-relaxed mb-5">{t('aiBacked')}</p>
            <div className="inline-flex items-center gap-2 text-white text-sm font-bold bg-white/10 px-4 py-2 rounded-xl group-hover:bg-white/20 transition-all">
              {t('file')} <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Nearby Issues */}
          <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => router.push('/user/nearby')}
            className="group p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 text-left relative overflow-hidden shadow-lg"
          >
            <Navigation className="w-10 h-10 text-emerald-400 mb-5" />
            <h2 className="text-xl font-black text-white mb-1">{t('nearbyIssues')}</h2>
            <p className="text-slate-500 text-sm mb-5">Explore geo-tagged problems.</p>
            <div className="inline-flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-4 py-2 rounded-xl group-hover:bg-emerald-500/20 transition-all">
              View Map <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* My Complaints */}
          <motion.button
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={() => router.push('/user/complaints')}
            className="group p-8 rounded-[32px] bg-white/[0.03] border border-white/10 hover:border-blue-500/30 text-left relative overflow-hidden shadow-lg"
          >
            <ListTodo className="w-10 h-10 text-blue-400 mb-5" />
            <h2 className="text-xl font-black text-white mb-1">My Tracking</h2>
            <p className="text-slate-500 text-sm mb-5">View status history.</p>
            <div className="inline-flex items-center gap-2 text-blue-400 text-sm font-bold bg-blue-500/10 px-4 py-2 rounded-xl group-hover:bg-blue-500/20 transition-all">
              {t('trackAll')} <ChevronRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>

        {/* ── Recent Activity ───────────────────────────────────── */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          <h3 className="text-sm font-black text-white mb-8 flex items-center gap-2 uppercase tracking-widest">
            <Bell className="w-4 h-4 text-blue-500" />
            {t('liveActivity')}
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-14 h-14 text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-bold">{t('noActiveGrievances')}</p>
              <p className="text-slate-700 text-xs mt-1">
                Once you report an issue, it will be tracked live here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map((c, i) => {
                const statusKey = c.status?.toLowerCase();
                const statusColorsColor: Record<string, string> = {
                  pending:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  resolved:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  escalated: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
                };
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => router.push(`/user/complaints/${c._id}`)}
                    className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span 
                        suppressHydrationWarning
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${statusColorsColor[statusKey] || 'text-slate-400 bg-white/5'}`}
                      >
                        {c.status}
                      </span>
                      <p className="text-sm font-bold text-slate-300 truncate group-hover:text-white transition-colors">{c.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-blue-500 transition-colors ml-4" />
                  </motion.div>
                );
              })}
              {complaints.length > 5 && (
                <button
                  onClick={() => router.push('/user/complaints')}
                  className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 py-3 transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/20"
                >
                  {t ? t('viewFullHistory') : 'View full tracking feed'} ({complaints.length} issues)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
