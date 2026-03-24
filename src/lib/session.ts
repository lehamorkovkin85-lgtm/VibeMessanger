import { cookies } from 'next/headers';

const SESSION_NAME = 'vibe_session';

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
  const token = Buffer.from(JSON.stringify({ userId, expires: expires.toISOString() })).toString('base64');
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
    sameSite: 'lax',
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_NAME);
  if (!sessionCookie) return null;

  try {
    const data = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (new Date(data.expires) < new Date()) {
      return null;
    }
    return data.userId;
  } catch (e) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_NAME);
}
