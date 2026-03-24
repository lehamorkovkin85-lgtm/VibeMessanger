'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/components/UserProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LogOut,
  UserPlus,
  Shield,
  MessageCircle,
  MoreVertical,
  Check,
  X,
  Settings,
  Menu,
  ChevronLeft,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useUser();
  const router = useRouter();
  
  const [friends, setFriends] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addNickname, setAddNickname] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  const [channels, setChannels] = useState<any[]>([]);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/users/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (e) {}
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchFriends();
      fetchChannels();
      const interval = setInterval(() => {
        fetchFriends();
        fetchChannels();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    try {
      const res = await fetch('/api/users/add-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetNickname: addNickname }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddSuccess('Заявка отправлена!');
      setAddNickname('');
      fetchFriends();
    } catch (err: any) {
      setAddError(err.message);
    }
  };

  const handleAcceptRequest = async (friendshipId: string, accept: boolean) => {
    try {
      await fetch('/api/users/accept-friend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId, accept }),
      });
      fetchFriends();
    } catch (e) {}
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setChannelError('');
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: channelName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChannelName('');
      setIsCreateChannelModalOpen(false);
      fetchChannels();
    } catch (err: any) {
      setChannelError(err.message);
    }
  };

  if (loading || !user) return <div className="h-screen bg-background" />;

  const acceptedFriends = friends.filter(f => 
    f.status === 'accepted' && 
    f.user.nickname.toLowerCase().includes(searchInput.toLowerCase())
  );
  const pendingRequests = friends.filter(f => f.status === 'pending' && !f.isRequester);
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background relative font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
            animate={isMobile ? { x: 0 } : { width: '340px', opacity: 1 }}
            exit={isMobile ? { x: '-100%' } : { width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`surface-panel m-2 mr-0 rounded-2xl flex flex-col z-50 ${isMobile ? 'fixed inset-y-0 left-0 w-[300px] shadow-2xl m-0 rounded-none border-r border-border/50 h-full' : 'relative'}`}
          >
            {isMobile && (
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 -right-12 p-3 bg-primary text-white rounded-r-2xl shadow-xl active:scale-95 transition-transform">
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Profile Header */}
            <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10 backdrop-blur-md">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-600 flex flex-shrink-0 items-center justify-center text-primary-foreground font-bold shadow-lg">
                  {user.nickname[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                    {user.nickname}
                    {user.isVerified && <div className="text-blue-400 w-4 h-4 flex items-center justify-center bg-blue-400/10 rounded-full text-[10px]" title="Верифицирован">✓</div>}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{user.role === 'admin' ? 'Контроль' : 'Статус: OK'}</div>
                </div>
              </div>
              <button onClick={logout} className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90" title="Выйти">
                <LogOut size={20} />
              </button>
            </div>

            {/* Actions & Search */}
            <div className="p-4 border-b border-border/50 bg-muted/5 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {user.role === 'admin' && (
                  <Link href="/admin" className="col-span-2 flex items-center gap-2 justify-center py-2.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]">
                    <Shield size={16} />
                    АДМИН-ПАНЕЛЬ
                  </Link>
                )}
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 justify-center py-2.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                >
                  <UserPlus size={16} />
                  ДРУЗЬЯ
                </button>
                <Link 
                  href="/settings"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  className="flex items-center gap-2 justify-center py-2.5 bg-muted hover:bg-muted-foreground/10 text-foreground rounded-xl text-xs font-bold transition-all hover:scale-[1.02]"
                >
                  <Settings size={16} />
                  НАСТРОЙКИ
                </Link>
              </div>

              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Поиск контактов и каналов..."
                  className="w-full bg-input/40 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar pb-10">
              {pendingRequests.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3 px-2 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    Заявки ({pendingRequests.length})
                  </h3>
                  <div className="space-y-1">
                    {pendingRequests.map(req => (
                      <div key={req.friendshipId} className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm">
                        <span className="text-sm font-bold truncate">{req.user.nickname}</span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleAcceptRequest(req.friendshipId, true)} className="p-2 bg-green-500/20 text-green-500 hover:bg-green-500/40 rounded-xl transition-all active:scale-90 shadow-sm">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleAcceptRequest(req.friendshipId, false)} className="p-2 bg-destructive/20 text-destructive hover:bg-destructive/40 rounded-xl transition-all active:scale-90 shadow-sm">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 px-2">Друзья ({acceptedFriends.length})</h3>
                {acceptedFriends.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 text-center py-6 opacity-40 italic">Контакты не найдены</div>
                ) : (
                  <div className="space-y-1">
                    {acceptedFriends.map((friend, i) => (
                      <motion.div key={friend.friendshipId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                        <Link 
                          href={`/chat/${friend.user.id}`}
                          onClick={() => isMobile && setIsSidebarOpen(false)}
                          className="relative flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/5 hover:translate-x-1 transition-all group border border-transparent hover:border-primary/10"
                        >
                          <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-muted-foreground/10 flex flex-shrink-0 items-center justify-center text-foreground font-bold uppercase shadow-inner group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              {friend.user.nickname[0]}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-[3px] border-background shadow-lg" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                              {friend.user.nickname}
                              {friend.user.isVerified && <span className="text-blue-400 text-[10px]">✓</span>}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate opacity-60 group-hover:opacity-100 transition-opacity">В сети • Кликни для чата</div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between px-2 mb-3">
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Каналы ({filteredChannels.length})</h3>
                  <button onClick={() => setIsCreateChannelModalOpen(true)} className="w-6 h-6 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center font-bold text-lg leading-none shadow-sm active:scale-90">+</button>
                </div>
                {filteredChannels.length === 0 ? (
                  <div className="text-xs text-muted-foreground px-2 py-4 opacity-40 text-center italic">Пусто</div>
                ) : (
                  <div className="space-y-1">
                    {filteredChannels.map((channel: any) => (
                      <Link key={channel.id} href={`/channel/${channel.id}`} onClick={() => isMobile && setIsSidebarOpen(false)} className="relative flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-500/5 hover:translate-x-1 transition-all group border border-transparent hover:border-indigo-500/10">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex flex-shrink-0 items-center justify-center text-indigo-500 font-black text-xl group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">#</div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                            {channel.name}
                            {channel.isVerified && <span className="text-blue-400 text-[10px]" title="Официальный">✓</span>}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate opacity-60">Публичный эфир</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 relative m-2 rounded-2xl overflow-hidden surface-panel transition-all duration-300 shadow-xl border border-border/20 ${!isSidebarOpen && !isMobile ? 'ml-2' : ''}`}>
        {!isSidebarOpen && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute top-5 left-5 p-3 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl z-40 transition-all shadow-lg active:scale-95"
          >
            <Menu size={24} />
          </motion.button>
        )}
        {children}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="surface-panel p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-border/50 relative">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Найти друзей</h2>
              <p className="text-xs text-muted-foreground mb-6 opacity-60 uppercase tracking-widest font-bold">Введите никнейм</p>
              <form onSubmit={handleAddFriend} className="space-y-4">
                <input type="text" value={addNickname} onChange={e => setAddNickname(e.target.value)} placeholder="Напр: VibeCoder" className="w-full bg-input/50 border border-border/50 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium" required />
                {addError && <p className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-xl">{addError}</p>}
                {addSuccess && <p className="text-green-500 text-sm font-bold bg-green-500/10 p-3 rounded-xl">{addSuccess}</p>}
                <button type="submit" className="w-full py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-lg active:scale-95 transition-all hover:shadow-primary/30 uppercase tracking-widest text-sm">Отправить запрос</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isCreateChannelModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="surface-panel p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-border/50 relative">
              <button onClick={() => setIsCreateChannelModalOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"><X size={24} /></button>
              <h2 className="text-2xl font-black mb-1 bg-gradient-to-indigo-500 from-indigo-500 to-blue-500 bg-clip-text text-transparent">Создать канал</h2>
              <p className="text-xs text-muted-foreground mb-6 opacity-60 uppercase tracking-widest font-bold">Публичное вещание</p>
              <form onSubmit={handleCreateChannel} className="space-y-4">
                <input type="text" value={channelName} onChange={e => setChannelName(e.target.value)} placeholder="Название канала" className="w-full bg-input/50 border border-border/50 rounded-2xl px-5 py-4 text-foreground focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium" required />
                {channelError && <p className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-xl">{channelError}</p>}
                <button type="submit" className="w-full py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all hover:shadow-indigo-500/30 uppercase tracking-widest text-sm">Запустить канал</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
