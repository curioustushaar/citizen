'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  Users,
  Settings,
  LogIn,
  LogOut,
  User,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Show minimal sidebar on login page
  if (pathname === '/login') return null;

  // Navigation items based on role
  const getNavItems = () => {
    const common = [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    ];

    if (!user) {
      return [
        ...common,
        { label: 'Submit Complaint', icon: PlusCircle, href: '/complaints/new' },
        { label: 'Analytics', icon: BarChart3, href: '/analytics' },
        { label: 'Login', icon: LogIn, href: '/login' },
      ];
    }

    if (user.role === 'PUBLIC') {
      return [
        ...common,
        { label: 'Submit Complaint', icon: PlusCircle, href: '/complaints/new' },
        { label: 'My Complaints', icon: FileText, href: '/my-complaints' },
        { label: 'Analytics', icon: BarChart3, href: '/analytics' },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        ...common,
        { label: 'Officer Panel', icon: Building2, href: '/officer' },
        { label: 'Submit Complaint', icon: PlusCircle, href: '/complaints/new' },
        { label: 'Analytics', icon: BarChart3, href: '/analytics' },
        { label: 'Admin Panel', icon: Shield, href: '/admin' },
      ];
    }

    // SUPER_ADMIN - Strategic Oversight Only
    return [
      ...common,
      { label: 'Control Room', icon: Shield, href: '/superadmin' },
      { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    ];
  };

  const navItems = getNavItems();

  const roleColors: Record<string, string> = {
    PUBLIC: 'from-emerald-500 to-teal-600',
    ADMIN: 'from-cyan-500 to-blue-600',
    SUPER_ADMIN: 'from-violet-500 to-purple-600',
  };

  const roleBadgeBg: Record<string, string> = {
    PUBLIC: 'bg-emerald-500/10 text-emerald-400',
    ADMIN: 'bg-cyan-500/10 text-cyan-400',
    SUPER_ADMIN: 'bg-violet-500/10 text-violet-400',
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-white/[0.06] premium-sidebar"
    >
      {/* Logo Section - Hidden for all Superadmins to maintain a clean command-center feel */}
      {user?.role !== 'SUPER_ADMIN' && (
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500
                          flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-bold text-white uppercase tracking-tighter">
                  {pathname.includes('/superadmin') ? 'Superadmin' :
                    pathname.includes('/admin') ? 'Officer Portal' :
                      'Grievance Node'}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">
                  {pathname.includes('/superadmin') ? 'National oversight' : 'Govt. Intelligence'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className={`px-3 py-3 border-b border-white/[0.06] ${collapsed ? 'flex justify-center' : ''}`}>
          {collapsed ? (
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center shadow-lg`}>
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center flex-shrink-0`}
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className={`text-[10px] font-medium ${roleBadgeBg[user.role]} inline-block px-1.5 py-0.5 rounded mt-0.5`}>
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 py-3 border-t border-white/[0.06] space-y-1">
        {user ? (
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className={`nav-link w-full text-danger-400/60 hover:text-danger-400 hover:bg-danger-500/5 ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        ) : (
          <Link href="/login" className={`nav-link ${collapsed ? 'justify-center px-0' : ''}`}>
            <LogIn className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Login</span>}
          </Link>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="nav-link w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
}
