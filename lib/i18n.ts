'use client';

import { useLanguageStore } from '@/lib/stores/languageStore';

type Language = 'ko' | 'en';
type Messages = Record<string, string>;

const messages: Record<Language, Messages> = {
  ko: {
    languageKorean: '한국어',
    languageEnglish: 'English',
    dashboard: '대시보드',
    greeting: '안녕',
    stagePosition: '당신은 지금 Stage',
    progressLabel: '여정 진행률',
    start: '시작하기 →',
    complete: '✓ 완료됨',
    locked: '🔒 이전 단계를 먼저 완료하세요',
    logout: '로그아웃',
    // Stage 0
    stage0Question: '당신은 어떤 것들을 잘하나요?',
    stage0OptionAnalytical: '분석적 사고',
    stage0OptionCreative: '창의적 표현',
    stage0OptionEmpathy: '공감 능력',
    stage0OptionOrganization: '체계적 정리',
    stage0Prev: '← 이전',
    stage0Complete: '완료',
    stage0ProgressLabel: '질문',
    // Stage 1
    stage1Hint: '← 별로 | ⭐ 좋아요! | 흥미로워 →',
    // Stage 2
    stage2Title: '과목 선택 설계',
    stage2Subjects: '과목 목록',
    stage2Anchor: '⚓ 안전한 선택',
    stage2Signal: '🎯 탐색 신호',
    stage2AnchorCount: '({count}/6 선택됨)',
    stage2SignalCount: '({count}/6 선택됨)',
    stage2Save: '저장하기',
    // Stage 3
    stage3Title: '스킬 번역',
    stage3Empty: '안녕! 선택한 과목들을 통해 어떤 스킬을 키우고 싶은지 이야기해봐.',
    stage3Loading: 'AI가 입력 중...',
    stage3Placeholder: '당신의 생각을 자유롭게...',
    stage3Send: '전송',
    stage3Finish: '대화 마치기',
    // Stage 4
    stage4Title: '전문화 토너먼트',
    stage4Subtitle: '최대 3개의 전문화 영역을 선택하세요',
    stage4Selected: '✓ 선택됨',
    stage4Complete: '선택 완료',
    stage4Alignment: '{value}% 일치',
    // Stage 5
    stage5Title: '스토리보드',
    stage5When: '언제를 보고 싶나요?',
    stage5Timeline1: '1년 후 (2학년)',
    stage5Timeline3: '3년 후 (대학교)',
    stage5Timeline5: '5년 후 (직장)',
    stage5Generate: '스토리보드 생성하기',
    stage5StoryTitle: '당신의 미래 스토리',
    stage5Finish: '완료하기',
    stage5Scene1Time: '8:00 AM',
    stage5Scene1: '아침: 디자인 프로젝트 작업',
    stage5Scene2Time: '10:00 AM',
    stage5Scene2: '수업: 인간 중심 디자인',
    stage5Scene3Time: '2:00 PM',
    stage5Scene3: '팀 미팅: 소셜 임팩트 프로젝트',
    loginHeroTitle: '진로 탐색 여정을 시작하세요',
    loginTestAccounts: '테스트 계정',
    loginPasswordLabel: '비밀번호',
    loginEmailLabel: '이메일',
    loginButton: '로그인',
    loginLoading: '로그인 중...',
    loginNoAccount: '계정이 없나요?',
    loginSignup: '회원가입',
    loginPasswordValue: '비밀번호: password123',
    loginInvalid: '이메일 또는 비밀번호가 올바르지 않습니다',
    loginPasswordHint: 'Password: password123',
    loginUseTest: '테스트 계정을 사용하세요',
  },
  en: {
    languageKorean: 'Korean',
    languageEnglish: 'English',
    dashboard: 'Dashboard',
    greeting: 'Hello',
    stagePosition: 'You are currently at Stage',
    progressLabel: 'Journey progress',
    start: 'Start →',
    complete: '✓ Completed',
    locked: '🔒 Finish the prior stage first',
    logout: 'Sign out',
    // Stage 0
    stage0Question: 'What are you good at?',
    stage0OptionAnalytical: 'Analytical thinking',
    stage0OptionCreative: 'Creative expression',
    stage0OptionEmpathy: 'Empathy',
    stage0OptionOrganization: 'Organization',
    stage0Prev: '← Back',
    stage0Complete: 'Finish',
    stage0ProgressLabel: 'Question',
    // Stage 1
    stage1Hint: '← Not for me | ⭐ Love it! | Interesting →',
    // Stage 2
    stage2Title: 'Course Selection Builder',
    stage2Subjects: 'Subjects',
    stage2Anchor: '⚓ Anchor Choices',
    stage2Signal: '🎯 Signal Choices',
    stage2AnchorCount: '({count}/6 selected)',
    stage2SignalCount: '({count}/6 selected)',
    stage2Save: 'Save selection',
    // Stage 3
    stage3Title: 'Skill Translation',
    stage3Empty: 'Hi! Tell me what skills you want to build from your chosen courses.',
    stage3Loading: 'AI is typing...',
    stage3Placeholder: 'Share your thoughts...',
    stage3Send: 'Send',
    stage3Finish: 'Finish conversation',
    // Stage 4
    stage4Title: 'Specialization Tournament',
    stage4Subtitle: 'Choose up to 3 specialization areas',
    stage4Selected: '✓ Selected',
    stage4Complete: 'Confirm choices',
    stage4Alignment: '{value}% alignment',
    // Stage 5
    stage5Title: 'Storyboard',
    stage5When: 'When do you want to see?',
    stage5Timeline1: '1 year from now (Year 2)',
    stage5Timeline3: '3 years from now (University)',
    stage5Timeline5: '5 years from now (Career)',
    stage5Generate: 'Generate storyboard',
    stage5StoryTitle: 'Your future story',
    stage5Finish: 'Finish',
    stage5Scene1Time: '8:00 AM',
    stage5Scene1: 'Morning: Working on a design project',
    stage5Scene2Time: '10:00 AM',
    stage5Scene2: 'Class: Human-centered design',
    stage5Scene3Time: '2:00 PM',
    stage5Scene3: 'Team meeting: Social impact project',
    loginHeroTitle: 'Begin your exploration journey',
    loginTestAccounts: 'Test Accounts',
    loginPasswordLabel: 'Password',
    loginEmailLabel: 'Email',
    loginButton: 'Log in',
    loginLoading: 'Logging in...',
    loginNoAccount: 'No account?',
    loginSignup: 'Sign up',
    loginPasswordValue: 'Password: password123',
    loginInvalid: 'Invalid email or password',
    loginPasswordHint: 'Password: password123',
    loginUseTest: 'Use the test accounts below',
  },
};

export function useI18n() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (key: string, vars?: Record<string, string | number>) => {
    const template = messages[language as Language]?.[key] ?? messages.ko[key] ?? key;
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (_, v) => String(vars[v] ?? ''));
  };

  return { t, language, setLanguage, toggleLanguage };
}
