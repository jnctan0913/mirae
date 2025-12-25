// app/(dashboard)/stage3/page.tsx - WITHOUT ORANGE FEEDBACK BOX
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguageStore } from '@/lib/stores/languageStore';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import { GraduationCap, BookOpen, Target, Brain, Heart, Sparkles, MessageSquare, Save, Download, FileText, ArrowLeft } from 'lucide-react';

// Year options
const YEAR_OPTIONS = {
  en: [
    { id: 'year1', label: 'Year 1', description: 'First year student' },
    { id: 'year2', label: 'Year 2', description: 'Second year student' },
    { id: 'year3', label: 'Year 3', description: 'Third year student' },
  ],
  ko: [
    { id: 'year1', label: '1학년', description: '1학년 학생' },
    { id: 'year2', label: '2학년', description: '2학년 학생' },
    { id: 'year3', label: '3학년', description: '3학년 학생' },
  ]
};

// Translations
const translations = {
  ko: {
    title: '성찰 공간',
    subtitle: 'Mirae와의 안전한 대화 공간',
    aiName: 'Mirae',
    privacyNote: '이 대화는 완전히 비밀로 유지됩니다. 교사, 부모님, 친구들 누구도 볼 수 없어요.',
    initialQuestion: '지금 몇 학년이신가요?',
    
    // Year 1 questions
    year1CourseQuestion: '다음 학기 수업은 이미 선택하셨나요?',
    year1YesQuestion: '다음 학기가 기대되시나요? 어떤 점이 가장 기대되시고, 걱정되는 부분이 있다면 공유해주세요.',
    year1NoQuestion: '다음 학기 수업 선택에 대해 어떤 고민이 있으신가요? 미래 계획에 대해 생각해본 적이 있으신가요?',
    
    // Year 2/3 questions
    year23CompleteQuestion: '현재 학기를 잘 마치셨나요?',
    year23CompleteYesQuestion: '축하드려요! 다음 계획은 무엇인가요? 이번 학기 성과에 대해 만족하시나요?',
    year23CompleteNoQuestion: '현재 학기에서 어떤 도전을 겪고 계신가요? 앞으로의 계획에 대해 이야기해볼까요?',
    
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
    yearSelectionTitle: '학년 선택',
    conversationStart: '안녕하세요! 오늘은 어떤 이야기를 나눠볼까요?',
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
  },
  en: {
    title: 'Reflection Space',
    subtitle: 'Safe conversation space with Mirae',
    aiName: 'Mirae',
    privacyNote: 'This conversation is completely private. Not teachers, not parents, not friends. Just you and me.',
    initialQuestion: 'Which year are you currently in?',
    
    // Year 1 questions
    year1CourseQuestion: 'Have you chosen your courses for next semester?',
    year1YesQuestion: 'Are you ready and excited for your next semester? What are you most looking forward to, and any concerns you\'d like to share?',
    year1NoQuestion: 'What concerns do you have about choosing courses for next semester? Have you thought about your future plans?',
    
    // Year 2/3 questions
    year23CompleteQuestion: 'Have you completed your current semester?',
    year23CompleteYesQuestion: 'Congratulations! What are your next plans? Are you happy with your performance this semester?',
    year23CompleteNoQuestion: 'What challenges are you facing in your current semester? Let\'s talk about your future plans.',
    
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
    yearSelectionTitle: 'Select Year',
    conversationStart: 'Hello! What would you like to talk about today?',
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
  },
};

type ConversationState = 'initial' | 'year-selected' | 'year1-course' | 'year1-yes' | 'year1-no' | 'year23-complete' | 'year23-yes' | 'year23-no' | 'complete';
type UserResponse = {
  year?: string;
  year1?: {
    hasChosenCourses?: boolean;
    response?: string;
    concerns?: string;
    futurePlans?: string;
  };
  year23?: {
    completedSemester?: boolean;
    response?: string;
    challenges?: string;
    futurePlans?: string;
    performanceSatisfaction?: string;
  };
  feedback?: string[];
  summary?: string;
  keywords?: string[];
  timestamp?: string;
  conversation?: Array<{role: string, message: string, timestamp: string}>;
};

type Message = {
  role: 'ai' | 'user';
  message: string;
  timestamp?: Date;
};

