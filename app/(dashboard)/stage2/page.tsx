'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import coursesData from '@/lib/data/courses-descriptions.json';
import { getUserProfile, updateProfileAnalytics, updateUserProfile } from '@/lib/userProfile';

type CourseCategory = 'general' | 'career' | 'interdisciplinary';

type CategoryFilter = CourseCategory | 'all';

type SubjectCategory = 'all' | 'language' | 'stem' | 'social' | 'arts' | 'other';

const subjectCategories: Record<number, SubjectCategory> = {
  1: 'language',  // Korean Language
  2: 'stem',      // Mathematics
  3: 'language',  // English
  4: 'social',    // Social Studies
  5: 'stem',      // Science
  6: 'arts',      // Physical Education
  7: 'arts',      // Arts
  8: 'stem',      // Technology & Home Economics
  9: 'stem',      // Informatics
  10: 'language', // Foreign Language
  11: 'language', // Classical Chinese
  12: 'other',    // Liberal Arts
};

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

type SelectionSlot = {
  anchor: string[];
  signal: string[];
  savedAt: string;
} | null;

const categories: CourseCategory[] = ['general', 'career', 'interdisciplinary'];
const categoryLabels: Record<CourseCategory, { en: string; ko: string }> = {
  general: { en: 'General', ko: '공통' },
  career: { en: 'Career', ko: '진로' },
  interdisciplinary: { en: 'Interdisciplinary', ko: '융합' },
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hashToUnit = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return (hash % 1000) / 1000;
};

const strengthSignals: Record<
  string,
  { keywords: string[]; reasonEn: string; reasonKo: string }
