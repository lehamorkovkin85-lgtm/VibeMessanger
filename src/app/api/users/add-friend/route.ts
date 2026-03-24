import { NextResponse } from 'next/server';
import { getUserByNickname, getFriendshipsForUser, createFriendship } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { targetNickname } = await req.json();
    if (!targetNickname) return NextResponse.json({ error: 'Укажите никнейм' }, { status: 400 });

    const targetUser = await getUserByNickname(targetNickname);
    if (!targetUser) return NextResponse.json({ error: 'Пользователь с таким никнеймом не найден' }, { status: 404 });

    if (targetUser.id === userId) return NextResponse.json({ error: 'Нельзя добавить самого себя' }, { status: 400 });

    const existingFriendships = await getFriendshipsForUser(userId);
    const alreadyExists = existingFriendships.some(
      f => (f.requesterId === userId && f.receiverId === targetUser.id) ||
           (f.requesterId === targetUser.id && f.receiverId === userId)
    );
    if (alreadyExists) return NextResponse.json({ error: 'Заявка уже отправлена или вы уже друзья' }, { status: 400 });

    await createFriendship(userId, targetUser.id);
    return NextResponse.json({ success: true, message: 'Заявка отправлена' });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
