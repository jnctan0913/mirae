'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Home, Languages, LogOut, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { getUser, signOut } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useI18n();
  const { reset } = useUserStore();
  const [userInitial, setUserInitial] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAuthPage = useMemo(
    () => pathname?.startsWith('/login') || pathname?.startsWith('/signup'),
    [pathname]
  );

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setUserInitial(user.name.slice(0, 1));
      setUserName(user.name);
    } else if (user?.email) {
      setUserInitial(user.email.slice(0, 1).toUpperCase());
    }
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language === 'ko' ? 'ko' : 'en';
    }
  }, [language]);

  useEffect(() => {
    // Watch for modal-open class on body
    const checkModalState = () => {
      setIsModalOpen(document.body.classList.contains('modal-open'));
    };

    // Initial check
    checkModalState();

    // Watch for class changes
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleSignOut = () => {
    signOut();
    reset();
    router.push('/login');
    router.refresh();
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isModalOpen ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="glass-card rounded-full flex items-center gap-2 px-3 py-2">
          {!isAuthPage && (
            <>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 px-2 py-2 rounded-full hover:bg-white/70 transition text-slate-700"
                title={t('back')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1 px-2 py-2 rounded-full hover:bg-white/70 transition text-slate-700"
                title={t('home')}
              >
                <Home className="w-4 h-4" />
              </button>
              <div className="h-6 w-px bg-white/60" />
            </>
          )}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-white/60 text-sm font-semibold text-slate-700 floating"
          >
            <Languages className="w-4 h-4" />
            {language === 'ko' ? t('languageKorean') : t('languageEnglish')}
          </button>

          <div className="h-6 w-px bg-white/60" />

          <div className="flex items-center gap-2 px-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-[#9BCBFF] to-[#F4A9C8] flex items-center justify-center text-base font-bold text-slate-800 shadow-md hover:shadow-lg transition"
              aria-label={t('settingsOpen')}
            >
              {userInitial || <User className="w-5 h-5" />}
            </button>
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

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={handleCloseSettings}
            aria-label={t('settingsClose')}
          />
          <aside className="relative h-full w-full max-w-sm bg-white/95 shadow-2xl border-l border-white/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t('settingsTitle')}
                </p>
                <h2 className="text-xl font-semibold text-slate-800">{userName || t('studentFallback')}</h2>
                <p className="text-sm text-slate-500">{userEmail || t('settingsEmailPlaceholder')}</p>
              </div>
              <button
                onClick={handleCloseSettings}
                className="h-9 w-9 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:text-slate-800 transition"
                aria-label={t('settingsClose')}
              >
                ✕
              </button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">{t('settingsAccount')}</p>
                <p className="text-sm text-slate-500 mt-1">{t('settingsAccountHint')}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-50 px-3 py-1">{t('settingsMembership')}</span>
                  <span className="rounded-full bg-slate-50 px-3 py-1">{t('settingsStatus')}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{t('settingsLanguage')}</p>
                  <p className="text-xs text-slate-500">{t('settingsLanguageHint')}</p>
                </div>
                <button
                  onClick={toggleLanguage}
                  className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  {language === 'ko' ? t('languageKorean') : t('languageEnglish')}
                </button>
              </div>

              {!isAuthPage && (
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
