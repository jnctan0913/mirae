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
    reasonKo: '?? ??(UX)? ????',
  },
  'data-scientist': {
    keywords: ['data', 'statistics', 'math', 'informatics', 'science', 'ai'],
    reasonEn: 'Related to roles you liked (data/AI)',
    reasonKo: '?? ??(???/AI)? ????',
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const router = useRouter();
  const { completeStage } = useUserStore();
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

  useEffect(() => {
    const profile = storage.get<{ strengths?: string[] }>('userProfile');
    if (profile?.strengths) {
      setStrengths(profile.strengths);
    }

    const swipes = storage.get<RoleSwipe[]>('roleSwipes', []) ?? [];
    const liked = swipes
      .filter((swipe) => swipe.swipeDirection === 'right' || swipe.swipeDirection === 'up')
      .map((swipe) => swipe.roleId);
    setLikedRoles(Array.from(new Set(liked)));
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
      { score: number; reasons: Set<string>; label: CourseLabel; subject: CourseSubject }
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
  }, [likedRoles, strengths, selectedKeys, language]);

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

  const addToAnchorLabel = language === 'ko' ? 'Anchor? ??' : 'Add to Anchor';
  const addToSignalLabel = language === 'ko' ? 'Signal? ??' : 'Add to Signal';
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
    : 'Suggestions are based on Stages 0/1 and your current selections.';

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
    completeStage(2);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('stage2Title')}</h1>

        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{suggestionTitle}</h2>
              <p className="text-xs text-slate-500 mt-1">{suggestionSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                    return (
                      <div
                        key={suggestion.key}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3"
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
                                className="text-[11px] px-2 py-1 rounded-full bg-white text-slate-600 border border-slate-200"
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
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 disabled:opacity-50"
                          >
                            {addToAnchorLabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => addToSignal(suggestion.key)}
                            disabled={signal.length >= maxBucketSize}
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 disabled:opacity-50"
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
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold mb-4">{subjectTitle}</h2>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
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
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
            <div className="bg-white rounded-xl p-6">
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
                        className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
                          isActive
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                                className="flex items-center justify-between gap-2 bg-gray-100 p-3 rounded-lg"
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
                                    className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700 disabled:opacity-50"
                                  >
                                    {addToAnchorLabel}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => addToSignal(key)}
                                    disabled={signal.length >= maxBucketSize}
                                    className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 disabled:opacity-50"
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
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                <h2 className="font-bold mb-4">{t('stage2Anchor')}</h2>
                <div className="space-y-2 min-h-[200px]">
                  {anchor.map((key) => {
                    const course = courseLookup.get(key);
                    if (!course) return null;
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                    return (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-lg border-2 border-blue-300 flex items-center justify-between gap-3"
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
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-blue-200 text-blue-700"
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
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                <h2 className="font-bold mb-4">{t('stage2Signal')}</h2>
                <div className="space-y-2 min-h-[200px]">
                  {signal.map((key) => {
                    const course = courseLookup.get(key);
                    if (!course) return null;
                    const courseLabel = language === 'ko' ? course.kr : course.en;
                    const subjectLabel = language === 'ko' ? course.subjectKr : course.subjectEn;
                    return (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-lg border-2 border-yellow-300 flex items-center justify-between gap-3"
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
                            className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-yellow-200 text-amber-700"
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

        <button
          onClick={handleSave}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg mx-auto block"
        >
          {t('stage2Save')}
        </button>
      </div>
    </div>
  );
}
