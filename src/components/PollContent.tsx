'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type PollData = {
  question: string;
  options: { id: string; text: string; votes: string[] }[];
};

type PollProps = {
  messageId: string;
  pollData: PollData;
  currentUserId: string;
  isMe: boolean;
};

export default function PollContent({ messageId, pollData, currentUserId, isMe }: PollProps) {
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = pollData.options.reduce((acc, opt) => acc + opt.votes.length, 0);
  const userVotedId = pollData.options.find(opt => opt.votes.includes(currentUserId))?.id;

  const handleVote = async (optionId: string) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await fetch(`/api/messages/${messageId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
    } catch (e) {
      console.error('Vote error:', e);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`space-y-4 w-full p-4 rounded-xl ${isMe ? 'bg-white/10' : 'bg-primary/5'}`}>
      <h3 className="font-bold text-lg leading-tight">{pollData.question}</h3>
      <div className="space-y-2">
        {pollData.options.map(option => {
          const voteCount = option.votes.length;
          const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100);
          const isSelected = userVotedId === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting}
              className={`relative w-full text-left p-3 rounded-lg border border-white/10 overflow-hidden group transition-all active:scale-[0.98] ${
                isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
              }`}
            >
              {/* Progress Bar Background */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`absolute inset-0 opacity-20 ${isMe ? 'bg-white' : 'bg-primary'}`}
                transition={{ type: "spring", bounce: 0, duration: 0.8 }}
              />
              
              <div className="relative flex justify-between items-center z-10">
                <span className="font-medium">{option.text}</span>
                <span className="text-xs opacity-60 font-mono">{voteCount} • {percentage}%</span>
              </div>
              
              {isSelected && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-primary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter shadow-sm">
                  Ваш голос
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-[10px] opacity-40 uppercase tracking-widest text-right">
        Всего голосов: {totalVotes}
      </div>
    </div>
  );
}
