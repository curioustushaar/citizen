'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Clock, Tag, MessageSquare,
  ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2,
  Calendar, Building2, Zap, Image as ImageIcon, Mic,
  Play, Pause, X, User as UserIcon, Timer
} from 'lucide-react';
import { onEvent } from '@/lib/socket';

interface TimelineStep {
  step: string;
  time: string;
}

interface Complaint {
  _id: string;
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
  assignedOfficer: string;
  createdAt: string;
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  HIGH:   { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    icon: '🔴' },
  MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   icon: '🟡' },
  LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '🟢' },
};

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
      else setError(data.error || 'Complaint not found');
    } catch {
      setError('Connection to backend failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // Real-time update for this specific complaint
    const cleanup = onEvent('complaint_updated', (updated) => {
      if (updated._id === params.id) {
        setComplaint(updated);
      }
    });
    return cleanup;
  }, [params.id]);

  // ETA Countdown timer
  useEffect(() => {
    if (!complaint?.slaDeadline || complaint.status.toLowerCase() === 'resolved') {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const deadline = new Date(complaint.slaDeadline).getTime();
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('SLA Breached');
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [complaint]);

  const handleFeedback = async (satisfied: boolean) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${params.id}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ satisfied }),
      });
      const data = await res.json();
      if (data.success) { 
        setComplaint(data.data); 
        setFeedbackSubmitted(true); 
      }
    } catch { 
      alert('Failed to submit feedback'); 
    } finally { 
      setIsUpdating(false); 
    }
  };

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

  const getStatusStyle = (s: string) => {
    const lower = s?.toLowerCase();
    if (lower === 'pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (lower === 'resolved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (lower === 'escalated') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <Zap className="w-8 h-8 text-blue-500 animate-pulse" />
    </div>
  );

  if (error || !complaint) return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Error Loading Complaint</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => router.push('/user/complaints')} className="text-blue-400 hover:underline">Back to list</button>
    </div>
  );

  const priorityInfo = PRIORITY_CONFIG[complaint.priority?.toUpperCase()] || PRIORITY_CONFIG.MEDIUM;
  const locationStr = typeof complaint.location === 'object' ? complaint.location.area : complaint.location;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-8 px-4">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* ── Main Details Card ────────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="p-8 md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${priorityInfo.border} ${priorityInfo.bg} ${priorityInfo.color}`}>
                    {priorityInfo.icon} {complaint.priority}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  ID: {complaint._id.slice(-8)}
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-8">
                {complaint.description}
              </h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Department</p>
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    {complaint.department}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Assigned To</p>
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-purple-500" />
                    {complaint.assignedOfficer || 'Pending Assignment'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Location Area</p>
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {locationStr}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">SLA Deadline</p>
                  <p className="text-sm text-amber-400 font-black flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {timeLeft || 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Timeline ────────────────────────────────────────────────── */}
            <div className="px-8 pb-10 border-t border-white/5 pt-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500" />
                Tracking Timeline
              </h3>
              
              <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {complaint.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-[#080c14] border-2 border-blue-500/50 flex items-center justify-center z-10 shadow-glow-blue">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{step.step}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(step.time).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Evidence & Assets ────────────────────────────────────────────────── */}
            {(complaint.imageUrls.length > 0 || complaint.voiceNoteUrl) && (
              <div className="px-8 py-10 border-t border-white/5 bg-white/[0.01]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {complaint.imageUrls.length > 0 && (
                    <div>
                      <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" /> Media Evidence
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {complaint.imageUrls.map((url, i) => (
                          <button key={i} onClick={() => setLightboxImg(url)} className="group relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all shadow-lg hover:scale-105">
                            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {complaint.voiceNoteUrl && (
                    <div>
                      <h4 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Mic className="w-3.5 h-3.5" /> Audio Briefing
                      </h4>
                      <button onClick={playVoice} className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all group overflow-hidden relative">
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                          {isPlayingVoice ? <Pause className="w-5 h-5 text-emerald-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{isPlayingVoice ? 'Playing...' : 'Play Voice Note'}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">MP3 / Audio Proof</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Resolution Feedback ────────────────────────────────────────────────── */}
            <div className="p-8 md:p-10 border-t border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Public Satisfaction Review
              </h3>

              <AnimatePresence mode="wait">
                {feedbackSubmitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-[32px] bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white font-black text-xl mb-1">Feedback Logged</p>
                    <p className="text-slate-400 text-sm">Thank you for helping us maintain civic standards.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-slate-500 text-sm">Has this issue been addressed by the municipal department adequately?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => handleFeedback(true)} disabled={isUpdating} className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 transition-all font-black text-sm disabled:opacity-50 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]">
                        <ThumbsUp className="w-4 h-4" /> Yes, Perfectly Solved
                      </button>
                      <button onClick={() => handleFeedback(false)} disabled={isUpdating} className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all font-black text-sm disabled:opacity-50 shadow-lg shadow-rose-500/10 hover:scale-[1.02] active:scale-[0.98]">
                        <ThumbsDown className="w-4 h-4" /> Not Satisfied
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Metadata Disclaimer ────────────────────────────────────────────────── */}
          <div className="text-center">
            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">
              Digital Audit Trail Verified • Logged on {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
