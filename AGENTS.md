# Repository Guidelines

This repository is a documentation-only project for **SCOPE+** (Dashboard-Based Career Exploration Platform). Keep changes focused on clarity, structure, and correctness of the written guidance.

## Project Structure & Module Organization

### Core Documentation Files

- `README.md`: Project overview and structure
- `REVISED_24HR_PLAN.md`: 24-hour MVP development plan with hour-by-hour breakdown
- `REVISED_APP_BLUEPRINT.md`: Complete product architecture and stage specifications

### Documentation Directory (`docs/`)

- `PRD.md`: Product requirements and goals for SCOPE+
- `PROBLEM.md`: Problem statement, constraints, and user needs
- `SOLUTION.md`: Proposed solution details and rationale

### Adding New Documents

Add new documents only when they represent a distinct artifact (for example, `DECISIONS.md` for architectural decisions) and keep them at the top level or in `docs/` as appropriate.

---

## Build, Test, and Development Commands

There are no build, test, or runtime commands configured in this repository. Validate updates by reviewing the Markdown rendering in your editor and checking for broken headings, lists, or code fences.

---

## Coding Style & Naming Conventions

- Use Markdown with ATX headings (`#`, `##`, `###`)
- Keep paragraphs short and use bullet lists for sequences or enumerations
- Indent nested lists with two spaces; avoid tabs
- Follow the existing naming pattern for files: uppercase topic names with `.md` (for example, `SOLUTION.md`)
- Use fenced code blocks for commands or examples and specify a language tag when possible
- Reference SCOPE+ consistently (not "Mirae" or other names)

---

## Testing Guidelines

No automated tests exist. Perform a manual review for:

- Factual accuracy
- Consistent terminology across documents
- Proper Markdown formatting
- Alignment with `REVISED_24HR_PLAN.md` and `REVISED_APP_BLUEPRINT.md`
- Consistency with SCOPE+ product vision (6-stage journey, dashboard-based, AI-powered)

---

## Commit & Pull Request Guidelines

This folder does not include Git history, so there are no established commit conventions to reference. Use clear, imperative commit messages (for example, "Update PRD to reflect SCOPE+ 6-stage journey") and keep commits scoped to a single doc change.

For pull requests, include:

- A short summary of what changed and why
- Links to related issues or discussions, if any
- Notes on downstream docs that may need follow-up edits
- Verification that changes align with `REVISED_24HR_PLAN.md` and `REVISED_APP_BLUEPRINT.md`

---

## SCOPE+ Product Context

When making changes, ensure alignment with:

- **Product Name**: SCOPE+ (not Mirae or other names)
- **Core Concept**: Dashboard-based, multi-stage, AI-powered career exploration
- **6 Stages**: Stage 0 (Questionnaire), Stage 1 (Role Roulette), Stage 2 (Course Roadmap), Stage 3 (Skill Translation), Stage 4 (Tournament), Stage 5 (Storyboard)
- **Tech Stack**: Next.js 14, TypeScript, Supabase, OpenAI
- **Target Users**: Korean high school students (Year 1-2)

---

## Documentation Consistency

Ensure all documentation:

1. References the correct product name (SCOPE+)
2. Describes the 6-stage journey accurately
3. Aligns with technical architecture in `REVISED_APP_BLUEPRINT.md`
4. Matches development plan in `REVISED_24HR_PLAN.md`
5. Uses consistent terminology (e.g., "Anchor vs Signal", "Role Roulette", "Growth Character Report")

---

**End of AGENTS.md**

