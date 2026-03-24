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

    const { targetUserId, verify } = await req.json();
    await updateUser(targetUserId, { isVerified: verify });
    return NextResponse.json({ success: true, isVerified: verify });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
