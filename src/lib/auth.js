import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { CONFIG } from './config';

function getSecretKey() {
  if (!process.env.JWT_SECRET) {
    throw new Error('CRITICAL WARNING: JWT_SECRET is not set in the environment variables!');
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CONFIG.JWT_EXPIRY_DAYS}d`)
    .sign(getSecretKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch (err) {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CONFIG.JWT_COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await verifyToken(token);
  // Invalidate legacy tokens that don't have an email
  if (payload && !payload.email) return null;
  return payload;
}

