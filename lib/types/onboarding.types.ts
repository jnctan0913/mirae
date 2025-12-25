export interface OnboardingState {
  currentPhase: 'welcome' | 'context' | 'upload' | 'keywords' | 'start';
  studentData: {
    yearLevel: 'year1' | 'year2' | 'year3' | null;
    currentSemester: 'sem1' | 'sem2' | null;
    courseSelectionStatus: 'picked' | 'deciding' | 'reconsidering' | null;
    currentFeeling: string | null;
  };
  uploadedFiles: File[];
  extractedKeywords: Keyword[];
  conversationHistory: Message[];
  hasSkippedUpload: boolean;
}

export interface Keyword {
  id: string;
  text: string;
  isEditable: boolean;
  isRemoved: boolean;
}

export interface Message {
  id: string;
  sender: 'mirae' | 'student';
  content: string;
  timestamp: Date;
  type: 'text' | 'options' | 'upload';
  options?: OptionButton[];
}

export interface OptionButton {
  id: string;
  label: string;
  value: string;
  action: () => void;
}

export interface StudentContextData {
  yearLevel: 'year1' | 'year2' | 'year3';
  currentSemester?: 'sem1' | 'sem2';
  courseSelectionStatus: 'picked' | 'deciding' | 'reconsidering';
  currentFeeling?: string;
}
