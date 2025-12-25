# MVP Data Storage & Analytics Strategy
**Date:** December 25, 2024
**Project:** Mirae.ai - Career Exploration Platform for Korean High School Students

---

## Executive Summary

Mirae.ai currently uses **100% client-side localStorage** for all data persistence. This document analyzes the current implementation, identifies gaps, and provides actionable recommendations for the MVP demo.

**Current Status:**
- ✅ Authentication: Cookie-based with hardcoded test users
- ✅ Data persistence: localStorage (~15-30KB total)
- ❌ **No database integration** (Supabase configured but unused)
- ⚠️ **Critical gaps:** No multi-user support, onboarding data unused, seed data pollution

**Recommendation:** Enhance current localStorage implementation for MVP, defer backend integration to post-MVP.

---

## 📊 Complete User Data Flow

### 1. Authentication (Cookie-based)
**Storage:** Browser cookie
**Key:** `auth_session`
**Lifespan:** 7 days

```javascript
{
  user: {
    id: "user_abc123",
    email: "student1@test.com",
    name: "Test Student"
  },
  expiresAt: 1704844800000
}
```

**Test Users:**
- `student1@test.com` / `password123`
- `student2@test.com` / `password123`

---

### 2. Onboarding Flow (localStorage)

#### Step 1: Smart Chat Collection
**File:** `components/onboarding/SmartOnboardingChat.tsx`
**API:** `/api/onboarding/chat` (OpenAI GPT-4)

Collects via conversational AI:
- Year level: 고1, 고2, or 고3 (year1/year2/year3)
- Course selection status: picked/deciding/reconsidering
- Current feelings (if uncertain)
- Interest keywords (auto-extracted)

#### Step 2: Optional Document Upload
- Career.net results
- Interest/aptitude tests
- Counseling notes
- **Status:** Files collected but NOT persisted (in-memory only)

#### Step 3: Data Saved
**Storage Keys:**
1. `user_{userId}_onboardingDone` → `"true"`
2. `mirae_user_data` → Full onboarding context

```json
{
  "yearLevel": "year1",
  "keywords": ["mathematics", "creative writing", "environmental science"],
  "onboardingCompleted": true,
  "completedAt": "2024-01-15T10:30:00Z"
}
```

---

### 3. Stage Progress Tracking (Zustand + localStorage)

**Storage Key:** `scope-user`
**Managed by:** `lib/stores/userStore.ts`

```json
{
  "userId": "user_abc123",
  "progress": {
    "stage0Complete": true,   // S - Strength
    "stage1Complete": false,  // C - Curiosity
    "stage2Complete": false,  // O - Options
    "stage3Complete": false,  // P - Proof
    "stage4Complete": false,  // E - Evolve
    "stage5Complete": false,  // Mirae+
    "currentStage": 1
  }
}
```

**Stage Mapping:**
- Stage 0 (S) - Strength: Core strengths identification
- Stage 1 (C) - Curiosity: Interest exploration
- Stage 2 (O) - Options: Career pathway options
- Stage 3 (P) - Proof: Evidence gathering & validation
- Stage 4 (E) - Evolve: Action planning
- Stage 5 (+) - Mirae+: Identity cards & gamification

---

### 4. Activity Logs & Analytics (localStorage)

**Storage Key:** `mirae_activity_logs_v1`
**Managed by:** `lib/activityLogs.ts`

```json
[
  {
    "id": "act_xyz789",
    "date": "2024-01-15",
    "title": "Math competition preparation",
    "scopeStage": "S",
    "activityType": "Study",
    "source": "Manual",
    "linkedCardId": null,
    "shortReflection": "Realized I enjoy problem-solving"
  }
]
```

**Activity Types:**
- `MiraeActivity` - Platform-generated activities
- `Study` - Academic work
- `Project` - Personal projects
- `Club` - Extracurricular activities
- `Reflection` - Self-reflection entries
- `ExternalWork` - Outside school activities

**⚠️ Issue:** Loads with 11 seed activities by default (fake data pollution)

