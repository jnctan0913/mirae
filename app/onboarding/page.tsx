'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useI18n } from '@/lib/i18n';
import { storage } from '@/lib/utils/storage';

interface Message {
  role: 'bot' | 'user';
  text: string;
  options?: string[];
}

const initialMessages: Message[] = [
  {
    role: 'bot',
    text: 'onboardingGreeting',
  },
  {
    role: 'bot',
    text: 'onboardingIntro',
  },
  {
    role: 'bot',
    text: 'onboardingQuestion1',
    options: ['onboardingAnswerProblem', 'onboardingAnswerHelping', 'onboardingAnswerCreating', 'onboardingAnswerUnsure'],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setUserId } = useUserStore();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [uploads, setUploads] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>(['Curious explorer', 'Empathy-driven', 'Visual thinker']);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onboardingDoneKey = (userId: string) => `user_${userId}_onboardingDone`;

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setUserId(user.id);
    if (typeof window !== 'undefined') {
      const done = localStorage.getItem(onboardingDoneKey(user.id));
      if (done === 'true') {
        router.push('/dashboard');
      }
    }
  }, [router, setUserId]);

  const appendMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const persistProfile = (patch: Record<string, unknown>) => {
    const profile = storage.get<Record<string, unknown>>('userProfile', {}) ?? {};
    storage.set('userProfile', {
      ...profile,
      ...patch,
    });
  };

  const handleOptionClick = (optionKey: string) => {
    appendMessage({ role: 'user', text: optionKey });
    appendMessage({
      role: 'bot',
      text: 'onboardingFollowUp',
    });
    const keyword = optionKey === 'onboardingAnswerProblem'
      ? 'Analytical'
      : optionKey === 'onboardingAnswerHelping'
        ? 'People-first'
        : optionKey === 'onboardingAnswerCreating'
          ? 'Maker mindset'
          : 'Open to explore';
    setKeywords((prev) => {
      const next = Array.from(new Set([...prev, keyword]));
      persistProfile({ onboardingKeywords: next });
      return next;
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    appendMessage({ role: 'user', text: input.trim() });
    setInput('');
    appendMessage({ role: 'bot', text: 'onboardingThanks' });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const names = files.map((f) => f.name);
    setUploads((prev) => {
      const next = [...prev, ...names];
      persistProfile({ uploadedDocs: next });
      return next;
    });
    appendMessage({ role: 'bot', text: 'onboardingUploadConfirm' });
  };

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
        <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none soft-glow" />
          <div className="relative space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-600">{t('onboardingTag')}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
                {t('onboardingTitle')} <span aria-hidden>🌱</span>
              </h1>
              <p className="text-slate-600 mt-2 text-sm sm:text-base">{t('onboardingSubtitle')}</p>
            </div>

            <div className="space-y-3">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={[
                    'max-w-2xl rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm',
                    message.role === 'bot'
                      ? 'bg-white/90 border border-white/60 text-slate-800'
                      : 'bg-[#E5E0FF]/90 border border-[#C7B9FF]/50 text-slate-800 ml-auto',
                  ].join(' ')}
                >
                  <p className="text-sm sm:text-base">{t(message.text)}</p>
                  {message.options && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.options.map((optionKey) => (
                        <button
                          key={optionKey}
                          onClick={() => handleOptionClick(optionKey)}
                          className="rounded-full px-3 py-2 text-sm bg-white/80 border border-white/60 text-slate-800 shadow-sm hover:-translate-y-0.5 transition"
                        >
                          {t(optionKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('onboardingPlaceholder')}
                className="flex-1 rounded-full px-4 py-3 bg-white/90 border border-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C7B9FF]"
              />
              <button
                onClick={handleSend}
                className="soft-button px-6 py-3 rounded-full text-sm sm:text-base font-semibold"
              >
                {t('stage3Send')}
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-white/80 border border-white/70 text-sm text-slate-700 shadow-sm hover:-translate-y-0.5 transition"
              >
                {t('onboardingUploadCta')}
              </button>
              {uploads.length > 0 && (
                <div className="text-xs text-slate-600 flex flex-wrap gap-2 items-center">
                  {uploads.map((file) => (
                    <span key={file} className="px-3 py-1 rounded-full bg-white/80 border border-white/60">
                      {file}
                    </span>
                  ))}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleUpload}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60">
            <p className="text-sm font-semibold text-slate-700 mb-2">{t('onboardingKeywords')}</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((word) => (
                <span
                  key={word}
                  className="px-3 py-2 rounded-full text-sm bg-white/90 border border-white/70 text-slate-800 shadow-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60 space-y-3">
            <p className="text-sm font-semibold text-slate-700">{t('onboardingNextSteps')}</p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• {t('onboardingNextStep1')}</li>
              <li>• {t('onboardingNextStep2')}</li>
              <li>• {t('onboardingNextStep3')}</li>
            </ul>
            <button
              onClick={handleFinish}
              className="soft-button w-full py-3 rounded-full font-semibold"
            >
              {t('onboardingFinish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
