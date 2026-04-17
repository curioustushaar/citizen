'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  FileText,
  LogOut,
  User,
  Navigation,
  Activity,
  Zap,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function UserSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, t } = useAuth();

  const navItems = [
    { label: t('dashboard'), icon: LayoutDashboard, href: '/user/dashboard' },
    { label: t('submitComplaint'), icon: PlusCircle, href: '/user/complaints/new' },
    { label: 'Intelligence Feed', icon: FileText, href: '/user/all-complaints' },
  ];

  const bottomItems = [
    { label: 'Security Vault', icon: ShieldCheck, href: '/user/security' },
    { label: 'Preferences', icon: Settings, href: '/user/settings' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#020617] relative z-20">
      
      {/* Branding */}
      <div className="h-20 flex items-center gap-4 px-6 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(59,130,246,0.3)]">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-base font-black dark:text-white text-slate-900 leading-tight">URBAN AI</p>
              <p className="text-[9px] font-bold text-primary-500 uppercase tracking-[0.2em]">Municipal Core</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`relative flex items-center h-12 rounded-2xl transition-all duration-300 group cursor-pointer ${
                  isActive 
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                } ${collapsed ? 'justify-center' : 'px-4'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1.5 h-6 bg-primary-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-500' : ''}`} />
                {!collapsed && (
                  <span className={`ml-4 text-[13px] font-black tracking-tight ${isActive ? '' : 'group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}

        <div className="py-4">
           <div className={`h-[1px] bg-slate-100 dark:bg-white/5 ${collapsed ? 'mx-2' : ''}`} />
        </div>

        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className={`flex items-center h-12 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all ${collapsed ? 'justify-center' : 'px-4'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="ml-4 text-[12px] font-bold">{item.label}</span>}
            </div>
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className={`flex items-center h-12 w-full rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all ${collapsed ? 'justify-center' : 'px-4'}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="ml-4 text-[13px] font-black uppercase tracking-widest">Sign Out</span>}
        </motion.button>

        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-10 text-slate-300 hover:text-primary-500 transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
