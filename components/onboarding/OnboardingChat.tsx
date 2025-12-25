'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { withBasePath } from '@/lib/basePath';
import { WelcomePhase } from './WelcomePhase';
import { ContextCollectionPhase } from './ContextCollectionPhase';
import { DocumentUploadPhase } from './DocumentUploadPhase';
import { KeywordReviewPhase } from './KeywordReviewPhase';
import { JourneyStartPhase } from './JourneyStartPhase';

// Placeholder for AI keyword extraction - to be implemented with actual API
async function extractKeywordsFromDocuments(): Promise<{ keywords: string[]; confidence: number }> {
  // TODO: Implement actual AI keyword extraction
  // For now, return placeholder keywords
  return {
    keywords: ['Curious explorer', 'Empathy-driven', 'Visual thinker'],
    confidence: 0.8
  };
}

interface OnboardingChatProps {
  onComplete: () => void;
}

export const OnboardingChat: React.FC<OnboardingChatProps> = ({ onComplete }) => {
  const router = useRouter();
  const {
    state,
    advancePhase,
    setStudentContext,
    setUploadedFiles,
    skipUpload,
    setKeywords,
    completeOnboarding
  } = useOnboarding();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleUploadComplete = async (files: File[]) => {
    setUploadedFiles(files);
    setIsProcessing(true);

    try {
      const { keywords } = await extractKeywordsFromDocuments(files);
      setKeywords(keywords);
      advancePhase('keywords');
    } catch (error) {
      console.error('Failed to process uploads:', error);
      // Fallback: skip to next phase without keywords
      skipUpload();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJourneyStart = () => {
    const user = getUser();
    if (!user) {
      router.push(withBasePath('/login'));
      return;
    }
    completeOnboarding();
    onComplete();
  };

  return (
    <div className="space-y-4">
      {state.currentPhase === 'welcome' && (
        <WelcomePhase
          onContinue={() => advancePhase('context')}
          onSkipToChat={() => {
            skipUpload();
            handleJourneyStart();
          }}
        />
      )}

      {state.currentPhase === 'context' && (
        <ContextCollectionPhase onComplete={setStudentContext} />
      )}

      {state.currentPhase === 'upload' && (
        <DocumentUploadPhase
          onUploadComplete={handleUploadComplete}
          onSkip={skipUpload}
        />
      )}

      {state.currentPhase === 'keywords' && (
        <KeywordReviewPhase
          extractedKeywords={state.extractedKeywords.map(k => k.text)}
          onComplete={(finalKeywords) => {
            setKeywords(finalKeywords);
            advancePhase('start');
          }}
        />
      )}

      {state.currentPhase === 'start' && (
        <JourneyStartPhase onBegin={handleJourneyStart} />
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Processing your files...</p>
          </div>
        </div>
      )}
    </div>
  );
};
