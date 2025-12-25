// app/api/skill-translation/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { findBestMatch, detectFitVsFear } from '@/lib/fallback/patternMatcher';
import { UserContext } from '@/lib/types/skillTranslation';

/**
 * Skill Translation Chat API
 * 
 * Hybrid approach: Try OpenAI API first, fallback to pre-scripted responses
 * 
 * Priority:
 * 1. OpenAI GPT-4 (with 5 second timeout)
 * 2. Server-side fallback (pattern matching)
 * 3. Always returns a response (never fails)
 */

// Initialize OpenAI client (lazy)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY not configured, using fallback mode');
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  return openai;
}

/**
 * Build system prompt for OpenAI with user context
 */
function buildSystemPrompt(userContext: UserContext): string {
  const coursesText = userContext.courses.join(', ');
  const keywordsText = userContext.keywords?.join(', ') || '알 수 없음';
  const strengthsText = userContext.strengths?.energizers?.join(', ') || '알 수 없음';
  const interestsText = userContext.interests?.join(', ') || '알 수 없음';
  
  return `You are Mirae (미래), a warm and curious companion helping Korean high school students explore academic paths.

**THIS SPECIFIC STUDENT:**
Name: ${userContext.name}
Keywords from onboarding: ${keywordsText}
What energizes them: ${strengthsText}
Role Roulette interests: ${interestsText}
Courses they chose: ${coursesText}

**CONVERSATION GOAL:**
Help ${userContext.name} articulate skills they'll build through these courses:
${userContext.courses.map(c => `- ${c}`).join('\n')}

**YOUR PERSONALITY:**
- Warm, patient, curious
- Like a thoughtful friend who asks good questions
- Never judge, never give advice
- Celebrate uniqueness and exploration

**CONVERSATION RULES:**
1. Ask ONE question at a time (keep responses under 100 words)
2. Reference their specific courses and context naturally
3. Use warm Korean (해요체 - polite but friendly)
4. Ask "why does that matter?" for depth
5. Distinguish "fit" (genuine interest) vs "fear" (pressure/anxiety)
6. Normalize uncertainty and ambiguity
7. NEVER recommend specific courses, careers, or paths
8. NEVER evaluate aptitude or intelligence

**PROHIBITED LANGUAGE:**
❌ "이게 제일 좋아요" (This is best)
❌ "당신은 ~해야 해요" (You should...)
❌ "~가 더 나아요" (X is better than Y)
❌ "당신은 ~에 재능이 있어요" (You're talented at...)

**ENCOURAGED LANGUAGE:**
✅ "어떤 게 마음에 와닿아요?" (What resonates with you?)
✅ "왜 그게 중요한 것 같아요?" (Why does that matter to you?)
✅ "더 말씀해주실 수 있어요?" (Can you tell me more?)
✅ "흥미로워서인가요, 필요해서인가요?" (Is it interesting, or necessary?)

**EXAMPLE GOOD RESPONSES:**
- "${userContext.name}님이 선택한 '${userContext.courses[0]}' 수업을 상상해볼까요? 그 수업에서 어떤 걸 배우게 될 것 같아요?"
- "창의적 문제 해결! 왜 그게 ${userContext.name}님한테 중요한 것 같아요?"
- "이 두 과목이 함께 있으면 어떤 느낌이 들어요?"

Remember: You're helping them THINK, not telling them WHAT to think.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages = [], 
      userContext, 
      currentTurn = 0,
      forceRealAPI = false, // Allow client to force real API (for testing)
    } = body;
    
    // Validate user context
    if (!userContext?.name || !userContext?.courses) {
      return NextResponse.json(
        { error: 'Missing required user context' },
        { status: 400 }
      );
    }
    
    // ============================================
    // LAYER 1: Try OpenAI API (with timeout)
    // ============================================
    const client = getOpenAIClient();
    
    if (client && !forceRealAPI) {
      try {
        console.log('🤖 Attempting OpenAI API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const systemPrompt = buildSystemPrompt(userContext);
        
        const completion = await Promise.race([
          client.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
              { role: 'system', content: systemPrompt },
              ...messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
            temperature: 0.7,
            max_tokens: 200,
            presence_penalty: 0.3,
            frequency_penalty: 0.2,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);
        
        clearTimeout(timeoutId);
        
        const aiMessage = (completion as any).choices[0].message.content;
        
        console.log('✅ OpenAI API success');
        
        return NextResponse.json({
          message: aiMessage,
          source: 'openai',
          currentTurn: currentTurn + 1,
          usage: (completion as any).usage,
        });
        
      } catch (apiError: any) {
        console.warn('⚠️ OpenAI API failed:', apiError.message);
        // Fall through to fallback
      }
    }
    
    // ============================================
    // LAYER 2: Fallback to Pre-Scripted Responses
    // ============================================
    console.log('📝 Using fallback mode (pre-scripted responses)');
    
    const lastUserMessage = messages.length > 0 
      ? messages[messages.length - 1]?.content || 'START'
      : 'START';
    
    const fallbackResponse = findBestMatch(
      lastUserMessage,
      currentTurn,
      userContext
    );
    
    return NextResponse.json({
      message: fallbackResponse.message,
      source: 'fallback',
      currentTurn: fallbackResponse.nextTurn,
      phase: fallbackResponse.phase,
      warning: 'Using pre-scripted response (OpenAI unavailable)',
    });
    
  } catch (error: any) {
    console.error('❌ Complete API failure:', error);
    
    // ============================================
    // LAYER 3: Emergency Fallback
    // ============================================
    return NextResponse.json({
      message: '죄송해요, 잠시 문제가 생겼어요. 다시 한번 말씀해주시겠어요?',
      source: 'emergency',
      error: error.message,
    });
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    status: 'ok',
    openai: hasOpenAI ? 'configured' : 'not configured',
    fallback: 'available',
  });
}

