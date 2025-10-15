import { NextRequest, NextResponse } from 'next/server';
import { createSession, setSessionCookie } from '@/lib/session';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    
    const rateLimit = checkRateLimit(clientId, {
      maxRequests: 10,
      windowMs: 60000, // 10 requests per minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const token = await createSession({
      ipAddress,
      userAgent,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Session initialized',
    });

  } catch (error) {
    console.error('Session init error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