---

### 5. User Profile & Questionnaire Responses (localStorage)

**Storage Key:** `userProfile`

```json
{
  "userId": "user_abc123",
  "questionnaireAnswers": {
    "stage0": {
      "strengths": ["analytical thinking", "creativity"],
      "interests": ["science", "arts"]
    },
    "stage1": { ... },
    "stage2": { ... }
  },
  "academicStage": {
    "level": "high_school_year1",
    "label": "High School Year 1"
  },
  "updatedAt": "2024-01-15T14:20:00Z"
}
```

---

### 6. Avatar Customization (localStorage)

**Storage Key:** `mirae_avatar_config_v1`

```json
{
  "selectedAccessories": [
    "glasses-round",
    "cap-academic",
    "scarf-rainbow"
  ]
}
```

**Unlock Logic:** Accessories unlock as stages complete (defined in `components/avatar/avatarRegistry.ts`)

---

### 7. Mirae+ Collections (localStorage)

**Identity Cards & Reflections**

Storage Keys:
- `miraePlus_cards` - Identity cards collected
- `miraePlus_reflections` - Reflection entries
- `miraePlus_accessories` - Equipped cosmetic items
- `miraePlus_viewMode` - UI view preference

```json
// miraePlus_cards
[
  {
    "id": "card_001",
    "title": "The Problem Solver",
    "description": "Analytical thinker who thrives on challenges",
    "unlockedAt": "2024-01-15T12:00:00Z",
    "linkedActivities": ["act_xyz789"]
  }
]
```

---

### 8. Language Preference (Zustand + localStorage)

**Storage Key:** `scope-language`

```json
{
  "language": "ko"  // or "en"
}
```

---

## 📦 Complete Storage Keys Reference

| Storage Key | Type | Size | Created When | Purpose |
|------------|------|------|--------------|---------|
| `auth_session` | Cookie | <1KB | Login | User session |
| `user_{userId}_onboardingDone` | localStorage | <10B | Onboarding complete | Skip onboarding flag |
| `mirae_user_data` | localStorage | ~500B | Onboarding complete | Keywords & year level |
| `scope-user` | localStorage | ~500B | Dashboard load | Stage progress |
| `scope-language` | localStorage | ~50B | App load | Language preference |
| `mirae_activity_logs_v1` | localStorage | 5-10KB | Dashboard load | Activity tracking |
| `mirae_avatar_config_v1` | localStorage | ~200B | Avatar customization | Avatar state |
| `miraePlus_cards` | localStorage | 1-5KB | Mirae+ usage | Identity cards |
| `miraePlus_reflections` | localStorage | 1-5KB | Mirae+ usage | Reflections |
| `miraePlus_accessories` | localStorage | ~500B | Mirae+ usage | Cosmetics |
| `miraePlus_viewMode` | localStorage | ~20B | Collection view | UI preference |
| `userProfile` | localStorage | 2-5KB | Stage completion | Questionnaire data |

**Total Size:** ~15-30KB (well within 5-10MB localStorage limit)

---

## ⚠️ Current Implementation Gaps

### 🔴 Critical Issues

#### 1. **No Multi-User Data Isolation**
**Problem:** All localStorage keys are global, not user-scoped
**Impact:**
- Switching between `student1@test.com` and `student2@test.com` shows mixed data
- Previous user's activity logs, progress, and preferences persist
- Demo becomes confusing when presenting with multiple accounts

**Example:**
```javascript
// Current (BAD):
localStorage.getItem('mirae_activity_logs_v1')  // Same for all users

// Needed (GOOD):
localStorage.getItem('mirae_user_user123_activity_logs_v1')  // User-specific
```

**Priority:** 🔥 **HIGH** - Breaks multi-user demo scenarios

---

#### 2. **Onboarding Data Not Utilized**
**Problem:** Keywords and context collected during onboarding are never used
**Impact:**
- Lost opportunity for personalization
- Conversational effort feels wasted
- Dashboard doesn't reflect student's stated interests

