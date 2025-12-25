// lib/fallback/patternMatcher.ts - UPDATED WITH CONTEXT SUPPORT

import { 
  ConversationTurn, 
  UserContext, 
  ConversationPhase,
  ConversationType,
} from '@/lib/types/skillTranslation';
import { 
  HAPPY_PATH_YEAR1_POST,
  HAPPY_PATH_YEAR1_PRE,
  HAPPY_PATH_YEAR2_RECON,
  HAPPY_PATH_YEAR3_PRESSURE,
  FIT_FEAR_RESPONSES, 
  GENERIC_FALLBACKS 
} from './happyPath';
import {
  HAPPY_PATH_TURNS_EN,
  FIT_FEAR_RESPONSES_EN,
  GENERIC_FALLBACKS_EN
} from './happyPathEn';

/**
 * Get the appropriate happy path based on conversation type and language
 */
function getHappyPathForType(type: ConversationType, language: 'ko' | 'en' = 'ko'): ConversationTurn[] {
  // For English, use the general English happy path (we can add type-specific English paths later)
  if (language === 'en') {
    return HAPPY_PATH_TURNS_EN;
  }
  
  // For Korean, use type-specific paths
  switch (type) {
    case 'year1_pre_selection':
      return HAPPY_PATH_YEAR1_PRE;
    case 'year1_post_selection':
      return HAPPY_PATH_YEAR1_POST;
    case 'year2_reconsidering':
      return HAPPY_PATH_YEAR2_RECON;
    case 'year3_pressure':
      return HAPPY_PATH_YEAR3_PRESSURE;
    default:
      return HAPPY_PATH_YEAR1_POST; // Fallback to most common
  }
}

/**
 * Main function to find the best matching response - NOW CONTEXT-AWARE
 */
