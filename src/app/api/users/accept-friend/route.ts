import { NextResponse } from 'next/server';
import { getFriendshipById, updateFriendship, deleteFriendship } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { friendshipId, accept } = await req.json();
    const friendship = await getFriendshipById(friendshipId);
    if (!friendship) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });

    if (friendship.receiverId !== userId) {
      return NextResponse.json({ error: 'Нет прав для этого действия' }, { status: 403 });
    }

    if (accept) {
      await updateFriendship(friendshipId, 'accepted');
    } else {
      await deleteFriendship(friendshipId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
