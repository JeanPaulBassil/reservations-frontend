import { decryptAccessToken } from '@/app/lib/session'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authorizationHeader = request.headers.get('Authorization') || ''
  const accessToken = authorizationHeader.split(' ')[1]
  try {
    const payload = await decryptAccessToken(accessToken)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ payload })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
