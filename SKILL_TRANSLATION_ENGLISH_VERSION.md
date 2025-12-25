# 🌍 Skill Translation - English Version

## Overview

The Skill Translation feature now supports **both Korean and English** languages. The system automatically detects the user's language preference from the language store and provides appropriate responses.

## What's New

### 1. English Happy Path (`lib/fallback/happyPathEn.ts`)
- Complete 12-turn conversation script in English
- Same structure as Korean version but with English responses
- Includes FIT/FEAR detection responses in English
- Generic fallbacks in English

### 2. Updated Pattern Matcher (`lib/fallback/patternMatcher.ts`)
- Now accepts `language` parameter ('ko' | 'en')
- Automatically selects appropriate happy path based on language
- Language-aware pattern matching for vague responses and questions
- Supports both Korean and English keywords for FIT/FEAR detection

### 3. Updated API Route (`app/api/skill-translation/chat/route.ts`)
- Accepts `language` parameter in request body
- Builds language-appropriate system prompt for OpenAI
- Passes language to pattern matcher for fallback responses

### 4. Updated Stage 3 Page (`app/(dashboard)/stage3/page.tsx`)
- Reads language from `useLanguageStore()`
- Passes language to API calls
- Language-aware UI text (headings, placeholders, buttons)
- Language-aware error messages

## How It Works

1. **Language Detection**: The page reads the current language from `useLanguageStore()`
2. **API Request**: Language is sent in the request body to `/api/skill-translation/chat`
3. **OpenAI Response**: System prompt is built in the appropriate language
4. **Fallback Response**: Pattern matcher uses the correct happy path based on language

## Language Support

### Korean (Default)
- Uses `HAPPY_PATH_TURNS` from `happyPath.ts`
- Korean system prompt for OpenAI
- Korean UI text

### English
- Uses `HAPPY_PATH_TURNS_EN` from `happyPathEn.ts`
- English system prompt for OpenAI
- English UI text

## Files Modified/Created

### New Files
- `lib/fallback/happyPathEn.ts` - English conversation script

### Modified Files
- `lib/fallback/patternMatcher.ts` - Added language support
- `app/api/skill-translation/chat/route.ts` - Added language parameter
- `app/(dashboard)/stage3/page.tsx` - Integrated language store

## Usage

The language is automatically detected from the user's language preference. No additional configuration needed!

### Manual Language Override (if needed)

In the API request, you can explicitly set the language:

```typescript
const response = await fetch('/api/skill-translation/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [],
    userContext,
    currentTurn: 0,
    language: 'en', // or 'ko'
    forceRealAPI: false,
  }),
});
```

## Testing

1. **Switch Language**: Use the language toggle in the app (usually in TopBar)
2. **Visit Stage 3**: Go to `/stage3`
3. **Check Responses**: All messages should be in the selected language
4. **Test Fallback**: Disable OpenAI API key to test fallback responses

## Example English Conversation

```
Turn 1:  "Hi [Name]! Looking at the courses you've chosen..."
Turn 2:  "Creative problem-solving! Why does that feel important to you?"
Turn 3:  "I can feel that you want to solve real-world problems..."
...
Turn 12: "Thanks for sharing today. Ready to move to the next step?"
```

## Pattern Matching

The pattern matcher now recognizes both languages:

### Korean Patterns
- Vague: '모르겠', '잘 모르', '글쎄'
- Questions: '뭐', '어떻게', '왜'
- FIT: '흥미', '재미', '좋아'
- FEAR: '필요', '걱정', '불안'

### English Patterns
- Vague: 'dont know', "don't know", 'not sure'
- Questions: 'what', 'how', 'why'
- FIT: 'interested', 'fun', 'like'
- FEAR: 'need', 'worry', 'anxious'

## Notes

- Language preference is stored in `localStorage` via `useLanguageStore`
- Default language is Korean ('ko') if not set
- All conversation turns are available in both languages
- UI text is dynamically translated based on language

## Future Enhancements

- Add more languages (e.g., Japanese, Chinese)
- Language-specific course name translations
- Automatic language detection from user input
- Language-specific skill keyword extraction

---

**The English version is fully functional and ready to use!** 🎉

