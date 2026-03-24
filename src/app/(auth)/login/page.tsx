'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserProvider';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка входа');

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
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 1, bounce: 0.3 }}
        className="w-full max-w-[450px] p-10 z-10 glass rounded-[2.5rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-3xl"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] transform hover:rotate-12 transition-transform duration-500"
          >
            <LogIn size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent tracking-tight">VIBE MESSANGER</h1>
          <p className="text-muted-foreground mt-3 text-sm font-medium opacity-60 uppercase tracking-widest">Digital Realm Awaits</p>
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
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Space</label>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 focus-within:border-primary/50 transition-all">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-12 py-4 text-foreground focus:outline-none font-medium placeholder:text-muted-foreground/30 transition-all"
                placeholder="commander@earth.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2 group">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Security Key</label>
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
             {/* Gradient Overlay for Button */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative text-black font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  AUTH IN PROGRESS
                </>
              ) : (
                <>ENTER PORTAL <Sparkles size={16} /></>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground font-medium opacity-50 uppercase tracking-widest">New to the vibe?</p>
          <Link href="/register" className="inline-block mt-3 text-sm font-black text-white hover:text-primary transition-colors underline-offset-8 decoration-primary/50 underline">
            GENERATE IDENTITY
          </Link>
        </div>
      </motion.div>
      
      {/* Decorative Text */}
      <div className="fixed bottom-10 left-10 text-[100px] font-black text-white/5 leading-none select-none pointer-events-none uppercase">Vibe</div>
      <div className="fixed top-10 right-10 text-[100px] font-black text-white/5 leading-none select-none pointer-events-none uppercase">Msg</div>
    </div>
  );
}
