import { NextRequest, NextResponse } from 'next/server';
import { voteInPoll } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 });

    const { optionId } = await req.json();
    if (!optionId) return NextResponse.json({ error: 'Вариант не выбран' }, { status: 400 });

    const { messageId } = await params;
    await voteInPoll(messageId, userId, optionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
