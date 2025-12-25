'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useUserStore } from '@/lib/stores/userStore';
import { getUserProfile, updateProfileAnalytics, updateUserProfile } from '@/lib/userProfile';
import questionnaire from '@/lib/data/questionnaire.json';
import rolesData from '@/lib/data/roles.json';
import { withBasePath } from '@/lib/basePath';

type Language = 'ko' | 'en';

type RoleLocale = { en: string; ko: string };
type RoleData = {
  id: string;
  title: RoleLocale;
  tagline: RoleLocale;
  domain: RoleLocale;
};

type QuestionnaireItem = {
  id: string;
};

const roles = rolesData as RoleData[];
const questionIds = (questionnaire.questions as QuestionnaireItem[]).map((item) => item.id);

const normalizeTag = (tag: string) => (tag === 'creative' ? 'creativity' : tag);

const tagLabels: Record<string, RoleLocale> = {
  curiosity: { ko: '호기심', en: 'Curiosity' },
  social: { ko: '사람 중심', en: 'People-first' },
  creativity: { ko: '창의', en: 'Creativity' },
  structure: { ko: '구조/정리', en: 'Structure' },
  analysis: { ko: '분석', en: 'Analysis' },
  ideation: { ko: '아이디어 탐색', en: 'Ideation' },
  ambiguity: { ko: '개방성', en: 'Ambiguity' },
  research: { ko: '탐구', en: 'Research' },
  skill: { ko: '기술 연습', en: 'Skill practice' },
  'social-value': { ko: '사회적 가치', en: 'Social value' },
  growth: { ko: '성장', en: 'Growth' },
  stability: { ko: '안정', en: 'Stability' },
  recognition: { ko: '인정', en: 'Recognition' },
  resilience: { ko: '원인 분석', en: 'Root-cause focus' },
  reflection: { ko: '실험/재시도', en: 'Retry & iterate' },
  adaptability: { ko: '회복 & 적응', en: 'Recover & adapt' },
  support: { ko: '도움 요청', en: 'Ask for support' },
  autonomy: { ko: '자율', en: 'Autonomy' },
  practice: { ko: '실습', en: 'Hands-on' },
  discussion: { ko: '대화 중심', en: 'Discussion' },
  fairness: { ko: '공정성', en: 'Fairness' },
  achievement: { ko: '성과 인정', en: 'Achievement' },
  meaning: { ko: '의미', en: 'Meaning' },
  flexibility: { ko: '유연성', en: 'Flexibility' },
  impact: { ko: '임팩트', en: 'Impact' },
  logic: { ko: '논리', en: 'Logic' },
  intuition: { ko: '직관', en: 'Intuition' },
  change: { ko: '변화 수용', en: 'Change-friendly' },
  mastery: { ko: '전문성', en: 'Mastery' },
  anxiety: { ko: '긴장/압박', en: 'Pressure' },
  motivation: { ko: '동기', en: 'Motivation' },
  collaboration: { ko: '협업', en: 'Collaboration' },
};

const insightMap: Record<
  string,
  { title: RoleLocale; values: Record<string, RoleLocale> }
