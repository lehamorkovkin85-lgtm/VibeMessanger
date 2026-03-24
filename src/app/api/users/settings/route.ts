import { NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/firestoreDb';
import { getSessionUserId } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

    const { themePalette, uiStyle, statusText } = await req.json();

    const updates: Record<string, any> = {};
    if (themePalette) updates.themePalette = themePalette;
    if (uiStyle) updates.uiStyle = uiStyle;
    if (statusText !== undefined) updates.statusText = statusText;

    await updateUser(userId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
