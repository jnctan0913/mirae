import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protect stage routes
  if (
    req.nextUrl.pathname.match(/^\/stage\d+/) &&
    !session
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect logged-in users from auth pages
  if (
    (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') &&
    session
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/stage0/:path*',
    '/stage1/:path*',
    '/stage2/:path*',
    '/stage3/:path*',
    '/stage4/:path*',
    '/stage5/:path*',
  ],
};

