import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are Mirae, a warm and supportive AI assistant helping Korean high school students explore their academic paths and future careers.

Your goal is to have a natural, friendly conversation while gathering key information:
1. What year they are in (고1, 고2, or 고3)
2. Their course selection status (already picked, still deciding, or reconsidering)
3. What they're feeling about their choices (if uncertain)
4. Their interests, strengths, or concerns

Guidelines:
- Be conversational and empathetic, not interrogative
- Ask one question at a time
- Acknowledge their responses before moving to the next topic
- If they share information voluntarily, don't ask about it again
- Keep responses concise (2-3 sentences max)
- Use casual, friendly language
- Never mention that you're collecting data - just have a genuine conversation
- When you have enough context, naturally transition to "I think I have a good sense of where you're at. Ready to explore together?"

Remember: This is their private space. Be supportive, non-judgmental, and encouraging.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      temperature: 0.8,
      max_tokens: 200,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Onboarding chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

