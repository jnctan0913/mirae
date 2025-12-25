'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import coursesData from '@/lib/data/courses-descriptions.json';
import rolesData from '@/lib/data/roles.json';

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

interface RoleLocale {
  en: string;
  ko: string;
}

interface RoleData {
  id: string;
  title: RoleLocale;
}

type SavedSelection = {
  anchor: string[];
  signal: string[];
  savedAt: string;
} | null;

const categories: CourseCategory[] = ['general', 'career', 'interdisciplinary'];
const courses = coursesData as CourseSubject[];
const roles = rolesData as RoleData[];

const createCourseKey = (
  subjectEn: string,
  category: CourseCategory,
  courseEn: string
) => `${subjectEn}::${category}::${courseEn}`;

const strengthSignals: Record<
  string,
  { keywords: string[]; label: string }
> = {
  analytical: {
    keywords: ['math', 'statistics', 'data', 'science', 'physics', 'chemistry', 'algebra', 'calculus'],
    label: 'Analytical',
  },
  creative: {
    keywords: ['art', 'music', 'theater', 'literature', 'media', 'writing', 'film'],
    label: 'Creative',
  },
  empathy: {
    keywords: ['ethics', 'culture', 'psychology', 'human', 'society', 'social', 'law', 'politics', 'communication'],
    label: 'Empathy',
  },
  organization: {
    keywords: ['economics', 'law', 'politics', 'workplace', 'communication', 'planning'],
    label: 'Organization',
  },
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

const roleSignals: Record<string, { keywords: string[]; label: string }> = {
  'ux-designer': {
    keywords: ['design', 'media', 'art', 'writing', 'communication'],
    label: 'UX',
  },
  'data-scientist': {
    keywords: ['data', 'statistics', 'math', 'informatics', 'science', 'ai'],
    label: 'Data/AI',
  },
  'product-manager': {
    keywords: ['product', 'strategy', 'roadmap', 'business', 'user', 'market', 'growth'],
    label: 'Product',
  },
  'software-engineer': {
    keywords: ['software', 'computer', 'programming', 'coding', 'engineering', 'systems'],
    label: 'Engineering',
  },
  'robotics-engineer': {
    keywords: ['robot', 'robotics', 'automation', 'hardware', 'mechatronics', 'control'],
    label: 'Robotics',
  },
  'environmental-scientist': {
    keywords: ['environment', 'ecology', 'climate', 'sustainability', 'earth', 'biology'],
    label: 'Environment',
  },
  'biomedical-researcher': {
    keywords: ['biomedical', 'biology', 'medicine', 'health', 'genetics', 'laboratory'],
    label: 'Biomedical',
  },
  'clinical-psychologist': {
    keywords: ['psychology', 'mental', 'therapy', 'counseling', 'behavior', 'wellbeing'],
    label: 'Psychology',
  },
  'social-entrepreneur': {
    keywords: ['social', 'community', 'impact', 'entrepreneur', 'nonprofit', 'sustainability'],
    label: 'Social impact',
  },
  'teacher-educator': {
    keywords: ['education', 'teaching', 'learning', 'pedagogy', 'curriculum', 'school'],
    label: 'Education',
  },
  journalist: {
    keywords: ['journalism', 'media', 'reporting', 'writing', 'news', 'communication'],
    label: 'Journalism',
  },
  'policy-analyst': {
    keywords: ['policy', 'government', 'public', 'economics', 'regulation', 'civic'],
    label: 'Policy',
  },
  'brand-strategist': {
    keywords: ['brand', 'marketing', 'strategy', 'advertising', 'storytelling', 'identity'],
    label: 'Brand',
  },
  'financial-analyst': {
    keywords: ['finance', 'investment', 'accounting', 'economics', 'markets', 'business'],
    label: 'Finance',
  },
  'urban-planner': {
    keywords: ['urban', 'city', 'planning', 'architecture', 'infrastructure', 'transportation'],
    label: 'Urban planning',
  },
};

export default function Stage2SummaryPage() {
  const router = useRouter();
  const { language } = useI18n();
  const [selection, setSelection] = useState<SavedSelection>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [likedRoles, setLikedRoles] = useState<string[]>([]);
  const [stage0Roles, setStage0Roles] = useState<string[]>([]);
  const [docKeywords, setDocKeywords] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    setSelection(profile.stage2Selection ?? null);
    const rawStrengths = (profile as unknown as { strengths?: string[] }).strengths;
    const strengthTags = Array.isArray(rawStrengths)
      ? rawStrengths
      : profile.strengthTags ?? [];
    const derivedStrengths = strengthTags.length > 0
      ? strengthTags
      : Array.from(
          new Set(
            (profile.stage0Profile?.topSignals ?? [])
              .map((tag) => stage0TagToStrength[tag])
              .filter(Boolean)
          )
        );
    setStrengths(derivedStrengths);
    setLikedRoles(profile?.likedRoles ?? []);
    setStage0Roles(profile.stage0Summary?.recommendedRoles ?? []);
    const docStopWords = new Set([
      'pdf',
      'doc',
      'docx',
      'hwp',
      'txt',
      'png',
      'jpg',
      'jpeg',
      'zip',
      'ppt',
      'pptx',
      'xls',
      'xlsx',
      'final',
      'draft',
      'copy',
      'portfolio',
      'resume',
      'certificate',
      'certificates',
      '생기부',
    ]);
    const tokenize = (value: string) =>
      value
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((token) => token.length >= 2 && !docStopWords.has(token));
    const legacyProfile = profile as unknown as {
      onboardingKeywords?: string[];
      uploadedDocs?: string[];
      docKeywords?: string[];
    };
    const keywordSource = [
      ...(profile?.keywords ?? []),
      ...(profile?.onboarding?.keywords ?? []),
      ...(profile?.onboarding?.uploadedDocs ?? []),
      ...(profile?.onboarding?.docKeywords ?? []),
      ...(legacyProfile.onboardingKeywords ?? []),
      ...(legacyProfile.uploadedDocs ?? []),
      ...(legacyProfile.docKeywords ?? []),
    ];
    if (keywordSource.length > 0) {
      const tokens = Array.from(new Set(keywordSource.flatMap((item) => tokenize(item))));
      setDocKeywords(tokens);
    } else {
      setDocKeywords([]);
    }
  }, []);

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

  const strengthLabels = strengths
    .map((strength) => strengthSignals[strength]?.label ?? strength)
    .filter(Boolean);

  const likedRoleLabels = likedRoles
    .map((roleId) => roles.find((role) => role.id === roleId))
    .map((role) => (role ? (language === 'ko' ? role.title.ko : role.title.en) : null))
    .filter((label): label is string => Boolean(label));
  const stage0RoleLabels = stage0Roles
    .filter((roleId) => !likedRoles.includes(roleId))
    .map((roleId) => roles.find((role) => role.id === roleId))
    .map((role) => (role ? (language === 'ko' ? role.title.ko : role.title.en) : null))
    .filter((label): label is string => Boolean(label));

  const selectedCourses = useMemo(() => {
    if (!selection) return { required: [], electives: [] };
    const required = selection.anchor
      .map((key) => courseLookup.get(key))
      .filter((course): course is CourseLookupItem => Boolean(course));
    const electives = selection.signal
      .map((key) => courseLookup.get(key))
      .filter((course): course is CourseLookupItem => Boolean(course));
    return { required, electives };
  }, [selection, courseLookup]);

  const alignment = useMemo(() => {
    const selected = [...selectedCourses.required, ...selectedCourses.electives];
    const roleKeywords = likedRoles
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

    return {
      total,
      strengthCount,
      roleCount,
      docCount,
      anyCount,
      score,
    };
  }, [selectedCourses, strengths, likedRoles, docKeywords]);

  const summaryTitle = language === 'ko' ? 'Selection Summary' : 'Selection Summary';
  const summarySubtitle =
    language === 'ko'
      ? 'Review how your picks align with your profile.'
      : 'Review how your picks align with your profile.';
  const backLabel = language === 'ko' ? 'Back to Stage 2' : 'Back to Stage 2';
  const requiredLabel = language === 'ko' ? 'Required' : 'Required';
  const electivesLabel = language === 'ko' ? 'Electives' : 'Electives';
  const profileLabel = language === 'ko' ? 'Profile snapshot' : 'Profile snapshot';
  const alignmentLabel = language === 'ko' ? 'Alignment' : 'Alignment';
  const emptyLabel = language === 'ko' ? 'No saved selection yet.' : 'No saved selection yet.';
  const docKeywordsLabel = language === 'ko' ? '온보딩/업로드 키워드' : 'Onboarding + uploads';
  const dashboardLabel = language === 'ko' ? 'Back to dashboard' : 'Back to dashboard';
  const redoLabel = language === 'ko' ? 'Clear & redo Stage 2' : 'Clear & redo Stage 2';
  const nextStageLabel = language === 'ko' ? 'Continue to Stage 3' : 'Continue to Stage 3';
  const confirmTitle = language === 'ko' ? 'Clear Stage 2 selection?' : 'Clear Stage 2 selection?';
  const confirmBody =
    language === 'ko'
      ? 'Your saved selection will be cleared so you can rebuild it.'
      : 'Your saved selection will be cleared so you can rebuild it.';
  const confirmCancel = language === 'ko' ? '취소' : 'Cancel';
  const confirmConfirm = language === 'ko' ? 'Yes, clear' : 'Yes, clear';

  const handleRedo = () => {
    updateUserProfile({ stage2Selection: undefined });
    setSelection(null);
    router.push('/stage2');
  };

  if (!selection) {
    return (
      <div
        className="min-h-screen px-6 py-12"
        style={{
          background:
            'linear-gradient(135deg, #9BCBFF 0%, #C7B9FF 25%, #F4A9C8 50%, #FFD1A8 75%, #BEEDE3 100%)',
        }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur">
            <h1 className="text-2xl font-semibold text-slate-800">{summaryTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{emptyLabel}</p>
            <button
              type="button"
              onClick={() => router.push('/stage2')}
              className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{
        background:
          'linear-gradient(135deg, #9BCBFF 0%, #C7B9FF 25%, #F4A9C8 50%, #FFD1A8 75%, #BEEDE3 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold text-slate-800">{summaryTitle}</h1>
          <p className="mt-2 text-sm text-slate-600">{summarySubtitle}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
              {alignment.total} selected
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
              Fit score: {alignment.score}%
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">{requiredLabel}</h2>
                <span className="text-xs text-slate-500">{selectedCourses.required.length}</span>
              </div>
              <div className="space-y-3">
                {selectedCourses.required.map((course) => {
                  const courseLabel = language === 'ko' ? course.kr : course.en;
                  const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                  return (
                    <div
                      key={`${course.subjectEn}-${course.category}-${course.en}`}
                      className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                      <p className="text-xs text-slate-500">{subjectLabel}</p>
                    </div>
                  );
                })}
                {selectedCourses.required.length === 0 && (
                  <p className="text-sm text-slate-500">No required courses selected.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">{electivesLabel}</h2>
                <span className="text-xs text-slate-500">{selectedCourses.electives.length}</span>
              </div>
              <div className="space-y-3">
                {selectedCourses.electives.map((course) => {
                  const courseLabel = language === 'ko' ? course.kr : course.en;
                  const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                  return (
                    <div
                      key={`${course.subjectEn}-${course.category}-${course.en}`}
                      className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                      <p className="text-xs text-slate-500">{subjectLabel}</p>
                    </div>
                  );
                })}
                {selectedCourses.electives.length === 0 && (
                  <p className="text-sm text-slate-500">No electives selected.</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800">{profileLabel}</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Stage 0 strengths</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {strengthLabels.length > 0 ? (
                      strengthLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-slate-700"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No strengths yet.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Stage 1 liked roles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {likedRoleLabels.length > 0 ? (
                      likedRoleLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-slate-700"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No liked roles yet.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Stage 0 suggested roles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stage0RoleLabels.length > 0 ? (
                      stage0RoleLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-slate-700"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No suggested roles yet.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">{docKeywordsLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {docKeywords.length > 0 ? (
                      docKeywords.slice(0, 8).map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-slate-700"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">No keywords yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800">{alignmentLabel}</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Matches strengths</span>
                  <span>{alignment.strengthCount} courses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Matches liked roles</span>
                  <span>{alignment.roleCount} courses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>
                    {language === 'ko'
                      ? '온보딩/업로드 키워드 매칭'
                      : 'Matches onboarding + uploads'}
                  </span>
                  <span>{alignment.docCount} courses</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-700">
                  <span>Overall alignment</span>
                  <span>{alignment.anyCount} / {alignment.total}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/stage3')}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
            >
              {nextStageLabel}
            </button>

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
            </div>
          </div>
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
