'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUpDown, Filter } from 'lucide-react';
import { PRIORITY_COLORS, STATUS_COLORS, CATEGORY_ICONS } from '@/lib/constants';

interface Complaint {
  complaintId: string;
  description: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  department: string;
  assignedOfficerName: string | null;
  slaDeadline: string;
  location: { area: string; district: string };
  createdAt: string;
}

function SLABadge({ deadline }: { deadline: string }) {
  const remaining = new Date(deadline).getTime() - Date.now();
  const hours = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
  const mins = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));
  const isOverdue = remaining < 0;
  const isUrgent = remaining > 0 && remaining < 2 * 60 * 60 * 1000;

  return (
    <span
      className={`text-[11px] font-mono ${
        isOverdue
          ? 'text-danger-400'
          : isUrgent
          ? 'text-warning-400'
          : 'text-white/50'
      }`}
    >
      {isOverdue ? 'OVERDUE' : `${hours}h ${mins}m`}
    </span>
  );
}

export default function ComplaintTable({ complaints }: { complaints: Complaint[] }) {
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority'>('createdAt');

  const filtered = (complaints || [])
    .filter((c) => filter === 'ALL' || c.status === filter)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filters = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];

  return (
    <div className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/40" />
          <div className="flex gap-1 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  filter === f
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {f === 'ALL' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setSortBy(sortBy === 'createdAt' ? 'priority' : 'createdAt')}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sort by {sortBy === 'createdAt' ? 'Date' : 'Priority'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {['ID', 'Category', 'Location', 'Priority', 'Status', 'Officer', 'SLA'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const priority = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.LOW;
              const status = STATUS_COLORS[c.status] || STATUS_COLORS.PENDING;
              return (
                <motion.tr
                  key={c.complaintId || (c as any)._id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-primary-400">
                      {(c.complaintId || (c as any)._id || 'N/A').toString().slice(0, 12)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[c.category] || '📋'}</span>
                      <span className="text-xs text-white/70 truncate max-w-[120px]">
                        {c.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/50">{c.location.area}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge text-[10px] ${priority.bg} ${priority.text} border ${priority.border}`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-[10px] ${status.bg} ${status.text}`}>
                      {status.label || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/50">
                      {c.assignedOfficerName || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-white/20" />
                      <SLABadge deadline={c.slaDeadline} />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/20 text-sm">
            No complaints found
          </div>
        )}
      </div>
    </div>
  );
}
