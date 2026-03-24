import { NextResponse } from 'next/server';
import { getUserByEmail, getUserByNickname, createUser } from '@/lib/firestoreDb';
import { createSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { nickname, email, password } = await req.json();
    
    if (!nickname || !email || !password) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const [existingEmail, existingNick] = await Promise.all([
      getUserByEmail(email),
      getUserByNickname(nickname),
    ]);

    if (existingEmail) return NextResponse.json({ error: 'Почта уже занята' }, { status: 400 });
    if (existingNick) return NextResponse.json({ error: 'Никнейм уже занят' }, { status: 400 });

    const newUser = await createUser({
      nickname,
      email,
      passwordHash: password, // NOTE: hash passwords in production!
      isBanned: false,
      isVerified: false,
      role: nickname.toLowerCase() === 'kiselok' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    });

    await createSession(newUser.id);
    
    return NextResponse.json({ success: true, user: { id: newUser.id, nickname: newUser.nickname, role: newUser.role } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
