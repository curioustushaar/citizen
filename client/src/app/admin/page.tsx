'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText } from 'lucide-react';
import OfficerList from '@/components/admin/OfficerList';
import ComplaintTable from '@/components/admin/ComplaintTable';
import { api } from '@/lib/api';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'officers' | 'complaints'>('officers');
  const [officers, setOfficers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [offRes, compRes] = await Promise.all([
        api.getOfficers(),
        api.getComplaints('limit=100'),
      ]);
      if (offRes.success) setOfficers(offRes.data as any[]);
      if (compRes.success) setComplaints(compRes.data as any[]);
    };
    fetchData();

    // Listen for crisis events
    const handler = () => fetchData();
    window.addEventListener('crisis-simulated', handler);
    return () => window.removeEventListener('crisis-simulated', handler);
  }, []);

  const tabs = [
    { key: 'officers' as const, label: 'Officers', icon: Users, count: officers.length },
    { key: 'complaints' as const, label: 'Complaints', icon: FileText, count: complaints.length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-400" />
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-sm text-white/40">
            Officer management and complaint oversight
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary-500/15 text-white border border-primary-500/20'
                  : 'text-white/40 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${
                  activeTab === tab.key
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'officers' ? (
          <OfficerList officers={officers} />
        ) : (
          <ComplaintTable complaints={complaints} />
        )}
      </motion.div>
    </div>
  );
}
