'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, AlertTriangle, User, ChevronDown, LogIn, LogOut, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications] = useState(3);
  const [crisisLoading, setCrisisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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

  const roleColors: Record<string, string> = {
    PUBLIC: 'from-emerald-500 to-teal-600',
    ADMIN: 'from-cyan-500 to-blue-600',
    SUPER_ADMIN: 'from-violet-500 to-purple-600',
  };

  const roleLabels: Record<string, string> = {
    PUBLIC: 'Citizen',
    ADMIN: 'Officer',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.06] premium-topbar">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search complaints, areas, officers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder-white/25
                       focus:outline-none transition-all duration-200"
            style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.08)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-white/20 rounded border border-white/[0.08]"
               style={{ background: 'rgba(17, 24, 39, 0.8)' }}>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Simulate Crisis Button */}
        <button
          onClick={handleSimulateCrisis}
          disabled={crisisLoading}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-colors">
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

        {/* User / Login */}
        <div className="relative flex items-center gap-2 pl-3 border-l border-white/10">
          {!user && (
            <button
              onClick={() => router.push('/login')}
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
      </div>
    </header>
  );
}
