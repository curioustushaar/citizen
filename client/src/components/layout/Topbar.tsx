'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, AlertTriangle, User, ChevronDown, LogIn, LogOut, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
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
    PUBLIC: 'from-success-500 to-success-600',
    ADMIN: 'from-primary-500 to-primary-600',
    SUPER_ADMIN: 'from-accent-500 to-accent-600',
  };

  const roleLabels: Record<string, string> = {
    PUBLIC: 'Citizen',
    ADMIN: 'Officer',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-surface-900/60 backdrop-blur-xl">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search complaints, areas, officers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-800/60 border border-white/5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-white/20 bg-surface-700 rounded border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
              {notifications}
            </span>
          )}
        </button>

        {/* User / Login */}
        <div className="relative flex items-center gap-2 pl-3 border-l border-white/10">
          
        </div>
      </div>
    </header>
  );
}
