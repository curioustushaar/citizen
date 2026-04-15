'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, MapPin, AlignLeft, Tag, Send, ArrowRight, Sparkles,
  Camera, X, Mic, MicOff, Play, Pause, Trash2, Upload,
  Brain, Zap, Clock, Building2, AlertTriangle, CheckCircle2,
  ChevronDown, Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

const CATEGORIES = [
  'Water Supply', 'Electricity', 'Traffic & Transport',
  'Sanitation', 'Public Safety', 'Environment',
  'Health', 'Education', 'Infrastructure',
];

// AI simulation on frontend for instant feedback
function clientDetectCategory(text: string): string {
  const lower = text.toLowerCase();
  if (/water|pipeline|drain|leak|sewage|tap|flood|paani|jal|nall/.test(lower)) return 'Water Supply';
  if (/electricity|power|light|outage|wire|spark|transformer|bijli|taar/.test(lower)) return 'Electricity';
  if (/traffic|road|pothole|signal|accident|jam|highway|sadak|rasta|gadda/.test(lower)) return 'Traffic & Transport';
  if (/garbage|clean|waste|filth|sanitation|dump|rubbish|kachra|gunda|safai/.test(lower)) return 'Sanitation';
  if (/safety|crime|police|robbery|assault|theft|harassment|danger|shakti|chor/.test(lower)) return 'Public Safety';
  if (/park|tree|garden|pollution|environment|ped|per|pradushan/.test(lower)) return 'Environment';
  if (/hospital|health|medical|disease|clinic|bimari|aspatal/.test(lower)) return 'Health';
  if (/building|collapse|construction|encroachment|girna|ghar|makan/.test(lower)) return 'Infrastructure';
  return '';
}

function clientDetectPriority(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const lower = text.toLowerCase();
  if (/fire|accident|collapse|emergency|urgent|danger|death|explosion|toxic|gas leak|aag|khatra|maut/.test(lower)) return 'HIGH';
  if (/broken|leak|not working|damaged|pothole|outage|contaminated|blocked|toota|kharab|paresani/.test(lower)) return 'MEDIUM';
  return 'LOW';
}

function clientDetectTags(text: string, category: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  if (/leak|leaking|leakage/.test(lower)) tags.push('leakage');
  if (/urgent|emergency|immediately|fire|critical/.test(lower)) tags.push('urgent');
  if (/pothole|road damage|broken road/.test(lower)) tags.push('road-damage');
  if (/no water|water shortage|dry tap/.test(lower)) tags.push('no-water');
  if (/power cut|no electricity|outage|blackout/.test(lower)) tags.push('power-cut');
  if (/garbage|waste|dump|rubbish|trash/.test(lower)) tags.push('garbage');
  if (/flood|waterlogging|overflow/.test(lower)) tags.push('flooding');
  if (/danger|hazard|unsafe|risk/.test(lower)) tags.push('safety-risk');
  if (/noise|loud|disturbance/.test(lower)) tags.push('noise');
  if (category) tags.push(category.toLowerCase().replace(/[& ]+/g, '-'));
  return [...new Set(tags)].slice(0, 6);
}

const DEPT_MAP: Record<string, string> = {
  'Water Supply': 'Delhi Jal Board',
  'Electricity': 'BSES / TPDDL',
  'Traffic & Transport': 'Delhi Traffic Police',
  'Sanitation': 'Municipal Corporation of Delhi',
  'Public Safety': 'Delhi Police',
  'Environment': 'Delhi Pollution Control Committee',
  'Health': 'Delhi Health Services',
  'Infrastructure': 'Public Works Department',
  '': 'Auto-detecting...',
};

const SLA_MAP: Record<string, Record<string, string>> = {
  'Water Supply': { HIGH: '4 hrs', MEDIUM: '24 hrs', LOW: '48 hrs' },
  'Electricity': { HIGH: '2 hrs', MEDIUM: '12 hrs', LOW: '24 hrs' },
  'Traffic & Transport': { HIGH: '1 hr', MEDIUM: '8 hrs', LOW: '24 hrs' },
  'Public Safety': { HIGH: '30 min', MEDIUM: '4 hrs', LOW: '12 hrs' },
  'Sanitation': { HIGH: '6 hrs', MEDIUM: '24 hrs', LOW: '72 hrs' },
};