**What's Collected but Unused:**
- ✅ Keywords: `["mathematics", "creative writing", "environmental science"]`
- ✅ Year level: `year1` / `year2` / `year3`
- ✅ Course selection status: `picked` / `deciding` / `reconsidering`
- ✅ Current feelings: `"Feeling overwhelmed by choices"`

**Where It Should Be Used:**
- Dashboard header: "Your interests: mathematics, creative writing, environmental science"
- AI chat context: Reference keywords in conversations
- Stage recommendations: Tailor content to year level
- Career suggestions: Match keywords to career paths

**Priority:** 🔥 **HIGH** - Impacts perceived intelligence of the platform

---

#### 3. **Seed Data Pollutes Real Analytics**
**Problem:** Activity logs always start with 11 fake seed entries
**Impact:**
- Can't demonstrate clean user journey from scratch
- Analytics show inflated activity counts
- Real vs. simulated activities are indistinguishable

**Current Behavior:**
```javascript
// lib/activityLogs.ts
export function loadActivityLogs(): ActivityLog[] {
  const stored = localStorage.getItem('mirae_activity_logs_v1');
  if (!stored) {
    return buildSeedActivityLogs(); // Always returns 11 fake activities
  }
  // Real activities get merged with seed data
}
```

**Priority:** 🟠 **MEDIUM** - Affects demo authenticity

---

#### 4. **No Analytics/Engagement Tracking**
**Problem:** No time tracking, interaction metrics, or completion analytics
**Impact:**
- Can't showcase user engagement in demos
- No data to demonstrate platform effectiveness
- Missing opportunity for insights dashboard

**What's Missing:**
- ⏱️ Time spent per stage
- 📅 Completion timestamps
- 🎯 Interaction counts (clicks, reflections, activities)
- 📊 Journey completion rate
- 💬 Chat message count

**Priority:** 🟠 **MEDIUM** - Valuable for stakeholder demos

---

### 🟡 Minor Issues

#### 5. **Uploaded Documents Not Persisted**
**Problem:** File upload feature works but files disappear after onboarding
**Impact:** Feature feels incomplete, can't reference uploaded materials later

**Priority:** 🟢 **LOW** - Nice-to-have for complete UX

---

#### 6. **No Data Export Capability**
**Problem:** No way to export user journey, progress, or insights
**Impact:** Limited shareability, can't generate reports

**Use Cases:**
- Export journey as PDF for portfolio
- Share progress with counselors
- Download data for external analysis

**Priority:** 🟢 **LOW** - Future enhancement

---

#### 7. **Inconsistent Storage Key Naming**
**Problem:** Mix of `mirae_`, `miraePlus_`, `scope-` prefixes
**Impact:** Harder to track related data, potential key collisions

**Examples:**
- `mirae_user_data`
- `miraePlus_cards`
- `scope-user`
- `user_{userId}_onboardingDone`

**Priority:** 🟢 **LOW** - Technical debt, doesn't affect functionality

---

## ✅ Recommendations for MVP

### **Strategy: Enhance Current localStorage**

**Rationale:**
- ✅ localStorage is sufficient for single-device demos
- ✅ Faster iteration without backend complexity
- ✅ No hosting/database costs
- ✅ Keeps deployment simple (static site)
- ⚠️ Defer Supabase integration to post-MVP (when multi-device sync is needed)

---

### 🎯 Priority 1: Fix Multi-User Data Isolation

**Implementation:**

1. **Create User-Scoped Storage Utility**

