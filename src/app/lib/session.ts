import 'server-only'

import { JWTPayload, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../constants/auth.constants'

const key = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)

const setCookie = (
  name: string,
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any,
  response: NextResponse | undefined
) => {
  if (response) {
    response.cookies.set(name, value, options)
  } else {
    cookies().set(name, value, options)
  }
}

export async function setAccessTokenCookie(
  access_token: string,
  response?: NextResponse | undefined
) {
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  const options = {
    expires,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  }
  setCookie(ACCESS_TOKEN_COOKIE_NAME, access_token, options, response)
}

export async function setRefreshTokenCookie(refresh_token: string, response?: NextResponse) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const options = {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  }
  setCookie(REFRESH_TOKEN_COOKIE_NAME, refresh_token, options, response)
}

export async function deleteAccessTokenAndRefreshTokenCookies() {
  cookies().delete(ACCESS_TOKEN_COOKIE_NAME)
  cookies().delete(REFRESH_TOKEN_COOKIE_NAME)
}

export async function verifyAccessToken(access_token: string) {
  try {
    await jwtVerify(access_token, key, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function getRoleFromAccessToken(access_token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(access_token, key, { algorithms: ['HS256'] })
    return payload.role as string
  } catch (error) {
    return null
  }
}

export async function decryptAccessToken(access_token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(access_token, key, { algorithms: ['HS256'] })
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}
