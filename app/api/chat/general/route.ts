import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Mirae, a warm and supportive AI assistant helping Korean high school students explore their academic paths and future careers.

Your role in this general chat:
- Provide thoughtful guidance on career exploration, course selection, and academic planning
- Reference the student's interests and keywords when relevant
- Be encouraging, empathetic, and non-judgmental
- Keep responses concise and conversational (2-4 sentences)
- Ask clarifying questions to better understand their needs
- Offer actionable suggestions and next steps
- If asked about specific careers or paths, provide balanced insights about requirements, skills needed, and potential opportunities

Guidelines:
- Be warm and approachable, like talking to a trusted mentor
- Acknowledge their concerns and validate their feelings
- Avoid being overly prescriptive - help them explore, not dictate choices
- If they seem stressed or overwhelmed, offer reassurance and break things down into smaller steps
- Reference Korean educational context when relevant (고등학교, 수능, etc.)
- Celebrate their curiosity and effort in exploring their future

Remember: This is their safe space to think out loud and explore possibilities.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    // Build context-aware system message
    let contextMessage = '';
    if (context?.keywords && context.keywords.length > 0) {
      contextMessage += `The student has expressed interest in: ${context.keywords.join(', ')}. `;
    }
    if (context?.yearLevel) {
      const yearMap: Record<string, string> = {
        year1: '고1 (High School Year 1)',
        year2: '고2 (High School Year 2)',
        year3: '고3 (High School Year 3)',
      };
      contextMessage += `They are currently in ${yearMap[context.yearLevel] || context.yearLevel}. `;
    }
    if (contextMessage) {
      contextMessage = `Student context: ${contextMessage}Use this to personalize your responses.`;
    }

    const language = context?.language || 'ko';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content:
            language === 'ko'
              ? 'Respond in Korean using a friendly 해요체 tone.'
              : 'Respond in English using a warm, conversational tone.',
        },
        ...(contextMessage
          ? [{ role: 'system' as const, content: contextMessage }]
          : []),
        ...messages,
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    return new Response(
      JSON.stringify({
        message: responseContent,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('General chat error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
