'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import coursesData from '@/lib/data/courses.json';

type CourseCategory = 'general' | 'career' | 'interdisciplinary';

interface CourseLabel {
  en: string;
  kr: string;
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

export default function Stage2Page() {
  const [anchor, setAnchor] = useState<string[]>([]);
  const [signal, setSignal] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { completeStage } = useUserStore();
  const { language, t } = useI18n();
  const selectedKeys = useMemo(() => new Set([...anchor, ...signal]), [anchor, signal]);
  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
  const filteredCourses = useMemo<CourseSubject[]>(() => {
    if (!normalizedSearch) return courses;

    return courses
      .map((subject) => {
        const subjectMatches =
          subject.subject_en.toLowerCase().includes(normalizedSearch) ||
          subject.subject_kr.toLowerCase().includes(normalizedSearch);

        const filteredElectives = categories.reduce(
          (acc, category) => {
            if (subjectMatches) {
              acc[category] = subject.electives[category];
            } else {
              acc[category] = subject.electives[category].filter((course) => {
                return (
                  course.en.toLowerCase().includes(normalizedSearch) ||
                  course.kr.toLowerCase().includes(normalizedSearch)
                );
              });
            }
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

  const addToAnchorLabel = language === 'ko' ? 'Anchor에 추가' : 'Add to Anchor';
  const addToSignalLabel = language === 'ko' ? 'Signal에 추가' : 'Add to Signal';
  const removeLabel = language === 'ko' ? '제거' : 'Remove';
  const searchPlaceholder = language === 'ko' ? '과목 검색' : 'Search courses';

  const handleSave = () => {
    // Save to database
    completeStage(2);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('stage2Title')}</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Available subjects */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold mb-4">{t('stage2Subjects')}</h2>
            <div className="mb-4">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div className="space-y-6">
              {filteredCourses.map((subject) => {
                const subjectLabel = language === 'ko' ? subject.subject_kr : subject.subject_en;
                return (
                  <div key={subject.id}>
                    <h3 className="text-sm font-semibold text-slate-700">{subjectLabel}</h3>
                    {categories.map((category) => {
                      const items = subject.electives[category];
                      if (!items.length) return null;

                      const availableItems = items.filter((course) => {
                        const key = createCourseKey(subject.subject_en, category, course.en);
                        return !selectedKeys.has(key);
                      });

                      if (!availableItems.length) return null;

                      const categoryLabel =
                        language === 'ko'
                          ? categoryLabels[category].ko
                          : categoryLabels[category].en;

                      return (
                        <div key={category} className="mt-3">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {categoryLabel}
                          </p>
                          <div className="mt-2 space-y-2">
                            {availableItems.map((course) => {
                              const key = createCourseKey(
                                subject.subject_en,
                                category,
                                course.en
                              );
                              const courseLabel = language === 'ko' ? course.kr : course.en;
                              return (
                                <div
                                  key={key}
                                  className="flex items-center justify-between gap-2 bg-gray-100 p-3 rounded-lg"
                                >
                                  <span className="text-sm font-medium text-slate-800">
                                    {courseLabel}
                                  </span>
                                  <div className="flex gap-2">
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
                );
              })}
            </div>
          </div>

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
                    <button
                      type="button"
                      onClick={() => removeSelection(key)}
                      className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-blue-200 text-blue-700"
                    >
                      {removeLabel}
                    </button>
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
                    <button
                      type="button"
                      onClick={() => removeSelection(key)}
                      className="text-xs font-semibold px-2 py-1 rounded-full bg-white border border-yellow-200 text-amber-700"
                    >
                      {removeLabel}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('stage2SignalCount', { count: signal.length.toString() })}
            </p>
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
