# SCOPE+
**Dashboard-Based, Multi-Stage, AI-Powered Career Exploration Platform**

---

## Overview

SCOPE+ is a dashboard-based career exploration platform that guides Korean high school students through 6 progressive stages—from initial self-understanding to final course selections. Each stage combines interactive activities (swipe mechanics, drag-drop, tournaments) with chatbot-guided reflection to build toward concrete course recommendations.

**Core Innovation:** Gamified exploration + AI synthesis → Data-driven course roadmap

---

## Project Structure

This repository contains documentation for the SCOPE+ project. The project structure follows the specifications in `REVISED_24HR_PLAN.md` and `REVISED_APP_BLUEPRINT.md`.

### Documentation Files

```
.
├── README.md                    # This file - project overview
├── REVISED_24HR_PLAN.md         # 24-hour MVP development plan
├── REVISED_APP_BLUEPRINT.md     # Complete product architecture blueprint
├── AGENTS.md                    # Repository guidelines
└── docs/
    ├── PRD.md                   # Product Requirements Document
    ├── PROBLEM.md              # Problem statement and context
    └── SOLUTION.md             # Solution architecture and design
```

### Application Structure

The application has been set up with the following structure:

```
app/
├── (auth)/
│   ├── login/           ✅ Login page
│   └── signup/          ✅ Signup page
├── (dashboard)/
│   ├── dashboard/       ✅ Main dashboard hub
│   ├── stage0/          ✅ Initial Questionnaire
│   ├── stage1/          ✅ Role Roulette
│   ├── stage2/          ✅ Course Roadmap Builder
│   ├── stage3/          ✅ Skill Translation
│   ├── stage4/          ✅ Tournament Bracket
│   └── stage5/          ✅ Storyboard
├── api/
│   ├── chat/            ✅ Chatbot API
│   └── analyze-roles/   ✅ Role analysis API
├── layout.tsx           ✅ Root layout
└── page.tsx             ✅ Home page (redirects to dashboard)

lib/
├── supabase.ts          ✅ Supabase client setup
├── openai.ts            ✅ OpenAI service functions
└── stores/
    └── userStore.ts     ✅ Zustand user state store

components/              # To be expanded with UI components
```

**Status**: Core application structure is in place. See `SETUP.md` for installation instructions.

---

## The 6-Stage Journey

### Stage 0: Initial Questionnaire
Self-understanding through conversational data collection with chatbot follow-up.

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
- Supabase (PostgreSQL)
- Supabase Auth
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

- ✅ One complete user journey start-to-finish
- ✅ Data persistence across stages
- ✅ AI chatbot functional in at least 2 stages
- ✅ Demo-ready presentation flow
- ✅ All 6 stages accessible and functional

---

## Key Features

- **Dashboard-centric**: Progress tracking, stage navigation, insights overview
- **Progressive unlock**: Complete one stage to unlock next
- **Multi-modal input**: Swipes, chat, voice, drag-drop, tournament selection
- **AI synthesis**: Each stage produces insights that feed into next stage
- **Actionable outcomes**: Direct translation to course recommendations

---

## Getting Started

This is a documentation repository. For implementation:

1. Review `REVISED_24HR_PLAN.md` for development timeline
2. Review `REVISED_APP_BLUEPRINT.md` for architecture details
3. Follow the project structure outlined in the plan
4. Set up environment as specified (Next.js, Supabase, OpenAI)

---

## Repository Guidelines

See `AGENTS.md` for repository guidelines, coding standards, and contribution guidelines.

---

**End of README.md**
