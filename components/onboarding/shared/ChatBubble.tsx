import React from 'react';

interface ChatBubbleProps {
  sender: 'mirae' | 'student';
  children: React.ReactNode;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, children }) => {
  return (
    <div
      className={[
        'flex',
        sender === 'mirae' ? 'justify-start' : 'justify-end',
      ].join(' ')}
    >
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md',
          sender === 'mirae'
            ? 'bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm'
            : 'bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm',
        ].join(' ')}
      >
        {sender === 'mirae' && (
          <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
        )}
        <div className="text-sm sm:text-base leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

