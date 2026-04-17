import { NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import Notification from '@/models/Notification.js';
import { verifyJwt } from '@/lib/server/auth.js';

export const runtime = 'nodejs';

function extractToken(req) {
  const cookieToken = req.cookies.get('citizen_token')?.value;
  const authHeader = req.headers.get('authorization') || '';
  const headerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;
  return cookieToken || headerToken;
}

export async function GET(req) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    await connectDb();

    const notifications = await Notification.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ success: true, data: notifications });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unable to load notifications' }, { status: 500 });
  }
}
