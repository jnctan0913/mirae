'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useUserStore } from '@/lib/stores/userStore';
import { storage } from '@/lib/utils/storage';
import questionnaire from '@/lib/data/questionnaire.json';
import rolesData from '@/lib/data/roles.json';

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

const tagReasons: Record<string, RoleLocale> = {
  analysis: { ko: '분석 성향', en: 'Analytical' },
  logic: { ko: '논리 중심', en: 'Logic-first' },
  creativity: { ko: '창의적 발상', en: 'Creative ideas' },
  research: { ko: '탐구 지향', en: 'Research-driven' },
  social: { ko: '사람 중심', en: 'People-first' },
  collaboration: { ko: '협업 선호', en: 'Collaborative' },
  impact: { ko: '임팩트 지향', en: 'Impact-driven' },
  meaning: { ko: '의미 추구', en: 'Meaningful work' },
  structure: { ko: '체계적', en: 'Structured' },
  ambiguity: { ko: '열린 문제 선호', en: 'Open-ended' },
  growth: { ko: '성장 지향', en: 'Growth-minded' },
  mastery: { ko: '전문성 집중', en: 'Mastery-focused' },
  practice: { ko: '실습 선호', en: 'Hands-on' },
  skill: { ko: '기술형', en: 'Skill-building' },
  'social-value': { ko: '사회적 가치', en: 'Social value' },
  fairness: { ko: '공정성 민감', en: 'Fairness-driven' },
  stability: { ko: '안정 지향', en: 'Stability' },
  change: { ko: '변화 수용', en: 'Change-friendly' },
  recognition: { ko: '인정 동기', en: 'Recognition-driven' },
  curiosity: { ko: '호기심', en: 'Curiosity' },
  discussion: { ko: '대화 중심', en: 'Discussion' },
  support: { ko: '지원 요청', en: 'Support-seeking' },
};

export default function Stage0ResultPage() {
  const router = useRouter();
  const { language } = useI18n();
  const { userId, completeStage } = useUserStore();
  const profile = storage.get<Record<string, unknown>>('userProfile', {}) ?? {};
  const answers = (profile.questionnaireAnswers as Record<string, string[]>) ?? {};

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
      router.push('/stage0');
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

  const sectionGroups = [
    { title: { ko: '핵심 동기 & 몰입', en: 'Core Motivation & Flow' }, ids: ['Q1', 'Q4'] },
    { title: { ko: '사고/결정 스타일', en: 'Thinking & Decisions' }, ids: ['Q2', 'Q3', 'Q11'] },
    { title: { ko: '가치관', en: 'Values' }, ids: ['Q5', 'Q9', 'Q10', 'Q13'] },
    { title: { ko: '환경 & 학습', en: 'Environment & Learning' }, ids: ['Q7', 'Q8', 'Q15'] },
    { title: { ko: '회복 & 변화', en: 'Resilience & Change' }, ids: ['Q6', 'Q12'] },
    { title: { ko: '현재 상태', en: 'Current State' }, ids: ['Q14'] },
  ];

  const getInsight = (questionId: string) => {
    const tag = normalizedAnswers[questionId];
    const insight = insightMap[questionId];
    if (!tag || !insight) return null;
    return {
      title: insight.title[language as Language],
      body: insight.values[tag]?.[language as Language] ?? tag,
    };
  };

  const handleFinish = () => {
    storage.set('userProfile', {
      ...profile,
      userId,
      questionnaireAnswers: answers,
      stage0Summary: {
        tagCounts,
        recommendedRoles: recommendedRoles.map((entry) => entry.role.id),
      },
      completedAt: new Date().toISOString(),
    });

    completeStage(0);
    router.push('/dashboard');
  };

  if (!completed) {
    return null;
  }

  const headingText =
    language === 'ko' ? 'Stage 0 진단 결과' : 'Stage 0 Diagnostic Summary';
  const subtitleText =
    language === 'ko'
      ? '당신의 선택을 바탕으로 핵심 성향과 Stage 1 추천 역할을 정리했어요.'
      : 'Based on your answers, here is a clear picture of your current profile and Stage 1 role picks.';
  const signalLabel = language === 'ko' ? '핵심 신호' : 'Key signals';
  const recommendationTitle = language === 'ko' ? 'Stage 1 추천 역할 카드' : 'Recommended Stage 1 role cards';
  const recommendationHint =
    language === 'ko'
      ? 'Stage 1에서 아래 5개의 역할 카드부터 시작해 보세요.'
      : 'Start Stage 1 with these five role cards.';
  const finishLabel =
    language === 'ko' ? '대시보드로 이동' : 'Return to dashboard';

  return (
    <div
      className="min-h-screen px-6 sm:px-10 py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{headingText}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{subtitleText}</h1>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-semibold text-slate-500">{signalLabel}</span>
              {topSignals.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs bg-white/80 border border-white/70 text-slate-700"
                >
                  {tagLabels[tag]?.[language as Language] ?? tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {sectionGroups.map((group) => (
              <div key={group.title.en} className="glass-card rounded-3xl p-6 sm:p-7 relative">
                <div className="absolute inset-0 pointer-events-none soft-glow" />
                <div className="relative space-y-4">
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
                          <p className="text-sm text-slate-700 leading-relaxed">{insight.body}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-7 relative">
              <div className="absolute inset-0 pointer-events-none soft-glow" />
              <div className="relative space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">{recommendationTitle}</h2>
                <p className="text-sm text-slate-600">{recommendationHint}</p>
                <div className="space-y-3">
                  {recommendedRoles.map((entry) => {
                    const role = entry.role;
                    const roleTitle = role.title[language as Language];
                    const roleTagline = role.tagline[language as Language];
                    const domain = role.domain[language as Language];
                    const reasonTags = entry.matchedTags.length
                      ? entry.matchedTags
                      : topSignals.slice(0, 2);

                    return (
                      <div
                        key={role.id}
                        className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">{domain}</p>
                            <p className="text-base font-semibold text-slate-800">{roleTitle}</p>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-full">
                            Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">{roleTagline}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {reasonTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full text-xs bg-white/80 border border-white/70 text-slate-700"
                            >
                              {tagReasons[tag]?.[language as Language] ?? tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="soft-button w-full py-3 rounded-full text-sm sm:text-base font-semibold"
            >
              {finishLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
