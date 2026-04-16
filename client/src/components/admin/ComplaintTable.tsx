'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowUpDown, Filter, User, CheckCircle, Settings, X, Save } from 'lucide-react';
import { PRIORITY_COLORS, STATUS_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

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
  _id?: string;
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
  const [localComplaints, setLocalComplaints] = useState<Complaint[]>([]);
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [assignee, setAssignee] = useState('');
  const [remarks, setRemarks] = useState('');

  // Sync parent props
  useEffect(() => {
    setLocalComplaints(complaints || []);
  }, [complaints]);

  const filtered = localComplaints
    .filter((c) => filter === 'ALL' || c.status === filter)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        return order[a.priority] - order[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const filters = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'];

  const handleUpdate = async () => {
    if (!viewingComplaint) return;
    setIsUpdating(true);
    try {
      const id = viewingComplaint._id || viewingComplaint.complaintId;
      let success = false;
      
      // Update assignee if changed
      if (assignee && assignee !== viewingComplaint.assignedOfficerName) {
        const res = await api.updateComplaint(id, { assignedOfficerName: assignee });
        success = res.success || success;
      }
      
      // Update status / remarks if changed
      const res2 = await api.updateStatus(id, updateStatus || viewingComplaint.status, remarks);
      success = res2.success || success;

      if (success) {
        toast.success("Action logged & citizen notified!");
      } else {
        toast.success("Updated in Local Memory (Demo Mode Active)");
      }

      setLocalComplaints(prev => prev.map(c => (c._id || c.complaintId) === id ? { 
        ...c, 
        status: (updateStatus as any) || c.status, 
        assignedOfficerName: assignee || c.assignedOfficerName 
      } : c));
      
      setViewingComplaint(null);
    } catch (err) {
      toast.error("Failed to update system.");
    }
    setIsUpdating(false);
  };

  return (
    <div className="glass-card overflow-hidden relative">
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
                  onClick={() => {
                    setViewingComplaint(c);
                    setUpdateStatus(c.status);
                    setAssignee(c.assignedOfficerName || '');
                    setRemarks('');
                  }}
                  className={`border-b border-white/[0.03] cursor-pointer transition-colors ${
                    viewingComplaint && (viewingComplaint._id === c._id || viewingComplaint.complaintId === c.complaintId)
                      ? 'bg-primary-500/10'
                      : 'hover:bg-white/[0.02]'
                  }`}
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

      {viewingComplaint && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-xl p-6 shadow-2xl border-primary-500/30 border max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded">
                    #{(viewingComplaint.complaintId || viewingComplaint._id || '').slice(-6)}
                  </span>
                  <span className={`badge text-[10px] ${(PRIORITY_COLORS[viewingComplaint.priority] || PRIORITY_COLORS.LOW).bg} ${(PRIORITY_COLORS[viewingComplaint.priority] || PRIORITY_COLORS.LOW).text}`}>
                    {viewingComplaint.priority} PRIORITY
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {viewingComplaint.description}
                </h2>
                <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Reported: {new Date(viewingComplaint.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setViewingComplaint(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Department</p>
                <p className="text-sm text-white font-medium">{viewingComplaint.department}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Location</p>
                <p className="text-sm text-white font-medium">{viewingComplaint.location.area}, {viewingComplaint.location.district}</p>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Settings className="w-4 h-4 text-accent-400" /> Officer Action Panel
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Assign Worker/Officer</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                    <input 
                      type="text" 
                      value={assignee} 
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="input-field pl-9 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Update Status</label>
                  <select 
                    value={updateStatus} 
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="input-field py-2 text-sm"
                  >
                    <option value="PENDING">Pending (Unassigned)</option>
                    <option value="IN_PROGRESS">In Progress (Worker Dispatched)</option>
                    <option value="RESOLVED">Resolved (Issue Fixed)</option>
                    <option value="ESCALATED">Escalated (Requires higher authority)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/60 mb-1">Resolution Remarks / Notes to Citizen</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Pipeline repaired, water connection restored."
                  className="input-field text-sm min-h-[80px]"
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleUpdate} 
                  disabled={isUpdating}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateStatus === 'RESOLVED' ? 'Mark as Resolved & Notify Citizen' : 'Update & Assign'}
                </button>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </div>
  );
}
