import { NextRequest, NextResponse } from 'next/server';
import { analyzeRoleSwipes } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // Get swipes from localStorage (client will send them)
    const swipes = req.headers.get('x-swipe-data');

    if (!swipes) {
      return NextResponse.json({ error: 'No swipe data found' }, { status: 400 });
    }

    const parsedSwipes = JSON.parse(swipes);

    if (!parsedSwipes || parsedSwipes.length === 0) {
      return NextResponse.json({ error: 'No swipe data found' }, { status: 400 });
    }

    // Format for analysis
    const swipeData = parsedSwipes.map((s: any) => ({
      roleId: s.role_id,
      swipeDirection: s.swipe_direction,
    }));

    // Analyze with AI
    const insights = await analyzeRoleSwipes(swipeData);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Analyze roles error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze roles' },
      { status: 500 }
    );
  }
}
