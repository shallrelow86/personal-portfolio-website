import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyPassword(input: string, expected: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = request.cookies.get('admin_token')?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return new NextResponse('ADMIN_PASSWORD not configured.', { status: 500 });
  }

  if (token && verifyPassword(token, expected)) {
    return NextResponse.next();
  }

  if (request.method === 'POST' && pathname === '/admin') {
    const formData = request.formData();
    return formData.then((data) => {
      const password = data.get('password') as string;
      if (password && verifyPassword(password, expected)) {
        const res = NextResponse.redirect(new URL('/admin', request.url));
        res.cookies.set('admin_token', password, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });
        return res;
      }
      return new NextResponse('Invalid password.', { status: 401 });
    });
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Login</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    form {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 320px;
    }
    h1 { margin: 0 0 1.5rem; font-size: 1.25rem; text-align: center; }
    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.5rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>Admin Login</h1>
    <input type="password" name="password" placeholder="Password" required autofocus>
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export const config = {
  matcher: '/admin/:path*',
};
