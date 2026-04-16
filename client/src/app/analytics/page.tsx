'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Activity, Map } from 'lucide-react';
import DepartmentChart from '@/components/analytics/DepartmentChart';
import ResolutionTimeChart from '@/components/analytics/ResolutionTimeChart';
import EscalationChart from '@/components/analytics/EscalationChart';
import ComplaintHeatmap from '@/components/analytics/ComplaintHeatmap';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [resolutionData, setResolutionData] = useState<any>(null);
  const [escalationData, setEscalationData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [dept, res, esc, heat, sum] = await Promise.all([
        api.getDepartmentStats(),
        api.getResolutionStats(),
        api.getEscalationStats(),
        api.getHeatmap(),
        api.getSummary(),
      ]);
      if (dept.success) setDepartmentData(dept.data as any[]);
      if (res.success) setResolutionData(res.data);
      if (esc.success) setEscalationData(esc.data);
      if (heat.success) setHeatmapData(heat.data as any[]);
      if (sum.success) setSummary(sum.data);
    };
    fetchAll();
  }, []);

  const quickStats = [
    { label: 'Total Analyzed', value: summary?.total || 0, icon: BarChart3, color: 'text-primary-400' },
    { label: 'Avg Resolution', value: `${resolutionData?.averageResolutionHours || 0}h`, icon: TrendingUp, color: 'text-success-400' },
    { label: 'Escalation Rate', value: `${escalationData?.rate || 0}%`, icon: Activity, color: 'text-danger-400' },
    { label: 'Active Zones', value: heatmapData?.length || 0, icon: Map, color: 'text-accent-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics & Intelligence</h1>
        <p className="text-sm text-white/40 mt-1">
          Deep insights into complaint patterns, resolution efficiency, and departmental performance
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-white/40">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DepartmentChart data={departmentData} />
        <ResolutionTimeChart data={resolutionData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EscalationChart data={escalationData} />
        <div className="lg:col-span-2">
          <ComplaintHeatmap data={heatmapData} />
        </div>
      </div>
    </div>
  );
}
