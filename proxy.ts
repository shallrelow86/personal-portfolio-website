import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes, but allow /admin/login to load
  if (!pathname.startsWith('/admin') || pathname === '/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return new NextResponse('ADMIN_PASSWORD not configured.', { status: 500 });
  }

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Use Web Crypto API (available in Edge Runtime) to verify the cookie
  return verifyToken(token, password).then((valid) => {
    if (valid) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  });
}

async function verifyToken(token: string, password: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return token === hashHex;
}

export const config = {
  matcher: '/admin/:path*',
};
