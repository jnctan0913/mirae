import { Candidate } from '@/lib/types/candidate';

// Re-export Candidate type for convenience
export type { Candidate };

// Use relative path for API calls (works in both dev and production)
const API_URL = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

export interface AIRecommendationRequest {
  userSummary: string;
  type: 'major' | 'university';
  currentMajor?: string;
  count?: number;
}

export interface AIRecommendationResponse {
  success: boolean;
  recommendations: Candidate[];
  count: number;
  type: 'major' | 'university';
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractUserSummary = (profile: any): string => {
  const sections = [];
  
  // Prioritize most relevant data - keep it concise
  // Stage 1 - Liked roles (most important)
  if (profile.likedRoles?.length > 0) {
    sections.push(`Interested in: ${profile.likedRoles.slice(0, 3).join(', ')}`);
  }
  
  // Strengths (key for matching)
  if (profile.strengthTags?.length > 0) {
    sections.push(`Strengths: ${profile.strengthTags.slice(0, 3).join(', ')}`);
  }
  
  // Stage 0 - Primary interests
  if (profile.stage0Profile) {
    const stage0 = profile.stage0Profile;
    if (stage0.primaryTag) sections.push(`Primary: ${stage0.primaryTag}`);
    if (stage0.topSignals?.length > 0) sections.push(`Signals: ${stage0.topSignals.slice(0, 2).join(', ')}`);
  }
  
  // Stage 2 - Course selection (if available)
  if (profile.stage2Selection) {
    const selection = profile.stage2Selection;
    if (selection.anchor?.length > 0) sections.push(`Anchor: ${selection.anchor.slice(0, 2).join(', ')}`);
  }
  
  // Keywords (concise)
  if (profile.keywords?.length > 0) {
    sections.push(`Keywords: ${profile.keywords.slice(0, 3).join(', ')}`);
  }
  
  // If we have no data, provide a default
  if (sections.length === 0) {
    return "Korean high school student seeking major and university recommendations.";
  }
  
  return sections.join('. ');
};

export const generateAIRecommendations = async (
  request: AIRecommendationRequest
): Promise<AIRecommendationResponse> => {
  console.log('=== AI Recommendation Request ===');
  console.log('Type:', request.type);
  console.log('Summary length:', request.userSummary.length);
  console.log('Current Major:', request.currentMajor);
  
  // Validate userSummary is not empty
  if (!request.userSummary || request.userSummary.trim().length === 0) {
    console.error('User summary is empty');
    return {
      success: false,
      recommendations: [],
      count: 0,
      type: request.type,
      error: 'User profile data is insufficient. Please complete earlier stages first.',
    };
  }

  try {
    const apiPath = `${API_URL}/api/generate-recommendations`;
    console.log('Calling API:', apiPath);
    
    // Add timeout to fetch call (90 seconds to allow for API processing)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    let response;
    try {
      response = await fetch(apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timed out. The AI service is taking longer than expected. Please try again.');
      }
      throw fetchError;
    }
    clearTimeout(timeoutId);

    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      let errorText = '';
      let errorData = null;
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch {
        // If parsing fails, use the text as is
      }
      
      console.error('API Error Status:', response.status);
      console.error('API Error Text:', errorText);
      
      // Extract more detailed error message if available
      const errorMessage = errorData?.details || errorData?.error || `API Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.success) {
      console.error('API returned failure:', data.error);
      const errorMessage = data.details || data.error || 'Failed to generate recommendations';
      throw new Error(errorMessage);
    }

    console.log(`Received ${data.recommendations.length} recommendations`);
    return data;
    
  } catch (error) {
    console.error('=== AI Recommendation Error ===');
    console.error(error);
    throw error;
  }
};