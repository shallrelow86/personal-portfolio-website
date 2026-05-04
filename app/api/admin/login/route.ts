import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
    }

    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
    }

    // Secure comparison using timingSafeEqual (Node.js crypto)
    const valid = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(expected)
    );

    if (!valid) {
      return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
    }

    // Generate token: SHA-256 hash of the password
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_token', hash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
