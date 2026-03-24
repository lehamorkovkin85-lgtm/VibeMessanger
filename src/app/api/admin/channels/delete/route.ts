import { NextResponse } from 'next/server';
import { getUserById, deleteChannel } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  const adminUser = userId ? await getUserById(userId) : null;
  
  if (adminUser?.role !== 'admin' || adminUser.nickname.toLowerCase() !== 'kiselok') {
    return NextResponse.json({ error: 'Нет прав' }, { status: 403 });
  }

  const { channelId } = await req.json();
  await deleteChannel(channelId);
  return NextResponse.json({ success: true });
}
