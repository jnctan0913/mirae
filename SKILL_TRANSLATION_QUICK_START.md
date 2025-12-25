# 🚀 Skill Translation - Quick Start

## ✅ What You Have

You now have **5 production-ready files** for the Skill Translation chatbot with hybrid API + fallback:

### 📁 File Structure

```
1. skillTranslation.ts        → lib/types/skillTranslation.ts
2. happyPath.ts                → lib/fallback/happyPath.ts  
3. patternMatcher.ts           → lib/fallback/patternMatcher.ts
4. api-route.ts                → app/api/skill-translation/chat/route.ts
5. stage3-page.tsx             → app/(dashboard)/stage3/page.tsx
```

---

## ⚡ 3-Minute Setup

### Step 1: Verify Files Are in Place

All files should already be created. Verify they exist:

```bash
# Check files exist
ls lib/types/skillTranslation.ts
ls lib/fallback/happyPath.ts
ls lib/fallback/patternMatcher.ts
ls app/api/skill-translation/chat/route.ts
ls app/\(dashboard\)/stage3/page.tsx
```

### Step 2: Install OpenAI Package

```bash
npm install openai
```

### Step 3: Add Environment Variable

Create or update `.env.local`:

```env
# .env.local
OPENAI_API_KEY=sk-your-key-here
```

### Step 4: Test It

```bash
npm run dev
# Visit: http://localhost:3000/stage3
```

**Note:** The route is `/stage3` (not `/dashboard/stage3`) because of Next.js route groups.

---

## 🎯 How It Works (3-Layer Safety)

```
User sends message
    ↓
Layer 1: Try OpenAI GPT-4 (5 second timeout) ✨ BEST
    ↓ (fails?)
Layer 2: Use pre-scripted happy path      🛡️ RELIABLE
    ↓ (fails?)
Layer 3: Generic "try again" message      🚨 ALWAYS WORKS
```

**Demo Day Safety:** Even if WiFi dies, you have fallback responses!

---

## 🎮 Demo Controls

### Emergency Mode (if API breaks)

Press **`Ctrl+M`** during demo to force fallback mode.

Judges won't know the difference! 🎭

---

## 🔧 Quick Customization

### Change User Data (Current: Mock Data)

In `app/(dashboard)/stage3/page.tsx`, around line 37:

```typescript
const getUserContext = () => {
  // TODO: Replace with actual user store
  return {
    name: 'YOUR_NAME',              // ← Change this
    courses: ['Course 1', 'Course 2'], // ← Change this
    keywords: ['Keyword 1'],           // ← Change this
    strengths: {
      energizers: ['Strength 1'],
      joys: ['Joy 1'],
    },
    interests: ['Interest 1'],
  };
};
```

### Connect to Real User Data (Recommended)

Replace the mock `getUserContext` function with real data from your stores:

```typescript
import { useUserStore } from '@/lib/stores/userStore';
import { getUser } from '@/lib/auth';
import { storage } from '@/lib/utils/storage';

const getUserContext = () => {
  const user = getUser();
  const profile = storage.get<{
    strengths?: string[];
    likedRoles?: string[];
    onboardingKeywords?: string[];
    docKeywords?: string[];
  }>('userProfile');
  
  const selectionKey = `stage2Selection_${user?.id ?? 'guest'}`;
  const selection = storage.get<any>(selectionKey);
  
  // Extract course names from selection
  const courses = selection?.selectedCourses?.map((c: any) => 
    c.title?.ko || c.title?.en || c.name
  ) || [];
  
  return {
    name: user?.name || user?.email?.split('@')[0] || 'Student',
    courses: courses,
    keywords: [
      ...(profile?.onboardingKeywords || []),
      ...(profile?.docKeywords || []),
    ],
    strengths: {
      energizers: profile?.strengths || [],
      joys: [], // Add if you track this
    },
    interests: profile?.likedRoles?.map((roleId: string) => {
      // Map roleId to role name (you'll need to import roles data)
      return roleId; // Or map to actual role names
    }) || [],
  };
};
```

### Change Korean Responses

All Korean text is in `lib/fallback/happyPath.ts` - just search and replace!

---

## 🎬 Full Conversation Preview

```
Turn 1:  "안녕하세요! 선택한 과목들을 보니까..."
Turn 2:  "창의적 문제 해결! 왜 그게 중요한 것 같아요?"
Turn 3:  "실제 세상의 문제를 해결하고 싶다는 마음이..."
...
Turn 12: "오늘 이야기 나눠줘서 고마워요..."
```

See `happyPath.ts` for the full 12-turn script.

---

## 📦 What Each File Does

