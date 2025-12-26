'use client';

import { useMemo, useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ActivityLog, ScopeStage } from '@/lib/activityLogs';
import { MiraeCharacter, type CardType, getEvolutionMessage, type EquippedAccessories } from '@/components/MiraeCharacterEvolution';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';

type IdentityCardSummary = {
  id: string;
  type: CardType;
  title: string;
  description: string;
  stage: ScopeStage;
  unlocked: boolean;
};

type JourneyReportViewProps = {
  logs: ActivityLog[];
  cards: IdentityCardSummary[];
  studentName: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
};

const formatRange = (logs: ActivityLog[]) => {
  if (logs.length === 0) return 'No activity yet';
  const dates = logs.map((log) => log.date).sort();
  const start = dates[0];
  const end = dates[dates.length - 1];
  return `${start} to ${end}`;
};

const monthLabel = (date: string) => {
  const [year, month] = date.split('-');
  return `${year}.${month}`;
};

const stageLabels: Record<ScopeStage, string> = {
  S: 'Strengths',
  C: 'Curiosity',
  O: 'Options',
  P: 'Proof',
  E: 'Evolve',
};

const stageColors: Record<ScopeStage, string> = {
  S: 'bg-[#9BCBFF]',
  C: 'bg-[#BEEDE3]',
  O: 'bg-[#FFD1A8]',
  P: 'bg-[#F4A9C8]',
  E: 'bg-[#C7B9FF]',
};

const stageHex: Record<ScopeStage, string> = {
  S: '#9BCBFF',
  C: '#BEEDE3',
  O: '#FFD1A8',
  P: '#F4A9C8',
  E: '#C7B9FF',
};

const activityTypeLabels: Record<ActivityLog['activityType'], string> = {
  MiraeActivity: 'Mirae activity',
  Study: 'Study',
  Project: 'Project',
  Club: 'Club',
  Reflection: 'Reflection',
  ExternalWork: 'External work',
};

const buildObservedTendencies = (
  logs: ActivityLog[],
  cards: IdentityCardSummary[],
  profileInsights: string[] = []
) => {
  const tendencies = new Set<string>();
  profileInsights.forEach((insight) => {
    tendencies.add(insight);
  });
  const unlockedStrengths = cards.filter((card) => card.unlocked && (card.type === 'StrengthPattern' || card.type === 'ThenVsNow'));
  if (unlockedStrengths.length > 0) {
    tendencies.add('Often reflects on how strengths show up in different settings.');
  }
  const hasReflection = logs.some((log) => log.activityType === 'Reflection');
  if (hasReflection) {
    tendencies.add('Pauses to notice learning moments, not just outcomes.');
  }
  const hasProject = logs.some((log) => log.activityType === 'Project' || log.activityType === 'Club');
  if (hasProject) {
    tendencies.add('Builds evidence through hands-on experiments and collaboration.');
  }
  const hasStudy = logs.some((log) => log.activityType === 'Study');
  if (hasStudy) {
    tendencies.add('Shows persistence in academic foundations before applying ideas.');
  }
  return Array.from(tendencies).slice(0, 4);
};

const buildTimeline = (logs: ActivityLog[]) => {
  const grouped = logs.reduce<Record<string, ActivityLog[]>>((acc, log) => {
    const key = monthLabel(log.date);
    acc[key] = acc[key] ? [...acc[key], log] : [log];
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, entries]) => ({
      month,
      highlights: entries.slice(0, 4).map((entry) => entry.title),
    }));
};

const buildStageTimeline = (logs: ActivityLog[]) => {
  const grouped = logs.reduce<Record<string, Record<ScopeStage, number>>>((acc, log) => {
    const key = monthLabel(log.date);
    if (!acc[key]) {
      acc[key] = { S: 0, C: 0, O: 0, P: 0, E: 0 };
    }
    acc[key][log.scopeStage] += 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, counts]) => ({
      month,
      counts,
      total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    }));
};

