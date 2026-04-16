'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function EntryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/user/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="w-12 h-12 border-4 dark:border-white/10 border-slate-200 border-t-primary-500 rounded-full animate-spin shadow-xl" />
    </div>
  );
}
