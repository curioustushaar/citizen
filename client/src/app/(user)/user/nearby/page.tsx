"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NearbyIssuesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user/all-complaints');
  }, [router]);

  return null;
}
