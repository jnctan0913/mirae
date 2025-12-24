'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';

const subjects = [
  { id: 'math', label: { ko: '수학', en: 'Math' } },
  { id: 'english', label: { ko: '영어', en: 'English' } },
  { id: 'korean-history', label: { ko: '한국사', en: 'Korean History' } },
  { id: 'physics', label: { ko: '물리학', en: 'Physics' } },
  { id: 'chemistry', label: { ko: '화학', en: 'Chemistry' } },
  { id: 'biology', label: { ko: '생명과학', en: 'Biology' } },
  { id: 'economics', label: { ko: '경제', en: 'Economics' } },
  { id: 'law', label: { ko: '정치와 법', en: 'Politics & Law' } },
  { id: 'social', label: { ko: '사회문화', en: 'Social Studies' } },
  { id: 'art', label: { ko: '미술', en: 'Art' } },
  { id: 'music', label: { ko: '음악', en: 'Music' } },
  { id: 'pe', label: { ko: '체육', en: 'Physical Education' } },
  { id: 'design-thinking', label: { ko: '디자인 사고', en: 'Design Thinking' } },
  { id: 'social-issues', label: { ko: '사회문제 탐구', en: 'Social Issues' } },
  { id: 'stats', label: { ko: '통계', en: 'Statistics' } },
  { id: 'programming', label: { ko: '프로그래밍', en: 'Programming' } },
];

export default function Stage2Page() {
  const [anchor, setAnchor] = useState<string[]>([]);
  const [signal, setSignal] = useState<string[]>([]);
  const router = useRouter();
  const { completeStage } = useUserStore();
  const { language, t } = useI18n();

  const handleSave = () => {
    // Save to database
    completeStage(2);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('stage2Title')}</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Available subjects */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold mb-4">{t('stage2Subjects')}</h2>
            <div className="space-y-2">
              {subjects
                .filter((s) => !anchor.includes(s.id) && !signal.includes(s.id))
                .map((subject) => (
                  <div
                    key={subject.id}
                    className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => {
                      // Simple click to add - will be replaced with drag-drop
                      if (anchor.length < 6) {
                        setAnchor([...anchor, subject.id]);
                      }
                    }}
                  >
                    {subject.label[language]}
                  </div>
                ))}
            </div>
          </div>

          {/* Anchor bucket */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h2 className="font-bold mb-4">{t('stage2Anchor')}</h2>
            <div className="space-y-2 min-h-[200px]">
              {anchor.map((subjectId) => {
                const subject = subjects.find((s) => s.id === subjectId);
                return (
                <div
                  key={subjectId}
                  className="bg-white p-3 rounded-lg border-2 border-blue-300"
                >
                  {subject?.label[language]}
                </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('stage2AnchorCount', { count: anchor.length.toString() })}
            </p>
          </div>

          {/* Signal bucket */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h2 className="font-bold mb-4">{t('stage2Signal')}</h2>
            <div className="space-y-2 min-h-[200px]">
              {signal.map((subjectId) => {
                const subject = subjects.find((s) => s.id === subjectId);
                return (
                <div
                  key={subjectId}
                  className="bg-white p-3 rounded-lg border-2 border-yellow-300"
                >
                  {subject?.label[language]}
                </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('stage2SignalCount', { count: signal.length.toString() })}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg mx-auto block"
        >
          {t('stage2Save')}
        </button>
      </div>
    </div>
  );
}
