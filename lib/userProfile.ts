import { storage } from '@/lib/utils/storage';
type ActivityLogEntry = {
  id: string;
  date: string;
  title: string;
  scopeStage: 'S' | 'C' | 'O' | 'P' | 'E';
  activityType:
    | 'MiraeActivity'
    | 'Study'
    | 'Project'
    | 'Club'
    | 'Reflection'
    | 'ExternalWork';
  source?: 'Mirae' | 'Manual' | 'SimulatedDrive' | 'SimulatedTodo';
  linkedCardId?: string;
  shortReflection?: string;
};

export type YearLevel = 1 | 2 | 3;
export type SelectionStatus = 'not_started' | 'in_progress' | 'completed';
export type TriggerReason = 'exploration' | 'reflection' | 'doubt' | 'pressure' | 'general';

export type OnboardingContext = {
  yearLevel?: 'year1' | 'year2' | 'year3';
  currentSemester?: 'sem1' | 'sem2';
  courseSelectionStatus?: 'picked' | 'deciding' | 'reconsidering';
  currentFeeling?: string;
  keywords?: string[];
  docKeywords?: string[];
  uploadedDocs?: string[];
};

export type UserProfile = {
  id: string;
  name: string;
  yearLevel: YearLevel;
  selectionStatus: SelectionStatus;
  triggerReason: TriggerReason;
  currentSemester: string | null;
  academicStage?: string | null;
  courses: string[];
  keywords: string[];
  strengths: {
    energizers: string[];
    joys: string[];
  };
  strengthTags?: string[];
  interests: string[];
  onboarding: OnboardingContext;
  onboardingKeywords?: string[];
  uploadedDocs?: string[];
  docKeywords?: string[];
  report?: {
    executiveText?: string;
    growthText?: string;
    directionText?: string;
    storySummary?: string;
  };
  journeyNarrative?: {
    title?: string;
    summary?: string;
    highlights?: string[];
    focus?: string;
    nextStep?: string;
  };
  programFit?: {
    environment?: string;
    explore?: string;
    flexibility?: string;
  };
  reflections?: Record<string, string>;
  reflectionSessions?: Array<{
    id: string;
    createdAt: string;
    summary: string;
    insights: string[];
    keywords: string[];
    transcript: string;
  }>;
  customCardTags?: Record<string, string[]>;
  reportSources?: {
    executiveText?: string;
    growthText?: string;
    directionText?: string;
    generatedAt?: string;
    inputHash?: string;
  };
  avatar?: {
    collectedCards?: string[];
    equippedAccessories?: Record<string, string>;
    customizerSelectedAccessories?: string[];
  };
  collection?: {
    viewMode?: 'collection' | 'statement';
    cards?: Record<string, unknown>[];
  };
  roleSwipes?: {
    roleId: string;
    swipeDirection: 'left' | 'right' | 'up';
    swipeSpeed?: number;
    cardTapCount?: number;
  }[];
  stage2Selection?: {
    anchor: string[];
    signal: string[];
    savedAt: string;
    targetSemester?: string;
  };
  stage2Slots?: ({ anchor: string[]; signal: string[]; savedAt: string } | null)[];
  stage4Result?: {
    major: { id: string; name: string };
    university: { id: string; name: string };
    confidence: number;
    insightStrengths: string[];
    insightRoles: string[];
    completedAt: string;
  };
  stage5?: {
    timeline?: string;
    storyboard?: {
      timeline: string;
      panels: { time: string; scene: string }[];
    };
  };
  questionnaireAnswers?: Record<string, string[]>;
  stage0Summary?: {
    recommendedRoles?: string[];
    tagCounts?: Record<string, number>;
  };
  stage0Profile?: {
    primaryTag?: string;
    secondaryTag?: string;
    topSignals?: string[];
    persona?: {
      label?: string;
      description?: string;
    };
    insights?: Record<string, { title: string; body: string }>;
    insightGroups?: {
      curiosity?: string[];
      values?: string[];
      learning?: string[];
      decisions?: string[];
      resilience?: string[];
      currentState?: string[];
    };
    valuesSignals?: string[];
  };
  likedRoles?: string[];
  aiGeneratedRoles?: Array<{
    id: string;
    title: { en: string; ko: string };
    tagline: { en: string; ko: string };
    domain: { en: string; ko: string };
    roleModels: { en: string[]; ko: string[] };
    companies: { en: string[]; ko: string[] };
    details: { en: string; ko: string };
    resources: { en: string[]; ko: string[] };
  }>;
  onboardingCompleted?: boolean;
  activityLogs?: ActivityLogEntry[];
  analytics: {
    activityLogCount: number;
    lastActivityDate?: string;
    lastUpdated: string;
  };
  updatedAt: string;
};

