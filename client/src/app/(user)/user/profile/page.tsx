'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  Map, Hash, UserCircle, Calendar, 
  Settings, Save, Shield, Camera,
  ChevronRight, Info, Activity
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    gender: '',
    dob: '',
    bio: '',
    avatar: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || '',
        gender: user.gender || '',
        dob: user.dob || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Uploading photo...');
    try {
      const res = await api.uploadAvatar(file);
      if (res.success) {
        setFormData(prev => ({ ...prev, avatar: res.avatarUrl }));
        toast.success('Photo uploaded!', { id: loadingToast });
      } else {
        toast.error('Upload failed', { id: loadingToast });
      }
    } catch {
      toast.error('Error uploading photo', { id: loadingToast });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success) {
        toast.success('Profile updated successfully!');
        if (refreshUser) refreshUser();
      } else {
        toast.error(res.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    PUBLIC: 'from-emerald-500 to-teal-600',
    ADMIN: 'from-blue-500 to-indigo-600',
    SUPER_ADMIN: 'from-purple-500 to-pink-600',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-surface-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px]" />
        
        <div className="relative group">
          <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${roleColors[user?.role || 'PUBLIC']} flex items-center justify-center shadow-2xl shadow-primary-500/20 overflow-hidden border-4 border-white/5`}>
             {formData.avatar ? (
               <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
             ) : (
               <User className="w-16 h-16 text-white" />
             )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2.5 bg-surface-800 border border-white/10 rounded-xl text-primary-400 hover:text-primary-300 transition-all shadow-xl hover:scale-110 active:scale-95"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{formData.name}</h1>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${roleColors[user?.role || 'PUBLIC']}`}>
              {user?.role}
            </span>
          </div>
          <p className="text-white/40 text-sm flex items-center justify-center md:justify-start gap-2 italic">
            <Mail className="w-3 h-3" /> {formData.email}
          </p>
          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Shield className="w-3 h-3 text-emerald-400" />
                <p className="text-[10px] font-bold text-white/60">Verified Identity</p>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                <Activity className="w-3 h-3 text-blue-400" />
                <p className="text-[10px] font-bold text-white/60">Active Contributor</p>
             </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: Personal Info ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-primary-500" />
              Identity Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-white/10"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-white/10"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white/40 ml-1">Brief Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-white/10 resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>
            </div>
          </section>

          <section className="bg-surface-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Residential Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-white/40 ml-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                    placeholder="House No, Street, Locality"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">City</label>
                <div className="relative">
                  <Map className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                    placeholder="E.g. Delhi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                  placeholder="E.g. Delhi"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 ml-1">Zip Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full bg-surface-800/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                    placeholder="110001"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Column: Sidebar Stats/Settings ───────────────── */}
        <div className="space-y-8">
          <section className="bg-surface-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-600" />
            <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em] mb-8">Quick Actions</h3>
            
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-600/50 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 group"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Save Changes
                </>
              )}
            </button>

            <div className="mt-8 space-y-3">
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Account Security</p>
                    <p className="text-sm font-bold text-white">2FA Enabled</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
               </div>
               <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Privacy Level</p>
                    <p className="text-sm font-bold text-white">Standard</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
               </div>
            </div>
          </section>

          <section className="bg-surface-900/40 border border-white/5 p-8 rounded-[40px] backdrop-blur-xl">
             <div className="flex items-center gap-2 mb-8">
               <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
               <h3 className="text-sm font-black text-white/30 uppercase tracking-[0.2em]">Platform Stats</h3>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-sm font-bold text-white/60">Success Rate</p>
                   <p className="text-xl font-black text-emerald-400">98%</p>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[98%]" />
                </div>

                <div className="flex items-center justify-between">
                   <p className="text-sm font-bold text-white/60">Grievances Filed</p>
                   <p className="text-xl font-black text-blue-400">12</p>
                </div>
             </div>
          </section>

          <div className="bg-gradient-to-br from-indigo-600/20 to-primary-600/20 border border-primary-500/20 p-6 rounded-[32px] relative overflow-hidden group">
             <Info className="w-12 h-12 text-primary-500/20 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" />
             <p className="text-xs font-bold text-white relative z-10 leading-relaxed">
               Maintaining an updated profile helps us route your grievances to the correct zonal officers faster.
             </p>
          </div>
        </div>
      </form>
    </div>
  );
}
