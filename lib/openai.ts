import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFollowUp(
  questionContext: string,
  userAnswer: string
): Promise<string> {
  const response = await openai.chat.completions.create({
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
  const swipeSummary = swipeData
    .map((s) => `${s.roleId}: ${s.swipeDirection}`)
    .join('\n');

  const response = await openai.chat.completions.create({
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

export default openai;

