'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/utils/storage';
import coursesData from '@/lib/data/courses-descriptions.json';

type CourseCategory = 'general' | 'career' | 'interdisciplinary';

type CategoryFilter = CourseCategory | 'all';

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

interface RoleSwipe {
  roleId: string;
  swipeDirection: 'left' | 'right' | 'up';
}

type SelectionSlot = {
  anchor: string[];
  signal: string[];
  savedAt: string;
} | null;

const categories: CourseCategory[] = ['general', 'career', 'interdisciplinary'];
const categoryLabels: Record<CourseCategory, { en: string; ko: string }> = {
  general: { en: 'General', ko: '??' },
  career: { en: 'Career', ko: '??' },
  interdisciplinary: { en: 'Interdisciplinary', ko: '??' },
};

const maxBucketSize = 6;
const courses = coursesData as CourseSubject[];

const createCourseKey = (
  subjectEn: string,
  category: CourseCategory,
  courseEn: string
) => `${subjectEn}::${category}::${courseEn}`;

const matchesCourse = (course: CourseLabel, term: string) => {
  const normalizedTerm = term.toLowerCase();
  return (
    course.en.toLowerCase().includes(normalizedTerm) ||
    course.kr.toLowerCase().includes(normalizedTerm)
  );
};

const subjectMatches = (subject: CourseSubject, term: string) => {
  const normalizedTerm = term.toLowerCase();
  return (
    subject.subject_en.toLowerCase().includes(normalizedTerm) ||
    subject.subject_kr.toLowerCase().includes(normalizedTerm)
  );
};

const strengthSignals: Record<
  string,
  { keywords: string[]; reasonEn: string; reasonKo: string }
> = {
  analytical: {
    keywords: ['math', 'statistics', 'data', 'science', 'physics', 'chemistry', 'algebra', 'calculus'],
    reasonEn: 'Matches your analytical strengths',
    reasonKo: '??? ??? ? ???',
  },
  creative: {
    keywords: ['art', 'music', 'theater', 'literature', 'media', 'writing', 'film'],
    reasonEn: 'Supports your creative strengths',
    reasonKo: '??? ??? ????',
  },
  empathy: {
    keywords: ['ethics', 'culture', 'psychology', 'human', 'society', 'social', 'law', 'politics', 'communication'],
    reasonEn: 'Builds on your empathy/social strengths',
    reasonKo: '??/??? ??? ????',
  },
  organization: {
    keywords: ['economics', 'law', 'politics', 'workplace', 'communication', 'planning'],
    reasonEn: 'Aligns with your organization strengths',
    reasonKo: '??/?? ??? ? ???',
  },
};

const roleSignals: Record<
  string,
  { keywords: string[]; reasonEn: string; reasonKo: string }
