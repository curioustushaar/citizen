'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, ChevronRight,
  Clock, CheckCircle2, AlertCircle,
  Inbox, Activity, Navigation, Bell, Flame, ShieldAlert, MapPin,
  TrendingUp, ArrowUpRight, Zap, RefreshCcw
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';
import toast from 'react-hot-toast';

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
  updatedAt?: string;
  slaDeadline?: string;
  feedback?: { response?: string };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
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

export default function CitizenDashboard() {
  const router = useRouter();
  const { user, token, t } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/complaints', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data as Complaint[]);
      }
    } catch {
      // fail silently
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { 
    fetchComplaints();

    const unsubStats = onEvent('stats_updated', () => fetchComplaints());
    const unsubCreated = onEvent('complaint_created', (complaint) => {
      toast.success(`Nearby Intelligence: New ${complaint.category} report detected.`, {
        icon: '📡',
        style: { borderRadius: '1rem', background: '#0f172a', color: '#fff', border: '1px solid #1e293b' }
      });
    });

    return () => {
      unsubStats();
      unsubCreated();
    };
  }, [fetchComplaints]);

  const now = Date.now();
  const isResolvedStatus = (status: string) =>
    ['resolved', 'closed', 'citizen verified'].includes(status?.toLowerCase());
  const isActiveStatus = (status: string) => !isResolvedStatus(status);
  const getDeadline = (complaint: Complaint) =>
    complaint.slaDeadline ? new Date(complaint.slaDeadline).getTime() : null;

  const activeComplaints = complaints.filter(c => isActiveStatus(c.status));
  const resolvedComplaints = complaints.filter(c => isResolvedStatus(c.status));
  const highPriority = complaints.filter(c => c.priority?.toLowerCase() === 'high');
  const overdue = complaints.filter((c) => {
    const deadline = getDeadline(c);
    return deadline ? deadline < now && isActiveStatus(c.status) : false;
  });

  const unverifiedResolved = complaints.find(
    (c) => c.status?.toLowerCase() === 'resolved' && !c.feedback?.response
  );

  const formatSla = (complaint: Complaint) => {
    const deadline = getDeadline(complaint);
    if (!deadline) return 'SLA Standard';
    const diff = deadline - now;
    const hours = Math.abs(diff) / (1000 * 60 * 60);
    if (diff < 0) return `Overdue ${Math.ceil(hours)}h`;
    return `${Math.ceil(hours)}h remaining`;
  };

  const activityItems = complaints
    .slice(0, 4)
    .map((c) => {
      const status = c.status?.toLowerCase();
      return {
        id: c._id,
        icon: status === 'resolved' ? CheckCircle2 : status === 'escalated' ? ShieldAlert : Clock,
        message: status === 'resolved' ? `Issue ${c.complaintId || c._id.slice(-6)} Successfully Resolved` : 
                status === 'escalated' ? `Critical: Complaint ${c.complaintId || c._id.slice(-6)} Escalated` :
                `Complaint ${c.complaintId || c._id.slice(-6)} status updated to ${c.status}`,
        time: new Date(c.updatedAt || c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: status === 'resolved' ? 'text-emerald-500' : status === 'escalated' ? 'text-rose-500' : 'text-blue-500',
        bg: status === 'resolved' ? 'bg-emerald-500/10' : status === 'escalated' ? 'bg-rose-500/10' : 'bg-blue-500/10'
      };
    });

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">

        {/* --- Header & Summary --- */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Live Command Center</p>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {user?.name?.split(' ')[0] || 'Citizen'}<span className="text-primary-600">.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">Real-time governance dashboard</p>
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network Status</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="flex gap-0.5">
                     {[1,2,3,4].map(i => <div key={i} className={`h-3 w-1 rounded-full ${i <= 3 ? 'bg-emerald-500' : 'bg-slate-700/30'}`} />)}
                   </div>
                   <span className="text-xs font-bold text-emerald-500">OPTIMAL</span>
                </div>
              </div>
              <button 
                onClick={fetchComplaints}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-primary-500/10 transition-all active:scale-90 group"
              >
                <RefreshCcw className={`w-5 h-5 text-slate-500 group-hover:text-primary-500 transition-colors ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </motion.div>
          </div>
        </section>

        {/* --- Primary Stats Grid --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
        >
          {[
            { label: 'Active Issues', count: activeComplaints.length, icon: Inbox, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { label: 'High Priority', count: highPriority.length, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { label: 'SLA Overdue', count: overdue.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
            { label: 'Resolved', count: resolvedComplaints.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div 
                key={s.label}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-card p-6 border-2 ${s.border} relative overflow-hidden group`}
              >
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${s.bg} rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="flex items-start justify-between mb-4">
                   <div className={`p-3 rounded-2xl ${s.bg}`}>
                     <Icon className={`w-6 h-6 ${s.color}`} />
                   </div>
                   <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 translate-x-1" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-1 tabular-nums">{s.count}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* --- Main Dashboard Body --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left: Quick Actions & Intelligence */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/user/complaints/new')}
                className="relative h-48 rounded-[2.5rem] bg-primary-600 p-8 text-left overflow-hidden shadow-2xl shadow-primary-500/20 group border border-white/10"
              >
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <PlusCircle className="w-6 h-6 text-white" />
                </div>
                <div className="mt-auto">
                   <h2 className="text-2xl font-black text-white mb-2 leading-none">{t('reportIssue')}</h2>
                   <p className="text-primary-100/70 text-sm font-medium">Capture & route nearby anomalies</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest bg-white/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md transition-colors group-hover:bg-white/30">
                   {t('file')} <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/user/all-complaints')}
                className="relative h-48 rounded-[2.5rem] glass-card p-8 text-left overflow-hidden shadow-xl group border-2 dark:border-white/5 border-slate-100"
              >
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl" />
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                   <Navigation className="w-6 h-6 text-primary-500" />
                </div>
                <div className="mt-auto">
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-none">Intelligence</h2>
                   <p className="text-slate-500 text-sm font-medium">Track resolution forensics</p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest bg-primary-500/10 w-fit px-4 py-2 rounded-xl transition-colors group-hover:bg-primary-500/20 border border-primary-500/20">
                   EXPLORE MAP <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            </div>

            {/* Smart Alerts */}
            <AnimatePresence mode="popLayout">
              {unverifiedResolved || overdue.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-8 border-2 border-rose-500/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                       <ShieldAlert className="w-6 h-6 text-rose-500" />
                    </div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Priority Intervention Required</span>
                  </div>
                  
                  {overdue.length > 0 ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                         <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                           {overdue.length} Intelligence Breach(es)
                         </p>
                         <p className="text-slate-500 text-sm font-medium">SLA deadlines exceeded. Urgent escalation triggered for #{overdue[0].complaintId || overdue[0]._id.slice(-6)}.</p>
                       </div>
                       <button 
                         onClick={() => router.push('/user/all-complaints?status=overdue')}
                         className="px-8 py-3.5 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center gap-2"
                       >
                         Escalate <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                         <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">Impact Verification</p>
                         <p className="text-slate-500 text-sm font-medium">Department reports resolution on #{unverifiedResolved?.complaintId || unverifiedResolved?._id.slice(-6)}. Confirm closure.</p>
                       </div>
                       <button 
                         onClick={() => unverifiedResolved && router.push(`/user/complaints/${unverifiedResolved._id}`)}
                         className="px-8 py-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center gap-2"
                       >
                         Verify Now <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-white/5 text-center"
                >
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Zone Secure • All systems operational</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Activity Mini-Feed */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary-500" />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Activity Forensic</h3>
                </div>
                <button onClick={() => router.push('/user/all-complaints')} className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline">Full Report</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {activityItems.length > 0 ? activityItems.map(item => {
                   const Icon = item.icon;
                   return (
                     <motion.div 
                       key={item.id}
                       whileHover={{ x: 5 }}
                       className="p-5 rounded-3xl bg-white dark:bg-slate-900/50 border dark:border-white/5 border-slate-100 flex items-center gap-4 transition-all"
                     >
                        <div className={`p-3 rounded-2xl ${item.bg} flex-shrink-0`}>
                           <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{item.message}</p>
                           <p className="text-[10px] font-medium text-slate-400">{item.time}</p>
                        </div>
                     </motion.div>
                   );
                 }) : (
                   <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 dark:bg-white/5 rounded-[2rem]">
                      Awaiting Data Stream...
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Right Space: Insights & Profile Radar */}
          <div className="space-y-8">
            <div className="glass-card p-8 border dark:border-white/5 border-slate-100 h-fit">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">GIS Snapshot</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Ward</p>
                     <p className="text-base font-black text-slate-900 dark:text-white">
                        {complaints[0]?.location?.area || 'Sector High Detection'}
                     </p>
                  </div>
                  
                  <div className="pb-6 border-b dark:border-white/5 border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Community Load</p>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }} 
                         animate={{ width: `${Math.min(activeComplaints.length * 10, 100)}%` }} 
                         className="h-full bg-primary-500" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Zone Risk</p>
                        <p className={`text-sm font-black mt-1 ${overdue.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {overdue.length > 0 ? 'Elevated' : 'Nominal'}
                        </p>
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                        <p className="text-sm font-black mt-1 text-blue-500">
                           {complaints.length > 0 ? Math.round((resolvedComplaints.length / complaints.length) * 100) : 0}%
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
               <Bell className="w-8 h-8 text-primary-400 mb-6" />
               <h3 className="text-xl font-black mb-2">Need Assistance?</h3>
               <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Our urban intelligence AI is available 24/7 to guide you through grievance filing.</p>
               <button className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md">
                 TALK TO AI AGENT
               </button>
            </div>
          </div>

        </div>

        {/* --- Track Progress Summary List --- */}
        <section className="mb-12">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Stream Tracking</h3>
              <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <span>Active Stream</span>
                 <span className="h-4 w-1 bg-primary-500" />
              </div>
           </div>

           {complaints.length > 0 ? (
             <div className="space-y-4">
                {complaints.slice(0, 3).map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => router.push(`/user/complaints/${c._id}`)}
                    className="p-6 md:p-8 rounded-[2.5rem] glass-card border-2 dark:border-white/5 border-slate-100 hover:border-primary-500/30 transition-all cursor-pointer group shadow-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1.5 rounded-xl bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                             {c.category}
                           </span>
                           <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                             isResolvedStatus(c.status) ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                             {c.status}
                           </span>
                        </div>
                        <h4 className="text-xl font-bold dark:text-white text-slate-900 leading-tight line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {c.title || c.description}
                        </h4>
                        <div className="flex items-center gap-6 text-[11px] text-slate-400 font-medium tracking-wide">
                           <span className="flex items-center gap-2">
                             <MapPin className="w-3.5 h-3.5 text-rose-500/70" />
                             {c.location?.area || 'Sector Area'}
                           </span>
                           <span className="flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5 text-primary-500/70" />
                             {formatSla(c)}
                           </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                         <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border dark:border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-md">
                            <ChevronRight className="w-6 h-6" />
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="py-20 text-center glass-card border-2 border-dashed border-slate-200 dark:border-white/10">
                <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No active intelligence streams</p>
             </div>
           )}
        </section>

      </div>
    </div>
  );
}
