'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';

const specializations = [
  { id: 'ux-design', name: 'UX Design', alignment: 85 },
  { id: 'data-science', name: 'Data Science', alignment: 60 },
  { id: 'social-ent', name: 'Social Entrepreneurship', alignment: 88 },
  { id: 'content', name: 'Content Creation', alignment: 75 },
];

export default function Stage4Page() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const { completeStage } = useUserStore();
  const { t } = useI18n();

  const handleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleComplete = () => {
    completeStage(4);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('stage4Title')}</h1>
        <p className="text-center text-gray-600 mb-8">
          {t('stage4Subtitle')}
        </p>

        <div className="grid grid-cols-2 gap-4">
          {specializations.map((spec) => {
            const isSelected = selected.includes(spec.id);
            const stars = '⭐'.repeat(Math.floor(spec.alignment / 20));

            return (
              <div
                key={spec.id}
                onClick={() => handleSelect(spec.id)}
                className={`
                  bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all
                  ${isSelected ? 'ring-4 ring-amber-400' : 'hover:shadow-xl'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold">{spec.name}</h3>
                  <span className="text-sm text-gray-500">{stars}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {t('stage4Alignment', { value: spec.alignment.toString() })}
                </p>
                {isSelected && (
                  <p className="text-sm text-amber-600 font-medium mt-2">{t('stage4Selected')}</p>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          disabled={selected.length === 0}
          className="mt-8 w-full py-3 bg-amber-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-amber-700 transition"
        >
          {t('stage4Complete')} ({selected.length}/3)
        </button>
      </div>
    </div>
  );
}
