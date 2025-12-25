'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';
import { Sprout } from 'lucide-react';
import { SmartOnboardingChat } from '@/components/onboarding/SmartOnboardingChat';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { getUserProfile, updateProfileFromOnboarding, updateUserProfile } from '@/lib/userProfile';

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserId } = useUserStore();
  const { t } = useI18n();
  const { state, advancePhase, setStudentContextData, setKeywords } = useOnboarding();
  const [userName, setUserName] = useState('');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    const profile = getUserProfile();
    setUserName(profile.name || user.name || user.email?.split('@')[0] || 'Student');
    if (typeof window !== 'undefined') {
      // Allow ?reset=true to view onboarding again
      const urlParams = new URLSearchParams(window.location.search);
      const reset = urlParams.get('reset');
      if (reset === 'true') {
        updateUserProfile({ onboardingCompleted: false });
        return;
      }
      if (profile.onboardingCompleted) {
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
    updateUserProfile({ onboardingCompleted: true });
    router.push('/dashboard');
  };

  const displayKeywords = state.extractedKeywords.filter(k => !k.isRemoved).map(k => k.text);

  return (
    <div className="fixed inset-0 onboarding-bg overflow-hidden">
      <div className="h-full w-full py-12 px-4 sm:px-8 pt-24 overflow-auto">
        <div
          className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[2fr_1fr] grid-rows-1 pr-4 lg:pr-8 h-full min-h-0"
          style={{ height: 'calc(100vh - 12rem)' }}
        >
          {/* Left: Chat Area */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 relative flex flex-col h-full min-h-0">
            <div className="absolute inset-0 pointer-events-none soft-glow" />
            
            {/* Header */}
            <div className="relative flex-shrink-0 mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">{t('onboardingTag')}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  {t('onboardingTitle', { name: userName })} <Sprout className="w-6 h-6 text-green-500" />
                </h1>
                <p className="text-slate-600 mt-2 text-sm sm:text-base">{t('onboardingSubtitle')}</p>
              </div>
            </div>

            {/* Chat Messages Area - Scrollable */}
            <div className="relative flex-1 min-h-0 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <SmartOnboardingChat
                onComplete={() => advancePhase('start')}
                onContextUpdate={(data) => {
                  setStudentContextData(data);
                  updateProfileFromOnboarding(data);
                }}
                onKeywordsExtracted={(keywords) => {
                  setKeywords(keywords);
                  const profile = getUserProfile();
                  const merged = Array.from(new Set([...(profile.keywords ?? []), ...keywords]));
                  updateUserProfile({
                    keywords: merged,
                    onboarding: { keywords: merged },
                  });
                }}
                onInputChange={setInputValue}
                inputValue={inputValue}
                onSend={() => window.dispatchEvent(new Event('onboardingSmartSend'))}
              />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="relative flex-shrink-0 space-y-3">
              {state.uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.uploadedFiles.map((file) => (
                    <span key={file.name} className="px-3 py-2 rounded-full bg-white/90 border border-white/70 text-xs text-slate-700 shadow-sm flex items-center gap-2">
                      📎 {file.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        if (files.length > 0) {
                          // Handle file upload through the hook
                        }
                      };
                      input.click();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-white/50 transition"
                    title="Upload documents"
                  >
                    📎
                  </button>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        window.dispatchEvent(new Event('onboardingSmartSend'));
                      }
                    }}
                    placeholder={t('onboardingPlaceholder')}
                    className="w-full rounded-full pl-14 pr-4 py-3 bg-white/95 border-2 border-slate-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C7B9FF] focus:border-[#C7B9FF] shadow-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    if (inputValue.trim()) {
                      window.dispatchEvent(new Event('onboardingSmartSend'));
                    }
                  }}
                  disabled={!inputValue.trim()}
                  className="soft-button px-6 py-3 rounded-full text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('stage3Send')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4 h-full min-h-0">
            {/* Keywords Panel */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60">
              <p className="text-sm font-semibold text-slate-700 mb-2">{t('onboardingKeywords', { name: userName })}</p>
              {displayKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {displayKeywords.map((word) => (
                    <span
                      key={word}
                      className="px-3 py-2 rounded-full text-sm bg-white/90 border border-white/70 text-slate-800 shadow-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {t('onboardingKeywordsEmpty')}
                </p>
              )}
            </div>

            {/* Next Steps Panel */}
            <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60 space-y-3">
              <p className="text-sm font-semibold text-slate-700">{t('onboardingNextSteps')}</p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• {t('onboardingNextStep1')}</li>
                <li>• {t('onboardingNextStep2')}</li>
                <li>• {t('onboardingNextStep3')}</li>
              </ul>
              {state.currentPhase === 'start' && (
                <button
                  onClick={handleFinish}
                  className="soft-button w-full py-3 rounded-full font-semibold"
                >
                  {t('onboardingFinish')}
                </button>
              )}
            </div>

            {/* Mirae Icon */}
            <div className="flex justify-end">
              <Image
                src="/asset/Mirae_Icon1.png"
                alt="Mirae Icon"
                width={600}
                height={600}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
