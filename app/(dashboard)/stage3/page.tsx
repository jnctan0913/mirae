'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatMessage, ConversationPhase } from '@/lib/types/skillTranslation';

/**
 * Stage 3: Skill Translation
 * 
 * Conversational AI that helps students articulate skills they'll build
 * through their course selections.
 * 
 * Features:
 * - Hybrid OpenAI + Fallback approach
 * - Emergency mock mode (Ctrl+M)
 * - Auto-scroll to latest message
 * - Typing indicators
 * - Source indicators (dev mode only)
 */

export default function SkillTranslationPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<ConversationPhase>('recap');
  const [source, setSource] = useState<'openai' | 'fallback' | 'mock'>('openai');
  
  // Mock mode for demo emergency
  const [useMockMode, setUseMockMode] = useState(false);
  
  // Get user context (you'll need to replace this with actual data from your store)
  const getUserContext = () => {
    // TODO: Replace with actual user store
    return {
      name: 'Min-soo',
      courses: ['디자인 사고', '데이터 분석', '미술과 삶'],
      keywords: ['Curious explorer', 'Empathy-driven', 'Visual thinker'],
      strengths: {
        energizers: ['문제 해결', '사람 돕기'],
        joys: ['창의적 작업'],
      },
      interests: ['UX Design', 'Social Entrepreneurship'],
    };
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize conversation with opening message
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        const userContext = getUserContext();
        
        const response = await fetch('/api/skill-translation/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            userContext,
            currentTurn: 0,
            forceRealAPI: false,
          }),
        });
        
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          source: data.source,
        };
        
        setMessages([assistantMessage]);
        setCurrentTurn(data.currentTurn || 1);
        setCurrentPhase(data.phase || 'recap');
        setSource(data.source);
      } catch (error) {
        console.error('💥 Chat initialization error:', error);
        const emergencyMessage: ChatMessage = {
          role: 'assistant',
          content: '죄송해요, 다시 한번 말씀해주시겠어요?',
          timestamp: new Date(),
          source: 'fallback',
        };
        setMessages([emergencyMessage]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Emergency mock mode toggle (Ctrl+M)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        setUseMockMode(!useMockMode);
        console.log(`🚨 MOCK MODE: ${!useMockMode ? 'ON' : 'OFF'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [useMockMode]);
  
  const handleSendMessage = async (
    e?: React.FormEvent,
    isInitial = false
  ) => {
    e?.preventDefault();
    
    if (!isInitial && !input.trim()) return;
    
    // Save input value before clearing
    const userInput = input;
    
    // Add user message
    let userMessage: ChatMessage | null = null;
    if (!isInitial) {
      userMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage!]);
      setInput('');
    }
    
    setIsLoading(true);
    
    try {
      const userContext = getUserContext();
      
      // Build messages array for API call
      const messagesForAPI = isInitial 
        ? [] 
        : [...messages, ...(userMessage ? [userMessage] : [])];
      
      const response = await fetch('/api/skill-translation/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesForAPI,
          userContext,
          currentTurn,
          forceRealAPI: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        source: data.source,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentTurn(data.currentTurn || currentTurn + 1);
      setCurrentPhase(data.phase || currentPhase);
      setSource(data.source);
      
      // Log source for monitoring
      if (data.source === 'fallback') {
        console.warn('⚠️ Using fallback responses');
      }
      
    } catch (error) {
      console.error('💥 Chat error:', error);
      
      // Emergency fallback
      const emergencyMessage: ChatMessage = {
        role: 'assistant',
        content: '죄송해요, 다시 한번 말씀해주시겠어요?',
        timestamp: new Date(),
        source: 'fallback',
      };
      setMessages(prev => [...prev, emergencyMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinish = () => {
    // TODO: Save conversation to database
    // TODO: Mark stage 3 as complete
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skill Translation</h1>
              <p className="text-gray-600 mt-2">
                선택한 과목으로 어떤 역량을 키워갈지 함께 이야기해봐요
              </p>
            </div>
            
            {/* Dev Mode Indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                Source: {source}
                {useMockMode && <span className="ml-2 text-red-600">MOCK</span>}
              </div>
            )}
          </div>
          
          {/* Phase Indicator */}
          <div className="mt-4 flex gap-2">
            {(['recap', 'articulation', 'patterns', 'fit-fear', 'closing'] as ConversationPhase[]).map((phase) => (
              <div
                key={phase}
                className={`flex-1 h-2 rounded-full transition-all ${
                  currentPhase === phase
                    ? 'bg-purple-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-4">💬</div>
                <p className="text-gray-400">대화를 시작하고 있어요...</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-purple-500 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
                {/* Show source in dev mode */}
                {process.env.NODE_ENV === 'development' && msg.source && (
                  <div className="text-xs opacity-50 mt-1">
                    {msg.source}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-none">
                <div className="flex gap-1">
                  <span 
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                    style={{ animationDelay: '0ms' }}
                  />
                  <span 
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                    style={{ animationDelay: '150ms' }}
                  />
                  <span 
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex gap-3 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="생각을 나눠주세요..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
        
        {/* Finish Button */}
        <button
          onClick={handleFinish}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
        >
          Finish conversation
        </button>
        
        {/* Hidden Mock Mode Toggle (for demo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              🛠️ Dev Tools
            </p>
            <button
              onClick={() => setUseMockMode(!useMockMode)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm"
            >
              Mock Mode: {useMockMode ? 'ON' : 'OFF'}
            </button>
            <p className="text-xs text-yellow-700 mt-2">
              Press <kbd className="px-2 py-1 bg-white rounded">Ctrl+M</kbd> to toggle
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}