export function findBestMatch(
  userInput: string,
  currentTurn: number,
  context: UserContext,
  conversationType: ConversationType,
  language: 'ko' | 'en' = 'ko'
): { message: string; nextTurn: number; phase: ConversationPhase } {
  const normalizedInput = userInput.toLowerCase().trim();
  
  // Get the appropriate happy path for this conversation type and language
  const HAPPY_PATH_TURNS = getHappyPathForType(conversationType, language);
  
  // Special case: START token for initial message
  if (userInput === 'START' || currentTurn === 0) {
    const turn = HAPPY_PATH_TURNS[0];
    const message = renderMessage(turn.miraeMessage, context);
    return {
      message,
      nextTurn: 1,
      phase: turn.phase,
    };
  }
  
  // Get expected turn
  const expectedTurn = HAPPY_PATH_TURNS[currentTurn];
  
  if (!expectedTurn) {
    return {
      message: getGenericFallback(language),
      nextTurn: currentTurn,
      phase: 'closing',
    };
  }
  
  // Check if user input matches expected patterns
  const hasMatchingPattern = expectedTurn.expectedUserPatterns.some(
    pattern => normalizedInput.includes(pattern)
  );
  
  if (hasMatchingPattern) {
    const nextTurn = HAPPY_PATH_TURNS[currentTurn + 1];
    
    if (nextTurn) {
      // Special handling for fit-vs-fear in Year 1 post-selection
      if (conversationType === 'year1_post_selection' && nextTurn.turnNumber === 12) {
        const fitFearResponse = detectFitVsFear(normalizedInput, context, language);
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
  
  // Check for vague responses
  if (isVagueResponse(normalizedInput, language)) {
    const vagueResponse = expectedTurn.alternatives?.vague;
    if (vagueResponse) {
      const message = renderMessage(vagueResponse, context);
      return {
        message,
        nextTurn: currentTurn,
        phase: expectedTurn.phase,
      };
    }
  }
  
  // Check for questions
  if (isQuestion(normalizedInput, language)) {
    const questionResponse = expectedTurn.alternatives?.question;
    if (questionResponse) {
      const message = renderMessage(questionResponse, context);
      return {
        message,
        nextTurn: currentTurn,
        phase: expectedTurn.phase,
      };
    }
  }
  
  // Fuzzy match
  const fuzzyMatch = findFuzzyMatch(normalizedInput, currentTurn, HAPPY_PATH_TURNS);
  if (fuzzyMatch) {
    const message = renderMessage(fuzzyMatch.miraeMessage, context);
    return {
      message,
      nextTurn: fuzzyMatch.turnNumber,
      phase: fuzzyMatch.phase,
    };
  }
  
  // Ultimate fallback
  return {
    message: getGenericFallback(language),
    nextTurn: currentTurn,
    phase: expectedTurn.phase,
  };
}

/**
 * Detect fit vs fear motivation
 */
export function detectFitVsFear(
  userInput: string,
  context: UserContext,
  language: 'ko' | 'en' = 'ko'
): string {
  const input = userInput.toLowerCase();
  const FIT_FEAR = language === 'en' ? FIT_FEAR_RESPONSES_EN : FIT_FEAR_RESPONSES;
  
  const fitKeywords = language === 'en'
    ? ['interested', 'fun', 'like', 'curious', 'want to learn', 'want to', 'enjoy']
    : ['흥미', '재미', '좋아', '궁금', '배우고 싶', '하고 싶'];
  const hasFitSignal = fitKeywords.some(keyword => input.includes(keyword));
  
  const fearKeywords = language === 'en'
    ? ['need', 'worry', 'anxious', 'should have', 'fall behind', 'must', 'required']
    : ['필요', '걱정', '불안', '갖춰야', '뒤처질', '해야'];
  const hasFearSignal = fearKeywords.some(keyword => input.includes(keyword));
  
  if (hasFitSignal && hasFearSignal) {
    return FIT_FEAR.both(context);
  }
  
  if (hasFitSignal) {
    return FIT_FEAR.fit(context);
  }
  
  if (hasFearSignal) {
    return FIT_FEAR.fear(context);
  }
  
  return FIT_FEAR.fit(context);
}

function isVagueResponse(input: string, language: 'ko' | 'en' = 'ko'): boolean {
  const vaguePatterns = language === 'en'
    ? ['dont know', "don't know", 'not sure', 'unsure', 'maybe', 'not really', 'not certain', 'uncertain']
    : ['모르겠', '잘 모르', '글쎄', '확실하지 않', '잘 모르겠', '생각 안', '별로'];
  return vaguePatterns.some(pattern => input.includes(pattern));
}

function isQuestion(input: string, language: 'ko' | 'en' = 'ko'): boolean {
  if (input.includes('?')) return true;
  
  if (language === 'en') {
    return input.includes('what') ||
           input.includes('how') ||
           input.includes('why') ||
           input.includes('when') ||
           input.includes('where') ||
           input.includes('who');
  }
  
  return input.includes('뭐') ||
         input.includes('어떻게') ||
         input.includes('왜') ||
         input.includes('언제') ||
         input.includes('어디');
}

function findFuzzyMatch(
  input: string,
  currentTurn: number,
  happyPath: ConversationTurn[]
): ConversationTurn | null {
  for (let i = currentTurn + 1; i < Math.min(currentTurn + 4, happyPath.length); i++) {
    const turn = happyPath[i];
    const hasMatch = turn.expectedUserPatterns.some(pattern => 
      input.includes(pattern)
    );
    
    if (hasMatch) {
      return turn;
    }
  }
  
  return null;
}

function renderMessage(
  message: string | ((context: UserContext) => string),
  context: UserContext
): string {
  return typeof message === 'function' ? message(context) : message;
}

function getGenericFallback(language: 'ko' | 'en' = 'ko'): string {
  const fallbacks = language === 'en' ? GENERIC_FALLBACKS_EN : GENERIC_FALLBACKS;
  const randomIndex = Math.floor(Math.random() * fallbacks.length);
  return fallbacks[randomIndex];
}

export function extractSkillKeywords(input: string): string[] {
  const skillKeywords = [
    '문제 해결', '창의성', '협업', '분석', '소통',
    '비판적 사고', '프레젠테이션', '데이터 분석',
    '시각적 표현', '공감', '리더십', '조직',
  ];
  
  return skillKeywords.filter(skill => input.includes(skill));
}
