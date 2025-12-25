'use client';

import React from 'react';

interface WelcomePhaseProps {
  onContinue: () => void;
  onSkipToChat: () => void;
}

export const WelcomePhase: React.FC<WelcomePhaseProps> = ({
  onContinue,
  onSkipToChat
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <>
      {/* Mirae welcome message */}
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
          <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
          <div className="text-sm sm:text-base leading-relaxed space-y-3">
            <p className="text-lg">
              Hi! Welcome to Mirae—your private space to think about school and paths. 🌱
            </p>
            <p className="text-gray-600">
              No one else can see what we talk about here. Not teachers, 
              not parents, not friends. Just you and me.
            </p>
            <p>
              Before we start, I'd love to know a little about where you're at 
              right now. Cool if I ask a few quick questions?
            </p>
          </div>
        </div>
      </div>

      {/* Option buttons */}
      <div className="flex gap-3 justify-end flex-wrap">
        <button
          onClick={onContinue}
          className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
        >
          Sure, let's go
        </button>
        <button
          onClick={() => setShowDetails(true)}
          className="rounded-full px-4 py-2 text-sm bg-white/90 border-2 border-[#C7B9FF] text-slate-800 font-medium shadow-md hover:bg-white transition-all"
        >
          What kind of questions?
        </button>
      </div>

      {/* Details expansion */}
      {showDetails && (
        <>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-md bg-white/95 border-2 border-[#9BCBFF]/40 text-slate-800 rounded-tl-sm">
              <p className="text-xs font-semibold text-[#9BCBFF] mb-1">Mirae</p>
              <div className="text-sm sm:text-base leading-relaxed space-y-2">
                <p>Nothing scary! Just things like:</p>
                <ul className="list-none space-y-1 ml-2">
                  <li>• What year you're in</li>
                  <li>• What you're thinking about lately</li>
                  <li>• If you have any test results or notes you want to share (totally optional!)</li>
                </ul>
                <p className="mt-3">
                  It helps me understand how to be useful to you.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              onClick={onContinue}
              className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 font-medium shadow-md hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF] transition-all"
            >
              Okay, sounds good
            </button>
            <button
              onClick={onSkipToChat}
              className="rounded-full px-4 py-2 text-sm bg-transparent border-2 border-gray-300 text-gray-600 font-medium shadow-md hover:border-gray-400 transition-all"
            >
              I'll just talk instead
            </button>
          </div>
        </>
      )}
    </>
  );
};

