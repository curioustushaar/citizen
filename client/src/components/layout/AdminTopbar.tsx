'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, Menu, AlertTriangle, LogIn } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import AdminThemeToggle from './AdminThemeToggle';
import toast from 'react-hot-toast';

interface TopbarProps {
  onMenuToggle: () => void;
}

function getLoginPath(pathname: string) {
  if (pathname.startsWith('/superadmin')) return '/superadmin/login';
  return '/admin/login';
}

export default function AdminTopbar({ onMenuToggle }: TopbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications] = useState(3);
  const [crisisLoading, setCrisisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSimulateCrisis = async () => {
    setCrisisLoading(true);
    try {
      const res: any = await api.simulateCrisis();
      if (res.success) {
        toast.success(res.message || 'Crisis simulated!', { icon: '🚨', duration: 5000 });
        window.dispatchEvent(new CustomEvent('crisis-simulated'));
      } else {
        toast.error('Failed to simulate crisis');
      }
    } catch {
      toast.error('Error simulating crisis');
    } finally {
      setCrisisLoading(false);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-200/70 premium-topbar dark:border-white/[0.06]">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/25" />
          <input
            type="text"
            placeholder="Search complaints, areas, officers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-100/80 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all duration-200 dark:text-white dark:placeholder-white/25 dark:bg-slate-900/60 dark:border-white/10 dark:focus:border-cyan-400/40"
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-slate-400 rounded border border-slate-200/70 bg-white/70 dark:text-white/20 dark:border-white/[0.08] dark:bg-slate-900/80"
          >
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AdminThemeToggle />

        <button
          onClick={handleSimulateCrisis}
          disabled={crisisLoading}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: '#fb7185',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.15)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 63, 94, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <AlertTriangle className={`w-4 h-4 ${crisisLoading ? 'animate-spin' : 'animate-pulse'}`} />
          {crisisLoading ? 'Simulating...' : 'Simulate Crisis'}
        </button>

        <button className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)',
                animation: 'pulseRing 2s ease-in-out infinite',
              }}
            >
              {notifications}
            </span>
          )}
        </button>

        {!user && (
          <button
            onClick={() => router.push(getLoginPath(pathname))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              color: '#22d3ee',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden md:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
