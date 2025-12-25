// lib/fallback/patternMatcher.ts

import { 
  ConversationTurn, 
  UserContext, 
  ConversationPhase 
} from '@/lib/types/skillTranslation';
import { 
  HAPPY_PATH_TURNS, 
  FIT_FEAR_RESPONSES, 
  GENERIC_FALLBACKS 
} from './happyPath';

/**
 * Pattern Matcher
 * 
 * Intelligently matches user input to conversation turns
 * and generates appropriate responses.
 */

/**
 * Main function to find the best matching response
 */
export function findBestMatch(
  userInput: string,
  currentTurn: number,
  context: UserContext
): { message: string; nextTurn: number; phase: ConversationPhase } {
  const normalizedInput = userInput.toLowerCase().trim();
  
  // Special case: START token for initial message
  if (userInput === 'START' || currentTurn === 0) {
    const turn = HAPPY_PATH_TURNS[0];
    const message = renderMessage(turn.miraeMessage, context);
    return {
      message,
      nextTurn: 1,
      phase: 'recap',
    };
  }
  
  // Get expected turn based on conversation flow
  const expectedTurn = HAPPY_PATH_TURNS[currentTurn];
  
  if (!expectedTurn) {
    // We've gone past the script - use generic fallback
    return {
      message: getGenericFallback(),
      nextTurn: currentTurn,
      phase: 'closing',
    };
  }
  
  // Check if user input matches expected patterns
  const hasMatchingPattern = expectedTurn.expectedUserPatterns.some(
    pattern => normalizedInput.includes(pattern)
  );
  
  if (hasMatchingPattern) {
    // User is following the happy path!
    const nextTurn = HAPPY_PATH_TURNS[currentTurn + 1];
    
    if (nextTurn) {
      // Special handling for Turn 12 (Fit vs Fear response)
      if (nextTurn.turnNumber === 12) {
        const fitFearResponse = detectFitVsFear(normalizedInput, context);
        return {
          message: fitFearResponse,
          nextTurn: currentTurn + 1,
          phase: 'closing',
        };
      }
      
      const message = renderMessage(nextTurn.miraeMessage, context);
      return {
        message,
        nextTurn: currentTurn + 1,
        phase: nextTurn.phase,
      };
    }
  }
  
  // Check for vague/unclear responses
  if (isVagueResponse(normalizedInput)) {
    const vagueResponse = expectedTurn.alternatives?.vague;
    if (vagueResponse) {
      const message = renderMessage(vagueResponse, context);
      return {
        message,
        nextTurn: currentTurn, // Stay on same turn
        phase: expectedTurn.phase,
      };
    }
  }
  
  // Check for questions
  if (isQuestion(normalizedInput)) {
    const questionResponse = expectedTurn.alternatives?.question;
    if (questionResponse) {
      const message = renderMessage(questionResponse, context);
      return {
        message,
        nextTurn: currentTurn, // Stay on same turn
        phase: expectedTurn.phase,
      };
    }
  }
  
  // Fallback: try to find ANY matching turn ahead
  const fuzzyMatch = findFuzzyMatch(normalizedInput, currentTurn);
  if (fuzzyMatch) {
    const message = renderMessage(fuzzyMatch.miraeMessage, context);
    return {
      message,
      nextTurn: fuzzyMatch.turnNumber,
      phase: fuzzyMatch.phase,
    };
  }
  
  // Ultimate fallback: generic response
  return {
    message: getGenericFallback(),
    nextTurn: currentTurn, // Stay on same turn
    phase: expectedTurn.phase,
  };
}

/**
 * Detect if user response indicates FIT vs FEAR motivation
 */
export function detectFitVsFear(
  userInput: string,
  context: UserContext
): string {
  const input = userInput.toLowerCase();
  
  // FIT signals
  const fitKeywords = ['흥미', '재미', '좋아', '궁금', '배우고 싶', '하고 싶'];
  const hasFitSignal = fitKeywords.some(keyword => input.includes(keyword));
  
  // FEAR signals
  const fearKeywords = ['필요', '걱정', '불안', '갖춰야', '뒤처질', '해야'];
  const hasFearSignal = fearKeywords.some(keyword => input.includes(keyword));
  
  // BOTH signals
  if (hasFitSignal && hasFearSignal) {
    return FIT_FEAR_RESPONSES.both(context);
  }
  
  // FIT only
  if (hasFitSignal) {
    return FIT_FEAR_RESPONSES.fit(context);
  }
  
  // FEAR only
  if (hasFearSignal) {
    return FIT_FEAR_RESPONSES.fear(context);
  }
  
  // Default to FIT (positive assumption)
  return FIT_FEAR_RESPONSES.fit(context);
}

/**
 * Check if user response is vague/unclear
 */
function isVagueResponse(input: string): boolean {
  const vaguePatterns = [
    '모르겠',
    '잘 모르',
    '글쎄',
    '확실하지 않',
    '잘 모르겠',
    '생각 안',
    '별로',
  ];
  return vaguePatterns.some(pattern => input.includes(pattern));
}

/**
 * Check if user input is a question
 */
function isQuestion(input: string): boolean {
  return input.includes('?') || 
         input.includes('뭐') ||
         input.includes('어떻게') ||
         input.includes('왜') ||
         input.includes('언제') ||
         input.includes('어디');
}

/**
 * Try to find ANY matching turn ahead in the conversation
 * (Fuzzy matching for when user jumps ahead)
 */
function findFuzzyMatch(
  input: string,
  currentTurn: number
): ConversationTurn | null {
  // Look at next 3 turns for patterns
  for (let i = currentTurn + 1; i < Math.min(currentTurn + 4, HAPPY_PATH_TURNS.length); i++) {
    const turn = HAPPY_PATH_TURNS[i];
    const hasMatch = turn.expectedUserPatterns.some(pattern => 
      input.includes(pattern)
    );
    
    if (hasMatch) {
      return turn;
    }
  }
  
  return null;
}

/**
 * Render a message (handle both string and function types)
 */
function renderMessage(
  message: string | ((context: UserContext) => string),
  context: UserContext
): string {
  return typeof message === 'function' ? message(context) : message;
}

/**
 * Get a random generic fallback message
 */
function getGenericFallback(): string {
  const randomIndex = Math.floor(Math.random() * GENERIC_FALLBACKS.length);
  return GENERIC_FALLBACKS[randomIndex];
}

/**
 * Extract skill keywords from user input
 * (Optional: for analytics/tracking)
 */
export function extractSkillKeywords(input: string): string[] {
  const skillKeywords = [
    '문제 해결',
    '창의성',
    '협업',
    '분석',
    '소통',
    '비판적 사고',
    '프레젠테이션',
    '데이터 분석',
    '시각적 표현',
    '공감',
    '리더십',
    '조직',
  ];
  
  return skillKeywords.filter(skill => input.includes(skill));
}

