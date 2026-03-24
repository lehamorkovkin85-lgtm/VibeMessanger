import { NextResponse } from 'next/server';
import { getChannelMessages, getChannelById, createMessage } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET(req: Request, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  const messages = await getChannelMessages(channelId);
  return NextResponse.json({ messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ channelId: string }> }) {
  try {
    const { channelId } = await params;
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const channel = await getChannelById(channelId);
    if (!channel) return NextResponse.json({ error: 'Канал не найден' }, { status: 404 });

    if (channel.creatorId !== userId) {
      return NextResponse.json({ error: 'У вас нет прав писать в этот канал' }, { status: 403 });
    }

    const { text, type, pollData } = await req.json();
    const newMessage = await createMessage(userId, channelId, text, type, pollData);
    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
