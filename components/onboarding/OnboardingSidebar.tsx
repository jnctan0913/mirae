'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface OnboardingSidebarProps {
  onFinish: () => void;
}

export const OnboardingSidebar: React.FC<OnboardingSidebarProps> = ({ onFinish }) => {
  const { t } = useI18n();
  const { state } = useOnboarding();
  const [displayKeywords, setDisplayKeywords] = useState<string[]>([]);

  useEffect(() => {
    // Update displayed keywords from onboarding state
    setDisplayKeywords(state.extractedKeywords.filter(k => !k.isRemoved).map(k => k.text));
  }, [state.extractedKeywords]);

  const showFinishButton = state.currentPhase === 'start';

  return (
    <div className="space-y-4">
      {/* Keywords Panel */}
      <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60">
        <p className="text-sm font-semibold text-slate-700 mb-2">{t('onboardingKeywords')}</p>
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
        {showFinishButton && (
          <button
            onClick={onFinish}
            className="soft-button w-full py-3 rounded-full font-semibold"
          >
            {t('onboardingFinish')}
          </button>
        )}
      </div>

      {/* Student Context Summary (optional) */}
      {state.studentData.yearLevel && (
        <div className="glass-card rounded-3xl p-5 shadow-lg border border-white/60">
          <p className="text-xs font-semibold text-slate-600 mb-2">
            {t('onboardingInfoTitle')}
          </p>
          <div className="space-y-1 text-xs text-slate-700">
            {state.studentData.yearLevel && (
              <p>
                📚 {t('onboardingInfoYear', {
                  value:
                    state.studentData.yearLevel === 'year1'
                      ? '1'
                      : state.studentData.yearLevel === 'year2'
                        ? '2'
                        : '3',
                })}
              </p>
            )}
            {state.studentData.courseSelectionStatus && (
              <p>
                ✏️ {state.studentData.courseSelectionStatus === 'picked'
                  ? t('onboardingInfoStatusPicked')
                  : state.studentData.courseSelectionStatus === 'deciding'
                    ? t('onboardingInfoStatusDeciding')
                    : t('onboardingInfoStatusReconsidering')}
              </p>
            )}
            {state.uploadedFiles.length > 0 && (
              <p>📎 {t('onboardingInfoUploads', { count: state.uploadedFiles.length })}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
