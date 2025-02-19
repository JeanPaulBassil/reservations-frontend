import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function authMiddleware(request: NextRequest) {
  const session = request.cookies.get('session')

  const isAuthPath =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'

  if (!session && !isAuthPath) {
    console.log('Redirecting to login')
    console.log(request.nextUrl.pathname)
    return safeRedirect('/login', request)
  }

  if (session && isAuthPath) {
    console.log('Redirecting to home')
    return safeRedirect('/', request)
  }

  return NextResponse.next()
}

const safeRedirect = (path: string, request: NextRequest) => {
  const url = new URL(path, request.url)
  url.search = '' // Remove any malicious query params
  return NextResponse.redirect(url)
} 