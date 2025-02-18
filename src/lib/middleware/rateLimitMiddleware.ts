import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitStore {
  timestamp: number
  requests: number
}

const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // Maximum requests per minute
const rateLimitStore = new Map<string, RateLimitStore>()

export function rateLimitMiddleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  const now = Date.now()

  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.timestamp > WINDOW_SIZE) {
      rateLimitStore.delete(key)
    }
  }

  // Get or create rate limit data for this IP
  const rateLimit = rateLimitStore.get(ip) ?? {
    timestamp: now,
    requests: 0,
  }

  // Reset if outside window
  if (now - rateLimit.timestamp > WINDOW_SIZE) {
    rateLimit.timestamp = now
    rateLimit.requests = 0
  }

  rateLimit.requests++
  rateLimitStore.set(ip, rateLimit)

  // Check if rate limit exceeded
  if (rateLimit.requests > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'Content-Type': 'text/plain',
      },
    })
  }

  // Add response headers for rate limit monitoring
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString())
  response.headers.set(
    'X-RateLimit-Remaining',
    (MAX_REQUESTS - rateLimit.requests).toString(),
  )
  response.headers.set(
    'X-RateLimit-Reset',
    (rateLimit.timestamp + WINDOW_SIZE).toString(),
  )

  return response
} 