> = {
  'ux-designer': {
    keywords: ['design', 'media', 'art', 'writing', 'communication'],
    reasonEn: 'Related to roles you liked (UX)',
    reasonKo: 'Related to roles you liked (UX)',
  },
  'data-scientist': {
    keywords: ['data', 'statistics', 'math', 'informatics', 'science', 'ai'],
    reasonEn: 'Related to roles you liked (data/AI)',
    reasonKo: 'Related to roles you liked (data/AI)',
  },
  'product-manager': {
    keywords: ['product', 'strategy', 'roadmap', 'business', 'user', 'market', 'growth'],
    reasonEn: 'Related to roles you liked (product)',
    reasonKo: 'Related to roles you liked (product)',
  },
  'software-engineer': {
    keywords: ['software', 'computer', 'programming', 'coding', 'engineering', 'systems'],
    reasonEn: 'Related to roles you liked (engineering)',
    reasonKo: 'Related to roles you liked (engineering)',
  },
  'robotics-engineer': {
    keywords: ['robot', 'robotics', 'automation', 'hardware', 'mechatronics', 'control'],
    reasonEn: 'Related to roles you liked (robotics)',
    reasonKo: 'Related to roles you liked (robotics)',
  },
  'environmental-scientist': {
    keywords: ['environment', 'ecology', 'climate', 'sustainability', 'earth', 'biology'],
    reasonEn: 'Related to roles you liked (environment)',
    reasonKo: 'Related to roles you liked (environment)',
  },
  'biomedical-researcher': {
    keywords: ['biomedical', 'biology', 'medicine', 'health', 'genetics', 'laboratory'],
    reasonEn: 'Related to roles you liked (biomedical)',
    reasonKo: 'Related to roles you liked (biomedical)',
  },
  'clinical-psychologist': {
    keywords: ['psychology', 'mental', 'therapy', 'counseling', 'behavior', 'wellbeing'],
    reasonEn: 'Related to roles you liked (psychology)',
    reasonKo: 'Related to roles you liked (psychology)',
  },
  'social-entrepreneur': {
    keywords: ['social', 'community', 'impact', 'entrepreneur', 'nonprofit', 'sustainability'],
    reasonEn: 'Related to roles you liked (social impact)',
    reasonKo: 'Related to roles you liked (social impact)',
  },
  'teacher-educator': {
    keywords: ['education', 'teaching', 'learning', 'pedagogy', 'curriculum', 'school'],
    reasonEn: 'Related to roles you liked (education)',
    reasonKo: 'Related to roles you liked (education)',
  },
  journalist: {
    keywords: ['journalism', 'media', 'reporting', 'writing', 'news', 'communication'],
    reasonEn: 'Related to roles you liked (journalism)',
    reasonKo: 'Related to roles you liked (journalism)',
  },
  'policy-analyst': {
    keywords: ['policy', 'government', 'public', 'economics', 'regulation', 'civic'],
    reasonEn: 'Related to roles you liked (policy)',
    reasonKo: 'Related to roles you liked (policy)',
  },
  'brand-strategist': {
    keywords: ['brand', 'marketing', 'strategy', 'advertising', 'storytelling', 'identity'],
    reasonEn: 'Related to roles you liked (brand)',
    reasonKo: 'Related to roles you liked (brand)',
  },
  'financial-analyst': {
    keywords: ['finance', 'investment', 'accounting', 'economics', 'markets', 'business'],
    reasonEn: 'Related to roles you liked (finance)',
    reasonKo: 'Related to roles you liked (finance)',
  },
  'urban-planner': {
    keywords: ['urban', 'city', 'planning', 'architecture', 'infrastructure', 'transportation'],
    reasonEn: 'Related to roles you liked (urban planning)',
    reasonKo: 'Related to roles you liked (urban planning)',
  },
};

