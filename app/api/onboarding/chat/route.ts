import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Mirae, a warm and supportive AI assistant helping Korean high school students explore their academic paths and future careers.

Your goal is to have a natural, friendly conversation while gathering key information:
1. What year they are in (고1, 고2, or 고3)
2. Which semester they are in (1학기 or 2학기)
3. Their course selection status (already picked, still deciding, or reconsidering)
4. What they're feeling about their choices (if uncertain)
5. Their interests, strengths, or concerns

Guidelines:
- Be conversational and empathetic, not interrogative
- Ask one question at a time
- Acknowledge their responses before moving to the next topic
- If they share information voluntarily, don't ask about it again
- Keep responses concise (2-3 sentences max)
- Use casual, friendly language
- Never mention that you're collecting data - just have a genuine conversation
- When you have enough context, naturally transition to "I think I have a good sense of where you're at. Ready to explore together?"
- Ask in this order unless already known: year level → semester → course selection status → (if deciding or reconsidering) what feels hard or uncertain → broader interests/strengths

Remember: This is their private space. Be supportive, non-judgmental, and encouraging.`;

const CONTEXT_TOOL = {
  type: 'function' as const,
  function: {
    name: 'collect_context',
    description: 'Capture any onboarding context the student shares.',
    parameters: {
      type: 'object',
      properties: {
        yearLevel: { type: 'string', enum: ['year1', 'year2', 'year3'] },
        currentSemester: { type: 'string', enum: ['sem1', 'sem2'] },
        courseSelectionStatus: { type: 'string', enum: ['picked', 'deciding', 'reconsidering'] },
        currentFeeling: { type: 'string' }
      }
    }
  }
};

const KEYWORD_TOOL = {
  type: 'function' as const,
  function: {
    name: 'extract_keywords',
    description: 'Extract meaningful keywords from the student\'s message that represent their interests, strengths, subjects, activities, or concerns.',
    parameters: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of 1-3 meaningful keywords or short phrases (e.g., "mathematics", "art club", "environmental science", "helping others", "creative writing")'
        }
      },
      required: ['keywords']
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const { messages, context, language = 'ko' } = await req.json();
    const knownContext = {
      yearLevel: context?.yearLevel ?? null,
      currentSemester: context?.currentSemester ?? null,
      courseSelectionStatus: context?.courseSelectionStatus ?? null,
      currentFeeling: context?.currentFeeling ?? null,
    };
    const missingContext = [
      !knownContext.yearLevel ? 'yearLevel' : null,
      !knownContext.currentSemester ? 'currentSemester' : null,
      !knownContext.courseSelectionStatus ? 'courseSelectionStatus' : null,
      knownContext.courseSelectionStatus &&
      knownContext.courseSelectionStatus !== 'picked' &&
      !knownContext.currentFeeling
        ? 'currentFeeling'
        : null,
    ].filter(Boolean);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'system',
          content:
            'When the student reveals any context (year level, course status, or feelings), call the collect_context tool with the fields you can infer. Also call extract_keywords to capture meaningful interests, subjects, activities, or strengths they mention. You may call tools multiple times. Do not mention the tools.'
        },
        {
          role: 'system',
          content:
            language === 'ko'
              ? 'Respond in Korean using a friendly 해요체.'
              : 'Respond in English using a warm, friendly tone.',
        },
        {
          role: 'system',
          content: `Known context: ${JSON.stringify(knownContext)}. Missing in order: ${missingContext.join(
            ', '
          ) || 'none'}. Ask for the next missing item in this order: yearLevel → currentSemester → courseSelectionStatus → (if deciding/reconsidering) currentFeeling. If all required fields are present, shift to interests/strengths and invite them to continue to the journey.`
        },
        ...messages,
      ],
      tools: [CONTEXT_TOOL, KEYWORD_TOOL],
      tool_choice: 'auto',
      temperature: 0.8,
      max_tokens: 200,
    });

    const message = completion.choices[0]?.message;
    const toolCalls = message?.tool_calls ?? [];
    const mergedContext: Record<string, string> = {};
    const extractedKeywords: string[] = [];

    for (const call of toolCalls) {
      if (call.function?.name === 'collect_context') {
        try {
          const context = JSON.parse(call.function.arguments || '{}');
          Object.assign(mergedContext, context);
        } catch {
          // Ignore malformed tool arguments
        }
      } else if (call.function?.name === 'extract_keywords') {
        try {
          const data = JSON.parse(call.function.arguments || '{}');
          if (Array.isArray(data.keywords)) {
            extractedKeywords.push(...data.keywords);
          }
        } catch {
          // Ignore malformed tool arguments
        }
      }
    }

    // If tool was called but no content, make a follow-up call to get the response
    let responseContent = message?.content || '';

    if (!responseContent && toolCalls.length > 0) {
      const updatedContext = { ...knownContext, ...mergedContext };
      const updatedMissing = [
        !updatedContext.yearLevel ? 'yearLevel' : null,
        !updatedContext.courseSelectionStatus ? 'courseSelectionStatus' : null,
        updatedContext.courseSelectionStatus &&
        updatedContext.courseSelectionStatus !== 'picked' &&
        !updatedContext.currentFeeling
          ? 'currentFeeling'
          : null,
      ].filter(Boolean);

      const followUpCompletion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'system',
            content:
              language === 'ko'
                ? 'Respond in Korean using a friendly 해요체.'
                : 'Respond in English using a warm, friendly tone.',
          },
          {
            role: 'system',
            content: `Known context: ${JSON.stringify(updatedContext)}. Missing in order: ${updatedMissing.join(
              ', '
            ) || 'none'}. Ask for the next missing item naturally. If all required context is collected, acknowledge warmly and ask about their interests or what excites them about exploring paths.`
          },
          ...messages,
        ],
        temperature: 0.8,
        max_tokens: 200,
      });
      responseContent = followUpCompletion.choices[0]?.message?.content || '';
    }

    return new Response(
      JSON.stringify({
        message: responseContent,
        context: Object.keys(mergedContext).length ? mergedContext : null,
        keywords: extractedKeywords.length > 0 ? extractedKeywords : null,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Onboarding chat error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
