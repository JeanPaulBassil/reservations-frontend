import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = await cookies()

  if (!cookieStore.get('session')) {
    return NextResponse.json({ error: 'No active session' }, { status: 400 })
  }

  cookieStore.delete('session')

  return NextResponse.json({ success: true })
}
