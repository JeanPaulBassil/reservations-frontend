import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { baseUrl } from './api/utils/AbstractApi'
import { Tokens } from './api/models/Tokens'
import { ServerError } from './api/utils'
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from './app/constants/auth.constants'
import { cookies } from 'next/headers'
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  verifyAccessToken,
  getRoleFromAccessToken,
} from './app/lib/session'

const roleAccessMap = {
  ADMIN: ['/companies'],
  OWNER: ['/entities'],
  EMPLOYEE: ['/companies'],
}

export const refreshTokensIfPossible = async (refreshToken: string) => {
  const endpoint = baseUrl + 'auth/refresh'
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${refreshToken}`,
      },
      cache: 'no-store',
    })
    const body = await response.json()
    const payload = body.payload as Tokens

    const newAccessToken = payload.access_token
    const newRefreshToken = payload.refresh_token

    if (!response.ok || !newAccessToken || !newRefreshToken) {
      throw new Error()
    }
    return { newAccessToken, newRefreshToken }
  } catch (error) {
    if (error instanceof ServerError) {
      throw error
    }
    if (error instanceof Error) {
      throw new ServerError({
        error: {
          message: error.message,
          name: error.name,
          response: error.message,
          status: error.name === 'TypeError' ? 500 : 400,
        },
        timestamp: new Date().getTime(),
      })
    }
    throw new ServerError({
      error: {
        message: 'An error occurred while fetching data',
        name: 'Error',
        response: 'An error occurred while fetching data',
        status: 400,
      },
      timestamp: new Date().getTime(),
    })
  }
}

const deleteTokensAndGoToLogin = (baseUrl: string) => {
  const url = new URL(`/login`, baseUrl)
  const response = NextResponse.redirect(url.href)
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME)
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME)
  return response
}

export async function middleware(request: NextRequest) {
  const cookieJar = cookies()
  const accessToken = cookieJar.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const refreshToken = cookieJar.get(REFRESH_TOKEN_COOKIE_NAME)?.value
  const path = request.nextUrl.pathname

  console.log('path', path)

  const isSigninPath = path.startsWith('/login')

  if (isSigninPath) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (!accessToken && refreshToken) {
      try {
        const { newAccessToken, newRefreshToken } = await refreshTokensIfPossible(refreshToken)
        const url = redirectParam ? new URL(redirectParam) : new URL(`/`, request.url)
        const response = NextResponse.redirect(url.href)
        setAccessTokenCookie(newAccessToken, response)
        setRefreshTokenCookie(newRefreshToken, response)
        return response
      } catch (error) {
        return deleteTokensAndGoToLogin(request.url)
      }
    }
    if (accessToken && refreshToken) {
      if (await verifyAccessToken(accessToken)) {
        const url = redirectParam ? new URL(redirectParam) : new URL('/', request.url)

        return NextResponse.redirect(url.href)
      } else {
        return deleteTokensAndGoToLogin(request.url)
      }
    }
    return NextResponse.next()
  }

  if ((!accessToken && !refreshToken) || (accessToken && !refreshToken)) {
    const signinUrl = new URL(`/login?redirect=${encodeURIComponent(request.url)}`, request.url)
    return NextResponse.redirect(signinUrl.href)
  }

  if (!accessToken && refreshToken) {
    try {
      const { newAccessToken, newRefreshToken } = await refreshTokensIfPossible(refreshToken)
      const response = NextResponse.next()
      setAccessTokenCookie(newAccessToken, response)
      setRefreshTokenCookie(newRefreshToken, response)
      return response
    } catch (error) {
      return deleteTokensAndGoToLogin(request.url)
    }
  }

  if (accessToken && refreshToken) {
    if (await verifyAccessToken(accessToken)) {
      const userRole = await getRoleFromAccessToken(accessToken)
      const allowedPaths = roleAccessMap[userRole as keyof typeof roleAccessMap]
      const hasAccess = allowedPaths.some((allowedPath) => path.startsWith(allowedPath))

      if (!hasAccess) {
        return NextResponse.redirect(new URL(allowedPaths[0], request.url))
      }

      return NextResponse.next()
    } else {
      return deleteTokensAndGoToLogin(request.url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
}
