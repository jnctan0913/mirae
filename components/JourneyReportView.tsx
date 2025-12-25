'use client';

import { useMemo, useState } from 'react';
import type { ActivityLog, ScopeStage } from '@/lib/activityLogs';
import { MiraeCharacter, type CardType, getEvolutionMessage } from '@/components/MiraeCharacterEvolution';

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

const activityTypeLabels: Record<ActivityLog['activityType'], string> = {
  MiraeActivity: 'Mirae activity',
  Study: 'Study',
  Project: 'Project',
  Club: 'Club',
  Reflection: 'Reflection',
  ExternalWork: 'External work',
};

const buildExecutiveReflection = (logs: ActivityLog[]) => {
  if (logs.length === 0) {
    return {
      focus: 'Your journey will show up here once you begin logging activities.',
      change: 'As activities collect, Mirae will surface what is consistent and what is evolving.',
      surprise: 'Small steps over time create the clearest story.',
    };
  }

  const typeCounts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.activityType] = (acc[log.activityType] || 0) + 1;
    return acc;
  }, {});

  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as ActivityLog['activityType'];
  const focus = topType
    ? `Your archive leans toward ${activityTypeLabels[topType].toLowerCase()}, showing steady attention in that space.`
    : 'Your archive is still emerging, but patterns are beginning to appear.';

  const sorted = logs.slice().sort((a, b) => a.date.localeCompare(b.date));
  const earlyStages = sorted.slice(0, 3).map((log) => log.scopeStage);
  const laterStages = sorted.slice(-3).map((log) => log.scopeStage);
  const change = earlyStages.join('') !== laterStages.join('')
    ? 'Over time, your focus shifts and expands, suggesting you explore broadly before narrowing.'
    : 'Your focus stays steady, showing consistent engagement with your core interests.';

  return {
    focus,
    change,
    surprise: 'Mirae often notices quieter progress, like reflection notes and revisits that you might not highlight yourself.',
  };
};

const buildObservedTendencies = (logs: ActivityLog[], cards: IdentityCardSummary[]) => {
  const tendencies = new Set<string>();
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

const buildDirectionRationale = (logs: ActivityLog[]) => {
  const hasProject = logs.some((log) => log.activityType === 'Project' || log.activityType === 'Club');
  const hasStudy = logs.some((log) => log.activityType === 'Study');
  return {
    environment: hasProject
      ? 'Prefers environments where learning is applied through projects and collaborative work.'
      : 'Prefers environments that balance structured guidance with room for reflection.',
    explore: hasStudy
      ? 'Wants to deepen foundations while connecting them to real-world questions.'
      : 'Wants to keep exploring before committing to a narrow specialization.',
    flexibility: 'Values programs that allow cross-disciplinary exploration without pressure to specialize too early.',
  };
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

export default function JourneyReportView({ logs, cards, studentName }: JourneyReportViewProps) {
  const unlockedCards = useMemo(() => cards.filter((card) => card.unlocked), [cards]);
  const timeline = useMemo(() => buildTimeline(logs), [logs]);
  const experiences = useMemo(() => buildExperiences(logs), [logs]);
  const observedTendencies = useMemo(() => buildObservedTendencies(logs, cards), [logs, cards]);
  const rationale = useMemo(() => buildDirectionRationale(logs), [logs]);
  const executive = useMemo(() => buildExecutiveReflection(logs), [logs]);

  const [executiveText, setExecutiveText] = useState(
    `${executive.focus}\n\n${executive.change}\n\n${executive.surprise}`
  );
  const [growthText, setGrowthText] = useState(
    'Early activities show curiosity and experimenting. Later entries show more clarity in direction and confidence in choices.'
  );
  const [directionText, setDirectionText] = useState(
    `Learning environment: ${rationale.environment}\n\nDepth to explore: ${rationale.explore}\n\nFlexibility: ${rationale.flexibility}`
  );

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
  const snapshotDays = useMemo(() => {
    const sorted = logs.slice().sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-14);
  }, [logs]);
  const totalLogs = logs.length;
  const topStage = useMemo(() => {
    return (Object.entries(stageCounts) as [ScopeStage, number][])
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }, [stageCounts]);

  return (
    <div className="space-y-6">
      <div className="space-y-6 no-print">
        <div className="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">View My Story</p>
              <h2 className="text-2xl font-semibold text-slate-800">My Story Snapshot</h2>
              <p className="text-sm text-slate-500">{studentName || 'Student'} · {formatRange(logs)}</p>
              <p className="text-sm text-slate-600 mt-2">
                A visual story of who I am, how I have grown, and why I choose my direction.
              </p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-3">
              <div className="w-28 h-28">
                <MiraeCharacter cardCount={unlockedCards.length} recentCardTypes={unlockedCards.map((c) => c.type)} size={120} />
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
              <p className="text-sm font-semibold text-slate-700 mb-2">Signature cards</p>
              {unlockedCards.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {unlockedCards.slice(0, 3).map((card) => (
                    <div key={card.id} className="rounded-xl border border-white/60 bg-white/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{stageLabels[card.stage]}</p>
                      <p className="text-sm font-semibold text-slate-700">{card.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">Unlock cards to see your signature strengths.</p>
              )}
            </div>
          </div>
        </div>

        <EditableBlock
          label="Who I am in my own words"
          value={executiveText}
          onChange={setExecutiveText}
          systemGenerated
        />
      </div>

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
              <p className="text-sm font-semibold text-slate-700 mb-2">Stage momentum</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {(Object.keys(stageCounts) as ScopeStage[]).map((stage) => (
                  <div key={stage} className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-3 py-1">
                    <span className={`h-2 w-2 rounded-full ${stageColors[stage]}`} />
                    <span>{stageLabels[stage]}</span>
                    <span className="text-slate-400">{stageCounts[stage]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/50 bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Momentum map</p>
            <div className="grid grid-cols-7 gap-2">
              {snapshotDays.length > 0 ? (
                snapshotDays.map((log) => (
                  <div
                    key={`${log.id}-snapshot`}
                    className={`h-6 rounded-lg ${stageColors[log.scopeStage]}`}
                    title={`${log.date}: ${log.title}`}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <EditableBlock
            label="How I have grown"
            value={growthText}
            onChange={setGrowthText}
            systemGenerated
          />
        </div>
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
              <p className="text-sm font-semibold text-slate-700 mb-2">Program fit</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Learning environment: {rationale.environment}</li>
                <li>Depth to explore: {rationale.explore}</li>
                <li>Flexibility: {rationale.flexibility}</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/80 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-700 mb-2">Key reflections</p>
              {reflections.length > 0 ? (
                <ul className="text-xs text-slate-600 space-y-2">
                  {reflections.map((log) => (
                    <li key={log.id}>
                      <span className="text-slate-500">{log.date}: </span>
                      "{log.shortReflection}"
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
          onChange={setDirectionText}
          systemGenerated
        />
      </div>

      <div className="print-only print-storybook">
        <section className="storybook-page">
          <p className="storybook-kicker">My Storybook</p>
          <h2>{studentName || 'Student'}</h2>
          <p className="storybook-subtitle">{formatRange(logs)} · Growth story snapshot</p>
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
                      {log.date}: "{log.shortReflection}"
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
