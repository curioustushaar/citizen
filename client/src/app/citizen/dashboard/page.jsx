'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, LogOut, UserCircle2 } from 'lucide-react';
import { auth, signOut } from '@/lib/firebase';

export default function CitizenDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const citizenToken = localStorage.getItem('citizen_token');
        if (!citizenToken) {
          router.replace('/citizen/login');
          return;
        }
        const res = await fetch('/api/citizen/auth/me', {
          credentials: 'include',
          headers: { Authorization: `Bearer ${citizenToken}` },
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          router.replace('/citizen/login');
          return;
        }
        if (isMounted) setUser(data.user);
      } catch {
        router.replace('/citizen/login');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadUser();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/citizen/auth/logout', { method: 'POST', credentials: 'include' });
    try {
      await signOut(auth);
    } catch {
      // Ignore Firebase sign-out errors
    }
    localStorage.removeItem('citizen_token');
    localStorage.removeItem('citizen_user');
    router.replace('/citizen/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShieldCheck className="w-10 h-10 text-primary-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <UserCircle2 className="w-6 h-6 text-primary-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Citizen Dashboard</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {user?.name || 'Citizen'}
              </h1>
              <p className="text-sm text-slate-500">{user?.email || user?.phone || 'No contact'}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Role</p>
              <p className="text-sm font-bold text-primary-500">Citizen</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
            >
              <LogOut className="w-4 h-4 inline mr-2" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}