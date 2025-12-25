'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';
import coursesData from '@/lib/data/courses-descriptions.json';
import rolesData from '@/lib/data/roles.json';
import { Zap, Heart, FileText } from 'lucide-react';
import { withBasePath } from '@/lib/basePath';

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
  const [docKeywords, setDocKeywords] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const syncProfile = (profile: ReturnType<typeof getUserProfile>) => {
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
  };

  useEffect(() => {
    syncProfile(getUserProfile());
    if (typeof window !== 'undefined') {
      const handleProfileUpdate = () => syncProfile(getUserProfile());
      window.addEventListener('miraeProfileUpdated', handleProfileUpdate);
      return () => window.removeEventListener('miraeProfileUpdated', handleProfileUpdate);
    }
    return undefined;
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
  const requiredLabel = language === 'ko' ? 'Required Courses' : 'Required Courses';
  const electivesLabel = language === 'ko' ? 'Elective Courses' : 'Elective Courses';
  const profileLabel = language === 'ko' ? 'Profile snapshot' : 'Profile snapshot';
  const alignmentLabel = language === 'ko' ? 'Alignment' : 'Alignment';
  const emptyLabel = language === 'ko' ? 'No saved selection yet.' : 'No saved selection yet.';
  const docKeywordsLabel = language === 'ko' ? '선호도' : 'Preference';
  const dashboardLabel = language === 'ko' ? 'Back to dashboard' : 'Back to dashboard';
  const redoLabel = language === 'ko' ? 'Clear & redo Stage 2' : 'Clear & redo Stage 2';
  const nextStageLabel = language === 'ko' ? '다음 단계' : 'Next step';
  const confirmTitle = language === 'ko' ? 'Clear Stage 2 selection?' : 'Clear Stage 2 selection?';
  const confirmBody =
    language === 'ko'
      ? 'Your saved selection will be cleared so you can rebuild it.'
      : 'Your saved selection will be cleared so you can rebuild it.';
  const confirmCancel = language === 'ko' ? '취소' : 'Cancel';
  const confirmConfirm = language === 'ko' ? 'Yes, clear' : 'Yes, clear';
  const semesterLabel = language === 'ko' ? '대상 학기' : 'Target semester';
  const semesterDisplay = (value?: string) => {
    switch (value) {
      case 'year-1-sem-1':
        return language === 'ko' ? '1학년 1학기' : 'Year 1 Semester 1';
      case 'year-1-sem-2':
        return language === 'ko' ? '1학년 2학기' : 'Year 1 Semester 2';
      case 'year-2-sem-1':
        return language === 'ko' ? '2학년 1학기' : 'Year 2 Semester 1';
      case 'year-2-sem-2':
        return language === 'ko' ? '2학년 2학기' : 'Year 2 Semester 2';
      case 'year-3-sem-1':
        return language === 'ko' ? '3학년 1학기' : 'Year 3 Semester 1';
      case 'year-3-sem-2':
        return language === 'ko' ? '3학년 2학기' : 'Year 3 Semester 2';
      default:
        return language === 'ko' ? '미설정' : 'Not set';
    }
  };
  const alignmentMetrics = [
    {
      label: language === 'ko' ? '강점' : 'Strength',
      value: alignment.strengthCount,
    },
    {
      label: language === 'ko' ? '역할' : 'Role',
      value: alignment.roleCount,
    },
    {
      label: language === 'ko' ? '키워드' : 'Keywords',
      value: alignment.docCount,
    },
  ];
  const alignmentMax = Math.max(
    1,
    alignment.strengthCount,
    alignment.roleCount,
    alignment.docCount
  );
  const radarPoints = alignmentMetrics.map((metric, index) => {
    const angle = (Math.PI * 2 * index) / alignmentMetrics.length - Math.PI / 2;
    const radius = (metric.value / alignmentMax) * 60;
    const x = 80 + Math.cos(angle) * radius;
    const y = 80 + Math.sin(angle) * radius;
    return `${x},${y}`;
  });

  const handleRedo = () => {
    updateUserProfile({ stage2Selection: undefined });
    setSelection(null);
    router.push(withBasePath('/stage2'));
  };

  if (!selection) {
    return (
      <div
        className="min-h-screen px-6 py-12 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/asset/Background.png')" }}
      >
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur">
            <h1 className="text-2xl font-semibold text-slate-800">{summaryTitle}</h1>
            <p className="mt-2 text-sm text-slate-600">{emptyLabel}</p>
            <button
              type="button"
              onClick={() => router.push(withBasePath('/stage2'))}
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
      className="min-h-screen px-6 py-3 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="mx-auto w-full max-w-7xl space-y-2 text-sm text-slate-600">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">{summaryTitle}</h1>
          <p className="mt-1 text-sm text-slate-600">{summarySubtitle}</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
              {alignment.total} selected
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
              Fit score: {alignment.score}%
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1">
              {semesterLabel}: {semesterDisplay(selection?.targetSemester)}
            </span>
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-2.5">
            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-blue-50/50 p-4 shadow-sm backdrop-blur space-y-2.5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-slate-800">{requiredLabel}</h2>
                  <span className="text-sm text-slate-500">{selectedCourses.required.length}</span>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {selectedCourses.required.map((course) => {
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    return (
                      <div
                        key={`${course.subjectEn}-${course.category}-${course.en}`}
                        className="rounded-2xl border border-blue-200/70 bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm"
                      >
                        <p className="text-base font-semibold text-slate-800">{courseLabel}</p>
                      </div>
                    );
                  })}
                  {selectedCourses.required.length === 0 && (
                    <p className="text-sm text-slate-500">No required courses selected.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-blue-100 pt-2.5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-slate-800">{electivesLabel}</h2>
                  <span className="text-sm text-slate-500">{selectedCourses.electives.length}</span>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {selectedCourses.electives.map((course) => {
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    return (
                      <div
                        key={`${course.subjectEn}-${course.category}-${course.en}`}
                        className="rounded-2xl border border-pink-200/70 bg-gradient-to-br from-white to-pink-50/30 p-4 shadow-sm"
                      >
                        <p className="text-base font-semibold text-slate-800">{courseLabel}</p>
                      </div>
                    );
                  })}
                  {selectedCourses.electives.length === 0 && (
                    <p className="text-sm text-slate-500">No electives selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/60 p-4 shadow-[0_8px_30px_-15px_rgba(100,116,139,0.25)] backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{profileLabel}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Strengths */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                      <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Strengths</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strengthLabels.length > 0 ? (
                      strengthLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/80 px-3 py-1 text-sm font-medium text-amber-900 shadow-sm"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No strengths yet</span>
                    )}
                  </div>
                </div>

                {/* Liked Roles */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 shadow-sm">
                      <Heart className="h-3.5 w-3.5 text-white fill-white" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Liked Roles</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {likedRoleLabels.length > 0 ? (
                      likedRoleLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50/80 px-3 py-1 text-sm font-medium text-pink-900 shadow-sm"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No liked roles yet</span>
                    )}
                  </div>
                </div>

                {/* Keywords */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 shadow-sm">
                      <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{docKeywordsLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {docKeywords.length > 0 ? (
                      docKeywords.slice(0, 8).map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50/80 px-3 py-1 text-sm font-medium text-blue-900 shadow-sm"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic">No keywords yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur min-h-[360px] flex flex-col">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">{alignmentLabel}</h2>
              <div className="grid gap-5 md:grid-cols-2 items-center flex-1">
                <div className="flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="h-56 w-56">
                    <defs>
                      <linearGradient id="stage2RadarFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(155, 203, 255, 0.5)" />
                        <stop offset="100%" stopColor="rgba(244, 169, 200, 0.45)" />
                      </linearGradient>
                    </defs>
                    {[18, 36, 54, 72].map((ring) => (
                      <circle key={ring} cx="80" cy="80" r={ring} fill="none" stroke="#EDEFF6" strokeWidth="1" />
                    ))}
                    {alignmentMetrics.map((metric, index) => {
                      const angle = (Math.PI * 2 * index) / alignmentMetrics.length - Math.PI / 2;
                      const x = 80 + Math.cos(angle) * 60;
                      const y = 80 + Math.sin(angle) * 60;
                      return (
                        <g key={metric.label}>
                          <line x1="80" y1="80" x2={x} y2={y} stroke="#D9E2F2" strokeWidth="1" />
                          <text x={80 + Math.cos(angle) * 74} y={80 + Math.sin(angle) * 74} fontSize="9" fill="#6B7280" textAnchor="middle">
                            {metric.label}
                          </text>
                        </g>
                      );
                    })}
                    <polygon
                      points={radarPoints.join(' ')}
                      fill="url(#stage2RadarFill)"
                      stroke="#9BCBFF"
                      strokeWidth="1.5"
                    />
                    <circle cx="80" cy="80" r="3" fill="#F4A9C8" />
                  </svg>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
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
                        ? '선호도 매칭'
                        : 'Matches preferences'}
                    </span>
                    <span>{alignment.docCount} courses</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>Overall alignment</span>
                    <span>{alignment.anyCount} / {alignment.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => router.push(withBasePath('/dashboard'))}
                className="rounded-full border border-white/70 bg-white/80 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
              >
                {dashboardLabel}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="rounded-full border border-white/70 bg-white/80 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white"
              >
                {redoLabel}
              </button>
              <button
                type="button"
                onClick={() => router.push(withBasePath('/stage3'))}
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
              >
                {nextStageLabel}
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
