// lib/aiCareerRecommender.ts
import OpenAI from 'openai';
import rolesData from '@/lib/data/roles.json';
import { getAICareerGenerator } from './aiCareerGenerator';

interface RoleData {
  id: string;
  title: { en: string; ko: string };
  domain: { en: string; ko: string };
  tagline: { en: string; ko: string };
}

interface UserProfile {
  questionnaireAnswers: Record<string, string[]>;
  keywords: string[];
  documents?: { text: string; type: string }[];
}

interface AIRecommendation {
  roleId: string;
  score: number;
  explanation: { en: string; ko: string };
  matchingKeywords: string[];
  roleData: RoleData;
}

class AICareerRecommender {
  private roles: RoleData[];
  private careerGenerator: ReturnType<typeof getAICareerGenerator>;
  
  constructor() {
    this.roles = rolesData;
    this.careerGenerator = getAICareerGenerator();
  }
  
  // Use AI to select top 5 roles based on user profile
  async getTop5Roles(
    userProfile: UserProfile,
    language: 'en' | 'ko'
  ): Promise<AIRecommendation[]> {
    try {
      // Prepare user data for AI analysis
      const userDataText = this.prepareUserDataForAI(userProfile);
      
      // Get AI analysis of which roles fit best
      const aiAnalysis = await this.analyzeWithAI(userDataText, language);
      
      if (aiAnalysis && aiAnalysis.recommendations) {
        return aiAnalysis.recommendations;
      }
      
      // Fallback: Use keyword matching
      return this.getFallbackRecommendations(userProfile, language);
      
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      return this.getFallbackRecommendations(userProfile, language);
    }
  }
  
  private prepareUserDataForAI(userProfile: UserProfile): string {
    const answers = userProfile.questionnaireAnswers || {};
    const keywords = userProfile.keywords || [];

    return `
USER PROFILE ANALYSIS:

Questionnaire Summary:
${Object.entries(answers)
  .map(([qId, ans]) => `- ${qId}: ${ans.join(', ')}`)
  .join('\n')}

Keywords & Interests:
${keywords.join(', ')}

Document Themes (if any):
${userProfile.documents?.map(d => d.text.substring(0, 500)).join('\n\n') || 'No documents provided'}
`;
  }
  
  private async analyzeWithAI(
    userData: string,
    language: 'en' | 'ko'
  ): Promise<{ recommendations: AIRecommendation[] } | null> {
    const prompt = `
Analyze this user profile and select the 5 most suitable career roles from this list:

AVAILABLE ROLES:
${this.roles.map(role => 
  `- ${role.id}: ${role.title[language]} (${role.domain[language]}) - ${role.tagline[language]}`
).join('\n')}

USER PROFILE:
${userData}

Select 5 roles that best match:
1. User's interests and keywords
2. Personality indicators from questionnaire
3. Long-term growth potential
4. Skill alignment

For each selected role, provide:
- Score (0-100) indicating match quality
- Detailed explanation in ${language} why this role fits
- Key matching keywords/theme

Return as JSON with this structure:
{
  "recommendations": [
    {
      "roleId": "string",
      "score": number,
      "explanation": {"en": "string", "ko": "string"},
      "matchingKeywords": ["string"],
      "roleData": {} // include the full role data
    }
  ]
}
`;

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Enrich with role data
      if (result.recommendations) {
        result.recommendations = result.recommendations.map((rec: AIRecommendation) => ({
          ...rec,
          roleData: this.roles.find(r => r.id === rec.roleId) as RoleData
        }));
      }
      
      return result;
    } catch (error) {
      console.error('OpenAI Analysis Error:', error);
      return null;
    }
  }
  
  private getFallbackRecommendations(
    userProfile: UserProfile,
    language: 'en' | 'ko'
  ): AIRecommendation[] {
    const userKeywords = userProfile.keywords.map(k => k.toLowerCase());
    
    const scoredRoles = this.roles.map(role => {
      const roleText = `${role.title[language]} ${role.tagline[language]} ${role.domain[language]}`.toLowerCase();
      const matches = userKeywords.filter(keyword => 
        roleText.includes(keyword) || 
        role.id.includes(keyword)
      );
      
      const score = matches.length * 20;
      
      return {
        roleId: role.id,
        score,
        explanation: {
          en: `Matches ${matches.length} of your interests`,
          ko: `관심사 ${matches.length}개와 일치함`
        },
        matchingKeywords: matches,
        roleData: role
      };
    });
    
    return scoredRoles
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
  
  // Generate all career details for a role
  async generateCompleteCareerData(
    roleId: string,
    userProfile: UserProfile,
    language: 'en' | 'ko'
  ) {
    const role = this.roles.find(r => r.id === roleId);
    if (!role) return null;
    
    return await this.careerGenerator.generateCareerDetails(
      roleId,
      role.title,
      role.tagline,
      role.domain,
      userProfile,
      language
    );
  }
}

// Singleton instance
let recommenderInstance: AICareerRecommender | null = null;

export const getAICareerRecommender = (): AICareerRecommender => {
  if (!recommenderInstance) {
    recommenderInstance = new AICareerRecommender();
  }
  return recommenderInstance;
};