'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

type PollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string, options: string[]) => void;
};

export default function PollModal({ isOpen, onClose, onSubmit }: PollModalProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every(o => o.trim())) {
      onSubmit(question, options);
      setQuestion('');
      setOptions(['', '']);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.9, y: 20 }} 
        className="surface-panel p-8 w-full max-w-sm relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X size={20} />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="text-primary">📊</span>
          Создать опрос
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Вопрос</label>
            <input 
              type="text" 
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Введите вопрос..."
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Варианты ответа</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="text" 
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  placeholder={`Вариант ${i + 1}`}
                  className="flex-1 bg-input/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveOption(i)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={options.length <= 2}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            {options.length < 5 && (
              <button 
                type="button" 
                onClick={handleAddOption}
                className="w-full py-2 border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-all flex items-center justify-center gap-2 rounded-lg"
              >
                <Plus size={14} />
                Добавить вариант
              </button>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold hover:bg-muted rounded-xl transition-colors">Отмена</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-[0_0_15px_rgba(157,80,255,0.3)]">Создать</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
