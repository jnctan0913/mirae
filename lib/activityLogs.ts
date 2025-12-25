import { getUserProfile, updateProfileAnalytics, updateUserProfile } from '@/lib/userProfile';

export type ScopeStage = 'S' | 'C' | 'O' | 'P' | 'E';

export type ActivityLog = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  scopeStage: ScopeStage;
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

export const ACTIVITY_LOGS_KEY = 'mirae_activity_logs_v1';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const buildSeedActivityLogs = (): ActivityLog[] => {
  const today = new Date();
  const offsets = [0, 1, 3, 5, 8, 11, 14, 18, 21, 24, 27];
  const entries: Omit<ActivityLog, 'id' | 'date'>[] = [
    {
      title: 'Reflected on strengths after Stage 0',
      scopeStage: 'S' as ScopeStage,
      activityType: 'MiraeActivity',
      source: 'Mirae',
      linkedCardId: 'card-1',
      shortReflection: 'Noticed I prefer structured exploration before committing.',
    },
    {
      title: 'Saved role ideas from Role Roulette',
      scopeStage: 'C' as ScopeStage,
      activityType: 'MiraeActivity',
      source: 'Mirae',
    },
    {
      title: 'Reviewed statistics notes',
      scopeStage: 'O' as ScopeStage,
      activityType: 'Study',
      source: 'SimulatedTodo',
    },
    {
      title: 'Drafted a design club proposal',
      scopeStage: 'P' as ScopeStage,
      activityType: 'Club',
      source: 'Manual',
    },
    {
      title: 'Wrote a short reflection on community impact',
      scopeStage: 'E' as ScopeStage,
      activityType: 'Reflection',
      source: 'Manual',
      shortReflection: 'I want my work to feel useful and grounded.',
    },
    {
      title: 'Uploaded project outline to Drive',
      scopeStage: 'P' as ScopeStage,
      activityType: 'Project',
      source: 'SimulatedDrive',
    },
    {
      title: 'Sketched a future day storyboard',
      scopeStage: 'E' as ScopeStage,
      activityType: 'MiraeActivity',
      source: 'Mirae',
    },
    {
      title: 'Explored a new course roadmap',
      scopeStage: 'O' as ScopeStage,
      activityType: 'MiraeActivity',
      source: 'Mirae',
    },
    {
      title: 'Read a human-centered design article',
      scopeStage: 'C' as ScopeStage,
      activityType: 'ExternalWork',
      source: 'Manual',
    },
    {
      title: 'Mapped questions for a mentor chat',
      scopeStage: 'S' as ScopeStage,
      activityType: 'Reflection',
      source: 'Manual',
    },
    {
      title: 'Added notes from a campus visit',
      scopeStage: 'E' as ScopeStage,
      activityType: 'ExternalWork',
      source: 'Manual',
    },
  ];

  return offsets.map((offset, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offsets[index]);
    return {
      id: `log-${index + 1}`,
      date: formatDate(date),
      ...entries[index],
    };
  });
};

export const loadActivityLogs = (): ActivityLog[] => {
  const profile = getUserProfile();
  if (profile.activityLogs && profile.activityLogs.length > 0) {
    return profile.activityLogs as ActivityLog[];
  }
  const seeded = buildSeedActivityLogs();
  updateUserProfile({ activityLogs: seeded });
  return seeded;
};

export const saveActivityLogs = (logs: ActivityLog[]) => {
  updateUserProfile({ activityLogs: logs });
  updateProfileAnalytics(logs);
};
