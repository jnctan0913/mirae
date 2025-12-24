'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/userStore';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, Circle } from 'lucide-react';

const stages = [
  { id: 0, name: '자기이해', path: '/stage0', description: '당신에 대해 알아가기' },
  { id: 1, name: 'Role Roulette', path: '/stage1', description: '역할 탐색하기' },
  { id: 2, name: '코스 로드맵', path: '/stage2', description: '과목 설계하기' },
  { id: 3, name: '스킬 번역', path: '/stage3', description: '성장 여정 그리기' },
  { id: 4, name: '토너먼트', path: '/stage4', description: '전문화 좁히기' },
  { id: 5, name: '스토리보드', path: '/stage5', description: '미래 시각화하기' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { progress, userId, setUserId } = useUserStore();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserName((user.user_metadata?.name as string) || user.email?.split('@')[0] || '학생');
      }
    };
    loadUser();
  }, [setUserId]);

  const getStageStatus = (stageId: number) => {
    if (progress[`stage${stageId}Complete` as keyof typeof progress]) return 'complete';
    if (stageId === progress.currentStage) return 'current';
    if (stageId < progress.currentStage) return 'available';
    return 'locked';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'current':
        return <Circle className="w-6 h-6 text-blue-600 fill-blue-600" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-gray-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const completedStages = Object.values(progress).filter(
    (v) => typeof v === 'boolean' && v === true
  ).length;
  const totalProgress = (completedStages / 6) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">안녕, {userName}! 👋</h1>
          <p className="text-gray-600 mb-6">
            당신은 지금 Stage {progress.currentStage}에 있어요
          </p>

          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{Math.round(totalProgress)}% 완료</p>
        </div>

        {/* Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stages.map((stage) => {
            const status = getStageStatus(stage.id);
            const isAccessible = status !== 'locked';

            return (
              <div
                key={stage.id}
                onClick={() => isAccessible && router.push(stage.path)}
                className={`
                  bg-white rounded-xl shadow-lg p-6 transition-all
                  ${isAccessible ? 'cursor-pointer hover:shadow-2xl hover:scale-105' : 'opacity-60 cursor-not-allowed'}
                  ${status === 'current' ? 'ring-4 ring-blue-400' : ''}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{stage.name}</h3>
                    <p className="text-sm text-gray-600">{stage.description}</p>
                  </div>
                  {getStageIcon(status)}
                </div>

                {status === 'current' && (
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                    시작하기 →
                  </button>
                )}

                {status === 'complete' && (
                  <p className="text-sm text-green-600 font-medium">✓ 완료됨</p>
                )}

                {status === 'locked' && (
                  <p className="text-sm text-gray-400">🔒 이전 단계를 먼저 완료하세요</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