> = {
  Q1: {
    title: { ko: '에너지원', en: 'Energy source' },
    values: {
      curiosity: { ko: '문제를 파고들수록 에너지가 올라가요.', en: 'Energy rises when solving tricky problems.' },
      social: { ko: '누군가를 돕고 설명할 때 힘이 나요.', en: 'You feel energized by helping others understand.' },
      creativity: { ko: '새로운 것을 만들 때 몰입해요.', en: 'Creating something new fuels you.' },
      structure: { ko: '정리하고 계획할 때 집중력이 좋아요.', en: 'Organizing and planning keeps you focused.' },
    },
  },
  Q2: {
    title: { ko: '문제 해결 스타일', en: 'Problem-solving style' },
    values: {
      analysis: { ko: '차분한 분석으로 답을 찾는 편이에요.', en: 'You prefer careful analysis.' },
      ideation: { ko: '여러 아이디어를 시도하며 답을 찾아요.', en: 'You iterate through many ideas.' },
    },
  },
  Q3: {
    title: { ko: '문제 선호', en: 'Problem preference' },
    values: {
      structure: { ko: '정답이 분명한 문제에 안정감을 느껴요.', en: 'Clear answers feel comfortable.' },
      ambiguity: { ko: '열린 질문에서 흥미를 느껴요.', en: 'Open-ended questions feel exciting.' },
    },
  },
  Q4: {
    title: { ko: '몰입 트리거', en: 'Flow trigger' },
    values: {
      research: { ko: '조사하고 탐색할 때 시간이 빨리 가요.', en: 'Research makes time fly.' },
      social: { ko: '깊은 대화를 나눌 때 몰입해요.', en: 'Deep conversation pulls you in.' },
      creativity: { ko: '만들고 디자인할 때 몰입해요.', en: 'Making or designing creates flow.' },
      skill: { ko: '기술을 연습할 때 집중돼요.', en: 'Practice keeps you focused.' },
    },
  },
  Q5: {
    title: { ko: '장기 가치', en: 'Long-term values' },
    values: {
      'social-value': { ko: '사회에 도움이 되는 일이 중요해요.', en: 'Helping society matters most.' },
      growth: { ko: '스스로 성장하는 것이 핵심이에요.', en: 'Personal growth is essential.' },
      stability: { ko: '안정적인 삶을 선호해요.', en: 'Stability matters to you.' },
      recognition: { ko: '인정받는 성취가 중요해요.', en: 'Recognition motivates you.' },
    },
  },
  Q6: {
    title: { ko: '회복 방식', en: 'Resilience style' },
    values: {
      resilience: { ko: '실패 원인을 분석해 다시 개선해요.', en: 'You analyze what went wrong.' },
      reflection: { ko: '다른 방식으로 다시 시도해요.', en: 'You try again differently.' },
      adaptability: { ko: '시간을 두고 회복하는 편이에요.', en: 'You recover before re-engaging.' },
      support: { ko: '도움을 요청하며 회복해요.', en: 'You ask for support.' },
    },
  },
  Q7: {
    title: { ko: '협업 선호', en: 'Collaboration preference' },
    values: {
      autonomy: { ko: '혼자 몰입하는 환경이 편해요.', en: 'You work best alone.' },
      collaboration: { ko: '함께 일할 때 에너지가 나요.', en: 'You thrive with others.' },
    },
  },
  Q8: {
    title: { ko: '학습 스타일', en: 'Learning style' },
    values: {
      structure: { ko: '단계별 설명이 효과적이에요.', en: 'Step-by-step guidance works well.' },
      practice: { ko: '직접 해보며 배우는 게 좋아요.', en: 'Hands-on learning suits you.' },
      discussion: { ko: '대화/토론형 학습이 좋아요.', en: 'Discussion helps you learn.' },
      autonomy: { ko: '스스로 방향을 잡는 걸 선호해요.', en: 'Self-directed learning fits you.' },
    },
  },
  Q9: {
    title: { ko: '불편한 상황', en: 'Discomfort trigger' },
    values: {
      fairness: { ko: '불공정한 상황에 민감해요.', en: 'Unfairness bothers you most.' },
      achievement: { ko: '노력이 인정되지 않을 때 힘들어요.', en: 'Ignored effort feels rough.' },
      structure: { ko: '규칙이 모호하면 불편해요.', en: 'Unclear rules feel frustrating.' },
      stability: { ko: '갑작스러운 변화에 불편해요.', en: 'Sudden change feels uncomfortable.' },
    },
  },
  Q10: {
    title: { ko: '미래 비전', en: 'Future vision' },
    values: {
      meaning: { ko: '의미 있는 미래를 원해요.', en: 'A meaningful future attracts you.' },
      stability: { ko: '안정적인 미래를 선호해요.', en: 'A stable future feels right.' },
      flexibility: { ko: '유연한 미래가 좋아요.', en: 'Flexibility is appealing.' },
      impact: { ko: '영향력 있는 일을 하고 싶어요.', en: 'You want to make impact.' },
    },
  },
  Q11: {
    title: { ko: '결정 기준', en: 'Decision style' },
    values: {
      logic: { ko: '데이터와 논리에 기대요.', en: 'You rely on data and logic.' },
      intuition: { ko: '감과 느낌을 믿어요.', en: 'You trust intuition and feeling.' },
    },
  },
  Q12: {
    title: { ko: '변화 선호', en: 'Change preference' },
    values: {
      stability: { ko: '예측 가능한 일이 편해요.', en: 'Predictability feels safe.' },
      change: { ko: '변화 속에서 활력이 생겨요.', en: 'Change keeps you energized.' },
    },
  },
  Q13: {
    title: { ko: '성취 기준', en: 'Achievement meaning' },
    values: {
      mastery: { ko: '무언가를 마스터할 때 뿌듯해요.', en: 'Mastery makes you proud.' },
      social: { ko: '다른 사람이 좋아할 때 보람이 커요.', en: 'Helping others feels rewarding.' },
      growth: { ko: '스스로 발전했다고 느낄 때 기뻐요.', en: 'Growth makes you proud.' },
      recognition: { ko: '인정받는 순간에 힘이 나요.', en: 'Recognition feels energizing.' },
    },
  },
  Q14: {
    title: { ko: '현재 상태', en: 'Current state' },
    values: {
      curiosity: { ko: '궁금하지만 아직 확신은 없어요.', en: 'Curious but unsure.' },
      anxiety: { ko: '압박감을 느끼고 있어요.', en: 'You feel pressured.' },
      stability: { ko: '차분하고 안정적인 편이에요.', en: 'Calm and steady.' },
      motivation: { ko: '지금 의욕이 있어요.', en: 'You feel motivated.' },
    },
  },
  Q15: {
    title: { ko: '구조 선호', en: 'Structure need' },
    values: {
      structure: { ko: '명확한 기준이 있으면 편해요.', en: 'Clear guidelines help you.' },
      autonomy: { ko: '자유롭게 결정할 때 편안해요.', en: 'Freedom feels comfortable.' },
    },
  },
};

