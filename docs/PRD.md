# PRD.md
**SCOPE+ - Dashboard-Based Career Exploration Platform**

---

## 1) Overview

SCOPE+ is a **dashboard-based, AI-powered career exploration platform** that guides Korean high school students through 6 progressive stages—from initial self-understanding to final specialization decisions. Each stage combines interactive activities (swipe mechanics, drag-drop, tournaments) with chatbot-guided reflection to build toward concrete course selection recommendations.

**Core Innovation:** Gamified exploration + AI synthesis → Data-driven course roadmap

**Product Purpose:** Help students navigate career exploration with structured, progressive stages that reduce decision paralysis and build toward actionable course selections.

---

## 2) Goals (Outcome-Based, Testable)

**G1. Complete Exploration Journey**  
Students complete all 6 stages from self-understanding to course roadmap, building confidence through structured progression.

**G2. Data-Driven Course Selection**  
Students receive AI-generated course recommendations based on their exploration patterns, interests, and skills identified across stages.

**G3. Reduced Decision Anxiety**  
Students feel less overwhelmed by having a clear, step-by-step process for career exploration.

**G4. Actionable Next Steps**  
Students leave with concrete course selections, skill development plans, and specialization focus areas.

**G5. Persistent Progress Tracking**  
Students can track their journey through a dashboard that shows completion status, insights, and recommendations.

---

## 3) Non-Goals (Explicit Exclusions)

- Replacing human counselors or advisors
- Guaranteeing university admission outcomes
- Providing therapy or mental health treatment
- Evaluating aptitude or "correctness" of choices
- Social features or peer comparison
- Integration with school systems or government platforms
- One-time assessment without ongoing support
- Forcing students into specific career paths

---

## 4) Audience

**Primary User:**  
Korean high school **Year 1-2 students (age ~15-17)** navigating course selection under the High School Credit System.

**Motivations**
- Explore career options systematically
- Reduce anxiety about course selection
- Understand their interests and strengths
- Get personalized course recommendations
- Build confidence in their academic path

**Constraints**
- Limited time for exploration
- Pressure from parents/teachers
- Need for concrete, actionable outcomes
- Desire for privacy in exploration process
- Preference for engaging, interactive experiences

---

## 5) Existing Solutions & Issues

**Current Options**
- Government platforms (CareerNet, WorkNet)
- School counselors (1:400 ratio)
- Hagwon counseling (expensive, biased)
- Career assessment tests (one-time, evaluative)

**Why They Fail**
- Evaluative rather than exploratory
- One-time assessments without follow-up
- Lack of gamification or engagement
- No progressive journey structure
- Don't translate exploration into course selections
- Not personalized based on multi-stage data

---

## 6) Assumptions

**A1. Progressive Stages Reduce Overwhelm**  
*Belief:* Breaking exploration into 6 stages makes the process manageable.  
*Why:* Students feel paralyzed by too many options at once.  
*Test:* Completion rates and user feedback on stage structure.

**A2. Gamification Increases Engagement**  
*Belief:* Swipe mechanics, tournaments, and interactive elements keep students engaged.  
*Why:* Traditional forms are boring and feel like homework.  
*Test:* Time spent in each stage and completion rates.

**A3. AI Synthesis Adds Value**  
*Belief:* AI analysis of multi-stage data produces better insights than single assessments.  
*Why:* Patterns across stages reveal deeper interests and fit.  
*Test:* User satisfaction with recommendations and alignment scores.

**A4. Dashboard Provides Clarity**  
*Belief:* Visual progress tracking and insights help students understand their journey.  
*Why:* Students need to see where they are and what they've discovered.  
*Test:* Dashboard engagement and return rates.

---

## 7) Constraints

**Non-Negotiable**
- Must work on mobile and desktop
- Data persistence across stages
- AI chatbot functional in multiple stages
- Progressive unlock system (complete stage to unlock next)
- Privacy and data security
- Responsive design for Korean students

**Technical Constraints**
- 24-hour MVP development timeline
- Next.js 14 with TypeScript
- Supabase for backend and auth
- OpenAI for AI features
- Vercel deployment

---

## 8) Key Use Cases

**UC1.** Student completes full 6-stage journey from questionnaire to course roadmap (G1, G4)  
**UC2.** Student explores 50 roles through swipe interface and discovers unexpected interests (G1, G3)  
**UC3.** Student receives AI-generated course recommendations based on exploration data (G2, G4)  
**UC4.** Student tracks progress through dashboard and revisits completed stages (G5)  
**UC5.** Student builds course roadmap with Anchor vs Signal framework (G2, G4)  
**UC6.** Student visualizes future through storyboard generation (G1, G3)  
**UC7.** Student narrows specializations through tournament bracket (G2, G4)

