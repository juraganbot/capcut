import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production'
);

export interface SessionData {
  sessionId: string;
  orderId?: string;
  uniqueAmount?: number;
  baseAmount?: number;
  createdAt: number;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
  [key: string]: any;
}

export async function createSession(data: Partial<SessionData>): Promise<string> {
  const sessionId = uuidv4();
  const now = Date.now();
  const expiresAt = now + (15 * 60 * 1000);

  const sessionData: SessionData = {
    sessionId,
    createdAt: now,
    expiresAt,
    ...data,
  };

  const token = await new SignJWT(sessionData as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(SECRET_KEY);

  return token;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payment_session')?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionData;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('payment_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('payment_session');
}

export function isSessionExpired(session: SessionData): boolean {
  return Date.now() > session.expiresAt;
}

export function getSessionTimeLeft(session: SessionData): number {
  const timeLeft = session.expiresAt - Date.now();
  return Math.max(0, Math.floor(timeLeft / 1000)); // in seconds
}
