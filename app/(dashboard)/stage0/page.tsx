'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { supabase } from '@/lib/supabase';

// Placeholder questions - will be expanded
const questions = [
  {
    id: 'q1',
    question: '당신은 어떤 것들을 잘하나요?',
    type: 'multi-select',
    options: [
      { id: 'analytical', label: '분석적 사고', emoji: '🧠' },
      { id: 'creative', label: '창의적 표현', emoji: '🎨' },
      { id: 'empathy', label: '공감 능력', emoji: '❤️' },
      { id: 'organization', label: '체계적 정리', emoji: '📋' },
    ],
  },
];

export default function Stage0Page() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const { userId, completeStage } = useUserStore();

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

  const handleComplete = async () => {
    const strengths = answers['q1'] || [];

    await supabase.from('user_profiles').insert({
      user_id: userId,
      strengths,
      completed_at: new Date().toISOString(),
    });

    completeStage(0);
    router.push('/dashboard');
  };

  const canProceed = answers[question.id]?.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              질문 {currentQ + 1} / {questions.length}
            </p>
            <p className="text-sm text-gray-600">{Math.round(progress)}%</p>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answers[question.id]?.includes(option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-6 py-3 rounded-lg border-2 border-gray-300 disabled:opacity-50"
          >
            ← 이전
          </button>

          <button
            onClick={handleComplete}
            disabled={!canProceed}
            className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium disabled:opacity-50 hover:bg-purple-700 transition"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