---

## 9) Requirements

### P0 — Must Work in MVP

**R1. Authentication & Dashboard**  
- *Acceptance:* User can sign up, log in, and access persistent dashboard  
- *Traceability:* G5, UC4

**R2. Stage 0: Initial Questionnaire**  
- *Acceptance:* User completes 5-10 questions with chatbot follow-up  
- *Traceability:* G1, UC1

**R3. Stage 1: Role Roulette**  
- *Acceptance:* User swipes through 50 roles, data captured per swipe  
- *Traceability:* G1, UC2

**R4. Stage 2: Course Roadmap Builder**  
- *Acceptance:* User drags subjects into Anchor/Signal buckets, receives AI suggestions  
- *Traceability:* G2, UC5

**R5. Data Persistence**  
- *Acceptance:* All stage data saved to database, accessible across sessions  
- *Traceability:* G5, UC4

**R6. AI Chatbot**  
- *Acceptance:* Functional chatbot in at least 2 stages (Stage 0 and Stage 3)  
- *Traceability:* G2, UC3

**R7. Progressive Unlock**  
- *Acceptance:* Stages unlock sequentially, dashboard shows completion status  
- *Traceability:* G1, UC1

### P1 — Nice to Have

**R8. Stage 3: Skill Translation**  
- *Acceptance:* Voice/text conversation generates Growth Character Report  
- *Traceability:* G4, UC1

**R9. Stage 4: Tournament Bracket**  
- *Acceptance:* User narrows specializations through elimination tournament  
- *Traceability:* G2, UC7

**R10. Stage 5: Storyboard**  
- *Acceptance:* User creates visual future narrative (text-based for MVP)  
- *Traceability:* G1, UC6

**R11. Final Dashboard Recommendations**  
- *Acceptance:* AI synthesizes all stages into course recommendations and next steps  
- *Traceability:* G2, G4, UC3

---

## 10) Stage Specifications

### Stage 0: Initial Questionnaire
- 5-10 questions (multi-select and single-select)
- Chatbot follow-up questions
- Captures: strengths, learning style, interests, fears, decision style
- Output: User profile baseline

### Stage 1: Role Roulette
- 50 curated career roles across 5 domains
- Tinder-style swipe interface (left/right/up)
- Captures: swipe direction, speed, tap count per role
- Output: Interest clusters, pattern analysis

### Stage 2: Course Roadmap Builder
- Drag-drop interface with Anchor vs Signal buckets
- AI suggestions based on Stage 0-1 data
- Captures: selected subjects, categorization, workload
- Output: Course combination recommendations

### Stage 3: Skill Translation
- Voice/text chatbot conversation
- Maps courses to skills journey
- Captures: skill insights, growth narrative
- Output: Growth Character Report

### Stage 4: Tournament Bracket
- 8 specializations → 4 → 2 → final selection
- Head-to-head comparison interface
- Captures: elimination choices, rationale
- Output: 2-3 final specializations

### Stage 5: Storyboard
- AI-assisted future visualization
- 6-panel storyboard creation
- Captures: timeline choice, scene descriptions
- Output: Visual future narrative

---

## 11) Technical Requirements

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- Framer Motion (animations)
- Zustand (state management)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth
- Next.js API Routes

**AI Services:**
- OpenAI GPT-4 Turbo (chatbot, analysis)
- OpenAI Whisper (speech-to-text)
- DALL-E 3 or Stable Diffusion (image generation for Stage 5)

**Deployment:**
- Vercel

---

## 12) Success Metrics

**MVP Success Criteria:**
- One complete user journey start-to-finish
- Data persistence across stages
- AI chatbot functional in at least 2 stages
- Demo-ready presentation flow
- All 6 stages accessible and functional

**Post-MVP Metrics:**
- Stage completion rates
- Time to complete full journey
- User satisfaction with recommendations
- Return rate to dashboard
- Course selection confidence scores

---

## 13) Open Questions / Decisions Needed

1. How detailed should Stage 5 storyboard be in MVP? (Text-only vs AI images)
2. What's the minimum viable role pool for Stage 1? (50 roles vs smaller set)
3. How many course combinations should Stage 2 generate? (3 recommended vs more)
4. Should Stage 4 tournament allow selecting both finalists?
5. What level of AI analysis depth is needed for Stage 1 insights?

---

## 14) PRD Quality Check

- **Explainable in 60 seconds?** YES — 6-stage progressive career exploration journey  
- **Scope-limited?** YES — MVP focuses on core journey, optional stages clearly marked  
- **Clear what NOT to do?** YES — Non-Goals section explicitly excludes certain features  

---

**End of PRD.md**
