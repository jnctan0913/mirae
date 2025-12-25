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
      // Add timeout for better error handling
      timeout: 30000, // 30 seconds
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
      prompt = `You are a university counselor. Based on this student profile, recommend ${count} suitable majors in South Korea:

STUDENT PROFILE:
${userSummary}

For each major, return this exact JSON format:
{
  "id": "short-id",
  "name": "Major Name",
  "summary": "Brief description",
  "details": ["Point 1", "Point 2", "Point 3"],
  "matchPercent": 85,
  "careers": ["Career 1", "Career 2", "Career 3"],
  "coreCourses": ["Course 1", "Course 2", "Course 3"],
  "workloadStyle": "Description",
  "portfolio": "Portfolio info",
  "collaboration": "Collaboration level",
  "pace": "Pace",
  "imageUrl": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=500&fit=crop"
}

Return ONLY a JSON object with a "recommendations" array.`;
    } else {
      prompt = `You are a Korean university expert. Recommend ${count} Korean universities for this major:

STUDENT PROFILE:
${userSummary}
CHOSEN MAJOR: ${currentMajor}

For each university, return this exact JSON format:
{
  "id": "short-id",
  "name": "University Name",
  "summary": "Brief description",
  "details": ["Feature 1", "Feature 2", "Feature 3"],
  "location": "City, South Korea",
  "scholarships": ["Scholarship 1", "Scholarship 2"],
  "tuitionRange": "$$",
  "aidStrength": "Financial aid info",
  "internshipPipeline": "Internship info",
  "selectivity": "Selectivity level",
  "campusVibe": "Campus environment",
  "housing": "Housing info",
  "exchange": "Exchange programs",
  "imageUrl": "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=500&fit=crop"
}

Return ONLY a JSON object with a "recommendations" array.`;
    }

    console.log('Sending request to OpenAI...');

    // Call OpenAI with simpler settings
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-3.5-turbo which works with all keys
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that returns JSON only." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

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
      // Clean the response - remove any markdown code blocks
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw response:', response);
      throw new Error('Invalid JSON response from AI');
    }

    const recommendations = parsed.recommendations || parsed;
    
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      console.error('Invalid recommendations array:', recommendations);
      throw new Error('No valid recommendations returned');
    }

    console.log(`Generated ${recommendations.length} recommendations`);

    return NextResponse.json({ 
      success: true, 
      recommendations,
      count: recommendations.length,
      type 
    });

  } catch (error) {
    console.error('=== FULL ERROR DETAILS ===');
    console.error('Error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'AI service error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
}