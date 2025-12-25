'use client';

import React from 'react';
import { ChatBubble } from './shared/ChatBubble';
import { OptionButton } from './shared/OptionButton';

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
    <div className="flex flex-col gap-4">
      {/* Mirae welcome message */}
      <ChatBubble sender="mirae">
        <div className="space-y-3">
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
      </ChatBubble>

      {/* Option buttons */}
      <div className="flex gap-3 justify-end">
        <OptionButton 
          onClick={onContinue}
          variant="primary"
        >
          Sure, let's go
        </OptionButton>
        <OptionButton 
          onClick={() => setShowDetails(true)}
          variant="secondary"
        >
          What kind of questions?
        </OptionButton>
      </div>

      {/* Details expansion */}
      {showDetails && (
        <>
          <ChatBubble sender="mirae">
            <div className="space-y-2">
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
          </ChatBubble>
          
          <div className="flex gap-3 justify-end">
            <OptionButton onClick={onContinue} variant="primary">
              Okay, sounds good
            </OptionButton>
            <OptionButton onClick={onSkipToChat} variant="ghost">
              I'll just talk instead
            </OptionButton>
          </div>
        </>
      )}
    </div>
  );
};