```typescript
// lib/utils/userStorage.ts (NEW FILE)

import { getUser } from '@/lib/auth';

/**
 * Get user-scoped localStorage key
 * Prevents data leakage between user accounts
 */
export function getUserStorageKey(key: string): string {
  const user = getUser();
  if (!user) {
    console.warn('No user found, using global storage key');
    return key;
  }
  return `mirae_user_${user.id}_${key}`;
}

/**
 * Get item from user-scoped storage
 */
export function getUserItem<T>(key: string, defaultValue?: T): T | null {
  if (typeof window === 'undefined') return defaultValue ?? null;

  try {
    const scopedKey = getUserStorageKey(key);
    const item = localStorage.getItem(scopedKey);
    return item ? JSON.parse(item) : (defaultValue ?? null);
  } catch (error) {
    console.error('getUserItem error:', error);
    return defaultValue ?? null;
  }
}

/**
 * Set item in user-scoped storage
 */
export function setUserItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    const scopedKey = getUserStorageKey(key);
    localStorage.setItem(scopedKey, JSON.stringify(value));
  } catch (error) {
    console.error('setUserItem error:', error);
  }
}

/**
 * Remove item from user-scoped storage
 */
export function removeUserItem(key: string): void {
  if (typeof window === 'undefined') return;

  const scopedKey = getUserStorageKey(key);
  localStorage.removeItem(scopedKey);
}

/**
 * Clear all user-scoped data (for sign out)
 */
export function clearUserData(): void {
  if (typeof window === 'undefined') return;

  const user = getUser();
  if (!user) return;

  const prefix = `mirae_user_${user.id}_`;
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
```

2. **Update All Storage Calls**

Migrate existing code to use user-scoped storage:

```typescript
// BEFORE:
localStorage.getItem('mirae_activity_logs_v1')
localStorage.setItem('mirae_activity_logs_v1', JSON.stringify(logs))

// AFTER:
import { getUserItem, setUserItem } from '@/lib/utils/userStorage';
getUserItem('activity_logs_v1')
setUserItem('activity_logs_v1', logs)
```

**Files to Update:**
- `lib/activityLogs.ts`
- `lib/hooks/useOnboarding.ts`
- `components/avatar/AvatarCustomizerPanel.tsx`
- `app/(dashboard)/collection/page.tsx`
- All Mirae+ components

3. **Update Zustand Stores**

Modify store names to be user-specific:

```typescript
// lib/stores/userStore.ts
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: () => {
        const user = getUser();
        return user ? `scope_user_${user.id}` : 'scope_user';
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**Expected Outcome:**
- ✅ Clean data separation between test accounts
- ✅ Reliable multi-user demo scenarios
- ✅ No data bleed when switching users

---

### 🎯 Priority 2: Utilize Onboarding Data

**Implementation:**

1. **Display Keywords in Dashboard Header**

```tsx
// app/(dashboard)/dashboard/page.tsx