> = {
  analytical: {
    keywords: ['math', 'statistics', 'data', 'science', 'physics', 'chemistry', 'algebra', 'calculus'],
    reasonEn: 'Matches your analytical strengths',
    reasonKo: '분석적 강점과 잘 맞아요',
  },
  creative: {
    keywords: ['art', 'music', 'theater', 'literature', 'media', 'writing', 'film'],
    reasonEn: 'Supports your creative strengths',
    reasonKo: '창의적 강점을 살려줘요',
  },
  empathy: {
    keywords: ['ethics', 'culture', 'psychology', 'human', 'society', 'social', 'law', 'politics', 'communication'],
    reasonEn: 'Builds on your empathy/social strengths',
    reasonKo: '공감·사회적 강점을 키워줘요',
  },
  organization: {
    keywords: ['economics', 'law', 'politics', 'workplace', 'communication', 'planning'],
    reasonEn: 'Aligns with your organization strengths',
    reasonKo: '조직·관리 강점과 잘 맞아요',
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

const roleSignals: Record<
  string,
  { keywords: string[]; reasonEn: string; reasonKo: string }
> = {
  'ux-designer': {
    keywords: ['design', 'media', 'art', 'writing', 'communication'],
    reasonEn: 'Related to roles you liked (UX)',
    reasonKo: '좋아한 역할과 연관됨 (UX)',
  },
  'data-scientist': {
    keywords: ['data', 'statistics', 'math', 'informatics', 'science', 'ai'],
    reasonEn: 'Related to roles you liked (data/AI)',
    reasonKo: '좋아한 역할과 연관됨 (데이터/AI)',
  },
  'product-manager': {
    keywords: ['product', 'strategy', 'roadmap', 'business', 'user', 'market', 'growth'],
    reasonEn: 'Related to roles you liked (product)',
    reasonKo: '좋아한 역할과 연관됨 (제품)',
  },
  'software-engineer': {
    keywords: ['software', 'computer', 'programming', 'coding', 'engineering', 'systems'],
    reasonEn: 'Related to roles you liked (engineering)',
    reasonKo: '좋아한 역할과 연관됨 (공학)',
  },
  'robotics-engineer': {
    keywords: ['robot', 'robotics', 'automation', 'hardware', 'mechatronics', 'control'],
    reasonEn: 'Related to roles you liked (robotics)',
    reasonKo: '좋아한 역할과 연관됨 (로보틱스)',
  },
  'environmental-scientist': {
    keywords: ['environment', 'ecology', 'climate', 'sustainability', 'earth', 'biology'],
    reasonEn: 'Related to roles you liked (environment)',
    reasonKo: '좋아한 역할과 연관됨 (환경)',
  },
  'biomedical-researcher': {
    keywords: ['biomedical', 'biology', 'medicine', 'health', 'genetics', 'laboratory'],
    reasonEn: 'Related to roles you liked (biomedical)',
    reasonKo: '좋아한 역할과 연관됨 (바이오메디컬)',
  },
  'clinical-psychologist': {
    keywords: ['psychology', 'mental', 'therapy', 'counseling', 'behavior', 'wellbeing'],
    reasonEn: 'Related to roles you liked (psychology)',
    reasonKo: '좋아한 역할과 연관됨 (심리)',
  },
  'social-entrepreneur': {
    keywords: ['social', 'community', 'impact', 'entrepreneur', 'nonprofit', 'sustainability'],
    reasonEn: 'Related to roles you liked (social impact)',
    reasonKo: '좋아한 역할과 연관됨 (사회적 임팩트)',
  },
  'teacher-educator': {
    keywords: ['education', 'teaching', 'learning', 'pedagogy', 'curriculum', 'school'],
    reasonEn: 'Related to roles you liked (education)',
    reasonKo: '좋아한 역할과 연관됨 (교육)',
  },
  journalist: {
    keywords: ['journalism', 'media', 'reporting', 'writing', 'news', 'communication'],
    reasonEn: 'Related to roles you liked (journalism)',
    reasonKo: '좋아한 역할과 연관됨 (저널리즘)',
  },
  'policy-analyst': {
    keywords: ['policy', 'government', 'public', 'economics', 'regulation', 'civic'],
    reasonEn: 'Related to roles you liked (policy)',
    reasonKo: '좋아한 역할과 연관됨 (정책)',
  },
  'brand-strategist': {
    keywords: ['brand', 'marketing', 'strategy', 'advertising', 'storytelling', 'identity'],
    reasonEn: 'Related to roles you liked (brand)',
    reasonKo: '좋아한 역할과 연관됨 (브랜드)',
  },
  'financial-analyst': {
    keywords: ['finance', 'investment', 'accounting', 'economics', 'markets', 'business'],
    reasonEn: 'Related to roles you liked (finance)',
    reasonKo: '좋아한 역할과 연관됨 (금융)',
  },
  'urban-planner': {
    keywords: ['urban', 'city', 'planning', 'architecture', 'infrastructure', 'transportation'],
    reasonEn: 'Related to roles you liked (urban planning)',
    reasonKo: '좋아한 역할과 연관됨 (도시 계획)',
  },
};

const subjectCategoryLabels: Record<SubjectCategory, { en: string; ko: string }> = {
  all: { en: 'All', ko: '전체' },
  language: { en: 'Language', ko: '언어' },
  stem: { en: 'STEM', ko: 'STEM' },
  social: { en: 'Social', ko: '사회' },
  arts: { en: 'Arts & PE', ko: '예체능' },
  other: { en: 'Other', ko: '기타' },
};

export default function Stage2Page() {
  const [anchor, setAnchor] = useState<string[]>([]);
  const [signal, setSignal] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<SubjectCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(courses[0]?.id ?? 0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [likedRoles, setLikedRoles] = useState<string[]>([]);
  const [stage0Roles, setStage0Roles] = useState<string[]>([]);
  const [docKeywords, setDocKeywords] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [savedSlots, setSavedSlots] = useState<SelectionSlot[]>([null, null, null]);
  const [focusedCourseKey, setFocusedCourseKey] = useState<string | null>(null);
  const router = useRouter();
  const { completeStage, progress } = useUserStore();
  const { language, t } = useI18n();
  const selectedKeys = useMemo(() => new Set([...anchor, ...signal]), [anchor, signal]);
  const normalizedSearch = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
  const filteredSubjects = useMemo<CourseSubject[]>(() => {
    let filtered = courses;

    // Filter by subject category
    if (selectedSubjectCategory !== 'all') {
      filtered = courses.filter((subject) => {
        return subjectCategories[subject.id] === selectedSubjectCategory;
      });
    }

    // Filter by search term
    if (!normalizedSearch) return filtered;

    return filtered
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
  }, [normalizedSearch, selectedSubjectCategory]);
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
    const profile = getUserProfile();
    const stored = profile.stage2Slots ?? [null, null, null];
    const normalized = Array.from({ length: 3 }, (_, index) => stored[index] ?? null);
    setSavedSlots(normalized);
  }, []);

  const syncProfileSignals = (profile: ReturnType<typeof getUserProfile>) => {
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
    if (derivedStrengths.length > 0) {
      setStrengths(derivedStrengths);
      if (strengthTags.length === 0) {
        updateUserProfile({ strengthTags: derivedStrengths });
      }
    } else {
      setStrengths([]);
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

    const storedLiked = profile?.likedRoles ?? [];
    const swipes = profile?.roleSwipes ?? [];
    const liked =
      storedLiked.length > 0
        ? storedLiked
        : swipes.filter((swipe) => swipe.swipeDirection === 'right').map((swipe) => swipe.roleId);
    const uniqueLiked = Array.from(new Set(liked));
    setLikedRoles(uniqueLiked);

    if (uniqueLiked.length > 0 && storedLiked.length === 0) {
      updateUserProfile({ likedRoles: uniqueLiked });
    }

    const recommended = Array.from(new Set(profile.stage0Summary?.recommendedRoles ?? []));
    setStage0Roles(recommended);
  };

  useEffect(() => {
    syncProfileSignals(getUserProfile());
    if (typeof window !== 'undefined') {
      const handleProfileUpdate = () => syncProfileSignals(getUserProfile());
      window.addEventListener('miraeProfileUpdated', handleProfileUpdate);
      return () => window.removeEventListener('miraeProfileUpdated', handleProfileUpdate);
    }
    return undefined;
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
        primaryScore: number;
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
          let primaryScore = 0;
          const reasons = new Set<string>();
          const courseLabelLower = course.en.toLowerCase();
          const courseLabelLowerKr = course.kr.toLowerCase();

          strengths.forEach((strength) => {
            const signal = strengthSignals[strength];
            if (!signal) return;
            if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
              score += 2;
              reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
            }
          });

          if (docKeywords.length > 0) {
            const matches = docKeywords.filter(
              (keyword) =>
                courseLabelLower.includes(keyword) || courseLabelLowerKr.includes(keyword)
            );
            if (matches.length > 0) {
              const boost = Math.min(2, matches.length);
              score += boost;
              primaryScore += boost;
              reasons.add(
                language === 'ko'
                  ? '온보딩/업로드 키워드 기반'
                  : 'Based on onboarding & uploads'
              );
            }
          }

          const likedSet = new Set(likedRoles);
          const stage0Set = new Set(stage0Roles.filter((roleId) => !likedSet.has(roleId)));
          likedRoles.forEach((roleId) => {
            const signal = roleSignals[roleId];
            if (!signal) return;
            if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
              score += 3;
              primaryScore += 3;
              reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
            }
          });
          stage0Set.forEach((roleId) => {
            const signal = roleSignals[roleId];
            if (!signal) return;
            if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
              score += 2;
              primaryScore += 2;
              reasons.add(
                language === 'ko'
                  ? 'Stage 0 역할 신호 기반'
                  : 'Based on Stage 0 role signals'
              );
            }
          });

          if (primaryScore === 0) return;

          const existing = suggestionMap.get(key);
          if (existing) {
            existing.score += score;
            existing.primaryScore += primaryScore;
            reasons.forEach((reason) => existing.reasons.add(reason));
          } else {
            suggestionMap.set(key, {
              score,
              primaryScore,
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
      .sort((a, b) => {
        const primaryDiff = b[1].primaryScore - a[1].primaryScore;
        if (primaryDiff !== 0) return primaryDiff;
        return b[1].score - a[1].score;
      })
      .slice(0, 6)
      .map(([key, value]) => ({
        key,
        ...value,
      }));
  }, [likedRoles, strengths, selectedKeys, language, docKeywords, stage0Roles]);

  const displaySuggestions = useMemo(
    () => suggestions.filter((item) => item.primaryScore > 0 && item.reasons.size > 0),
    [suggestions]
  );

  const radarItems = useMemo(() => {
    if (!selectedSubject) return [];

    const items = categories.flatMap((category) => {
      if (selectedCategory !== 'all' && selectedCategory !== category) return [];
      return selectedSubject.electives[category].map((course) => {
        const key = createCourseKey(selectedSubject.subject_en, category, course.en);
        let score = 0;
        let primaryScore = 0;
        const reasons = new Set<string>();
        const courseLabelLower = course.en.toLowerCase();
        const courseLabelLowerKr = course.kr.toLowerCase();

        strengths.forEach((strength) => {
          const signal = strengthSignals[strength];
          if (!signal) return;
          if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
            score += 2;
            reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
          }
        });

        if (docKeywords.length > 0) {
          const matches = docKeywords.filter(
            (keyword) =>
              courseLabelLower.includes(keyword) || courseLabelLowerKr.includes(keyword)
          );
          if (matches.length > 0) {
            const boost = Math.min(2, matches.length);
            score += boost;
            primaryScore += boost;
            reasons.add(
              language === 'ko'
                ? '온보딩/업로드 키워드 기반'
                : 'Based on onboarding & uploads'
            );
          }
        }

        const likedSet = new Set(likedRoles);
        const stage0Set = new Set(stage0Roles.filter((roleId) => !likedSet.has(roleId)));
        likedRoles.forEach((roleId) => {
          const signal = roleSignals[roleId];
          if (!signal) return;
          if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
            score += 3;
            primaryScore += 3;
            reasons.add(language === 'ko' ? signal.reasonKo : signal.reasonEn);
          }
        });
        stage0Set.forEach((roleId) => {
          const signal = roleSignals[roleId];
          if (!signal) return;
          if (signal.keywords.some((keyword) => courseLabelLower.includes(keyword))) {
            score += 2;
            primaryScore += 2;
            reasons.add(
              language === 'ko'
                ? 'Stage 0 역할 신호 기반'
                : 'Based on Stage 0 role signals'
            );
          }
        });

        return {
          key,
          course,
          category,
          score,
          primaryScore,
          reasons: Array.from(reasons),
        };
      });
    });

    if (items.length === 0) return [];

    const maxScore = Math.max(1, ...items.map((item) => item.score));

    return items.map((item, index) => {
      const normalized = item.score / maxScore;
      const angle = hashToUnit(item.key) * Math.PI * 2;
      const baseRadius = 8 + (1 - normalized) * 104;
      const jitter = (hashToUnit(`${item.key}-j`) - 0.5) * 20;
      const radius = clamp(baseRadius + jitter, 8, 110);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return {
        ...item,
        index,
        normalized,
        x,
        y,
        isRecommended: item.primaryScore > 0,
      };
    });
  }, [selectedSubject, selectedCategory, strengths, docKeywords, likedRoles, language, stage0Roles]);

  const focusedCourse = useMemo(
    () => radarItems.find((item) => item.key === focusedCourseKey) ?? null,
    [radarItems, focusedCourseKey]
  );

  useEffect(() => {
    if (focusedCourseKey && !focusedCourse) {
      setFocusedCourseKey(null);
    }
  }, [focusedCourseKey, focusedCourse]);

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

  const handleSelectSuggestion = (suggestion: (typeof suggestions)[number]) => {
    setFocusedCourseKey(suggestion.key);
    setSelectedSubjectId(suggestion.subject.id);
    setSelectedCategory(suggestion.category);
    const subjectCategory = subjectCategories[suggestion.subject.id] ?? 'all';
    setSelectedSubjectCategory(subjectCategory);
  };

  const addToAnchorLabel = language === 'ko' ? '핵심 과목에 추가' : 'Add to Core Courses';
  const addToSignalLabel =
    language === 'ko' ? '선택 과목에 추가' : 'Add to Elective Courses';
  const removeLabel = language === 'ko' ? '제거' : 'Remove';
  const searchPlaceholder = language === 'ko' ? '과목 검색' : 'Search courses';
  const subjectTitle = language === 'ko' ? '과목' : 'Subjects';
  const noCoursesLabel = language === 'ko' ? '표시할 과목이 없어요.' : 'No courses to show.';
  const allLabel = language === 'ko' ? '전체' : 'All';
  const suggestionTitle = language === 'ko' ? '추천' : 'Recommended';
  const suggestionEmpty = language === 'ko'
    ? '추천 신호가 없어요. Stage 0/1 또는 온보딩 키워드를 먼저 채워주세요.'
    : 'No recommendation signals yet. Complete Stage 0/1 or add onboarding keywords.';
  const suggestionToggleLabel = language === 'ko' ? '접기' : 'Collapse';
  const suggestionToggleOpenLabel = language === 'ko' ? '펼치기' : 'Expand';
  const infoLabel = language === 'ko' ? '설명 보기' : 'View description';
  const suggestionSubtitle = language === 'ko'
    ? '추천은 Stage 0/1, 온보딩 키워드, 업로드, 현재 선택을 기반으로 해요.'
    : 'Suggestions are based on Stages 0/1, onboarding keywords, uploads, and your current selections.';
  const radarTitle = language === 'ko' ? 'Course radar' : 'Course radar';
  const radarSubtitle =
    language === 'ko'
      ? 'Stars are tailored picks; candy orbs are more to explore.'
      : 'Stars are tailored picks; candy orbs are more to explore.';
  const radarFocusHint =
    language === 'ko' ? 'Pick a star or orb to see details.' : 'Pick a star or orb to see details.';
  const radarLegendRecommended = language === 'ko' ? 'Recommended' : 'Recommended';
  const radarLegendExplore = language === 'ko' ? 'Explore' : 'Explore';
  const radarEmptyLabel =
    language === 'ko' ? 'No courses to show here.' : 'No courses to show here.';
  const viewSummaryLabel = language === 'ko' ? '요약 보기' : 'View summary';
  const courseDetailsLabel = language === 'ko' ? '과목 상세' : 'Course details';
  const selectedCourseLabel = language === 'ko' ? '선택됨' : 'Selected';

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
          className="h-6 w-6 rounded-full border border-white/70 text-[10px] font-bold text-slate-500 bg-white/80 flex items-center justify-center hover:text-slate-700 transition"
        >
          i
        </button>
        <div className="pointer-events-none absolute right-0 top-7 z-10 w-64 rounded-lg border border-white/70 bg-white/90 p-3 text-xs text-slate-600 shadow-xl opacity-0 transition-opacity group-hover:opacity-100">
          {description}
        </div>
      </div>
    );
  };

  const handleSave = () => {
    const stage2Selection = {
      anchor,
      signal,
      savedAt: new Date().toISOString(),
    };
    const selectedCourseLabels = Array.from(new Set([...anchor, ...signal]))
      .map((key) => courseLookup.get(key))
      .filter((course): course is CourseLookupItem => !!course)
      .map((course) => (language === 'ko' ? course.kr : course.en));
    const profile = getUserProfile();
    const existingCards = (profile.collection?.cards as Record<string, unknown>[]) ?? [];
    const coreLabel = language === 'ko' ? '핵심 과목' : 'Core course';
    const electiveLabel = language === 'ko' ? '선택 과목' : 'Elective course';
    const courseCards = Array.from(new Set([...anchor, ...signal]))
      .map((key) => {
        const course = courseLookup.get(key);
        if (!course) return null;
        const title = language === 'ko' ? course.kr : course.en;
        const subject = language === 'ko' ? course.subjectKr : course.subjectEn;
        const isCore = anchor.includes(key);
        const descriptor = isCore ? coreLabel : electiveLabel;
        return {
          id: `stage2-course-${key}`,
          stage: 'O',
          type: 'Experience',
          title,
          description: `${subject} · ${descriptor}`,
          rarity: 'Common',
          unlocked: true,
          tags: [isCore ? 'core' : 'elective'],
          createdFrom: 'Stage 2: Course Roadmap',
        };
      })
      .filter(Boolean) as Record<string, unknown>[];
    const nextCards = [
      ...existingCards.filter(
        (card) => !(card as { id?: string }).id?.startsWith('stage2-course-')
      ),
      ...courseCards,
    ];
    const existingLogs = profile.activityLogs ?? [];
    const hasStage2Log = existingLogs.some((log) => log.id === 'stage2-complete');
    const today = new Date().toISOString().slice(0, 10);
    const coreCount = anchor.length;
    const electiveCount = signal.length;
    const shortReflection =
      language === 'ko'
        ? `핵심 ${coreCount}개, 선택 ${electiveCount}개 선택함.`
        : `Selected ${coreCount} core and ${electiveCount} elective courses.`;
    const nextLogs = hasStage2Log
      ? existingLogs.map((log) =>
          log.id === 'stage2-complete'
            ? {
                ...log,
                date: today,
                shortReflection,
                title:
                  language === 'ko'
                    ? 'Stage 2 과목 선택을 완료했어요'
                    : 'Completed Stage 2 course selection',
              }
            : log
        )
      : [
          ...existingLogs,
          {
            id: 'stage2-complete',
            date: today,
            title:
              language === 'ko'
                ? 'Stage 2 과목 선택을 완료했어요'
                : 'Completed Stage 2 course selection',
            scopeStage: 'O',
            activityType: 'MiraeActivity',
            source: 'Mirae',
            shortReflection,
          },
        ];
    const nextReport = profile.report ?? {};
    const nextGrowth =
      nextReport.growthText && nextReport.growthText.length > 0
        ? nextReport.growthText
        : language === 'ko'
          ? `과목 설계: 핵심 ${coreCount}개, 선택 ${electiveCount}개 구성.`
          : `Course roadmap: ${coreCount} core, ${electiveCount} elective.`;

    const profileUpdates: Parameters<typeof updateUserProfile>[0] = {
      stage2Selection,
      selectionStatus: 'completed',
      collection: {
        ...profile.collection,
        cards: nextCards,
      },
      customCardTags: {
        ...profile.customCardTags,
        ...Object.fromEntries(
          courseCards.map((card) => [
            (card as { id: string }).id,
            (card as { tags?: string[] }).tags ?? [],
          ])
        ),
      },
      activityLogs: nextLogs,
      report: {
        ...nextReport,
        growthText: nextGrowth,
      },
      reportSources: {
        ...profile.reportSources,
        growthText: profile.reportSources?.growthText ?? 'stage2',
      },
    };
    if (selectedCourseLabels.length > 0) {
      profileUpdates.courses = selectedCourseLabels;
    }
    updateUserProfile(profileUpdates);
    updateProfileAnalytics(nextLogs);
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
      updateUserProfile({ stage2Slots: next });
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
      updateUserProfile({ stage2Slots: next });
      return next;
    });
  };

  const saveSlotLabel = language === 'ko' ? '저장' : 'Save';
  const loadSlotLabel = language === 'ko' ? '불러오기' : 'Load';
  const clearSlotLabel = language === 'ko' ? '비우기' : 'Clear';
  const slotEmptyLabel = language === 'ko' ? '비어 있음' : 'Empty';
  const slotTitle = language === 'ko' ? '저장 슬롯' : 'Save slots';
  const focusedCourseLabel = focusedCourse
    ? language === 'ko'
      ? focusedCourse.course.kr
      : focusedCourse.course.en
    : '';
  const focusedSubjectLabel = focusedCourse
    ? language === 'ko'
      ? selectedSubject?.subject_kr ?? ''
      : selectedSubject?.subject_en ?? ''
    : '';
  const focusedBucket =
    focusedCourse && focusedCourse.score > 0
      ? getRecommendedBucket(focusedCourse.category, focusedCourse.score)
      : 'signal';
  const focusedSelected = focusedCourse ? selectedKeys.has(focusedCourse.key) : false;


  return (
    <div
      className="relative min-h-screen px-6 py-10 text-slate-700"
      style={{
        backgroundImage: 'url(/asset/Background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#9BCBFF]/35 blur-[120px]" />
        <div className="absolute right-10 top-24 h-80 w-80 rounded-full bg-[#F4A9C8]/30 blur-[140px]" />
        <div className="absolute bottom-10 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#BEEDE3]/40 blur-[160px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">
              {t('stage2Title')}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{radarSubtitle}</p>
          </div>
        </div>

        {/* Horizontal subject filters */}
        <div className="mb-6 rounded-[28px] border border-white/60 bg-white/70 p-5 shadow-[0_20px_50px_-40px_rgba(155,203,255,0.45)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#9BCBFF] mr-2">
              {subjectTitle}
            </h2>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-[200px] max-w-[300px] rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-500 focus:border-[#9BCBFF]/70 focus:outline-none"
            />
            <div className="flex flex-wrap gap-2">
              {(['all', 'language', 'stem', 'social', 'arts', 'other'] as SubjectCategory[]).map((category) => {
                const label = language === 'ko' ? subjectCategoryLabels[category].ko : subjectCategoryLabels[category].en;
                const isActive = selectedSubjectCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedSubjectCategory(category)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                      isActive
                        ? 'border-[#9BCBFF]/60 bg-[#9BCBFF]/30 text-slate-800'
                        : 'border-white/70 bg-white/75 text-slate-600 hover:bg-white/90'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredSubjects.length === 0 && (
              <p className="text-sm text-slate-500 w-full">{noCoursesLabel}</p>
            )}
            {filteredSubjects.map((subject) => {
              const label = language === 'ko' ? subject.subject_kr : subject.subject_en;
              const isActive = subject.id === selectedSubjectId;
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'border border-[#9BCBFF]/60 bg-[#9BCBFF]/25 text-slate-700'
                      : 'border border-white/60 bg-white/60 text-slate-600 hover:bg-white/90'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content: Radar (3/5) and Suggestions (2/5) */}
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr] mb-6">
          {/* Left: Radar Course Section */}
          <section className="rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_70px_-50px_rgba(155,203,255,0.45)] backdrop-blur">
            <div className="mb-4">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">{radarTitle}</h2>
                  <p className="mt-1 text-sm text-slate-600">{radarSubtitle}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="flex items-center gap-2 rounded-full border border-[#F4A9C8]/40 bg-[#F4A9C8]/20 px-3 py-1">
                    <svg viewBox="0 0 100 100" className="h-4 w-4 text-[#FFD1A8]">
                      <polygon
                        points="50,5 61,38 96,38 67,58 78,91 50,70 22,91 33,58 4,38 39,38"
                        fill="currentColor"
                      />
                    </svg>
                    {radarLegendRecommended}
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-[#BEEDE3]/60 bg-[#BEEDE3]/40 px-3 py-1">
                    <span className="relative h-3 w-3 rounded-full bg-gradient-to-br from-[#BEEDE3] via-[#C7B9FF] to-[#9BCBFF] shadow-[0_0_6px_rgba(155,203,255,0.5)]">
                      <span className="absolute left-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-white/70" />
                    </span>
                    {radarLegendExplore}
                  </span>
                </div>
              </div>
              <div className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800 mb-1">{radarFocusHint}</p>
                <p className="text-xs text-slate-600">
                  Closest to the center = strongest matches. Stars are recommended picks.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px] items-start">
                <div className="relative">
                  <div className="relative mx-auto w-full max-w-[520px] aspect-square">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at center, rgba(155,203,255,0.7) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                      }}
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-white/60" />
                    <div className="absolute inset-[12%] rounded-full border-2 border-white/55" />
                    <div className="absolute inset-[24%] rounded-full border-2 border-white/50" />
                    <div className="absolute inset-[36%] rounded-full border-2 border-white/45" />
                    <div className="absolute left-1/2 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white/45" />
                    <div className="absolute left-1/2 top-1/2 h-full w-[2px] -translate-x-1/2 bg-white/45" />
                    <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />

                    {radarItems.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-600">
                        {radarEmptyLabel}
                      </div>
                    )}

                    {radarItems.map((item) => {
                      const courseLabel = language === 'ko' ? item.course.kr : item.course.en;
                      const isSelected = selectedKeys.has(item.key);
                      const isFocused = item.key === focusedCourseKey;
                      const orbStyle = {
                        left: '50%',
                        top: '50%',
                        '--orb-x': `${item.x}%`,
                        '--orb-y': `${item.y}%`,
                        animationDelay: `${item.index * 80}ms`,
                      } as CSSProperties;
                      const orbGlow = item.isRecommended
                        ? 'shadow-[0_0_16px_rgba(244,169,200,0.55)]'
                        : 'shadow-[0_0_14px_rgba(190,237,227,0.7)]';

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setFocusedCourseKey(item.key)}
                          style={orbStyle}
                          className="orb-float group absolute z-10 flex flex-col items-center focus-visible:outline-none"
                          aria-label={courseLabel}
                        >
                          <span
                            className={`relative flex h-9 w-9 items-center justify-center transition-transform duration-200 ease-out group-hover:scale-110 ${
                              isSelected
                                ? 'ring-2 ring-[#9BCBFF]/80 ring-offset-2 ring-offset-white/80'
                                : ''
                            } ${isFocused ? 'radar-bob' : ''}`}
                          >
                            {item.isRecommended ? (
                              <span className="relative flex h-9 w-9 items-center justify-center">
                                <span
                                  className={`absolute inset-0 rounded-full blur-[2px] ${
                                    isSelected ? 'bg-[#F4A9C8]' : 'bg-[#FFD1A8]'
                                  }`}
                                />
                                <svg
                                  viewBox="0 0 100 100"
                                  className={`relative h-9 w-9 star-twinkle ${
                                    isSelected
                                      ? 'text-[#F4A9C8] drop-shadow-[0_0_14px_rgba(244,169,200,0.9)]'
                                      : 'text-[#FFD1A8] drop-shadow-[0_0_12px_rgba(244,169,200,0.75)]'
                                  }`}
                                >
                                  <polygon
                                    points="50,5 61,38 96,38 67,58 78,91 50,70 22,91 33,58 4,38 39,38"
                                    fill="currentColor"
                                    stroke={isSelected ? '#9BCBFF' : '#F4A9C8'}
                                    strokeWidth="4"
                                  />
                                </svg>
                              </span>
                            ) : (
                              <span className="relative h-8 w-8 rounded-full bg-gradient-to-br from-[#BEEDE3] via-[#C7B9FF] to-[#9BCBFF] shadow-[inset_-6px_-6px_12px_rgba(155,203,255,0.45)]">
                                <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white/70" />
                              </span>
                            )}
                          </span>
                          <span className="orb-label mt-2 rounded-full bg-white/90 px-2 py-1 text-[10px] text-slate-700 shadow-lg">
                            {courseLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-4">
                  {focusedCourse ? (
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.3em] text-[#9BCBFF]">
                            {courseDetailsLabel}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-800">
                              {focusedCourseLabel}
                            </h3>
                            <span className="rounded-full border border-[#9BCBFF]/60 bg-[#9BCBFF]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                              {selectedCourseLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{focusedSubjectLabel}</p>
                        </div>
                        {renderInfoButton(getDescription(focusedCourse.course))}
                      </div>
                      {focusedCourse.reasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {focusedCourse.reasons.map((reason) => (
                            <span
                              key={reason}
                              className="rounded-full border border-[#BEEDE3]/60 bg-[#BEEDE3]/50 px-2 py-1 text-[11px] text-slate-700"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {focusedSelected ? (
                          <button
                            type="button"
                            onClick={() => removeSelection(focusedCourse.key)}
                            className="rounded-full border border-[#F4A9C8]/60 bg-[#F4A9C8]/30 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-[#F4A9C8]/40"
                          >
                            {removeLabel}
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => addToAnchor(focusedCourse.key)}
                              disabled={anchor.length >= maxBucketSize}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                focusedBucket === 'anchor'
                                  ? 'border-[#9BCBFF]/60 bg-[#9BCBFF]/30 text-slate-700 shadow-[0_0_16px_rgba(155,203,255,0.6)]'
                                  : 'border-white/60 bg-white/70 text-slate-600 hover:bg-white/90'
                              }`}
                            >
                              {addToAnchorLabel}
                            </button>
                            <button
                              type="button"
                              onClick={() => addToSignal(focusedCourse.key)}
                              disabled={signal.length >= maxBucketSize}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                                focusedBucket === 'signal'
                                  ? 'border-[#F4A9C8]/60 bg-[#F4A9C8]/30 text-slate-700 shadow-[0_0_16px_rgba(244,169,200,0.6)]'
                                  : 'border-white/60 bg-white/70 text-slate-600 hover:bg-white/90'
                              }`}
                            >
                              {addToSignalLabel}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500">
                      <p className="text-sm">No course selected</p>
                      <p className="mt-1 text-xs">Click on a star or orb to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

          {/* Right: Suggested for you Section */}
          <section className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-50px_rgba(155,203,255,0.45)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{suggestionTitle}</h2>
                <p className="mt-1 text-xs text-slate-600">{suggestionSubtitle}</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {displaySuggestions.length === 0 && (
                <p className="text-sm text-slate-500">{suggestionEmpty}</p>
              )}
              {displaySuggestions.map((suggestion) => {
                const subjectLabel =
                  language === 'ko'
                    ? suggestion.subject.subject_kr
                    : suggestion.subject.subject_en;
                const courseLabel =
                  language === 'ko' ? suggestion.label.kr : suggestion.label.en;
                const isActive = suggestion.key === focusedCourseKey;
                return (
                  <button
                    type="button"
                    key={suggestion.key}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className={`w-full text-left rounded-2xl border p-4 shadow-[0_16px_30px_rgba(155,203,255,0.35)] transition hover:shadow-[0_18px_40px_rgba(155,203,255,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BCBFF]/60 ${
                      isActive
                        ? 'border-[#9BCBFF]/70 bg-white shadow-[0_18px_40px_rgba(155,203,255,0.5)]'
                        : 'border-white/60 bg-white/75 hover:bg-white/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                        <p className="text-xs text-slate-500">{subjectLabel}</p>
                      </div>
                      {renderInfoButton(getDescription(suggestion.label))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Bottom sections */}
        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-[#9BCBFF]/60 bg-white/70 p-6 shadow-[0_24px_50px_-40px_rgba(155,203,255,0.55)] backdrop-blur">
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-800">{t('stage2Anchor')}</h2>
                  <p className="mt-1 text-xs text-slate-600" />
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
                        className="rounded-2xl border border-[#9BCBFF]/50 bg-white/75 p-3 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                            <p className="text-xs text-slate-500">{subjectLabel}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderInfoButton(getDescription(course))}
                            <button
                              type="button"
                              onClick={() => removeSelection(key)}
                              className="rounded-full border border-[#9BCBFF]/60 bg-white/70 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white/90"
                            >
                              {removeLabel}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {t('stage2AnchorCount', { count: anchor.length.toString() })}
                </p>
              </div>

              <div className="rounded-[28px] border border-[#F4A9C8]/60 bg-white/70 p-6 shadow-[0_24px_50px_-40px_rgba(244,169,200,0.55)] backdrop-blur">
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-800">{t('stage2Signal')}</h2>
                  <p className="mt-1 text-xs text-slate-600" />
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
                        className="rounded-2xl border border-[#F4A9C8]/50 bg-white/75 p-3 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{courseLabel}</p>
                            <p className="text-xs text-slate-500">{subjectLabel}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderInfoButton(getDescription(course))}
                            <button
                              type="button"
                              onClick={() => removeSelection(key)}
                              className="rounded-full border border-[#F4A9C8]/60 bg-white/70 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white/90"
                            >
                              {removeLabel}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {t('stage2SignalCount', { count: signal.length.toString() })}
                </p>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_24px_60px_-50px_rgba(155,203,255,0.45)] backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">{slotTitle}</h2>
                <span className="text-xs text-slate-500">
                  {anchor.length + signal.length} selected
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {savedSlots.map((slot, index) => (
                  <div
                    key={`slot-${index}`}
                    className="rounded-2xl border border-white/60 bg-white/75 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-800">Slot {index + 1}</p>
                      <p className="text-[11px] text-slate-500">
                        {slot ? new Date(slot.savedAt).toLocaleDateString() : slotEmptyLabel}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {slot
                        ? `${slot.anchor.length} required A? ${slot.signal.length} electives`
                        : slotEmptyLabel}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => saveSlot(index)}
                        className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-slate-800 transition hover:bg-white/25"
                      >
                        {saveSlotLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => loadSlot(index)}
                        disabled={!slot}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-800 transition hover:bg-white/15 disabled:opacity-50"
                      >
                        {loadSlotLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => clearSlot(index)}
                        disabled={!slot}
                        className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white/90 disabled:opacity-50"
                      >
                        {clearSlotLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleSave}
                className="rounded-full bg-[#BEEDE3] px-6 py-3 text-sm font-semibold text-slate-700 shadow-[0_18px_30px_-20px_rgba(155,203,255,0.6)] transition hover:bg-[#9BCBFF]/60"
              >
                {t('stage2Save')}
              </button>
              <button
                type="button"
                onClick={() => router.push('/stage2/summary')}
                disabled={!progress.stage2Complete}
                className="rounded-full border border-white/60 bg-white/70 px-8 py-3 text-sm font-semibold text-slate-700 shadow-[0_18px_30px_-20px_rgba(155,203,255,0.4)] transition hover:bg-white/90 disabled:opacity-50"
              >
                {viewSummaryLabel}
              </button>
            </div>
        </div>
      </div>

      <style jsx>{`
        .orb-float {
          transform: translate(-50%, -50%) translate(var(--orb-x), var(--orb-y));
          animation: orbFloat 6s ease-in-out infinite;
        }

        .orb-label {
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .orb-float:hover .orb-label,
        .orb-float:focus-visible .orb-label {
          opacity: 1;
          transform: translateY(0);
        }

        .star-twinkle {
          animation: starTwinkle 3.6s ease-in-out infinite;
        }

        .orb-pulse {
          animation: orbPulse 2s ease-in-out infinite;
        }

        @keyframes starTwinkle {
          0%,
          100% {
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes orbFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translate(var(--orb-x), var(--orb-y));
          }
          50% {
            transform: translate(-50%, -50%)
              translate(calc(var(--orb-x) + 1.5%), calc(var(--orb-y) - 1.5%));
          }
        }

        @keyframes orbPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
}
