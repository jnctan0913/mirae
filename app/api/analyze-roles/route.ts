import { NextRequest, NextResponse } from 'next/server';
import { analyzeRoleSwipes } from '@/lib/openai';

interface SwipeInput {
  roleId: string;
  swipeDirection: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { swipes } = body;

    // Input validation
    if (!swipes || !Array.isArray(swipes) || swipes.length === 0) {
      return NextResponse.json(
        { error: 'Swipes array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (swipes.length > 100) {
      return NextResponse.json(
        { error: 'Too many swipes (max 100)' },
        { status: 400 }
      );
    }

    // Format and validate for analysis
    const swipeData: Array<{ roleId: string; swipeDirection: string }> = swipes.map((s: SwipeInput) => {
      if (!s.roleId || typeof s.roleId !== 'string') {
        throw new Error('Invalid swipe data: roleId is required');
      }
      if (!s.swipeDirection || typeof s.swipeDirection !== 'string') {
        throw new Error('Invalid swipe data: swipeDirection is required');
      }
      return {
        roleId: s.roleId,
        swipeDirection: s.swipeDirection,
      };
    });

    // Analyze with AI
    const insights = await analyzeRoleSwipes(swipeData);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Analyze roles error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid swipe data')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API is not configured' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze roles' },
      { status: 500 }
    );
  }
}

