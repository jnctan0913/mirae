'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { storage } from '@/lib/utils/storage';
import { useI18n } from '@/lib/i18n';

// Placeholder questions - will be expanded
const questions = [
  {
    id: 'q1',
    questionKey: 'stage0Question',
    type: 'multi-select',
    options: [
      { id: 'analytical', labelKey: 'stage0OptionAnalytical', emoji: '🧠' },
      { id: 'creative', labelKey: 'stage0OptionCreative', emoji: '🎨' },
      { id: 'empathy', labelKey: 'stage0OptionEmpathy', emoji: '❤️' },
      { id: 'organization', labelKey: 'stage0OptionOrganization', emoji: '📋' },
    ],
  },
];

export default function Stage0Page() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const { userId, completeStage } = useUserStore();
  const { t } = useI18n();

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleSelect = (optionId: string) => {
    const qId = question.id;

    if (question.type === 'single-select') {
      setAnswers({ ...answers, [qId]: [optionId] });
    } else {
      const current = answers[qId] || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [qId]: updated });
    }
  };

  const handleComplete = () => {
    const strengths = answers['q1'] || [];

    // Store in localStorage
    const profileData = {
      userId,
      strengths,
      completedAt: new Date().toISOString(),
    };
    storage.set('userProfile', profileData);

    completeStage(0);
    router.push('/dashboard');
  };

  const canProceed = answers[question.id]?.length > 0;

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ((prev) => Math.max(0, prev - 1));
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen px-6 sm:px-8 py-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card rounded-3xl p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <p>
                {t('stage0ProgressLabel')} {currentQ + 1} / {questions.length}
              </p>
              <p>{Math.round(progress)}%</p>
            </div>
            <div className="bg-white/70 border border-white/70 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#9BCBFF] via-[#F4A9C8] to-[#BEEDE3] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('stage0Name')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">
              {t(question.questionKey)}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = answers[question.id]?.includes(option.id);

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={[
                      'w-full p-4 sm:p-5 rounded-2xl border transition-all text-left',
                      'bg-white/80 border-white/60 hover:-translate-y-0.5 hover:shadow-lg',
                      isSelected
                        ? 'ring-2 ring-[#9BCBFF] shadow-md'
                        : 'hover:border-white/90',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                      <span className="font-semibold text-slate-800">{t(option.labelKey)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-full border border-white/70 bg-white/70 text-slate-700 font-semibold hover:bg-white/90 transition"
          >
            {t('stage0Prev')}
          </button>

          <button
            onClick={handleComplete}
            disabled={!canProceed}
            className="soft-button px-6 py-3 rounded-full text-sm sm:text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t('stage0Complete')}
          </button>
        </div>
      </div>
    </div>
  );
}
