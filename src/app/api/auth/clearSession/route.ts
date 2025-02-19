import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  // Delete the session cookie
  (await cookies()).delete('session')

  return NextResponse.json({ success: true })
} 