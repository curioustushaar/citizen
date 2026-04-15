'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Clock, AlertTriangle, CheckCircle, ArrowUpCircle, FileText, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { PRIORITY_COLORS, STATUS_COLORS, CATEGORY_ICONS } from '@/lib/constants';

export default function MyComplaintsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetch = async () => {
      const res = await api.getComplaints(user ? `userId=${user.id}` : 'limit=50');
      if (res.success) setComplaints(res.data as any[]);
    };
    fetch();
  }, [user]);

  const filtered = filter === 'ALL' ? complaints : complaints.filter((c) => c.status === filter);

  const statusCounts = {
    ALL: complaints.length,
    PENDING: complaints.filter((c) => c.status === 'PENDING').length,
    IN_PROGRESS: complaints.filter((c) => c.status === 'IN_PROGRESS').length,
    RESOLVED: complaints.filter((c) => c.status === 'RESOLVED').length,
    ESCALATED: complaints.filter((c) => c.status === 'ESCALATED').length,
  };

  const statusIcons: Record<string, any> = {
    ALL: FileText,
    PENDING: Clock,
    IN_PROGRESS: ArrowUpCircle,
    RESOLVED: CheckCircle,
    ESCALATED: AlertTriangle,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Complaints</h1>
          <p className="text-sm text-white/40 mt-1">
            Track the status of your submitted complaints
          </p>
        </div>
        <button
          onClick={() => router.push('/complaints/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Complaint
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([key, count]) => {
          const Icon = statusIcons[key];
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === key
                  ? 'bg-primary-500/15 text-white border border-primary-500/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {key === 'ALL' ? 'All' : key.replace('_', ' ')}
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md ${
                filter === key ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-white/30'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filtered.map((c, i) => {
          const priority = PRIORITY_COLORS[c.priority];
          const status = STATUS_COLORS[c.status];
          const icon = CATEGORY_ICONS[c.category] || '📋';
          const remaining = new Date(c.slaDeadline).getTime() - Date.now();
          const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));

          return (
            <motion.div
              key={c.complaintId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => router.push(`/complaints/${c.complaintId}`)}
              className="glass-card glass-card-hover p-4 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary-400">{c.complaintId.slice(0, 14)}</span>
                    <span className={`badge text-[10px] ${priority.bg} ${priority.text} border ${priority.border}`}>
                      {c.priority}
                    </span>
                    <span className={`badge text-[10px] ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-white/30">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {c.location?.area}
                    </span>
                    <span>{c.department}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.status === 'RESOLVED' ? 'Resolved' : remaining > 0 ? `${hours}h left` : 'Overdue'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 mb-4">No complaints found</p>
            <button onClick={() => router.push('/complaints/new')} className="btn-primary">
              File Your First Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
