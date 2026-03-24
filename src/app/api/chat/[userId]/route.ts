import { NextResponse } from 'next/server';
import { getMessagesBetweenUsers, createMessage, getUserById, getFriendshipsForUser } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { userId: targetUserId } = await params;
    
    // Check friendship
    const friendships = await getFriendshipsForUser(userId);
    const isFriends = friendships.some(
      f => f.status === 'accepted' &&
        ((f.requesterId === userId && f.receiverId === targetUserId) ||
         (f.requesterId === targetUserId && f.receiverId === userId))
    );
    if (!isFriends) {
      return NextResponse.json({ error: 'Вы не можете общаться, пока не станете друзьями' }, { status: 403 });
    }

    const messages = await getMessagesBetweenUsers(userId, targetUserId);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { userId: targetUserId } = await params;
    const { text, type, pollData } = await req.json();
    if (type !== 'poll' && (!text || !text.trim())) return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });

    const friendships = await getFriendshipsForUser(userId);
    const isFriends = friendships.some(
      f => f.status === 'accepted' &&
        ((f.requesterId === userId && f.receiverId === targetUserId) ||
         (f.requesterId === targetUserId && f.receiverId === userId))
    );
    if (!isFriends) {
      return NextResponse.json({ error: 'Вам нужно стать друзьями для отправки сообщений' }, { status: 403 });
    }

    const newMessage = await createMessage(userId, targetUserId, text?.trim() || '', type, pollData);
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
