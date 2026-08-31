import { NextRequest, NextResponse } from 'next/server';

// Lightweight cookie-presence check (real role check happens server-side via /auth/me
// in each layout, since role isn't readable from an httpOnly cookie here).
const roleRoutePrefixes: Record<string, string> = {
  '/seller': 'seller',
  '/admin': 'admin',
};

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has('access_token');
  const { pathname } = req.nextUrl;

  const isProtected = Object.keys(roleRoutePrefixes).some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/seller/:path*', '/admin/:path*', '/account/:path*', '/checkout'],
};