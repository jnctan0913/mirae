'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface SmartOnboardingChatProps {
  onComplete: () => void;
  onInputChange: (value: string) => void;
  inputValue: string;
  onSend: () => void;
}

export const SmartOnboardingChat: React.FC<SmartOnboardingChatProps> = ({
  onComplete,
  onInputChange,
  inputValue,
  onSend,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "No one else can see what we talk about here. Not teachers, not parents, not friends. Just you and me.\n\nBefore we start, I'd love to know a little about where you're at right now. Cool if I ask a few quick questions?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for send event
  useEffect(() => {
    const handleSend = async () => {
      if (!inputValue.trim() || isLoading) return;

      const userMessage = inputValue.trim();
      onInputChange('');

      // Add user message
      const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);
      setIsLoading(true);
      setConversationCount(prev => prev + 1);

      try {
        // Call AI API
        const response = await fetch('/api/onboarding/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;

                try {
                  const parsed = JSON.parse(data);
                  assistantMessage += parsed.content;
                  setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        }

        // Check if conversation should end (after 4-5 exchanges or specific keywords)
        if (conversationCount >= 4 || assistantMessage.toLowerCase().includes('ready to explore')) {
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      } catch (error) {
        console.error('Chat error:', error);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: "Hmm, I'm having trouble connecting right now. Can you try that again?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('onboardingSmartSend', handleSend as EventListener);
    return () => window.removeEventListener('onboardingSmartSend', handleSend as EventListener);
  }, [inputValue, messages, isLoading, conversationCount, onInputChange, onComplete]);

  return (
    <>
      {messages.map((message, idx) => (
        <div
          key={idx}
          className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md ${
              message.role === 'assistant'
                ? 'bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm'
                : 'bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm'
            }`}
          >
            {message.role === 'assistant' && (
              <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
            )}
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
            <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-[#9BCBFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
};

