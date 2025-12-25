// lib/types/skillTranslation.ts

export type ConversationPhase = 'recap' | 'articulation' | 'patterns' | 'fit-fear' | 'closing' |
                                'exploration' | 'possibility_mapping' | 'experience_recap' | 
                                'expectation_vs_reality' | 'pressure_acknowledgment' | 'yours_vs_theirs';

export type YearLevel = 1 | 2 | 3;

export type SelectionStatus = 'not_started' | 'in_progress' | 'completed';

export type TriggerReason = 'exploration' | 'reflection' | 'doubt' | 'pressure' | 'anxiety' | 'general';

export type ConversationType = 
  | 'year1_pre_selection'      // Year 1, before choosing courses
  | 'year1_post_selection'     // Year 1, after choosing courses
  | 'year2_reconsidering'      // Year 2+, reconsidering choices
  | 'year3_pressure'           // Year 3, external pressure
  | 'general_reflection';      // Fallback

export interface UserContext {
  name: string;
  courses: string[];
  keywords?: string[];
  strengths?: {
    energizers?: string[];
    joys?: string[];
  };
  interests?: string[];
  
  // NEW: Context detection fields
  yearLevel: YearLevel;
  selectionStatus: SelectionStatus;
  currentSemester?: string;  // e.g., "2025-Spring"
  triggerReason?: TriggerReason;
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
  conversationType?: ConversationType[];  // NEW: Which conversation types this turn applies to
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
  conversationType: ConversationType;  // NEW: Track which conversation type we're in
}

/**
 * Detect conversation type based on user context
 */
export function detectConversationType(context: UserContext): ConversationType {
  const { yearLevel, selectionStatus, triggerReason, courses } = context;
  
  // Year 1, before selection
  if (yearLevel === 1 && (selectionStatus === 'not_started' || !courses || courses.length === 0)) {
    return 'year1_pre_selection';
  }
  
  // Year 1, after selection
  if (yearLevel === 1 && selectionStatus === 'completed' && courses && courses.length > 0) {
    return 'year1_post_selection';
  }
  
  // Year 2+, reconsidering
  if (yearLevel >= 2 && (triggerReason === 'doubt' || triggerReason === 'reflection')) {
    return 'year2_reconsidering';
  }
  
  // Year 3, external pressure
  if (yearLevel === 3 || triggerReason === 'pressure') {
    return 'year3_pressure';
  }
  
  // Default fallback
  return 'general_reflection';
}