const roleWeights: Record<string, Record<string, number>> = {
  'ux-designer': { creativity: 3, research: 2, social: 2, discussion: 1, impact: 1, curiosity: 1 },
  'data-scientist': { analysis: 3, logic: 2, research: 2, structure: 2, mastery: 1 },
  'product-manager': { impact: 2, social: 2, collaboration: 2, meaning: 1, structure: 1, ambiguity: 1, growth: 1 },
  'software-engineer': { logic: 2, structure: 2, mastery: 2, autonomy: 1, change: 1, practice: 1 },
  'robotics-engineer': { skill: 2, practice: 2, structure: 1, logic: 1, curiosity: 1, mastery: 1 },
  'environmental-scientist': { 'social-value': 2, impact: 2, research: 2, meaning: 1, curiosity: 1 },
  'biomedical-researcher': { research: 2, mastery: 2, impact: 1, meaning: 1, stability: 1 },
  'clinical-psychologist': { social: 2, support: 2, discussion: 1, meaning: 1, 'social-value': 1 },
  'social-entrepreneur': { impact: 2, creativity: 2, 'social-value': 2, change: 1, autonomy: 1, ambiguity: 1 },
  'teacher-educator': { social: 2, discussion: 2, support: 1, structure: 1, growth: 1 },
  journalist: { curiosity: 2, research: 2, fairness: 1, impact: 1, ambiguity: 1, discussion: 1 },
  'policy-analyst': { analysis: 2, structure: 2, fairness: 2, impact: 1, meaning: 1, stability: 1 },
  'brand-strategist': { creativity: 3, recognition: 1, impact: 1, ambiguity: 1, curiosity: 1 },
  'financial-analyst': { analysis: 3, structure: 2, stability: 2, logic: 1, achievement: 1 },
  'urban-planner': { structure: 2, impact: 2, meaning: 1, collaboration: 1, stability: 1, change: 1 },
};

const domainTagBonus: Record<string, string[]> = {
  creative: ['creativity'],
  analytical: ['analysis', 'logic'],
  technical: ['logic', 'structure', 'skill'],
  'social impact': ['impact', 'social-value'],
  empathy: ['social', 'support'],
  'human-centered': ['social', 'discussion'],
  civic: ['fairness', 'impact'],
  communication: ['discussion', 'curiosity'],
  strategic: ['impact', 'meaning'],
  systems: ['structure', 'analysis'],
  health: ['meaning', 'impact'],
};

const stage0TagToStrength: Record<string, string> = {
  analysis: 'analytical',
  logic: 'analytical',
  research: 'analytical',
  mastery: 'analytical',
  skill: 'analytical',
  curiosity: 'analytical',
  creativity: 'creative',
  ideation: 'creative',
  intuition: 'creative',
  ambiguity: 'creative',
  social: 'empathy',
  support: 'empathy',
  discussion: 'empathy',
  collaboration: 'empathy',
  fairness: 'empathy',
  impact: 'empathy',
  meaning: 'empathy',
  'social-value': 'empathy',
  structure: 'organization',
  stability: 'organization',
  autonomy: 'organization',
  practice: 'organization',
  achievement: 'organization',
  change: 'organization',
  growth: 'organization',
  resilience: 'organization',
  reflection: 'organization',
  adaptability: 'organization',
  motivation: 'organization',
  anxiety: 'organization',
};


