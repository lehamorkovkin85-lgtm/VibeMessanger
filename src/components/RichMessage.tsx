'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

type RichMessageProps = {
  text: string;
};

// Simple link to image converter
const isImageUrl = (url: string) => {
  return (url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null);
};

const EmojiText = ({ children }: { children: string }) => {
  if (typeof children !== 'string') return <>{children}</>;
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(children)).map(s => s.segment);
  
  return segments.map((char, i) => {
    if (/\p{Extended_Pictographic}/u.test(char)) {
      const unified = [...char].map(c => c.codePointAt(0)?.toString(16)).filter(Boolean).join('-');
      const cleanUnified = unified.replace(/-fe0f$/i, '');
      return (
        <span key={i} className="inline-flex items-center mx-[1px] translate-y-[2px]">
          <Emoji unified={cleanUnified} emojiStyle={EmojiStyle.APPLE} size={20} />
        </span>
      );
    }
    return <span key={i}>{char}</span>;
  });
};

export default function RichMessage({ text }: RichMessageProps) {
  const imageUrlMatch = text.match(/(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif|\.webp))/i);
  const imageUrl = imageUrlMatch ? imageUrlMatch[0] : null;

  return (
    <div className="space-y-2">
      <div className="prose prose-sm prose-invert max-w-none break-words">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <div className="m-0 leading-relaxed">{children}</div>,
            // Custom text renderer to inject emojis!
            text: ({ children }: any) => <EmojiText>{children}</EmojiText>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
            code: ({ children }) => <code className="bg-black/30 px-1 py-0.5 rounded font-mono text-[0.8em]">{children}</code>,
            pre: ({ children }) => <pre className="bg-black/30 p-2 rounded-lg font-mono text-[0.8em] overflow-x-auto my-2 border border-white/5">{children}</pre>
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
      
      {imageUrl && (
        <div className="mt-3 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group bg-black/40 max-w-[90%]">
          <img src={imageUrl} alt="Attached" className="max-w-full h-auto max-h-[350px] hover:scale-[1.03] transition-transform duration-700 cursor-pointer object-cover" />
        </div>
      )}
    </div>
  );
}
