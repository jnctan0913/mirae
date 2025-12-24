# SCOPE+ Setup Guide

This guide will help you set up the SCOPE+ application for development.

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works)
- OpenAI API key

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Run the database migrations (see `supabase/migrations/` - to be created)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set Up Database Schema

Run the SQL migrations in your Supabase SQL editor. The schema is defined in `REVISED_APP_BLUEPRINT.md`.

Key tables needed:
- `users` (handled by Supabase Auth)
- `user_profiles`
- `role_swipes`
- `course_selections`
- `growth_reports`
- `tournament_results`
- `storyboards`
- `chat_messages`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── login/
│   └── signup/
├── (dashboard)/         # Protected dashboard routes
│   ├── dashboard/       # Main dashboard hub
│   ├── stage0/          # Initial Questionnaire
│   ├── stage1/          # Role Roulette
│   ├── stage2/          # Course Roadmap Builder
│   ├── stage3/          # Skill Translation
│   ├── stage4/          # Tournament Bracket
│   └── stage5/          # Storyboard
├── api/                 # API routes
│   ├── chat/            # Chatbot API
│   └── analyze-roles/   # Role analysis API
├── layout.tsx           # Root layout
└── page.tsx             # Home page (redirects to dashboard)

lib/
├── supabase.ts          # Supabase client setup
├── openai.ts            # OpenAI service functions
└── stores/
    └── userStore.ts     # Zustand user state store

components/              # React components (to be expanded)
```

## Next Steps

1. **Expand Stage 0**: Add all questionnaire questions from the blueprint
2. **Expand Stage 1**: Add all 50 roles with proper swipe mechanics
3. **Implement Stage 2**: Add drag-drop functionality with @hello-pangea/dnd
4. **Enhance Stage 3**: Add voice input and full conversation flow
5. **Complete Stage 4**: Implement full tournament bracket logic
6. **Finish Stage 5**: Add AI image generation for storyboards

## Development Notes

- The application uses Next.js 14 App Router
- TypeScript is configured with strict mode
- Tailwind CSS is set up for styling
- Zustand is used for client-side state management
- Supabase handles authentication and database
- OpenAI GPT-4 Turbo is used for AI features

## Troubleshooting

- **Auth errors**: Make sure Supabase environment variables are correct
- **Database errors**: Ensure all tables are created in Supabase
- **API errors**: Check OpenAI API key and rate limits