const PRIORITY_CONFIG = {
  HIGH:   { label: 'HIGH',   color: 'text-rose-400',  bg: 'bg-rose-500/10',  border: 'border-rose-500/30',   icon: '🔴', desc: 'Immediate action required' },
  MEDIUM: { label: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30',  icon: '🟡', desc: 'Action within 24 hours' },
  LOW:    { label: 'LOW',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: '🟢', desc: 'Standard processing time' },
};

export default function NewComplaintPage() {
  const router = useRouter();
  const { token, t } = useAuth();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLoc, setIsCapturingLoc] = useState(false);

  // Auto-capture location
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsCapturingLoc(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsCapturingLoc(false);
        },
        () => setIsCapturingLoc(false)
      );
    }
  }, []);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  // AI auto-detection state
  const [aiCategory, setAiCategory] = useState('');
  const [aiPriority, setAiPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('LOW');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisVisible, setAnalysisVisible] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI analysis debounce
  useEffect(() => {
    if (!description.trim() || description.length < 10) {
      setAnalysisVisible(false);
      return;
    }
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const detectedCat = category || clientDetectCategory(description);
      const detectedPri = clientDetectPriority(description);
      const detectedTags = clientDetectTags(description, detectedCat);
      setAiCategory(detectedCat);
      setAiPriority(detectedPri);
      setAiTags(detectedTags);
      setIsAnalyzing(false);
      setAnalysisVisible(true);
    }, 700);
    return () => clearTimeout(timer);
  }, [description, category]);

  // Image handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...images, ...files].slice(0, 5);
    setImages(newFiles);
    const previews = newFiles.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (idx: number) => {
    const newFiles = images.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImages(newFiles);
    setImagePreviews(newPreviews);
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setVoiceDuration(0);
      timerRef.current = setInterval(() => setVoiceDuration(d => d + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const playVoice = () => {
    if (!voiceBlob) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlayingVoice(false);
      return;
    }
    const url = URL.createObjectURL(voiceBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setIsPlayingVoice(true);
    audio.onended = () => { setIsPlayingVoice(false); audioRef.current = null; };
  };

  const deleteVoice = () => {
    setVoiceBlob(null);
    setVoiceDuration(0);
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlayingVoice(false);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location', location);
      formData.append('category', category || aiCategory || 'General');
      if (coords) {
        formData.append('lat', coords.lat.toString());
        formData.append('lng', coords.lng.toString());
      }
      images.forEach(img => formData.append('images', img));
      if (voiceBlob) {
        formData.append('voice', new File([voiceBlob], 'voice-note.webm', { type: 'audio/webm' }));
      }

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedData(data.data);
      } else {
        setError(data.error || 'Failed to submit complaint');
      }
    } catch {
      setError('Connection to backend failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityInfo = PRIORITY_CONFIG[aiPriority] || PRIORITY_CONFIG.LOW;
  const effectiveCategory = category || aiCategory;
  const slaTime = SLA_MAP[effectiveCategory]?.[aiPriority] || '48 hrs';
  const dept = DEPT_MAP[effectiveCategory] || 'Auto-detecting...';

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (submittedData) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-200 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <div className="w-24 h-24 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Complaint Registered!</h2>
          <p className="text-slate-500 mb-8">AI has analyzed and routed your complaint to the appropriate department.</p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Category</span>
              <span className="text-white font-bold">{submittedData.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Priority</span>
              <span className={`font-bold ${PRIORITY_CONFIG[submittedData.priority as 'HIGH'|'MEDIUM'|'LOW']?.color || 'text-white'}`}>
                {submittedData.priority}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Department</span>
              <span className="text-white font-bold">{submittedData.department}</span>
            </div>
            {submittedData.tags?.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-slate-500 text-xs mb-2">AI-Generated Tags</p>
                <div className="flex flex-wrap gap-2">
                  {submittedData.tags.map((t: string) => (
                    <span key={t} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-lg">#{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/my-complaints')}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              Track Status <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSubmittedData(null); setDescription(''); setCategory(''); setLocation(''); setImages([]); setImagePreviews([]); setVoiceBlob(null); }}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all"
            >
              File Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <PlusCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-3xl font-black text-white">{t('fileGrievance')}</h1>
          </div>
          <p className="text-slate-500 ml-14">
            Our AI analyzes your complaint in real-time and routes it to the right department.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Description ─────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
              <AlignLeft className="w-3.5 h-3.5" />
              {t('describeIssue')} *
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What seems to be the problem? Be specific — e.g. 'Broken water pipeline leaking in Sector 7, causing road damage and water wastage...'"
              required
              rows={5}
              className="w-full bg-transparent text-white placeholder-slate-700 focus:outline-none resize-none text-base leading-relaxed"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-700">{description.length} characters</span>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 text-xs text-blue-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> AI analyzing...
                </span>
              )}
            </div>
          </div>

          {/* ── AI Intelligence Panel ─────────────────────────────────── */}
          <AnimatePresence>
            {analysisVisible && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-3xl p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">AI Intelligence Report</h3>
                    <Sparkles className="w-3 h-3 text-purple-400 ml-auto animate-pulse" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    {/* Category */}
                    <div className="col-span-2 bg-white/5 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Detected Category</p>
                      <p className="text-white font-bold">{effectiveCategory || 'General'}</p>
                    </div>
                    {/* Priority */}
                    <div className={`${priorityInfo.bg} ${priorityInfo.border} border rounded-2xl p-4`}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Priority</p>
                      <p className={`font-bold text-sm ${priorityInfo.color}`}>{priorityInfo.icon} {priorityInfo.label}</p>
                      <p className="text-[9px] text-slate-600 mt-1">{priorityInfo.desc}</p>
                    </div>
                    {/* SLA */}
                    <div className="bg-white/5 rounded-2xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> SLA Deadline
                      </p>
                      <p className="text-white font-bold text-sm">{slaTime}</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 mb-4">
                    <Building2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Routed to Department</p>
                      <p className="text-white font-bold text-sm">{dept}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">Auto-routed</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {aiTags.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">AI-Generated Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {aiTags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-xl font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Category + Location ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
                <Tag className="w-3.5 h-3.5" />
                {t('category')}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-transparent text-white focus:outline-none appearance-none cursor-pointer pr-8"
                >
                  <option value="" className="bg-slate-900">⚡ Auto-detect (AI)</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              </div>
            </div>
            {/* Location */}
            <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                {t('exactLocation')} *
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Lajpat Nagar Market, Block C"
                required
                className="w-full bg-transparent text-white placeholder-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* ── Image Upload ─────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Camera className="w-3.5 h-3.5" />
                {t('photoEvidence')}
              </label>
              <span className="text-[10px] text-slate-600">{images.length}/5 photos</span>
            </div>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group w-20 h-20">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-2xl border border-white/10" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5}
              className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-500 hover:border-blue-500/40 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40"
            >
              <Upload className="w-4 h-4" />
              {images.length === 0 ? 'Add photos (up to 5)' : 'Add more photos'}
            </button>
          </div>

          {/* ── Voice Input ──────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">
              <Mic className="w-3.5 h-3.5" />
              {t('voiceNote')}
              <span className="text-[10px] text-slate-700 normal-case tracking-normal ml-1">— For users who prefer speaking</span>
            </label>

            {voiceBlob ? (
              <div className="flex items-center gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                <button type="button" onClick={playVoice}
                  className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                >
                  {isPlayingVoice ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Voice note recorded</p>
                  <p className="text-xs text-slate-500">{formatTime(voiceDuration)} duration</p>
                </div>
                <button type="button" onClick={deleteVoice} className="text-rose-400 hover:text-rose-300 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-rose-500 animate-pulse shadow-lg shadow-rose-500/40'
                      : 'bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30'
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-slate-400" />}
                </button>
                <div>
                  {isRecording ? (
                    <div>
                      <p className="text-sm text-rose-400 font-bold animate-pulse">Recording... {formatTime(voiceDuration)}</p>
                      <p className="text-xs text-slate-600">Click the button again to stop</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-400">Click to start recording</p>
                      <p className="text-xs text-slate-700">Speak clearly about the issue</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 text-lg shadow-2xl shadow-blue-500/20"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing with AI...</>
            ) : (
              <><Zap className="w-5 h-5" /> {t('submit')}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
