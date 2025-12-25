// lib/aiCareerGenerator.ts
import OpenAI from 'openai';

interface UserProfile {
  questionnaireAnswers: Record<string, string[]>;
  keywords: string[];
  documents?: { text: string; type: string }[];
  personalityIndicators?: Record<string, string | number | boolean>;
}

interface CareerDetails {
  roleModels: { en: string[]; ko: string[] };
  companies: { en: string[]; ko: string[] };
  details: { en: string; ko: string };
  resources: { en: string[]; ko: string[] };
  skillsNeeded: { en: string[]; ko: string[] };
  salaryRange: { en: string; ko: string };
  growthPotential: { en: string; ko: string };
  aiExplanation: { en: string; ko: string };
}

interface AICareerData extends CareerDetails {
  generatedAt: string;
  version: string;
}

class AICareerGenerator {
  private openai: OpenAI;
  private cache: Map<string, AICareerData> = new Map();
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      dangerouslyAllowBrowser: true
    });
  }
  
  // Generate comprehensive career details using AI
  async generateCareerDetails(
    roleId: string,
    roleTitle: { en: string; ko: string },
    roleTagline: { en: string; ko: string },
    roleDomain: { en: string; ko: string },
    userProfile: UserProfile,
    language: 'en' | 'ko'
  ): Promise<AICareerData> {
    const cacheKey = `${roleId}-${language}-${JSON.stringify(userProfile.keywords)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      const prompt = this.buildPrompt(
        roleId,
        roleTitle,
        roleTagline,
        roleDomain,
        userProfile,
        language
      );
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a career expert who generates personalized career information. Provide accurate, inspiring, and realistic career details."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      const careerData: AICareerData = {
        roleModels: {
          en: result.roleModels?.en || [],
          ko: result.roleModels?.ko || []
        },
        companies: {
          en: result.companies?.en || [],
          ko: result.companies?.ko || []
        },
        details: {
          en: result.details?.en || '',
          ko: result.details?.ko || ''
        },
        resources: {
          en: result.resources?.en || [],
          ko: result.resources?.ko || []
        },
        skillsNeeded: {
          en: result.skillsNeeded?.en || [],
          ko: result.skillsNeeded?.ko || []
        },
        salaryRange: {
          en: result.salaryRange?.en || 'Varies by experience and location',
          ko: result.salaryRange?.ko || '경력과 지역에 따라 다양함'
        },
        growthPotential: {
          en: result.growthPotential?.en || 'High',
          ko: result.growthPotential?.ko || '높음'
        },
        aiExplanation: {
          en: result.aiExplanation?.en || '',
          ko: result.aiExplanation?.ko || ''
        },
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // Cache the result
      this.cache.set(cacheKey, careerData);
      
      return careerData;
      
    } catch (error) {
      console.error('AI Career Generation Error:', error);
      return this.getFallbackData(roleId, language);
    }
  }
  
  private buildPrompt(
    roleId: string,
    roleTitle: { en: string; ko: string },
    roleTagline: { en: string; ko: string },
    roleDomain: { en: string; ko: string },
    userProfile: UserProfile,
    language: 'en' | 'ko'
  ): string {
    const userKeywords = userProfile.keywords.join(', ');
    
    return `
Generate comprehensive and personalized career details for the role: ${roleTitle[language]} (${roleId})

ROLE INFORMATION:
- Title: ${roleTitle[language]}
- Tagline: ${roleTagline[language]}
- Domain: ${roleDomain[language]}

USER PROFILE (to personalize the details):
- Keywords/Interests: ${userKeywords}
- Personality Indicators: ${JSON.stringify(userProfile.personalityIndicators || {})}

Generate ALL the following sections in ${language === 'ko' ? 'Korean' : 'English'}:

1. ROLE MODELS (3-5 inspiring people in this field):
   - Provide real, diverse professionals who are influential in this field
   - Include brief reason why they're inspiring
   - Format as array of strings

2. COMPANIES/PLACES TO WORK (5-8 organizations):
   - Include both well-known companies and innovative startups
   - Include different types of organizations (corporate, non-profit, government, etc.)
   - Format as array of strings

3. WHAT THEY DO (Detailed description):
   - 3-4 paragraph description of daily tasks, responsibilities, and impact
   - Include both technical and soft skills aspects
   - Make it engaging and realistic

4. EXPLORE RESOURCES (5-7 learning resources):
   - Books, courses, websites, communities, tools
   - Mix of beginner-friendly and advanced resources
   - Format as array of strings

5. SKILLS NEEDED (6-10 key skills):
   - Technical skills, soft skills, tools
   - Format as array of strings

6. SALARY RANGE (Realistic range):
   - Entry-level to senior level
   - Based on current market data

7. GROWTH POTENTIAL (Career trajectory):
   - Short description of career progression
   - Industry growth trends

8. AI EXPLANATION (Why this fits the user):
   - 2-3 sentences explaining why this role matches user's profile
   - Connect to user's keywords and interests
   - Be encouraging and insightful

IMPORTANT: Return ALL data in ${language.toUpperCase()} only. Output must be valid JSON.
JSON Structure:
{
  "roleModels": {"en": [], "ko": []},
  "companies": {"en": [], "ko": []},
  "details": {"en": "", "ko": ""},
  "resources": {"en": [], "ko": []},
  "skillsNeeded": {"en": [], "ko": []},
  "salaryRange": {"en": "", "ko": ""},
  "growthPotential": {"en": "", "ko": ""},
  "aiExplanation": {"en": "", "ko": ""}
}

Only populate the language you're generating for. Leave other language arrays empty.
`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getFallbackData(roleId: string, language: 'en' | 'ko'): AICareerData {
    // Fallback data if AI fails
    const fallbacks: Record<string, CareerDetails> = {
      'ux-designer': {
        roleModels: {
          en: ['Don Norman', 'Steve Krug', 'Susan Kare'],
          ko: ['돈 노먼', '스티브 크루그', '수잔 케어']
        },
        companies: {
          en: ['Google', 'Apple', 'Figma', 'IDEO', 'Airbnb'],
          ko: ['구글', '애플', '피그마', '아이디오', '에어비앤비']
        },
        details: {
          en: 'UX Designers create intuitive and engaging digital experiences by understanding user needs and business goals. They conduct user research, create wireframes and prototypes, and collaborate with developers to implement designs.',
          ko: 'UX 디자이너는 사용자 요구사항과 비즈니스 목표를 이해하여 직관적이고 매력적인 디지털 경험을 창조합니다. 사용자 리서치를 수행하고, 와이어프레임과 프로토타입을 제작하며, 개발자와 협업하여 디자인을 구현합니다.'
        },
        resources: {
          en: ['Nielsen Norman Group', 'UX Collective', 'Interaction Design Foundation'],
          ko: ['닐슨 노먼 그룹', 'UX 콜렉티브', '인터랙션 디자인 재단']
        },
        skillsNeeded: {
          en: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Usability Testing'],
          ko: ['사용자 조사', '와이어프레임', '프로토타이핑', '피그마', '사용성 테스트']
        },
        salaryRange: {
          en: '$65,000 - $130,000',
          ko: '6,500만원 - 1억3,000만원'
        },
        growthPotential: {
          en: 'High demand with opportunities in tech companies, agencies, and startups',
          ko: '테크 기업, 에이전시, 스타트업에서 높은 수요'
        },
        aiExplanation: {
          en: 'This role combines creativity with user empathy, matching your interest in design and problem-solving.',
          ko: '이 역할은 창의성과 사용자 공감을 결합하여 디자인과 문제 해결에 대한 관심과 일치합니다.'
        }
      }
      // Add more fallbacks as needed
    };
    
    const fallback = fallbacks[roleId] || this.getGenericFallback();
    
    return {
      ...fallback,
      generatedAt: new Date().toISOString(),
      version: 'fallback'
    };
  }
  
  private getGenericFallback(): CareerDetails {
    return {
      roleModels: {
        en: ['Industry Leader 1', 'Innovator 2', 'Expert 3'],
        ko: ['산업 리더 1', '혁신가 2', '전문가 3']
      },
      companies: {
        en: ['Leading Tech Company', 'Innovative Startup', 'Research Institute'],
        ko: ['주요 기술 회사', '혁신적 스타트업', '연구 기관']
      },
      details: {
        en: 'This role involves solving complex problems and creating value through expertise in the field. Professionals typically engage in research, development, and implementation of solutions.',
        ko: '이 역할은 복잡한 문제를 해결하고 해당 분야의 전문 지식을 통해 가치를 창조하는 것을 포함합니다. 전문가들은 일반적으로 연구, 개발 및 솔루션 구현에 참여합니다.'
      },
      resources: {
        en: ['Professional Association', 'Online Course Platform', 'Industry Publications'],
        ko: ['전문 협회', '온라인 강의 플랫폼', '산업 간행물']
      },
      skillsNeeded: {
        en: ['Problem Solving', 'Communication', 'Technical Skills', 'Analytical Thinking'],
        ko: ['문제 해결', '커뮤니케이션', '기술적 능력', '분석적 사고']
      },
      salaryRange: {
        en: 'Varies by experience and location',
        ko: '경력과 지역에 따라 다양함'
      },
      growthPotential: {
        en: 'Good growth potential with opportunities for advancement',
        ko: '진출 기회와 함께 좋은 성장 잠재력'
      },
      aiExplanation: {
        en: 'This role aligns with your interests and shows potential for career growth.',
        ko: '이 역할은 귀하의 관심사와 일치하며 경력 성장 잠재력을 보여줍니다.'
      }
    };
  }
}

// Singleton instance
let generatorInstance: AICareerGenerator | null = null;

export const getAICareerGenerator = (): AICareerGenerator => {
  if (!generatorInstance) {
    generatorInstance = new AICareerGenerator();
  }
  return generatorInstance;
};