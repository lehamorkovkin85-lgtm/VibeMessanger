'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@/components/UserProvider';
import { useParams } from 'next/navigation';
import { Send, Smile, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { Emoji, EmojiStyle, Categories } from 'emoji-picker-react';
import PollModal from '@/components/PollModal';
import PollContent from '@/components/PollContent';
import RichMessage from '@/components/RichMessage';


export default function ChatPage() {
  const { user } = useUser();
  const params = useParams();
  const targetUserId = params.userId as string;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${targetUserId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setError('');
        setMessages(data.messages || []);
      }
    } catch (e) {
      setError('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && targetUserId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // Polling for testing interface
      return () => clearInterval(interval);
    }
  }, [user, targetUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await sendWithPoll(inputText, 'text');
  };

  const sendWithPoll = async (text: string, type: 'text' | 'poll', pollData?: any) => {
    const optimisticMessage = {
      id: Date.now().toString(),
      senderId: user?.id,
      receiverId: targetUserId,
      text: text,
      type: type,
      pollData: pollData,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setInputText('');
    setShowEmojiPicker(false);
    setIsPollModalOpen(false);

    try {
      const res = await fetch(`/api/chat/${targetUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type, pollData }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        fetchMessages();
      }
    } catch (e) {
      setError('Ошибка отправки');
      fetchMessages();
    }
  };

  const handleCreatePoll = async (question: string, options: string[]) => {
    const pollData = {
      question,
      options: options.map(opt => ({
        id: Math.random().toString(36).substr(2, 9),
        text: opt,
        votes: []
      }))
    };
    await sendWithPoll(question, 'poll', pollData);
  };

  const onEmojiClick = (emojiObject: any) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error && error.includes('друзьями')) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground opacity-50">
            Здесь пока нет сообщений. Напишите первым!
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const showTail = i === messages.length - 1 || messages[i + 1]?.senderId !== msg.senderId;
              return (
                <motion.div 
                  key={msg.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10, originX: isMe ? 1 : 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] px-4 py-2 ${
                      isMe 
                        ? 'bg-primary text-primary-foreground rounded-2xl' 
                        : 'bg-muted/80 backdrop-blur-md border border-border/50 text-foreground rounded-2xl'
                    } ${
                      showTail 
                        ? isMe ? 'rounded-br-sm' : 'rounded-bl-sm'
                        : ''
                    } shadow-lg`}
                  >
                    <div className="break-words text-[15px] leading-relaxed">
                      {msg.type === 'poll' && msg.pollData ? (
                        <PollContent 
                          messageId={msg.id} 
                          pollData={msg.pollData} 
                          currentUserId={user?.id || ''} 
                          isMe={isMe} 
                        />
                      ) : (
                        <RichMessage text={msg.text} />
                      )}
                    </div>
                    <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="text-center text-destructive text-sm p-2 bg-destructive/10">{error}</div>}

      <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full left-4 mb-4 z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-border/50">
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              theme={'dark' as any}
              emojiStyle={EmojiStyle.APPLE}
              lazyLoadEmojis={true}
              searchPlaceHolder="Поиск эмодзи..."
              previewConfig={{ showPreview: false }}
              categories={[
                { name: 'Недавние', category: Categories.SUGGESTED },
                { name: 'Эмоции', category: Categories.SMILEYS_PEOPLE },
                { name: 'Животные', category: Categories.ANIMALS_NATURE },
                { name: 'Еда', category: Categories.FOOD_DRINK },
                { name: 'Спорт', category: Categories.ACTIVITIES },
                { name: 'Места', category: Categories.TRAVEL_PLACES },
                { name: 'Объекты', category: Categories.OBJECTS },
                { name: 'Символы', category: Categories.SYMBOLS },
                { name: 'Флаги', category: Categories.FLAGS },
              ]}
            />
          </div>
        )}
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-full flex-shrink-0 transition-colors ${showEmojiPicker ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-primary hover:bg-muted'}`}
          >
            <Smile size={24} />
          </button>
          <button
            type="button"
            onClick={() => setIsPollModalOpen(true)}
            className="p-3 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            title="Создать опрос"
          >
            <BarChart2 size={24} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-input/50 border border-border rounded-full px-6 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm backdrop-blur-sm transition-all"
            autoComplete="off"
            onClick={() => {
              setShowEmojiPicker(false);
              setIsPollModalOpen(false);
            }}
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-full flex-shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <Send size={20} />
          </button>
        </form>
        <PollModal 
          isOpen={isPollModalOpen} 
          onClose={() => setIsPollModalOpen(false)} 
          onSubmit={handleCreatePoll} 
        />
      </div>
    </div>
  );
}
