import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  };
}
