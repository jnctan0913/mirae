'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { AvatarCustomizerPanel } from '@/components/avatar/AvatarCustomizerPanel';
import type { CardId, ProgressState, AvatarConfig } from '@/components/avatar/avatarTypes';

const ALL_CARDS: CardId[] = [
  'S_StrengthPattern_01',
  'C_CuriosityThread_01',
  'O_Options_01',
  'P_ProofMoment_01',
  'E_ThenVsNow_01',
];

export default function AvatarLabPage() {
  const { t } = useI18n();
  const [collectedCards, setCollectedCards] = useState<CardId[]>([
    'S_StrengthPattern_01',
    'C_CuriosityThread_01',
  ]);

  const progress: ProgressState = {
    collectedCards,
  };

  const toggleCard = (cardId: CardId) => {
    setCollectedCards(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleConfigChange = (config: AvatarConfig) => {
    console.log('Avatar config updated:', config);
  };

  return (
    <div
      className="min-h-screen px-6 py-12"
      style={{
        background:
          'linear-gradient(135deg, #9BCBFF 0%, #C7B9FF 25%, #F4A9C8 50%, #FFD1A8 75%, #BEEDE3 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm mb-4">
            {t('avatarLabTag')}
          </div>
          <h1 className="text-4xl font-semibold text-slate-800 mb-2">
            {t('avatarLabTitle')}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {t('avatarLabSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Customizer Panel */}
          <div className="lg:col-span-2">
            <AvatarCustomizerPanel
              baseSrc="/asset/Mirae_Icon1.png"
              progress={progress}
              onConfigChange={handleConfigChange}
            />
          </div>

          {/* Right: Debug Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card Collection Simulator */}
            <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                {t('avatarLabSimulateTitle')}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                {t('avatarLabSimulateHint')}
              </p>
              <div className="space-y-2">
                {ALL_CARDS.map(cardId => {
                  const isCollected = collectedCards.includes(cardId);
                  const [stage, type] = cardId.split('_');

                  return (
                    <button
                      key={cardId}
                      onClick={() => toggleCard(cardId)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        isCollected
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isCollected
                              ? 'border-green-500 bg-green-500'
                              : 'border-slate-300'
                          }`}
                        >
                          {isCollected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {type?.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t('avatarLabCardStage', { stage })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 text-center">
                  {t('avatarLabCardsCollected', {
                    count: collectedCards.length,
                    total: ALL_CARDS.length,
                  })}
                </p>
              </div>
            </div>

            {/* Info Panel */}
            <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                {t('avatarLabHowItWorksTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem5')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{t('avatarLabHowItWorksItem6')}</span>
                </li>
              </ul>
            </div>

            {/* Base Image Preview */}
            <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                {t('avatarLabBaseTitle')}
              </h3>
              <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-sky-50 to-violet-50 flex items-center justify-center overflow-hidden">
                <Image
                  src="/asset/Mirae_Icon1.png"
                  alt="Base Mirae"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                {t('avatarLabBaseCaption')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
