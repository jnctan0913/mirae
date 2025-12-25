// lib/fallback/happyPath.ts

import { ConversationTurn, UserContext } from '@/lib/types/skillTranslation';

/**
 * Happy Path Conversation Script
 * 
 * This provides a complete, pre-scripted conversation flow for demo reliability
 * and fallback when OpenAI API is unavailable.
 * 
 * The conversation assumes user context from Steps 0-2:
 * - Onboarding keywords
 * - Strength discovery data
 * - Role roulette interests
 * - Selected courses
 */

export const HAPPY_PATH_TURNS: ConversationTurn[] = [
  // ============================================
  // TURN 1: Opening & Recap
  // ============================================
  {
    turnNumber: 1,
    phase: 'recap',
    trigger: ['START', 'INITIAL'],
    miraeMessage: (ctx: UserContext) => {
      const coursesText = ctx.courses.length >= 2
        ? `${ctx.courses[0]}와 ${ctx.courses[1]}${ctx.courses.length > 2 ? ', 그리고 ' + ctx.courses[2] : ''}`
        : ctx.courses.join(', ');
      
      return `안녕하세요 ${ctx.name}님! 👋

선택한 과목들을 보니까, ${coursesText}를 골랐네요. 

이 과목들을 통해 어떤 역량을 키워갈지 함께 이야기해볼까요? 

먼저 ${ctx.courses[0]} 수업을 상상해볼게요. 그 수업에서 어떤 걸 배우게 될 것 같아요?`;
    },
    expectedUserPatterns: ['문제', '창의', '협업', '디자인', '해결', '생각', '능력'],
    alternatives: {
      vague: (ctx: UserContext) => `괜찮아요! ${ctx.courses[0]}는 보통 문제를 새로운 방식으로 바라보고, 창의적으로 접근하는 걸 배워요.

${ctx.name}님이 이 수업을 선택한 이유가 궁금해요. 무엇 때문에 끌렸나요?`,
      question: (ctx: UserContext) => `좋은 질문이에요! ${ctx.courses[0]}에서 배우는 내용은 다양하지만, 
가장 중요한 건 ${ctx.name}님이 이 수업을 통해 무엇을 키우고 싶은가예요.

어떤 역량이 궁금하세요?`,
    },
  },

  // ============================================
  // TURN 2: Skill Articulation - Course 1 (Part 1)
  // ============================================
  {
    turnNumber: 2,
    phase: 'articulation',
    trigger: ['문제', '창의', '해결', '협업', '디자인'],
    miraeMessage: (ctx: UserContext) => {
      // Try to extract the skill they mentioned
      return `창의적 문제 해결! 정말 중요한 역량이에요. 💡

왜 그게 ${ctx.name}님한테 중요한 것 같아요?`;
    },
    expectedUserPatterns: ['중요', '하고 싶', '관심', '필요', '해결', '세상', '사람'],
    alternatives: {
      vague: `그 마음 이해해요. 때로는 왜 중요한지 말로 표현하기 어려울 때가 있죠.

다르게 물어볼게요: 이 역량을 키우면 어떤 걸 하고 싶어요?`,
    },
  },

  // ============================================
  // TURN 3: Why It Matters (Depth)
  // ============================================
  {
    turnNumber: 3,
    phase: 'articulation',
    trigger: ['하고 싶', '해결', '도움', '사람', '세상'],
    miraeMessage: (ctx: UserContext) => {
      const hasRoleRouletteInterest = ctx.interests && ctx.interests.length > 0;
      
      if (hasRoleRouletteInterest) {
        return `실제 세상의 문제를 해결하고 싶다는 마음이 느껴져요. ✨

Role Roulette에서 ${ctx.interests?.[0]}에 관심을 보이셨던 게 생각나네요.
그 연결고리가 있는 것 같아요?`;
      }
      
      return `실제 세상의 문제를 해결하고 싶다는 마음이 느껴져요. ✨

구체적으로 어떤 문제를 해결하고 싶은지 생각해본 적 있어요?`;
    },
    expectedUserPatterns: ['네', '맞', '그렇', '사회', '환경', '사람'],
    alternatives: {
      vague: `괜찮아요, 구체적이지 않아도 돼요. 탐색하는 과정이니까요.

지금은 "문제 해결"이라는 방향성만으로도 충분해요.`,
    },
  },

  // ============================================
  // TURN 4: Course Transition
  // ============================================
  {
    turnNumber: 4,
    phase: 'articulation',
    trigger: ['네', '맞', '그렇', '연결', '관련'],
    miraeMessage: (ctx: UserContext) => {
      const nextCourse = ctx.courses[1] || '다음 과목';
      
      return `좋아요! ${ctx.courses[0]}로 사회 문제에 접근하는 거네요. 👏

그럼 ${nextCourse}은 어떤 역할을 할 것 같아요? 
이 과목에서는 어떤 역량을 키우게 될까요?`;
    },
    expectedUserPatterns: ['분석', '데이터', '증명', '논리', '숫자', '확인'],
  },

  // ============================================
  // TURN 5: Skill Articulation - Course 2
  // ============================================
  {
    turnNumber: 5,
    phase: 'articulation',
    trigger: ['분석', '데이터', '증명', '논리'],
    miraeMessage: (ctx: UserContext) => {
      return `아, 흥미롭네요! 

${ctx.courses[0]}로 창의적인 해결책을 찾고, 
${ctx.courses[1]}로 그게 정말 효과가 있는지 검증하는 거네요. 

이 두 가지가 함께 있으면 어떤 느낌이 들어요?`;
    },
    expectedUserPatterns: ['균형', '조화', '보완', '좋', '맞', '완성'],
  },

  // ============================================
  // TURN 6: Balance Recognition
  // ============================================
  {
    turnNumber: 6,
    phase: 'patterns',
    trigger: ['균형', '조화', '보완', '좋'],
    miraeMessage: (ctx: UserContext) => {
      const hasKeywords = ctx.keywords && ctx.keywords.length > 0;
      
      if (hasKeywords) {
        return `"균형"이라는 표현이 정말 좋네요. 🎯

Step 0에서 ${ctx.name}님이 선택한 키워드가 생각나요:
${ctx.keywords?.slice(0, 2).map(k => `"${k}"`).join('과 ')}

그게 ${ctx.courses[0]} + ${ctx.courses[1]} 조합으로 나타난 것 같아요.`;
      }
      
      return `"균형"이라는 표현이 정말 좋네요. 🎯

창의성과 논리성, 이 둘의 균형을 찾으려는 게 느껴져요.`;
    },
    expectedUserPatterns: ['오', '그렇', '맞', '신기', '연결'],
  },

  // ============================================
  // TURN 7: Third Course (if exists)
  // ============================================
  {
    turnNumber: 7,
    phase: 'articulation',
    trigger: ['네', '오', '맞'],
    miraeMessage: (ctx: UserContext) => {
      const hasThirdCourse = ctx.courses.length >= 3;
      
      if (hasThirdCourse) {
        return `그렇죠! 이제 ${ctx.courses[2]}도 살펴볼까요? 

이 과목은 어떤 역량을 키워줄 것 같아요?`;
      }
      
      // Skip to pattern recognition if only 2 courses
      return `이 두 과목을 합치면 ${ctx.name}님만의 독특한 조합이 나와요.

많은 학생들이 둘 중 하나만 선택하는데, 
${ctx.name}님은 이 둘이 서로를 강화한다는 걸 본 거예요. ⭐`;
    },
    expectedUserPatterns: ['표현', '시각', '심미', '아름', '예술', '디자인'],
  },

  // ============================================
  // TURN 8: Pattern Recognition
  // ============================================
  {
    turnNumber: 8,
    phase: 'patterns',
    trigger: ['표현', '시각', '아름'],
    miraeMessage: (ctx: UserContext) => {
      const courses = ctx.courses.join(', ');
      
      return `시각적 표현과 심미성! 

이 세 과목을 다 합치면 어떤 그림이 그려져요?

문제를 이해하고(${ctx.courses[1]}), 
창의적으로 해결하고(${ctx.courses[0]}), 
아름답게 만드는(${ctx.courses[2]}) 거 아닐까요?`;
    },
    expectedUserPatterns: ['네', '맞', '그렇', '정확'],
  },

  // ============================================
  // TURN 9: Unique Edge Celebration
  // ============================================
  {
    turnNumber: 9,
    phase: 'patterns',
    trigger: ['네', '맞', '그렇'],
    miraeMessage: (ctx: UserContext) => {
      return `정확해요! 이게 ${ctx.name}님만의 독특한 조합이에요. ⭐

많은 학생들이 ${ctx.courses[1]}와 ${ctx.courses[0]}를 함께 선택하지 않거든요.
하지만 ${ctx.name}님은 이 둘이 서로를 강화한다는 걸 본 거예요.

그리고 ${ctx.courses[2] || '다른 과목'}까지 더해지면, 
단순히 "작동하는" 해결책이 아니라 
"아름답게 작동하는" 해결책을 만들 수 있겠네요.`;
    },
    expectedUserPatterns: ['특별', '좋', '신기', '그렇'],
  },

  // ============================================
  // TURN 10: Skills Summary
  // ============================================
  {
    turnNumber: 10,
    phase: 'patterns',
    trigger: ['네', '그렇', '특별'],
    miraeMessage: (ctx: UserContext) => {
      const summaryLines = ctx.courses.map((course, idx) => {
        const icons = ['📊', '🎨', '🖼️', '🔬', '📚', '💡'];
        const skills = [
          '논리적으로 이해하고 검증하기',
          '창의적 해결책 찾고 공감하기',
          '시각적으로 아름답게 표현하기',
        ];
        return `${icons[idx]} ${course}: ${skills[idx] || '새로운 역량 키우기'}`;
      }).join('\n');
      
      return `정리해볼게요. ${ctx.name}님이 이 과목들을 통해 키우게 될 역량들:

${summaryLines}

이게 다 맞는 것 같아요?`;
    },
    expectedUserPatterns: ['네', '맞', '그렇'],
  },

  // ============================================
  // TURN 11: Fit vs Fear Check
  // ============================================
  {
    turnNumber: 11,
    phase: 'fit-fear',
    trigger: ['네', '맞'],
    miraeMessage: (ctx: UserContext) => {
      return `좋아요! 이제 솔직하게 물어볼게요. 🤔

이 역량들을 키우는 게 ${ctx.name}님한테:
- 흥미롭고 배우고 싶어서인가요?
- 아니면 필요할 것 같아서, 갖춰야 할 것 같아서인가요?

둘 다일 수도 있어요. 솔직하게 말해주세요!`;
    },
    expectedUserPatterns: ['흥미', '재미', '좋아', '필요', '걱정', '불안'],
  },

  // ============================================
  // TURN 12: Fit vs Fear Response + Closing
  // ============================================
  {
    turnNumber: 12,
    phase: 'closing',
    trigger: ['흥미', '재미', '좋아', '필요', '걱정'],
    miraeMessage: (ctx: UserContext) => {
      // This will be handled dynamically based on FIT vs FEAR
      // Default to FIT response
      return `그게 제일 중요해요! 💚

흥미를 따라가면, 필요한 역량은 자연스럽게 따라와요.
그리고 ${ctx.name}님이 좋아하는 걸 하면서 배우는 건 
억지로 필요해서 배우는 것보다 훨씬 깊이 배우게 돼요.

오늘 이야기 나눠줘서 고마워요.

정리하면:
- ${ctx.name}님은 독특한 조합을 선택했어요
- 이 선택은 흥미에서 나온 거예요 (두려움이 아니라!)
- 언제든지 다시 와서 고민을 나눠도 돼요

Mirae는 항상 여기 있어요. 💙

다음 단계로 넘어갈 준비가 됐나요?`;
    },
    expectedUserPatterns: ['네', '준비', '고마', '다음'],
  },
];

