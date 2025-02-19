import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Session setting error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 