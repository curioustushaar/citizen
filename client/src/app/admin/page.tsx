'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, PlusCircle, Activity, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';
import OfficerList from '@/components/admin/OfficerList';
import ComplaintTable from '@/components/admin/ComplaintTable';
import { api } from '@/lib/api';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'officers' | 'complaints' | 'team' | 'settings'>('officers');
  const [officers, setOfficers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [deptInfo, setDeptInfo] = useState<any>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<any>({ name: '', email: '', password: '', rank: '', level: 1 });
  const [editDept, setEditDept] = useState<any>({ categories: '', hierarchy: '' });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name?.trim()) return toast.error('Name is required');
    if (!/^[a-zA-Z\s.]+$/.test(newMember.name)) return toast.error('Name should only contain letters');
    if (!newMember.email?.trim()) return toast.error('Email is required');
    if (!newMember.password || newMember.password.length < 6) return toast.error('Password must be 6+ characters');

    const res = await api.createUser({
      ...newMember,
      role: 'ADMIN',
      department: user?.department,
    });
    if (res.success) {
      toast.success('Team member created!');
      setShowAddMember(false);
      setNewMember({ name: '', email: '', password: '', rank: '', level: 1 });
      const usrRes = await api.getUsers();
      if (usrRes.success) setTeamMembers(usrRes.data as any[]);
    } else {
      toast.error(res.message || res.error || 'Error creating member');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [offRes, compRes, usrRes, dptRes] = await Promise.all([
        api.getOfficers(),
        api.getComplaints('limit=100'),
        api.getUsers(),
        api.getDepartments(),
      ]);
      if (offRes.success) setOfficers(offRes.data as any[]);
      if (compRes.success) setComplaints(compRes.data as any[]);
      if (usrRes.success) setTeamMembers(usrRes.data as any[]);
      
      if (dptRes.success) {
        const myDept = (dptRes.data as any[]).find(d => d.name === user?.department);
        if (myDept) {
          setDeptInfo(myDept);
          setEditDept({
            categories: myDept.categories.join(', '),
            hierarchy: myDept.hierarchy.map((h: any) => `${h.name}:${h.level}`).join('\n')
          });
        }
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptInfo) return;

    const cats = editDept.categories.split(',').map((s: string) => s.trim()).filter(Boolean);
    const hiers = editDept.hierarchy.split('\n').filter((l: string) => l.includes(':')).map((l: string) => {
      const [n, v] = l.split(':');
      return { name: n.trim(), level: parseInt(v.trim()) || 1 };
    });

    const res = await api.updateDepartment(deptInfo._id, {
      categories: cats,
      hierarchy: hiers,
    });

    if (res.success) {
      toast.success('Department updated!');
      setDeptInfo(res.data);
    } else {
      toast.error(res.message || 'Update failed');
    }
  };

  const tabs = [
    { key: 'officers' as const, label: 'All Officers', icon: Users, count: officers.length },
    { key: 'complaints' as const, label: 'Complaints', icon: FileText, count: complaints.length },
    { key: 'team' as const, label: 'My Team', icon: Shield, count: teamMembers.length },
    { key: 'settings' as const, label: 'Dept Structure', icon: Building2, count: 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-400" />
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Admin Control Room</h1>
          </div>
          <p className="text-sm text-white/40">
            {user?.department || 'Department'} Management Panel
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap border-b border-white/5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary-500/15 text-white border border-primary-500/20 shadow-lg shadow-primary-500/5'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.key !== 'settings' && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                    activeTab === tab.key
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'bg-white/5 text-white/30'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[60vh]">
        {activeTab === 'officers' ? (
          <OfficerList officers={officers} />
        ) : activeTab === 'complaints' ? (
          <ComplaintTable complaints={complaints} />
        ) : activeTab === 'team' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
              <h2 className="text-xl font-bold text-white">Department Team</h2>
              <button onClick={() => setShowAddMember(true)} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
                <PlusCircle className="w-4 h-4" /> Add Team Member
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {teamMembers.map((u: any, i: number) => (
                <motion.div key={u._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 hover:border-primary-500/30 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 group-hover:bg-primary-500/20 flex items-center justify-center transition-colors">
                      <Users className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{u.name}</p>
                      <p className="text-[10px] text-white/40 truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider bg-primary-500/5 px-2 py-0.5 rounded-lg border border-primary-500/10">ADMIN</span>
                    <div className="flex items-center gap-2">
                       <span className="text-white/30 text-[10px] uppercase font-medium">{u.rank || 'OFFICER'}</span>
                       <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-success-400' : 'bg-danger-400'} shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card p-4 sm:p-6 border-l-4 border-primary-500">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Configure {user?.department}</h2>
              <p className="text-sm text-white/40 mb-6">Define your department's officer ranks and grievance categories.</p>
              
              <form onSubmit={handleUpdateDept} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Grievance Categories (comma separated)</label>
                  <textarea 
                    value={editDept.categories || ''} 
                    onChange={(e) => setEditDept({...editDept, categories: e.target.value})} 
                    className="input-field min-h-[80px] text-sm" 
                    placeholder="e.g. Cyber Bullying, Online Fraud, Document Theft"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Hierarchy (Rank:Level - one per line)</label>
                  <textarea 
                    value={editDept.hierarchy || ''} 
                    onChange={(e) => setEditDept({...editDept, hierarchy: e.target.value})} 
                    className="input-field min-h-[150px] font-mono text-sm" 
                    placeholder="Inspector:8&#10;SI:6&#10;Constable:1"
                  />
                  <p className="text-[10px] text-white/20 mt-2 italic px-1">Level 1 is entry-level, Level 8 is department head.</p>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button type="submit" className="btn-primary px-8 w-full sm:w-auto shadow-xl shadow-primary-500/20">Save Structure</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
            className="glass-card w-full max-w-lg p-5 sm:p-6 my-auto shadow-2xl border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary-400" />
              Add New Officer
            </h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Full Name</label>
                  <input type="text" value={newMember.name || ''} onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[a-zA-Z\s.]+$/.test(val)) {
                      setNewMember({...newMember, name: val});
                    }
                  }} className="input-field text-sm" placeholder="e.g. Rahul Singh" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Email (Official)</label>
                  <input type="email" value={newMember.email || ''} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="input-field text-sm" placeholder="r.singh@govt.in" required />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Set Password</label>
                <input type="password" value={newMember.password || ''} onChange={(e) => setNewMember({...newMember, password: e.target.value})} className="input-field text-sm" placeholder="••••••••" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Rank (Designation)</label>
                  <input type="text" value={newMember.rank || ''} onChange={(e) => setNewMember({...newMember, rank: e.target.value})} className="input-field text-sm" placeholder="e.g. Sub-Inspector" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Clearance Level (1-8)</label>
                  <input type="number" value={newMember.level || 1} onChange={(e) => setNewMember({...newMember, level: parseInt(e.target.value)})} className="input-field text-sm" min="1" max="8" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => setShowAddMember(false)} 
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button type="submit" className="w-full sm:flex-1 btn-primary text-sm shadow-xl shadow-primary-500/20">Create Secure Account</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
