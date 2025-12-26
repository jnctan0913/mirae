// app/api/recommend-roles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface GeneratedRole {
  id: string;
  title: { en: string; ko: string };
  domain: { en: string; ko: string };
  tagline: { en: string; ko: string };
  roleModels: { en: string[]; ko: string[] };
  companies: { en: string[]; ko: string[] };
  details: { en: string; ko: string };
  resources: { en: string[]; ko: string[] };
}

interface AIRecommendation {
  score: number;
  explanation: { en: string; ko: string };
  matchingKeywords: string[];
  roleData: GeneratedRole;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionnaireAnswers, keywords, language } = body;

    // Prepare user data for AI analysis
    const userData = prepareUserDataForAI(questionnaireAnswers, keywords);

    // Get AI-generated custom roles
    const aiAnalysis = await generateCustomRoles(userData, language);

    if (aiAnalysis && aiAnalysis.recommendations) {
      return NextResponse.json({
        success: true,
        recommendations: aiAnalysis.recommendations,
      });
    }

    // Fallback: Generate generic roles
    const fallbackRecommendations = await generateFallbackRoles(keywords, language);

    return NextResponse.json({
      success: true,
      recommendations: fallbackRecommendations,
      fallback: true,
    });
  } catch (error: unknown) {
    console.error('Role recommendation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        recommendations: [],
      },
      { status: 500 }
    );
  }
}

function prepareUserDataForAI(
  questionnaireAnswers: Record<string, string[]>,
  keywords: string[]
): string {
  // Simplified, compact user data format
  const answers = Object.values(questionnaireAnswers || {})
    .flat()
    .filter(Boolean);

  return `Interests: ${(keywords || []).join(', ')}
Traits: ${answers.join(', ')}`;
}

async function generateCustomRoles(
  userData: string,
  language: 'en' | 'ko'
): Promise<{ recommendations: AIRecommendation[] } | null> {
  // Generate English only for speed, translate on frontend if needed
  const prompt = `Career advisor: Generate 5 roles for this user.

${userData}

Return JSON with 5 roles. Generate ENGLISH ONLY. Each role:
- id (kebab-case)
- title (string, max 5 words)
- domain (string, max 3 words)
- tagline (string, max 10 words)
- roleModels (array of 2 names)
- companies (array of 3 company names)
- details (string, max 15 words)
- resources (array of 3 resource names)
- score (0-100)
- explanation (string, max 20 words)
- matchingKeywords (array)

Format:
{"recommendations":[{"score":95,"explanation":"...","matchingKeywords":["k1"],"roleData":{"id":"role-id","title":"Title","domain":"Domain","tagline":"Tag","roleModels":["P1","P2"],"companies":["C1","C2","C3"],"details":"Details","resources":["R1","R2","R3"]}}]}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Fast career advisor. Brief English responses only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    if (result.recommendations && Array.isArray(result.recommendations)) {
      // Convert English-only response to bilingual format for compatibility
      const bilingualRecommendations = result.recommendations.map((rec: {
        explanation: string | { en: string; ko: string };
        roleData: {
          title: string | { en: string; ko: string };
          domain: string | { en: string; ko: string };
          tagline: string | { en: string; ko: string };
          roleModels: string[] | { en: string[]; ko: string[] };
          companies: string[] | { en: string[]; ko: string[] };
          details: string | { en: string; ko: string };
          resources: string[] | { en: string[]; ko: string[] };
        };
      }) => ({
        ...rec,
        explanation: typeof rec.explanation === 'string'
          ? { en: rec.explanation, ko: rec.explanation }
          : rec.explanation,
        roleData: {
          ...rec.roleData,
          title: typeof rec.roleData.title === 'string'
            ? { en: rec.roleData.title, ko: rec.roleData.title }
            : rec.roleData.title,
          domain: typeof rec.roleData.domain === 'string'
            ? { en: rec.roleData.domain, ko: rec.roleData.domain }
            : rec.roleData.domain,
          tagline: typeof rec.roleData.tagline === 'string'
            ? { en: rec.roleData.tagline, ko: rec.roleData.tagline }
            : rec.roleData.tagline,
          roleModels: Array.isArray(rec.roleData.roleModels) && typeof rec.roleData.roleModels[0] === 'string'
            ? { en: rec.roleData.roleModels, ko: rec.roleData.roleModels }
            : rec.roleData.roleModels,
          companies: Array.isArray(rec.roleData.companies) && typeof rec.roleData.companies[0] === 'string'
            ? { en: rec.roleData.companies, ko: rec.roleData.companies }
            : rec.roleData.companies,
          details: typeof rec.roleData.details === 'string'
            ? { en: rec.roleData.details, ko: rec.roleData.details }
            : rec.roleData.details,
          resources: Array.isArray(rec.roleData.resources) && typeof rec.roleData.resources[0] === 'string'
            ? { en: rec.roleData.resources, ko: rec.roleData.resources }
            : rec.roleData.resources,
        }
      }));

      return { recommendations: bilingualRecommendations };
    }

    return null;
  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    return null;
  }
}

async function generateFallbackRoles(
  keywords: string[],
  language: 'en' | 'ko'
): Promise<AIRecommendation[]> {
  // Generate basic generic roles as fallback (English only, duplicated for ko)
  const enText = 'A versatile role that combines creativity and problem-solving';
  const genericRoles: AIRecommendation[] = [
    {
      score: 70,
      explanation: { en: enText, ko: enText },
      matchingKeywords: keywords.slice(0, 2),
      roleData: {
        id: 'creative-problem-solver',
        title: { en: 'Creative Problem Solver', ko: 'Creative Problem Solver' },
        domain: { en: 'Innovation', ko: 'Innovation' },
        tagline: {
          en: 'Uses creativity to solve complex challenges',
          ko: 'Uses creativity to solve complex challenges'
        },
        roleModels: { en: ['Design Thinkers', 'Innovators'], ko: ['Design Thinkers', 'Innovators'] },
        companies: { en: ['IDEO', 'McKinsey', 'Google'], ko: ['IDEO', 'McKinsey', 'Google'] },
        details: {
          en: 'Analyzes problems and develops innovative solutions',
          ko: 'Analyzes problems and develops innovative solutions'
        },
        resources: {
          en: ['Design Thinking Courses', 'Innovation Labs', 'Problem Solving Workshops'],
          ko: ['Design Thinking Courses', 'Innovation Labs', 'Problem Solving Workshops']
        }
      }
    }
  ];

  return genericRoles;
}
