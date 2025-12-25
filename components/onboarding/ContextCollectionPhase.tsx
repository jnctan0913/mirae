'use client';

import React from 'react';
import { ChatBubble } from './shared/ChatBubble';
import { OptionButton } from './shared/OptionButton';
import { StudentContextData } from '@/lib/types/onboarding.types';

interface ContextCollectionPhaseProps {
  onComplete: (data: StudentContextData) => void;
}

export const ContextCollectionPhase: React.FC<ContextCollectionPhaseProps> = ({
  onComplete
}) => {
  const [step, setStep] = React.useState<'year' | 'status' | 'feeling'>('year');
  const [data, setData] = React.useState<Partial<StudentContextData>>({});

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
    <div className="flex flex-col gap-4">
      {/* Step 1: Year Level */}
      {step === 'year' && (
        <>
          <ChatBubble sender="mirae">
            First—what year are you in right now?
          </ChatBubble>
          <div className="flex gap-3 justify-end flex-wrap">
            <OptionButton onClick={() => handleYearSelect('year1')}>
              Year 1 (고1)
            </OptionButton>
            <OptionButton onClick={() => handleYearSelect('year2')}>
              Year 2 (고2)
            </OptionButton>
            <OptionButton onClick={() => handleYearSelect('year3')}>
              Year 3 (고3)
            </OptionButton>
          </div>
        </>
      )}

      {/* Step 2: Course Selection Status */}
      {step === 'status' && (
        <>
          <ChatBubble sender="student">
            Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}
          </ChatBubble>
          <ChatBubble sender="mirae">
            Got it—Year {data.yearLevel === 'year1' ? '1' : data.yearLevel === 'year2' ? '2' : '3'}. 
            That's when a lot starts to feel real, huh?
            <br/><br/>
            Have you already picked your courses for this year, 
            or are you still thinking about it?
          </ChatBubble>
          <div className="flex gap-3 justify-end flex-wrap">
            <OptionButton onClick={() => handleStatusSelect('picked')}>
              Already picked
            </OptionButton>
            <OptionButton onClick={() => handleStatusSelect('deciding')}>
              Still deciding
            </OptionButton>
            <OptionButton onClick={() => handleStatusSelect('reconsidering')}>
              Picked, but having second thoughts
            </OptionButton>
          </div>
        </>
      )}

      {/* Step 3: Current Feeling (conditional) */}
      {step === 'feeling' && (
        <>
          <ChatBubble sender="student">
            {data.courseSelectionStatus === 'deciding' ? 'Still deciding' : 'Picked, but having second thoughts'}
          </ChatBubble>
          <ChatBubble sender="mirae">
            {data.courseSelectionStatus === 'deciding' 
              ? "That makes sense—it's a big decision. What's making it hard to decide? Is there something specific you're stuck on, or just a general 'too many options' feeling?"
              : "Ah, the second-guessing... I hear you. What's making you wonder if you chose right? Did something happen, or is it more of a nagging feeling?"
            }
          </ChatBubble>
          
          {/* Free text input */}
          <div className="flex gap-2 items-end">
            <input
              type="text"
              placeholder="Share what's on your mind..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleFreeTextSubmit(e.currentTarget.value);
                }
              }}
            />
            <button 
              className="px-6 py-3 bg-gradient-to-r from-pink-300 to-orange-300 rounded-2xl text-white font-medium"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input?.value.trim()) {
                  handleFreeTextSubmit(input.value);
                }
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

