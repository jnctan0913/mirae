// app/(dashboard)/stage3/page.tsx - WITHOUT ORANGE FEEDBACK BOX
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import { loadActivityLogs, saveActivityLogs } from '@/lib/activityLogs';
import Image from 'next/image';
import { Sprout } from 'lucide-react';
import { withBasePath } from '@/lib/basePath';
import type { CardType } from '@/components/MiraeCharacterEvolution';

// Translations
const translations = {
  ko: {
    tag: 'Stage 3 · Reflection',
    title: '성찰 공간',
    subtitle: 'Mirae와의 안전한 대화 공간',
    aiName: 'Mirae',
    privacyNote: '이 대화는 완전히 비밀로 유지됩니다. 교사, 부모님, 친구들 누구도 볼 수 없어요.',
    
    // Semester check-in
    semesterCheckinQuestion: '이번 학기는 어떻게 지내고 있나요?',
    
    // UI
    placeholder: '답변을 입력해주세요...',
    send: '보내기',
    finish: '대화 마치기',
    starting: 'Mirae와 대화를 시작하고 있어요...',
    backToDashboard: '대시보드로 돌아가기',
    yes: '네',
    no: '아니요',
    loading: '생각 중...',
    reflectionComplete: '오늘의 성찰이 완료되었어요.',
    nextSteps: '다음 단계: Stage 4로 이동하기',
    goToStage4: 'Stage 4로 이동',
    optionsNote: '과목 선택/적합도 분석이 필요하면 옵션 페이지로 돌아갈 수 있어요.',
    conversationStartGreeting: '반가워요! 이야기 나눠줘서 고마워요.',
    saveConversation: '대화 저장하기',
    conversationSaved: '대화가 저장되었어요!',
    saving: '저장 중...',
    downloadResult: '결과 다운로드',
    aiThinking: 'Mirae가 생각하고 있어요...',
    aiFeedback: 'Mirae의 피드백',
    exportSuccess: '결과 파일이 다운로드되었어요!',
    errorGeneratingFeedback: '피드백 생성 중 오류가 발생했습니다.',
    goBack: '뒤로 가기',
    continueToNext: '다음으로 계속하기',
    keywordsTitle: '대화 키워드',
    keywordsEmpty: '아직 키워드가 없어요.',
  },
  en: {
    tag: 'Stage 3 · Reflection',
    title: 'Reflection Space',
    subtitle: 'Safe conversation space with Mirae',
    aiName: 'Mirae',
    privacyNote: 'This conversation is completely private. Not teachers, not parents, not friends. Just you and me.',
    
    // Semester check-in
    semesterCheckinQuestion: 'How are you doing this semester?',
    
    // UI
    placeholder: 'Type your response here...',
    send: 'Send',
    finish: 'Finish conversation',
    starting: 'Starting conversation with Mirae...',
    backToDashboard: 'Back to Dashboard',
    yes: 'Yes',
    no: 'No',
    loading: 'Thinking...',
    reflectionComplete: 'Today\'s reflection is complete.',
    nextSteps: 'Next Step: Move to Stage 4',
    goToStage4: 'Go to Stage 4',
    optionsNote: 'If you want to select courses or analyze fit, you can return to the Options page.',
    conversationStartGreeting: 'Hi! I\'m glad you want to talk.',
    saveConversation: 'Save Conversation',
    conversationSaved: 'Conversation saved!',
    saving: 'Saving...',
    downloadResult: 'Download Result',
    aiThinking: 'Mirae is thinking...',
    aiFeedback: 'Mirae\'s Feedback',
    exportSuccess: 'Result file downloaded!',
    errorGeneratingFeedback: 'Error generating feedback.',
    goBack: 'Go Back',
    continueToNext: 'Continue to Next',
    keywordsTitle: 'Conversation Keywords',
    keywordsEmpty: 'No keywords yet.',
  },
};

type ConversationState = 'in_progress' | 'complete';

type ReflectionCardDraft = {
  type: CardType;
  title: string;
  description: string;
  tags?: string[];
};

type Message = {
  role: 'ai' | 'user';
  message: string;
  timestamp?: Date;
};