export default function Stage0ResultPage() {
  const router = useRouter();
  const { language } = useI18n();
  const { userId, completeStage } = useUserStore();
  const profile = getUserProfile();
  const answers = useMemo(
    () => (profile.questionnaireAnswers as Record<string, string[]>) ?? {},
    [profile.questionnaireAnswers]
  );
  const [insightsExpanded, setInsightsExpanded] = useState(false);

  const normalizedAnswers = useMemo(() => {
    const result: Record<string, string> = {};
    questionIds.forEach((id) => {
      const tag = answers[id]?.[0];
      if (tag) result[id] = normalizeTag(tag);
    });
    return result;
  }, [answers]);

  const completed = questionIds.every((id) => Boolean(normalizedAnswers[id]));

  useEffect(() => {
    if (!completed) {
      router.push(withBasePath('/stage0'));
    }
  }, [completed, router]);

  const tagCounts = useMemo(() => {
    return Object.values(normalizedAnswers).reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1;
      return acc;
    }, {});
  }, [normalizedAnswers]);

  const topSignals = useMemo(() => {
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [tagCounts]);

  const topSignalDetails = useMemo(
    () => topSignals.map((tag) => ({ tag, count: tagCounts[tag] ?? 0 })),
    [topSignals, tagCounts],
  );

  const recommendedRoles = useMemo(() => {
    const uniqueTags = Array.from(new Set(Object.values(normalizedAnswers)));
    const scored = roles.map((role) => {
      const weights = roleWeights[role.id] ?? {};
      const domainKey = role.domain.en.toLowerCase();
      let score = 0;

      uniqueTags.forEach((tag) => {
        const weight = weights[tag];
        if (weight) score += weight;
      });

      const domainBonus = domainTagBonus[domainKey] ?? [];
      domainBonus.forEach((tag) => {
        if (tagCounts[tag]) score += 0.5;
      });

      const matchedTags = uniqueTags
        .filter((tag) => weights[tag])
        .sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0))
        .slice(0, 2);

      return { role, score, matchedTags };
    });

    const sorted = scored.sort((a, b) => b.score - a.score);
    const top = sorted.slice(0, 5);
    const hasScores = top.some((entry) => entry.score > 0);

    if (!hasScores) {
      return roles.slice(0, 5).map((role) => ({ role, matchedTags: [] as string[] }));
    }

    return top.map(({ role, matchedTags }) => ({ role, matchedTags }));
  }, [normalizedAnswers, tagCounts]);

  const primaryTag = topSignals[0];
  const secondaryTag = topSignals[1];
  const primaryLabel = primaryTag ? tagLabels[primaryTag]?.[language as Language] : null;
  const secondaryLabel = secondaryTag ? tagLabels[secondaryTag]?.[language as Language] : null;

  const personaAdjectives: Record<string, RoleLocale> = {
    curiosity: { ko: '??? ??', en: 'Curious' },
    creativity: { ko: '????', en: 'Creative' },
    analysis: { ko: '????', en: 'Analytical' },
    social: { ko: '????', en: 'Empathic' },
    structure: { ko: '????', en: 'Structured' },
    impact: { ko: '??? ????', en: 'Impact-driven' },
    meaning: { ko: '??? ??', en: 'Purposeful' },
    growth: { ko: '?? ????', en: 'Growth-minded' },
    mastery: { ko: '??? ????', en: 'Mastery-focused' },
    autonomy: { ko: '????', en: 'Independent' },
    collaboration: { ko: '????', en: 'Collaborative' },
    research: { ko: '????', en: 'Investigative' },
    discussion: { ko: '??? ???', en: 'Communicative' },
    practice: { ko: '???', en: 'Hands-on' },
    logic: { ko: '????', en: 'Logical' },
    intuition: { ko: '????', en: 'Intuitive' },
    ambiguity: { ko: '?? ????', en: 'Open-ended' },
    stability: { ko: '????', en: 'Steady' },
    change: { ko: '??? ??', en: 'Change-ready' },
  };
  const personaNouns: Record<string, RoleLocale> = {
    curiosity: { ko: '???', en: 'Explorer' },
    creativity: { ko: '?????', en: 'Creator' },
    analysis: { ko: '???', en: 'Analyst' },
    social: { ko: '???', en: 'Connector' },
    structure: { ko: '???', en: 'Strategist' },
    impact: { ko: '???', en: 'Changer' },
    meaning: { ko: '???', en: 'Seeker' },
    growth: { ko: '??', en: 'Builder' },
    mastery: { ko: '???', en: 'Specialist' },
    autonomy: { ko: '?????', en: 'Navigator' },
    collaboration: { ko: '????', en: 'Teammate' },
    research: { ko: '???', en: 'Researcher' },
    discussion: { ko: '??????', en: 'Communicator' },
    practice: { ko: '???', en: 'Maker' },
    logic: { ko: '???', en: 'Designer' },
    intuition: { ko: '????', en: 'Visionary' },
    ambiguity: { ko: '???', en: 'Pioneer' },
    stability: { ko: '???', en: 'Stabilizer' },
    change: { ko: '???', en: 'Catalyst' },
  };
  const personaTitle =
    [primaryTag, secondaryTag]
      .map((tag, index) =>
        index === 0
          ? personaAdjectives[tag ?? '']?.[language as Language]
          : personaNouns[tag ?? '']?.[language as Language],
      )
      .filter(Boolean)
      .join(' ') || (language === 'ko' ? '?? ?? ????' : 'Emerging persona');
  const personaSummary =
    primaryLabel && secondaryLabel
      ? language === 'ko'
        ? `${primaryLabel}?(?) ???? ${secondaryLabel} ??? ?? ????.`
        : `You lead with ${primaryLabel} and lean on ${secondaryLabel} when making choices.`
      : language === 'ko'
        ? '?? ??? ???? ????? ??? ?????.'
        : 'A quick snapshot of your learning and career tendencies.';

  const sectionGroups = [
    { title: { ko: '핵심 동기 & 몰입', en: 'Core Motivation & Flow' }, ids: ['Q1', 'Q4'] },
    { title: { ko: '사고/결정 스타일', en: 'Thinking & Decisions' }, ids: ['Q2', 'Q3', 'Q11'] },
    { title: { ko: '가치관', en: 'Values' }, ids: ['Q5', 'Q9', 'Q10', 'Q13'] },
    { title: { ko: '환경 & 학습', en: 'Environment & Learning' }, ids: ['Q7', 'Q8', 'Q15'] },
    { title: { ko: '회복 & 변화', en: 'Resilience & Change' }, ids: ['Q6', 'Q12'] },
    { title: { ko: '현재 상태', en: 'Current State' }, ids: ['Q14'] },
  ];

  const getInsight = useCallback((questionId: string) => {
    const tag = normalizedAnswers[questionId];
    const insight = insightMap[questionId];
    if (!tag || !insight) return null;
    return {
      title: insight.title[language as Language],
      body: insight.values[tag]?.[language as Language] ?? tag,
    };
  }, [language, normalizedAnswers]);

  const insightById = useMemo(() => {
    const map: Record<string, { title: string; body: string }> = {};
    questionIds.forEach((id) => {
      const insight = getInsight(id);
      if (insight) map[id] = insight;
    });
    return map;
  }, [getInsight]);

  const getInsightBodies = useCallback((ids: string[], limit = 3) => {
    return ids
      .map((id) => insightById[id]?.body)
      .filter(Boolean)
      .slice(0, limit) as string[];
  }, [insightById]);

  const getInsightTags = useCallback((ids: string[]) => {
    const tags = ids
      .map((id) => normalizedAnswers[id])
      .filter(Boolean)
      .map((tag) => tagLabels[tag]?.[language as Language] ?? tag);
    return Array.from(new Set(tags));
  }, [language, normalizedAnswers]);

  const didPersistRef = useRef(false);

  const persistResults = useCallback(() => {
    if (didPersistRef.current) return;
    didPersistRef.current = true;
    const existingSignals = profile.stage0Profile?.topSignals ?? [];
    const hasStage0SummaryCard = (profile.collection?.cards as Record<string, unknown>[] | undefined)?.some(
      (card) => (card as { id?: string }).id === 'stage0-summary'
    );
    const hasStage0Log = (profile.activityLogs ?? []).some((log) => log.id === 'stage0-complete');
    const sameSignals =
      existingSignals.length === topSignals.length &&
      existingSignals.every((signal) => topSignals.includes(signal));
    if (sameSignals && hasStage0SummaryCard && hasStage0Log) {
      completeStage(0);
      return;
    }
    const profileCards = (profile.collection?.cards as Record<string, unknown>[] | undefined) ?? [];
    const existingCardIndex = profileCards.findIndex(
      (card) => (card as { id?: string }).id === 'stage0-summary'
    );
    const descriptionText = primaryLabel
      ? secondaryLabel
        ? language === 'ko'
          ? `${primaryLabel} 성향에 ${secondaryLabel} 신호가 더해져 있어요.`
          : `${primaryLabel} with ${secondaryLabel} support.`
        : language === 'ko'
          ? `${primaryLabel} 신호가 가장 강하게 나타나요.`
          : `${primaryLabel} stands out in your responses.`
      : null;
    const newCard = primaryLabel && descriptionText
      ? {
          id: 'stage0-summary',
          stage: 'S',
          type: 'StrengthPattern',
          title: primaryLabel,
          description: descriptionText,
          rarity: 'Common',
          unlocked: true,
          tags: topSignals,
          createdFrom: 'Stage 0: Strength Discovery',
        }
      : null;
    const curiosityInsights = getInsightBodies(['Q1', 'Q4'], 2);
    const learningInsights = getInsightBodies(['Q7', 'Q8', 'Q15'], 3);
    const valuesInsights = getInsightBodies(['Q5', 'Q9', 'Q10', 'Q13'], 3);
    const decisionInsights = getInsightBodies(['Q2', 'Q3', 'Q11'], 2);
    const resilienceInsights = getInsightBodies(['Q6', 'Q12'], 2);
    const currentStateInsights = getInsightBodies(['Q14'], 1);

    const curiosityCard = curiosityInsights.length
      ? {
          id: 'stage0-curiosity',
          stage: 'C',
          type: 'CuriosityThread',
          title: language === 'ko' ? '에너지 & 몰입' : 'Energy & Flow',
          description: curiosityInsights.join(' · '),
          rarity: 'Common',
          unlocked: true,
          tags: getInsightTags(['Q1', 'Q4']),
          createdFrom: 'Stage 0: Motivation & Flow',
        }
      : null;
    const learningCard = learningInsights.length
      ? {
          id: 'stage0-learning',
          stage: 'O',
          type: 'Experience',
          title: language === 'ko' ? '학습 환경' : 'Learning Environment',
          description: learningInsights.join(' · '),
          rarity: 'Common',
          unlocked: true,
          tags: getInsightTags(['Q7', 'Q8', 'Q15']),
          createdFrom: 'Stage 0: Learning Style',
        }
      : null;
    const valuesCard = valuesInsights.length
      ? {
          id: 'stage0-values',
          stage: 'O',
          type: 'ValueSignal',
          title: language === 'ko' ? '가치 신호' : 'Values Signals',
          description: valuesInsights.join(' · '),
          rarity: 'Common',
          unlocked: true,
          tags: getInsightTags(['Q5', 'Q9', 'Q10', 'Q13']),
          createdFrom: 'Stage 0: Values & Fit',
        }
      : null;

    const incomingCards = [newCard, curiosityCard, learningCard, valuesCard].filter(
      Boolean
    ) as Record<string, unknown>[];
    const removeIds = new Set(
      incomingCards.map((card) => (card as { id?: string }).id)
    );
    const nextCards = [
      ...profileCards.filter(
        (card, index) =>
          index !== existingCardIndex &&
          !removeIds.has((card as { id?: string }).id)
      ),
      ...incomingCards,
    ];
    const today = new Date().toISOString().slice(0, 10);
    const existingLogs = profile.activityLogs ?? [];
    const nextLogs = hasStage0Log
      ? existingLogs
      : [
          ...existingLogs,
          {
            id: 'stage0-complete',
            date: today,
            title:
              language === 'ko'
                ? 'Stage 0 진단을 완료했어요'
                : 'Completed Stage 0 reflection',
            scopeStage: 'S' as const,
            activityType: 'MiraeActivity' as const,
            source: 'Mirae' as const,
            shortReflection: primaryLabel ?? undefined,
          },
        ];

    const mappedStrengthTags = Array.from(
      new Set(topSignals.map((tag) => stage0TagToStrength[tag]).filter(Boolean))
    );

    updateUserProfile({
      id: userId ?? 'demo-user',
      questionnaireAnswers: answers,
      strengthTags: mappedStrengthTags.length > 0 ? mappedStrengthTags : profile.strengthTags,
      stage0Summary: {
        tagCounts,
        // Note: Role recommendations are now handled by AI in Stage 1
      },
      stage0Profile: {
        primaryTag: primaryTag ?? undefined,
        secondaryTag: secondaryTag ?? undefined,
        topSignals,
        persona: {
          label: personaTitle,
          description: personaSummary,
        },
        insights: insightById,
        insightGroups: {
          curiosity: curiosityInsights,
          values: valuesInsights,
          learning: learningInsights,
          decisions: decisionInsights,
          resilience: resilienceInsights,
          currentState: currentStateInsights,
        },
        valuesSignals: valuesInsights,
      },
      collection: {
        ...profile.collection,
        cards: nextCards,
      },
      customCardTags: {
        ...profile.customCardTags,
        ...(newCard ? { [newCard.id]: topSignals } : {}),
        ...(curiosityCard ? { [curiosityCard.id]: curiosityCard.tags } : {}),
        ...(learningCard ? { [learningCard.id]: learningCard.tags } : {}),
        ...(valuesCard ? { [valuesCard.id]: valuesCard.tags } : {}),
      },
      activityLogs: nextLogs,
      report: {
        executiveText: primaryLabel
          ? language === 'ko'
            ? `핵심 신호: ${primaryLabel}${secondaryLabel ? `, 보조 신호: ${secondaryLabel}` : ''}`
            : `Primary signal: ${primaryLabel}${secondaryLabel ? `, supported by ${secondaryLabel}` : ''}`
          : '',
        growthText: topSignals.length
          ? language === 'ko'
            ? `주요 신호: ${topSignals.slice(0, 3).join(', ')}`
            : `Key signals noted: ${topSignals.slice(0, 3).join(', ')}.`
          : '',
        directionText: valuesInsights.length
          ? language === 'ko'
            ? `중요 가치: ${valuesInsights.join(' / ')}`
            : `Values that matter: ${valuesInsights.join(' / ')}`
          : '',
      },
      reportSources: {
        executiveText: 'stage0',
        growthText: 'stage0',
        directionText: valuesInsights.length ? 'stage0' : '',
      },
    });
    updateProfileAnalytics(nextLogs);

    completeStage(0);
  }, [
    answers,
    completeStage,
    language,
    primaryLabel,
    primaryTag,
    profile,
    recommendedRoles,
    secondaryLabel,
    secondaryTag,
    topSignals,
    userId,
    personaSummary,
    personaTitle,
    tagCounts,
    getInsightBodies,
    getInsightTags,
    insightById,
  ]);

  const handleFinish = () => {
    persistResults();
    router.push(withBasePath('/dashboard'));
  };

  useEffect(() => {
    if (!completed) return;
    persistResults();
  }, [completed, persistResults]);

  if (!completed) {
    return null;
  }

  const personaLabel = language === 'ko' ? '?? ????' : 'Student persona';
  const personaStyleMap: Record<
    string,
    { card: string; aura: string; ring: string; accent: string }
  > = {
    curiosity: {
      card: 'from-amber-300/80 via-white/50 to-rose-300/80',
      aura: 'from-amber-200/70 via-rose-200/60 to-white/40',
      ring: 'ring-amber-200/70',
      accent: 'text-amber-600',
    },
    creativity: {
      card: 'from-rose-300/80 via-white/50 to-orange-300/80',
      aura: 'from-rose-200/70 via-orange-200/60 to-white/40',
      ring: 'ring-rose-200/70',
      accent: 'text-rose-600',
    },
    analysis: {
      card: 'from-slate-300/80 via-white/50 to-sky-300/80',
      aura: 'from-slate-200/70 via-sky-200/60 to-white/40',
      ring: 'ring-slate-200/70',
      accent: 'text-slate-600',
    },
    social: {
      card: 'from-emerald-300/80 via-white/50 to-teal-300/80',
      aura: 'from-emerald-200/70 via-teal-200/60 to-white/40',
      ring: 'ring-emerald-200/70',
      accent: 'text-emerald-600',
    },
    structure: {
      card: 'from-indigo-300/80 via-white/50 to-sky-300/80',
      aura: 'from-indigo-200/70 via-sky-200/60 to-white/40',
      ring: 'ring-indigo-200/70',
      accent: 'text-indigo-600',
    },
    impact: {
      card: 'from-lime-300/80 via-white/50 to-emerald-300/80',
      aura: 'from-lime-200/70 via-emerald-200/60 to-white/40',
      ring: 'ring-lime-200/70',
      accent: 'text-lime-600',
    },
    meaning: {
      card: 'from-violet-300/80 via-white/50 to-fuchsia-300/80',
      aura: 'from-violet-200/70 via-fuchsia-200/60 to-white/40',
      ring: 'ring-violet-200/70',
      accent: 'text-violet-600',
    },
    growth: {
      card: 'from-teal-300/80 via-white/50 to-cyan-300/80',
      aura: 'from-teal-200/70 via-cyan-200/60 to-white/40',
      ring: 'ring-teal-200/70',
      accent: 'text-teal-600',
    },
    mastery: {
      card: 'from-blue-300/80 via-white/50 to-indigo-300/80',
      aura: 'from-blue-200/70 via-indigo-200/60 to-white/40',
      ring: 'ring-blue-200/70',
      accent: 'text-blue-600',
    },
    autonomy: {
      card: 'from-sky-300/80 via-white/50 to-emerald-300/80',
      aura: 'from-sky-200/70 via-emerald-200/60 to-white/40',
      ring: 'ring-sky-200/70',
      accent: 'text-sky-600',
    },
    collaboration: {
      card: 'from-emerald-300/80 via-white/50 to-lime-300/80',
      aura: 'from-emerald-200/70 via-lime-200/60 to-white/40',
      ring: 'ring-emerald-200/70',
      accent: 'text-emerald-600',
    },
    research: {
      card: 'from-cyan-300/80 via-white/50 to-sky-300/80',
      aura: 'from-cyan-200/70 via-sky-200/60 to-white/40',
      ring: 'ring-cyan-200/70',
      accent: 'text-cyan-600',
    },
    discussion: {
      card: 'from-fuchsia-300/80 via-white/50 to-rose-300/80',
      aura: 'from-fuchsia-200/70 via-rose-200/60 to-white/40',
      ring: 'ring-fuchsia-200/70',
      accent: 'text-fuchsia-600',
    },
    practice: {
      card: 'from-orange-300/80 via-white/50 to-amber-300/80',
      aura: 'from-orange-200/70 via-amber-200/60 to-white/40',
      ring: 'ring-orange-200/70',
      accent: 'text-orange-600',
    },
    logic: {
      card: 'from-slate-300/80 via-white/50 to-indigo-300/80',
      aura: 'from-slate-200/70 via-indigo-200/60 to-white/40',
      ring: 'ring-slate-200/70',
      accent: 'text-slate-600',
    },
    intuition: {
      card: 'from-rose-300/80 via-white/50 to-fuchsia-300/80',
      aura: 'from-rose-200/70 via-fuchsia-200/60 to-white/40',
      ring: 'ring-rose-200/70',
      accent: 'text-rose-600',
    },
    ambiguity: {
      card: 'from-amber-300/80 via-white/50 to-lime-300/80',
      aura: 'from-amber-200/70 via-lime-200/60 to-white/40',
      ring: 'ring-amber-200/70',
      accent: 'text-amber-600',
    },
    stability: {
      card: 'from-slate-300/80 via-white/50 to-stone-300/80',
      aura: 'from-slate-200/70 via-stone-200/60 to-white/40',
      ring: 'ring-stone-200/70',
      accent: 'text-stone-600',
    },
    change: {
      card: 'from-emerald-300/80 via-white/50 to-amber-300/80',
      aura: 'from-emerald-200/70 via-amber-200/60 to-white/40',
      ring: 'ring-emerald-200/70',
      accent: 'text-emerald-600',
    },
    default: {
      card: 'from-emerald-300/80 via-white/50 to-sky-300/80',
      aura: 'from-emerald-200/70 via-sky-200/60 to-white/40',
      ring: 'ring-emerald-200/70',
      accent: 'text-emerald-600',
    },
  };
  const personaStyle =
    personaStyleMap[primaryTag ?? ''] ?? personaStyleMap.default;
  const personaEmojiMap: Record<string, string> = {
    curiosity: '🧭',
    creativity: '🎨',
    analysis: '🧠',
    social: '🤝',
    structure: '📏',
    impact: '⚡',
    meaning: '✨',
    growth: '🌱',
    mastery: '🏅',
    autonomy: '🧭',
    collaboration: '🧩',
    research: '🔍',
    discussion: '💬',
    practice: '🛠️',
    logic: '🧩',
    intuition: '🔮',
    ambiguity: '🌫️',
    stability: '🛡️',
    change: '⚡',
  };
  const personaEmoji = personaEmojiMap[primaryTag ?? ''] ?? '✨';

  const signalLabel = language === 'ko' ? '???? ??' : 'Signature signals';
  const signalRankLabel = language === 'ko' ? '??' : 'Signal';
  const picksLabel = language === 'ko' ? '??' : 'picks';
  const personaHighlightsLabel = language === 'ko' ? '??? ?? ??' : 'At-a-glance cues';
  const nextTitle = language === 'ko' ? '?? ??' : 'Next steps';
  const nextHint =
    language === 'ko'
      ? '??? ??? ? ????? ??? Stage 1? ?????.'
      : 'Review your signals, then return to the dashboard to start Stage 1.';
  const insightsTitle = language === 'ko' ? '?? ????' : 'Detailed insights';
  const insightsHint =
    language === 'ko'
      ? '? ?? ??? ??? ?? ??? ?????.'
      : 'Expand to see the detailed interpretation of each question.';
  const insightsToggleLabel = insightsExpanded
    ? language === 'ko'
      ? '??'
      : 'Collapse'
    : language === 'ko'
      ? '???'
      : 'Expand';
  const finishLabel =
    language === 'ko' ? '대시보드로 이동' : 'Return to dashboard';
  const nextStageLabel =
    language === 'ko' ? '다음 단계' : 'Next step';
  const personaHighlights = [
    { label: language === 'ko' ? '???' : 'Energy', insight: getInsight('Q1')?.body },
    { label: language === 'ko' ? '??' : 'Flow', insight: getInsight('Q4')?.body },
    { label: language === 'ko' ? '??' : 'Learning', insight: getInsight('Q8')?.body },
  ].filter((item) => item.insight);

  return (
    <div
      className="min-h-screen px-6 sm:px-10 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className={`rounded-3xl border border-white/70 bg-gradient-to-br ${personaStyle.card} p-6 sm:p-7 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)]`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wide ${personaStyle.accent}`}>{personaLabel}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{personaTitle}</h1>
                  <p className="text-sm text-slate-600">{personaSummary}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${personaStyle.aura} blur-2xl`} />
                    <div
                      className={`relative flex h-full w-full items-center justify-center rounded-full border border-white/80 bg-white/80 ring-1 ${personaStyle.ring}`}
                    >
                      <img
                        src="/asset/Mirae_Icon1.png"
                        alt="Persona icon"
                        className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
                      />
                    </div>
                    <div className="pointer-events-none absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-base shadow-sm">
                      {personaEmoji}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    Stage 0
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {topSignals.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs bg-white/90 border border-white/70 text-slate-700"
                  >
                    {tagLabels[tag]?.[language as Language] ?? tag}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">{personaHighlightsLabel}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {personaHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/70 bg-white/90 p-3 shadow-sm"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">{item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">{signalLabel}</p>
              <div className="mt-4 space-y-3">
                {topSignalDetails.map((signal, index) => {
                  const label = tagLabels[signal.tag]?.[language as Language] ?? signal.tag;
                  const width = Math.min(100, 40 + signal.count * 12);

                  return (
                    <div
                      key={signal.tag}
                      className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="uppercase tracking-wide">
                          {signalRankLabel} {index + 1}
                        </span>
                        <span>
                          {signal.count} {picksLabel}
                        </span>
                      </div>
                      <p className="text-base font-semibold text-slate-800 mt-1">{label}</p>
                      <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400/80"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-7 relative">
              <div className="absolute inset-0 pointer-events-none soft-glow" />
              <div className="relative space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{insightsTitle}</h2>
                    <p className="text-sm text-slate-600">{insightsHint}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInsightsExpanded((prev) => !prev)}
                    className="rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide"
                  >
                    {insightsToggleLabel}
                  </button>
                </div>
                {insightsExpanded && (
                  <div className="space-y-6">
                    {sectionGroups.map((group) => (
                      <div key={group.title.en} className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800">
                          {group.title[language as Language]}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {group.ids.map((id) => {
                            const insight = getInsight(id);
                            if (!insight) return null;
                            return (
                              <div
                                key={id}
                                className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                              >
                                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                  {insight.title}
                                </p>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {insight.body}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}


              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-7 relative">
              <div className="absolute inset-0 pointer-events-none soft-glow" />
              <div className="relative space-y-3">
                <h2 className="text-lg font-semibold text-slate-800">{nextTitle}</h2>
                <p className="text-sm text-slate-600">{nextHint}</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleFinish}
                    className="soft-button w-full py-3 rounded-full text-sm sm:text-base font-semibold"
                  >
                    {finishLabel}
                  </button>
                  <button
                    onClick={() => router.push(withBasePath('/stage1'))}
                    className="w-full rounded-full border border-white/70 bg-white/80 py-3 text-sm sm:text-base font-semibold text-slate-700 hover:bg-white"
                  >
                    {nextStageLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
