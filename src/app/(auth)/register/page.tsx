'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { checkAuth } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');

      await checkAuth();
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black font-sans">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 1, bounce: 0.3 }}
        className="w-full max-w-[450px] p-10 z-10 glass rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ rotate: 20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-rotate-12 transition-transform duration-500"
          >
            <UserPlus size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight uppercase">Присоединяйся к Vibe</h1>
          <p className="text-muted-foreground mt-3 text-sm font-medium opacity-60 uppercase tracking-widest">Создай свой цифровой псевдоним</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-destructive/10 text-destructive text-xs font-bold p-4 rounded-2xl mb-8 text-center border border-destructive/20 flex items-center justify-center gap-2"
            >
              <Sparkles size={14} className="animate-pulse" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-2 group">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Никнейм</label>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 focus-within:border-primary/50 transition-all">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-transparent px-12 py-4 text-foreground focus:outline-none font-medium placeholder:text-muted-foreground/30 transition-all"
                placeholder="Ниндзя"
                required
              />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Почта</label>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 focus-within:border-primary/50 transition-all">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-12 py-4 text-foreground focus:outline-none font-medium placeholder:text-muted-foreground/30 transition-all"
                placeholder="vibe@messenger.ru"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 group">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Мастер-ключ</label>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 focus-within:border-primary/50 transition-all">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent px-12 py-4 text-foreground focus:outline-none font-medium placeholder:text-muted-foreground/30 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-[1.25rem] bg-white py-4.5 text-center transition-all active:scale-[0.98] disabled:opacity-50 mt-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-primary opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative text-black font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  ИНИЦИАЛИЗАЦИЯ...
                </>
              ) : (
                <>СОЗДАТЬ АККАУНТ <Sparkles size={16} /></>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest">Уже есть аккаунт?</p>
          <Link href="/login" className="inline-block mt-3 text-sm font-black text-white hover:text-indigo-400 transition-colors underline-offset-8 decoration-indigo-500/50 underline">
            ВОЙТИ
          </Link>
        </div>
      </motion.div>
      
      {/* Decorative Text */}
      <div className="fixed top-10 left-10 text-[100px] font-black text-white/5 leading-none select-none pointer-events-none uppercase">Вход</div>
      <div className="fixed bottom-10 right-10 text-[100px] font-black text-white/5 leading-none select-none pointer-events-none uppercase">Вайб</div>
    </div>
  );
}
