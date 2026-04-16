import { NextResponse } from 'next/server';
import { getCookieOptions } from '@/lib/server/auth.js';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set('citizen_token', '', { ...getCookieOptions(), maxAge: 0 });
  return res;
}
