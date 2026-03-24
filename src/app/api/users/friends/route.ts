import { NextResponse } from 'next/server';
import { getFriendshipsForUser, getUserById } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const friendships = await getFriendshipsForUser(userId);
    
    const friendList = await Promise.all(
      friendships.map(async f => {
        const isRequester = f.requesterId === userId;
        const otherUserId = isRequester ? f.receiverId : f.requesterId;
        const otherUser = await getUserById(otherUserId);
        return {
          friendshipId: f.id,
          status: f.status,
          isRequester,
          user: {
            id: otherUser?.id,
            nickname: otherUser?.nickname,
            isVerified: otherUser?.isVerified,
          }
        };
      })
    );

    return NextResponse.json({ friends: friendList.filter(f => f.user.id) });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
