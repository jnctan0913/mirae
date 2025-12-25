'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { getUserProfile, updateUserProfile } from '@/lib/userProfile';

interface StoryboardPanel {
  scene: string;
  time: string;
}

interface Storyboard {
  timeline: string;
  panels: StoryboardPanel[];
}

export default function Stage5Page() {
  const profile = getUserProfile();
  const [timeline, setTimeline] = useState(profile.stage5?.timeline ?? '3-years');
  const [storyboard, setStoryboard] = useState<Storyboard | null>(
    profile.stage5?.storyboard ?? null
  );
  const router = useRouter();
  const { completeStage } = useUserStore();
  const { t } = useI18n();

  const handleGenerate = async () => {
    // Placeholder for storyboard generation
    const nextStoryboard = {
      timeline,
      panels: [
        { scene: t('stage5Scene1'), time: t('stage5Scene1Time') },
        { scene: t('stage5Scene2'), time: t('stage5Scene2Time') },
        { scene: t('stage5Scene3'), time: t('stage5Scene3Time') },
      ],
    };
    setStoryboard(nextStoryboard);
    updateUserProfile({ stage5: { timeline, storyboard: nextStoryboard } });
  };

  const handleComplete = () => {
    completeStage(5);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('stage5Title')}</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">{t('stage5When')}</h2>
          <div className="space-y-3">
            {[
              { id: '1-year', label: t('stage5Timeline1') },
              { id: '3-years', label: t('stage5Timeline3') },
              { id: '5-years', label: t('stage5Timeline5') },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTimeline(t.id);
                  updateUserProfile({ stage5: { ...getUserProfile().stage5, timeline: t.id } });
                }}
                className={`
                  w-full p-4 rounded-xl border-2 text-left transition-all
                  ${
                    timeline === t.id
                      ? 'border-pink-600 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }
                `}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            className="mt-6 w-full py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition"
          >
            {t('stage5Generate')}
          </button>
        </div>

        {storyboard && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">{t('stage5StoryTitle')}</h2>
            <div className="grid grid-cols-3 gap-4">
              {storyboard.panels.map((panel, idx) => (
                <div key={idx} className="bg-gray-100 rounded-xl p-4 h-48 flex flex-col justify-center items-center">
                  <p className="text-sm text-gray-500 mb-2">{panel.time}</p>
                  <p className="text-center text-sm">{panel.scene}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleComplete}
          className="w-full py-3 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition"
        >
          {t('stage5Finish')}
        </button>
      </div>
    </div>
  );
}
