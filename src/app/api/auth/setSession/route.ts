import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 Days
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
