'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Menu, AlertTriangle, User, 
  ChevronDown, LogOut, Shield, Globe, Zap,
  Settings, HelpCircle, Activity, Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { onEvent } from '@/lib/socket';
import toast from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { auth, signOut } from '@/lib/firebase';

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout, language, setLanguage } = useAuth();
  const router = useRouter();
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const isStaffUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) setNotificationList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    if (isStaffUser) fetchNotifications();

    const unSubCreated = onEvent('complaint_created', () => {
      fetchNotifications();
      toast('New grievance reported in your area', { icon: '📢', style: { border: '1px solid #3b82f6', background: '#0f172a', color: '#fff' } });
    });

    const unSubUpdated = onEvent('complaint_updated', (complaint) => {
      fetchNotifications();
      if (complaint.userId === user?.id) {
        toast.success(`Status updated: ${complaint.status}`, { icon: '✅' });
      }
    });

    return () => {
      unSubCreated();
      unSubUpdated();
    };
  }, [user, isStaffUser]);

  const unreadCount = notificationList.filter(n => !n.isRead).length;

  const roleColors: Record<string, string> = {
    PUBLIC: 'from-blue-500 to-indigo-600',
    ADMIN: 'from-cyan-500 to-blue-600',
    SUPER_ADMIN: 'from-violet-500 to-purple-600',
  };

  const roleLabels: Record<string, string> = {
    PUBLIC: 'Verified Citizen',
    ADMIN: 'Field Officer',
    SUPER_ADMIN: 'Command Center',
  };

  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b dark:border-white/5 border-slate-200/60 sticky top-0 z-[60] bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl">
      
      {/* --- Search & Menu --- */}
      <div className="flex items-center gap-6 flex-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onMenuToggle}
          className="lg:hidden p-3 rounded-2xl bg-slate-100 dark:bg-white/5 dark:text-white/60 text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="relative max-w-lg flex-1 hidden md:block group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
           <input
             type="text"
             placeholder="Search active intelligence, forensic logs..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-12 pr-12 py-3 rounded-[1.25rem] text-sm font-medium focus:outline-none transition-all duration-300
                        bg-slate-100 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 dark:text-white dark:placeholder-white/20
                        focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40"
           />
           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[9px] font-black text-slate-400">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-[9px] font-black text-slate-400">K</kbd>
           </div>
        </div>
      </div>

      {/* --- Action Cluster --- */}
      <div className="flex items-center gap-4">
        
        {/* Localization */}
        <div className="hidden lg:flex items-center bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-inner">
           {['en', 'hi'].map((l) => (
             <button
               key={l}
               onClick={() => setLanguage(l as any)}
               className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === l ? 'bg-white dark:bg-primary-500 text-primary-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
             >
               {l === 'en' ? 'ENG' : 'HIN'}
             </button>
           ))}
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setShowNotifications(!showNotifications)}
             className={`p-3 rounded-2xl transition-all relative ${showNotifications ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40'}`}
           >
             <Bell className="w-5 h-5" />
             <AnimatePresence>
               {unreadCount > 0 && (
                 <motion.span 
                   initial={{ scale: 0 }} animate={{ scale: 1 }}
                   className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 dark:border-[#020617] border-white shadow-lg"
                 >
                   {unreadCount}
                 </motion.span>
               )}
             </AnimatePresence>
           </motion.button>
           
           <AnimatePresence>
             {showNotifications && (
               <motion.div
                 initial={{ opacity: 0, y: 15, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 15, scale: 0.95 }}
                 className="absolute right-0 top-16 w-80 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-[70] overflow-hidden"
               >
                  <div className="p-5 border-b dark:border-white/5 flex items-center justify-between">
                     <p className="text-xs font-black uppercase tracking-widest text-slate-500">Notifications</p>
                     <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                     {notificationList.length === 0 ? (
                       <div className="p-10 text-center opacity-30">
                          <Activity className="w-10 h-10 mx-auto mb-2" />
                          <p className="text-xs font-bold">Null Feed</p>
                       </div>
                     ) : (
                       notificationList.map(n => (
                         <div key={n._id} className="p-4 border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                            <p className="text-xs font-bold dark:text-white mb-1">{n.title}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{n.message}</p>
                         </div>
                       ))
                     )}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
           <motion.button
             whileHover={{ scale: 1.02 }}
             onClick={() => setShowDropdown(!showDropdown)}
             className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary-500/40 transition-all select-none"
           >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user?.role || 'PUBLIC']} flex items-center justify-center shadow-lg`}>
                 <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden lg:block">
                 <p className="text-xs font-black dark:text-white text-slate-900 leading-tight">{user?.name || 'Authorized User'}</p>
                 <p className="text-[9px] font-bold text-primary-500 uppercase tracking-widest">{roleLabels[user?.role || 'PUBLIC']}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
           </motion.button>

           <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-60 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-[1.75rem] shadow-2xl z-[70] py-2 overflow-hidden"
                >
                   <div className="px-4 py-3 border-b dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Account</p>
                      <p className="text-xs font-bold truncate dark:text-white">{user?.email}</p>
                   </div>
                   {[
                     { label: 'Profile Intelligence', icon: User, href: '/user/profile' },
                     { label: 'System Settings', icon: Settings, href: '/user/settings' },
                     { label: 'Grievance Hotline', icon: HelpCircle, href: '/user/help' },
                   ].map(link => (
                     <button key={link.label} onClick={() => router.push(link.href)} className="w-full px-4 py-3 flex items-center gap-3 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        <link.icon className="w-4 h-4" /> {link.label}
                     </button>
                   ))}
                   <div className="mt-2 pt-2 border-t dark:border-white/5">
                      <button 
                        onClick={async () => {
                           logout();
                           router.replace('/citizen/login');
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-[11px] font-black text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                         <LogOut className="w-4 h-4" /> Terminate Session
                      </button>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
