'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserId } = useUserStore();

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

  return <OnboardingContainer />;
}
