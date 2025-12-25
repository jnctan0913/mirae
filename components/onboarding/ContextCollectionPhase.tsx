'use client';

import React from 'react';
import { StudentContextData } from '@/lib/types/onboarding.types';

interface ContextCollectionPhaseProps {
  onComplete: (data: StudentContextData) => void;
}

export const ContextCollectionPhase: React.FC<ContextCollectionPhaseProps> = ({
  onComplete
}) => {
  const [step, setStep] = React.useState<'year' | 'status' | 'feeling'>('year');
  const [data, setData] = React.useState<Partial<StudentContextData>>({});

  // Notify parent about input requirements
  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('onboardingInputState', { 
      detail: { 
        needsInput: step === 'feeling',
        placeholder: step === 'feeling' ? "Share what's on your mind..." : "Share a thought, or skip if you like"
      } 
    }));
  }, [step]);

  // Listen for input submission from the main input field
  React.useEffect(() => {
    if (step !== 'feeling') return;

    const handleSubmit = (e: CustomEvent) => {
      const feeling = e.detail;
      if (feeling && feeling.trim()) {
        handleFreeTextSubmit(feeling);
      }
    };

    window.addEventListener('onboardingSubmit', handleSubmit as EventListener);
    return () => window.removeEventListener('onboardingSubmit', handleSubmit as EventListener);
  }, [step, data]);

  const handleYearSelect = (year: 'year1' | 'year2' | 'year3') => {
    setData(prev => ({ ...prev, yearLevel: year }));
    setStep('status');
  };

  const handleStatusSelect = (status: 'picked' | 'deciding' | 'reconsidering') => {
    setData(prev => ({ ...prev, courseSelectionStatus: status }));
    
    // If they picked "reconsidering" or "deciding", ask about feelings
    if (status === 'reconsidering' || status === 'deciding') {
      setStep('feeling');
    } else {
      // If "picked" and feeling good, skip to next phase
      onComplete({ ...data, courseSelectionStatus: status } as StudentContextData);
    }
  };

  const handleFreeTextSubmit = (feeling: string) => {
    onComplete({ ...data, currentFeeling: feeling } as StudentContextData);
  };

  return (
    <>
      {/* Step 1: Year Level */}
      {step === 'year' && (
        <>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
              <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
              <p className="text-sm sm:text-base leading-relaxed">
                First—what year are you in right now?
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              onClick={() => handleYearSelect('year1')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Year 1 (고1)
            </button>
            <button
              onClick={() => handleYearSelect('year2')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Year 2 (고2)
            </button>
            <button
              onClick={() => handleYearSelect('year3')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Year 3 (고3)
            </button>
          </div>
        </>
      )}

      {/* Step 2: Course Selection Status */}
      {step === 'status' && (
        <>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm">
              <p className="text-sm sm:text-base leading-relaxed">
                Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
              <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
              <p className="text-sm sm:text-base leading-relaxed">
                Got it—Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}. 
                That's when a lot starts to feel real, huh?
                <br/><br/>
                Have you already picked your courses for this year, 
                or are you still thinking about it?
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              onClick={() => handleStatusSelect('picked')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Already picked
            </button>
            <button
              onClick={() => handleStatusSelect('deciding')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Still deciding
            </button>
            <button
              onClick={() => handleStatusSelect('reconsidering')}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Picked, but having second thoughts
            </button>
          </div>
        </>
      )}

      {/* Step 3: Current Feeling (conditional) */}
      {step === 'feeling' && (
        <>
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-gradient-to-br from-[#E5E0FF] to-[#F4E4FF] border-2 border-[#C7B9FF]/60 text-slate-800 rounded-tr-sm">
              <p className="text-sm sm:text-base leading-relaxed">
                {data.courseSelectionStatus === 'deciding' ? 'Still deciding' : 'Picked, but having second thoughts'}
              </p>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
              <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
              <p className="text-sm sm:text-base leading-relaxed">
                {data.courseSelectionStatus === 'deciding' 
                  ? "That makes sense—it's a big decision. What's making it hard to decide? Is there something specific you're stuck on, or just a general 'too many options' feeling?"
                  : "Ah, the second-guessing... I hear you. What's making you wonder if you chose right? Did something happen, or is it more of a nagging feeling?"
                }
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};
