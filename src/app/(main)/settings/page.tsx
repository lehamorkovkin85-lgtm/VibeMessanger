'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/UserProvider';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const { user, checkAuth } = useUser();
  
  const [themePalette, setThemePalette] = useState(user?.themePalette || 'vibe');
  const [uiStyle, setUiStyle] = useState(user?.uiStyle || 'glass');
  const [statusText, setStatusText] = useState(user?.statusText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Update effect preview immediately
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themePalette);
    document.documentElement.setAttribute('data-style', uiStyle);
  }, [themePalette, uiStyle]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');

    try {
      await fetch('/api/users/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePalette, uiStyle, statusText }),
      });
      await checkAuth(); // Refresh user context
      setSuccess('Настройки успешно сохранены!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent mb-2">Настройки</h1>
          <p className="text-muted-foreground">Персонализируйте внешний вид вашего приложения.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-panel p-8 z-10 relative"
        >
          <AnimatePresence>
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-3 rounded-xl mb-8 text-sm font-medium flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSave} className="space-y-10">
            {/* Status Text */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Текстовый статус
              </label>
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="Что у вас на уме?..."
                className="w-full bg-input/40 border border-border/50 backdrop-blur-md rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-lg"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground/60 px-2 italic">Ваш статус виден всем друзьям в списке контактов.</p>
            </div>

            {/* Theme Palette */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                Цветовая атмосфера
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'vibe', name: 'Сияние', color: 'linear-gradient(135deg, #9d50ff, #6d28d9)', border: '#9d50ff' },
                  { id: 'ocean', name: 'Бездна', color: 'linear-gradient(135deg, #0ea5e9, #0369a1)', border: '#0ea5e9' },
                  { id: 'sunset', name: 'Закат', color: 'linear-gradient(135deg, #f97316, #c2410c)', border: '#f97316' },
                  { id: 'forest', name: 'Изумруд', color: 'linear-gradient(135deg, #10b981, #047857)', border: '#10b981' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemePalette(theme.id as any)}
                    className={`group relative p-1 rounded-2xl transition-all duration-300 ${
                      themePalette === theme.id 
                      ? 'scale-105 shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
                      : 'hover:scale-102 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div 
                      className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                        themePalette === theme.id ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ borderColor: theme.border }}
                    />
                    <div className="surface-panel p-4 flex flex-col items-center gap-3 rounded-[14px]">
                      <div 
                        className="w-12 h-12 rounded-2xl shadow-inner transition-transform group-hover:rotate-12 duration-500" 
                        style={{ background: theme.color }}
                      >
                        <div className="w-full h-full rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* UI Style */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                Визуальный стиль
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'glass', name: 'Стекло', desc: 'Прозрачность и размытие' },
                  { id: 'neomorph', name: 'Нео', desc: 'Объем и мягкие тени' },
                  { id: 'skeuomorph', name: 'Тактил', desc: 'Градиенты и глубина' },
                  { id: 'minimal', name: 'Мини', desc: 'Строгость и контуры' },
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setUiStyle(style.id as any)}
                    className={`group relative p-4 text-left rounded-2xl transition-all duration-300 ${
                      uiStyle === style.id 
                      ? 'bg-primary/10 border-primary ring-1 ring-primary' 
                      : 'surface-panel border-transparent hover:border-border/50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-base font-bold ${uiStyle === style.id ? 'text-primary' : 'text-foreground'}`}>{style.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{style.desc}</span>
                    </div>
                    {uiStyle === style.id && (
                      <div className="absolute top-4 right-4 text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="group relative w-full sm:w-auto bg-primary text-primary-foreground font-bold px-10 py-4 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(157,80,255,0.4)] active:scale-95 disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {isSaving ? 'Сохранение...' : 'Применить настройки'}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
