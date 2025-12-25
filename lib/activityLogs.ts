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

export const loadActivityLogs = (): ActivityLog[] => {
  const profile = getUserProfile();
  return (profile.activityLogs as ActivityLog[]) ?? [];
};

export const saveActivityLogs = (logs: ActivityLog[]) => {
  updateUserProfile({ activityLogs: logs });
  updateProfileAnalytics(logs);
};
