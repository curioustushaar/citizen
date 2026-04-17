'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  FileText,
  MapPin,
  Building2,
  User,
  AlertTriangle,
  Timer,
  CheckCircle2,
} from 'lucide-react';

const STATUS_STYLES = {
  Submitted: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  'Under Review': 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  Assigned: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'On Hold': 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  Resolved: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'Citizen Verified': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Closed: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  Escalated: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  Rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  Reopened: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
};

export default function CitizenComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [escalateLoading, setEscalateLoading] = useState(false);
  const [slaCountdown, setSlaCountdown] = useState('');

  useEffect(() => {
    const loadComplaint = async () => {
      try {
        const res = await fetch(`/api/citizen/complaints/${params.id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          router.replace('/user/dashboard');
          return;
        }
        setComplaint(data.data);
      } catch {
        router.replace('/user/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadComplaint();
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldCheck className="w-8 h-8 text-primary-400 animate-pulse" />
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  const statusStyle = STATUS_STYLES[complaint.status] || 'bg-white/5 text-white/70 border-white/10';
  const isResolved = ['Resolved', 'Citizen Verified', 'Closed'].includes(complaint.status);

  useEffect(() => {
    if (!complaint?.slaDeadline || isResolved) {
      setSlaCountdown('');
      return;
    }

    const updateCountdown = () => {
      const deadline = new Date(complaint.slaDeadline).getTime();
      const now = Date.now();
      const diff = Math.max(0, deadline - now);
      if (diff === 0) {
        setSlaCountdown('SLA breached');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setSlaCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [complaint?.slaDeadline, isResolved]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Complaint ID</p>
              <h1 className="text-2xl font-semibold text-white">{complaint.complaintId}</h1>
              <p className="text-white/60 mt-2">{complaint.title}</p>
            </div>
            <div className={`px-4 py-2 rounded-full border text-xs font-semibold ${statusStyle}`}>
              {complaint.status}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <FileText className="w-4 h-4" /> Category
              </div>
              <p className="text-white font-semibold mt-2">{complaint.category}</p>
              {complaint.subcategory && (
                <p className="text-xs text-white/50">{complaint.subcategory}</p>
              )}
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Building2 className="w-4 h-4" /> Assigned Department
              </div>
              <p className="text-white font-semibold mt-2">{complaint.assignedDepartment || 'Pending'}</p>
              <p className="text-xs text-white/50">Officer: {complaint.assignedOfficer || 'Pending'}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Timer className="w-4 h-4" /> SLA Countdown
              </div>
              <p className="text-white font-semibold mt-2">
                {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'Not set'}
              </p>
              {slaCountdown && (
                <p className="text-xs text-white/50">Remaining: {slaCountdown}</p>
              )}
              <p className="text-xs text-white/50">Priority: {complaint.priority || 'Medium'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 space-y-5"
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Complaint Details</h2>
              <p className="text-white/60 text-sm mt-2">{complaint.description}</p>
            </div>
            <div className="grid gap-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {complaint.location?.area || ''}, {complaint.location?.city || ''} ({complaint.location?.pincode || ''})
              </div>
              {complaint.location?.ward && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Ward: {complaint.location.ward}
                </div>
              )}
              {complaint.landmark && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Landmark: {complaint.landmark}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Evidence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(complaint.evidence || []).map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="glass-card p-3 text-xs text-white/70 hover:text-white"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white">Status Timeline</h2>
            <div className="mt-4 space-y-4">
              {(complaint.statusTimeline || []).map((step, index) => (
                <div key={`${step.status}-${index}`} className="flex gap-3">
                  <div className="mt-1 w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{step.status}</p>
                    <p className="text-xs text-white/50">
                      {new Date(step.timestamp).toLocaleString()} {step.note ? `• ${step.note}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {complaint.escalationHistory?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white">Escalation History</h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {complaint.escalationHistory.map((entry, idx) => (
                <div key={`${entry.level}-${idx}`} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-1" />
                  <div>
                    <p className="font-semibold text-white">{entry.level}</p>
                    <p className="text-xs text-white/50">
                      {new Date(entry.timestamp).toLocaleString()} • {entry.reason}
                    </p>
                    <p className="text-xs text-white/40">Escalated to: {entry.escalatedTo}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {complaint.officerUpdates?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white">Officer Updates</h2>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              {complaint.officerUpdates.map((update, idx) => (
                <div key={`${update.type}-${idx}`} className="glass-card p-3">
                  <p className="text-xs text-white/40">{new Date(update.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-white mt-1">{update.note}</p>
                  {update.proofUrl && (
                    <a
                      href={update.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-300 mt-2 inline-block"
                    >
                      View proof
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white">Feedback</h2>
          <p className="text-sm text-white/60 mt-2">
            Confirm if your issue has been resolved. If not, we will reopen and escalate.
          </p>
          {complaint.feedback?.response && (
            <p className="text-xs text-white/50 mt-2">
              Feedback: {complaint.feedback.response === 'yes' ? 'Resolved' : 'Unresolved'}
            </p>
          )}
          <textarea
            className="login-input min-h-[100px] mt-4"
            value={feedbackComment}
            onChange={(event) => setFeedbackComment(event.target.value)}
            placeholder="Add a brief note (optional)"
          />
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={async () => {
                setFeedbackLoading(true);
                const res = await fetch(`/api/citizen/complaints/${params.id}/feedback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ response: 'yes', comment: feedbackComment }),
                });
                const data = await res.json();
                if (res.ok && data?.success) setComplaint(data.data);
                setFeedbackLoading(false);
              }}
              className="login-submit-btn"
              disabled={feedbackLoading}
            >
              <CheckCircle2 className="w-4 h-4" />
              {feedbackLoading ? 'Updating...' : 'Mark as Resolved'}
            </button>
            <button
              type="button"
              onClick={async () => {
                setFeedbackLoading(true);
                const res = await fetch(`/api/citizen/complaints/${params.id}/feedback`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ response: 'no', comment: feedbackComment }),
                });
                const data = await res.json();
                if (res.ok && data?.success) setComplaint(data.data);
                setFeedbackLoading(false);
              }}
              className="login-submit-btn"
              disabled={feedbackLoading}
            >
              <AlertTriangle className="w-4 h-4" />
              {feedbackLoading ? 'Updating...' : 'Still Pending - Reopen'}
            </button>
          </div>
        </motion.div>

        {!isResolved && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-white">Escalation</h2>
            <p className="text-sm text-white/60 mt-2">
              If this case is urgent or delayed, you can request escalation.
            </p>
            <button
              type="button"
              onClick={async () => {
                setEscalateLoading(true);
                const res = await fetch(`/api/citizen/complaints/${params.id}/escalate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ reason: 'Citizen requested escalation' }),
                });
                const data = await res.json();
                if (res.ok && data?.success) setComplaint(data.data);
                setEscalateLoading(false);
              }}
              className="login-submit-btn mt-4"
              disabled={escalateLoading}
            >
              <AlertTriangle className="w-4 h-4" />
              {escalateLoading ? 'Escalating...' : 'Escalate complaint'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
