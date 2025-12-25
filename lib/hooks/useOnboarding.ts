'use client';

import { useState, useCallback } from 'react';
import { OnboardingState, StudentContextData, Keyword } from '@/lib/types/onboarding.types';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    currentPhase: 'welcome',
    studentData: {
      yearLevel: null,
      courseSelectionStatus: null,
      currentFeeling: null
    },
    uploadedFiles: [],
    extractedKeywords: [],
    conversationHistory: [],
    hasSkippedUpload: false
  });

  const advancePhase = useCallback((nextPhase: OnboardingState['currentPhase']) => {
    setState(prev => ({ ...prev, currentPhase: nextPhase }));
  }, []);

  const setStudentContext = useCallback((data: StudentContextData) => {
    setState(prev => ({
      ...prev,
      studentData: { ...prev.studentData, ...data }
    }));
    advancePhase('upload');
  }, [advancePhase]);

  const setStudentContextData = useCallback((data: Partial<StudentContextData>) => {
    setState(prev => ({
      ...prev,
      studentData: { ...prev.studentData, ...data }
    }));
  }, []);

  const setUploadedFiles = useCallback((files: File[]) => {
    setState(prev => ({ ...prev, uploadedFiles: files }));
  }, []);

  const skipUpload = useCallback(() => {
    setState(prev => ({ ...prev, hasSkippedUpload: true }));
    advancePhase('start');
  }, [advancePhase]);

  const setKeywords = useCallback((keywords: string[]) => {
    const keywordObjects: Keyword[] = keywords.map(text => ({
      id: Math.random().toString(36),
      text,
      isEditable: true,
      isRemoved: false
    }));
    setState(prev => ({ ...prev, extractedKeywords: keywordObjects }));
  }, []);

  const completeOnboarding = useCallback(() => {
    // Save to localStorage (keywords only, no files)
    const dataToSave = {
      yearLevel: state.studentData.yearLevel,
      keywords: state.extractedKeywords
        .filter(k => !k.isRemoved)
        .map(k => k.text),
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('mirae_user_data', JSON.stringify(dataToSave));
    
    // Clear uploaded files from memory
    setState(prev => ({ ...prev, uploadedFiles: [] }));
  }, [state]);

  return {
    state,
    advancePhase,
    setStudentContext,
    setStudentContextData,
    setUploadedFiles,
    skipUpload,
    setKeywords,
    completeOnboarding
  };
}
