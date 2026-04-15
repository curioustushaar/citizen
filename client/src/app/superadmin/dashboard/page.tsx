'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Shield, Users, FileText, Settings, Activity, Map, BarChart3, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import StatsCards from '@/components/dashboard/StatsCards';
import ComplaintTable from '@/components/admin/ComplaintTable';
import OfficerList from '@/components/admin/OfficerList';
import DepartmentChart from '@/components/analytics/DepartmentChart';
import EscalationChart from '@/components/analytics/EscalationChart';

const CityMap = dynamic(() => import('@/components/dashboard/CityMap'), { ssr: false });

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [escData, setEscData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [slaConfigs, setSlaConfigs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'sla' | 'audit'>('overview');

  useEffect(() => {
    const fetchAll = async () => {
      const [sumRes, compRes, offRes, deptRes, escRes] = await Promise.all([
        api.getSummary(),
        api.getComplaints('limit=200'),
        api.getOfficers(),
        api.getDepartmentStats(),
        api.getEscalationStats(),
      ]);
      if (sumRes.success) setStats(sumRes.data);
      if (compRes.success) setComplaints(compRes.data as any[]);
      if (offRes.success) setOfficers(offRes.data as any[]);
      if (deptRes.success) setDeptData(deptRes.data as any[]);
      if (escRes.success) setEscData(escRes.data);

      // These require auth — will fail gracefully in frontend-only mode
      try {
        const [usrRes, slaRes, audRes] = await Promise.all([
          api.getUsers(),
          api.getSLAConfigs(),
          api.getAuditLogs(),
        ]);
        if (usrRes.success) setUsers(usrRes.data as any[]);
        if (slaRes.success) setSlaConfigs(slaRes.data as any[]);
        if (audRes.success) setAuditLogs(audRes.data as any[]);
      } catch {}
    };
    fetchAll();

    const handler = () => fetchAll();
    window.addEventListener('crisis-simulated', handler);
    return () => window.removeEventListener('crisis-simulated', handler);
  }, []);

  const tabs = [
    { key: 'overview' as const, label: 'City Dashboard', icon: Map },
    { key: 'users' as const, label: 'User Management', icon: Users },
    { key: 'sla' as const, label: 'SLA Rules', icon: Settings },
    { key: 'audit' as const, label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-6 h-6 text-accent-400" />
            <h1 className="text-2xl font-bold text-white">Super Admin Control Room</h1>
          </div>
          <p className="text-sm text-white/40">Full system visibility — {user?.region || 'Delhi NCR'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-white/5 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-accent-500/15 text-white border border-accent-500/20' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <StatsCards data={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DepartmentChart data={deptData} />
            <EscalationChart data={escData} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[400px]">
              <CityMap complaints={complaints} />
            </div>
            <div className="h-[400px] overflow-auto">
              <ComplaintTable complaints={complaints.filter((c) => c.status === 'ESCALATED')} />
            </div>
          </div>
          <OfficerList officers={officers} />
        </div>
      )}

      {/* User Management Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {users.map((u: any, i: number) => (
              <motion.div key={u._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    u.role === 'SUPER_ADMIN' ? 'bg-accent-500/20' : u.role === 'ADMIN' ? 'bg-primary-500/20' : 'bg-success-500/20'
                  }`}>
                    {u.role === 'SUPER_ADMIN' ? <Shield className="w-5 h-5 text-accent-400" /> :
                     u.role === 'ADMIN' ? <Users className="w-5 h-5 text-primary-400" /> :
                     <Activity className="w-5 h-5 text-success-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-[10px] text-white/40">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`badge ${
                    u.role === 'SUPER_ADMIN' ? 'bg-accent-500/20 text-accent-400' :
                    u.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' :
                    'bg-success-500/20 text-success-400'
                  }`}>{u.role}</span>
                  <span className="text-white/30">{u.department || 'No department'}</span>
                  <span className={`w-2 h-2 rounded-full ${u.isActive !== false ? 'bg-success-400' : 'bg-danger-400'}`} />
                </div>
              </motion.div>
            ))}
            {users.length === 0 && (
              <div className="col-span-full py-12 text-center text-white/20">No users found.</div>
            )}
          </div>
        </div>
      )}

      {/* SLA Rules Tab */}
      {tab === 'sla' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slaConfigs.map((sla: any, i: number) => (
              <motion.div key={sla._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{sla.category}</p>
                    <p className="text-[10px] text-white/40">{sla.department}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${sla.autoEscalate ? 'bg-success-500/20 text-success-400' : 'bg-danger-500/20 text-danger-400'}`}>
                    {sla.autoEscalate ? 'Auto-Escalate ON' : 'Manual'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-danger-500/5 border border-danger-500/10">
                    <p className="text-lg font-bold text-danger-400">{sla.priorityHigh}h</p>
                    <p className="text-[9px] text-white/40">HIGH</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-warning-500/5 border border-warning-500/10">
                    <p className="text-lg font-bold text-warning-400">{sla.priorityMedium}h</p>
                    <p className="text-[9px] text-white/40">MEDIUM</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-success-500/5 border border-success-500/10">
                    <p className="text-lg font-bold text-success-400">{sla.priorityLow}h</p>
                    <p className="text-[9px] text-white/40">LOW</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/20 mt-3">Escalation Levels: {sla.escalationLevels}</p>
              </motion.div>
            ))}
            {slaConfigs.length === 0 && (
              <div className="col-span-full py-12 text-center text-white/20">No SLA rules defined.</div>
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {tab === 'audit' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Time', 'Action', 'By', 'Role', 'Target', 'Details'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log: any, i: number) => (
                  <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-[11px] text-white/40 font-mono">
                      {new Date(log.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-primary-400">{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">{log.performedByName}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${
                        log.role === 'SUPER_ADMIN' ? 'bg-accent-500/20 text-accent-400' :
                        log.role === 'ADMIN' ? 'bg-primary-500/20 text-primary-400' :
                        'bg-white/5 text-white/40'
                      }`}>{log.role}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{log.targetType}</td>
                    <td className="px-4 py-3 text-[11px] text-white/50 max-w-[200px] truncate">{log.details}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {auditLogs.length === 0 && (
              <div className="py-12 text-center text-white/20">No logs available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
