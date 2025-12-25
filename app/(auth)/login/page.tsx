'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getUserProfile } from '@/lib/userProfile';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = signIn(email, password);

    if ('error' in result) {
      setError(t('loginInvalid'));
      setLoading(false);
    } else {
      const profile = getUserProfile();
      const shouldOnboard = !profile.onboardingCompleted;
      router.push(shouldOnboard ? '/onboarding' : '/dashboard');
      router.refresh();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/60">
        <div className="flex justify-center mb-4">
          <img
            src="/asset/Mirae_Icon1.png"
            alt="Mirae"
            className="h-20 w-auto object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              console.error('Image failed to load:', e.currentTarget.src);
            }}
          />
        </div>
        <p className="text-slate-600 text-center mb-8">
          {t('loginHeroTitle')}
        </p>

        {/* Test Accounts Info */}
        <div className="mb-6 p-4 bg-gradient-to-br from-[#BEEDE3]/20 to-[#9BCBFF]/20 rounded-2xl text-sm border border-[#BEEDE3]/30">
          <p className="font-semibold mb-2 text-slate-700">{t('loginTestAccounts')}:</p>
          <p className="text-slate-600">Email: student1@test.com</p>
          <p className="text-slate-600">Email: student2@test.com</p>
          <p className="text-slate-600 mt-1">{t('loginPasswordValue')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">{t('loginEmailLabel')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:border-[#9BCBFF] focus:ring-2 focus:ring-[#9BCBFF]/30 focus:outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">{t('loginPasswordLabel')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm focus:border-[#9BCBFF] focus:ring-2 focus:ring-[#9BCBFF]/30 focus:outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#9BCBFF] to-[#C7B9FF] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? t('loginLoading') : t('loginButton')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          {t('loginNoAccount')}{' '}
          <a href="/signup" className="text-[#9BCBFF] hover:text-[#C7B9FF] font-medium transition-colors">
            {t('loginSignup')}
          </a>
        </p>
      </div>
    </div>
  );
}
