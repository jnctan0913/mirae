import { NextRequest, NextResponse } from 'next/server';
import { generateFollowUp } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    // For MVP, use simple follow-up generation
    // In full implementation, this would use full conversation context
    const reply = await generateFollowUp(
      '스킬 번역 대화',
      message
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

