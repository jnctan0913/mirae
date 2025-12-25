'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';
import { getUserProfile } from '@/lib/userProfile';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface FloatingChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingChatPanel: React.FC<FloatingChatPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('chatWelcome'),
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const welcomeMessage = useMemo(() => t('chatWelcome'), [language, t]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        if (prev[0].content === welcomeMessage) {
          return prev;
        }
        return [{ ...prev[0], content: welcomeMessage }];
      }
      return prev;
    });
  }, [welcomeMessage]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Get user context
      const profile = getUserProfile();

      // Call chat API
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            keywords: profile.keywords || [],
            yearLevel: profile.onboarding?.yearLevel,
            language,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const payload = await response.json();
      const assistantMessage = typeof payload.message === 'string' ? payload.message : '';

      if (assistantMessage) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: assistantMessage, timestamp: new Date() },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: t('chatErrorFallback'),
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t('chatErrorRetry'),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Chat Panel */}
      <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] flex flex-col glass-card rounded-3xl shadow-2xl border border-white/60 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative flex-shrink-0 px-6 py-4 bg-gradient-to-r from-[#9BCBFF]/20 to-[#C7B9FF]/20 border-b border-white/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/asset/Mirae_Icon1.png"
                  alt="Mirae"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Mirae <Sparkles className="w-4 h-4 text-[#9BCBFF]" />
                </h3>
                <p className="text-xs text-slate-600">{t('chatSubtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                  message.role === 'assistant'
                    ? 'bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm'
                    : 'bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm'
                }`}
              >
                {message.role === 'assistant' && (
                  <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
                <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 px-6 py-4 bg-white/50 border-t border-white/60">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatPlaceholder')}
              className="flex-1 rounded-full px-4 py-3 bg-white/95 border-2 border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C7B9FF] focus:border-[#C7B9FF] shadow-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="soft-button px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">{t('chatDisclaimer')}</p>
        </div>
      </div>
    </>
  );
};
