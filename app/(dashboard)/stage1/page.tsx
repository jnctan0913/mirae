'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateProfileAnalytics, updateUserProfile } from '@/lib/userProfile';
import rolesData from '@/lib/data/roles.json';
import { withBasePath } from '@/lib/basePath';

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

const roles = rolesData as RoleData[];

const roleIcons: Record<string, JSX.Element> = {
  'ux-designer': (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </>
  ),
  'data-scientist': (
    <>
      <path d="M4 6h16" />
      <path d="M6 6v10a6 6 0 0 0 12 0V6" />
      <path d="M8 12h8" />
    </>
  ),
  'product-manager': (
    <>
      <path d="M12 3l7 4v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V7l7-4z" />
      <path d="M8.5 12l2 2 5-5" />
    </>
  ),
  'software-engineer': (
    <>
      <path d="M8 8l-4 4 4 4" />
      <path d="M16 8l4 4-4 4" />
      <path d="M12 7l-2 10" />
    </>
  ),
  'robotics-engineer': (
    <>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
      <path d="M9 15h6" />
      <path d="M12 2v4" />
    </>
  ),
  'environmental-scientist': (
    <>
      <path d="M12 3c4 0 7 3 7 7 0 5-4 9-7 11-3-2-7-6-7-11 0-4 3-7 7-7z" />
      <path d="M12 6v10" />
      <path d="M12 12c-2-1-4-1-6 0" />
    </>
  ),
  'biomedical-researcher': (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </>
  ),
  'clinical-psychologist': (
    <>
      <path d="M12 21s-6-4.5-8-8.5C2 9 4 6.5 7 6.5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3 0 5 2.5 3 6-2 4-8 8.5-8 8.5z" />
    </>
  ),
  'social-entrepreneur': (
    <>
      <path d="M12 3l4 4-4 4-4-4 4-4z" />
      <path d="M7 13h10l-1.5 7h-7L7 13z" />
    </>
  ),
  'teacher-educator': (
    <>
      <path d="M4 8l8-4 8 4-8 4-8-4z" />
      <path d="M8 11v4c0 1.5 8 1.5 8 0v-4" />
    </>
  ),
  journalist: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h6" />
      <path d="M6 9h.01" />
    </>
  ),
  'policy-analyst': (
    <>
      <path d="M3 5h18" />
      <path d="M6 5v13" />
      <path d="M18 5v13" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
    </>
  ),
  'brand-strategist': (
    <>
      <path d="M12 2l3 6 6 .8-4.4 4.2 1 6L12 16l-5.6 3 1-6L3 8.8 9 8l3-6z" />
    </>
  ),
  'financial-analyst': (
    <>
      <path d="M4 19h16" />
      <path d="M6 16l4-4 4 3 4-6" />
      <path d="M6 9h.01" />
    </>
  ),
  'urban-planner': (
    <>
      <rect x="4" y="6" width="6" height="12" rx="1" />
      <rect x="14" y="4" width="6" height="14" rx="1" />
      <path d="M10 12h4" />
    </>
  ),
};

