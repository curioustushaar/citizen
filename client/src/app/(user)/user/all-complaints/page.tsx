"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, MapPin, AlertCircle, Clock, ChevronRight,
  Search, Filter, Inbox, ArrowLeft, ArrowUpRight, CheckCircle2,
  TrendingUp, ShieldAlert, Zap
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Complaint {
  _id: string;
  complaintId?: string;
  title?: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  location: any;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

const STATUS_CONFIG: Record<string, { style: string; icon: any }> = {
  submitted: { style: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  pending: { style: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  'in progress': { style: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: TrendingUp },
  resolved: { style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
  escalated: { style: 'bg-rose-500/10 text-rose-500 border-rose-500/20', icon: ShieldAlert },
};

export default function AllComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, t } = useAuth();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const statusFilter = searchParams.get('status') || 'all';
  const priorityFilter = searchParams.get('priority') || 'all';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/complaints', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (data.success) {
          setComplaints(data.data);
        } else {
          setError(data.error || 'Intelligence Feed Offline');
        }
      } catch {
        setError('Transmission Error: Check Connection');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = (c.title || c.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.complaintId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && !['resolved', 'closed'].includes(c.status.toLowerCase())) ||
                           (statusFilter === 'overdue' && c.status.toLowerCase() === 'overdue') || // Logic for overdue should ideally be here too
                           c.status.toLowerCase() === statusFilter.toLowerCase();
      
      const matchesPriority = priorityFilter === 'all' || c.priority.toLowerCase() === priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* --- Header --- */}
        <section className="mb-12">
           <button 
             onClick={() => router.push('/user/dashboard')}
             className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors mb-6 font-bold text-xs uppercase tracking-widest group"
           >
             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Intelligence
           </button>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary-500" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Forensic Records</p>
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none">All Grievances<span className="text-primary-600">.</span></h1>
                <p className="text-slate-500 mt-2 font-medium">Tracking {filteredComplaints.length} active intelligence streams</p>
              </motion.div>
              
              <div className="flex flex-wrap items-center gap-3">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search Forensic ID or Content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-11 pr-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-xl shadow-primary-500/5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm font-medium w-full md:w-80"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* --- Stats Summary --- */}
        {!loading && complaints.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
             {[
               { label: 'Total Logs', count: complaints.length, color: 'text-slate-500', bg: 'bg-slate-500/5' },
               { label: 'Active Issues', count: complaints.filter(c => !['resolved', 'closed'].includes(c.status.toLowerCase())).length, color: 'text-blue-500', bg: 'bg-blue-500/5' },
               { label: 'High Priority', count: complaints.filter(c => c.priority === 'HIGH').length, color: 'text-rose-500', bg: 'bg-rose-500/5' },
               { label: 'Resolved Rate', count: `${Math.round((complaints.filter(c => ['resolved', 'closed'].includes(c.status.toLowerCase())).length / complaints.length) * 100)}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
             ].map(s => (
               <div key={s.label} className="p-4 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 text-center shadow-lg">
                  <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
               </div>
             ))}
          </div>
        )}

        {/* --- List Body --- */}
        <div className="min-h-[500px]">
          {loading ? (
             <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-3xl dark:bg-white/5 bg-slate-100 animate-pulse" />)}
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-rose-500/5 rounded-[3rem] border-2 border-dashed border-rose-500/20">
               <ShieldAlert className="w-12 h-12 text-rose-500 mb-4" />
               <h3 className="text-xl font-black text-rose-500">{error}</h3>
               <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs uppercase tracking-widest">Retry Feed</button>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed dark:border-white/5 border-slate-200">
               <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-8 shadow-inner">
                  <Inbox className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Null Stream</h3>
               <p className="text-slate-500 font-medium text-sm">No forensic logs matching current filters found.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredComplaints.map((c, i) => {
                  const statusKey = c.status.toLowerCase();
                  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                  const Icon = config.icon;
                  const locationStr = typeof c.location === 'object' ? (c.location.area || c.location.city) : c.location;

                  return (
                    <motion.div
                      key={c._id}
                      variants={itemVariants}
                      layout
                      onClick={() => router.push(`/user/complaints/${c._id}`)}
                      className="group relative p-6 md:p-8 rounded-[2.5rem] glass-card border-2 dark:border-white/5 border-slate-100 hover:border-primary-500/30 transition-all cursor-pointer shadow-xl"
                    >
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-primary-500 opacity-0 group-hover:opacity-100 rounded-r-full transition-all" />
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-xl ${config.style} border`}>
                                <Icon className="w-4 h-4" />
                             </div>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${config.style.split(' ')[1]}`}>
                                {c.status}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-slate-300" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {c.category}
                             </span>
                             {c.priority === 'HIGH' && (
                               <div className="flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Urgent</span>
                               </div>
                             )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-primary-600 transition-colors">
                                {c.title || c.description}
                             </h3>
                             <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-slate-800 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                          </div>

                          <div className="flex flex-wrap items-center gap-6 text-[11px] font-semibold text-slate-400">
                             <span className="flex items-center gap-2">
                                <span className="text-[9px] uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md font-black">{c.complaintId || c._id.slice(-8)}</span>
                             </span>
                             <span className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-rose-500/70" /> {locationStr}
                             </span>
                             <span className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-primary-500/70" /> {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                             </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border dark:border-white/10 border-slate-100 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-md mt-1">
                              <ChevronRight className="w-6 h-6" />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
