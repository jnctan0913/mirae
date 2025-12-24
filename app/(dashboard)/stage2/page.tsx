'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/stores/userStore';

const subjects = [
  '수학',
  '영어',
  '한국사',
  '물리학',
  '화학',
  '생명과학',
  '경제',
  '정치와 법',
  '사회문화',
  '미술',
  '음악',
  '체육',
  '디자인 사고',
  '사회문제 탐구',
  '통계',
  '프로그래밍',
];

export default function Stage2Page() {
  const [anchor, setAnchor] = useState<string[]>([]);
  const [signal, setSignal] = useState<string[]>([]);
  const router = useRouter();
  const { completeStage } = useUserStore();

  const handleSave = () => {
    // Save to database
    completeStage(2);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">과목 선택 설계</h1>

        <div className="grid grid-cols-3 gap-6">
          {/* Available subjects */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-bold mb-4">과목 목록</h2>
            <div className="space-y-2">
              {subjects
                .filter((s) => !anchor.includes(s) && !signal.includes(s))
                .map((subject) => (
                  <div
                    key={subject}
                    className="bg-gray-100 p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => {
                      // Simple click to add - will be replaced with drag-drop
                      if (anchor.length < 6) {
                        setAnchor([...anchor, subject]);
                      }
                    }}
                  >
                    {subject}
                  </div>
                ))}
            </div>
          </div>

          {/* Anchor bucket */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <h2 className="font-bold mb-4">⚓ 안전한 선택</h2>
            <div className="space-y-2 min-h-[200px]">
              {anchor.map((subject) => (
                <div
                  key={subject}
                  className="bg-white p-3 rounded-lg border-2 border-blue-300"
                >
                  {subject}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">({anchor.length}/6 선택됨)</p>
          </div>

          {/* Signal bucket */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
            <h2 className="font-bold mb-4">🎯 탐색 신호</h2>
            <div className="space-y-2 min-h-[200px]">
              {signal.map((subject) => (
                <div
                  key={subject}
                  className="bg-white p-3 rounded-lg border-2 border-yellow-300"
                >
                  {subject}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">({signal.length}/6 선택됨)</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-lg mx-auto block"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

