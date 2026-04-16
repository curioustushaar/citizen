'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Users, FileText, Clock, Shield, Settings, BarChart3, Building2 } from 'lucide-react';
import OfficerList from '@/components/admin/OfficerList';
import ComplaintTable from '@/components/admin/ComplaintTable';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [tab, setTab] = useState<'assigned' | 'all' | 'officers'>('assigned');

  useEffect(() => {
    const fetchData = async () => {
      const [compRes, offRes] = await Promise.all([
        api.getComplaints('limit=200'),
        api.getOfficers(),
      ]);
      if (compRes.success) setComplaints(compRes.data as any[]);
      if (offRes.success) setOfficers(offRes.data as any[]);
    };
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('crisis-simulated', handler);
    return () => window.removeEventListener('crisis-simulated', handler);
  }, []);

  const myComplaints = user?.department
    ? complaints.filter((c) => c.department === user.department)
    : complaints;

  const pending = myComplaints.filter((c) => c.status === 'PENDING').length;
  const inProgress = myComplaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = myComplaints.filter((c) => c.status === 'RESOLVED').length;
  const escalated = myComplaints.filter((c) => c.status === 'ESCALATED').length;
  const avgPerf = officers.length > 0
    ? Math.round(officers.reduce((s, o) => s + o.performance, 0) / officers.length)
    : 0;

  const stats = [
    { label: 'Assigned', value: myComplaints.length, icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-warning-400', bg: 'bg-warning-500/10' },
    { label: 'In Progress', value: inProgress, icon: Settings, color: 'text-accent-400', bg: 'bg-accent-500/10' },
    { label: 'Resolved', value: resolved, icon: BarChart3, color: 'text-success-400', bg: 'bg-success-500/10' },
    { label: 'Escalated', value: escalated, icon: Shield, color: 'text-danger-400', bg: 'bg-danger-500/10' },
    { label: 'Team Perf', value: `${avgPerf}%`, icon: Users, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  ];

  const tabs = [
    { key: 'assigned' as const, label: 'My Dept Complaints', icon: FileText, count: myComplaints.length },
    { key: 'all' as const, label: 'All Complaints', icon: Building2, count: complaints.length },
    { key: 'officers' as const, label: 'Officers', icon: Users, count: officers.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary-400" />
          <h1 className="text-2xl font-bold text-white">Officer Dashboard</h1>
        </div>
        <p className="text-sm text-white/40">
          {user?.department ? `${user.department} • ${user.region}` : 'Department Panel'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-3 text-center"
            >
              <div className={`inline-flex p-2 rounded-lg ${s.bg} ${s.color} mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/40">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2 border-b border-white/5 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-primary-500/15 text-white border border-primary-500/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                tab === t.key ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-white/30'
              }`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'assigned' && <ComplaintTable complaints={myComplaints} />}
        {tab === 'all' && <ComplaintTable complaints={complaints} />}
        {tab === 'officers' && <OfficerList officers={officers} />}
      </motion.div>
    </div>
  );
}
