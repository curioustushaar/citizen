'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function EntryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (user.role === 'SUPER_ADMIN') router.replace('/superadmin/dashboard');
        else if (user.role === 'ADMIN') router.replace('/officer/dashboard');
        else router.replace('/user/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}
