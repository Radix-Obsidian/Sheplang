import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware to handle analytics blocking
 * This middleware runs on every request and helps manage analytics blocker errors
 */
export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();

  // Add CSP header to prevent console errors from blocked scripts
  // This follows best practices from Mozilla's documentation
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.mixpanel.com;"
  );

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Match all routes except for API routes, static files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
