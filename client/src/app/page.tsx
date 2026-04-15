'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import StatsCards from '@/components/dashboard/StatsCards';
import ComplaintFeed from '@/components/dashboard/ComplaintFeed';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Shield, LogIn } from 'lucide-react';

const CityMap = dynamic(() => import('@/components/dashboard/CityMap'), {
  ssr: false,
  loading: () => (
    <div className="glass-card h-full min-h-[400px] flex items-center justify-center">
      <div className="text-white/20 text-sm">Loading map...</div>
    </div>
  ),
});

interface StatsData {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  escalated: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    const [summaryRes, complaintsRes] = await Promise.all([
      api.getSummary(),
      api.getComplaints('limit=25'),
    ]);
    if (summaryRes.success) setStats(summaryRes.data as StatsData);
    if (complaintsRes.success) setComplaints(complaintsRes.data as any[]);
  }, []);

  useEffect(() => {
    fetchData();

    const handler = () => fetchData();
    window.addEventListener('crisis-simulated', handler);
    const interval = setInterval(fetchData, 10000);

    return () => {
      window.removeEventListener('crisis-simulated', handler);
      clearInterval(interval);
    };
  }, [fetchData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Command Center
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Real-time overview of Delhi NCR grievance intelligence
            {user && <span className="text-primary-400"> • Logged in as {user.name}</span>}
          </p>
        </div>
        {!user && (
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500/10 border border-primary-500/30 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/20 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login to Access More
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <StatsCards data={stats} />

      {/* Main Grid: Feed | Map | Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ minHeight: '500px' }}>
        {/* Left: Complaint Feed */}
        <div className="lg:col-span-3 h-[500px]">
          <ComplaintFeed complaints={complaints} />
        </div>

        {/* Center: Map */}
        <div className="lg:col-span-6 h-[500px]">
          <CityMap complaints={complaints} />
        </div>

        {/* Right: AI Insights */}
        <div className="lg:col-span-3 h-[500px]">
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  );
}
