import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Log to check if env is loading
console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'YES' : 'NO');
console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10));

// Initialize OpenAI with better error handling
let openai: OpenAI | null = null;

try {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey && apiKey.startsWith('sk-')) {
    openai = new OpenAI({
      apiKey: apiKey,
      // Increased timeout for JSON mode which can take longer
      timeout: 60000, // 60 seconds - JSON mode with multiple recommendations needs more time
      maxRetries: 2,
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.error('Invalid or missing API key format');
  }
} catch (initError) {
  console.error('Failed to initialize OpenAI client:', initError);
}

export async function POST(request: NextRequest) {
  console.log('=== API Call Received ===');
  
  try {
    // Parse request
    const { userSummary, type, currentMajor, count = 8 } = await request.json();
    
    console.log('Request Type:', type);
    console.log('User Summary Length:', userSummary?.length || 0);
    console.log('Current Major:', currentMajor || 'None');

    // Validate inputs
    if (!userSummary) {
      return NextResponse.json(
        { error: 'User summary is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI is initialized
    if (!openai) {
      console.error('OpenAI client not initialized');
      return NextResponse.json(
        { 
          error: 'AI service not configured properly. Check API key.',
          success: false 
        },
        { status: 503 }
      );
    }

    // Create prompt
    let prompt = '';
    
    if (type === 'major') {
      prompt = `Recommend exactly ${count} Korean university majors for this student:

${userSummary}

Return JSON only:
{
  "recommendations": [
    {
      "id": "major-1",
      "name": "Major Name",
      "summary": "1 sentence why this fits",
      "details": ["Point 1", "Point 2", "Point 3"],
      "matchPercent": 85,
      "careers": ["Career 1", "Career 2"],
      "coreCourses": ["Course 1", "Course 2"],
      "imageUrl": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=500&fit=crop"
    }
  ]
}

Requirements: ${count} majors, matchPercent 70-95%, Korean major names, personalized summaries. JSON only.`;
    } else {
      prompt = `Recommend exactly ${count} Korean universities for ${currentMajor}:

${userSummary}

Return JSON only:
{
  "recommendations": [
    {
      "id": "univ-1",
      "name": "University Name",
      "summary": "1 sentence why this fits for ${currentMajor}",
      "details": ["Feature 1", "Feature 2", "Feature 3"],
      "location": "City, South Korea",
      "scholarships": ["Scholarship 1", "Scholarship 2"],
      "tuitionRange": "5-7 million KRW/year",
      "aidStrength": "Strong/Moderate financial aid",
      "internshipPipeline": "Strong internship opportunities",
      "selectivity": "Highly Selective/Selective/Moderate",
      "imageUrl": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop"
    }
  ]
}

Requirements: ${count} universities, strong ${currentMajor} programs, real Korean names, personalized. Include aidStrength and internshipPipeline. JSON only.`;
    }

    console.log('Sending request to OpenAI...');
    console.log('Model: gpt-4o-mini');
    console.log('Prompt length:', prompt.length);

    // Call OpenAI with JSON response format for better parsing
    // Optimized for speed: reduced tokens and temperature
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Fastest model
        messages: [
          { 
            role: "system", 
            content: "Return valid JSON only. Be concise." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.4, // Lower for faster, more deterministic responses
        max_tokens: 1500, // Reduced for faster generation
        response_format: { type: "json_object" }, // Ensure JSON response
      });
    } catch (openaiError: unknown) {
      console.error('OpenAI API call failed:', openaiError);
      const error = openaiError as { status?: number; code?: string; type?: string; message?: string };
      console.error('Error status:', error?.status);
      console.error('Error code:', error?.code);
      console.error('Error type:', error?.type);
      
      // Provide more specific error messages
      if (error?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in .env.local');
      } else if (error?.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (error?.status === 500 || error?.status === 503) {
        throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
      } else if (error?.code === 'ETIMEDOUT' || error?.message?.includes('timeout')) {
        throw new Error('Request to OpenAI timed out. Please try again.');
      } else {
        throw new Error(`OpenAI API error: ${error?.message || 'Unknown error'}`);
      }
    }

    console.log('OpenAI response received');

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      console.error('No response content from OpenAI');
      throw new Error('No response from AI');
    }

    console.log('Response length:', response.length);
    console.log('Response preview:', response.substring(0, 200));

    // Try to parse the response
    let parsed;
    try {
      // Clean the response - remove any markdown code blocks (just in case)
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsed = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid response structure');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response:', response);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // Extract recommendations array
    const recommendations = Array.isArray(parsed.recommendations) 
      ? parsed.recommendations 
      : (Array.isArray(parsed) ? parsed : []);
    
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      console.error('Invalid recommendations array:', recommendations);
      console.error('Parsed object:', parsed);
      throw new Error(`No valid recommendations returned. Expected array but got: ${typeof recommendations}`);
    }

    // Validate each recommendation has required fields and add defaults
    const validRecommendations = recommendations
      .filter((rec: unknown): rec is { id: string; name: string; summary: string; [key: string]: unknown } => {
        return rec !== null && 
               typeof rec === 'object' &&
               'id' in rec &&
               'name' in rec &&
               'summary' in rec &&
               typeof (rec as { id: unknown }).id === 'string' && 
               typeof (rec as { name: unknown }).name === 'string' && 
               typeof (rec as { summary: unknown }).summary === 'string';
      })
      .map((rec) => {
        // Ensure all required fields have defaults
        return {
          ...rec,
          id: rec.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
          name: rec.name || 'Unknown',
          summary: rec.summary || 'No description available',
          details: Array.isArray(rec.details) ? rec.details : [],
          imageUrl: rec.imageUrl || (type === 'major' 
            ? 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=500&fit=crop'
            : 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop'),
          matchPercent: typeof rec.matchPercent === 'number' ? rec.matchPercent : undefined,
        };
      });

    if (validRecommendations.length === 0) {
      console.error('No valid recommendations after filtering');
      throw new Error('All recommendations failed validation');
    }

    // Ensure we have at least the requested count (or as many as available)
    const finalRecommendations = validRecommendations.slice(0, count);

    console.log(`Generated ${finalRecommendations.length} valid recommendations (requested ${count})`);

    return NextResponse.json({ 
      success: true, 
      recommendations: finalRecommendations,
      count: finalRecommendations.length,
      type 
    });

  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    // Check for specific OpenAI API errors
    let errorMessage = 'AI service error';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error) {
      // Check for API key errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'OpenAI API key error';
        errorDetails = 'Please check your API key configuration.';
      }
      // Check for rate limit errors
      else if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded';
        errorDetails = 'Too many requests. Please try again in a moment.';
      }
      // Check for timeout errors
      else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Request timeout';
        errorDetails = 'The AI service took too long to respond. Please try again.';
      }
      // Check for invalid model errors
      else if (error.message.includes('model') || error.message.includes('gpt-4o-mini')) {
        errorMessage = 'Model error';
        errorDetails = 'The AI model is not available. Please try again later.';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        success: false
      },
      { status: 500 }
    );
  }
}