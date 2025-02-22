// TODO: Maybe verify the token on the nextjs server side also, since the secret will be secure here.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expires = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 7 days from now
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Session setting error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
