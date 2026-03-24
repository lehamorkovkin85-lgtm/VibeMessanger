import { NextResponse } from 'next/server';
import { getAllChannels, getUserById, updateChannel } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  const userId = await getSessionUserId();
  const adminUser = userId ? await getUserById(userId) : null;
  
  if (adminUser?.role !== 'admin' || adminUser.nickname.toLowerCase() !== 'kiselok') {
    return NextResponse.json({ error: 'Нет прав' }, { status: 403 });
  }

  const channels = await getAllChannels();
  // Enrich with creator user info — parallel
  const enriched = await Promise.all(
    channels.map(async ch => {
      const creator = await getUserById(ch.creatorId);
      return { ...ch, creatorNickname: creator?.nickname || 'Неизвестно' };
    })
  );

  return NextResponse.json({ channels: enriched });
}
