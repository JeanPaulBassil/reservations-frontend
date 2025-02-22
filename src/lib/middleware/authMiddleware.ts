import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function authMiddleware(request: NextRequest) {
  const session = request.cookies.get('session');

  const isAuthPath =
    request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup';

  if (!session && !isAuthPath) {
    return safeRedirect('/login', request);
  }

  if (session && isAuthPath) {
    return safeRedirect('/', request);
  }

  return NextResponse.next();
}

const safeRedirect = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url);
  url.search = ''; // Remove any malicious query params
  return NextResponse.redirect(url);
};
