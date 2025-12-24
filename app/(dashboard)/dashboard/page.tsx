'use client';

import { useEffect, useMemo, useState } from 'react';
import { getUser, signOut } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, Circle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/utils/storage';
import rolesData from '@/lib/data/roles.json';
import coursesData from '@/lib/data/courses-descriptions.json';

type RoleLocale = { en: string; ko: string };
type RoleListLocale = { en: string[]; ko: string[] };

interface RoleData {
  id: string;
  title: RoleLocale;
  tagline: RoleLocale;
  domain: RoleLocale;
  roleModels: RoleListLocale;
  companies: RoleListLocale;
  details: RoleLocale;
  resources: RoleListLocale;
}

interface RoleSwipe {
  roleId: string;
  swipeDirection: 'left' | 'right' | 'up';
}

type CourseCategory = 'general' | 'career' | 'interdisciplinary';

interface CourseLabel {
  en: string;
  kr: string;
  description?: {
    en: string | null;
    kr: string | null;
  };
}

interface CourseSubject {
  id: number;
  subject_en: string;
  subject_kr: string;
  electives: Record<CourseCategory, CourseLabel[]>;
}

interface CourseLookupItem extends CourseLabel {
  subjectEn: string;
  subjectKr: string;
  category: CourseCategory;
}

type Stage2Selection = {
  anchor: string[];
  signal: string[];
  savedAt: string;
} | null;

const roles = rolesData as RoleData[];
const courses = coursesData as CourseSubject[];
const categories: CourseCategory[] = ['general', 'career', 'interdisciplinary'];

const createCourseKey = (
  subjectEn: string,
  category: CourseCategory,
  courseEn: string
) => `${subjectEn}::${category}::${courseEn}`;

const strengthSignals: Record<
  string,
  { keywords: string[] }
> = {
  analytical: {
    keywords: ['math', 'statistics', 'data', 'science', 'physics', 'chemistry', 'algebra', 'calculus'],
  },
  creative: {
    keywords: ['art', 'music', 'theater', 'literature', 'media', 'writing', 'film'],
  },
  empathy: {
    keywords: ['ethics', 'culture', 'psychology', 'human', 'society', 'social', 'law', 'politics', 'communication'],
  },
  organization: {
    keywords: ['economics', 'law', 'politics', 'workplace', 'communication', 'planning'],
  },
};

const roleSignals: Record<string, { keywords: string[] }> = {
  'ux-designer': {
    keywords: ['design', 'media', 'art', 'writing', 'communication'],
  },
  'data-scientist': {
    keywords: ['data', 'statistics', 'math', 'informatics', 'science', 'ai'],
  },
  'product-manager': {
    keywords: ['product', 'strategy', 'roadmap', 'business', 'user', 'market', 'growth'],
  },
  'software-engineer': {
    keywords: ['software', 'computer', 'programming', 'coding', 'engineering', 'systems'],
  },
  'robotics-engineer': {
    keywords: ['robot', 'robotics', 'automation', 'hardware', 'mechatronics', 'control'],
  },
  'environmental-scientist': {
    keywords: ['environment', 'ecology', 'climate', 'sustainability', 'earth', 'biology'],
  },
  'biomedical-researcher': {
    keywords: ['biomedical', 'biology', 'medicine', 'health', 'genetics', 'laboratory'],
  },
  'clinical-psychologist': {
    keywords: ['psychology', 'mental', 'therapy', 'counseling', 'behavior', 'wellbeing'],
  },
  'social-entrepreneur': {
    keywords: ['social', 'community', 'impact', 'entrepreneur', 'nonprofit', 'sustainability'],
  },
  'teacher-educator': {
    keywords: ['education', 'teaching', 'learning', 'pedagogy', 'curriculum', 'school'],
  },
  journalist: {
    keywords: ['journalism', 'media', 'reporting', 'writing', 'news', 'communication'],
  },
  'policy-analyst': {
    keywords: ['policy', 'government', 'public', 'economics', 'regulation', 'civic'],
  },
  'brand-strategist': {
    keywords: ['brand', 'marketing', 'strategy', 'advertising', 'storytelling', 'identity'],
  },
  'financial-analyst': {
    keywords: ['finance', 'investment', 'accounting', 'economics', 'markets', 'business'],
  },
  'urban-planner': {
    keywords: ['urban', 'city', 'planning', 'architecture', 'infrastructure', 'transportation'],
  },
};

