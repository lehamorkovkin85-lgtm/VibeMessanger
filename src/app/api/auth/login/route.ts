import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/firestoreDb';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    
    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ error: 'Неверная почта или пароль' }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Ваш аккаунт заблокирован' }, { status: 403 });
    }

    await createSession(user.id);
    
    return NextResponse.json({ success: true, user: { id: user.id, nickname: user.nickname, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