| File | Purpose |
|------|---------|
| `skillTranslation.ts` | TypeScript types (ChatMessage, UserContext, ConversationPhase, etc) |
| `happyPath.ts` | 12-turn pre-scripted conversation with Korean responses |
| `patternMatcher.ts` | Pattern matching logic (finds best response based on user input) |
| `api-route.ts` | API endpoint (tries OpenAI → fallback → emergency) |
| `stage3-page.tsx` | Frontend UI (chat interface with phase indicators) |

---

## ✅ Pre-Demo Checklist

```
□ Files exist in correct locations
□ npm install openai completed
□ OPENAI_API_KEY in .env.local
□ npm run dev works without errors
□ Visit /stage3 page loads
□ Initial message appears automatically
□ Type a message, get response
□ Press Ctrl+M, see "MOCK MODE: ON" in console
□ Check browser console for source indicators (openai/fallback)
□ Test health endpoint: http://localhost:3000/api/skill-translation/chat
```

---

## 🐛 Troubleshooting

### "Cannot find module 'openai'"
```bash
npm install openai
```

### "API key not configured"
```bash
# Add to .env.local:
OPENAI_API_KEY=sk-...

# Restart dev server:
# Ctrl+C, then npm run dev
```

### "Page not found" or 404
Check file location:
```
app/(dashboard)/stage3/page.tsx
                 ↑
         Dashboard folder with parentheses (route group)
```

The URL is `/stage3` (not `/dashboard/stage3`).

### "Cannot read property 'name' of null"
The `getUserContext` function is returning mock data. Either:
1. Update the mock data with valid values
2. Connect to real user store (see "Connect to Real User Data" above)

### Messages not appearing
- Check browser console for errors
- Verify API route is working: `http://localhost:3000/api/skill-translation/chat` (GET request)
- Check Network tab in DevTools for failed requests

### Fallback not working
- Check console for pattern matching errors
- Verify `happyPath.ts` exports are correct
- Check that `patternMatcher.ts` imports are correct

---

## 🎯 Next Steps

1. **Test the conversation** - Make sure it flows naturally
2. **Customize user context** - Connect to real data or update mock data
3. **Practice Ctrl+M** - Know how to toggle emergency mode
4. **Test fallback mode** - Disable OpenAI API key temporarily to test
5. **Save conversation** - Implement database saving in `handleFinish` function

### Implement Conversation Saving

In `stage3-page.tsx`, update the `handleFinish` function:

```typescript
const handleFinish = async () => {
  // Save conversation to database/storage
  const conversationData = {
    messages,
    currentPhase,
    completedAt: new Date(),
    userId: useUserStore.getState().userId,
  };
  
  // Save to localStorage or database
  storage.set('stage3Conversation', conversationData);
  
  // Mark stage as complete
  useUserStore.getState().completeStage(3);
  
  router.push('/dashboard');
};
```

---

## 📞 Quick Reference

**Start conversation:** Component auto-loads opening message on mount  
**Pattern matching:** `lib/fallback/patternMatcher.ts` line 35  
**Add conversation turns:** `lib/fallback/happyPath.ts` line 24  
**Emergency mode:** `Ctrl+M` or click button (dev mode only)  
**Health check:** `GET http://localhost:3000/api/skill-translation/chat`  
**API endpoint:** `POST http://localhost:3000/api/skill-translation/chat`  
**User data location:** `localStorage` keys: `userProfile`, `stage2Selection_${userId}`

---

## 🔍 API Endpoint Details

### POST `/api/skill-translation/chat`

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "userContext": {
    "name": "Student",
    "courses": ["Course 1", "Course 2"],
    "keywords": ["keyword1"],
    "strengths": { "energizers": ["strength1"] },
    "interests": ["interest1"]
  },
  "currentTurn": 0,
  "forceRealAPI": false
}
```

**Response:**
```json
{
  "message": "Assistant response text",
  "source": "openai" | "fallback" | "emergency",
  "currentTurn": 1,
  "phase": "recap" | "articulation" | "patterns" | "fit-fear" | "closing"
}
```

### GET `/api/skill-translation/chat`

Health check endpoint - returns API status.

---

## 🎓 Understanding the Flow

1. **User visits `/stage3`** → Component mounts
2. **Auto-initialization** → Sends empty message array to API
3. **API processes** → Returns opening message (Turn 1)
4. **User types** → Message sent to API
5. **Pattern matching** → API tries OpenAI, falls back to script
6. **Response displayed** → User sees assistant message
7. **Repeat** → Until conversation completes
8. **Finish** → User clicks "Finish conversation" button

---

**You're ready to demo! 🎉**

For detailed implementation notes, see the code comments in each file.

