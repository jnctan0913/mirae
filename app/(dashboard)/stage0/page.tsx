'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import questionnaire from '@/lib/data/questionnaire.json';
import { updateUserProfile } from '@/lib/userProfile';

type Language = 'ko' | 'en';
type QuestionnaireOption = {
  text_en?: string;
  text_kr?: string;
  tag?: string;
  position?: 'left' | 'right';
};
type QuestionnaireItem = {
  id: string;
  ui_type: 'MCQ' | 'Swipe' | 'Tournament' | 'Slider';
  question: { en: string; kr: string };
  options: QuestionnaireOption[];
};

type StageQuestion = {
  id: string;
  question: string;
  uiType: QuestionnaireItem['ui_type'];
  options: { id: string; label: string; position?: 'left' | 'right' }[];
};

const buildQuestions = (language: Language): StageQuestion[] =>
  (questionnaire.questions as QuestionnaireItem[]).map((item) => {
    const options = item.options.map((option, optionIndex) => {
      const label = language === 'ko' ? option.text_kr : option.text_en;
      const fallbackId = `${item.id}-${optionIndex}`;

      return {
        id: option.tag ?? fallbackId,
        label: label ?? fallbackId,
        position: option.position,
      };
    });

    return {
      id: item.id,
      question: language === 'ko' ? item.question.kr : item.question.en,
      uiType: item.ui_type,
      options,
    };
  });

export default function Stage0Page() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const { userId, progress: userProgress, completeStage } = useUserStore();
  const { t, language } = useI18n();
  const viewResultsLabel =
    language === 'ko' ? '\uC9C4\uB2E8 \uACB0\uACFC \uBCF4\uAE30' : 'View results';
  const viewSummaryLabel =
    language === 'ko' ? '\uC694\uC57D \uBCF4\uAE30' : 'View summary';

  const questions = useMemo(() => buildQuestions(language as Language), [language]);
  const question = questions[currentQ];

  if (!question) return null;

  const progressPercent = ((currentQ + 1) / questions.length) * 100;
  const isLast = currentQ === questions.length - 1;
  const isQuestionnaireComplete = Object.keys(answers).length >= questions.length;

  const handleSelect = (optionId: string) => {
    const qId = question.id;
    const updatedAnswers = { ...answers, [qId]: [optionId] };
    setAnswers(updatedAnswers);
    updateUserProfile({
      id: userId ?? 'demo-user',
      questionnaireAnswers: updatedAnswers,
    });

    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => Math.min(prev + 1, questions.length - 1));
    } else {
      completeStage(0);
    }
  };

  const handleViewResults = () => {
    completeStage(0);
    router.push('/stage0/result');
  };

  const handleViewSummary = () => {
    completeStage(0);
    router.push('/stage0/result');
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
              <p>{Math.round(progressPercent)}%</p>
            </div>
            <div className="bg-white/70 border border-white/70 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#9BCBFF] via-[#F4A9C8] to-[#BEEDE3] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">{t('stage0Name')}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900">
              {question.question}
            </h2>

            <div
              className={[
                'gap-3',
                question.uiType === 'Slider' ? 'grid sm:grid-cols-2' : 'flex flex-col',
              ].join(' ')}
            >
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
                      <span className="font-semibold text-slate-800">{option.label}</span>
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
            onClick={handleViewSummary}
            disabled={!isQuestionnaireComplete && !userProgress.stage0Complete}
            className="px-6 py-3 rounded-full border border-white/70 bg-white/70 text-slate-700 font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {viewSummaryLabel}
          </button>

          {isLast && (
            <button
              onClick={handleViewResults}
              disabled={!canProceed}
              className="soft-button px-6 py-3 rounded-full text-sm sm:text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {viewResultsLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
