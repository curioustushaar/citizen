'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, AlertTriangle, User, ChevronDown, LogIn, LogOut, Shield, Globe } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';
import toast from 'react-hot-toast';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout, language, setLanguage } = useAuth();
  const router = useRouter();
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [crisisLoading, setCrisisLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotificationList(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();

    // ── Real-time Notifications ──────────────────────────────────────
    const unSubCreated = onEvent('complaint_created', () => {
      fetchNotifications();
      toast('New grievance reported in your area', { icon: '📢', style: { border: '1px solid #3b82f6', background: '#0f172a', color: '#fff' } });
    });

    const unSubUpdated = onEvent('complaint_updated', (complaint) => {
      fetchNotifications();
      if (complaint.userId === user?.id) {
        toast.success(`Your complaint status updated: ${complaint.status}`, { icon: '✅' });
      }
    });

    return () => {
      unSubCreated();
      unSubUpdated();
    };
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotificationList(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const unreadCount = notificationList.filter(n => !n.isRead).length;

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
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-surface-900/60 backdrop-blur-xl sticky top-0 z-40">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          suppressHydrationWarning
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
            suppressHydrationWarning
            className="w-full pl-10 pr-4 py-2 bg-surface-800/60 border border-white/5 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div className="flex items-center bg-white/5 rounded-xl border border-white/5 p-1 mr-2 scale-90 sm:scale-100">
          <button
            onClick={() => setLanguage('en')}
            suppressHydrationWarning
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === 'en' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/40 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            suppressHydrationWarning
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${language === 'hi' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-white/40 hover:text-white'}`}
          >
            हिन्दी
          </button>
        </div>

        {user?.role === 'SUPER_ADMIN' && (
          <button
            onClick={handleSimulateCrisis}
            disabled={crisisLoading}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-danger-500/10 border border-danger-500/30 text-danger-400 rounded-xl text-sm font-medium hover:bg-danger-500/20 transition-all duration-200"
          >
            <AlertTriangle className={`w-4 h-4 ${crisisLoading ? 'animate-spin' : 'animate-pulse'}`} />
            Simulate Crisis
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            suppressHydrationWarning
            className={`relative p-2 rounded-xl transition-colors ${showNotifications ? 'bg-primary-500/10 text-primary-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse border-2 border-surface-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-surface-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <p className="text-xs font-black text-white uppercase tracking-widest">Alerts Center</p>
                {unreadCount > 0 && (
                  <button 
                    onClick={async () => {
                      await api.markAllNotificationsAsRead();
                      fetchNotifications();
                    }}
                    className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                {notificationList.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
                    <p className="text-xs text-white/30">No notifications yet</p>
                  </div>
                ) : (
                  notificationList.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) handleMarkRead(n._id);
                        if (n.relatedId) router.push(`/user/complaints/${n.relatedId}`);
                        setShowNotifications(false);
                      }}
                      className={`px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-primary-500/[0.02]' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-primary-500 animate-pulse' : 'bg-white/20'}`} />
                        <div>
                          <p className={`text-xs font-bold leading-tight mb-1 ${!n.isRead ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                          <p className="text-[11px] text-white/40 leading-relaxed mb-2 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 bg-white/[0.02] border-t border-white/5 text-center">
                 <button className="text-[10px] font-black text-white/40 hover:text-white lowercase transition-colors">
                   View Archive
                 </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-2 pl-3 border-l border-white/10">
          {user ? (
            <>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                suppressHydrationWarning
                className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center shadow-lg shadow-primary-500/10`}>
                  {user.role === 'SUPER_ADMIN' ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">{roleLabels[user.role]}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-white/30 hidden md:block" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-12 w-48 bg-surface-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                    <p className="text-xs font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-white/30 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      router.push('/user/profile');
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-danger-400 hover:bg-danger-500/10 flex items-center gap-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              suppressHydrationWarning
              className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 rounded-xl text-sm font-black hover:bg-primary-500/20 transition-all font-mono"
            >
              <LogIn className="w-4 h-4" />
              LOGIN
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
