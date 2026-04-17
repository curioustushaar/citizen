import { NextRequest, NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import Complaint from '@/models/Complaint.js';
import { verifyJwt } from '@/lib/server/auth.js';

export async function GET(request) {
  try {
    await connectDb();

    // Try to get token from Authorization header or Cookies
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('citizen_token')?.value;
    
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Invalid user' }, { status: 401 });
    }

    // Connect to DB and let Mongoose handle casting strings to ObjectIds safely.
    // Querying with $or for all possible ways this user's complaints might be stored.
    
    const queryConditions = [
      { userId: userId },
      { email: decoded.email }
    ];

    if (decoded.phone) {
      queryConditions.push({ phone: decoded.phone });
    }

    const complaints = await Complaint.find({
      $or: queryConditions
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}