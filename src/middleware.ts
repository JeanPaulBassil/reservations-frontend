import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitMiddleware } from './lib/middleware/rateLimitMiddleware'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = rateLimitMiddleware(request)
  if (rateLimitResponse.status !== 200) {
    return rateLimitResponse
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  const isAuthPath =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'

  if (!session && !isAuthPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url))
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
    '/((?!_next/static|_next/image|favicon.ico|images/|public/|api/).*)',
  ],
}