const stages = [
  { id: 0, nameKey: 'stage0Name', descriptionKey: 'stage0Description', path: '/stage0' },
  { id: 1, nameKey: 'stage1Name', descriptionKey: 'stage1Description', path: '/stage1' },
  { id: 2, nameKey: 'stage2Name', descriptionKey: 'stage2Description', path: '/stage2' },
  { id: 3, nameKey: 'stage3Name', descriptionKey: 'stage3Description', path: '/stage3' },
  { id: 4, nameKey: 'stage4Name', descriptionKey: 'stage4Description', path: '/stage4' },
  { id: 5, nameKey: 'stage5Name', descriptionKey: 'stage5Description', path: '/stage5' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { progress, userId, setUserId, reset } = useUserStore();
  const [userName, setUserName] = useState('');
  const [likedRoleIds, setLikedRoleIds] = useState<string[]>([]);
  const [stage2Selection, setStage2Selection] = useState<Stage2Selection>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [docKeywords, setDocKeywords] = useState<string[]>([]);
  const { t, language } = useI18n();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (userId !== user.id) {
      setUserId(user.id);
    }

    const displayName = user.name || user.email?.split('@')[0] || t('studentFallback');
    setUserName(displayName);

    if (typeof window !== 'undefined') {
      const onboardingKey = `user_${user.id}_onboardingDone`;
      if (localStorage.getItem(onboardingKey) !== 'true') {
        router.push('/onboarding');
      }
    }
  }, [router, setUserId, t, userId]);

  useEffect(() => {
    const swipes = storage.get<RoleSwipe[]>('roleSwipes', []) ?? [];
    const liked = swipes
      .filter((swipe) => swipe.swipeDirection === 'right')
      .map((swipe) => swipe.roleId);
    setLikedRoleIds(Array.from(new Set(liked)));
  }, []);

  useEffect(() => {
    const selectionKey = `stage2Selection_${userId ?? 'guest'}`;
    const savedSelection = storage.get<Stage2Selection>(selectionKey, null);
    setStage2Selection(savedSelection);
  }, [userId]);

  useEffect(() => {
    const profile = storage.get<{
      strengths?: string[];
      docKeywords?: string[];
    }>('userProfile');
    setStrengths(profile?.strengths ?? []);
    setDocKeywords(profile?.docKeywords ?? []);
  }, []);

  const handleSignOut = () => {
    signOut();
    reset();
    router.push('/login');
    router.refresh();
  };

  const getStageStatus = (stageId: number) => {
    if (progress[`stage${stageId}Complete` as keyof typeof progress]) return 'complete';
    if (stageId === progress.currentStage) return 'current';
    if (stageId < progress.currentStage) return 'available';
    return 'locked';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-[#73c8a9]" />;
      case 'current':
        return <Circle className="w-6 h-6 text-[#9BCBFF] fill-[#9BCBFF]" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const completedStages = Object.values(progress).filter(
    (v) => typeof v === 'boolean' && v === true
  ).length;
  const totalProgress = (completedStages / 6) * 100;
  const likedRoles = useMemo(
    () => roles.filter((role) => likedRoleIds.includes(role.id)),
    [likedRoleIds]
  );
  const courseLookup = useMemo(() => {
    const lookup = new Map<string, CourseLookupItem>();
    courses.forEach((subject) => {
      categories.forEach((category) => {
        subject.electives[category].forEach((course) => {
          const key = createCourseKey(subject.subject_en, category, course.en);
          lookup.set(key, {
            ...course,
            subjectEn: subject.subject_en,
            subjectKr: subject.subject_kr,
            category,
          });
        });
      });
    });
    return lookup;
  }, []);

  const stage2Alignment = useMemo(() => {
    if (!stage2Selection) {
      return { score: 0, strengthCount: 0, roleCount: 0, docCount: 0, total: 0 };
    }
    const selectedKeys = [...stage2Selection.anchor, ...stage2Selection.signal];
    const selected = selectedKeys
      .map((key) => courseLookup.get(key))
      .filter((course): course is CourseLookupItem => Boolean(course));

    const roleKeywords = likedRoleIds
      .map((roleId) => roleSignals[roleId]?.keywords ?? [])
      .flat();
    const strengthKeywords = strengths
      .map((strength) => strengthSignals[strength]?.keywords ?? [])
      .flat();
    const docTokens = docKeywords.map((token) => token.toLowerCase());

    const matches = selected.map((course) => {
      const courseEn = course.en.toLowerCase();
      const courseKr = course.kr.toLowerCase();
      const hasStrength = strengthKeywords.some((keyword) => courseEn.includes(keyword));
      const hasRole = roleKeywords.some((keyword) => courseEn.includes(keyword));
      const hasDocs = docTokens.some(
        (token) => courseEn.includes(token) || courseKr.includes(token)
      );
      return { hasStrength, hasRole, hasDocs };
    });

    const total = selected.length;
    const strengthCount = matches.filter((m) => m.hasStrength).length;
    const roleCount = matches.filter((m) => m.hasRole).length;
    const docCount = matches.filter((m) => m.hasDocs).length;
    const anyCount = matches.filter((m) => m.hasStrength || m.hasRole || m.hasDocs).length;
    const score = total === 0 ? 0 : Math.round((anyCount / total) * 100);
    return { score, strengthCount, roleCount, docCount, total };
  }, [stage2Selection, courseLookup, likedRoleIds, strengths, docKeywords]);

  return (
    <div
      className="min-h-screen p-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Logo Header */}
        <div className="flex items-center justify-between">
          <div className="bg-white/80 backdrop-blur-sm border border-white/70 shadow-md rounded-full px-4 py-2">
            <img
              src="/asset/Mirae_Word_Only.png"
              alt="Mirae"
              className="h-10 object-contain"
            />
          </div>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard')}</p>
                <h1 className="text-3xl font-bold mt-1">
                  {t('greeting')}, {userName}! 👋
                </h1>
                <p className="text-slate-600 mt-1">
                  {t('stagePosition', { stage: progress.currentStage })}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>

        {/* SCOPE+ Journey */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">
                {t('progressLabel')}
              </p>
              <div className="px-4 py-2 rounded-full bg-white/80 border border-white/60 text-sm text-slate-700 shadow-sm">
                {Math.round(totalProgress)}%
              </div>
            </div>
            <div className="bg-white/70 border border-white/70 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#9BCBFF] via-[#F4A9C8] to-[#BEEDE3] transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        {likedRoles.length > 0 && (
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-600">{t('stage1SummaryTag')}</p>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {t('stage1SummaryRolesLikedTitle')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/stage1/summary')}
                  className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
                >
                  {t('stage1SummaryViewAll')}
                </button>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
                {likedRoles.map((role) => {
                  const roleTitle = language === 'ko' ? role.title.ko : role.title.en;
                  const roleTagline = language === 'ko' ? role.tagline.ko : role.tagline.en;
                  const roleDomain = language === 'ko' ? role.domain.ko : role.domain.en;
                  return (
                    <div
                      key={role.id}
                      className="w-[240px] flex-shrink-0 snap-start rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                          {roleDomain}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-violet-200 to-rose-200 text-xs font-semibold text-slate-600 shadow-inner">
                          {roleTitle.slice(0, 2)}
                        </div>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-800">
                        {roleTitle}
                      </h3>
                      <p className="mt-2 text-xs text-slate-600">{roleTagline}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {stage2Selection && stage2Alignment.total > 0 && (
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none" />
            <div className="relative space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-600">Stage 2 summary</p>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Course selections
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/stage2/summary')}
                  className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
                >
                  View summary
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
                  Fit score: {stage2Alignment.score}%
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
                  Strengths: {stage2Alignment.strengthCount}
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
                  Roles: {stage2Alignment.roleCount}
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
                  Uploads: {stage2Alignment.docCount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stages.map((stage) => {
            const status = getStageStatus(stage.id);
            const isAccessible = status !== 'locked';

            return (
              <div
                key={stage.id}
                onClick={() => isAccessible && router.push(stage.path)}
                className={`
                  glass-card rounded-2xl p-6 floating transition-all
                  ${isAccessible ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                  ${status === 'current' ? 'ring-4 ring-[#C7B9FF]/70' : 'ring-1 ring-white/60'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800">{t(stage.nameKey)}</h3>
                    <p className="text-sm text-slate-600">{t(stage.descriptionKey)}</p>
                  </div>
                  {getStageIcon(status)}
                </div>

                {status === 'current' && (
                  <button className="soft-button w-full py-2.5 rounded-full font-semibold">
                    {t('start')}
                  </button>
                )}

                {status === 'complete' && (
                  <p className="text-sm text-[#73c8a9] font-semibold">{t('complete')}</p>
                )}

                {status === 'locked' && (
                  <p className="text-sm text-slate-500">{t('locked')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
