'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/utils/storage';
import { getUserProfile } from '@/lib/userProfile';
import rolesData from '@/lib/data/roles.json';

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

const roles = rolesData as RoleData[];

export default function Stage1SummaryPage() {
  const [likedRoleIds, setLikedRoleIds] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { language, t } = useI18n();
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const swipes = storage.get<RoleSwipe[]>('roleSwipes', []) ?? [];
    const liked = swipes
      .filter((swipe) => swipe.swipeDirection === 'right')
      .map((swipe) => swipe.roleId);
    const uniqueLiked = Array.from(new Set(liked));
    setLikedRoleIds(uniqueLiked);

  const profile = getUserProfile();
    storage.set('userProfile', {
      ...profile,
      likedRoles: uniqueLiked,
    });
  }, []);

  const likedRoles = useMemo(
    () => roles.filter((role) => likedRoleIds.includes(role.id)),
    [likedRoleIds]
  );

  const headingText = t('stage1SummaryHeading');
  const subheadingText = t('stage1SummarySubheading');
  const emptyText = t('stage1SummaryEmpty');
  const dashboardLabel = t('stage1SummaryBackDashboard');
  const nextStageLabel = t('stage1SummaryNextStage');
  const hintLabel = t('stage1SummaryHint');
  const redoLabel = t('stage1SummaryRedo');
  const confirmTitle = t('stage1SummaryConfirmTitle');
  const confirmBody = t('stage1SummaryConfirmBody');
  const confirmCancel = t('stage1SummaryConfirmCancel');
  const confirmConfirm = t('stage1SummaryConfirmConfirm');

  const scrollCarousel = (direction: 'prev' | 'next') => {
    if (!carouselRef.current) return;
    const offset = direction === 'next' ? 320 : -320;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleRedo = () => {
    storage.remove('roleSwipes');
  const profile = getUserProfile();
    storage.set('userProfile', {
      ...profile,
      likedRoles: [],
    });
    router.push('/stage1');
  };

  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{
        background:
          'linear-gradient(135deg, #9BCBFF 0%, #C7B9FF 25%, #F4A9C8 50%, #FFD1A8 75%, #BEEDE3 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-slate-800">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
            {t('stage1SummaryTag')}
          </div>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{headingText}</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            {subheadingText}
          </p>
        </div>

        {likedRoles.length === 0 && (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-sm text-slate-600 shadow-sm backdrop-blur">
            {emptyText}
          </div>
        )}

        {likedRoles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{hintLabel}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollCarousel('prev')}
                  className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 ease-out hover:bg-white"
                >
                  {t('stage1SummaryPrev')}
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('next')}
                  className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 transition-all duration-300 ease-out hover:bg-white"
                >
                  {t('stage1SummaryNext')}
                </button>
              </div>
            </div>
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
            >
              {likedRoles.map((role) => {
                const roleTitle = language === 'ko' ? role.title.ko : role.title.en;
                const roleTagline = language === 'ko' ? role.tagline.ko : role.tagline.en;
                const roleDomain = language === 'ko' ? role.domain.ko : role.domain.en;
                const roleModels = language === 'ko' ? role.roleModels.ko : role.roleModels.en;
                const roleCompanies = language === 'ko' ? role.companies.ko : role.companies.en;
                return (
                  <div
                    key={role.id}
                    className="w-[280px] flex-shrink-0 snap-center rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-lg backdrop-blur sm:w-[320px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {roleDomain}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-200 via-violet-200 to-rose-200 text-sm font-semibold text-slate-600 shadow-inner">
                        {roleTitle.slice(0, 2)}
                      </div>
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold text-slate-800">{roleTitle}</h2>
                    <p className="mt-2 text-sm text-slate-600">{roleTagline}</p>

                    {roleModels && roleModels.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {t('stage1SummaryRoleModels')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
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
                      <div className="mt-4">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {t('stage1SummaryWhereWork')}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
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
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-white/70 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
          >
            {dashboardLabel}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="rounded-full border border-white/70 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
          >
            {redoLabel}
          </button>
          <button
            type="button"
            onClick={() => router.push('/stage2')}
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
          >
            {nextStageLabel}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-800">{confirmTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">{confirmBody}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
              >
                {confirmCancel}
              </button>
              <button
                type="button"
                onClick={handleRedo}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
              >
                {confirmConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