const getDateBounds = (logs: ActivityLog[]) => {
  if (logs.length === 0) return { start: 'Start', end: 'Recent' };
  const sorted = logs.slice().sort((a, b) => a.date.localeCompare(b.date));
  return { start: sorted[0].date, end: sorted[sorted.length - 1].date };
};

const buildExperiences = (logs: ActivityLog[]) => {
  return logs
    .filter((log) => ['Project', 'Club', 'ExternalWork', 'MiraeActivity'].includes(log.activityType))
    .slice(0, 4)
    .map((log) => ({
      date: log.date,
      title: log.title,
      insight: log.shortReflection || 'Connected back to a personal statement theme.',
    }));
};

const buildWeeklyCounts = (logs: ActivityLog[]) => {
  if (logs.length === 0) return [];
  const sorted = logs.slice().sort((a, b) => a.date.localeCompare(b.date));
  const start = sorted[0].date;
  const startDate = new Date(start);
  const weekIndex = (date: string) => {
    const current = new Date(date);
    const diffDays = Math.floor((current.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  };
  const grouped = sorted.reduce<Record<number, { count: number; stages: ScopeStage[] }>>((acc, log) => {
    const index = weekIndex(log.date);
    if (!acc[index]) {
      acc[index] = { count: 0, stages: [] };
    }
    acc[index].count += 1;
    acc[index].stages.push(log.scopeStage);
    return acc;
  }, {});
  const maxIndex = Math.max(...Object.keys(grouped).map((key) => Number(key)));
  return Array.from({ length: maxIndex + 1 }, (_, i) => ({
    week: i + 1,
    count: grouped[i]?.count || 0,
    stages: grouped[i]?.stages || [],
  }));
};

const buildRadarMetrics = (logs: ActivityLog[], cards: IdentityCardSummary[]) => {
  const countByType = logs.reduce<Partial<Record<ActivityLog['activityType'], number>>>((acc, log) => {
    acc[log.activityType] = (acc[log.activityType] || 0) + 1;
    return acc;
  }, {});
  const cardCounts = cards.reduce<Record<CardType, number>>((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
  }, {} as Record<CardType, number>);

  const logWeight = 1;
  const cardWeight = 0.6;
  const selfStrengthsScore =
    (countByType.Reflection || 0) * logWeight +
    ((cardCounts.ThenVsNow || 0) + (cardCounts.StrengthPattern || 0)) * cardWeight;
  const curiosityRolesScore =
    (countByType.MiraeActivity || 0) * logWeight +
    (cardCounts.CuriosityThread || 0) * cardWeight;
  const academicPathScore =
    (countByType.Study || 0) * logWeight + (cardCounts.Experience || 0) * cardWeight;
  const proofExperiencesScore =
    ((countByType.Project || 0) + (countByType.ExternalWork || 0) + (countByType.Club || 0)) *
      logWeight +
    (cardCounts.ProofMoment || 0) * cardWeight;
  const valuesFitScore = (cardCounts.ValueSignal || 0) * cardWeight;

  const total =
    selfStrengthsScore +
      curiosityRolesScore +
      academicPathScore +
      proofExperiencesScore +
      valuesFitScore || 1;

  return [
    { label: 'Self & Strengths', value: selfStrengthsScore / total },
    { label: 'Curiosity & Roles', value: curiosityRolesScore / total },
    { label: 'Academic Path', value: academicPathScore / total },
    { label: 'Proof & Experiences', value: proofExperiencesScore / total },
    { label: 'Values & Fit', value: valuesFitScore / total },
  ];
};

const buildProofSpacing = (experiences: ReturnType<typeof buildExperiences>) => {
  if (experiences.length === 0) return [];
  const sorted = experiences.slice().sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((exp, index) => {
    if (index === 0) return { ...exp, gapDays: 0 };
    const prev = new Date(sorted[index - 1].date);
    const current = new Date(exp.date);
    const gapDays = Math.max(0, Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)));
    return { ...exp, gapDays };
  });
};

