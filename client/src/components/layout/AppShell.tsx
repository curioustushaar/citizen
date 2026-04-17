'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import UserLayout from './UserLayout';
import AdminLayout from './AdminLayout';

const AUTH_PATHS = ['/admin/login', '/superadmin/login', '/citizen/login'];
const PORTAL_PATHS = ['/', '/portal'];

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isPortalPath(pathname: string) {
  return PORTAL_PATHS.includes(pathname);
}

function isAdminPath(pathname: string) {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/officer')
  );
}

function CitizenGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      const pending = localStorage.getItem('citizen_login_pending');
      if (pending) {
        const ageMs = Date.now() - Number(pending || 0);
        if (ageMs < 8000) return;
        localStorage.removeItem('citizen_login_pending');
      }
      router.replace('/citizen/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const pending = localStorage.getItem('citizen_login_pending');
    if (pending && Date.now() - Number(pending || 0) < 8000) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      );
    }
  }

  if (!user) return null;

  return <UserLayout>{children}</UserLayout>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace(pathname.startsWith('/superadmin') ? '/superadmin/login' : '/admin/login');
      return;
    }

    if (!isAdminUser) {
      router.replace('/citizen/login');
      return;
    }

    if (pathname.startsWith('/superadmin') && user.role !== 'SUPER_ADMIN') {
      router.replace('/admin');
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdminUser) return null;

  return <AdminLayout>{children}</AdminLayout>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isPortalPath(pathname) || isAuthPath(pathname)) {
    return <>{children}</>;
  }

  if (isAdminPath(pathname)) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return <CitizenGuard>{children}</CitizenGuard>;
}
