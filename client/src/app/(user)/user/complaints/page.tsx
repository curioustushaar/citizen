'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronRight, MapPin, AlertCircle,
  CheckCircle2, TrendingUp, RefreshCcw, PlusCircle,
  Tag, Inbox
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';

interface Complaint {
  _id: string;
  complaintId?: string;
  title?: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: any;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  slaDeadline?: string;
}

const STATUS_CONFIG: Record<string, { style: string; icon: React.JSX.Element }> = {
  submitted: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  pending: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  'under review': { style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: <Clock className="w-3 h-3" /> },
  assigned: { style: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Clock className="w-3 h-3" /> },
  'in progress': { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  reopened: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: <Clock className="w-3 h-3" /> },
  resolved: { style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  'citizen verified': { style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { style: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: <CheckCircle2 className="w-3 h-3" /> },
  escalated: { style: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <AlertCircle className="w-3 h-3" /> },
  rejected: { style: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: <AlertCircle className="w-3 h-3" /> },
};

const PRIORITY_DOT: Record<string, string> = {
  HIGH: 'bg-rose-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500',
};

export default function MyComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, t, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort') || 'newest');

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setComplaints([]);

    try {
      const res = await fetch('/api/citizen/complaints', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data as Complaint[]);
      } else {
        if (res.status === 401 && !token) {
          setError('Not authenticated. Please sign in again.');
        } else {
          setError(data.error || 'Failed to fetch complaints');
        }
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

  const statusFilter = (searchParams.get('status') || 'all').toLowerCase();
  const priorityFilter = (searchParams.get('priority') || '').toLowerCase();

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setSortOrder(searchParams.get('sort') || 'newest');
  }, [searchParams]);

  const updateQuery = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const queryString = params.toString();
    router.replace(`/citizen/complaints${queryString ? `?${queryString}` : ''}`);
  }, [router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateQuery({ q: searchTerm || null });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, updateQuery]);

  const isResolvedStatus = (status: string) =>
    ['resolved', 'closed', 'citizen verified'].includes(status?.toLowerCase());
  const isActiveStatus = (status: string) => !isResolvedStatus(status);
  const isOverdue = (complaint: Complaint) => {
    if (!complaint.slaDeadline) return false;
    const deadline = new Date(complaint.slaDeadline).getTime();
    return deadline < Date.now() && isActiveStatus(complaint.status);
  };

  const filteredComplaints = useMemo(() => {
    let list = [...complaints];

    if (statusFilter === 'active') {
      list = list.filter((c) => isActiveStatus(c.status));
    } else if (statusFilter === 'resolved') {
      list = list.filter((c) => isResolvedStatus(c.status));
    } else if (statusFilter === 'overdue') {
      list = list.filter((c) => isOverdue(c));
    }

    if (priorityFilter === 'high') {
      list = list.filter((c) => c.priority?.toLowerCase() === 'high');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((c) =>
        [c.title, c.description, c.category, c.complaintId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === 'sla') {
      list.sort((a, b) => {
        const aDeadline = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const aOverdue = isOverdue(a);
        const bOverdue = isOverdue(b);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        return aDeadline - bDeadline;
      });
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if (priorityFilter === 'high' && sortOrder !== 'sla') {
      list.sort((a, b) => {
        const aDeadline = a.slaDeadline ? new Date(a.slaDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.slaDeadline ? new Date(b.slaDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const aOverdue = isOverdue(a);
        const bOverdue = isOverdue(b);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        return aDeadline - bDeadline;
      });
    }

    return list;
  }, [complaints, statusFilter, priorityFilter, searchTerm, sortOrder]);

  const pending = complaints.filter(c => c.status?.toLowerCase() === 'pending').length;
  const resolved = complaints.filter(c => c.status?.toLowerCase() === 'resolved').length;
  const escalated = complaints.filter(c => c.status?.toLowerCase() === 'escalated').length;

  const formatSla = (complaint: Complaint) => {
    if (!complaint.slaDeadline) return 'SLA unavailable';
    const deadline = new Date(complaint.slaDeadline).getTime();
    const diff = deadline - Date.now();
    const hours = Math.abs(diff) / (1000 * 60 * 60);
    if (diff < 0) return `Overdue by ${Math.ceil(hours)}h`;
    if (hours < 1) return `${Math.ceil(hours * 60)}m left`;
    return `${Math.ceil(hours)}h left`;
  };

  const timelineHint = (status: string) => {
    const step = status?.toLowerCase();
    if (step === 'resolved') return 'Timeline: Submitted → Assigned → In Progress → Resolved';
    if (step === 'assigned') return 'Timeline: Submitted → Assigned → In Progress';
    if (step === 'in progress') return 'Timeline: Submitted → Assigned → In Progress';
    return 'Timeline: Submitted → Assigned → In Progress';
  };

  const emptyMessage = statusFilter === 'active'
    ? 'No active complaints'
    : statusFilter === 'overdue'
    ? 'No overdue complaints'
    : priorityFilter === 'high'
    ? 'No high priority issues'
    : 'No complaints yet';

  const getNearbyStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'escalated': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black dark:text-white text-slate-900">{t ? t('myComplaints') : 'My Complaints'}</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              {t ? t('welcomeBack') : 'Welcome back'}, <span className="text-primary-600 dark:text-primary-400 font-bold">{user?.name || 'Guest'}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchComplaints}
              suppressHydrationWarning
              className="p-3 rounded-2xl dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 hover:bg-white transition-all shadow-sm group"
              title="Refresh"
            >
              <RefreshCcw className={`w-5 h-5 text-slate-500 group-hover:text-primary-500 transition-colors ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/citizen/complaints/new')}
              suppressHydrationWarning
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              {t ? t('submitComplaint') : 'New Complaint'}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!isLoading && complaints.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-10"
          >
            {[
              { label: t ? t('pending') : 'Pending',   count: pending,   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
              { label: t ? t('resolved') : 'Resolved',  count: resolved,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { label: t ? t('escalated') : 'Escalated', count: escalated, color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
            ].map(s => (
              <div key={s.label} className="glass-card p-5 text-center shadow-lg border-2 dark:border-white/5 border-slate-100">
                <p className={`text-3xl font-black ${s.color} tabular-nums`}>{s.count}</p>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest font-black">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Filters + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => updateQuery({ status: tab.key === 'all' ? null : tab.key })}
                className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${statusFilter === tab.key ? 'bg-primary-500/10 text-primary-600 border-primary-500/30' : 'bg-transparent text-slate-500 border-slate-200 dark:border-white/10'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex flex-1 flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search complaints"
              className="w-full sm:max-w-xs px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent text-sm font-medium"
            />
            <select
              value={sortOrder}
              onChange={(event) => {
                const value = event.target.value;
                setSortOrder(value);
                updateQuery({ sort: value === 'newest' ? null : value });
              }}
              className="px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-transparent text-xs font-black uppercase tracking-widest"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="sla">SLA Soonest</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Complaint List */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-[2.5rem] dark:bg-white/[0.03] bg-slate-100 border dark:border-white/10 border-slate-200 animate-pulse" />
            ))
          ) : filteredComplaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 rounded-[3rem] dark:bg-white/[0.02] bg-slate-50/50 border-2 border-dashed dark:border-white/10 border-slate-200 px-6"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-black dark:text-slate-400 text-slate-900 mb-3">{emptyMessage}</h3>
              <p className="text-slate-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed font-medium">
                You haven't filed any grievances. Submit your first complaint and track its resolution in real-time.
              </p>
              <button
                onClick={() => router.push('/citizen/complaints/new')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-primary-500/20 active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                File Your First Complaint
              </button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredComplaints.map((c, i) => {
                const statusKey = c.status?.toLowerCase() || 'pending';
                const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                const areaStr = typeof c.location === 'object' ? c.location?.area : c.location;
                
                // Enhance status styles for light mode visibility
                const statusBetterStyle = statusKey === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' :
                                         statusKey === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' :
                                         'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400';

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => router.push(`/citizen/complaints/${c.complaintId || c._id}`)}
                    className="group relative p-6 md:p-8 rounded-[2.5rem] glass-card hover:border-primary-500/30 hover:bg-white dark:hover:bg-white/[0.06] transition-all cursor-pointer overflow-hidden shadow-lg border-2"
                  >
                    {/* Left accent */}
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-primary-500 opacity-0 group-hover:opacity-100 rounded-r-full transition-all" />

                    <div className="flex items-start justify-between gap-6 relative z-10">
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span 
                            suppressHydrationWarning
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-sm ${statusBetterStyle}`}
                          >
                            {config.icon}
                            {c.status}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl dark:bg-white/5 bg-slate-100 border dark:border-white/10 border-slate-200 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {c.category}
                          </span>
                          {c.priority && (
                            <span className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest ml-1">
                              <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${PRIORITY_DOT[c.priority] || 'bg-slate-600'}`} />
                              {c.priority}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="dark:text-white text-slate-900 text-lg font-bold line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-white transition-colors mb-3 leading-tight">
                          {c.title || c.description}
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-5 text-[11px] dark:text-slate-500 text-slate-400 font-medium">
                          {areaStr && (
                            <span className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-rose-500/70" /> {areaStr}
                            </span>
                          )}
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary-500/70" />
                            {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500/70" />
                            {formatSla(c)}
                          </span>
                          {c.tags?.length > 0 && (
                            <span className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-emerald-500/70" />
                              {c.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                            </span>
                          )}
                        </div>
                        {(statusFilter === 'active' || statusFilter === 'overdue') && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
                            {timelineHint(c.status)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {statusFilter === 'overdue' && (
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              router.push(`/citizen/complaints/${c.complaintId || c._id}`);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-600 transition-all"
                          >
                            Escalate
                          </button>
                        )}
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-md mt-1 flex-shrink-0">
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>
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
