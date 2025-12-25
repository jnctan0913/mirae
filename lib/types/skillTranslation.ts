// lib/types/skillTranslation.ts

export type ConversationPhase = 'recap' | 'articulation' | 'patterns' | 'fit-fear' | 'closing';

export interface UserContext {
  name: string;
  courses: string[];
  keywords?: string[];
  strengths?: {
    energizers?: string[];
    joys?: string[];
  };
  interests?: string[];
}

export interface ConversationTurn {
  turnNumber: number;
  phase: ConversationPhase;
  trigger: string[];
  miraeMessage: string | ((context: UserContext) => string);
  expectedUserPatterns: string[];
  alternatives?: {
    vague?: string | ((context: UserContext) => string);
    question?: string | ((context: UserContext) => string);
  };
  systemActions?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  source?: 'openai' | 'fallback';
}

export interface SkillTranslationState {
  messages: ChatMessage[];
  currentTurn: number;
  currentPhase: ConversationPhase;
  extractedSkills: Map<string, string[]>;
  coursesDiscussed: Set<string>;
  useFallback: boolean;
}