export default function Stage2Page() {
  const [anchor, setAnchor] = useState<string[]>([]);
  const [signal, setSignal] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(courses[0]?.id ?? 0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [likedRoles, setLikedRoles] = useState<string[]>([]);
  const [docKeywords, setDocKeywords] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [savedSlots, setSavedSlots] = useState<SelectionSlot[]>([null, null, null]);
  const router = useRouter();
  const { completeStage, userId, progress } = useUserStore();
  const { language, t } = useI18n();
  const selectedKeys = useMemo(() => new Set([...anchor, ...signal]), [anchor, signal]);
  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
  const filteredSubjects = useMemo<CourseSubject[]>(() => {
    if (!normalizedSearch) return courses;

    return courses
      .map((subject) => {
        if (subjectMatches(subject, normalizedSearch)) {
          return subject;
        }

        const filteredElectives = categories.reduce(
          (acc, category) => {
            acc[category] = subject.electives[category].filter((course) =>
              matchesCourse(course, normalizedSearch)
            );
            return acc;
          },
          {} as Record<CourseCategory, CourseLabel[]>
        );

        const hasMatches = categories.some((category) => filteredElectives[category].length > 0);
        if (!hasMatches) return null;

        return {
          ...subject,
          electives: filteredElectives,
        };
      })
      .filter((subject): subject is CourseSubject => subject !== null);
  }, [normalizedSearch]);
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

  const slotsStorageKey = useMemo(
    () => `courseSelections_${userId ?? 'guest'}`,
    [userId]
  );
  const currentSelectionKey = useMemo(
    () => `stage2Selection_${userId ?? 'guest'}`,
    [userId]
  );

  useEffect(() => {
    const stored = storage.get<SelectionSlot[]>(slotsStorageKey, [null, null, null]) ?? [
      null,
      null,
      null,
    ];
    const normalized = Array.from({ length: 3 }, (_, index) => stored[index] ?? null);
    setSavedSlots(normalized);
  }, [slotsStorageKey]);

  useEffect(() => {
    const profile = storage.get<{
      strengths?: string[];
      likedRoles?: string[];
      onboardingKeywords?: string[];
      uploadedDocs?: string[];
      docKeywords?: string[];
    }>('userProfile');
    if (profile?.strengths) {
      setStrengths(profile.strengths);
    }

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
    const keywordSource = [
      ...(profile?.onboardingKeywords ?? []),
      ...(profile?.uploadedDocs ?? []),
      ...(profile?.docKeywords ?? []),
    ];
    if (keywordSource.length > 0) {
      const tokens = Array.from(new Set(keywordSource.flatMap((item) => tokenize(item))));
      setDocKeywords(tokens);
    } else {
      setDocKeywords([]);
    }

    const storedLiked = profile?.likedRoles ?? [];
    if (storedLiked.length > 0) {
      setLikedRoles(Array.from(new Set(storedLiked)));
      return;
    }

    const swipes = storage.get<RoleSwipe[]>('roleSwipes', []) ?? [];
    const liked = swipes
      .filter((swipe) => swipe.swipeDirection === 'right')
      .map((swipe) => swipe.roleId);
    const uniqueLiked = Array.from(new Set(liked));
    setLikedRoles(uniqueLiked);

    if (uniqueLiked.length > 0) {
      storage.set('userProfile', {
        ...(profile ?? {}),
        likedRoles: uniqueLiked,
      });
    }
  }, []);

  useEffect(() => {
    if (!filteredSubjects.length) return;
    const exists = filteredSubjects.some((subject) => subject.id === selectedSubjectId);
    if (!exists) {
      setSelectedSubjectId(filteredSubjects[0].id);
    }
  }, [filteredSubjects, selectedSubjectId]);

  const selectedSubject =
    filteredSubjects.find((subject) => subject.id === selectedSubjectId) ??
    filteredSubjects[0] ??
    null;

  const suggestions = useMemo(() => {
    const suggestionMap = new Map<
      string,
      {
        score: number;
        reasons: Set<string>;
        label: CourseLabel;
        subject: CourseSubject;
        category: CourseCategory;
      }
    >();

    courses.forEach((subject) => {
      categories.forEach((category) => {
        subject.electives[category].forEach((course) => {
          const key = createCourseKey(subject.subject_en, category, course.en);
          if (selectedKeys.has(key)) return;

          let score = 0;
          const reasons = new Set<string>();
          const courseLabelLower = course.en.toLowerCase();

          strengths.forEach((strength) => {
            const signal = strengthSignals[strength];
            if (!signal) return;
            if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
              score += 2;
              reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
            }
          });

          if (docKeywords.length > 0) {
            const courseLabelLowerKr = course.kr.toLowerCase();
            const matches = docKeywords.filter(
              (keyword) =>
                courseLabelLower.includes(keyword) || courseLabelLowerKr.includes(keyword)
            );
            if (matches.length > 0) {
              score += Math.min(2, matches.length);
              reasons.add(
                language === 'ko'
                  ? 'Based on your uploaded docs'
                  : 'Based on your uploaded docs'
              );
            }
          }

          likedRoles.forEach((roleId) => {
            const signal = roleSignals[roleId];
            if (!signal) return;
            if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
              score += 3;
              reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
            }
          });

          if (score === 0) return;

          const existing = suggestionMap.get(key);
          if (existing) {
            existing.score += score;
            reasons.forEach((reason) => existing.reasons.add(reason));
          } else {
            suggestionMap.set(key, {
              score,
              reasons,
              label: course,
              subject,
              category,
            });
          }
        });
      });
    });

    return Array.from(suggestionMap.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 6)
      .map(([key, value]) => ({
        key,
        ...value,
      }));
  }, [likedRoles, strengths, selectedKeys, language, docKeywords]);

  const getRecommendedBucket = (category: CourseCategory, score: number) => {
    if (category === 'general' || score >= 4) return 'anchor';
    return 'signal';
  };

  const addToAnchor = (key: string) => {
    setSignal((prev) => prev.filter((item) => item !== key));
    setAnchor((prev) => {
      if (prev.includes(key) || prev.length >= maxBucketSize) return prev;
      return [...prev, key];
    });
  };

  const addToSignal = (key: string) => {
    setAnchor((prev) => prev.filter((item) => item !== key));
    setSignal((prev) => {
      if (prev.includes(key) || prev.length >= maxBucketSize) return prev;
      return [...prev, key];
    });
  };

  const removeSelection = (key: string) => {
    setAnchor((prev) => prev.filter((item) => item !== key));
    setSignal((prev) => prev.filter((item) => item !== key));
  };

  const addToAnchorLabel = language === 'ko' ? '필수과목에 추가' : 'Add to Required';
  const addToSignalLabel =
    language === 'ko' ? '관심·성향 선택과목에 추가' : 'Add to Electives';
  const removeLabel = language === 'ko' ? '??' : 'Remove';
  const searchPlaceholder = language === 'ko' ? '?? ??' : 'Search courses';
  const subjectTitle = language === 'ko' ? '??' : 'Subjects';
  const noCoursesLabel = language === 'ko' ? '??? ??? ????.' : 'No courses to show.';
  const allLabel = language === 'ko' ? '??' : 'All';
  const suggestionTitle = language === 'ko' ? '?? ??' : 'Suggested for you';
  const suggestionEmpty = language === 'ko'
    ? '?? ??? ???? Stage 0/1? ??? ???.'
    : 'Complete Stages 0/1 to see suggestions.';
  const suggestionToggleLabel = language === 'ko' ? '??' : 'Collapse';
  const suggestionToggleOpenLabel = language === 'ko' ? '???' : 'Expand';
  const infoLabel = language === 'ko' ? '?? ??' : 'View description';
  const suggestionSubtitle = language === 'ko'
    ? 'AI ??? Stage 0/1 ???? ?? ??? ???? ?????.'
    : 'Suggestions are based on Stages 0/1, your uploads, and your current selections.';
  const viewSummaryLabel = language === 'ko' ? '요약 보기' : 'View summary';

  const getDescription = (course: CourseLabel) => {
    const description = language === 'ko' ? course.description?.kr : course.description?.en;
    return description ?? null;
  };

  const renderInfoButton = (description: string | null) => {
    if (!description) return null;
    return (
      <div className="relative group">
        <button
          type="button"
          aria-label={infoLabel}
          className="h-6 w-6 rounded-full border border-slate-200 text-xs font-bold text-slate-500 bg-white flex items-center justify-center hover:text-slate-700"
        >
          i
        </button>
        <div className="pointer-events-none absolute right-0 top-7 z-10 w-64 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
          {description}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    // Save to database
    storage.set(currentSelectionKey, {
      anchor,
      signal,
      savedAt: new Date().toISOString(),
    });
    completeStage(2);
    router.push('/stage2/summary');
  };

  const saveSlot = (index: number) => {
    setSavedSlots((prev) => {
      const next = [...prev];
      next[index] = {
        anchor,
        signal,
        savedAt: new Date().toISOString(),
      };
      storage.set(slotsStorageKey, next);
      return next;
    });
  };

  const loadSlot = (index: number) => {
    const slot = savedSlots[index];
    if (!slot) return;
    setAnchor(slot.anchor);
    setSignal(slot.signal);
  };

  const clearSlot = (index: number) => {
    setSavedSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      storage.set(slotsStorageKey, next);
      return next;
    });
  };

  const saveSlotLabel = language === 'ko' ? '저장' : 'Save';
  const loadSlotLabel = language === 'ko' ? '불러오기' : 'Load';
  const clearSlotLabel = language === 'ko' ? '비우기' : 'Clear';
  const slotEmptyLabel = language === 'ko' ? '비어 있음' : 'Empty';
  const slotTitle = language === 'ko' ? '저장 슬롯' : 'Save slots';

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background:
          'linear-gradient(135deg, #9BCBFF 0%, #C7B9FF 25%, #F4A9C8 50%, #FFD1A8 75%, #BEEDE3 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-center w-full md:w-auto">
            {t('stage2Title')}
          </h1>
          <button
            type="button"
            onClick={() => router.push('/stage2/summary')}
            disabled={!progress.stage2Complete}
            className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:bg-white disabled:opacity-50"
          >
            {viewSummaryLabel}
          </button>
        </div>

        <div className="bg-white/80 rounded-2xl p-6 mb-6 shadow-sm backdrop-blur border border-white/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{suggestionTitle}</h2>
              <p className="text-xs text-slate-500 mt-1">{suggestionSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-white/70 text-slate-600 hover:bg-white/70 transition-all duration-300 ease-out"
            >
              {showSuggestions ? suggestionToggleLabel : suggestionToggleOpenLabel}
            </button>
          </div>

          {showSuggestions && (
            <div className="mt-4">
              {suggestions.length === 0 && (
                <p className="text-sm text-slate-500">{suggestionEmpty}</p>
              )}
              {suggestions.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {suggestions.map((suggestion) => {
                    const subjectLabel =
                      language === 'ko'
                        ? suggestion.subject.subject_kr
                        : suggestion.subject.subject_en;
                    const courseLabel =
                      language === 'ko' ? suggestion.label.kr : suggestion.label.en;
                    const recommendedBucket = getRecommendedBucket(
                      suggestion.category,
                      suggestion.score
                    );
                    return (
                      <div
                        key={suggestion.key}
                        className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm transition-all duration-300 ease-out"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                            <p className="text-xs text-slate-500">{subjectLabel}</p>
                          </div>
                          {renderInfoButton(getDescription(suggestion.label))}
                        </div>
                        {suggestion.reasons.size > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Array.from(suggestion.reasons).map((reason) => (
                              <span
                                key={reason}
                                className="text-[11px] px-2 py-1 rounded-full bg-white/80 text-slate-600 border border-white/70"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => addToAnchor(suggestion.key)}
                            disabled={anchor.length >= maxBucketSize}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border transition-all duration-300 ease-out disabled:opacity-50 ${
                              recommendedBucket === 'anchor'
                                ? 'bg-sky-200/95 border-sky-200 text-sky-900 shadow-[0_0_16px_rgba(56,189,248,0.45)] ring-2 ring-sky-300/70'
                                : 'bg-sky-100/60 border-white/70 text-sky-700'
                            }`}
                          >
                            {addToAnchorLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => addToSignal(suggestion.key)}
                            disabled={signal.length >= maxBucketSize}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border transition-all duration-300 ease-out disabled:opacity-50 ${
                              recommendedBucket === 'signal'
                                ? 'bg-rose-200/95 border-rose-200 text-rose-900 shadow-[0_0_16px_rgba(251,113,133,0.45)] ring-2 ring-rose-300/70'
                                : 'bg-rose-100/60 border-white/70 text-rose-700'
                            }`}
                          >
                            {addToSignalLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Subject list */}
          <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur border border-white/60">
            <h2 className="font-bold mb-4">{subjectTitle}</h2>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-white/70 px-3 py-2 text-sm focus:border-sky-200 focus:outline-none bg-white/80 transition-all duration-300 ease-out"
            />
            <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredSubjects.length === 0 && (
                <p className="text-sm text-slate-500">{noCoursesLabel}</p>
              )}
              {filteredSubjects.map((subject) => {
                const label = language === 'ko' ? subject.subject_kr : subject.subject_en;
                const isActive = subject.id === selectedSubjectId;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-sky-100/80 text-sky-700'
                        : 'bg-white/70 text-slate-700 hover:bg-white/90'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Courses + buckets */}
          <div className="space-y-6">
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur border border-white/60">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {selectedSubject
                      ? language === 'ko'
                        ? selectedSubject.subject_kr
                        : selectedSubject.subject_en
                      : noCoursesLabel}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {language === 'ko' ? '????? ?????.' : 'Choose a category.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', ...categories] as CategoryFilter[]).map((category) => {
                    const label =
                      category === 'all'
                        ? allLabel
                        : language === 'ko'
                          ? categoryLabels[category].ko
                          : categoryLabels[category].en;
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all duration-300 ease-out ${
                          isActive
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-white/80 text-slate-600 border-white/70 hover:bg-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {!selectedSubject && <p className="text-sm text-slate-500">{noCoursesLabel}</p>}
              {selectedSubject && (
                <div className="space-y-6">
                  {categories.map((category) => {
                    if (selectedCategory !== 'all' && selectedCategory !== category) return null;
                    const items = selectedSubject.electives[category];
                    if (!items.length) return null;

                    const availableItems = items.filter((course) => {
                      const key = createCourseKey(selectedSubject.subject_en, category, course.en);
                      return !selectedKeys.has(key);
                    });

                    if (!availableItems.length) return null;

                    const categoryLabel =
                      language === 'ko'
                        ? categoryLabels[category].ko
                        : categoryLabels[category].en;

                    return (
                      <div key={category}>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {categoryLabel}
                        </p>
                        <div className="mt-2 space-y-2">
                          {availableItems.map((course) => {
                            const key = createCourseKey(
                              selectedSubject.subject_en,
                              category,
                              course.en
                            );
                            const courseLabel = language === 'ko' ? course.kr : course.en;
                            const description = getDescription(course);
                            return (
                              <div
                                key={key}
                                className="flex items-center justify-between gap-2 bg-white/70 p-3 rounded-xl border border-white/70 transition-all duration-300 ease-out"
                              >
                                <div>
                                  <span className="text-sm font-medium text-slate-800">
                                    {courseLabel}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderInfoButton(description)}
                                  <button
                                    type="button"
                                    onClick={() => addToAnchor(key)}
                                    disabled={anchor.length >= maxBucketSize}
                                    className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-100/80 text-sky-700 disabled:opacity-50 transition-all duration-300 ease-out"
                                  >
                                    {addToAnchorLabel}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => addToSignal(key)}
                                    disabled={signal.length >= maxBucketSize}
                                    className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-100/80 text-rose-700 disabled:opacity-50 transition-all duration-300 ease-out"
                                  >
                                    {addToSignalLabel}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Anchor bucket */}
              <div className="bg-sky-50/80 border border-sky-200/70 rounded-2xl p-6 shadow-sm backdrop-blur">
                <div className="mb-4">
                  <h2 className="font-bold">{t('stage2Anchor')}</h2>
                  <p className="text-xs text-slate-600 mt-1">{t('stage2AnchorHelper')}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {anchor.map((key) => {
                    const course = courseLookup.get(key);
                    if (!course) return null;
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                    return (
                      <div
                        key={key}
                        className="bg-white/80 p-3 rounded-xl border border-sky-200/70 flex items-center justify-between gap-3 transition-all duration-300 ease-out"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                          <p className="text-xs text-slate-500">{subjectLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderInfoButton(getDescription(course))}
                          <button
                            type="button"
                            onClick={() => removeSelection(key)}
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-white/80 border border-sky-200/70 text-sky-700 transition-all duration-300 ease-out"
                          >
                            {removeLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('stage2AnchorCount', { count: anchor.length.toString() })}
                </p>
              </div>

              {/* Signal bucket */}
              <div className="bg-rose-50/80 border border-rose-200/70 rounded-2xl p-6 shadow-sm backdrop-blur">
                <div className="mb-4">
                  <h2 className="font-bold">{t('stage2Signal')}</h2>
                  <p className="text-xs text-slate-600 mt-1">{t('stage2SignalHelper')}</p>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {signal.map((key) => {
                    const course = courseLookup.get(key);
                    if (!course) return null;
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                    return (
                      <div
                        key={key}
                        className="bg-white/80 p-3 rounded-xl border border-rose-200/70 flex items-center justify-between gap-3 transition-all duration-300 ease-out"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                          <p className="text-xs text-slate-500">{subjectLabel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderInfoButton(getDescription(course))}
                          <button
                            type="button"
                            onClick={() => removeSelection(key)}
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-white/80 border border-rose-200/70 text-rose-700 transition-all duration-300 ease-out"
                          >
                            {removeLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {t('stage2SignalCount', { count: signal.length.toString() })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur border border-white/60 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{slotTitle}</h2>
            <span className="text-xs text-slate-500">{anchor.length + signal.length} selected</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {savedSlots.map((slot, index) => (
              <div
                key={`slot-${index}`}
                className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700">Slot {index + 1}</p>
                  <p className="text-[11px] text-slate-500">
                    {slot ? new Date(slot.savedAt).toLocaleDateString() : slotEmptyLabel}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {slot
                    ? `${slot.anchor.length} required · ${slot.signal.length} electives`
                    : slotEmptyLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => saveSlot(index)}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 ease-out"
                  >
                    {saveSlotLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSlot(index)}
                    disabled={!slot}
                    className="text-xs font-semibold px-3 py-1 rounded-full border border-white/70 text-slate-700 disabled:opacity-50 transition-all duration-300 ease-out"
                  >
                    {loadSlotLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => clearSlot(index)}
                    disabled={!slot}
                    className="text-xs font-semibold px-3 py-1 rounded-full border border-white/70 text-slate-500 disabled:opacity-50 transition-all duration-300 ease-out"
                  >
                    {clearSlotLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-slate-900 text-white rounded-full shadow-sm transition-all duration-300 ease-out hover:bg-slate-800"
          >
            {t('stage2Save')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/stage2/summary')}
            disabled={!progress.stage2Complete}
            className="px-8 py-3 rounded-full bg-slate-300 text-slate-800 shadow-sm transition-all duration-300 ease-out hover:bg-slate-400 disabled:opacity-50"
          >
            {viewSummaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
