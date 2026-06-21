import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/courses',
  '/challenges',
  '/bug-bounty',
  '/leaderboard',
  '/profile',
  '/admin',
];

const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Verify token
  const session = token ? await verifyToken(token) : null;
  
  // Check if it is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if it is an authentication route
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // If trying to access a protected route without a valid session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    // Remember where user wanted to go
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Admin route protection: standard users cannot access /admin
  if (pathname.startsWith('/admin') && session?.role !== 'ADMIN') {
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
     * - erddfddb (erddfddb folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|erddfddb).*)',
  ],
};
