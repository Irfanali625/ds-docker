import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Get token from cookie or header
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Don't redirect protected routes - let client-side handle authentication
  // This prevents logout on refresh when token is in localStorage but not in cookie yet
  // The ProtectedRoute component will handle the redirect if needed
  
  // If accessing login/register while authenticated (has cookie), redirect to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If on root and authenticated (has cookie), redirect to dashboard
  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

