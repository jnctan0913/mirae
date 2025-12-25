'use client';

import React from 'react';
import { ChatBubble } from './shared/ChatBubble';
import { KeywordTag } from './shared/KeywordTag';
import { OptionButton } from './shared/OptionButton';

interface KeywordReviewPhaseProps {
  extractedKeywords: string[];
  onComplete: (finalKeywords: string[]) => void;
}

export const KeywordReviewPhase: React.FC<KeywordReviewPhaseProps> = ({
  extractedKeywords,
  onComplete
}) => {
  const [keywords, setKeywords] = React.useState(
    extractedKeywords.map(text => ({
      id: Math.random().toString(36),
      text,
      isRemoved: false
    }))
  );

  const handleRemoveKeyword = (id: string) => {
    setKeywords(prev =>
      prev.map(kw => kw.id === id ? { ...kw, isRemoved: true } : kw)
    );
  };

  const handleConfirm = () => {
    const finalKeywords = keywords
      .filter(kw => !kw.isRemoved)
      .map(kw => kw.text);
    onComplete(finalKeywords);
  };

  return (
    <div className="flex flex-col gap-4 p-6 max-w-2xl mx-auto">
      <ChatBubble sender="mirae">
        Thanks for sharing! Give me a sec to look through these... 🔍
      </ChatBubble>

      {/* Loading animation - show for 2-3 seconds */}
      <div className="flex justify-center py-4">
        <div className="animate-pulse text-gray-400">Analyzing...</div>
      </div>

      <ChatBubble sender="mirae">
        Okay, I noticed a few things that stood out:
      </ChatBubble>

      {/* Keyword tags */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          📝 What I noticed:
        </h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map(keyword => (
            <KeywordTag
              key={keyword.id}
              text={keyword.text}
              isRemoved={keyword.isRemoved}
              onRemove={() => handleRemoveKeyword(keyword.id)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          These are just things that caught my eye—feel free to remove 
          anything that doesn't feel right!
        </p>
      </div>

      <ChatBubble sender="mirae">
        Cool! These will help me understand you better as we talk.
        <br/>
        <span className="text-sm text-gray-500">
          (You can always change these later if you want.)
        </span>
        <br/><br/>
        Ready to start exploring?
      </ChatBubble>

      <div className="flex justify-end">
        <OptionButton onClick={handleConfirm} variant="primary">
          Let's go! ✨
        </OptionButton>
      </div>
    </div>
  );
};

