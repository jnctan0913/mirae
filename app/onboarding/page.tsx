'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { OnboardingChat } from '@/components/onboarding/OnboardingChat';
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar';

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserId } = useUserStore();
  const { t } = useI18n();

  const onboardingDoneKey = (userId: string) => `user_${userId}_onboardingDone`;

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    if (typeof window !== 'undefined') {
      // Allow ?reset=true to view onboarding again
      const urlParams = new URLSearchParams(window.location.search);
      const reset = urlParams.get('reset');
      if (reset === 'true') {
        localStorage.removeItem(onboardingDoneKey(user.id));
        return;
      }
      const done = localStorage.getItem(onboardingDoneKey(user.id));
      if (done === 'true') {
        router.push('/dashboard');
      }
    }
  }, [router, setUserId]);

  const handleFinish = () => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    localStorage.setItem(onboardingDoneKey(user.id), 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen onboarding-bg py-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left: Chat Area */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-600">{t('onboardingTag')}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                {t('onboardingTitle')} <span aria-hidden>🌱</span>
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">{t('onboardingSubtitle')}</p>
            </div>
            
            <OnboardingChat onComplete={handleFinish} />
          </div>
        </div>

        {/* Right: Sidebar */}
        <OnboardingSidebar onFinish={handleFinish} />
      </div>
    </div>
  );
}
