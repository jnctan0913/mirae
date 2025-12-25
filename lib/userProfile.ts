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
  };
  reflections?: Record<string, string>;
  avatar?: {
    collectedCards?: string[];
    equippedAccessories?: Record<string, string>;
    customizerSelectedAccessories?: string[];
  };
  collection?: {
    viewMode?: 'collection' | 'statement';
    cards?: Record<string, unknown>[];
  };
  stage5?: {
    timeline?: string;
    storyboard?: {
      timeline: string;
      panels: { time: string; scene: string }[];
    };
  };
  questionnaireAnswers?: Record<string, string[]>;
  stage0Summary?: { recommendedRoles?: string[] };
  likedRoles?: string[];
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
  name: 'Eunseo',
  yearLevel: 1,
  selectionStatus: 'in_progress',
  triggerReason: 'pressure',
  currentSemester: '2025-Spring',
  academicStage: 'year-1-sem-1',
  courses: ['Biology', 'World History', 'English Writing'],
  keywords: [
    'Thinks carefully before deciding',
    'Wants clarity without pressure',
    'Sensitive to evaluation',
    'Reflective decision-maker',
  ],
  strengths: {
    energizers: ['Deep reflection', 'Organizing thoughts', 'Listening'],
    joys: ['Learning through discussion', 'Connecting ideas'],
  },
  strengthTags: ['empathy', 'organization'],
  interests: ['Humanities', 'Life sciences', 'Social impact'],
  onboarding: {
    yearLevel: 'year1',
    courseSelectionStatus: 'deciding',
    currentFeeling: 'Worried about making the wrong choice and being judged.',
  },
  report: {
    executiveText:
      "I'm not avoiding decisions. I want to think carefully before choosing, so I can trust my reasons.",
    growthText:
      'My anxiety has become a starting point for reflection. I organize my thoughts before acting.',
    directionText:
      'Learning environment: I do best in thoughtful, low-pressure spaces.\n\nDepth to explore: I want to verify fit through experience.\n\nFlexibility: I need room to adjust as I learn.',
  },
  avatar: {
    collectedCards: ['S_StrengthPattern_01', 'C_CuriosityThread_01'],
    equippedAccessories: {},
    customizerSelectedAccessories: [],
  },
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

export const ensureUserProfile = (): UserProfile => {
  const existing = storage.get<UserProfile>(PROFILE_KEY, null);
  if (!existing) {
    storage.set(PROFILE_KEY, DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }

  const merged = mergeProfile(DEFAULT_PROFILE, existing);
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
  return merged;
};

export const updateProfileFromOnboarding = (context: Partial<OnboardingContext>) => {
  const yearMap: Record<NonNullable<OnboardingContext['yearLevel']>, YearLevel> = {
    year1: 1,
    year2: 2,
    year3: 3,
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
  }
  if (context.courseSelectionStatus) {
    updates.selectionStatus = statusMap[context.courseSelectionStatus];
  }

  return updateUserProfile(updates);
};

export const updateProfileAnalytics = (logs: ActivityLog[]) => {
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
