'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';

export default function Stage5Page() {
  const [timeline, setTimeline] = useState('3-years');
  const [storyboard, setStoryboard] = useState<any>(null);
  const router = useRouter();
  const { completeStage } = useUserStore();

  const handleGenerate = async () => {
    // Placeholder for storyboard generation
    setStoryboard({
      timeline,
      panels: [
        { scene: 'Morning: Working on design project', time: '8:00 AM' },
        { scene: 'Class: Human-centered design', time: '10:00 AM' },
        { scene: 'Team meeting: Social impact project', time: '2:00 PM' },
      ],
    });
  };

  const handleComplete = () => {
    completeStage(5);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">스토리보드</h1>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">언제를 보고 싶나요?</h2>
          <div className="space-y-3">
            {[
              { id: '1-year', label: '1년 후 (2학년)' },
              { id: '3-years', label: '3년 후 (대학교)' },
              { id: '5-years', label: '5년 후 (직장)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeline(t.id)}
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
            스토리보드 생성하기
          </button>
        </div>

        {storyboard && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">당신의 미래 스토리</h2>
            <div className="grid grid-cols-3 gap-4">
              {storyboard.panels.map((panel: any, idx: number) => (
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
          완료하기
        </button>
      </div>
    </div>
  );
}

