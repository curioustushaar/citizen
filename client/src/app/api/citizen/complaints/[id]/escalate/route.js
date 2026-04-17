import { NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import Complaint from '@/models/Complaint.js';
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

const ESCALATION_CHAIN = [
  { level: 'Officer', escalatedTo: 'Assigned Officer' },
  { level: 'Supervisor', escalatedTo: 'Department Supervisor' },
  { level: 'Department Head', escalatedTo: 'Department Head' },
  { level: 'District Authority', escalatedTo: 'District Authority' },
];

function nextEscalation(history = []) {
  const index = Math.min(history.length, ESCALATION_CHAIN.length - 1);
  return ESCALATION_CHAIN[index];
}

export async function POST(req, { params }) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = verifyJwt(token);
    await connectDb();

    const complaint = await Complaint.findOne({ complaintId: params.id, userId: payload.userId });
    if (!complaint) {
      return NextResponse.json({ success: false, error: 'Complaint not found' }, { status: 404 });
    }

    const body = await req.json();
    const reason = String(body?.reason || 'Citizen requested escalation').trim();

    const escalation = nextEscalation(complaint.escalationHistory || []);
    complaint.status = 'Escalated';
    complaint.statusTimeline.push({
      status: 'Escalated',
      timestamp: new Date(),
      note: reason,
      changedBy: 'citizen',
    });
    complaint.escalationHistory.push({
      level: escalation.level,
      reason,
      timestamp: new Date(),
      escalatedTo: escalation.escalatedTo,
    });

    await complaint.save();

    await Notification.create({
      userId: payload.userId,
      title: 'Complaint escalated',
      message: `Complaint ${complaint.complaintId} has been escalated.`,
      relatedComplaintId: complaint.complaintId,
    });
    return NextResponse.json({ success: true, data: complaint });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to escalate complaint' }, { status: 500 });
  }
}
