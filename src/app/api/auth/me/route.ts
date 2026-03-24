import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ user: null });

    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

    const safeUser = {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      isBanned: user.isBanned,
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
      themePalette: user.themePalette,
      uiStyle: user.uiStyle,
      statusText: user.statusText,
    };
    return NextResponse.json({ user: safeUser });
    } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
