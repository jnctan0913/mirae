# SCOPE+
**Dashboard-Based, Multi-Stage, AI-Powered Career Exploration Platform**

---

## Overview

SCOPE+ is a dashboard-based career exploration platform that guides Korean high school students through 6 progressive stages - from initial self-understanding to final course selections. Each stage combines interactive activities (swipe mechanics, drag-drop, tournaments) with chatbot-guided reflection to build toward concrete course recommendations.

**Core Innovation:** Gamified exploration + AI synthesis -> Data-driven course roadmap

---

## Project Structure

This repository contains documentation for the SCOPE+ project. The project structure follows the specifications in `REVISED_24HR_PLAN.md` and `REVISED_APP_BLUEPRINT.md`.

### Documentation Files

```
.
+-- README.md                    # This file - project overview
+-- REVISED_24HR_PLAN.md         # 24-hour MVP development plan
+-- REVISED_APP_BLUEPRINT.md     # Complete product architecture blueprint
+-- AGENTS.md                    # Repository guidelines
+-- docs/
    +-- PRD.md                   # Product Requirements Document
    +-- PROBLEM.md              # Problem statement and context
    +-- SOLUTION.md             # Solution architecture and design
```

### Application Structure

The application has been set up with the following structure:

```
app/
+-- (auth)/
|   +-- login/           OK Login page
|   +-- signup/          OK Signup page
+-- (dashboard)/
|   +-- dashboard/       OK Main dashboard hub
|   +-- stage0/          OK Initial Questionnaire
|   +-- stage1/          OK Role Roulette
|   +-- stage2/          OK Course Roadmap Builder
|   +-- stage3/          OK Skill Translation
|   +-- stage4/          OK Tournament Bracket
|   +-- stage5/          OK Storyboard
+-- api/
|   +-- chat/            OK Chatbot API
|   +-- analyze-roles/   OK Role analysis API
+-- layout.tsx           OK Root layout
+-- page.tsx             OK Home page (redirects to dashboard)

lib/
+-- auth.ts              OK Hardcoded authentication (2 test users)
+-- openai.ts            OK OpenAI service functions
+-- stores/
    +-- userStore.ts     OK Zustand user state store

components/              # To be expanded with UI components
```

**Status**: Core application structure is in place.

**Test Accounts**:
- Email: student1@test.com, Password: password123 (김민수)
- Email: student2@test.com, Password: password123 (이지은)

---

## The 6-Stage Journey

### Stage 0: Initial Questionnaire
Self-understanding through survey-style question cards with chatbot follow-up.
Question source: `lib/data/questionnaire.json` (MCQ, Slider, Swipe, Tournament).

### Stage 1: Role Roulette
Tinder-style swipe interface to explore 50 career roles and discover interests.

### Stage 2: Course Roadmap Builder
Drag-drop interface to build course selections using Anchor vs Signal framework with AI suggestions.

### Stage 3: Skill Translation
Voice/text chatbot conversation that generates a Growth Character Report mapping courses to skills.

### Stage 4: Tournament Bracket
March Madness-style elimination tournament to narrow down to 2-3 specializations.

### Stage 5: Storyboard
AI-assisted future visualization creating 6-panel storyboards of student's future path.

### Final Dashboard
Synthesizes all stages into actionable course recommendations and next steps.

---

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- Framer Motion
- Zustand

**Backend:**
- Hardcoded Authentication (2 test users)
- LocalStorage for data persistence
- Next.js API Routes

**AI Services:**
- OpenAI GPT-4 Turbo
- DALL-E 3 / Stable Diffusion
- OpenAI Whisper API
- Text-to-Speech API

**Deployment:**
- Vercel

---

## Development Plan

See `REVISED_24HR_PLAN.md` for the complete 24-hour MVP development plan, including:

- Hour-by-hour breakdown
- Implementation details for each stage
- Database schema
- API routes
- Component specifications

---

## Product Architecture

See `REVISED_APP_BLUEPRINT.md` for the complete product architecture, including:

- Detailed stage specifications
- UI/UX designs
- Data flow
- AI prompt engineering
- Database schema

---

## Documentation

- **PRD.md**: Product requirements and goals
- **PROBLEM.md**: Problem statement, constraints, and user needs
- **SOLUTION.md**: Proposed solution details and rationale

---

## MVP Success Criteria

- OK One complete user journey start-to-finish
- OK Data persistence across stages
- OK AI chatbot functional in at least 2 stages
- OK Demo-ready presentation flow
- OK All 6 stages accessible and functional

---

## Key Features

- **Dashboard-centric**: Progress tracking, stage navigation, insights overview
- **Progressive unlock**: Complete one stage to unlock next
- **Multi-modal input**: Swipes, chat, voice, drag-drop, tournament selection
- **AI synthesis**: Each stage produces insights that feed into next stage
- **Actionable outcomes**: Direct translation to course recommendations

---

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open http://localhost:3000
4. Login with test accounts:
   - student1@test.com / password123
   - student2@test.com / password123

---

## Repository Guidelines

See `AGENTS.md` for repository guidelines, coding standards, and contribution guidelines.

---

**End of README.md**
