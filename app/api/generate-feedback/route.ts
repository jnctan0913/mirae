// app/api/generate-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { conversation, language, userYear } = await request.json();
    
    // Prepare context for the AI
    const context = {
      userYear: userYear || 'unknown',
      conversationLength: conversation.length,
      language: language || 'en'
    };
    
    // Create prompt for OpenAI
    const prompt = createPrompt(conversation, context, language);
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt(language)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    
    // Parse the response into multiple feedback points
    const feedbackText = completion.choices[0].message.content || '';
    const feedbackPoints = parseFeedback(feedbackText);
    
    return NextResponse.json({
      success: true,
      feedback: feedbackPoints,
      rawResponse: feedbackText
    });
    
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        feedback: getFallbackFeedback(language)
      },
      { status: 500 }
    );
  }
}

function createPrompt(conversation: any[], context: any, language: string): string {
  const convoText = conversation
    .map(msg => `${msg.role === 'ai' ? 'Mirae' : 'Student'}: ${msg.message}`)
    .join('\n');
  
  if (language === 'ko') {
    return `다음은 학생과의 대화 내용입니다. 학생은 ${context.userYear}학년입니다.

대화 내용:
${convoText}

위 대화를 바탕으로 학생에게 줄 조언과 피드백을 3-4개의 짧은 문장으로 작성해주세요.
각 문장은 별도의 항목으로 작성해주세요.
피드백은 공감적이고 격려하는 어조로, 구체적이고 실용적인 조언을 포함해주세요.`;
  }
  
  return `Here is a conversation with a student. The student is in ${context.userYear}.

Conversation:
${convoText}

Based on this conversation, provide 3-4 short feedback sentences for the student.
Each sentence should be a separate point.
The feedback should be empathetic, encouraging, and include specific, practical advice.`;
}

function getSystemPrompt(language: string): string {
  if (language === 'ko') {
    return `당신은 Mirae입니다. 학생들의 학업 성찰을 돕는 AI 동반자입니다.
학생들의 고민에 공감하고, 격려하며, 구체적이고 실용적인 조언을 제공해주세요.
피드백은 항상 긍정적이고 건설적이어야 합니다.
각 피드백 포인트는 짧고 명확하게 작성해주세요.`;
  }
  
  return `You are Mirae, an AI companion that helps students with academic reflection.
Empathize with students' concerns, encourage them, and provide specific, practical advice.
Feedback should always be positive and constructive.
Each feedback point should be short and clear.`;
}

function parseFeedback(text: string): string[] {
  // Split by common delimiters
  const points = text
    .split(/\n\d\.|\n•|\n-|\n\*/)
    .filter(point => point.trim().length > 0)
    .map(point => point.trim().replace(/^\d\.\s*/, '').replace(/^[•\-*]\s*/, ''))
    .slice(0, 4);
  
  if (points.length > 0) {
    return points;
  }
  
  // If no delimiters found, split by sentences
  return text
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 10)
    .map(sentence => sentence.trim() + '.')
    .slice(0, 4);
}

function getFallbackFeedback(language: string): string[] {
  if (language === 'ko') {
    return [
      '고민을 나눠주셔서 감사해요.',
      '지금의 생각들이 앞으로 더 나은 결정을 내리는 데 도움이 될 거예요.',
      '계속해서 성찰하고 성장하는 모습을 응원할게요.'
    ];
  }
  
  return [
    'Thank you for sharing your thoughts.',
    'Your reflections will help you make better decisions in the future.',
    'I\'ll support you as you continue to reflect and grow.'
  ];
}