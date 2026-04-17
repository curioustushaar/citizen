import { NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import User from '@/models/User.js';
import { verifyJwt } from '@/lib/server/auth.js';

export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const cookieToken = req.cookies.get('citizen_token')?.value;
    const authHeader = req.headers.get('authorization') || '';
    const headerToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;
    const token = cookieToken || headerToken;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    await connectDb();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
}
