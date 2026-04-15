'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Shield, Users, FileText, Settings, Activity, Map, BarChart3, AlertTriangle, Building2, PlusCircle, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [departments, setDepartments] = useState<any[]>([]);
  const [tab, setTab] = useState<'overview' | 'users' | 'sla' | 'audit' | 'departments'>('overview');
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newDept, setNewDept] = useState<any>({ name: '', type: 'Law Enforcement', location: '', jurisdictionLevel: 'City' });
  const [newUser, setNewUser] = useState<any>({ 
    name: '', email: '', password: '', role: 'ADMIN', department: '', 
    rank: '', level: 1, phone: '', employeeId: '', officeAddress: '',
    district: '', state: '', pincode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);

  const validateUser = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newUser.name?.trim()) newErrors.name = 'Name is required';
    else if (!/^[a-zA-Z\s.]+$/.test(newUser.name)) newErrors.name = 'Name should only contain letters';

    if (!newUser.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) newErrors.email = 'Invalid email format';

    if (!editingUserId && (!newUser.password || newUser.password.length < 6)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!newUser.phone?.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(newUser.phone)) newErrors.phone = 'Invalid Indian phone number (10 digits)';

    if (!newUser.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(newUser.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    if (!newUser.rank?.trim()) newErrors.rank = 'Designation is required';
    if (!newUser.employeeId?.trim()) newErrors.employeeId = 'Govt ID is required';
    if (!newUser.department) newErrors.department = 'Department is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUser()) return;

    const res = editingUserId 
      ? await api.updateUser(editingUserId, newUser)
      : await api.createUser(newUser);

    if (res.success) {
      toast.success(editingUserId ? 'Account Updated!' : 'Official Account Created!');
      setShowAddUser(false);
      setEditingUserId(null);
      setNewUser({ 
        name: '', email: '', password: '', role: 'ADMIN', department: '', 
        rank: '', level: 1, phone: '', employeeId: '', officeAddress: '',
        district: '', state: '', pincode: ''
      });
      setErrors({});
      const usrRes = await api.getUsers();
      if (usrRes.success) setUsers(usrRes.data as any[]);
    } else {
      toast.error(res.message || res.error || 'Action failed');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this official?')) return;
    const res = await api.deleteUser(id);
    if (res.success) {
      toast.success('Official removed');
      const usrRes = await api.getUsers();
      if (usrRes.success) setUsers(usrRes.data as any[]);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!window.confirm('Delete this department?')) return;
    const res = await api.deleteDepartment(id);
    if (res.success) {
      toast.success('Department removed');
      const dptRes = await api.getDepartments();
      if (dptRes.success) setDepartments(dptRes.data as any[]);
    }
  };

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
        const [usrRes, slaRes, audRes, dptRes] = await Promise.all([
          api.getUsers(),
          api.getSLAConfigs(),
          api.getAuditLogs(),
          api.getDepartments(),
        ]);
        if (usrRes.success) setUsers(usrRes.data as any[]);
        if (slaRes.success) setSlaConfigs(slaRes.data as any[]);
        if (audRes.success) setAuditLogs(audRes.data as any[]);
        if (dptRes.success) setDepartments(dptRes.data as any[]);
      } catch {}
    };
    fetchAll();

    const handler = () => fetchAll();
    window.addEventListener('crisis-simulated', handler);
    return () => window.removeEventListener('crisis-simulated', handler);
  }, []);

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name?.trim()) return toast.error('Department name is required');
    if (!/^[a-zA-Z\s&-.]+$/.test(newDept.name)) return toast.error('Department name contains invalid characters');
    if (!newDept.location?.trim()) return toast.error('Location is required');
    if (!/^[a-zA-Z\s,]+$/.test(newDept.location)) return toast.error('Location contains invalid characters');

    try {
      // Auto-assign icons based on department type
      const typeIcons: {[key: string]: string} = {
        'Law Enforcement': '⚖️',
        'Municipal / Nagar Nigam': '🏛️',
        'Electricity': '⚡',
        'Water Supply': '💧',
        'Public Works (PWD)': '🏗️',
        'Cyber / Digital': '🛡️',
        'Health': '🏥',
        'Education': '🎓',
        'Transport': '🚌',
        'Revenue / Govt Office': '🏢',
        'Anti-Corruption': '🕵️',
        'Social Welfare': '🤝'
      };

      const deptData = {
        ...newDept,
        icon: typeIcons[newDept.type] || '🏢',
      };

      const res = editingDeptId 
        ? await api.updateDepartment(editingDeptId, deptData)
        : await api.createDepartment({ ...deptData, categories: [], hierarchy: [] });

      if (res.success) {
        toast.success(editingDeptId ? 'Department Updated!' : 'Department Onboarded!');
        setShowAddDept(false);
        setEditingDeptId(null);
        setNewDept({ name: '', type: 'Law Enforcement', location: '', jurisdictionLevel: 'City' });
        const dptRes = await api.getDepartments();
        if (dptRes.success) setDepartments(dptRes.data as any[]);
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (err) {
      toast.error('System error processing department');
    }
  };

  const startEditUser = (u: any) => {
    setNewUser({ 
      ...u, 
      password: '',
      district: u.district || '',
      state: u.state || '',
      pincode: u.pincode || ''
    }); 
    setEditingUserId(u._id);
    setShowAddUser(true);
  };

  const startEditDept = (d: any) => {
    setNewDept({ name: d.name, type: d.type, location: d.location, jurisdictionLevel: d.jurisdictionLevel });
    setEditingDeptId(d._id);
    setShowAddDept(true);
  };

  const tabs = [
    { key: 'overview' as const, label: 'City Dashboard', icon: Map },
    { key: 'departments' as const, label: 'Manage Depts', icon: Building2 },
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
            <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Superadmin Strategic Command</h1>
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
          <OfficerList officers={officers} />
        </div>
      )}

      {/* Departments Tab */}
      {tab === 'departments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Department Management</h2>
            <button onClick={() => setShowAddDept(true)} className="btn-primary flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {departments.map((d, i) => (
              <motion.div key={d._id || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-5 relative overflow-hidden group border-l-4 border-primary-500">
                <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditDept(d)} className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteDept(d._id)} className="p-1.5 rounded-lg bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-2xl">
                    {d.icon || '🏢'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{d.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-primary-400 font-bold uppercase">{d.type || 'Law'}</span>
                      <span className="text-white/20">•</span>
                      <p className="text-[10px] text-white/40 font-medium">📍 {d.location}</p>
                    </div>
                  </div>
                </div>

                {/* Performance HUD */}
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-3">Department Head Performance</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(() => {
                      const stats = deptData.find(s => s.department === d.name) || { total: 0, pending: 0, resolved: 0, performance: 0 };
                      return (
                        <>
                          <div className="bg-white/[0.02] rounded-lg p-2 border border-white/[0.03]">
                            <p className="text-[9px] text-white/30 uppercase mb-0.5">Total</p>
                            <p className="text-sm font-bold text-white">{stats.total}</p>
                          </div>
                          <div className="bg-danger-500/5 rounded-lg p-2 border border-danger-500/10">
                            <p className="text-[9px] text-danger-400/60 uppercase mb-0.5">Pending</p>
                            <p className="text-sm font-bold text-danger-400">{stats.pending}</p>
                          </div>
                          <div className="bg-success-500/5 rounded-lg p-2 border border-success-500/10">
                            <p className="text-[9px] text-success-400/60 uppercase mb-0.5">Resolved</p>
                            <p className="text-sm font-bold text-success-400">{stats.resolved}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-bold mb-1">Jurisdiction</p>
                    <p className="text-xs text-white/60">{d.jurisdictionLevel || 'City'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-bold mb-1">Efficiency Score</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-accent-500 h-full" style={{ width: `${deptData.find(s => s.department === d.name)?.performance || 0}%` }} />
                      </div>
                      <p className="text-[10px] text-accent-400 font-bold">{deptData.find(s => s.department === d.name)?.performance || 0}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {showAddDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
            className="glass-card w-full max-w-2xl p-4 sm:p-6 my-auto mt-20 sm:mt-0 shadow-2xl border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-400" />
              {editingDeptId ? 'Edit Department Profile' : 'Onboard New Department'}
            </h2>
            <form onSubmit={handleSaveDept} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Department Name</label>
                  <input type="text" value={newDept.name || ''} onChange={(e) => setNewDept({...newDept, name: e.target.value})} className="input-field" placeholder="e.g. Delhi Police" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Department Type</label>
                  <select 
                    value={['Law Enforcement', 'Municipal / Nagar Nigam', 'Electricity', 'Water Supply', 'Public Works (PWD)', 
                            'Cyber / Digital', 'Health', 'Education', 'Transport', 'Revenue / Govt Office', 
                            'Anti-Corruption', 'Social Welfare'].includes(newDept.type) ? newDept.type : 'Other'} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Other') {
                        setNewDept({...newDept, type: ''});
                      } else {
                        setNewDept({...newDept, type: val});
                      }
                    }} 
                    className="input-field mb-2"
                  >
                    <option value="Law Enforcement">⚖️ Law Enforcement</option>
                    <option value="Municipal / Nagar Nigam">🏛️ Municipal / Nagar Nigam</option>
                    <option value="Electricity">⚡ Electricity</option>
                    <option value="Water Supply">💧 Water Supply</option>
                    <option value="Public Works (PWD)">🏗️ Public Works (PWD)</option>
                    <option value="Cyber / Digital">🛡️ Cyber / Digital</option>
                    <option value="Health">🏥 Health</option>
                    <option value="Education">🎓 Education</option>
                    <option value="Transport">🚌 Transport</option>
                    <option value="Revenue / Govt Office">🏢 Revenue / Govt Office</option>
                    <option value="Anti-Corruption">🕵️ Anti-Corruption</option>
                    <option value="Social Welfare">🤝 Social Welfare</option>
                    <option value="Other">➕ Other (Manual Entry)</option>
                  </select>
                  
                  {!['Law Enforcement', 'Municipal / Nagar Nigam', 'Electricity', 'Water Supply', 'Public Works (PWD)', 
                     'Cyber / Digital', 'Health', 'Education', 'Transport', 'Revenue / Govt Office', 
                     'Anti-Corruption', 'Social Welfare'].includes(newDept.type) && (
                    <motion.input 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      type="text" value={newDept.type || ''} onChange={(e) => setNewDept({...newDept, type: e.target.value})} 
                      className="input-field border-primary-500/50" placeholder="Type Category..." autoFocus
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Location (State/City)</label>
                  <input type="text" value={newDept.location || ''} onChange={(e) => setNewDept({...newDept, location: e.target.value})} className="input-field" placeholder="e.g. Delhi" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Jurisdiction Level</label>
                  <select value={newDept.jurisdictionLevel || 'City'} onChange={(e) => setNewDept({...newDept, jurisdictionLevel: e.target.value})} className="input-field">
                    <option value="State">State Level</option>
                    <option value="District">District Level</option>
                    <option value="City">City Level</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                <button type="button" onClick={() => { setShowAddDept(false); setEditingDeptId(null); }} 
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button type="submit" className="w-full sm:flex-1 btn-primary text-sm">
                   {editingDeptId ? 'Update Department' : 'Submit Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* User Management Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold text-white">System Users</h2>
            <button onClick={() => { setShowAddUser(true); setEditingUserId(null); setNewUser({ name: '', email: '', rank: '', phone: '', employeeId: '', password: '', department: '', level: 1, officeAddress: '' }); }} className="btn-primary flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(users.length > 0 ? users : []).map((u: any, i: number) => (
              <motion.div key={u._id || i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4 relative group">
                <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditUser(u)} className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 rounded-lg bg-danger-500/10 text-danger-400 hover:bg-danger-500/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                    <p className="text-[10px] text-white/40 truncate max-w-[120px]">{u.email}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/30 font-bold uppercase tracking-wider">{u.role}</span>
                    <span className="text-white/60 font-medium truncate max-w-[100px]">{u.department || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent-400 font-mono">{u.employeeId || 'ID-AUTH'}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-success-400' : 'bg-danger-400'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
            className="glass-card w-full max-w-2xl p-4 sm:p-6 my-auto mt-20 sm:mt-0 shadow-2xl border-white/10">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-400" />
              {editingUserId ? 'Edit Official Credentials' : 'Register New Official / Head'}
            </h2>
            <form onSubmit={handleSaveUser} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Head Name</label>
                  <input type="text" value={newUser.name || ''} onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^[a-zA-Z\s.]+$/.test(val)) {
                      setNewUser({...newUser, name: val});
                      setErrors({...errors, name: ''});
                    }
                  }} className={`input-field ${errors.name ? 'border-danger-500/50' : ''}`} placeholder="e.g. Ankit Kumar" required />
                  {errors.name && <p className="text-[10px] text-danger-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Designation</label>
                  <input type="text" value={newUser.rank || ''} onChange={(e) => setNewUser({...newUser, rank: e.target.value})} className="input-field" placeholder="e.g. SP / Commissioner" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Official Email</label>
                  <input type="email" value={newUser.email || ''} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="input-field" placeholder="login@govt.in" required />
                  {errors.email && <p className="text-[10px] text-danger-400 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Official Phone</label>
                  <input type="tel" value={newUser.phone || ''} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewUser({...newUser, phone: val});
                    if (val.length === 10) setErrors({...errors, phone: ''});
                  }} className="input-field" placeholder="10-digit number" required />
                  {errors.phone && <p className="text-[10px] text-danger-400 mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Employee ID / Govt ID</label>
                  <input type="text" value={newUser.employeeId || ''} onChange={(e) => setNewUser({...newUser, employeeId: e.target.value})} className="input-field" placeholder="e.g. POL-8829" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1 truncate">
                    {editingUserId ? 'Change Password (Optional)' : 'Set Password'}
                  </label>
                  <input 
                    type="password" 
                    value={newUser.password || ''} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    className="input-field" 
                    placeholder="••••••••" 
                    required={!editingUserId} 
                  />
                  {errors.password && <p className="text-[10px] text-danger-400 mt-1">{errors.password}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Jurisdiction Dept</label>
                  <select value={newUser.department || ''} onChange={(e) => setNewUser({...newUser, department: e.target.value})} className="input-field" required>
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Clearance Level (1-8)</label>
                  <input type="number" min={1} max={8} value={newUser.level || 1} onChange={(e) => setNewUser({...newUser, level: parseInt(e.target.value)})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">State</label>
                  <input type="text" value={newUser.state || ''} onChange={(e) => setNewUser({...newUser, state: e.target.value})} className="input-field" placeholder="e.g. Delhi" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">District</label>
                  <input type="text" value={newUser.district || ''} onChange={(e) => setNewUser({...newUser, district: e.target.value})} className="input-field" placeholder="e.g. New Delhi" required />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Pincode</label>
                  <input type="text" value={newUser.pincode || ''} onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setNewUser({...newUser, pincode: val});
                  }} className="input-field" placeholder="6-digits" required />
                  {errors.pincode && <p className="text-[10px] text-danger-400 mt-1">{errors.pincode}</p>}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-white/40 uppercase mb-1">Office Address</label>
                <textarea value={newUser.officeAddress || ''} onChange={(e) => setNewUser({...newUser, officeAddress: e.target.value})} className="input-field h-20 resize-none" placeholder="Full address" required />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                <button type="button" onClick={() => { setShowAddUser(false); setEditingUserId(null); setErrors({}); }} 
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all text-sm">Cancel</button>
                <button type="submit" className="w-full sm:flex-1 btn-primary text-sm shadow-xl shadow-primary-500/20">
                  {editingUserId ? 'Update Official' : 'Create Account'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* SLA Rules Tab */}
      {tab === 'sla' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(slaConfigs.length > 0 ? slaConfigs : dummySLA).map((sla: any, i: number) => (
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
                {(auditLogs.length > 0 ? auditLogs : dummyAudit).map((log: any, i: number) => (
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
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback dummy data for frontend-only mode
const dummyUsers = [
  { _id: '1', name: 'Aarav Citizen', email: 'citizen@demo.com', role: 'PUBLIC', department: null, isActive: true },
  { _id: '2', name: 'Rohit Kumar', email: 'rohit@demo.com', role: 'PUBLIC', department: null, isActive: true },
  { _id: '3', name: 'Rajesh Kumar', email: 'admin@trafficpolice.gov.in', role: 'ADMIN', department: 'Delhi Traffic Police', isActive: true },
  { _id: '4', name: 'Priya Sharma', email: 'admin@jalboard.gov.in', role: 'ADMIN', department: 'Delhi Jal Board', isActive: true },
  { _id: '5', name: 'Amit Singh', email: 'admin@bses.gov.in', role: 'ADMIN', department: 'BSES / TPDDL', isActive: true },
  { _id: '6', name: 'Sunita Gupta', email: 'admin@mcd.gov.in', role: 'ADMIN', department: 'Municipal Corporation of Delhi', isActive: true },
  { _id: '7', name: 'Commissioner Singh', email: 'superadmin@delhi.gov.in', role: 'SUPER_ADMIN', department: null, isActive: true },
  { _id: '8', name: 'Secretary Verma', email: 'secretary@delhi.gov.in', role: 'SUPER_ADMIN', department: null, isActive: true },
];

const dummySLA = [
  { _id: '1', category: 'Traffic & Transport', department: 'Delhi Traffic Police', priorityHigh: 2, priorityMedium: 12, priorityLow: 48, autoEscalate: true, escalationLevels: 3 },
  { _id: '2', category: 'Water Supply', department: 'Delhi Jal Board', priorityHigh: 4, priorityMedium: 24, priorityLow: 72, autoEscalate: true, escalationLevels: 3 },
  { _id: '3', category: 'Electricity', department: 'BSES / TPDDL', priorityHigh: 3, priorityMedium: 18, priorityLow: 60, autoEscalate: true, escalationLevels: 3 },
  { _id: '4', category: 'Sanitation', department: 'Municipal Corporation of Delhi', priorityHigh: 6, priorityMedium: 24, priorityLow: 72, autoEscalate: true, escalationLevels: 3 },
  { _id: '5', category: 'Road & Infrastructure', department: 'Public Works Department', priorityHigh: 4, priorityMedium: 24, priorityLow: 96, autoEscalate: true, escalationLevels: 3 },
  { _id: '6', category: 'Public Safety', department: 'Delhi Police', priorityHigh: 1, priorityMedium: 8, priorityLow: 48, autoEscalate: true, escalationLevels: 3 },
];

const dummyAudit = [
  { createdAt: new Date(Date.now() - 5 * 60 * 1000), action: 'CREATE_COMPLAINT', performedByName: 'Aarav Citizen', role: 'PUBLIC', targetType: 'complaint', details: 'New HIGH complaint: Traffic at Laxmi Nagar' },
  { createdAt: new Date(Date.now() - 15 * 60 * 1000), action: 'UPDATE_STATUS', performedByName: 'Rajesh Kumar', role: 'ADMIN', targetType: 'complaint', details: 'Status → IN_PROGRESS' },
  { createdAt: new Date(Date.now() - 30 * 60 * 1000), action: 'REASSIGN', performedByName: 'Priya Sharma', role: 'ADMIN', targetType: 'complaint', details: 'Reassigned to Meera Joshi' },
  { createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), action: 'UPDATE_SLA', performedByName: 'Commissioner Singh', role: 'SUPER_ADMIN', targetType: 'sla', details: 'Updated SLA for Traffic: HIGH=2h' },
  { createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), action: 'CREATE_USER', performedByName: 'Commissioner Singh', role: 'SUPER_ADMIN', targetType: 'user', details: 'Created ADMIN: Deepak Verma' },
  { createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), action: 'LOGIN', performedByName: 'Aarav Citizen', role: 'PUBLIC', targetType: 'auth', details: 'Aarav Citizen logged in' },
  { createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), action: 'RESOLVE_COMPLAINT', performedByName: 'Amit Singh', role: 'ADMIN', targetType: 'complaint', details: 'Resolved electricity outage at Rohini' },
  { createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), action: 'SYSTEM_SEED', performedByName: 'System', role: 'SYSTEM', targetType: 'system', details: 'Database seeded with demo data' },
];
