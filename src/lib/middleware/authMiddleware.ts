import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/signup']
const HOME_ROUTE = '/'

export function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth-token')
  const currentPath = request.nextUrl.pathname

  if (!token) {
    // Unauthenticated users: Allow public routes, block everything else
    if (!PUBLIC_ROUTES.includes(currentPath)) {
      console.log('Redirecting unauthenticated user to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } else {
    // Authenticated users: Block access to public routes, redirect to home
    if (PUBLIC_ROUTES.includes(currentPath)) {
      console.log('Redirecting authenticated user to dashboard')
      return NextResponse.redirect(new URL(HOME_ROUTE, request.url))
    }
  }

  return NextResponse.next()
} 