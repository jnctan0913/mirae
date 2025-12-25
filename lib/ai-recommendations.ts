import { Candidate } from '@/types/candidate';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

export const extractUserSummary = (profile: any): string => {
  const sections = [];
  
  if (profile.stage1Summary) {
    const stage1 = profile.stage1Summary;
    if (stage1.personalInterests) sections.push(`Interests: ${stage1.personalInterests}`);
    if (stage1.academicStrengths) sections.push(`Academic strengths: ${stage1.academicStrengths}`);
    if (stage1.careerGoals) sections.push(`Career goals: ${stage1.careerGoals}`);
    if (stage1.learningStyle) sections.push(`Learning style: ${stage1.learningStyle}`);
    if (stage1.personalValues) sections.push(`Values: ${stage1.personalValues}`);
  }
  
  if (profile.strengthTags?.length > 0) {
    sections.push(`Key strengths: ${profile.strengthTags.join(', ')}`);
  }
  
  if (profile.stage2Selection) {
    const selection = profile.stage2Selection;
    if (selection.anchor?.length > 0) sections.push(`Anchors: ${selection.anchor.join(', ')}`);
    if (selection.signal?.length > 0) sections.push(`Signals: ${selection.signal.join(', ')}`);
  }
  
  if (profile.likedRoles?.length > 0) {
    sections.push(`Interested roles: ${profile.likedRoles.length} roles selected`);
  }
  
  if (sections.length === 0) {
    return "Student exploring academic and career paths in South Korea.";
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
  
  try {
    const response = await fetch(`${API_URL}/api/generate-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (!data.success) {
      console.error('API returned failure:', data.error);
      throw new Error(data.error || 'Failed to generate recommendations');
    }

    console.log(`Received ${data.recommendations.length} recommendations`);
    return data;
    
  } catch (error) {
    console.error('=== AI Recommendation Error ===');
    console.error(error);
    throw error;
  }
};