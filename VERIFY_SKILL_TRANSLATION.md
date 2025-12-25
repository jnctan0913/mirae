# ✅ Skill Translation - Local Verification Checklist

## Step 1: Verify All Files Exist

Run these commands to check:

```bash
# Check TypeScript types
ls lib/types/skillTranslation.ts

# Check fallback files
ls lib/fallback/happyPath.ts
ls lib/fallback/patternMatcher.ts

# Check API route
ls app/api/skill-translation/chat/route.ts

# Check page component
ls app/\(dashboard\)/stage3/page.tsx
```

**Expected:** All files should exist ✅

---

## Step 2: Check Dependencies

```bash
# Verify OpenAI is installed
npm list openai
```

**Expected:** Should show `openai@4.20.1` or similar ✅

If not installed:
```bash
npm install openai
```

---

## Step 3: Check Environment Variables

Create or verify `.env.local` file in project root:

```bash
# Check if file exists
ls .env.local
```

If it doesn't exist, create it:
```bash
# Create .env.local
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local
```

**Note:** Replace `sk-your-key-here` with your actual OpenAI API key.

---

## Step 4: Check for TypeScript Errors

```bash
# Run TypeScript check
npx tsc --noEmit
```

**Expected:** No errors ✅

---

## Step 5: Check for Linting Errors

```bash
# Run linter
npm run lint
```

**Expected:** No errors ✅

---

## Step 6: Start Development Server

```bash
npm run dev
```

**Expected:** Server starts on `http://localhost:3000` ✅

---

## Step 7: Test the Health Check Endpoint

Open in browser or use curl:

```bash
# Browser
http://localhost:3000/api/skill-translation/chat

# Or curl
curl http://localhost:3000/api/skill-translation/chat
```

**Expected Response:**
```json
{
  "status": "ok",
  "openai": "configured" or "not configured",
  "fallback": "available"
}
```

---

## Step 8: Test the Page

1. Open browser: `http://localhost:3000/stage3`
2. **Expected:** Page loads with chat interface ✅
3. **Expected:** Initial message appears automatically ✅
4. **Expected:** No console errors in browser DevTools ✅

---

## Step 9: Test the Chat

1. Type a message (e.g., "안녕하세요")
2. Click "Send" or press Enter
3. **Expected:** Assistant responds ✅
4. **Expected:** Message appears in chat ✅
5. **Expected:** No errors in browser console ✅

---

## Step 10: Test Fallback Mode

### Option A: Disable OpenAI (Temporary)

1. Comment out or remove `OPENAI_API_KEY` in `.env.local`
2. Restart dev server (`Ctrl+C`, then `npm run dev`)
3. Send a message
4. **Expected:** Response comes from fallback (check console) ✅

### Option B: Use Mock Mode Toggle

1. In dev mode, you should see "Dev Tools" section at bottom
2. Click "Mock Mode" button or press `Ctrl+M`
3. **Expected:** Console shows "MOCK MODE: ON" ✅

---

## Step 11: Check Console Logs

Open browser console (F12) and check:

**Expected logs:**
- No red errors ✅
- If using fallback: `⚠️ Using fallback responses` (warning, not error) ✅
- Source indicators in dev mode ✅

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@/lib/types/skillTranslation'"

**Fix:** Check that `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "OPENAI_API_KEY not configured"

**Fix:** 
1. Create `.env.local` in project root
2. Add: `OPENAI_API_KEY=sk-your-key`
3. Restart dev server

### Issue: "Page not found (404)"

**Fix:** 
- URL should be `/stage3` (not `/dashboard/stage3`)
- Check file is at: `app/(dashboard)/stage3/page.tsx`

### Issue: "Cannot read property 'name' of null"

**Fix:** 
- Update mock data in `stage3/page.tsx` `getUserContext()` function
- Or connect to real user store (see Quick Start guide)

### Issue: Messages not appearing

**Fix:**
1. Check browser Network tab for failed requests
2. Check API route is accessible: `/api/skill-translation/chat`
3. Check browser console for errors

---

## ✅ Success Criteria

You're good to go if:

- ✅ All files exist
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Dev server starts
- ✅ Health check endpoint works
- ✅ Page loads at `/stage3`
- ✅ Initial message appears
- ✅ Can send and receive messages
- ✅ No console errors

---

## 🚀 Quick Test Script

Run this to test everything at once:

```bash
# 1. Check files
echo "Checking files..."
[ -f lib/types/skillTranslation.ts ] && echo "✅ skillTranslation.ts" || echo "❌ Missing skillTranslation.ts"
[ -f lib/fallback/happyPath.ts ] && echo "✅ happyPath.ts" || echo "❌ Missing happyPath.ts"
[ -f lib/fallback/patternMatcher.ts ] && echo "✅ patternMatcher.ts" || echo "❌ Missing patternMatcher.ts"
[ -f app/api/skill-translation/chat/route.ts ] && echo "✅ route.ts" || echo "❌ Missing route.ts"
[ -f app/\(dashboard\)/stage3/page.tsx ] && echo "✅ page.tsx" || echo "❌ Missing page.tsx"

# 2. Check dependencies
echo -e "\nChecking dependencies..."
npm list openai > /dev/null 2>&1 && echo "✅ openai installed" || echo "❌ openai not installed"

# 3. Check TypeScript
echo -e "\nChecking TypeScript..."
npx tsc --noEmit > /dev/null 2>&1 && echo "✅ No TypeScript errors" || echo "❌ TypeScript errors found"

echo -e "\n✅ Basic checks complete!"
```

---

**Once all checks pass, you're ready to demo! 🎉**