export default function Stage1Page() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shimmerDirection, setShimmerDirection] = useState<'left' | 'right' | null>(null);
  const [shimmerKey, setShimmerKey] = useState(0);
  const router = useRouter();
  const { userId, completeStage, progress } = useUserStore();
  const { language } = useI18n();
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const dragActive = useRef(false);
  const shimmerTimer = useRef<number | null>(null);
  const swipeTimer = useRef<number | null>(null);

  // AI-based role recommendations
  const [aiRecommendedRoles, setAiRecommendedRoles] = useState<typeof roles>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      setIsLoadingRecommendations(true);
      setLoadingError(false);

      try {
        const currentProfile = getUserProfile();

        // Get onboarding keywords
        const onboardingKeywords = [
          ...(currentProfile?.keywords ?? []),
          ...(currentProfile?.onboarding?.keywords ?? []),
          ...(currentProfile?.onboardingKeywords ?? []),
        ];

        // Get questionnaire answers from profile
        const questionnaireAnswers = currentProfile?.questionnaireAnswers ?? {};

        // Call AI recommendation API
        const response = await fetch('/api/recommend-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionnaireAnswers,
            keywords: onboardingKeywords,
            language,
          }),
        });

        const data = await response.json();

        if (data.success && data.recommendations && data.recommendations.length > 0) {
          // Extract AI-generated roles directly from roleData
          const aiRoles = data.recommendations
            .map((rec: { roleData: typeof roles[0] }) => rec.roleData)
            .filter(Boolean);

          setAiRecommendedRoles(aiRoles.length > 0 ? aiRoles : roles.slice(0, 5));
        } else {
          // Fallback to all roles
          setAiRecommendedRoles(roles.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
        // Fallback to all roles on error
        setAiRecommendedRoles(roles.slice(0, 5));
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    void fetchAIRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const rolesToShow = aiRecommendedRoles.length > 0 ? aiRecommendedRoles : roles.slice(0, 5);
  const currentRole = rolesToShow[currentIndex];


  const roleTitle = currentRole ? (language === 'ko' ? currentRole.title.ko : currentRole.title.en) : '';
  const roleTagline = currentRole ? (language === 'ko' ? currentRole.tagline.ko : currentRole.tagline.en) : '';
  const roleDomain = currentRole ? (language === 'ko' ? currentRole.domain.ko : currentRole.domain.en) : '';
  const roleModels = currentRole ? (language === 'ko' ? currentRole.roleModels.ko : currentRole.roleModels.en) : [];
  const roleCompanies = currentRole ? (language === 'ko' ? currentRole.companies.ko : currentRole.companies.en) : [];
  const roleDetails = currentRole ? (language === 'ko' ? currentRole.details.ko : currentRole.details.en) : '';
  const roleResources = currentRole ? (language === 'ko' ? currentRole.resources.ko : currentRole.resources.en) : [];
  const roleModelsLabel = language === 'ko' ? '롤모델' : 'Role models';
  const roleCompaniesLabel = language === 'ko' ? '함께할 수 있는 곳' : 'Where you could work';
  const roleDetailsLabel = language === 'ko' ? '이 역할은 이런 일을 해요' : 'What they do';
  const roleResourcesLabel = language === 'ko' ? '더 알아보기' : 'Explore resources';
  const roleIcon = (currentRole && roleIcons[currentRole.id]) ?? (
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontFamily="inherit">
      {roleTitle.slice(0, 2)}
    </text>
  );
  const passLabel = language === 'ko' ? '패스' : 'Pass';
  const likeLabel = language === 'ko' ? '좋아요' : 'Like';
  const stageLabel = language === 'ko' ? '1단계' : 'Stage 1';
  const sectionLabel = language === 'ko' ? '역할 룰렛' : 'Role Roulette';
  const flipLabel = language === 'ko' ? '카드 뒤집기' : 'Flip card';
  const flipBackLabel = language === 'ko' ? '앞면으로' : 'Back to front';
  const headingText =
    language === 'ko'
      ? '차분하고 호기심 가득한 스와이프로 역할을 탐색해요.'
      : 'Explore roles with calm, curious swipes.';
  const subheadingText =
    language === 'ko'
      ? '미래를 확정하는 것이 아니라, 흥미가 어디로 향하는지 살펴보는 단계예요.'
      : 'Follow your gut. You are not choosing a future yet, just noticing what feels interesting.';
  const noticeText = isLoadingRecommendations
    ? (language === 'ko'
        ? 'AI가 당신에게 맞는 역할을 분석하고 있어요...'
        : 'AI is analyzing the best roles for you...')
    : (language === 'ko'
        ? '이 5개 역할 카드는 AI가 당신의 답변과 관심사를 분석해 추천한 결과예요.'
        : 'These 5 role cards are AI-curated based on your questionnaire answers and interests.');
  const hintTap =
    language === 'ko'
      ? '버튼을 누르거나 카드에서 스와이프해 보세요. 더 알고 싶다면 뒤집기.'
      : 'Tap the buttons, swipe the card, or flip for more.';
  const viewSummaryLabel = language === 'ko' ? '요약 보기' : 'View summary';
  const progressPercent = rolesToShow.length
    ? (currentIndex / rolesToShow.length) * 100
    : 0;
  const dragDistance = Math.hypot(dragOffset.x, dragOffset.y);
  const dragIntensity = Math.min(dragDistance / 140, 1);
  const likeOpacity =
    dragOffset.x > 0 && Math.abs(dragOffset.x) > Math.abs(dragOffset.y)
      ? Math.min(dragOffset.x / 120, 1)
      : 0;
  const passOpacity =
    dragOffset.x < 0 && Math.abs(dragOffset.x) > Math.abs(dragOffset.y)
      ? Math.min(Math.abs(dragOffset.x) / 120, 1)
      : 0;

  const triggerShimmer = useCallback((direction: 'left' | 'right') => {
    setShimmerDirection(direction);
    setShimmerKey((prev) => prev + 1);
    if (shimmerTimer.current) {
      window.clearTimeout(shimmerTimer.current);
    }
    shimmerTimer.current = window.setTimeout(() => {
      setShimmerDirection(null);
    }, 650);
  }, []);

  const commitStage1Results = useCallback((likedRoles: typeof roles) => {
    if (likedRoles.length === 0) return;
    const profile = getUserProfile();
    const existingCards = (profile.collection?.cards as Record<string, unknown>[]) ?? [];
    const existingIds = new Set(
      existingCards.map((card) => (card as { id?: string }).id).filter(Boolean)
    );
    const nextCards = [
      ...existingCards,
      ...likedRoles
        .filter((role) => !existingIds.has(`stage1-role-${role.id}`))
        .map((role) => {
          return {
            id: `stage1-role-${role.id}`,
            stage: 'C',
            type: 'CuriosityThread',
            title: role.title.en,
            description: role.tagline.en,
            rarity: 'Common',
            unlocked: true,
            tags: [role.id],
            createdFrom: 'Stage 1: Role Roulette',
          };
        }),
    ];

    const likedTitles = likedRoles.map((role) => role.title.en);
    const likedIds = likedRoles.map((role) => role.id);

    const existingLogs = profile.activityLogs ?? [];
    const hasStage1Log = existingLogs.some((log) => log.id === 'stage1-complete');
    const today = new Date().toISOString().slice(0, 10);
    const nextLogs = hasStage1Log
      ? existingLogs
      : [
          ...existingLogs,
          {
            id: 'stage1-complete',
            date: today,
            title: 'Completed Stage 1 role roulette',
            scopeStage: 'C' as const,
            activityType: 'MiraeActivity' as const,
            source: 'Mirae' as const,
            shortReflection: likedTitles.slice(0, 3).join(', '),
          },
        ];

    const nextReport = profile.report ?? {};
    const nextGrowth =
      nextReport.growthText && nextReport.growthText.length > 0
        ? nextReport.growthText
        : likedTitles.length > 0
          ? `Role Roulette favorites: ${likedTitles.slice(0, 3).join(', ')}.`
          : '';

    updateUserProfile({
      likedRoles: likedIds,
      aiGeneratedRoles: likedRoles, // Store the actual AI-generated role objects
      collection: {
        ...profile.collection,
        cards: nextCards,
      },
      customCardTags: {
        ...profile.customCardTags,
        ...Object.fromEntries(likedIds.map((roleId) => [`stage1-role-${roleId}`, [roleId]])),
      },
      activityLogs: nextLogs,
      report: {
        ...nextReport,
        growthText: nextGrowth,
      },
      reportSources: {
        ...profile.reportSources,
        growthText: profile.reportSources?.growthText ?? 'stage1',
      },
    });
    updateProfileAnalytics(nextLogs);
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right', withShimmer = true) => {
    if (isSettling) return;
    if (isFlipped) return;
    const roleId = currentRole.id;
    const swipeData = {
      userId,
      roleId,
      swipeDirection: direction,
      swipeSpeed: 0,
      cardTapCount: 0,
    };

    const persistSwipe = () => {
      const profile = getUserProfile();
      const nextSwipes = [...(profile.roleSwipes ?? []), swipeData];
      const likedIds = nextSwipes
        .filter((swipe) => swipe.swipeDirection === 'right')
        .map((swipe) => swipe.roleId);
      updateUserProfile({
        roleSwipes: nextSwipes,
        likedRoles: Array.from(new Set(likedIds)),
      });
      // Return the actual role objects that were liked
      const likedRoleObjects = rolesToShow.filter((role) => likedIds.includes(role.id));
      return likedRoleObjects;
    };

    const finalizeSwipe = () => {
      const likedRoles = persistSwipe();

      if (currentIndex < rolesToShow.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        completeStage(1);
        commitStage1Results(likedRoles);
        router.push(withBasePath('/stage1/summary'));
      }

      setIsSettling(false);
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      setIsFlipped(false);
    };

    if (withShimmer && !isDragging && !dragActive.current) {
      const nudge = 90;
      if (direction === 'left') setDragOffset({ x: -nudge, y: 0 });
      if (direction === 'right') setDragOffset({ x: nudge, y: 0 });
      setIsDragging(true);
    }

    if (withShimmer) {
      setIsSettling(true);
      triggerShimmer(direction);
      swipeTimer.current = window.setTimeout(() => {
        finalizeSwipe();
      }, 240);
    } else {
      finalizeSwipe();
    }
  }, [
    completeStage,
    commitStage1Results,
    currentIndex,
    currentRole,
    isDragging,
    isFlipped,
    isSettling,
    rolesToShow.length,
    router,
    triggerShimmer,
    userId,
  ]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handleSwipe('left');
      if (event.key === 'ArrowRight') handleSwipe('right');
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleSwipe]);

  useEffect(() => {
    return () => {
      if (shimmerTimer.current) window.clearTimeout(shimmerTimer.current);
      if (swipeTimer.current) window.clearTimeout(swipeTimer.current);
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    dragStart.current = { x: event.clientX, y: event.clientY };
    dragActive.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragActive.current || !dragStart.current) return;
    const x = event.clientX - dragStart.current.x;
    const y = event.clientY - dragStart.current.y;
    setDragOffset({ x, y });
  };

  const handlePointerUp = () => {
    if (!dragStart.current) return;
    const { x, y } = dragOffset;
    const horizontal = Math.abs(x) > 80 && Math.abs(x) > Math.abs(y);

    if (horizontal) {
      handleSwipe(x > 0 ? 'right' : 'left');
    }

    dragStart.current = null;
    dragActive.current = false;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleFlipToggle = () => {
    if (isSettling) return;
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden px-6 pt-24 pb-10 sm:px-10 flex items-center justify-center"
      style={{
        backgroundImage: 'url(/asset/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/30 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-16 h-40 w-40 rounded-full bg-white/30 blur-2xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[1fr_420px] lg:items-center">
        <div className="space-y-6 text-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
            {stageLabel}
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            {sectionLabel}
          </div>

          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">{headingText}</h1>
            <p className="mt-3 max-w-md text-sm text-slate-600 sm:text-base">
              {subheadingText}
            </p>
            <p className="mt-3 max-w-md rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-xs text-slate-600 shadow-sm">
              {noticeText}
            </p>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>
                {currentIndex + 1} / {rolesToShow.length}
              </span>
              <span>{Math.round(progressPercent)}% complete</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-rose-300 to-amber-200 transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(withBasePath('/stage1/summary'))}
              disabled={!progress.stage1Complete}
              className="px-8 py-3 rounded-full bg-slate-300 text-slate-800 shadow-sm transition-all duration-300 ease-out hover:bg-slate-400 disabled:opacity-50"
            >
              {viewSummaryLabel}
            </button>
          </div>
        </div>

        <div className="space-y-6">
        {isLoadingRecommendations ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-700 mb-4"></div>
            <p className="text-slate-600 text-sm">
              {language === 'ko' ? 'AI가 역할을 분석하는 중...' : 'AI is analyzing roles...'}
            </p>
          </div>
        ) : currentRole && (
            <div className="relative card-perspective">
              <div
                className="absolute -inset-3 rounded-[36px] bg-white/30 blur-xl"
                style={{ animation: 'float 10s ease-in-out infinite' }}
              />
              <div className="pointer-events-none absolute inset-0 z-0">
                <div
                  className="absolute inset-0 rounded-[32px] border border-white/50 bg-white/40 shadow-xl"
                  style={{ transform: 'translate(10px, 12px) scale(0.98)' }}
                />
                <div
                  className="absolute inset-0 rounded-[32px] border border-white/40 bg-white/30 shadow-lg"
                  style={{ transform: 'translate(20px, 24px) scale(0.96)' }}
                />
              </div>
              <div
                className="relative z-10 min-h-[460px] cursor-grab select-none transition-all duration-300 ease-out active:cursor-grabbing"
                style={{
                  animation: isDragging ? undefined : 'float 8s ease-in-out infinite',
                  transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${
                    dragOffset.x / 18
                  }deg) scale(${1 + dragIntensity * 0.02})`,
                  boxShadow: `0 24px 60px rgba(15, 23, 42, ${0.15 + dragIntensity * 0.15})`,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="absolute inset-0 card-3d">
                  <div
                    className="card-face card-front card-surface p-8"
                    style={{
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      opacity: isFlipped ? 0 : 1,
                      pointerEvents: isFlipped ? 'none' : 'auto',
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute left-6 top-6 rounded-full border border-white/80 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-500 shadow-sm"
                        style={{ opacity: likeOpacity }}
                      >
                        {likeLabel}
                      </div>
                      <div
                        className="absolute right-6 top-6 rounded-full border border-white/80 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500 shadow-sm"
                        style={{ opacity: passOpacity }}
                      >
                        {passLabel}
                      </div>
                      <div
                        className="absolute inset-0 rounded-[32px] border border-white/80"
                        style={{
                          opacity: dragIntensity * 0.4,
                          boxShadow: `0 0 0 1px rgba(255, 255, 255, ${0.4 + dragIntensity * 0.4}) inset`,
                        }}
                      />
                      {shimmerDirection && (
                        <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                          <div
                            key={shimmerKey}
                            className="absolute -inset-20 shimmer-layer"
                            style={{
                              animation: `${shimmerDirection === 'left' ? 'shimmer-left' : 'shimmer-right'} 650ms ease-out`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-violet-200 to-rose-200 shadow-inner"
                        style={{ animation: 'float 6s ease-in-out infinite' }}
                      >
                        <svg
                          className="h-12 w-12 text-slate-600/80"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {roleIcon}
                        </svg>
                      </div>
                      <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {roleDomain}
                      </span>
                    </div>

                    <div className="space-y-3 text-center">
                      <h2 className="text-3xl font-semibold text-slate-800">{roleTitle}</h2>
                      <p className="text-sm text-slate-600 sm:text-base">{roleTagline}</p>
                      {roleModels && roleModels.length > 0 && (
                        <div className="pt-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {roleModelsLabel}
                          </p>
                          <div className="mt-2 flex flex-wrap justify-center gap-2">
                            {roleModels.map((name) => (
                              <span
                                key={name}
                                className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-xs text-slate-600"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {roleCompanies && roleCompanies.length > 0 && (
                        <div className="pt-3">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {roleCompaniesLabel}
                          </p>
                          <div className="mt-2 flex flex-wrap justify-center gap-2">
                            {roleCompanies.map((name) => (
                              <span
                                key={name}
                                className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-xs text-slate-600"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="card-face card-back card-surface p-8"
                    style={{
                      transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                      opacity: isFlipped ? 1 : 0,
                      pointerEvents: isFlipped ? 'auto' : 'none',
                    }}
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold text-slate-800">{roleTitle}</h3>
                        <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                          {roleDomain}
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {roleDetailsLabel}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{roleDetails}</p>
                      </div>
                      {roleResources && roleResources.length > 0 && (
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">
                            {roleResourcesLabel}
                          </p>
                          <ul className="mt-2 space-y-2 text-sm text-slate-600">
                            {roleResources.map((item) => (
                              <li key={item} className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="text-center text-xs text-slate-500">{flipBackLabel}</div>
                  </div>
                </div>
              </div>
          </div>
        )}

          <div className="flex items-center justify-center gap-4">
          <button
              type="button"
            onClick={() => handleSwipe('left')}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/80 text-rose-500 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white"
              aria-label="Pass"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
          </button>

          <button
              type="button"
              onClick={handleFlipToggle}
              className="group flex h-16 w-16 items-center justify-center rounded-full border border-white/70 bg-white/90 text-sky-500 shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white"
              aria-label={isFlipped ? flipBackLabel : flipLabel}
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 0 1 15.4-6.4" />
                <path d="M21 12a9 9 0 0 1-15.4 6.4" />
                <path d="M18.4 3.6v4h-4" />
                <path d="M5.6 20.4v-4h4" />
              </svg>
          </button>

          <button
              type="button"
            onClick={() => handleSwipe('right')}
              className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/80 text-emerald-500 shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white"
              aria-label="Like"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.8 4.6c-1.5-1.5-3.9-1.5-5.4 0L12 8l-3.4-3.4c-1.5-1.5-3.9-1.5-5.4 0-1.5 1.5-1.5 3.9 0 5.4L12 20l8.8-10c1.5-1.5 1.5-3.9 0-5.4z" />
              </svg>
          </button>
        </div>

          <p className="text-center text-xs text-slate-600">{hintTap}</p>
        </div>
      </div>

      <style jsx>{`
        .card-perspective {
          perspective: 1200px;
        }

        .card-3d {
          transform-style: preserve-3d;
          transition: transform 500ms ease-out;
          will-change: transform;
          transform-origin: center;
          height: 100%;
          width: 100%;
        }

        .card-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transition: transform 500ms ease-out, opacity 220ms ease-out;
        }

        .card-surface {
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          overflow: hidden;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .shimmer-layer {
          background: linear-gradient(
            110deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.75) 45%,
            rgba(255, 255, 255, 0.2) 60%,
            rgba(255, 255, 255, 0) 75%
          );
          opacity: 0;
          mix-blend-mode: screen;
        }

        @keyframes shimmer-right {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }

        @keyframes shimmer-left {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          30% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(-120%);
            opacity: 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
