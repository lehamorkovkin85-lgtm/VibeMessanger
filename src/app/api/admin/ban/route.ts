import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const adminUser = await getUserById(userId);
    if (adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    const { targetUserId, ban } = await req.json();
    if (adminUser.id === targetUserId) {
      return NextResponse.json({ error: 'Нельзя забанить самого себя' }, { status: 400 });
    }

    await updateUser(targetUserId, { isBanned: ban });
    return NextResponse.json({ success: true, isBanned: ban });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