const EditableBlock = ({
  label,
  value,
  onChange,
  systemGenerated = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  systemGenerated?: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  return (
    <div className="rounded-2xl border border-white/50 bg-white/85 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
        <button
          onClick={() => setEditing((prev) => !prev)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {systemGenerated && (
        <p className="text-[11px] text-slate-400 mb-2">System-generated</p>
      )}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C7B9FF] resize-none"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
          >
            Save
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{value}</p>
      )}
    </div>
  );
};

export default function JourneyReportView({ logs, cards, studentName, onRefresh, isRefreshing }: JourneyReportViewProps) {
  const unlockedCards = useMemo(() => cards.filter((card) => card.unlocked), [cards]);
  const timeline = useMemo(() => buildTimeline(logs), [logs]);
  const stageTimeline = useMemo(() => buildStageTimeline(logs), [logs]);
  const experiences = useMemo(() => buildExperiences(logs), [logs]);
  const weeklyCounts = useMemo(() => buildWeeklyCounts(logs), [logs]);
  const proofSpacing = useMemo(() => buildProofSpacing(experiences), [experiences]);
  const radarMetrics = useMemo(() => buildRadarMetrics(logs, cards), [logs, cards]);
  const dateBounds = useMemo(() => getDateBounds(logs), [logs]);
  const profile = getUserProfile();
  const stage0Insights = (() => {
    const groups = profile.stage0Profile?.insightGroups;
    const grouped = [
      ...(groups?.curiosity ?? []),
      ...(groups?.values ?? []),
      ...(groups?.learning ?? []),
      ...(groups?.currentState ?? []),
    ].filter(Boolean);
    const raw = profile.stage0Profile?.insights
      ? Object.values(profile.stage0Profile.insights).map((insight) => insight.body)
      : [];
    const reflectionInsights = (profile.reflectionSessions ?? [])
      .flatMap((session) => session.insights ?? [])
      .filter(Boolean);
    return [...grouped, ...raw, ...reflectionInsights];
  })();
  const observedTendencies = useMemo(
    () => buildObservedTendencies(logs, cards, stage0Insights),
    [logs, cards, stage0Insights]
  );
  const programFit = profile.programFit;

  // Load equipped accessories from profile
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const profileState = getUserProfile();
      if (profileState.avatar?.equippedAccessories) {
        setEquippedAccessories(profileState.avatar.equippedAccessories);
      }
      
      // Listen for accessory updates
      const handleAccessoryUpdate = () => {
        const latestProfile = getUserProfile();
        if (latestProfile.avatar?.equippedAccessories) {
          setEquippedAccessories(latestProfile.avatar.equippedAccessories);
        }
      };
      
      window.addEventListener('miraeAccessoriesUpdated', handleAccessoryUpdate);
      return () => window.removeEventListener('miraeAccessoriesUpdated', handleAccessoryUpdate);
    }
  }, []);

  const [executiveText, setExecutiveText] = useState(
    profile.report?.executiveText ?? ''
  );
  const [growthText, setGrowthText] = useState(
    profile.report?.growthText ?? ''
  );
  const [directionText, setDirectionText] = useState(
    profile.report?.directionText ?? ''
  );
  const [storySummaryText, setStorySummaryText] = useState(
    profile.report?.storySummary ?? ''
  );
  const reflectionGoal =
    profile.journeyNarrative?.nextStep ||
    profile.reflectionSessions?.[profile.reflectionSessions.length - 1]?.goal ||
    profile.reflectionSessions?.[profile.reflectionSessions.length - 1]?.insights?.[0] ||
    '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleProfileUpdate = () => {
      const latest = getUserProfile();
      setExecutiveText(latest.report?.executiveText ?? '');
      setGrowthText(latest.report?.growthText ?? '');
      setDirectionText(latest.report?.directionText ?? '');
      setStorySummaryText(latest.report?.storySummary ?? '');
      if (latest.avatar?.equippedAccessories) {
        setEquippedAccessories(latest.avatar.equippedAccessories);
      }
    };

    window.addEventListener('miraeProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('miraeProfileUpdated', handleProfileUpdate);
  }, [directionText, executiveText, growthText, storySummaryText]);

  const handleExecutiveChange = (value: string) => {
    setExecutiveText(value);
    updateUserProfile({ report: { ...profile.report, executiveText: value } });
  };

  const handleGrowthChange = (value: string) => {
    setGrowthText(value);
    updateUserProfile({ report: { ...profile.report, growthText: value } });
  };

  const handleDirectionChange = (value: string) => {
    setDirectionText(value);
    updateUserProfile({ report: { ...profile.report, directionText: value } });
  };

  const activityCounts = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.activityType] = (acc[log.activityType] || 0) + 1;
      return acc;
    }, {});
  }, [logs]);

  const topActivities = useMemo(() => {
    return Object.entries(activityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [activityCounts]);

  const stageCounts = useMemo(() => {
    return logs.reduce<Record<ScopeStage, number>>(
      (acc, log) => {
        acc[log.scopeStage] = (acc[log.scopeStage] || 0) + 1;
        return acc;
      },
      { S: 0, C: 0, O: 0, P: 0, E: 0 }
    );
  }, [logs]);

  const reflections = logs.filter((log) => log.shortReflection).slice(0, 4);
  const totalLogs = logs.length;
  const topStage = useMemo(() => {
    return (Object.entries(stageCounts) as [ScopeStage, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [stageCounts]);

  const maxWeekly = weeklyCounts.reduce((max, item) => Math.max(max, item.count), 0);

  return (
    <div className="space-y-6">
      <div className="space-y-6 no-print">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">View My Story</p>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-slate-800">My Story Snapshot</h2>
                {onRefresh && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="h-9 w-9 rounded-full border border-white/60 bg-white/80 text-slate-600 hover:text-slate-800 hover:bg-white transition flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Refresh journey report"
                    title="Refresh journey report"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500">{studentName || 'Student'} · {formatRange(logs)}</p>
              <p className="text-sm text-slate-600 mt-2">
                A visual story of who I am, how I have grown, and why I choose my direction.
              </p>
              {storySummaryText && (
                <p className="text-sm text-slate-600 mt-3">{storySummaryText}</p>
              )}
              {reflectionGoal && (
                <div className="mt-4 border-t border-slate-200/70 pt-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">My goal</p>
                  <p className="text-sm text-slate-600 mt-2">{reflectionGoal}</p>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-3">
              <div className="w-28 h-28">
                <MiraeCharacter 
                  key={`report-${JSON.stringify(equippedAccessories)}`}
                  cardCount={unlockedCards.length} 
                  recentCardTypes={unlockedCards.map((c) => c.type)} 
                  size={120}
                  equippedAccessories={equippedAccessories}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                {getEvolutionMessage(
                  unlockedCards.length === 0 ? 'base' :
                  unlockedCards.length <= 2 ? 'awakening' :
                  unlockedCards.length <= 4 ? 'discovering' :
                  unlockedCards.length <= 7 ? 'emerging' :
                  'realized'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                {unlockedCards.length} cards unlocked
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 no-print">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-5 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500">Story highlights</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/50 bg-white/80 px-4 py-3">
              <p className="text-xs text-slate-400">Total entries</p>
              <p className="text-xl font-semibold text-slate-700">{totalLogs}</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 px-4 py-3">
              <p className="text-xs text-slate-400">Top stage</p>
              <p className="text-sm font-semibold text-slate-700">
                {topStage ? stageLabels[topStage] : 'Not yet'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 px-4 py-3">
              <p className="text-xs text-slate-400">Focus areas</p>
              <p className="text-sm font-semibold text-slate-700">
                {topActivities.length > 0
                  ? topActivities.map(([type]) => activityTypeLabels[type as ActivityLog['activityType']]).join(', ')
                  : 'Not yet'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/50 bg-white/90 p-5 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Stage balance</p>
          <div className="space-y-3">
            {(Object.keys(stageCounts) as ScopeStage[]).map((stage) => {
              const count = stageCounts[stage];
              const ratio = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>{stageLabels[stage]}</span>
                    <span>{ratio}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${stageColors[stage]}`} style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-white/50 bg-white/90 p-5 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Activity mix</p>
          <div className="space-y-3">
            {topActivities.length > 0 ? (
              topActivities.map(([type, count]) => {
                const ratio = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>{activityTypeLabels[type as ActivityLog['activityType']]}</span>
                      <span>{ratio}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-[#9BCBFF]" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">Add activities to visualize your mix.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Who I Am</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Identity signals</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {observedTendencies.length > 0 ? (
                  observedTendencies.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#9BCBFF]" />
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400">Patterns will appear as you add more logs.</li>
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Top activity focus</p>
              {topActivities.length > 0 ? (
                <ul className="space-y-2 text-sm text-slate-600">
                  {topActivities.map(([type, count]) => (
                    <li key={type} className="flex items-center justify-between">
                      <span>{activityTypeLabels[type as ActivityLog['activityType']]}</span>
                      <span className="text-slate-500">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Add activities to highlight your focus.</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-700 mb-2">Identity radar</p>
              {totalLogs > 0 ? (
                <div className="grid w-full grid-cols-[3fr_2fr] gap-6">
                  <div className="flex items-center justify-center">
                    <svg viewBox="0 0 240 240" className="w-48 h-48">
                    {[0.25, 0.5, 0.75, 1].map((level) => (
                      <circle key={`ring-${level}`} cx="120" cy="120" r={110 * level} fill="none" stroke="#E2E8F0" strokeWidth="1" />
                    ))}
                    {radarMetrics.map((metric, index) => {
                      const angle = (Math.PI * 2 * index) / radarMetrics.length - Math.PI / 2;
                      const x = 120 + Math.cos(angle) * 110;
                      const y = 120 + Math.sin(angle) * 110;
                      return (
                        <g key={`axis-${metric.label}`}>
                          <line x1="120" y1="120" x2={x} y2={y} stroke="#CBD5F5" strokeWidth="1" />
                          <text x={120 + Math.cos(angle) * 125} y={120 + Math.sin(angle) * 125} fontSize="9" fill="#64748B" textAnchor="middle" dominantBaseline="middle">
                            {metric.label}
                          </text>
                        </g>
                      );
                    })}
                    <polygon
                      points={radarMetrics
                        .map((metric, index) => {
                          const angle = (Math.PI * 2 * index) / radarMetrics.length - Math.PI / 2;
                          // Add baseline (30%) and amplify the remaining 70% by 1.4x to make blue area bigger
                          const scaledValue = 0.3 + (metric.value * 0.7 * 1.4);
                          const radius = 110 * Math.min(scaledValue, 1);
                          const x = 120 + Math.cos(angle) * radius;
                          const y = 120 + Math.sin(angle) * radius;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                      fill="rgba(155, 203, 255, 0.4)"
                      stroke="#9BCBFF"
                      strokeWidth="2"
                    />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center space-y-2">
                    {radarMetrics.map((metric) => (
                      <div
                        key={`metric-${metric.label}`}
                        className="flex items-center justify-between gap-3 rounded-lg bg-white/60 px-3 py-2"
                      >
                        <span className="text-xs font-medium text-slate-700">{metric.label}</span>
                        <span className="text-xs font-semibold text-slate-600">{Math.round(metric.value * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Add activities to see your identity radar.</p>
              )}
            </div>
          </div>
        </div>

        <EditableBlock
          label="Who I am in my own words"
          value={executiveText}
          onChange={handleExecutiveChange}
          systemGenerated
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">My Growth Journey</p>
          <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Curiosity timeline</p>
                <div className="space-y-3">
                  {timeline.length > 0 ? (
                    timeline.map((item) => (
                      <div key={item.month} className="rounded-xl border border-white/60 bg-white/90 p-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">{item.month}</p>
                        <ul className="text-xs text-slate-500 space-y-1">
                          {item.highlights.map((highlight) => (
                            <li key={highlight}>- {highlight}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Log activities to build your timeline.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Growth arc</p>
                {weeklyCounts.length > 0 ? (
                  <div>
                    <svg viewBox="0 0 200 60" className="w-full h-20">
                      <polyline
                        fill="none"
                        stroke="#CBD5F5"
                        strokeWidth="2"
                        points={weeklyCounts
                          .map((item, index) => {
                            const x = (index / Math.max(1, weeklyCounts.length - 1)) * 200;
                            const y = 58 - (maxWeekly > 0 ? (item.count / maxWeekly) * 50 : 0);
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                      {weeklyCounts.map((item, index) => {
                        const x = (index / Math.max(1, weeklyCounts.length - 1)) * 200;
                        const y = 58 - (maxWeekly > 0 ? (item.count / maxWeekly) * 50 : 0);
                        const stage = item.stages[0] || topStage;
                        return (
                          <circle key={`arc-${index}`} cx={x} cy={y} r="3" fill={stage ? stageHex[stage] : '#CBD5F5'} />
                        );
                      })}
                    </svg>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{dateBounds.start}</span>
                      <span>{dateBounds.end}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Each point is one week. Higher points mean more entries; color shows the dominant stage that week.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Add logs to see your growth arc.</p>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Stage shifts by month</p>
              <div className="space-y-3">
                {stageTimeline.length > 0 ? (
                  stageTimeline.map((item) => (
                    <div key={`shift-${item.month}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{item.month}</span>
                        <span>{item.total} entries</span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                        {(Object.keys(item.counts) as ScopeStage[]).map((stage) => {
                          const count = item.counts[stage];
                          if (count === 0) return null;
                          const width = item.total > 0 ? (count / item.total) * 100 : 0;
                          return (
                            <div
                              key={`${item.month}-${stage}`}
                              className={stageColors[stage]}
                              style={{ width: `${width}%` }}
                              title={`${stageLabels[stage]}: ${count}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                        {(Object.keys(item.counts) as ScopeStage[]).map((stage) =>
                          item.counts[stage] > 0 ? (
                            <span key={`${item.month}-label-${stage}`} className="flex items-center gap-1">
                              <span className={`h-2 w-2 rounded-full ${stageColors[stage]}`} />
                              {stageLabels[stage]} {item.counts[stage]}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Log activities to see how stages shift over time.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <EditableBlock
          label="How I have grown"
          value={growthText}
          onChange={handleGrowthChange}
          systemGenerated
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-3">Why I Choose This Direction</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Proof moments</p>
              {experiences.length > 0 ? (
                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <div key={`${exp.date}-${exp.title}`} className="rounded-xl border border-white/60 bg-white/90 p-3">
                      <p className="text-xs text-slate-500">{exp.date}</p>
                      <p className="text-sm font-semibold text-slate-700">{exp.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{exp.insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Add projects or club entries to highlight proof moments.</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-700 mb-2">Proof spacing</p>
              {proofSpacing.length > 0 ? (
                <div className="space-y-2">
                  {proofSpacing.map((item) => (
                    <div key={`spacing-${item.date}-${item.title}`} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className="h-2 w-2 rounded-full bg-[#F4A9C8]" />
                        <span className="text-[10px] text-slate-400">{item.date}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600">{item.title}</p>
                        {item.gapDays > 0 && (
                          <p className="text-[10px] text-slate-400">Gap: {item.gapDays} days</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Add proof moments to visualize spacing.</p>
              )}
            </div>
            {programFit && (programFit.environment || programFit.explore || programFit.flexibility) && (
              <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Program fit</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {programFit.environment && (
                    <li>Learning environment: {programFit.environment}</li>
                  )}
                  {programFit.explore && (
                    <li>Depth to explore: {programFit.explore}</li>
                  )}
                  {programFit.flexibility && (
                    <li>Flexibility: {programFit.flexibility}</li>
                  )}
                </ul>
              </div>
            )}
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-700 mb-2">Key reflections</p>
              {reflections.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-2">
                  {reflections.map((log) => (
                    <li key={log.id}>
                      <span className="text-slate-500">{log.date}: </span>
                      &quot;{log.shortReflection}&quot;
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Add reflections to capture key moments.</p>
              )}
            </div>
          </div>
        </div>

        <EditableBlock
          label="Why I want to pursue this path"
          value={directionText}
          onChange={handleDirectionChange}
          systemGenerated
        />
      </div>

      <div className="print-only print-storybook">
        <section className="storybook-page">
          <p className="storybook-kicker">My Storybook</p>
          <h2>{studentName || 'Student'}</h2>
          <p className="storybook-subtitle">{formatRange(logs)} · Growth story snapshot</p>
          <div className="storybook-strip">
            <div>
              <h3>Snapshot strip</h3>
              <p>
                {(Object.keys(stageCounts) as ScopeStage[])
                  .map((stage) => `${stageLabels[stage]} ${stageCounts[stage]}`)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <p className="storybook-body">{executiveText}</p>
          <div className="storybook-grid">
            <div>
              <h3>Identity signals</h3>
              <ul>
                {observedTendencies.length > 0 ? (
                  observedTendencies.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>Patterns will appear as you add more logs.</li>
                )}
              </ul>
            </div>
            <div>
              <h3>Top activity focus</h3>
              <ul>
                {topActivities.length > 0 ? (
                  topActivities.map(([type, count]) => (
                    <li key={type}>
                      {activityTypeLabels[type as ActivityLog['activityType']]} · {count}
                    </li>
                  ))
                ) : (
                  <li>Add activities to highlight your focus.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="storybook-page">
          <h2>My Growth Journey</h2>
          <p className="storybook-body">{growthText}</p>
          <div className="storybook-grid">
            <div>
              <h3>Curiosity timeline</h3>
              <ul>
                {timeline.length > 0 ? (
                  timeline.map((item) => (
                    <li key={item.month}>
                      <strong>{item.month}</strong>: {item.highlights.join(', ')}
                    </li>
                  ))
                ) : (
                  <li>Log activities to build your timeline.</li>
                )}
              </ul>
            </div>
            <div>
              <h3>Stage momentum</h3>
              <ul>
                {(Object.keys(stageCounts) as ScopeStage[]).map((stage) => (
                  <li key={stage}>
                    {stageLabels[stage]} · {stageCounts[stage]}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="storybook-page">
          <h2>Why I Choose This Direction</h2>
          <p className="storybook-body">{directionText}</p>
          <div className="storybook-grid">
            <div>
              <h3>Proof moments</h3>
              <ul>
                {experiences.length > 0 ? (
                  experiences.map((exp) => (
                    <li key={`${exp.date}-${exp.title}`}>
                      <strong>{exp.title}</strong> · {exp.insight}
                    </li>
                  ))
                ) : (
                  <li>Add projects or club entries to highlight proof moments.</li>
                )}
              </ul>
            </div>
            <div>
              <h3>Key reflections</h3>
              <ul>
                {reflections.length > 0 ? (
                  reflections.map((log) => (
                    <li key={log.id}>
                      {log.date}: &quot;{log.shortReflection}&quot;
                    </li>
                  ))
                ) : (
                  <li>Add reflections to capture key moments.</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
