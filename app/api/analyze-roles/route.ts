import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeRoleSwipes } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // Get all swipes
    const { data: swipes } = await supabaseAdmin
      .from('role_swipes')
      .select('*')
      .eq('user_id', userId);

    if (!swipes || swipes.length === 0) {
      return NextResponse.json({ error: 'No swipe data found' }, { status: 400 });
    }

    // Format for analysis
    const swipeData = swipes.map((s) => ({
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

