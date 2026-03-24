import { NextResponse } from 'next/server';
import { getUserById, updateChannel } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  const adminUser = userId ? await getUserById(userId) : null;
  
  if (adminUser?.role !== 'admin' || adminUser.nickname.toLowerCase() !== 'kiselok') {
    return NextResponse.json({ error: 'Нет прав' }, { status: 403 });
  }

  const { channelId, verify } = await req.json();
  await updateChannel(channelId, { isVerified: verify });
  return NextResponse.json({ success: true });
}
