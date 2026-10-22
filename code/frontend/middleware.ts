import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/login', '/register'];
const PROTECTED_PREFIXES = ['/dashboard', '/subscription'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = !!request.cookies.get('auth_token')?.value;

  if (!hasToken && PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasToken && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
