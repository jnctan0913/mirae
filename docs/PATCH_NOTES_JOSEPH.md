# Joseph Branch Patch Notes

## Highlights
- Stage 1 gets a full “Role Roulette” redesign with swipe/drag, keyboard arrows, flip-to-details cards, richer role metadata, and a new summary view with carousel + redo flow.
- Stage 2 expands recommendations using strengths, liked roles, and uploaded-doc keywords; adds save slots, clearer bucket labels, and a dedicated summary page with alignment scoring.
- Dashboard now surfaces Stage 1 liked roles and Stage 2 selection alignment at a glance.
- Onboarding uploads parse PDFs/text to extract keywords and persist profile signals for later suggestions.
- New i18n strings for Stage 1 summary + updated Stage 2 labels/helpers.
- Dependency update adds `pdfjs-dist` for PDF parsing.

## Detailed Updates
### Stage 1
- Adds bilingual role data with details/resources/role models/companies.
- New UI: gradient/glass style, swipe gestures, keyboard support, flip card, and state persistence.
- New summary page with carousel, redo confirmation, and navigation.

### Stage 2
- Suggestions scoring now incorporates uploaded-doc keywords; adds “recommended bucket” highlighting and revised copy.
- Saves current selection and adds 3 save slots; “View summary” CTA; refreshed styling.
- New summary page with required/elective lists, profile snapshot, alignment breakdown, and redo option.

### Dashboard
- Shows liked roles preview + Stage 2 fit score and counts pulled from storage.

### Onboarding
- Extracts keywords from uploaded PDFs/text and persists to `userProfile` for later recommendations.

## Notes
- Tests not run (no test suite configured).
