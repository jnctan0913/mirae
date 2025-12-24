import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Simple middleware - just allow all routes through
  // Authentication is handled client-side with localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
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

