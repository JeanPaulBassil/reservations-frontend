import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitMiddleware } from './lib/middleware/rateLimitMiddleware'
import { authMiddleware } from './lib/middleware/authMiddleware'

export function middleware(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request)
  if (rateLimitResponse.status !== 200) {
    return rateLimitResponse
  }

  // Apply authentication
  const authResponse = authMiddleware(request)
  if (authResponse.status !== 200) {
    return authResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (Favicon file)
     * - Public folder files (public/)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|public/|api/).*)",
  ],
};