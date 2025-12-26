import { NextResponse } from 'next/server';
import getOpenAIClient from '@/lib/openai';

type JourneyReportPayload = {
  profile: Record<string, unknown>;
  cards: Array<Record<string, unknown>>;
  statementSections?: {
    drawnTo?: Array<Record<string, unknown>>;
    done?: Array<Record<string, unknown>>;
    changed?: Array<Record<string, unknown>>;
  };
  logs: Array<Record<string, unknown>>;
  progress?: Record<string, unknown>;
  language?: 'ko' | 'en';
};

export async function POST(request: Request) {
  const body = (await request.json()) as JourneyReportPayload;
  const client = getOpenAIClient();

  if (!client) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 400 }
    );
  }

  const language = body.language === 'ko' ? 'ko' : 'en';

  const system = [
    'You are an assistant that writes a SCOPE+ Journey Report for a Korean high school student.',
    'Use only the provided data from the profile, cards, logs, and progress.',
    'Write in the requested language.',
    'Write in first-person voice (use "I", not "you").',
    'Return JSON with keys: executiveText, growthText, directionText, storySummary, goalInsight.',
    'Section guidance (use all available data: profile fields, collection cards, activity logs, progress, and stage selections):',
    '- If reflectionSessions exist in the profile, treat them as the primary source.',
    '- For reflection reports, compare the reflection transcript(s) against any existing growthText/storySummary in the profile to describe how I have grown; keep growthText and storySummary grounded only in reflection transcripts and insights (and the prior growthText/storySummary for comparison).',
    '- goalInsight: a concise 1-2 sentence insight about my goal in first-person voice, using reflection transcripts + insights + collection cards + existing journey report. Note if it has shifted over time. No advice.',
    '- Avoid introducing details from cards/logs/statementSections when reflectionSessions are present.',
    '- Treat statementSections (drawnTo/done/changed from Statement View) as high-signal evidence and weave their exact phrasing into the report when relevant.',
    '- executiveText: "Who I am" snapshot. Mention 2-3 identity signals from Stage 0 profile, cards, keywords, and user preferences.',
    '- growthText: "How I have grown." Summarize reflection conversations and AI insights first, then tie to activity logs and repeated themes.',
    '- directionText: "Why I choose this direction." Ground it in Stage 2 course choices and any major choices (Stage 4), with supporting values signals and liked roles if available.',
    '- storySummary: A 2-3 sentence summary of the full report (identity, growth, direction) in first-person.',
    'Each value should be 2-4 sentences, concise, specific, and grounded in the evidence.',
    'Do not invent facts or add external advice or suggestions.',
  ].join(' ');

  const user = {
    role: 'user' as const,
    content: JSON.stringify(
      {
        language,
        profile: body.profile,
        cards: body.cards,
        statementSections: body.statementSections ?? {},
        logs: body.logs,
        progress: body.progress ?? {},
      },
      null,
      2
    ),
  };

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      user,
    ],
    temperature: 0.4,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  let parsed: {
    executiveText?: string;
    growthText?: string;
    directionText?: string;
    storySummary?: string;
    goalInsight?: string;
  } = {};

  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = {};
  }

  return NextResponse.json({
    executiveText: parsed.executiveText ?? '',
    growthText: parsed.growthText ?? '',
    directionText: parsed.directionText ?? '',
    storySummary: parsed.storySummary ?? '',
    goalInsight: parsed.goalInsight ?? '',
  });
}