/**
 * Alternative responses for FIT vs FEAR detection
 */
export const FIT_FEAR_RESPONSES = {
  fit: (ctx: UserContext) => `그게 제일 중요해요! 💚

흥미를 따라가면, 필요한 역량은 자연스럽게 따라와요.
그리고 ${ctx.name}님이 좋아하는 걸 하면서 배우는 건 
억지로 필요해서 배우는 것보다 훨씬 깊이 배우게 돼요.

이 선택에 대해 얼마나 확신이 드세요? (마음속으로 1-10점 정도로 생각해보세요)`,

  fear: (ctx: UserContext) => `솔직하게 말해줘서 고마워요. 많은 학생들이 비슷한 마음이에요. 🤍

그런데 질문 하나만 해볼게요:
만약 걱정이나 불안이 없다면, 이 역량들을 배우고 싶으세요?

아니면 전혀 다른 걸 선택했을 것 같아요?`,

  both: (ctx: UserContext) => `둘 다 있는 게 자연스러워요! 💜

흥미도 있고, 필요성도 느끼는 거죠.
그럼 이렇게 생각해보면 어떨까요:

만약 필요성이 없다면, 그래도 이걸 배우고 싶을까요?`,
};

/**
 * Generic fallback for unexpected inputs
 */
export const GENERIC_FALLBACKS = [
  '흥미로운 생각이네요. 좀 더 자세히 말씀해주실 수 있을까요?',
  '그 부분에 대해 더 알고 싶어요. 어떤 의미인지 설명해줄 수 있을까요?',
  '아, 그렇군요. 그게 왜 중요한 것 같아요?',
  '좋은 관점이에요. 다른 각도로도 생각해볼까요?',
];