const PROFILE_KEY = 'userProfile';

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user',
  name: '',
  yearLevel: 1,
  selectionStatus: 'not_started',
  triggerReason: 'general',
  currentSemester: null,
  academicStage: null,
  courses: [],
  keywords: [],
  strengths: {
    energizers: [],
    joys: [],
  },
  strengthTags: [],
  interests: [],
  reflections: {},
  reflectionSessions: [],
  onboarding: {},
  avatar: {
    collectedCards: [],
    equippedAccessories: {},
    customizerSelectedAccessories: [],
  },
  collection: {
    viewMode: 'collection',
    cards: [],
  },
  customCardTags: {},
  stage5: {
    timeline: '3-years',
  },
  onboardingCompleted: false,
  activityLogs: [],
  analytics: {
    activityLogCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  updatedAt: new Date().toISOString(),
};

const mergeProfile = (base: UserProfile, updates: Partial<UserProfile>): UserProfile => {
  const merged: UserProfile = {
    ...base,
    ...updates,
    strengths: {
      ...base.strengths,
      ...updates.strengths,
      energizers: updates.strengths?.energizers ?? base.strengths.energizers,
      joys: updates.strengths?.joys ?? base.strengths.joys,
    },
    onboarding: {
      ...base.onboarding,
      ...updates.onboarding,
    },
    analytics: {
      ...base.analytics,
      ...updates.analytics,
      lastUpdated: updates.analytics?.lastUpdated ?? new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };

  return merged;
};

const isLegacySeedProfile = (profile: UserProfile) => {
  const hasSeedReport =
    profile.report?.executiveText ===
    "I'm not avoiding decisions. I want to think carefully before choosing, so I can trust my reasons.";
  const hasSeedCard = Array.isArray(profile.collection?.cards)
    ? profile.collection.cards.some(
        (card) =>
          (card as { id?: string; title?: string }).id === 'card-1' &&
          (card as { title?: string }).title === 'Pattern Recognition'
      )
    : false;
  const hasSeedLog = Array.isArray(profile.activityLogs)
    ? profile.activityLogs.some(
        (log) =>
          log.id === 'log-1' &&
          log.title === 'Reflected on strengths after Stage 0'
      )
    : false;

  return (hasSeedReport && hasSeedCard) || (hasSeedCard && hasSeedLog);
};

const stripLegacySeedData = (profile: UserProfile): UserProfile => ({
  ...profile,
  report: undefined,
  journeyNarrative: undefined,
  programFit: undefined,
  collection: {
    viewMode: profile.collection?.viewMode ?? 'collection',
    cards: [],
  },
  customCardTags: {},
  activityLogs: [],
});

export const ensureUserProfile = (): UserProfile => {
  const existing = storage.get<UserProfile>(PROFILE_KEY, null);
  if (!existing) {
    storage.set(PROFILE_KEY, DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }

  const cleaned = isLegacySeedProfile(existing) ? stripLegacySeedData(existing) : existing;
  const merged = mergeProfile(DEFAULT_PROFILE, cleaned);
  storage.set(PROFILE_KEY, merged);
  return merged;
};

export const getUserProfile = (): UserProfile => {
  return ensureUserProfile();
};

export const updateUserProfile = (updates: Partial<UserProfile>): UserProfile => {
  const current = ensureUserProfile();
  const merged = mergeProfile(current, updates);
  storage.set(PROFILE_KEY, merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('miraeProfileUpdated'));
  }
  return merged;
};

export const resetUserProfile = (): UserProfile => {
  storage.set(PROFILE_KEY, DEFAULT_PROFILE);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('miraeProfileUpdated'));
  }
  return DEFAULT_PROFILE;
};

export const updateProfileFromOnboarding = (context: Partial<OnboardingContext>) => {
  const yearMap: Record<NonNullable<OnboardingContext['yearLevel']>, YearLevel> = {
    year1: 1,
    year2: 2,
    year3: 3,
  };
  const stageMap: Record<NonNullable<OnboardingContext['yearLevel']>, string> = {
    year1: 'year-1-sem-1',
    year2: 'year-2-sem-1',
    year3: 'year-3-sem-1',
  };
  const statusMap: Record<
    NonNullable<OnboardingContext['courseSelectionStatus']>,
    SelectionStatus
  > = {
    picked: 'completed',
    deciding: 'in_progress',
    reconsidering: 'in_progress',
  };

  const updates: Partial<UserProfile> = {
    onboarding: context,
  };

  if (context.yearLevel) {
    updates.yearLevel = yearMap[context.yearLevel];
    updates.academicStage = stageMap[context.yearLevel];
  }
  if (context.currentSemester) {
    updates.currentSemester = context.currentSemester;
    if (context.yearLevel) {
      updates.academicStage = `year-${yearMap[context.yearLevel]}-sem-${context.currentSemester === 'sem2' ? '2' : '1'}`;
    }
  }
  if (context.courseSelectionStatus) {
    updates.selectionStatus = statusMap[context.courseSelectionStatus];
  }

  return updateUserProfile(updates);
};

export const updateProfileAnalytics = (logs: ActivityLogEntry[]) => {
  if (!Array.isArray(logs)) return;
  const dates = logs.map((log) => log.date).sort();
  updateUserProfile({
    analytics: {
      activityLogCount: logs.length,
      lastActivityDate: dates[dates.length - 1],
      lastUpdated: new Date().toISOString(),
    },
  });
};
