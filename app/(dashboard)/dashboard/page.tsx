'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ChevronLeft, ChevronRight, Sprout } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import Image from 'next/image';
import { MiraeCharacter, type EquippedAccessories } from '@/components/MiraeCharacterEvolution';
import { getUserProfile } from '@/lib/userProfile';
import { withBasePath } from '@/lib/basePath';

const stages = [
  { id: 0, nameKey: 'stage0Name', descriptionKey: 'stage0Description', path: '/stage0', letter: 'S', promptKey: 'journeyPromptStrengths' },
  { id: 1, nameKey: 'stage1Name', descriptionKey: 'stage1Description', path: '/stage1', letter: 'C', promptKey: 'journeyPromptCuriosity' },
  { id: 2, nameKey: 'stage2Name', descriptionKey: 'stage2Description', path: '/stage2', letter: 'O', promptKey: 'journeyPromptOptions' },
  { id: 3, nameKey: 'stage3Name', descriptionKey: 'stage3Description', path: '/stage3', letter: 'P', promptKey: 'journeyPromptProof' },
  { id: 4, nameKey: 'stage4Name', descriptionKey: 'stage4Description', path: '/stage4', letter: 'E', promptKey: 'journeyPromptEvolve' },
  { id: 5, nameKey: 'stage5Name', descriptionKey: 'stage5Description', path: '/collection', letter: '+', promptKey: 'journeyPromptStoryboard' },
];

const stageSubtitles: Record<number, string> = {
  0: 'Discover your unique strengths and patterns.',
  1: "Let's explore safely. No commitments needed.",
  2: 'Explore courses that keep your options open.',
  3: 'Reflect on what resonates with you.',
  4: 'Refine your path based on your experiences.',
  5: 'Visualize and celebrate your journey.',
};

