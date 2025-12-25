'use client';

import { useState } from 'react';
import { signUp } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { withBasePath } from '@/lib/basePath';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = signUp(email, password, name);

    if ('error' in result) {
      setError(t(result.error));
      setLoading(false);
    } else {
      router.push(withBasePath('/dashboard'));
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4A9C8] via-[#FFD1A8] to-[#BEEDE3]">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/60">
        <div className="flex justify-center mb-4">
          <img
            src="/asset/Mirae_Word_Only.png"
            alt="Mirae"
            className="h-12 object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              console.error('Image failed to load:', e.currentTarget.src);
            }}
          />
        </div>
        <p className="text-slate-600 text-center mb-8">
          {t('signupHeroTitle')}
        </p>

        {/* Info about disabled signup */}
        <div className="mb-6 p-4 bg-gradient-to-br from-[#F4A9C8]/20 to-[#FFD1A8]/20 rounded-2xl text-sm border border-[#F4A9C8]/30">
          <p className="font-semibold mb-2 text-slate-700">{t('signupDisabledTitle')}</p>
          <p className="text-slate-600">{t('signupDisabledBody')}</p>
          <p className="text-slate-600 mt-2">{t('loginEmailLabel')}: student1@test.com</p>
          <p className="text-slate-600">{t('loginEmailLabel')}: student2@test.com</p>
          <p className="text-slate-600 mt-1">{t('loginPasswordValue')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              {t('signupNameLabel')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border-2 border-white/60 rounded-xl focus:border-[#F4A9C8] focus:outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              {t('loginEmailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border-2 border-white/60 rounded-xl focus:border-[#F4A9C8] focus:outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              {t('loginPasswordLabel')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border-2 border-white/60 rounded-xl focus:border-[#F4A9C8] focus:outline-none transition-all"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#F4A9C8] to-[#FFD1A8] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? t('signupLoading') : t('signupButton')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-4">
          {t('signupExistingAccount')}{' '}
          <a
            href={withBasePath('/login')}
            className="text-[#F4A9C8] hover:text-[#FFD1A8] font-medium transition-colors"
          >
            {t('signupLogin')}
          </a>
        </p>
      </div>
    </div>
  );
}
