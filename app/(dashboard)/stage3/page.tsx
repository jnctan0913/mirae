// app/(dashboard)/stage3/page.tsx - UPDATED WITH CONTEXT AWARENESS

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChatMessage, 
  ConversationPhase, 
  YearLevel, 
  SelectionStatus,
  TriggerReason,
} from '@/lib/types/skillTranslation';
import { useLanguageStore } from '@/lib/stores/languageStore';

// Translations
const translations = {
  ko: {
    title: 'Skill Translation',
    subtitle: '선택한 과목으로 어떤 역량을 키워갈지 함께 이야기해봐요',
    placeholder: '생각을 나눠주세요...',
    send: '전송',
    finish: '대화 마치기',
    starting: '대화를 시작하고 있어요...',
    error: '죄송해요, 다시 한번 말씀해주시겠어요?',
  },
  en: {
    title: 'Skill Translation',
    subtitle: "Let's talk about what skills you'll build through your chosen courses",
    placeholder: 'Share your thoughts...',
    send: 'Send',
    finish: 'Finish conversation',
    starting: 'Starting conversation...',
    error: 'Sorry, could you say that again?',
  },
};

export default function SkillTranslationPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<ConversationPhase>('recap');
  const [, setCompletedPhases] = useState<Set<ConversationPhase>>(new Set(['recap']));
  const [, setSource] = useState<'openai' | 'fallback' | 'mock'>('openai');
  const [useMockMode, setUseMockMode] = useState(false);
  
  const t = translations[language];
  
  // Get user context - UPDATED TO INCLUDE NEW FIELDS
  const getUserContext = () => {
    // TODO: Replace with actual user store
    // For now, you can configure this based on your demo needs
    
    // EXAMPLE 1: Year 1 student who just selected courses
    return {
      name: 'Min-soo',
      yearLevel: 1 as YearLevel,
      selectionStatus: 'completed' as SelectionStatus,
      triggerReason: 'reflection' as TriggerReason,
      currentSemester: '2025-Spring',
      courses: ['디자인 사고', '데이터 분석', '미술과 삶'],
      keywords: ['Curious explorer', 'Empathy-driven', 'Visual thinker'],
      strengths: {
        energizers: ['문제 해결', '사람 돕기'],
        joys: ['창의적 작업'],
      },
      interests: ['UX Design', 'Social Entrepreneurship'],
    };
    
    /* EXAMPLE 2: Year 1 student BEFORE selection
    return {
      name: 'Ji-won',
      yearLevel: 1,
      selectionStatus: 'not_started',
      triggerReason: 'exploration',
      courses: [],  // No courses yet
      keywords: ['Analytical', 'Curious'],
      strengths: { energizers: ['분석하기'] },
      interests: [],
    };
    */
    
    /* EXAMPLE 3: Year 2 student reconsidering
    return {
      name: 'Soo-jin',
      yearLevel: 2,
      selectionStatus: 'completed',
      triggerReason: 'doubt',
      courses: ['경제학', '통계학'],
      keywords: ['Organized', 'Practical'],
      strengths: { energizers: ['계획 세우기'] },
      interests: ['Business', 'Finance'],
    };
    */
    
    /* EXAMPLE 4: Year 3 student with pressure
    return {
      name: 'Hyun-woo',
      yearLevel: 3,
      selectionStatus: 'completed',
      triggerReason: 'pressure',
      courses: ['물리학', '화학'],
      keywords: ['Diligent', 'Responsible'],
      strengths: { energizers: ['문제 해결'] },
      interests: ['Medicine'],
    };
    */
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (messages.length === 0) {
      handleSendMessage(undefined, true);
    }
  }, []);
  
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
    
    // Add user message to state if not initial
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
          userContext,  // Now includes yearLevel, selectionStatus, etc.
          currentTurn,
          forceRealAPI: false,
          language,  // Pass language to API
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
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentTurn(data.currentTurn || currentTurn + 1);
      
      // Update phase - always update to ensure progress bar reflects changes
      const newPhase = data.phase || currentPhase;
      
      // If no phase returned, calculate based on turn count (for OpenAI responses)
      const calculatedPhase = newPhase || (() => {
        const turn = data.currentTurn || currentTurn + 1;
        if (turn >= 5) return 'closing';
        if (turn >= 3) return 'articulation';
        return 'recap';
      })();
      
      setCurrentPhase(calculatedPhase);
      
      // Mark phases as completed when moving forward
      if (calculatedPhase !== currentPhase) {
        setCompletedPhases(prev => {
          const updated = new Set(prev);
          updated.add(currentPhase); // Mark old phase as completed
          updated.add(calculatedPhase); // Mark new phase as started
          return updated;
        });
      } else {
        // Same phase, just mark it as in progress
        setCompletedPhases(prev => new Set(prev).add(calculatedPhase));
      }
      
      setSource(data.source);
      
      // Log conversation type for debugging
      if (data.conversationType) {
        console.log(`🎯 Conversation type: ${data.conversationType}`);
      }
      
      if (data.source === 'fallback') {
        console.warn('⚠️ Using fallback responses');
      }
      
    } catch (error) {
      console.error('💥 Chat error:', error);
      
      const emergencyMessage: ChatMessage = {
        role: 'assistant',
        content: t.error,
        timestamp: new Date(),
        source: 'fallback',
      };
      setMessages(prev => [...prev, emergencyMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinish = () => {
    router.push('/dashboard');
  };

  // Simplified for demo: 3 phases instead of 5
  const mainPhases: ConversationPhase[] = ['recap', 'articulation', 'closing'];
  
  // Calculate progress based on turn count and phases
  // For demo: complete after 4 user messages (simplified flow)
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  
  // Progress calculation: mix of phase progress and message count
  // Each user message = ~25% progress (4 messages = 100%)
  const messageProgress = Math.min((userMessageCount / 4) * 100, 100);
  
  // Phase progress: each phase = ~33%
  const phaseIndex = mainPhases.indexOf(currentPhase);
  const phaseProgress = phaseIndex >= 0 
    ? ((phaseIndex + 1) / mainPhases.length) * 100 
    : 0;
  
  // Combined progress (weighted: 60% message count, 40% phase)
  const progressPercentage = Math.min(
    (messageProgress * 0.6) + (phaseProgress * 0.4),
    100
  );
  
  // Determine if conversation is complete
  // For demo: complete after 4 user messages OR reaching closing phase with 2+ messages
  const isConversationComplete = userMessageCount >= 4 || 
                                  (currentPhase === 'closing' && userMessageCount >= 2);
  
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--mirae-gradient)' }}>
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#1f2430]">{t.title}</h1>
            <p className="text-[#1f2430]/70 mt-2">
              {t.subtitle}
            </p>
          </div>
          
          {/* Progress Indicator - Simplified for demo */}
          <div className="mt-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1f2430]/70 font-medium">
                  {language === 'ko' 
                    ? `질문 ${Math.min(userMessageCount + 1, 4)} / 4`
                    : `Question ${Math.min(userMessageCount + 1, 4)} / 4`}
                </span>
                <span className="text-[#1f2430]/70 font-medium">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="bg-white/40 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#C7B9FF] via-[#F4A9C8] to-[#FFD1A8] transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Phase Dots - Simplified to 3 phases */}
            <div className="flex items-center justify-center gap-2">
              {mainPhases.map((phase, idx) => {
                const isCurrent = currentPhase === phase;
                const isPast = mainPhases.indexOf(phase) < mainPhases.indexOf(currentPhase);
                
                return (
                  <div key={phase} className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isPast || isCurrent
                          ? 'bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] scale-110'
                          : 'bg-white/40'
                      }`}
                    />
                    {idx < mainPhases.length - 1 && (
                      <div
                        className={`w-8 h-0.5 transition-all duration-300 ${
                          isPast ? 'bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8]' : 'bg-white/40'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            
            {isConversationComplete && (
              <div className="text-center pt-2">
                <p className="text-sm text-[#1f2430]/70 font-medium">
                  {language === 'ko' 
                    ? '✨ 대화가 완료되었어요. 아래 버튼을 눌러 다음 단계로 진행하세요.'
                    : '✨ Conversation complete! Click below to proceed to the next stage.'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="glass-card rounded-3xl p-6 mb-4 h-[500px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-pulse text-4xl mb-4" style={{ animationDuration: '2s' }}>💬</div>
                <p className="text-[#1f2430]/50">{t.starting}</p>
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
                className={`max-w-[75%] rounded-3xl px-4 py-3 transition-all duration-300 ease-out ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#C7B9FF] to-[#F4A9C8] text-[#1f2430] rounded-br-sm'
                    : 'bg-white/60 text-[#1f2430] rounded-bl-sm backdrop-blur-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                
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
              <div className="bg-white/60 rounded-3xl px-4 py-3 rounded-bl-sm backdrop-blur-sm">
                <div className="flex gap-1">
                  <span 
                    className="w-2 h-2 bg-[#C7B9FF] rounded-full animate-bounce" 
                    style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                  />
                  <span 
                    className="w-2 h-2 bg-[#F4A9C8] rounded-full animate-bounce" 
                    style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                  />
                  <span 
                    className="w-2 h-2 bg-[#FFD1A8] rounded-full animate-bounce" 
                    style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Form - Hide when conversation is complete */}
        {!isConversationComplete && (
          <form onSubmit={handleSendMessage} className="flex gap-3 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-white/40 bg-white/60 backdrop-blur-sm text-[#1f2430] placeholder:text-[#1f2430]/50 focus:border-[#C7B9FF] focus:outline-none focus:ring-2 focus:ring-[#C7B9FF]/20 transition-all duration-300 ease-out"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-[#F4A9C8] to-[#FFD1A8] text-[#1f2430] rounded-2xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{ boxShadow: '0 10px 30px rgba(244, 169, 200, 0.35)' }}
            >
              {t.send}
            </button>
          </form>
        )}
        
        {/* Finish Button - More prominent when complete */}
        <button
          onClick={handleFinish}
          className={`w-full px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-300 ease-out ${
            isConversationComplete
              ? 'bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] text-[#1f2430] hover:scale-[1.02] active:scale-[0.98]'
              : 'glass-card text-[#1f2430] hover:scale-[1.01] active:scale-[0.99]'
          }`}
          style={isConversationComplete ? { boxShadow: '0 10px 30px rgba(199, 185, 255, 0.4)' } : {}}
        >
          {isConversationComplete 
            ? (language === 'ko' ? '다음 단계로 진행하기 →' : 'Continue to Next Stage →')
            : t.finish
          }
        </button>
        
      </div>
    </div>
  );
}
