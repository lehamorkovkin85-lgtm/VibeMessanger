'use client';

import React, { useEffect, useState } from 'react';
import { useUser, User } from '@/components/UserProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Ban, CheckCircle, ArrowLeft } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'channels'>('users');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {} finally {
      setFetching(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/admin/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin' || user.nickname.toLowerCase() !== 'kiselok') {
        router.push('/');
      } else {
        fetchUsers();
        fetchChannels();
      }
    }
  }, [user, loading, router]);

  const toggleBan = async (targetUserId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, ban: !currentStatus }),
      });
      fetchUsers();
    } catch (e) {}
  };

  const toggleVerify = async (targetUserId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, verify: !currentStatus }),
      });
      fetchUsers();
    } catch (e) {}
  };

  const toggleChannelVerify = async (channelId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/channels/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, verify: !currentStatus }),
      });
      fetchChannels();
    } catch (e) {}
  };

  const deleteChannel = async (channelId: string) => {
    if (!confirm('Точно удалить канал?')) return;
    try {
      await fetch('/api/admin/channels/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      fetchChannels();
    } catch (e) {}
  };

  if (loading || fetching || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-muted hover:bg-muted-foreground/20 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="text-indigo-500" />
                Админ-панель
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">Управление пользователями платформы</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-medium shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            Доступ разрешен: KiselOK
          </div>
        </div>

        <div className="bg-muted/30 border border-border/50 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-4 border-b border-border/50 px-4 pt-4">
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Пользователи
            </button>
            <button 
              onClick={() => setActiveTab('channels')}
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'channels' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Каналы
            </button>
          </div>

          {activeTab === 'users' && (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    <th className="p-4 font-semibold text-muted-foreground">Пользователь</th>
                    <th className="p-4 font-semibold text-muted-foreground">Почта</th>
                    <th className="p-4 font-semibold text-muted-foreground">Роль</th>
                    <th className="p-4 font-semibold text-muted-foreground text-center">Действия (Галочка)</th>
                    <th className="p-4 font-semibold text-muted-foreground text-center">Действия (Бан)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {u.nickname}
                          {u.isVerified && <span className="text-blue-400" title="Верифицирован">✓</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-muted text-muted-foreground'
                        }`}>
                          {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleVerify(u.id, u.isVerified)}
                          className={`flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            u.isVerified 
                              ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' 
                              : 'bg-muted hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground'
                          }`}
                        >
                          <CheckCircle size={16} />
                          {u.isVerified ? 'Снять' : 'Выдать'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        {u.id !== user.id && (
                          <button
                            onClick={() => toggleBan(u.id, u.isBanned)}
                            className={`flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              u.isBanned 
                                ? 'bg-destructive/20 text-destructive border border-destructive/20 hover:bg-destructive/30' 
                                : 'bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground'
                            }`}
                          >
                            <Ban size={16} />
                            {u.isBanned ? 'Разбанить' : 'Забанить'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Нет пользователей
                </div>
              )}
            </>
          )}

          {activeTab === 'channels' && (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/50">
                    <th className="p-4 font-semibold text-muted-foreground">Название Зала (Канала)</th>
                    <th className="p-4 font-semibold text-muted-foreground">Создатель</th>
                    <th className="p-4 font-semibold text-muted-foreground text-center">Статус</th>
                    <th className="p-4 font-semibold text-muted-foreground text-center">Удалить</th>
                  </tr>
                </thead>
                <tbody>
                  {channels.map(ch => (
                    <tr key={ch.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-foreground flex items-center gap-2">
                          <span className="text-indigo-500">#</span>
                          {ch.name}
                          {ch.isVerified && <span className="text-blue-400" title="Официальный канал">✓</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground font-medium">@{ch.creatorNickname}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleChannelVerify(ch.id, ch.isVerified)}
                          className={`flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            ch.isVerified 
                              ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' 
                              : 'bg-muted hover:bg-blue-500/10 hover:text-blue-500 text-muted-foreground'
                          }`}
                        >
                          <CheckCircle size={16} />
                          {ch.isVerified ? 'Снять галку' : 'Выдать галку'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteChannel(ch.id)}
                          className="flex items-center gap-2 mx-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        >
                          <Ban size={16} />
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {channels.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Нет каналов
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
