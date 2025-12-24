'use client';

import { useEffect, useMemo, useState } from 'react';
import { Languages, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getUser, signOut } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useI18n();
  const { reset } = useUserStore();
  const [userInitial, setUserInitial] = useState('😊');

  const isAuthPage = useMemo(
    () => pathname?.startsWith('/login') || pathname?.startsWith('/signup'),
    [pathname]
  );

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setUserInitial(user.name.slice(0, 1));
    } else if (user?.email) {
      setUserInitial(user.email.slice(0, 1).toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'ko' ? 'ko' : 'en';
    }
  }, [language]);

  const handleSignOut = () => {
    signOut();
    reset();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="glass-card rounded-full flex items-center gap-2 px-3 py-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-white/60 text-sm font-semibold text-slate-700 floating"
        >
          <Languages className="w-4 h-4" />
          {language === 'ko' ? t('languageKorean') : t('languageEnglish')}
        </button>

        <div className="h-6 w-px bg-white/60" />

        <div className="flex items-center gap-2 px-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#9BCBFF] to-[#F4A9C8] flex items-center justify-center text-base font-bold text-slate-800 shadow-md">
            {userInitial}
          </div>
          {!isAuthPage && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full text-slate-700 hover:bg-white/70 transition"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
