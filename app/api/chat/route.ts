import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUp } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // For MVP, use simple follow-up generation
    // In full implementation, this would use full conversation context
    const reply = await generateFollowUp(
      '스킬 번역 대화',
      message
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API is not configured' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

