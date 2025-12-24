'use client';

import { useEffect, useState } from 'react';
import { getUser, signOut } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, Circle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

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
  const { progress, userId, setUserId, reset } = useUserStore();
  const [userName, setUserName] = useState('');
  const { t, language } = useI18n();

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserId(user.id);
      setUserName(user.name || user.email?.split('@')[0] || '학생');
    } else {
      router.push('/login');
    }
  }, [setUserId, router]);

  const handleSignOut = () => {
    signOut();
    reset();
    router.push('/login');
    router.refresh();
  };

  const getStageStatus = (stageId: number) => {
    if (progress[`stage${stageId}Complete` as keyof typeof progress]) return 'complete';
    if (stageId === progress.currentStage) return 'current';
    if (stageId < progress.currentStage) return 'available';
    return 'locked';
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-[#73c8a9]" />;
      case 'current':
        return <Circle className="w-6 h-6 text-[#9BCBFF] fill-[#9BCBFF]" />;
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
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Logo Header */}
        <div className="flex items-center justify-between">
          <img
            src="/asset/Mirae_word.webp"
            alt="Mirae"
            className="h-8 object-contain"
          />
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('dashboard')}</p>
                <h1 className="text-3xl font-bold mt-1">
                  {t('greeting')}, {userName}! 👋
                </h1>
                <p className="text-slate-600 mt-1">
                  {language === 'ko'
                    ? `${t('stagePosition')} ${progress.currentStage}에 있어요`
                    : `${t('stagePosition')} ${progress.currentStage}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-full bg-white/70 border border-white/70 text-sm text-slate-700 shadow-sm hover:bg-white transition"
                >
                  {t('logout')}
                </button>
                <div className="px-4 py-2 rounded-full bg-white/70 border border-white/60 text-sm text-slate-700 shadow-sm">
                  {t('progressLabel')} · {Math.round(totalProgress)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white/60 border border-white/70 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#9BCBFF] via-[#F4A9C8] to-[#BEEDE3] transition-all duration-500"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
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
                  glass-card rounded-2xl p-6 floating transition-all
                  ${isAccessible ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                  ${status === 'current' ? 'ring-4 ring-[#C7B9FF]/70' : 'ring-1 ring-white/60'}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-800">{stage.name}</h3>
                    <p className="text-sm text-slate-600">{stage.description}</p>
                  </div>
                  {getStageIcon(status)}
                </div>

                {status === 'current' && (
                  <button className="soft-button w-full py-2.5 rounded-full font-semibold">
                    {t('start')}
                  </button>
                )}

                {status === 'complete' && (
                  <p className="text-sm text-[#73c8a9] font-semibold">{t('complete')}</p>
                )}

                {status === 'locked' && (
                  <p className="text-sm text-slate-500">{t('locked')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