const SUPPORT_FALLBACK =
  'Thanks for sharing. I hear you. If you want, tell me a bit more about what feels most important to you right now.';

export default function Stage3Page() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initKeyRef = useRef<string | null>(null);
  const hasSavedRef = useRef(false);
  const { language } = useLanguageStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('in_progress');
  const [isSaving, setIsSaving] = useState(false);
  const [, setSaveMessage] = useState<string>('');
  const [aiFeedback] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const t = translations[language];
  const flowT = translations.en;
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update keywords whenever messages change
  useEffect(() => {
    const userText = messages.filter((msg) => msg.role === 'user').map((msg) => msg.message).join(' ');
    if (userText) {
      const extractedKeywords = extractKeywords(userText);
      setKeywords(extractedKeywords);
    }
  }, [messages]);

  // Hydrate language store
  useEffect(() => {
    setIsHydrated(useLanguageStore.persist.hasHydrated());
    const unsubscribe = useLanguageStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    return unsubscribe;
  }, []);
  
  // Initialize conversation
  useEffect(() => {
    if (!isHydrated) return;

    const profile = getUserProfile();
    const yearLevel = profile.yearLevel || 1;
    const semesterLevel = profile.currentSemester || 'unknown';
    const initKey = `${yearLevel}-${semesterLevel}`;
    if (initKeyRef.current === initKey && messages.length > 0) return;
    initKeyRef.current = initKey;
    
    setTimeout(() => {
      addAIMessage(buildIntroMessage(yearLevel, profile.currentSemester, flowT.semesterCheckinQuestion));
      setConversationState('in_progress');
    }, 500);
  }, [isHydrated, language, flowT.conversationStartGreeting, flowT.semesterCheckinQuestion]);

  // Helper functions
  const addAIMessage = (content: string) => {
    const newMessage: Message = {
      role: 'ai',
      message: content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      role: 'user',
      message: content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getYearLabel = (yearLevel: number) => `Year ${yearLevel}`;

  const getSemesterLabel = (semesterLevel: string | null) => {
    if (!semesterLevel) return '';
    const labels = { sem1: 'Semester 1', sem2: 'Semester 2' };
    return labels[semesterLevel as 'sem1' | 'sem2'] || '';
  };

  const buildIntroMessage = (yearLevel: number, semesterLevel: string | null, prompt: string) => {
    const yearLabel = getYearLabel(yearLevel);
    const semesterLabel = getSemesterLabel(semesterLevel);
    const semesterText = semesterLabel ? `, ${semesterLabel}` : '';
    return `${flowT.conversationStartGreeting} I see you're in ${yearLabel}${semesterText}.\n${prompt}`;
  };

  const getYearLevelFromProfile = () => getUserProfile().yearLevel || 1;
  const getYearIdFromProfile = () => `year${getYearLevelFromProfile()}`;

  const safeParseJson = (raw: string) => {
    const cleaned = raw.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleaned);
  };

  const generateReflectionCards = async (
    transcript: string,
    insights: string[],
    keywords: string[]
  ): Promise<ReflectionCardDraft[]> => {
    try {
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'Return JSON only. Create reflection cards only when clearly supported by the transcript and insights; otherwise return an empty array. Use types: StrengthPattern, CuriosityThread, Experience, ProofMoment, ThenVsNow, ValueSignal. Each card must include: type, title (max 5 words), description (1 sentence), tags (1-3 short words). Skip unsupported categories.',
            },
            {
              role: 'user',
              content: `Transcript:\n${transcript}\n\nInsights:\n${insights.join('\n')}\n\nKeywords:\n${keywords.join(', ')}`,
            },
          ],
          context: {
            language: 'en',
            yearLevel: getYearIdFromProfile(),
          },
        }),
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const parsed = safeParseJson(data?.message || '[]');
      const cards = Array.isArray(parsed) ? parsed : parsed.cards;
      if (!Array.isArray(cards)) return [];

      return cards
        .filter((card) => card?.type && card?.title && card?.description)
        .slice(0, 6);
    } catch (error) {
      console.error('Error generating reflection cards:', error);
      return [];
    }
  };

  const generateSupportMessage = async (userMessage: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const recentMessages = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'ai')
        .slice(-8)
        .map((msg) => ({
          role: msg.role === 'ai' ? 'assistant' : 'user',
          content: msg.message,
        }));

      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are Mirae, a warm mentor for a high school student. Provide emotional support, gentle reflection, and one thoughtful suggestion. Respond naturally in English, 2-3 sentences max. End with one open-ended question. Avoid sounding scripted.',
            },
            ...recentMessages,
            { role: 'user', content: userMessage },
          ],
          context: {
            language: 'en',
            yearLevel: getYearIdFromProfile(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      if (data?.message) {
        return data.message as string;
      }
      return SUPPORT_FALLBACK;
    } catch (error) {
      console.error('Error calling chat API:', error);
      return SUPPORT_FALLBACK;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Handle sending user message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    addUserMessage(userMessage);

    setIsLoading(true);
    try {
      const nextMessage = await generateSupportMessage(userMessage);
      addAIMessage(nextMessage);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      addAIMessage(SUPPORT_FALLBACK);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract keywords from text
  const extractKeywords = (text: string): string[] => {
    const commonWords = new Set(language === 'ko' 
      ? ['나는', '저는', '합니다', '있습니다', '입니다', '있어요', '입니다', '그리고', '하지만', '그래서']
      : ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'about', 'will', 'would', 'could']
    );
    
    const words = text.toLowerCase()
      .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));
    
    const wordCounts: Record<string, number> = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  };

  // Save conversation data using the API
  const saveConversationData = async () => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;
    setIsSaving(true);

    try {
      // Use the current keywords from state (user may have removed some)
      const transcript = messages
        .map((msg) => `${msg.role === 'ai' ? 'Mirae' : 'Student'}: ${msg.message}`)
        .join('\n');
      let insights: string[] = [];
      try {
        const insightResponse = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation: messages.map((msg) => ({
              role: msg.role,
              message: msg.message,
            })),
            language: 'en',
            userYear: getYearIdFromProfile(),
          }),
        });
        const insightData = await insightResponse.json();
        if (insightData?.feedback?.length) {
          insights = insightData.feedback;
        }
      } catch (error) {
        console.error('Error generating reflection insights:', error);
      }
      
      // Create summary
      const year = getYearLevelFromProfile();
      let summary = '';
      const semesterLabel = getSemesterLabel(getUserProfile().currentSemester);
      const semesterText = semesterLabel ? `, ${semesterLabel}` : '';
      summary = `Year ${year} student. Reflected on course uncertainty and motivation this semester${semesterText}.`;
      
      // Create final result object
      const finalResult = {
        user: {
          id: getUserProfile().id || 'anonymous',
          name: getUserProfile().name || 'User',
          year: getYearIdFromProfile(),
          conversationDate: new Date().toISOString(),
          language: 'en'
        },
        responses: {},
        feedback: aiFeedback,
        insights,
        summary,
        keywords,
        transcript,
        conversation: messages.map(msg => ({
          role: msg.role,
          message: msg.message,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
        })),
        metadata: {
          version: '1.0',
          stage: 'stage3',
          exportedAt: new Date().toISOString(),
          conversationState,
          totalMessages: messages.length
        }
      };
      
      const reflectionSession = {
        id: `reflection-${Date.now()}`,
        createdAt: new Date().toISOString(),
        summary,
        insights,
        keywords,
        transcript,
      };
      const existingSessions = getUserProfile().reflectionSessions ?? [];

      const profile = getUserProfile();
      const existingCards = (profile.collection?.cards ?? []) as Record<string, unknown>[];
      const newCards = await generateReflectionCards(transcript, insights, keywords);
      const normalizedExisting = new Set(
        existingCards
          .map((card) => `${String(card.type || '').toLowerCase()}::${String(card.title || '').toLowerCase()}`)
          .filter((key) => key !== '::')
      );
      const reflectionInsightCards = newCards
        .filter(
          (card) =>
            !normalizedExisting.has(`${card.type.toLowerCase()}::${card.title.toLowerCase()}`)
        )
        .map((card) => ({
          id: `stage3-reflection-insight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          stage: 'C',
          type: card.type,
          title: card.title,
          description: card.description,
          rarity: 'Common',
          unlocked: true,
          tags: card.tags?.length ? card.tags : keywords.slice(0, 3),
          createdFrom: 'Stage 3: Reflection Insights',
          content: { transcript, insights, summary },
        }));

      // 1. Save to user profile
      updateUserProfile({
        stage3Responses: finalResult,
        stage3Completed: true,
        reflectionSessions: [...existingSessions, reflectionSession],
        collection: {
          ...profile.collection,
          cards: [...existingCards, ...reflectionInsightCards],
        },
      });

      const existingLogs = loadActivityLogs();
      const reflectionLog = {
        id: `reflection-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        title: 'Stage 3 Reflection',
        scopeStage: 'C' as const,
        activityType: 'Reflection' as const,
        source: 'Mirae' as const,
        shortReflection: insights[0] || summary,
      };
      saveActivityLogs([...existingLogs, reflectionLog]);
      
      // 2. Auto-save to file system via API
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const userId = getUserProfile().id || 'user';
      const filename = `stage3-summary-${userId}-${timestamp}.json`;
      
      const saveResponse = await fetch('/api/save-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationData: finalResult,
          filename: filename
        }),
      });
      
      const saveResult = await saveResponse.json();
      
      if (saveResult.success) {
        setSaveMessage(`${t.conversationSaved} (Auto-saved to: ${filename})`);
        
        // Also create a card in collection with file path
        const existingCards = getUserProfile().collection?.cards || [];
      const reflectionCard = {
          id: `stage3-reflection-${Date.now()}`,
          stage: 'C',
          type: 'Reflection',
          title: language === 'ko' ? '학업 성찰' : 'Academic Reflection',
          description: insights[0] ? `${summary} • ${insights[0]}` : summary,
          rarity: 'Common',
          unlocked: true,
          tags: [`year${year}`, ...keywords.slice(0, 3)],
          createdFrom: 'Stage 3: Reflection',
          filePath: saveResult.path,
          downloadLink: `/api/download-file?filename=${filename}`,
          content: finalResult
        };
        
        updateUserProfile({
          collection: {
            ...getUserProfile().collection,
            cards: [...existingCards, reflectionCard]
          }
        });
      } else {
        setSaveMessage(`${t.conversationSaved} (Failed to save file)`);
      }
      
    } catch (error) {
      console.error('Error saving conversation:', error);
      setSaveMessage(language === 'ko' ? '저장 중 오류가 발생했습니다.' : 'Error saving conversation.');
      hasSavedRef.current = false;
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Handle manual download
  const handleDownload = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const userId = getUserProfile().id || 'user';
      const filename = `stage3-summary-${userId}-${timestamp}.json`;

      // Create final result object (use keywords from state)
      const profile = getUserProfile();
      const savedData = profile.stage3Responses;

      const year = getYearLevelFromProfile();
      const semesterLabel = getSemesterLabel(getUserProfile().currentSemester);
      const semesterText = semesterLabel ? `, ${semesterLabel}` : '';
      const summary = `Year ${year} student. Reflected on course uncertainty and motivation this semester${semesterText}.`;

      const transcript = messages
        .map((msg) => `${msg.role === 'ai' ? 'Mirae' : 'Student'}: ${msg.message}`)
        .join('\n');

      const finalResult = {
        user: {
          id: getUserProfile().id || 'anonymous',
          name: getUserProfile().name || 'User',
          year: getYearIdFromProfile(),
          conversationDate: new Date().toISOString(),
          language: 'en'
        },
        responses: {},
        feedback: savedData?.feedback || aiFeedback,
        insights: savedData?.insights || [],
        summary: savedData?.summary || summary,
        keywords,
        transcript,
        conversation: messages.map(msg => ({
          role: msg.role,
          message: msg.message,
          timestamp: msg.timestamp?.toISOString() || new Date().toISOString()
        })),
        metadata: {
          version: '1.0',
          stage: 'stage3',
          exportedAt: new Date().toISOString(),
          conversationState,
          totalMessages: messages.length
        }
      };
      
      // Create blob and download
      const jsonString = JSON.stringify(finalResult, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSaveMessage(t.exportSuccess);
      
    } catch (error) {
      console.error('Download error:', error);
      setSaveMessage(language === 'ko' ? '다운로드 중 오류가 발생했습니다.' : 'Error downloading file.');
    }
  };

  // Handle finish
  const handleFinish = () => {
    if (messages.length > 0) {
      saveConversationData();
    }
    router.push(withBasePath('/dashboard'));
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push(withBasePath('/dashboard'));
  };

  // Handle keyword removal
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(prev => prev.filter(keyword => keyword !== keywordToRemove));
  };

  const canType = conversationState === 'in_progress';

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C7B9FF] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 onboarding-bg overflow-hidden">
      <div className="h-full w-full py-12 px-4 sm:px-8 pt-24 overflow-auto">
        <div
          className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr] grid-rows-1 pr-4 lg:pr-8 h-full min-h-0"
          style={{ height: 'calc(100vh - 12rem)' }}
        >
          {/* Left: Chat Area */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative flex flex-col h-full min-h-0">
            <div className="absolute inset-0 pointer-events-none soft-glow" />

            {/* Header */}
            <div className="relative flex-shrink-0 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">{t.tag}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  {t.title} <Sprout className="w-6 h-6 text-green-500" />
                </h1>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">{t.subtitle}</p>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="relative flex-1 min-h-0 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-pulse text-4xl mb-4" style={{ animationDuration: '2s' }}>💭</div>
                    <p className="text-slate-500">{t.starting}</p>
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm'
                        : 'bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
                    )}
                    <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">{msg.message}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/95 border-2 border-[#9BCBFF]/40 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md rounded-tl-sm">
                    <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#C7B9FF] rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-[#F4A9C8] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="w-2 h-2 bg-[#FFD1A8] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative flex-shrink-0 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-white/50 transition"
                    title="Upload documents"
                  >
                    📎
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && input.trim() && canType) {
                        handleSendMessage();
                      }
                    }}
                    placeholder={t.placeholder}
                    className="w-full rounded-full pl-14 pr-4 py-3 bg-white/95 border-2 border-slate-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C7B9FF] focus:border-[#C7B9FF] shadow-sm disabled:opacity-60"
                    disabled={!canType || isLoading || isSaving}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (input.trim() && canType) {
                      handleSendMessage();
                    }
                  }}
                  disabled={!input.trim() || !canType || isLoading || isSaving}
                  className="soft-button px-6 py-3 rounded-full text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.send}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4 h-full min-h-0">
            {/* Keywords Panel */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60">
              <p className="text-sm font-semibold text-slate-700 mb-2">{t.keywordsTitle}</p>
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((word) => (
                    <span
                      key={word}
                      className="group px-3 py-2 rounded-full text-sm bg-white/90 border border-white/70 text-slate-800 shadow-sm flex items-center gap-1.5 hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      {word}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(word)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-500 hover:text-white text-slate-500"
                        aria-label={`Remove ${word}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">{t.keywordsEmpty}</p>
              )}
            </div>

            {/* Next Steps Panel */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60 space-y-3">
              <p className="text-sm font-semibold text-slate-700">{t.nextSteps}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• {t.privacyNote}</li>
                <li>• {t.continueToNext}</li>
                <li>• {t.optionsNote}</li>
              </ul>
              {conversationState === 'complete' ? (
                <>
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 rounded-full border border-white/60 bg-white/90 text-sm font-semibold text-slate-700 hover:bg-white transition"
                  >
                    {t.downloadResult}
                  </button>
                  <button
                    onClick={handleFinish}
                    className="soft-button w-full py-3 rounded-full font-semibold"
                  >
                    {t.goToStage4}
                  </button>
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full py-3 rounded-full border border-white/60 bg-white/90 text-sm font-semibold text-slate-700 hover:bg-white transition"
                  >
                    {t.backToDashboard}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="soft-button w-full py-3 rounded-full font-semibold disabled:opacity-50"
                >
                  {t.finish}
                </button>
              )}
            </div>

            {/* Mirae Icon */}
            <div className="flex justify-end">
              <Image
                src="/asset/Mirae_Icon1.png"
                alt="Mirae Icon"
                width={600}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
