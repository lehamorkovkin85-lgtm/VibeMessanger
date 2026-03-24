import { NextResponse } from 'next/server';
import { getAllChannels, createChannel, getUserById } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function GET() {
  const channels = await getAllChannels();
  return NextResponse.json({ channels });
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { name } = await req.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Имя канала не может быть пустым' }, { status: 400 });
    }

    const newChannel = await createChannel(name.trim(), userId);
    return NextResponse.json(newChannel);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
