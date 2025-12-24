# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages and routes, including `(auth)` and `(dashboard)` stage pages.
- `components/`: Shared UI like `components/TopBar.tsx`.
- `lib/`: Client utilities (auth, i18n, OpenAI, Supabase, Zustand stores).
- `public/`: Static assets.
- `docs/`: Product docs (PRD, PROBLEM, SOLUTION).
- `middleware.ts`: Route middleware (currently pass-through).

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Run local dev server at `http://localhost:3000`.
- `npm run build`: Build the production bundle.
- `npm run start`: Run the production server.
- `npm run lint`: Run Next.js ESLint rules.

## Coding Style & Naming Conventions
- TypeScript + React, 2-space indentation, semicolons used in existing files.
- Components/pages: PascalCase for components, `page.tsx` for routes.
- Hooks/stores: camelCase (e.g., `useUserStore`).
- Tailwind CSS for styling; keep class lists readable and grouped by layout ? spacing ? color.

## Testing Guidelines
- No automated tests are currently configured.
- If adding tests, document the framework and add corresponding `npm` scripts.

## Commit & Pull Request Guidelines
- No formal commit convention found; use clear, imperative messages (e.g., "Add Stage 2 drag-drop").
- PRs should include: scope summary, screenshots for UI changes, and any follow-up items.

## Security & Configuration Tips
- Configure `.env.local` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY` for full functionality.
- Avoid committing secrets; `.env.local` should stay local.
