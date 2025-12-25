'use client';

import { useMemo, useState } from 'react';
import type { ActivityLog, ScopeStage } from '@/lib/activityLogs';

type ActivityCalendarProps = {
  logs: ActivityLog[];
  onAddLog: (log: ActivityLog) => void;
};

const stageColors: Record<ScopeStage, string> = {
  S: 'bg-[#9BCBFF]',
  C: 'bg-[#BEEDE3]',
  O: 'bg-[#FFD1A8]',
  P: 'bg-[#F4A9C8]',
  E: 'bg-[#C7B9FF]',
};

const stageLabels: Record<ScopeStage, string> = {
  S: 'Strengths',
  C: 'Curiosity',
  O: 'Options',
  P: 'Proof',
  E: 'Evolve',
};

const activityTypeLabels: Record<ActivityLog['activityType'], string> = {
  MiraeActivity: 'Mirae activity',
  Study: 'Study',
  Project: 'Project',
  Club: 'Club',
  Reflection: 'Reflection',
  ExternalWork: 'External work',
};

const sourceLabels: Record<NonNullable<ActivityLog['source']>, string> = {
  Mirae: 'Mirae',
  Manual: 'Manual',
  SimulatedDrive: 'Simulated Drive',
  SimulatedTodo: 'Simulated Todo',
};

const formatDateLabel = (date: string) => {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
};

const buildId = () => `log-${Date.now()}`;

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const buildMonthDays = (monthDate: Date) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const lastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const totalSlots = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;
  const days: { date: Date | null; label: string }[] = [];

  for (let i = 0; i < totalSlots; i += 1) {
    const dayNumber = i - leadingBlanks + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      days.push({ date: null, label: '' });
    } else {
      days.push({
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber),
        label: String(dayNumber),
      });
    }
  }

  return days;
};

const defaultSuggestion = () => ([
  {
    title: 'Reviewed an exam guide',
    activityType: 'Study' as const,
    scopeStage: 'O' as const,
    source: 'SimulatedTodo' as const,
  },
  {
    title: 'Worked on a club project outline',
    activityType: 'Club' as const,
    scopeStage: 'P' as const,
    source: 'SimulatedDrive' as const,
  },
  {
    title: 'Wrote a quick reflection after class',
    activityType: 'Reflection' as const,
    scopeStage: 'S' as const,
    source: 'Manual' as const,
  },
]);

export default function ActivityCalendar({ logs, onAddLog }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toISODate(new Date()));
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStage, setNewStage] = useState<ScopeStage>('S');
  const [newType, setNewType] = useState<ActivityLog['activityType']>('Reflection');
  const [newReflection, setNewReflection] = useState('');
  const [suggestions, setSuggestions] = useState(defaultSuggestion());

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  const days = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);

  const logsByDate = useMemo(() => {
    return logs.reduce<Record<string, ActivityLog[]>>((acc, log) => {
      acc[log.date] = acc[log.date] ? [...acc[log.date], log] : [log];
      return acc;
    }, {});
  }, [logs]);

  const selectedLogs = useMemo(() => {
    return (logsByDate[selectedDate] || []).slice();
  }, [logsByDate, selectedDate]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleAddLog = () => {
    if (!newTitle.trim()) return;
    const log: ActivityLog = {
      id: buildId(),
      date: selectedDate,
      title: newTitle.trim(),
      scopeStage: newStage,
      activityType: newType,
      source: 'Manual',
      shortReflection: newReflection.trim() || undefined,
    };
    onAddLog(log);
    setNewTitle('');
    setNewReflection('');
    setQuickAddOpen(false);
  };

  const handleSuggestionAdd = (index: number) => {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    onAddLog({
      id: buildId(),
      date: selectedDate,
      title: suggestion.title,
      scopeStage: suggestion.scopeStage,
      activityType: suggestion.activityType,
      source: suggestion.source,
    });
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSuggestionDismiss = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-white/50 bg-white/85 p-5 shadow-lg backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Activity Archive</p>
            <h3 className="text-lg font-semibold text-slate-800">{monthLabel}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="h-8 w-8 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:text-slate-800 transition"
              aria-label="Previous month"
            >
              &lt;
            </button>
            <button
              onClick={handleNextMonth}
              className="h-8 w-8 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:text-slate-800 transition"
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isoDate = day.date ? toISODate(day.date) : '';
            const dayLogs = isoDate ? logsByDate[isoDate] || [] : [];
            const isSelected = isoDate === selectedDate;
            return (
              <button
                key={`${day.label}-${index}`}
                onClick={() => isoDate && setSelectedDate(isoDate)}
                className={[
                  'rounded-2xl border border-white/50 bg-white/70 p-2 text-left text-xs transition',
                  day.date ? 'hover:shadow-md' : 'opacity-40 cursor-default',
                  isSelected ? 'ring-2 ring-[#9BCBFF]' : '',
                ].join(' ')}
                disabled={!day.date}
              >
                <span className="text-slate-600">{day.label}</span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {dayLogs.slice(0, 3).map((log, dotIndex) => (
                    <span
                      key={`${log.id}-${dotIndex}`}
                      className={`h-2 w-2 rounded-full ${stageColors[log.scopeStage]}`}
                    />
                  ))}
                  {dayLogs.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{dayLogs.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-white/50 bg-white/85 p-5 shadow-lg backdrop-blur-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Selected Day</p>
            <h4 className="text-base font-semibold text-slate-800">{formatDateLabel(selectedDate)}</h4>
          </div>
          <button
            onClick={() => setQuickAddOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 border border-white/60 text-slate-600 hover:bg-white transition"
          >
            Log something you worked on
          </button>
        </div>

        {quickAddOpen && (
          <div className="rounded-2xl border border-white/60 bg-white/80 p-4 mb-4 space-y-3">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Short title"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C7B9FF]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value as ScopeStage)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {(['S', 'C', 'O', 'P', 'E'] as ScopeStage[]).map((stage) => (
                  <option key={stage} value={stage}>
                    {stageLabels[stage]}
                  </option>
                ))}
              </select>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ActivityLog['activityType'])}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                {Object.entries(activityTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="Optional 1-sentence reflection"
              className="w-full h-16 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C7B9FF] resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setQuickAddOpen(false)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLog}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700"
              >
                Save entry
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {selectedLogs.length > 0 ? (
            selectedLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-white/50 bg-white/70 p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{activityTypeLabels[log.activityType]}</span>
                  <span className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${stageColors[log.scopeStage]}`} />
                    {stageLabels[log.scopeStage]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{log.title}</p>
                {log.source && (
                  <p className="text-xs text-slate-500">Source: {sourceLabels[log.source]}</p>
                )}
                {log.shortReflection && (
                  <p className="text-xs text-slate-500 mt-2">"{log.shortReflection}"</p>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/50 bg-white/70 p-4 text-xs text-slate-500">
              No activity logged for this day yet.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
          <p className="text-sm font-semibold text-slate-700 mb-2">Gentle suggestions</p>
          <p className="text-xs text-slate-500 mb-3">
            These are simulated prompts. You can confirm or skip them.
          </p>
          <div className="space-y-2">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.title}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-slate-600"
                >
                  <span>{suggestion.title}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSuggestionDismiss(index)}
                      className="px-2 py-1 rounded-full text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleSuggestionAdd(index)}
                      className="px-2 py-1 rounded-full bg-white text-slate-600 border border-white/70 hover:bg-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No new suggestions right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
