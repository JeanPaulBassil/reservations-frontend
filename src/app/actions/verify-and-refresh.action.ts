'use server'
import 'server-only'

import { refreshTokensIfPossible } from '@/middleware'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../constants/auth.constants'
import { setAccessTokenCookie, setRefreshTokenCookie } from '../lib/session'

const key = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)

const getAccessTokenVerifiedOrRefreshIfNeeded = async () => {
  const cookieJar = cookies()
  const accessToken = cookieJar.get(ACCESS_TOKEN_COOKIE_NAME)?.value
  const refreshToken = cookieJar.get(REFRESH_TOKEN_COOKIE_NAME)?.value


  if (!accessToken && !refreshToken) {
    return undefined
  }

  if (!accessToken && refreshToken) {
    try {
      const { newAccessToken, newRefreshToken } = await refreshTokensIfPossible(refreshToken)
      setAccessTokenCookie(newAccessToken)
      setRefreshTokenCookie(newRefreshToken)

      return newAccessToken
    } catch (error) {
      return undefined
    }
  }

  if (accessToken && refreshToken) {
    const isAccessTokenValid = await jwtVerify(accessToken, key, { algorithms: ['HS256'] })
    

    if (isAccessTokenValid) {
      return accessToken
    }

    try {
      const { newAccessToken, newRefreshToken } = await refreshTokensIfPossible(refreshToken)
      setAccessTokenCookie(newAccessToken)
      setRefreshTokenCookie(newRefreshToken)

      return newAccessToken
    } catch (error) {
      return undefined
    }
  }

  return undefined
}

export default getAccessTokenVerifiedOrRefreshIfNeeded
