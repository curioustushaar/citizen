'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CitizenRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/citizen/login?mode=register');
  }, [router]);

  return null;
}
