import { NextResponse } from 'next/server';
import connectDb from '@/lib/db.js';
import User from '@/models/User.js';
import { signJwt, getCookieOptions } from '@/lib/server/auth.js';

export const runtime = 'nodejs';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeEmail = (value) => {
  const text = normalizeText(value).toLowerCase();
  return text || undefined;
};
const normalizePhone = (value) => {
  const text = normalizeText(value);
  return text || undefined;
};
const normalizeName = (value) => {
  const text = normalizeText(value);
  return text || undefined;
};

async function lookupFirebaseUser(idToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || 'Invalid Firebase token';
    throw new Error(msg);
  }
  return data.users?.[0];
}

function normalizeProviders(providerInfo = []) {
  const providers = new Set();
  let googleId = null;
  for (const p of providerInfo) {
    if (p.providerId === 'google.com') {
      providers.add('google');
      googleId = p.rawId || p.federatedId || googleId;
    }
    if (p.providerId === 'password') providers.add('password');
    if (p.providerId === 'phone') providers.add('phone');
  }
  return { providers: Array.from(providers), googleId };
}

export async function POST(req) {
  try {
    if (!FIREBASE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Firebase API key is not configured' },
        { status: 500 }
      );
    }
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const firebaseUser = await lookupFirebaseUser(idToken);
    if (!firebaseUser) {
      return NextResponse.json({ success: false, error: 'Firebase user not found' }, { status: 401 });
    }

    const email = normalizeEmail(firebaseUser.email);
    const phone = normalizePhone(firebaseUser.phoneNumber);
    const displayName = normalizeName(firebaseUser.displayName);
    const name = displayName || (email ? email.split('@')[0] : undefined) || 'Citizen';
    const { providers, googleId } = normalizeProviders(firebaseUser.providerUserInfo);

    await connectDb();

    const query = { $or: [] };
    if (email) query.$or.push({ email });
    if (phone) query.$or.push({ phone });
    if (googleId) query.$or.push({ googleId });

    let user = null;
    if (query.$or.length > 0) {
      user = await User.findOne(query);
    }

    if (user) {
      const updatedProviders = new Set([...(user.authProviders || []), ...providers]);
      user.name = user.name || name;
      if (email && !user.email) user.email = email;
      if (phone && !user.phone) user.phone = phone;
      if (googleId && !user.googleId) user.googleId = googleId;
      user.authProviders = Array.from(updatedProviders);
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        phone,
        googleId: googleId || undefined,
        role: 'citizen',
        authProviders: providers,
      });
    }

    const token = signJwt({
      userId: user._id.toString(),
      role: 'citizen',
      email: user.email || null,
      name: user.name || 'Citizen',
    });

    const res = NextResponse.json({ success: true, user, token });
    res.cookies.set('citizen_token', token, getCookieOptions());
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message || 'Login failed' }, { status: 401 });
  }
}
