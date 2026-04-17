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

const AUTO_PROGRESS_STEPS = [
  { status: 'Under Review', minutes: 1, note: 'Initial review started' },
  { status: 'Assigned', minutes: 3, note: 'Assigned to department queue' },
  { status: 'In Progress', minutes: 10, note: 'Field work initiated' },
  { status: 'Resolved', minutes: 30, note: 'Marked resolved by system update' },
];

function nextEscalation(history = []) {
  const index = Math.min(history.length, ESCALATION_CHAIN.length - 1);
  return ESCALATION_CHAIN[index];
}

function ensureTimeline(complaint) {
  if (!Array.isArray(complaint.statusTimeline)) {
    complaint.statusTimeline = [];
  }
}

function hasStatus(complaint, status) {
  return (complaint.statusTimeline || []).some((entry) => entry.status === status);
}

function maybeAutoProgress(complaint, now = new Date()) {
  const terminalStatuses = ['Closed', 'Citizen Verified', 'Rejected', 'Resolved', 'Escalated'];
  if (terminalStatuses.includes(complaint.status)) {
    return false;
  }

  const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : now;
  const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
  ensureTimeline(complaint);

  let updated = false;
  for (const step of AUTO_PROGRESS_STEPS) {
    if (elapsedMinutes >= step.minutes && !hasStatus(complaint, step.status)) {
      complaint.statusTimeline.push({
        status: step.status,
        timestamp: new Date(createdAt.getTime() + step.minutes * 60000),
        note: step.note,
        changedBy: 'system',
      });
      complaint.status = step.status;
      updated = true;
    }
  }

  return updated;
}

export async function GET(req, { params }) {
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

    const now = new Date();
    const autoUpdated = maybeAutoProgress(complaint, now);
    const shouldEscalate = complaint.slaDeadline && now > complaint.slaDeadline && !['Closed', 'Citizen Verified'].includes(complaint.status);
    if (shouldEscalate && complaint.status !== 'Escalated') {
      const escalation = nextEscalation(complaint.escalationHistory || []);
      complaint.status = 'Escalated';
      complaint.statusTimeline.push({
        status: 'Escalated',
        timestamp: new Date(),
        note: 'SLA expired. Auto-escalated.',
        changedBy: 'system',
      });
      complaint.escalationHistory.push({
        level: escalation.level,
        reason: 'SLA expired',
        timestamp: new Date(),
        escalatedTo: escalation.escalatedTo,
      });
      await complaint.save();

      await Notification.create({
        userId: payload.userId,
        title: 'Complaint escalated',
        message: `Complaint ${complaint.complaintId} escalated due to SLA expiry.`,
        relatedComplaintId: complaint.complaintId,
      });
    }

    if (autoUpdated) {
      await complaint.save();
    }

    return NextResponse.json({ success: true, data: complaint });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Unable to load complaint' }, { status: 500 });
  }
}
