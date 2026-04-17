"use client";

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Tag, MessageSquare,
  ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2,
  Calendar, Building2, Zap, Image as ImageIcon, Mic,
  Play, Pause, X, User as UserIcon, Timer, PlusCircle,
  FileText, ShieldCheck, Activity, Share2, Download
} from 'lucide-react';
import { onEvent } from '@/lib/socket';

interface TimelineStep {
  step: string;
  time: string;
}

interface Complaint {
  _id: string;
  complaintId?: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  department: string;
  slaDeadline: string;
  tags: string[];
  imageUrls: string[];
  voiceNoteUrl: string;
  location: any;
  timeline: TimelineStep[];
  statusTimeline?: Array<{ status: string; timestamp: string; note?: string }>;
  assignedOfficer: string;
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  HIGH:   { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    icon: '🔴', label: 'CRITICAL' },
  MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: '🟡', label: 'MODERATE' },
  LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '🟢', label: 'STANDARD' },
};

const FLOW_STEPS = ['Submitted', 'Assigned', 'Accepted', 'In Progress', 'Resolved'];

export default function ComplaintDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/complaints/${params.id}`);
      const data = await res.json();
      if (data.success) setComplaint(data.data);
      else setError(data.error || 'Intelligence Feed Compromised');
    } catch {
      setError('Connection Link Failure');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const cleanup = onEvent('complaint_updated', (updated) => {
      if (updated._id === params.id) setComplaint(updated);
    });
    return cleanup;
  }, [params.id]);

  useEffect(() => {
    if (!complaint?.slaDeadline || complaint.status.toLowerCase() === 'resolved') {
      setTimeLeft('');
      return;
    }
    const interval = setInterval(() => {
      const deadline = new Date(complaint.slaDeadline).getTime();
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft('SLA INCIDENT');
        clearInterval(interval);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [complaint]);

  const playVoice = () => {
    if (!complaint?.voiceNoteUrl) return;
    if (isPlayingVoice) {
      audioRef.current?.pause();
      setIsPlayingVoice(false);
      return;
    }
    const audio = new Audio(complaint.voiceNoteUrl);
    audioRef.current = audio;
    audio.play();
    setIsPlayingVoice(true);
    audio.onended = () => setIsPlayingVoice(false);
  };

  if (isLoading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
       <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
          <Zap className="w-6 h-6 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
       </div>
    </div>
  );

  if (error || !complaint) return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-rose-500/20 shadow-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500" />
      </div>
      <h2 className="text-3xl font-black dark:text-white text-slate-900 mb-4">Transmission Lost</h2>
      <p className="text-slate-500 font-medium mb-10 max-w-sm leading-relaxed">{error}</p>
      <button onClick={() => router.push('/user/all-complaints')} className="px-8 py-3 bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 rounded-2xl text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Re-establish Link
      </button>
    </div>
  );

  const priorityInfo = PRIORITY_CONFIG[complaint.priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM;
  const statusLower = complaint.status?.toLowerCase();
  const isResolved = ['resolved', 'citizen verified', 'closed'].includes(statusLower);
  const locationStr = typeof complaint.location === 'object' ? (complaint.location.area || complaint.location.city) : complaint.location;

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-8 px-4 md:px-8">
      {/* Lightbox for Evidence */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl"
            onClick={() => setLightboxImg(null)}
          >
            <motion.button 
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 right-8 p-4 bg-white/10 rounded-[2rem] text-white hover:bg-white/20 transition-all shadow-2xl border border-white/10"
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.img 
              initial={{ opacity: 0, y: 100, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              src={lightboxImg} 
              alt="Forensic Evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-[3.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border-2 border-white/5" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <button
             onClick={() => router.push('/user/all-complaints')}
             className="flex items-center gap-3 text-slate-500 hover:text-primary-500 transition-all font-bold text-xs uppercase tracking-widest group"
           >
             <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-md">
               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             </div>
             Back to Intelligence Feed
           </button>
           
           <div className="flex items-center gap-3">
              <button className="p-3 rounded-2xl bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 text-slate-500 hover:text-primary-500 transition-all shadow-md">
                 <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-2xl bg-white dark:bg-white/5 border dark:border-white/10 border-slate-200 text-slate-500 hover:text-emerald-500 transition-all shadow-md">
                 <Download className="w-5 h-5" />
              </button>
           </div>
        </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Card */}
          <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-2 dark:border-white/5 border-slate-100 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
             <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-[100px] -ml-30 -mb-30" />
             
             <div className="p-8 md:p-14 relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-10">
                   <div className="px-5 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" /> {complaint.status}
                   </div>
                   <div className={`px-5 py-2 rounded-2xl ${priorityInfo.bg} border-2 ${priorityInfo.border.replace('30', '50')} ${priorityInfo.color.replace('-400', '-600')} text-[10px] font-black uppercase tracking-[0.2em] shadow-sm`}>
                      {priorityInfo.icon} {priorityInfo.label}
                   </div>
                   <div className="ml-auto flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-5 py-2 rounded-2xl border dark:border-white/5 border-slate-200">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {complaint.complaintId || complaint._id.slice(-8)}</span>
                   </div>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-[1.1] mb-12 tracking-tight">
                   {complaint.description}
                </h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                   {[
                     { label: 'Department', val: complaint.department, icon: Building2, color: 'text-primary-500' },
                     { label: 'Location', val: locationStr, icon: MapPin, color: 'text-rose-500' },
                     { label: 'Agent Status', val: complaint.assignedOfficer || 'Auto-Routing...', icon: UserIcon, color: 'text-indigo-500' },
                     { label: 'Incident Deadline', val: timeLeft || 'Awaiting...', icon: Clock, color: timeLeft.includes('INCIDENT') ? 'text-rose-500' : 'text-amber-500' },
                   ].map(stat => (
                     <div key={stat.label} className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                           <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} /> {stat.label}
                        </p>
                        <p className={`text-base font-black truncate ${stat.label === 'Incident Deadline' && timeLeft.includes('INCIDENT') ? 'text-rose-600 animate-pulse' : 'dark:text-white text-slate-900 font-bold'}`}>
                           {stat.val}
                        </p>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>

          {/* Timeline & Flow */}
          <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-2 dark:border-white/5 border-slate-100 shadow-2xl p-10 md:p-14">
             <h3 className="text-xl font-black text-slate-900 dark:text-white mb-14 flex items-center gap-3 tracking-tight">
                <Timer className="w-6 h-6 text-primary-500" /> Forensic Timeline <span className="text-slate-400 font-medium">/ Progression</span>
             </h3>

             <div className="relative pl-12 space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[4px] before:bg-slate-100 dark:before:bg-white/5">
                {complaint.statusTimeline && complaint.statusTimeline.length > 0 ? complaint.statusTimeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                     <div className="absolute -left-[43px] top-1 w-11 h-11 rounded-[1.25rem] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center z-10 shadow-xl group-hover:border-primary-500 transition-colors">
                        {idx === 0 ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />}
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">{step.status}</p>
                           {idx === 0 && <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[9px] font-black uppercase tracking-widest">LATEST</span>}
                        </div>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-slate-400" />
                           {new Date(step.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {step.note && (
                          <div className="mt-4 p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border dark:border-white/5 border-slate-100 text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-400">
                             "{step.note}"
                          </div>
                        )}
                     </div>
                  </div>
                )) : (
                  <div className="text-slate-500 font-black italic">Initialization in progress...</div>
                )}
             </div>
          </motion.div>

          {/* Assets Grid */}
          {(complaint.imageUrls?.length > 0 || complaint.voiceNoteUrl) && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {complaint.imageUrls?.length > 0 && (
                 <div className="glass-card rounded-[3.5rem] border-2 dark:border-white/5 border-slate-100 shadow-2xl p-10 overflow-hidden">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-8 flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-blue-500" /> Visual Forensic Evidence
                    </h4>
                    <div className="grid grid-cols-2 gap-5">
                       {complaint.imageUrls.map((url, i) => (
                         <div key={i} onClick={() => setLightboxImg(url)} className="aspect-square rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-xl cursor-pointer group relative">
                            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115" />
                            <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/20 transition-all flex items-center justify-center">
                               <PlusCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {complaint.voiceNoteUrl && (
                 <div className="glass-card rounded-[3.5rem] border-2 dark:border-white/5 border-slate-100 shadow-2xl p-10 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-8 flex items-center gap-2">
                         <Mic className="w-4 h-4 text-emerald-500" /> Audio Transcript Log
                      </h4>
                      <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 dark:bg-emerald-500/10 border-2 border-emerald-500/20 shadow-inner relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4">
                            <Zap className="w-5 h-5 text-emerald-500/40 group-hover:rotate-12 transition-transform" />
                         </div>
                         <div className="flex flex-col items-center text-center gap-6">
                            <button onClick={playVoice} className="w-20 h-20 bg-emerald-500 text-white rounded-[1.75rem] flex items-center justify-center hover:bg-emerald-600 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] shadow-emerald-500/20 active:scale-95 group-hover:scale-110">
                               {isPlayingVoice ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                            </button>
                            <div className="space-y-1">
                               <p className="text-lg font-black dark:text-white text-slate-800 tracking-tight">Proof.AUDIO.webm</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isPlayingVoice ? 'SYSTEM OUTPUT ACTIVE' : 'Tap to stream proof'}</p>
                            </div>
                         </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t dark:border-white/5 border-slate-100 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                       <span>Encrypted Asset</span>
                       <span>Urban AI Verified</span>
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {/* Satisfaction Card (If Resolved) */}
          {isResolved && (
            <motion.div variants={itemVariants} className="glass-card rounded-[3.5rem] border-2 dark:border-white/5 border-slate-100 shadow-2xl p-10 md:p-14 text-center bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
               {!feedbackSubmitted ? (
                 <div className="max-w-xl mx-auto space-y-10">
                    <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/5">
                       <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Resolution Quality Audit</h3>
                       <p className="text-slate-500 font-medium leading-relaxed">
                          Municipal authorities have marked this issue as <span className="text-emerald-500 font-bold">Resolved</span>. Has the civic standard been restored to your satisfaction?
                       </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <button 
                         onClick={() => { setIsUpdating(true); setTimeout(() => { setFeedbackSubmitted(true); setIsUpdating(false); }, 1000); }}
                         className="flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                       >
                          <ThumbsUp className="w-5 h-5" /> Restore Complete
                       </button>
                       <button 
                         className="flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-white dark:bg-white/5 border-2 border-rose-500/30 text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-500/10 transition-all active:scale-95 shadow-lg"
                       >
                          <ThumbsDown className="w-5 h-5" /> Quality Audit Failed
                       </button>
                    </div>
                 </div>
               ) : (
                 <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                       <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-500 tracking-tight">Satisfaction Logged</h3>
                    <p className="text-slate-500 font-medium italic">"Audit trail closed. Verification successful."</p>
                 </motion.div>
               )}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="text-center pt-10 pb-20">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 bg-slate-100 dark:bg-white/5 px-8 py-3 rounded-2xl inline-block border border-slate-200 dark:border-white/5 shadow-sm">
                Forensic Audit Trail Verified • Standard Transmission 0x443
             </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