import { getUserItem } from '@/lib/utils/userStorage';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const data = getUserItem('user_data');
    setUserData(data);
  }, []);

  return (
    <div className="dashboard-header">
      {userData?.keywords && (
        <div className="interest-tags">
          <span className="text-sm text-slate-600">Your interests:</span>
          {userData.keywords.map(keyword => (
            <span key={keyword} className="tag">
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

2. **Use Keywords in AI Chat Context**

```typescript
// When calling AI APIs, include onboarding context:
const userData = getUserItem('user_data');

const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    context: {
      keywords: userData?.keywords || [],
      yearLevel: userData?.yearLevel,
      // This helps AI provide personalized responses
    }
  })
});
```

3. **Customize Stage Content by Year Level**

```typescript
// Show different content based on year level
const userData = getUserItem('user_data');
const isYear1 = userData?.yearLevel === 'year1';

// Year 1: More exploratory, less pressure
// Year 2: Balance exploration and decision-making
// Year 3: Focus on concrete planning and choices
```

**Expected Outcome:**
- ✅ Personalized user experience
- ✅ Keywords visible and referenced throughout journey
- ✅ Year-appropriate content and guidance

---

### 🎯 Priority 3: Clean Activity Log Initialization

**Implementation:**

Update `lib/activityLogs.ts`:

```typescript
export function loadActivityLogs(): ActivityLog[] {
  const stored = getUserItem<ActivityLog[]>('activity_logs_v1');

  // Return stored logs or empty array (NO SEED DATA)
  return stored || [];
}

// Add separate function for demo purposes
export function loadActivityLogsWithDemoData(): ActivityLog[] {
  const stored = getUserItem<ActivityLog[]>('activity_logs_v1');

  if (stored && stored.length > 0) {
    return stored; // Use real data if exists
  }

  // Only use seed data if explicitly requested
  return buildSeedActivityLogs();
}

// Add admin function to populate demo data
export function populateDemoData(): void {
  const current = getUserItem<ActivityLog[]>('activity_logs_v1') || [];
  if (current.length === 0) {
    setUserItem('activity_logs_v1', buildSeedActivityLogs());
  }
}
```

Add UI control in dashboard:

```tsx
// Add "Demo Mode" toggle in dashboard settings
<button onClick={() => populateDemoData()}>
  Fill with demo activities
</button>
```

**Expected Outcome:**
- ✅ New users start with clean slate
- ✅ Demo data available on-demand
- ✅ Clear distinction between real and simulated activities

---

### 🎯 Priority 4: Add Basic Analytics Tracking

**Implementation:**

1. **Create Analytics Storage Schema**

```typescript
// lib/analytics.ts (NEW FILE)

export interface UserAnalytics {
  journeyStarted: string;  // ISO timestamp
  stageTimestamps: {
    stage0Start?: string;
    stage0Complete?: string;
    stage1Start?: string;
    stage1Complete?: string;
    stage2Start?: string;
    stage2Complete?: string;
    stage3Start?: string;
    stage3Complete?: string;
    stage4Start?: string;
    stage4Complete?: string;
    stage5Start?: string;
    stage5Complete?: string;
  };
  interactions: {
    totalChatMessages: number;
    totalActivitiesCreated: number;
    totalReflections: number;
    avatarCustomizations: number;
    identityCardsUnlocked: number;
  };
  sessionCount: number;
  lastActive: string;
}

export function initAnalytics(): UserAnalytics {
  return {
    journeyStarted: new Date().toISOString(),
    stageTimestamps: {},
    interactions: {
      totalChatMessages: 0,
      totalActivitiesCreated: 0,
      totalReflections: 0,
      avatarCustomizations: 0,
      identityCardsUnlocked: 0,
    },
    sessionCount: 1,
    lastActive: new Date().toISOString(),
  };
}

export function trackStageStart(stage: number): void {
  const analytics = getUserItem<UserAnalytics>('analytics') || initAnalytics();
  const key = `stage${stage}Start` as keyof UserAnalytics['stageTimestamps'];

  if (!analytics.stageTimestamps[key]) {
    analytics.stageTimestamps[key] = new Date().toISOString();
    setUserItem('analytics', analytics);
  }
}

export function trackStageComplete(stage: number): void {
  const analytics = getUserItem<UserAnalytics>('analytics') || initAnalytics();
  const key = `stage${stage}Complete` as keyof UserAnalytics['stageTimestamps'];

  analytics.stageTimestamps[key] = new Date().toISOString();
  setUserItem('analytics', analytics);
}

export function trackInteraction(type: keyof UserAnalytics['interactions']): void {
  const analytics = getUserItem<UserAnalytics>('analytics') || initAnalytics();
  analytics.interactions[type]++;
  analytics.lastActive = new Date().toISOString();
  setUserItem('analytics', analytics);
}

export function getTimeInStage(stage: number): number | null {
  const analytics = getUserItem<UserAnalytics>('analytics');
  if (!analytics) return null;

  const startKey = `stage${stage}Start` as keyof UserAnalytics['stageTimestamps'];
  const endKey = `stage${stage}Complete` as keyof UserAnalytics['stageTimestamps'];

  const start = analytics.stageTimestamps[startKey];
  const end = analytics.stageTimestamps[endKey];

  if (!start) return null;
  if (!end) {
    // Stage in progress
    return Date.now() - new Date(start).getTime();
  }

  return new Date(end).getTime() - new Date(start).getTime();
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}
```

2. **Integrate Tracking into User Actions**

```typescript
// When user enters a stage:
trackStageStart(stageNumber);

// When user completes a stage:
trackStageComplete(stageNumber);

// When user sends chat message:
trackInteraction('totalChatMessages');

// When user creates activity:
trackInteraction('totalActivitiesCreated');
```

3. **Display Analytics in Dashboard**

```tsx
// Add analytics panel to dashboard
const analytics = getUserItem<UserAnalytics>('analytics');

<div className="analytics-panel">
  <h3>Your Journey Insights</h3>
  <div className="stats">
    <div className="stat">
      <span className="label">Journey Started</span>
      <span className="value">
        {analytics?.journeyStarted ? new Date(analytics.journeyStarted).toLocaleDateString() : 'N/A'}
      </span>
    </div>
    <div className="stat">
      <span className="label">Time in Current Stage</span>
      <span className="value">
        {formatDuration(getTimeInStage(currentStage) || 0)}
      </span>
    </div>
    <div className="stat">
      <span className="label">Activities Created</span>
      <span className="value">{analytics?.interactions.totalActivitiesCreated || 0}</span>
    </div>
    <div className="stat">
      <span className="label">Reflections</span>
      <span className="value">{analytics?.interactions.totalReflections || 0}</span>
    </div>
  </div>
</div>
```

**Expected Outcome:**
- ✅ Track user engagement metrics
- ✅ Display journey progress statistics
- ✅ Enable data-driven demo presentations

---

### 🎯 Priority 5 (Optional): Add Data Export

**Implementation:**

```typescript
// lib/dataExport.ts (NEW FILE)

export function exportUserData() {
  const user = getUser();
  if (!user) return;

  const exportData = {
    meta: {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
    },
    onboarding: getUserItem('user_data'),
    progress: getUserItem('progress'),
    analytics: getUserItem('analytics'),
    activities: getUserItem('activity_logs_v1'),
    profile: getUserItem('userProfile'),
    avatarConfig: getUserItem('avatar_config_v1'),
    miraePlus: {
      cards: getUserItem('cards'),
      reflections: getUserItem('reflections'),
    },
  };

  // Download as JSON
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mirae-journey-${user.id}-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
```

Add button to dashboard:

```tsx
<button onClick={exportUserData} className="export-button">
  📥 Export My Journey
</button>
```

**Expected Outcome:**
- ✅ Users can download their complete journey data
- ✅ Useful for presentations and portfolio documentation

---

## 🚀 Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
**Estimated Time:** 4-6 hours

1. ✅ Create `lib/utils/userStorage.ts` utility (1 hour)
2. ✅ Migrate `lib/activityLogs.ts` to user-scoped storage (1 hour)
3. ✅ Update `lib/hooks/useOnboarding.ts` (30 min)
4. ✅ Update avatar and Mirae+ storage (1 hour)
5. ✅ Test multi-user scenarios thoroughly (1-2 hours)

**Success Criteria:**
- Student1 and Student2 have completely isolated data
- Switching accounts shows correct user-specific data
- No data leakage between accounts

---

### Phase 2: Enhance User Experience (Week 2)
**Estimated Time:** 3-4 hours

1. ✅ Display keywords in dashboard header (1 hour)
2. ✅ Remove seed data, add demo toggle (1 hour)
3. ✅ Use onboarding context in AI chats (1-2 hours)

**Success Criteria:**
- Keywords from onboarding visible throughout app
- Clean analytics for new users
- AI responses reference user's stated interests

---

### Phase 3: Analytics & Insights (Week 3)
**Estimated Time:** 4-5 hours

1. ✅ Create `lib/analytics.ts` module (2 hours)
2. ✅ Integrate tracking into all user actions (2 hours)
3. ✅ Add analytics dashboard panel (1 hour)

**Success Criteria:**
- Time tracking for each stage
- Interaction metrics displayed
- Journey progress percentage shown

---

### Phase 4: Polish & Export (Optional)
**Estimated Time:** 2-3 hours

1. ✅ Implement data export function (1 hour)
2. ✅ Add export UI to dashboard (30 min)
3. ✅ Standardize storage key naming (1 hour)

---

## 🔮 Future Considerations (Post-MVP)

### When to Add Backend (Supabase)

Consider backend integration when you need:

1. **Multi-Device Sync**
   - Users want to access their journey from phone and computer
   - Progress persists across browser clears

2. **Admin Dashboard**
   - View aggregate analytics across all users
   - Monitor platform usage and engagement
   - Identify popular career pathways

3. **Collaborative Features**
   - Share journey with counselors/teachers
   - Peer comparisons (anonymized)
   - Group activities or challenges

4. **Advanced AI Features**
   - Long-term conversation memory
   - Personalized recommendations based on cohort data
   - Predictive career pathway suggestions

5. **Production Scalability**
   - Support for schools/institutions
   - Data backup and recovery
   - GDPR/privacy compliance

---

## 📋 Testing Checklist for MVP

Before demo, verify:

### Multi-User Scenarios
- [ ] Create fresh account → onboarding → complete Stage 0
- [ ] Sign out, create second account → different data shown
- [ ] Sign back into first account → original data restored
- [ ] Activity logs are user-specific
- [ ] Avatar customization is user-specific

### Onboarding Flow
- [ ] Keywords extracted during chat
- [ ] Keywords visible in dashboard after onboarding
- [ ] Year level saved and used in content
- [ ] File upload UI works (even if not persisted)

### Activity Logs
- [ ] New user starts with 0 activities (no seed data)
- [ ] "Add demo data" button populates sample activities
- [ ] User-created activities save correctly
- [ ] Calendar view shows activities by date

### Analytics
- [ ] Journey start timestamp recorded
- [ ] Stage start/complete timestamps tracked
- [ ] Interaction counts increment correctly
- [ ] Time in stage calculated accurately

### Data Persistence
- [ ] Refresh page → data persists
- [ ] Close tab, reopen → data persists
- [ ] Sign out, sign in → data restored
- [ ] Clear localStorage → data cleared (expected)

---

## 📞 Support & Questions

For implementation questions or issues:

1. Check this document first
2. Review code comments in storage utilities
3. Test with console logging: `console.log(getUserItem('activity_logs_v1'))`
4. Use browser DevTools → Application → Local Storage to inspect keys

**localStorage Inspection:**
```javascript
// Console command to view all Mirae data:
Object.keys(localStorage)
  .filter(key => key.startsWith('mirae_') || key.startsWith('scope'))
  .forEach(key => console.log(key, localStorage.getItem(key)));
```

---

## Appendix: File Reference

### Core Storage Files
- `lib/auth.ts` - Authentication and session management
- `lib/utils/storage.ts` - Generic storage wrapper
- `lib/utils/userStorage.ts` - **NEW** User-scoped storage (to create)
- `lib/stores/userStore.ts` - Stage progress Zustand store
- `lib/stores/languageStore.ts` - Language preference Zustand store
- `lib/activityLogs.ts` - Activity log management
- `lib/hooks/useOnboarding.ts` - Onboarding state management

### Components Using Storage
- `app/onboarding/page.tsx` - Onboarding completion flag
- `app/(dashboard)/dashboard/page.tsx` - Main dashboard, user profile
- `components/onboarding/SmartOnboardingChat.tsx` - Chat context
- `components/avatar/AvatarCustomizerPanel.tsx` - Avatar config
- `app/(dashboard)/collection/page.tsx` - Mirae+ collections
- `components/JourneyReportView.tsx` - Journey analytics

### API Routes (No DB)
- `app/api/onboarding/chat/route.ts` - Onboarding AI chat
- `app/api/chat/route.ts` - General AI chat
- `app/api/skill-translation/chat/route.ts` - Skill translation
- `app/api/analyze-roles/route.ts` - Role analysis

---

**Document Version:** 1.0
**Last Updated:** December 25, 2024
**Status:** Ready for Implementation