export default function Stage3Page() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguageStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('initial');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [userResponses, setUserResponses] = useState<UserResponse>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [showBackButton, setShowBackButton] = useState(false);
  
  const t = translations[language];
  const yearOptions = YEAR_OPTIONS[language];
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    
    setTimeout(() => {
      addAIMessage(t.conversationStart);
      setTimeout(() => {
        addAIMessage(t.initialQuestion);
      }, 800);
    }, 500);
  }, [language, isHydrated]);

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

  // Handle year selection
  const handleYearSelect = (yearId: string) => {
    setIsLoading(true);
    setSelectedYear(yearId);
    
    const selectedOption = yearOptions.find(opt => opt.id === yearId);
    if (!selectedOption) return;
    
    addUserMessage(selectedOption.label);
    
    setUserResponses(prev => ({ ...prev, year: yearId }));
    setShowBackButton(true);
    
    updateUserProfile({
      yearLevel: parseInt(yearId.charAt(4))
    });
    
    setTimeout(() => {
      const yearLevel = parseInt(yearId.charAt(4));
      
      if (yearLevel === 1) {
        addAIMessage(t.year1CourseQuestion);
        setConversationState('year1-course');
      } else {
        addAIMessage(t.year23CompleteQuestion);
        setConversationState('year23-complete');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle Year 1 course selection
  const handleYear1CourseSelection = (hasChosen: boolean) => {
    setIsLoading(true);
    
    setUserResponses(prev => ({
      ...prev,
      year1: {
        ...prev.year1,
        hasChosenCourses: hasChosen
      }
    }));
    
    addUserMessage(hasChosen ? t.yes : t.no);
    
    setTimeout(() => {
      if (hasChosen) {
        addAIMessage(t.year1YesQuestion);
        setConversationState('year1-yes');
      } else {
        addAIMessage(t.year1NoQuestion);
        setConversationState('year1-no');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Handle Year 2/3 semester completion
  const handleYear23Completion = (hasCompleted: boolean) => {
    setIsLoading(true);
    
    setUserResponses(prev => ({
      ...prev,
      year23: {
        ...prev.year23,
        completedSemester: hasCompleted
      }
    }));
    
    addUserMessage(hasCompleted ? t.yes : t.no);
    
    setTimeout(() => {
      if (hasCompleted) {
        addAIMessage(t.year23CompleteYesQuestion);
        setConversationState('year23-yes');
      } else {
        addAIMessage(t.year23CompleteNoQuestion);
        setConversationState('year23-no');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Generate AI feedback using the API
  const generateAIFeedback = async (): Promise<string[]> => {
    try {
      // Call the OpenAI API via our endpoint
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: messages,
          language: language,
          userYear: selectedYear
        }),
      });

      const data = await response.json();

      if (data.success && data.feedback) {
        return data.feedback;
      } else {
        // Fallback to static feedback if API fails
        return getFallbackFeedback();
      }
    } catch (error) {
      console.error('Error calling feedback API:', error);
      return getFallbackFeedback();
    }
  };

  // Get fallback feedback based on conversation state
  const getFallbackFeedback = (): string[] => {
    const yearLevel = parseInt(selectedYear.charAt(4));
    
    if (yearLevel === 1) {
      if (conversationState === 'year1-yes') {
        return language === 'ko' 
          ? [
              '다음 학기가 기대되시는군요! 새로운 수업과 경험은 항상 설레는 일이죠.',
              '걱정되는 점이 있다는 것은 이미 미리 준비하고 계신다는 뜻이에요.',
              '수업 선택은 중요한 결정이지만, 항상 변경할 수 있는 여지가 있다는 점 기억해주세요.'
            ]
          : [
              'You\'re excited for next semester! New classes and experiences are always thrilling.',
              'Having concerns means you\'re already preparing in advance.',
              'Course selection is important, but remember there\'s always room for change.'
            ];
      } else {
        return language === 'ko'
          ? [
              '수업 선택에 고민이 많으시군요. 이는 당신이 진지하게 미래를 생각하고 계시다는 증거예요.',
              '여러분의 관심사와 강점을 고려해보는 시간을 가져보세요.',
              '미래 계획은 유연하게 가져가는 것도 좋아요.'
            ]
          : [
              'You have many concerns about course selection. This shows you\'re seriously thinking about your future.',
              'Take time to consider your interests and strengths.',
              'It\'s good to keep future plans flexible.'
            ];
      }
    } else {
      if (conversationState === 'year23-yes') {
        return language === 'ko'
          ? [
              '학기를 잘 마치셨다니 정말 기쁘네요! 이번 성과는 앞으로 더 큰 성취의 발판이 될 거예요.',
              '다음 계획에 대해 생각하고 계시다니 멋지네요.',
              '성과에 만족하신다면 그 감정을 잘 기억해두세요.'
            ]
          : [
              'I\'m really glad you finished the semester well! This achievement will be a stepping stone.',
              'It\'s wonderful that you\'re thinking about next plans.',
              'If you\'re satisfied with your performance, remember that feeling well.'
            ];
      } else {
        return language === 'ko'
          ? [
              '도전을 겪고 계시다니 고생이 많으셨어요. 하지만 이 경험이 당신을 더 강하게 만들어 줄 거예요.',
              '어려움은 성장의 기회예요.',
              '앞으로의 계획을 세울 때는 현실적인 목표와 함께 융통성도 고려해보세요.'
            ]
          : [
              'You\'ve been through a lot facing challenges. But this experience will make you stronger.',
              'Difficulties are opportunities for growth.',
              'When planning for the future, consider realistic goals along with flexibility.'
            ];
      }
    }
  };

  // Handle generate feedback with auto-save
  const handleGenerateFeedback = async (userResponse: string) => {
    setIsLoading(true);
    
    try {
      // Generate AI feedback
      const feedbackMessages = await generateAIFeedback();
      
      // Store feedback for saving later
      setAiFeedback(feedbackMessages);
      
      // Add AI thinking message
      addAIMessage(`💭 ${t.aiThinking}`);
      
      // Display feedback messages one by one as normal AI messages
      feedbackMessages.forEach((feedback, index) => {
        setTimeout(() => {
          addAIMessage(feedback);
          
          // After last feedback, auto-save
          if (index === feedbackMessages.length - 1) {
            setTimeout(() => {
              setConversationState('complete');
              saveConversationData(); // Auto-save here
            }, 1000);
          }
        }, (index + 1) * 2000);
      });
      
    } catch (error) {
      console.error('Error generating feedback:', error);
      addAIMessage(t.errorGeneratingFeedback);
      setConversationState('complete');
      saveConversationData(); // Still auto-save even if feedback fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending user message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input;
    setInput('');
    addUserMessage(userMessage);
    
    // Update user responses
    const yearLevel = selectedYear ? parseInt(selectedYear.charAt(4)) : 1;
    
    setUserResponses(prev => {
      const updated = { ...prev };
      if (yearLevel === 1) {
        updated.year1 = {
          ...updated.year1,
          response: userMessage
        };
        if (conversationState === 'year1-no') {
          updated.year1 = {
            ...updated.year1,
            concerns: userMessage,
            futurePlans: userMessage
          };
        }
      } else {
        updated.year23 = {
          ...updated.year23,
          response: userMessage
        };
        if (conversationState === 'year23-yes') {
          updated.year23 = {
            ...updated.year23,
            nextPlans: userMessage,
            performanceSatisfaction: userMessage
          };
        } else if (conversationState === 'year23-no') {
          updated.year23 = {
            ...updated.year23,
            challenges: userMessage,
            futurePlans: userMessage
          };
        }
      }
      return updated;
    });
    
    // Generate AI feedback and auto-save
    await handleGenerateFeedback(userMessage);
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
      .slice(0, 5)
      .map(([word]) => word);
  };

  // Save conversation data using the API
  const saveConversationData = async () => {
    setIsSaving(true);
    
    try {
      // Extract all text from user responses
      const allText = [
        userResponses.year1?.response || '',
        userResponses.year1?.concerns || '',
        userResponses.year1?.futurePlans || '',
        userResponses.year23?.response || '',
        userResponses.year23?.challenges || '',
        userResponses.year23?.futurePlans || '',
        userResponses.year23?.performanceSatisfaction || ''
      ].join(' ');
      
      const keywords = extractKeywords(allText);
      
      // Create summary
      const year = selectedYear ? parseInt(selectedYear.charAt(4)) : 0;
      let summary = '';
      
      if (year === 1) {
        const hasChosen = userResponses.year1?.hasChosenCourses;
        summary = language === 'ko'
          ? `${year}학년 학생. ${hasChosen ? '다음 학기 수업 선택 완료' : '수업 선택 고민 중'}. ${hasChosen ? '기대와 걱정 공유' : '미래 계획 고민'}.`
          : `Year ${year} student. ${hasChosen ? 'Courses selected for next semester' : 'Considering course selection'}. ${hasChosen ? 'Shared excitement and concerns' : 'Thinking about future plans'}.`;
      } else {
        const hasCompleted = userResponses.year23?.completedSemester;
        summary = language === 'ko'
          ? `${year}학년 학생. ${hasCompleted ? '학기 완료' : '학기 진행 중'}. ${hasCompleted ? '다음 계획 및 성과 만족도' : '도전과 미래 계획'}.`
          : `Year ${year} student. ${hasCompleted ? 'Semester completed' : 'Semester in progress'}. ${hasCompleted ? 'Next plans and performance satisfaction' : 'Challenges and future plans'}.`;
      }
      
      // Create final result object
      const finalResult = {
        user: {
          id: getUserProfile().id || 'anonymous',
          name: getUserProfile().name || 'User',
          year: selectedYear,
          conversationDate: new Date().toISOString(),
          language: language
        },
        responses: userResponses,
        feedback: aiFeedback,
        summary,
        keywords,
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
      
      // 1. Save to user profile
      updateUserProfile({
        stage3Responses: finalResult,
        stage3Completed: true
      });
      
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
          description: summary,
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
      
      // Create final result object (same as in saveConversationData)
      const allText = [
        userResponses.year1?.response || '',
        userResponses.year1?.concerns || '',
        userResponses.year1?.futurePlans || '',
        userResponses.year23?.response || '',
        userResponses.year23?.challenges || '',
        userResponses.year23?.futurePlans || '',
        userResponses.year23?.performanceSatisfaction || ''
      ].join(' ');
      
      const keywords = extractKeywords(allText);
      
      const year = selectedYear ? parseInt(selectedYear.charAt(4)) : 0;
      let summary = '';
      
      if (year === 1) {
        const hasChosen = userResponses.year1?.hasChosenCourses;
        summary = language === 'ko'
          ? `${year}학년 학생. ${hasChosen ? '다음 학기 수업 선택 완료' : '수업 선택 고민 중'}. ${hasChosen ? '기대와 걱정 공유' : '미래 계획 고민'}.`
          : `Year ${year} student. ${hasChosen ? 'Courses selected for next semester' : 'Considering course selection'}. ${hasChosen ? 'Shared excitement and concerns' : 'Thinking about future plans'}.`;
      } else {
        const hasCompleted = userResponses.year23?.completedSemester;
        summary = language === 'ko'
          ? `${year}학년 학생. ${hasCompleted ? '학기 완료' : '학기 진행 중'}. ${hasCompleted ? '다음 계획 및 성과 만족도' : '도전과 미래 계획'}.`
          : `Year ${year} student. ${hasCompleted ? 'Semester completed' : 'Semester in progress'}. ${hasCompleted ? 'Next plans and performance satisfaction' : 'Challenges and future plans'}.`;
      }
      
      const finalResult = {
        user: {
          id: getUserProfile().id || 'anonymous',
          name: getUserProfile().name || 'User',
          year: selectedYear,
          conversationDate: new Date().toISOString(),
          language: language
        },
        responses: userResponses,
        feedback: aiFeedback,
        summary,
        keywords,
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

  // Force save conversation (manual save)
  const handleForceSave = () => {
    if (messages.length > 0) {
      saveConversationData();
    }
  };

  // Handle finish
  const handleFinish = () => {
    if (conversationState !== 'complete') {
      saveConversationData();
    }
    router.push('/stage4');
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Handle go back in conversation
  const handleGoBack = () => {
    if (conversationState === 'year1-course' || conversationState === 'year23-complete') {
      setConversationState('initial');
      setSelectedYear('');
      setShowBackButton(false);
    } else if (conversationState === 'year1-yes' || conversationState === 'year1-no') {
      setConversationState('year1-course');
    } else if (conversationState === 'year23-yes' || conversationState === 'year23-no') {
      setConversationState('year23-complete');
    }
  };

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
    <div className="min-h-screen p-4 md:p-6" style={{
      backgroundImage: 'url(/asset/Background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-6 h-6 text-[#C7B9FF]" />
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{t.title}</h1>
              </div>
              <p className="text-slate-600 text-sm md:text-base">
                {t.subtitle}
              </p>
            </div>
            
            {/* Mirae AI Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white/60 w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">{t.aiName}</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          
          {/* Privacy Note */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50/50 border border-blue-100">
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <Heart className="w-4 h-4 flex-shrink-0" />
              {t.privacyNote}
            </p>
          </div>
          
          {/* Save Status & Controls */}
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            {showBackButton && conversationState !== 'complete' && (
              <button
                onClick={handleGoBack}
                className="px-4 py-2 rounded-lg bg-white/80 text-slate-800 text-sm font-medium hover:bg-white transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t.goBack}
              </button>
            )}
            
            {saveMessage && (
              <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-600 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saveMessage}
                </p>
              </div>
            )}
            
            {messages.length > 0 && conversationState !== 'complete' && (
              <button
                onClick={handleForceSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] text-white text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t.saving : t.saveConversation}
              </button>
            )}
          </div>
        </div>
        
        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chat Area */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-3xl p-4 md:p-6 h-[500px] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 pr-2">
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
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-[#C7B9FF] to-[#F4A9C8] text-white rounded-br-sm'
                          : 'bg-white/80 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                      <div className="text-xs opacity-50 mt-1">
                        {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/80 rounded-2xl px-4 py-3 rounded-bl-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#C7B9FF] rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-[#F4A9C8] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                        <span className="w-2 h-2 bg-[#FFD1A8] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{t.aiThinking}</p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area - Show when waiting for text response */}
              {(conversationState === 'year1-yes' || 
                conversationState === 'year1-no' ||
                conversationState === 'year23-yes' ||
                conversationState === 'year23-no') && (
                <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t.placeholder}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-white/40 bg-white/80 text-slate-800 placeholder:text-slate-500 focus:border-[#C7B9FF] focus:outline-none transition-all text-sm md:text-base"
                    disabled={isLoading || isSaving}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading || isSaving}
                    className="px-4 md:px-6 py-3 bg-gradient-to-r from-[#F4A9C8] to-[#FFD1A8] text-white rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50 text-sm md:text-base"
                  >
                    {t.send}
                  </button>
                </form>
              )}
            </div>
          </div>
          
          {/* Right: Interactive Options */}
          <div className="space-y-6">
            {/* Year Selection */}
            {conversationState === 'initial' && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-[#C7B9FF]" />
                  <h3 className="font-semibold text-slate-800">{t.yearSelectionTitle}</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {yearOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleYearSelect(option.id)}
                      disabled={isLoading}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedYear === option.id
                          ? 'bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] text-white'
                          : 'bg-white/80 text-slate-800 hover:bg-white'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-80 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Year 1 Course Selection */}
            {conversationState === 'year1-course' && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#C7B9FF]" />
                  <h3 className="font-semibold text-slate-800">{t.year1CourseQuestion}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleYear1CourseSelection(true)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:shadow-lg transition-all"
                  >
                    <div className="font-medium">{t.yes}</div>
                  </button>
                  <button
                    onClick={() => handleYear1CourseSelection(false)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:shadow-lg transition-all"
                  >
                    <div className="font-medium">{t.no}</div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Year 2/3 Semester Completion */}
            {conversationState === 'year23-complete' && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#C7B9FF]" />
                  <h3 className="font-semibold text-slate-800">{t.year23CompleteQuestion}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleYear23Completion(true)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 hover:shadow-lg transition-all"
                  >
                    <div className="font-medium">{t.yes}</div>
                  </button>
                  <button
                    onClick={() => handleYear23Completion(false)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:shadow-lg transition-all"
                  >
                    <div className="font-medium">{t.no}</div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Completion State */}
            {conversationState === 'complete' && (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-slate-800">{t.reflectionComplete}</h3>
                </div>
                
                {/* Show saved file info */}
                {saveMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-sm text-emerald-600">
                      {saveMessage}
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-slate-600 mb-4">
                  {language === 'ko' 
                    ? '대화 내용이 자동으로 저장되었습니다. 다음 단계로 이동하시거나, 대시보드로 돌아가실 수 있습니다.'
                    : 'Your conversation has been auto-saved. You can proceed to the next stage or return to the dashboard.'}
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.downloadResult}
                  </button>
                  
                  <button
                    onClick={handleFinish}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                  >
                    {t.goToStage4}
                  </button>
                  
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full py-3 bg-white/80 text-slate-800 rounded-2xl font-medium hover:bg-white transition-all"
                  >
                    {t.backToDashboard}
                  </button>
                </div>
              </div>
            )}
            
            {/* Action Buttons (for non-complete states) */}
            {(conversationState !== 'complete' && conversationState !== 'initial') && (
              <div className="glass-card rounded-3xl p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-[#C7B9FF] to-[#F4A9C8] text-white rounded-2xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {t.finish}
                  </button>
                  
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full py-3 bg-white/80 text-slate-800 rounded-2xl font-medium hover:bg-white transition-all"
                  >
                    {t.backToDashboard}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}