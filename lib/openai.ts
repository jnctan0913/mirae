import OpenAI from 'openai';

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  // Skip initialization during build time
  // NEXT_PHASE is set during Next.js build process
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }

  if (openai === null) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Only warn in non-build contexts
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.warn(
          '⚠️ OPENAI_API_KEY environment variable is missing. OpenAI features will not work.'
        );
      }
      return null;
    }

    try {
      openai = new OpenAI({
        apiKey,
      });
    } catch (error) {
      // Handle any initialization errors gracefully
      console.warn('⚠️ Failed to initialize OpenAI client:', error);
      return null;
    }
  }

  return openai;
}

export async function generateFollowUp(
  questionContext: string,
  userAnswer: string
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a supportive career exploration guide for Korean high school students.

Ask 1-2 clarifying follow-up questions based on their answer.
Keep questions open-ended and non-judgmental.
Use conversational Korean (반말).
DO NOT give advice or recommendations.`,
      },
      {
        role: 'user',
        content: `Question: ${questionContext}\nStudent answered: ${userAnswer}\n\nAsk a thoughtful follow-up question.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content || '';
}

export async function analyzeRoleSwipes(
  swipeData: Array<{ roleId: string; swipeDirection: string }>
): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  const swipeSummary = swipeData
    .map((s) => `${s.roleId}: ${s.swipeDirection}`)
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Analyze role exploration patterns and identify interest clusters. Respond in Korean.',
      },
      {
        role: 'user',
        content: `Student swipe data:\n${swipeSummary}\n\nIdentify 2-3 interest clusters and surprising discoveries.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
}

// Export a getter function instead of the client directly
export default getOpenAIClient;

// Type guard to check if OpenAI is initialized
export function isOpenAIConfigured(): boolean {
  return getOpenAIClient() !== null;
}