const academicStages = [
  { id: 'pre-year-1', label: 'Pre-Year 1' },
  { id: 'year-1-sem-1', label: 'Year 1 Semester 1' },
  { id: 'year-1-sem-2', label: 'Year 1 Semester 2' },
  { id: 'year-2-sem-1', label: 'Year 2 Semester 1' },
  { id: 'year-2-sem-2', label: 'Year 2 Semester 2' },
  { id: 'year-3-sem-1', label: 'Year 3 Semester 1' },
  { id: 'year-3-sem-2', label: 'Year 3 Semester 2' },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { progress, userId, setUserId } = useUserStore();
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});
  const [cardCount, setCardCount] = useState(0);
  const [academicStage, setAcademicStage] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push(withBasePath('/login'));
      return;
    }

    if (userId !== user.id) {
      setUserId(user.id);
    }

    const profile = getUserProfile();

    if (!profile.onboardingCompleted) {
      router.push(withBasePath('/onboarding'));
    }

    if (profile.avatar?.equippedAccessories) {
      setEquippedAccessories(profile.avatar.equippedAccessories);
    }

    if (profile.collection?.cards) {
      const unlockedCount = profile.collection.cards.filter((card) =>
        Boolean((card as { unlocked?: boolean }).unlocked)
      ).length;
      setCardCount(unlockedCount);
    }

    if (typeof profile.academicStage === 'string') {
      setAcademicStage(profile.academicStage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, setUserId, userId]);

  // Listen for storage changes to update accessories in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const storedProfile = getUserProfile();
      if (storedProfile.avatar?.equippedAccessories) {
        setEquippedAccessories(storedProfile.avatar.equippedAccessories);
      }

      if (storedProfile.collection?.cards) {
        const unlockedCount = storedProfile.collection.cards.filter((card) =>
          Boolean((card as { unlocked?: boolean }).unlocked)
        ).length;
        setCardCount(unlockedCount);
      }

      if (typeof storedProfile.academicStage === 'string') {
        setAcademicStage(storedProfile.academicStage);
      }
    };

    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (same-tab updates)
    window.addEventListener('miraeAccessoriesUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('miraeAccessoriesUpdated', handleStorageChange);
    };
  }, []);

  const getStageStatus = (stageId: number) => {
    const allowEvolvePreview = stageId === 4;
    if (progress[`stage${stageId}Complete` as keyof typeof progress]) return 'complete';
    if (stageId === progress.currentStage) return 'current';
    if (stageId < progress.currentStage || allowEvolvePreview) return 'available';
    return 'locked';
  };

  void Object.values(progress).filter((v) => typeof v === 'boolean' && v === true).length;
  const [viewingStageId, setViewingStageId] = useState(progress.currentStage);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const viewingStage = stages.find((stage) => stage.id === viewingStageId);

  // Update viewing stage when progress changes or stage query param is present
  useEffect(() => {
    const stageParam = searchParams.get('stage');
    if (stageParam !== null) {
      const stageId = parseInt(stageParam, 10);
      if (!isNaN(stageId) && stageId >= 0 && stageId < stages.length) {
        setViewingStageId(stageId);
        return;
      }
    }
    setViewingStageId(progress.currentStage);
  }, [progress.currentStage, searchParams]);

  const canNavigateToPrevious = viewingStageId > 0;
  const canNavigateToNext = viewingStageId < stages.length - 1;

  const viewingStageStatus = getStageStatus(viewingStageId);
  const isViewingStageLocked = viewingStageStatus === 'locked';
  const activeAcademicStage = academicStages.find((stage) => stage.id === academicStage);

  const handlePreviousStage = () => {
    if (canNavigateToPrevious) {
      setSlideDirection('right');
      setTimeout(() => {
        setViewingStageId(viewingStageId - 1);
        setSlideDirection(null);
      }, 150);
    }
  };

  const handleNextStage = () => {
    if (canNavigateToNext) {
      setSlideDirection('left');
      setTimeout(() => {
        setViewingStageId(viewingStageId + 1);
        setSlideDirection(null);
      }, 150);
    }
  };

  return (
    <div
      className="relative h-screen px-6 pt-20 pb-6 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/asset/Background.png')" }}
    >
      <div className="max-w-6xl mx-auto h-full flex flex-col space-y-4">
        {/* Welcome Header */}
        <div className="text-center space-y-1 flex-shrink-0">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
            Hi, welcome back <Sprout className="w-7 h-7 text-green-500" />
          </h1>
          <p className="text-base text-slate-600">
            {t('journeySubtitle')}
          </p>
        </div>

        {/* Journey Map */}
        <div className="relative flex-shrink-0">
          {/* Mirae Character */}
          <button
            onClick={() => router.push(withBasePath('/collection'))}
            className="absolute -top-12 right-20 z-10 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
            title="View your collection"
            type="button"
          >
            <div className="floating pointer-events-none">
              <MiraeCharacter
                key={JSON.stringify(equippedAccessories)}
                cardCount={cardCount}
                recentCardTypes={[]}
                size={150}
                equippedAccessories={equippedAccessories}
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
          </button>

          {/* Journey Path */}
          <div className="relative py-6 px-6">
            {/* Gradient Path Background - matching SCOPE+ colors */}
            <div className="absolute inset-0 h-1.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#9DD5F5] via-[#A8D5BA] via-[#F4D675] via-[#F5B7A8] to-[#FFB6D9] rounded-full opacity-30" />

            {/* Stage Nodes */}
            <div className="relative flex justify-between items-center">
              {stages.map((stage) => {
                const status = getStageStatus(stage.id);
                const isCurrent = stage.id === progress.currentStage;
                const isViewing = stage.id === viewingStageId;

                // Stage-specific colors matching SCOPE+ framework
                const stageColors = [
                  { bg: 'from-[#9DD5F5] to-[#7EC4F0]', ring: 'ring-[#9DD5F5]/60' }, // S - Lighter Blue
                  { bg: 'from-[#A8D5BA] to-[#8DC9B8]', ring: 'ring-[#A8D5BA]/60' }, // C - Mint
                  { bg: 'from-[#F4D675] to-[#E8D068]', ring: 'ring-[#F4D675]/60' }, // O - Gold
                  { bg: 'from-[#F5B7A8] to-[#F2A896]', ring: 'ring-[#F5B7A8]/60' }, // P - Peach
                  { bg: 'from-[#B19CD9] to-[#A78BCA]', ring: 'ring-[#B19CD9]/60' }, // E - Purple
                  { bg: 'from-[#FFB6D9] to-[#FF9EC7]', ring: 'ring-[#FFB6D9]/60' }, // + - Pink (Role Roulette)
                ];
                const stageColor = stageColors[stage.id];

                return (
                  <div key={stage.id} className="flex flex-col items-center space-y-1">
                    {/* Stage Circle */}
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 shadow-md cursor-pointer
                        ${status === 'complete' ? `bg-gradient-to-br ${stageColor.bg} text-white` : ''}
                        ${isCurrent && !isViewing ? `bg-gradient-to-br ${stageColor.bg} text-white ring-3 ring-white/50 scale-105` : ''}
                        ${isViewing ? `bg-gradient-to-br ${stageColor.bg} text-white ring-4 ${stageColor.ring} scale-110` : ''}
                        ${status === 'locked' ? 'bg-white/60 text-slate-400' : ''}
                        ${status === 'available' && !isCurrent && !isViewing ? 'bg-white/80 text-slate-600 hover:scale-105' : ''}
                      `}
                      onClick={() => {
                        if (status !== 'locked' && (stage.id <= progress.currentStage || status === 'complete')) {
                          setViewingStageId(stage.id);
                        }
                      }}
                    >
                      {stage.letter}
                    </div>

                    {/* Stage Label */}
                    <div className="text-center">
                      <p className={`text-xs font-semibold transition-colors ${isViewing ? 'text-slate-800' : isCurrent ? 'text-slate-700' : 'text-slate-600'}`}>
                        {stage.letter === 'S' ? 'Strength' :
                         stage.letter === 'C' ? 'Curiosity' :
                         stage.letter === 'O' ? 'Options' :
                         stage.letter === 'P' ? 'Proof' :
                         stage.letter === 'E' ? 'Evolve' : '+'}
                      </p>
                      {isViewing && (
                        <p className="text-[10px] text-[#9BCBFF] font-medium animate-fade-in">{t('journeyCurrent')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Stage Card */}
        {viewingStage && (
          <div className="w-[64.8rem] mx-auto flex-1 min-h-0 relative flex items-center gap-4">
            {/* Left Navigation Button */}
            <button
              onClick={handlePreviousStage}
              disabled={!canNavigateToPrevious}
              className={`p-3 rounded-full transition shadow-md flex-shrink-0 ${
                canNavigateToPrevious
                  ? 'bg-white/70 hover:bg-white cursor-pointer'
                  : 'bg-white/30 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            {/* Main Card Container */}
            <div className="flex-1 h-full flex flex-col gap-3">
              {/* Card */}
              <div className="glass-card rounded-3xl p-8 flex-1 flex flex-col shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none soft-glow rounded-3xl" />

                {/* Locked Overlay */}
                {isViewingStageLocked && (
                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <Lock className="w-16 h-16 text-white mx-auto" />
                      <p className="text-xl font-bold text-white">{t('locked')}</p>
                      <p className="text-sm text-white/80">Complete previous stages to unlock</p>
                    </div>
                  </div>
                )}

                <div
                  className={`relative flex-1 transition-all duration-300 ${
                    slideDirection === 'left' ? 'translate-x-[-100%] opacity-0' :
                    slideDirection === 'right' ? 'translate-x-[100%] opacity-0' :
                    'translate-x-0 opacity-100'
                  }`}
                >
                  {viewingStageId === 0 ? (
                    /* Grid Layout for Stage 0 (Strength Discovery) */
                    <div className="flex h-full gap-6">
                      {/* Left Side - 3/5 width with 2 stacked grids */}
                      <div className="flex flex-col gap-4" style={{ width: '60%' }}>
                        {/* Top Grid - Title and Details */}
                        <div className="flex-1 space-y-4 pt-14">
                          {/* Stage Header */}
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#9DD5F5] to-[#7EC4F0] flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                              {viewingStage?.letter}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-slate-800">
                                {viewingStage && t(viewingStage.nameKey)}
                              </h2>
                            </div>
                          </div>

                          {/* Stage Question */}
                          <p className="text-xl text-slate-700 font-medium">
                            {viewingStage && t(viewingStage.promptKey)}
                          </p>

                          {/* Subtitle */}
                          <p className="text-base text-slate-600">
                            {t('stage0Subtitle')}
                          </p>
                        </div>

                        {/* Bottom Grid - Button centered */}
                        <div className="flex items-center justify-center flex-1">
                          <button
                            onClick={() => {
                              if (viewingStage && !isViewingStageLocked) {
                                router.push(withBasePath(viewingStage.path));
                              } else {
                              }
                            }}
                            disabled={isViewingStageLocked}
                            className={`py-4 px-12 rounded-full text-lg font-semibold transition-all ${
                              isViewingStageLocked
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'soft-button hover:scale-105 active:scale-95'
                            }`}
                            type="button"
                          >
                            Start exploring
                          </button>
                        </div>
                      </div>

                      {/* Right Side - 2/5 width with Image */}
                      <div className="flex items-center justify-center" style={{ width: '40%' }}>
                        <Image
                          src="/asset/Stage_strength.png"
                          alt="Strength Discovery"
                          width={400}
                          height={300}
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Grid Layout for Other Stages */
                    <div className="flex h-full gap-6">
                      {/* Left Side - 3/5 width with 2 stacked grids */}
                      <div className="flex flex-col gap-4" style={{ width: '60%' }}>
                        {/* Top Grid - Title and Details */}
                        <div className="flex-1 space-y-4 pt-14">
                          {/* Stage Header */}
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                              viewingStageId === 1 ? 'from-[#A8D5BA] to-[#8DC9B8]' :
                              viewingStageId === 2 ? 'from-[#F4D675] to-[#E8D068]' :
                              viewingStageId === 3 ? 'from-[#F5B7A8] to-[#F2A896]' :
                              viewingStageId === 4 ? 'from-[#B19CD9] to-[#A78BCA]' :
                              'from-[#FFB6D9] to-[#FF9EC7]'
                            } flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                              {viewingStage?.letter}
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-slate-800">
                                {viewingStage && t(viewingStage.nameKey)}
                              </h2>
                            </div>
                          </div>

                          {/* Stage Question */}
                          <p className="text-xl text-slate-700 font-medium">
                            {viewingStage && t(viewingStage.promptKey)}
                          </p>

                          {/* Subtitle */}
                          <p className="text-base text-slate-600">
                            {viewingStage && stageSubtitles[viewingStage.id]}
                          </p>
                        </div>

                        {/* Bottom Grid - Button centered */}
                        <div className="flex items-center justify-center flex-1">
                          <button
                            onClick={() => {
                              if (viewingStage && !isViewingStageLocked) {
                                router.push(withBasePath(viewingStage.path));
                              } else {
                              }
                            }}
                            disabled={isViewingStageLocked}
                            className={`py-4 px-12 rounded-full text-lg font-semibold transition-all ${
                              isViewingStageLocked
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'soft-button hover:scale-105 active:scale-95'
                            }`}
                            type="button"
                          >
                            Start exploring
                          </button>
                        </div>
                      </div>

                      {/* Right Side - 2/5 width with Image */}
                      <div className="flex items-center justify-center" style={{ width: '40%' }}>
                        {viewingStageId === 1 && (
                          <Image
                            src="/asset/stage_curiosity.png"
                            alt="Curiosity"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        )}
                        {viewingStageId === 2 && (
                          <Image
                            src="/asset/Stage_option.png"
                            alt="Options"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        )}
                        {viewingStageId === 3 && (
                          <Image
                            src="/asset/Stage_proof.png"
                            alt="Proof"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        )}
                        {viewingStageId === 4 && (
                          <Image
                            src="/asset/stage_evolve.png"
                            alt="Evolve"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        )}
                        {viewingStageId === 5 && (
                          <Image
                            src="/asset/stage_plus.png"
                            alt="Storyboard"
                            width={400}
                            height={300}
                            className="object-contain"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Dots Below Card */}
              <div className="flex justify-center gap-2">
                {stages.map((stage, index) => {
                  const dotColors = [
                    'bg-[#9DD5F5]', // S - Lighter Blue
                    'bg-[#A8D5BA]', // C - Mint
                    'bg-[#F4D675]', // O - Gold
                    'bg-[#F5B7A8]', // P - Peach
                    'bg-[#B19CD9]', // E - Purple
                    'bg-[#FFB6D9]', // + - Pink (Role Roulette)
                  ];
                  return (
                    <div
                      key={stage.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === viewingStageId ? dotColors[index] : 'bg-slate-300'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right Navigation Button */}
            <button
              onClick={handleNextStage}
              disabled={!canNavigateToNext}
              className={`p-3 rounded-full transition shadow-md flex-shrink-0 ${
                canNavigateToNext
                  ? 'bg-white/70 hover:bg-white cursor-pointer'
                  : 'bg-white/30 cursor-not-allowed opacity-50'
              }`}
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-24 z-30 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-lg">
        <p className="text-[10px] uppercase tracking-wide text-slate-500">Academic placement</p>
        <p className="text-sm font-semibold text-slate-800">
          {activeAcademicStage ? activeAcademicStage.label : 'Not set'}
        </p>
      </div>
    </div>
  );
}
