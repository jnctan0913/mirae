'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingChatBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  isOpen,
  onToggle,
  unreadCount = 0,
}) => {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label={isOpen ? 'Close chat' : 'Open chat with Mirae'}
    >
      <div className="relative">
        {/* Main bubble */}
        <div
          className={`
            flex items-center justify-center rounded-full shadow-lg transition-all duration-300
            ${
              isOpen
                ? 'w-14 h-14 bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]'
                : 'w-16 h-16 bg-gradient-to-br from-[#9BCBFF] to-[#C7B9FF] border-2 border-white hover:scale-110 hover:shadow-xl'
            }
          `}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-slate-700" />
          ) : (
            <MessageCircle className="w-7 h-7 text-white" />
          )}
        </div>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Chat with Mirae
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800" />
          </div>
        )}
      </div>
    </button>
  );
};
