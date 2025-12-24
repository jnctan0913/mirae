# SCOPE+ Revised App Blueprint
**Dashboard-Based Career Exploration Journey with Progressive Stages**

---

## Executive Summary

SCOPE+ is a **dashboard-based, AI-powered career exploration platform** that guides Korean high school students through 6 progressive stages—from initial self-understanding to final specialization decisions. Each stage combines interactive activities with chatbot-guided reflection to build toward concrete course selection recommendations.

**Core Innovation:** Gamified exploration (swipe mechanics, tournaments) + AI synthesis → Data-driven course roadmap

---

## Product Architecture Overview

### User Journey Flow

```
Authentication & Dashboard
    ↓
Stage 0: Initial Questionnaire (Self-Understanding)
    ↓
Stage 1: Role Roulette (Interest Exploration)
    ↓
Stage 2: Anchor vs Signal Builder (Course Roadmap)
    ↓
Stage 3: Skill Translation (Growth Character Report)
    ↓
Stage 4: Tournament Bracket (Specialization Narrowing)
    ↓
Stage 5: Storyboard (Future Visualization)
    ↓
Final Dashboard: Recommendations & Next Semester Plan
```

**Experience Model:**
- **Dashboard-centric**: Progress tracking, stage navigation, insights overview
- **Progressive unlock**: Complete one stage to unlock next
- **Multi-modal input**: Swipes, chat, voice, drag-drop, tournament selection
- **AI synthesis**: Each stage produces insights that feed into next stage

---

## Core Components

### **Dashboard Hub**

**Purpose:** Central command center for student's exploration journey

**Key Elements:**

1. **Progress Tracker**
   - Visual journey map showing 6 stages
   - Completion status for each stage
   - Unlock indicators
   - Overall completion percentage

2. **Insights Panel**
   - Latest discoveries from completed stages
   - Emerging patterns across stages
   - "Your journey so far" summary

3. **Quick Stats**
   - Roles explored
   - Skills identified
   - Specializations considered
   - Time invested

4. **Stage Cards**
   - Current stage highlighted
   - Next stage preview
   - Locked stages grayed out
   - Re-visit completed stages option

5. **AI Companion Avatar**
   - Persistent chatbot presence
   - Context-aware prompts
   - Encouragement messages

**UI Layout:**
```
┌─────────────────────────────────────┐
│  SCOPE+        🔔  ⚙️  👤          │
├─────────────────────────────────────┤
│                                     │
│  안녕, [이름]! 👋                    │
│  당신은 지금 Stage 2에 있어요         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Progress: ████░░░░ 40%     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Stage 1: Role Roulette ✓ ──┐  │
│  │  20 roles explored           │  │
│  │  3 strong interests found    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Stage 2: Course Builder 🔓 ─┐  │
│  │  Build your roadmap →        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌─ Stage 3: Skill Translation🔒┐  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## Stage-by-Stage Blueprint

---

## **Stage 0: Initial Questionnaire (Self-Understanding)**

### Objective
Build foundational user profile through conversational data collection

### Input Methods
- **Mixed format**: Multiple choice + text input + chatbot conversation
- **Adaptive questioning**: AI asks follow-up questions based on responses

### Data Collected

**1. Identity Baseline**
- Strengths (multi-select from 12 options)
- Learning preferences (visual/auditory/kinesthetic)
- Current interests (tags)
- Fears/concerns about future (open-ended)

**2. Current Context**
- Year in school
- Current subjects
- Extracurricular activities
- Time availability
- Family expectations (awareness level)

**3. Exploration Style**
- "How do you usually make decisions?"
- "What excites you more: depth or breadth?"
- "How comfortable are you with uncertainty?"

### Output Understanding

**Profile Object Created:**
```json
{
  "userId": "uuid",
  "profileBaseline": {
    "strengths": ["analytical", "empathy", "organization"],
    "learningStyle": "visual",
    "currentInterests": ["technology", "social-impact"],
    "fears": ["disappointing family", "wrong choice"],
    "decisionStyle": "deliberate",
    "uncertaintyTolerance": "medium"
  },
  "context": {
    "yearLevel": 1,
    "currentSubjects": ["Math", "English", "Science"],
    "ccaActivities": ["Debate club"],
    "weeklyAvailableHours": 10
  }
}
```

**What Student Sees:**
- "Your Starting Point" summary card
- Personality compass visualization
- "We noticed you..." insights
- Ready for Stage 1 prompt

### UI/UX Design

**Question Flow:**
1. Welcome screen with privacy promise
2. 8-10 questions with progress bar
3. Chatbot asks 2-3 clarifying questions
4. Summary screen before proceeding

**Sample Question Card:**
```
┌────────────────────────────────┐
│  Question 3 of 10              │
│  ══════════░░░░░ 30%          │
│                                │
│  What energizes you?           │
│                                │
│  ☐ Solving complex puzzles     │
│  ☐ Helping others              │
│  ☐ Creating new things         │
│  ☐ Organizing events           │
│  ☐ Learning new skills         │
│                                │
│  (Select all that apply)       │
│                                │
│  [Skip]           [Continue →] │
└────────────────────────────────┘
```

---

## **Stage 1: Role Roulette (Interest Exploration)**

### Objective
Discover unexpected interests through rapid, judgment-free exploration

### Interaction Model
**Tinder-style swipe interface** for career roles

**Swipe Mechanics:**
- **Swipe Right (❤️)**: "Interesting!"
- **Swipe Left (👎)**: "Not for me"
- **Swipe Up (⭐)**: "Love this!"
- **Tap for Details**: View full role description

### Content Structure

**Role Card Anatomy:**
```
Front of Card:
┌─────────────────────────────┐
│                             │
│      [Role Icon/Image]      │
│                             │
│    Urban Planner 🏙️        │
│                             │
│  "Design cities where       │
│   people want to live"      │
│                             │
│     [Tap for details]       │
│                             │
└─────────────────────────────┘

Back of Card (on tap):
┌─────────────────────────────┐
│  Urban Planner              │
│                             │
│  What you'd do:             │
│  • Plan public spaces       │
│  • Analyze traffic patterns │
│  • Balance community needs  │
│                             │
│  Skills used:               │
│  Spatial thinking, Data     │
│  analysis, Community work   │
│                             │
│  Related fields:            │
│  Architecture, Policy       │
│                             │
│  [← Back]         [Swipe →] │
└─────────────────────────────┘
```

### Role Pool Design

**50 curated roles across 5 domains:**
1. **Creative** (10): Designer, Writer, Animator, Curator, etc.
2. **Analytical** (10): Data Scientist, Researcher, Financial Analyst, etc.
3. **Social** (10): Counselor, Teacher, Community Organizer, etc.
4. **Technical** (10): Engineer, Developer, Biotech Specialist, etc.
5. **Entrepreneurial** (10): Product Manager, Startup Founder, Strategist, etc.

**Smart Filtering:**
- First 10 roles: Random across all domains
- Next 20 roles: AI-selected based on swipe patterns
- Final 20 roles: Targeted to clarify interest clusters

### Data Captured Per Swipe

```json
{
  "roleId": "urban-planner",
  "swipeDirection": "right",
  "swipeSpeed": "slow", // Indicates consideration level
  "cardTapCount": 2,     // Viewed details
  "timestamp": "2025-01-15T10:23:45Z",
  "roleDomain": "creative",
  "associatedSkills": ["spatial-thinking", "data-analysis"]
}
```

### Output Understanding

**AI Analysis:**
1. **Interest Clusters**: "You showed strong interest in roles involving..."
2. **Pattern Recognition**: "You swiped left on all roles with heavy coding"
3. **Surprise Discoveries**: "You loved 3 creative roles despite marking analytical strengths"
4. **Energy Mapping**: "You took time (slow swipes) with social impact roles"

**Visual Dashboard Update:**
```
┌──────────────────────────────────┐
│  Role Roulette Complete! ✓       │
│                                  │
│  📊 50 roles explored            │
│  ❤️  15 interesting              │
│  ⭐ 5 loved                       │
│                                  │
│  Top Interest Clusters:          │
│  🎨 Creative Design    ████ 80%  │
│  💬 Social Impact      ███░ 60%  │
│  📊 Data & Research    ██░░ 40%  │
│                                  │
│  Surprise Discovery:             │
│  "You loved Museum Curator—      │
│   blending creativity + research"│
│                                  │
│  [Continue to Stage 2 →]         │
└──────────────────────────────────┘
```

### Chatbot Integration

**During Activity:**
- Every 10 swipes: "Notice any patterns yet?"
- After first ⭐ swipe: "What drew you to that one?"

**After Completion:**
- "I noticed you hesitated on technical roles. Want to talk about that?"
- "You loved 3 roles that involve storytelling. Does that surprise you?"

---

## **Stage 2: Anchor vs Signal Builder (Course Roadmap)**

### Objective
Translate interest patterns into strategic course selections with AI-generated recommendations

### Interaction Model
**Dual-bucket drag-and-drop + AI suggestion engine**

### Interface Layout

```
┌────────────────────────────────────────────┐
│  Course Roadmap Builder                    │
│  Next Semester: 2025 Fall                  │
├────────────────────────────────────────────┤
│                                            │
│  Available Subjects (24)                   │
│  ┌──────┐ ┌──────┐ ┌──────┐              │
│  │ 수학  │ │ 물리 │ │ 경제 │   ...        │
│  └──────┘ └──────┘ └──────┘              │
│                                            │
├─────────────────┬──────────────────────────┤
│                 │                          │
│  ⚓ Anchor       │  🎯 Signal              │
│  (안전한 선택)    │  (탐색 신호)             │
│                 │                          │
│  Drop subjects  │  Drop subjects           │
│  you're choosing│  you're choosing         │
│  for safety/    │  out of curiosity/       │
│  expectations   │  exploration             │
│                 │                          │
│  [Math    ]     │  [Design Thinking]       │
│  [English ]     │                          │
│                 │                          │
│  (2/6 선택됨)    │  (1/6 선택됨)            │
│                 │                          │
└─────────────────┴──────────────────────────┘
│                                            │
│  💡 AI Suggestions Based on Your Journey:  │
│                                            │
│  "You loved creative + social roles.       │
│   Consider adding:                         │
│   • 미술과 생활 (Signal)                    │
│   • 사회문제 탐구 (Signal)"                 │
│                                            │
│  ⚠️ Load Balance Warning:                  │
│  "All Anchor subjects = heavy workload.    │
│   Room for 1 experimental Signal?"         │
│                                            │
│  [Save Draft] [Generate Combinations →]    │
└────────────────────────────────────────────┘
```

### Core Features

**1. Subject Cards with Metadata**

Each subject card shows:
```
┌─────────────────┐
│  디자인 사고      │
│                 │
│  Difficulty: ●○○│
│  Time: 3h/week  │
│  Prerequisite: ✗│
│                 │
│  Tags:          │
│  Creative, PBL  │
└─────────────────┘
```

**2. Smart Recommendations Engine**

**Input Data:**
- Stage 1 interest clusters
- Stage 0 strengths & learning style
- Current subject performance
- Time availability

**AI Logic:**
```
IF (interest_cluster === "creative" AND strength === "visual")
  THEN recommend: ["Art & Life", "Design Thinking"]

IF (all_selections === "anchor" AND signal.length === 0)
  THEN warn: "Consider 1 exploration subject"

IF (total_workload > available_time * 1.2)
  THEN warn: "This combination may be too heavy"
```

**3. Combination Generator**

Once student selects 6-8 subjects:

**Output: 3 Recommended Combinations**

```
┌──────────────────────────────────────┐
│  Combination A: "Balanced Explorer"  │
│  ────────────────────────────────    │
│  Anchor (4): Math, English, Korean,  │
│              Physics                 │
│  Signal (2): Design Thinking,        │
│              Social Issues           │
│                                      │
│  Workload: Medium (15h/week)         │
│  Alignment: 85% match to interests   │
│  Risk Level: Low                     │
│                                      │
│  [Select This Combination]           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Combination B: "Creative Pivot"     │
│  ────────────────────────────────    │
│  Anchor (3): Math, English, Korean   │
│  Signal (3): Design Thinking, Art,   │
│              Media Studies           │
│                                      │
│  Workload: Medium-High (18h/week)    │
│  Alignment: 92% match to interests   │
│  Risk Level: Medium                  │
│                                      │
│  [Select This Combination]           │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Combination C: "Custom Build"       │
│  ────────────────────────────────    │
│  [Design your own combination]       │
└──────────────────────────────────────┘
```

**4. Reflection Prompts**

After selecting combination:
- "Why does this combination feel right?"
- "What worries you about these choices?"
- "If judgment didn't exist, would you change anything?"

### Output Understanding

**Roadmap Document Generated:**
```json
{
  "semester": "2025-Fall",
  "selectedCombination": "B",
  "courseList": [
    {
      "subject": "Math",
      "category": "anchor",
      "reason": "Required for university",
      "confidence": "high"
    },
    {
      "subject": "Design Thinking",
      "category": "signal",
      "reason": "Explore creative interest from Role Roulette",
      "confidence": "medium"
    }
  ],
  "totalWorkload": 18,
  "alignmentScore": 0.92,
  "aiRationale": "This combination balances safety with exploration..."
}
```

**Dashboard Update:**
- Stage 2 badge unlocked
- Roadmap preview card added
- Next semester course list saved
- Stage 3 unlocked

---

## **Stage 3: Skill Translation (Growth Character Report)**

### Objective
Transform course selections into narrative skills journey using AI chatbot + voice interaction

### Interaction Model
**Multi-modal conversation: Text chat + Voice input + AI synthesis**

### Core Features

**1. Skills Extraction Conversation**

**Chatbot initiates:**
```
Bot: "You chose Design Thinking as a Signal subject.
      Let's explore what skills you'll build there.

      When you imagine yourself in that class,
      what do you see yourself getting better at?"

[Voice Record Button] [Text Input]
```

**Student responds via voice or text:**
```
Voice: "I think... maybe like, coming up with creative solutions?
        And working with people on projects?"

Bot: "Creative problem-solving and collaboration!
      Those are powerful skills.

      Why do those matter to you?"
```

**2. Skill Mapping Canvas**

As conversation progresses, AI maps skills to visual journey:

```
┌─────────────────────────────────────────┐
│  Your Skills Growth Map                 │
├─────────────────────────────────────────┤
│                                         │
│  Semester 1 → Semester 2 → Semester 3   │
│                                         │
│  [Creative Problem-Solving]             │
│   └─> Design Thinking                   │
│   └─> Art & Life                        │
│                                         │
│  [Data Analysis]                        │
│   └─> Math                              │
│   └─> (Future: Statistics?)             │
│                                         │
│  [Collaboration]                        │
│   └─> Design Thinking                   │
│   └─> Debate Club (CCA)                 │
│                                         │
│  [Visual Communication]                 │
│   └─> Art & Life                        │
│                                         │
└─────────────────────────────────────────┘
```

**3. Voice Interaction Features**

**Why Voice?**
- Reduces typing friction for Korean students
- Captures emotional tone
- More natural reflection
- Accessibility benefit

**Voice Processing:**
- Real-time Korean speech-to-text (STT)
- Sentiment analysis on tone
- Natural language understanding
- Text-to-speech (TTS) for bot responses

**Sample Voice Flow:**
```
Bot (TTS): "지금까지 대화를 보면,
            당신은 '창의적 문제 해결'과
            '협업 능력'을 키우고 싶어하네요.

            이 두 가지가 왜 중요한가요?"

Student (Voice): "음... 나중에 사회 문제를
                  해결하는 일을 하고 싶어서..."

Bot (TTS): "사회 문제 해결이라는 큰 목표가 있구나!
            멋진데요. 그 꿈과 연결된
            다른 스킬도 있을까요?"
```

**4. Growth Character Report Generation**

After 15-20 minute conversation, AI generates:

**"Your Growth Character Report"**

```markdown
# [학생 이름]의 성장 여정 보고서

## 🎯 Your North Star
"사회 문제를 창의적으로 해결하는 사람이 되고 싶어요"

## 🌱 Skills You're Building

### Semester 1 (Current)
**Creative Problem-Solving**
- Through: Design Thinking, Art & Life
- Why it matters: "Solutions need to be both useful and beautiful"

**Data-Driven Thinking**
- Through: Math, Physics
- Why it matters: "Understanding patterns helps solve problems"

**Collaboration**
- Through: Design Thinking, Debate Club
- Why it matters: "Big problems need teams"

## 🚀 Your Skill Evolution Path

Current → Near Future → Long-term
───────────────────────────────
Problem-Solving → Systems Thinking → Strategic Design
Collaboration → Team Leadership → Community Building
Visual Thinking → UX Design → Product Strategy

## 💪 Your Unique Edge

"You're building a rare combination:
analytical rigor (Math, Physics) +
creative expression (Design, Art) +
social awareness (Social Issues).

This makes you valuable in fields like:
• Social Innovation Design
• Public Policy Strategy
• Educational Technology"

## 🔮 What's Next

Based on your journey so far, consider exploring:
- Semester 2: Statistics (strengthen data skills)
- Semester 3: Psychology (deepen social understanding)
- Outside class: Social innovation hackathons

## 📊 Skills Confidence Tracker

Creative Problem-Solving  ████░░░░░░ 40%
Data Analysis            ██████░░░░ 60%
Collaboration            ███░░░░░░░ 30%
Visual Communication     █████░░░░░ 50%

*These will grow as you complete your courses!*

---
Generated with ❤️ by SCOPE+ | [Download PDF]
```

### Output Understanding

**Data Structure:**
```json
{
  "growthReport": {
    "northStar": "사회 문제를 창의적으로 해결하는 사람",
    "skillsCurrent": [
      {
        "skill": "Creative Problem-Solving",
        "sources": ["Design Thinking", "Art & Life"],
        "confidence": 0.4,
        "studentRationale": "Solutions need to be useful and beautiful"
      }
    ],
    "skillEvolutionPath": {
      "current": ["Problem-Solving", "Collaboration"],
      "nearFuture": ["Systems Thinking", "Team Leadership"],
      "longTerm": ["Strategic Design", "Community Building"]
    },
    "uniqueEdge": "Analytical + Creative + Social awareness combination",
    "recommendedNext": {
      "semester2": ["Statistics"],
      "semester3": ["Psychology"],
      "extracurricular": ["Social innovation hackathons"]
    }
  },
  "conversationTranscript": [...],
  "voiceAnalytics": {
    "totalDuration": "18:34",
    "sentimentTrend": "increasingly confident",
    "keyPhrases": ["social problems", "creative solutions", "working together"]
  }
}
```

**Dashboard Update:**
- Growth Character Report downloadable
- Skills radar chart visualization
- Stage 4 unlocked

---

## **Stage 4: Tournament Bracket (Specialization Narrowing)**

### Objective
Help students commit to 2-3 specialization areas through gamified decision-making

### Interaction Model
**March Madness-style elimination tournament**

### Tournament Structure

**Starting Pool: 8 Specialization Areas**

Based on all previous stages, AI pre-selects 8 potential specializations:

```
┌─────────────────────────────────────────┐
│  Your Specialization Tournament         │
│  Choose your top 2-3 focus areas        │
├─────────────────────────────────────────┤
│                                         │
│  Round 1: Quarterfinals (8 → 4)        │
│                                         │
│  ┌──────────────┐   vs   ┌──────────┐ │
│  │ UX Design    │  [Pick] │ Data Sci │ │
│  │ ⭐⭐⭐        │         │ ⭐⭐     │ │
│  └──────────────┘         └──────────┘ │
│                                         │
│  ┌──────────────┐   vs   ┌──────────┐ │
│  │ Social Ent   │  [Pick] │ Content  │ │
│  │ ⭐⭐⭐⭐      │         │ ⭐⭐⭐   │ │
│  └──────────────┘         └──────────┘ │
│                                         │
│  [and 2 more matchups...]               │
│                                         │
└─────────────────────────────────────────┘
```

**Stars (⭐) = AI Confidence Score**
- Based on alignment with interests, skills, course choices

### Matchup Design

**Specialization Card Details:**

```
┌─────────────────────────────────┐
│  UX Design                      │
│  ⭐⭐⭐ 85% alignment            │
├─────────────────────────────────┤
│  What it is:                    │
│  "Design products people love"  │
│                                 │
│  Skills you have:               │
│  ✓ Creative problem-solving     │
│  ✓ Visual communication         │
│  ✓ Empathy                      │
│                                 │
│  Skills you need:               │
│  • User research                │
│  • Prototyping                  │
│  • Interface design             │
│                                 │
│  Related to your interests:     │
│  • Museum Curator (Stage 1 ⭐)  │
│  • Design Thinking (Stage 2)    │
│                                 │
│  Sample careers:                │
│  Product Designer, UX Researcher│
│                                 │
│  [Choose This] [Learn More]     │
└─────────────────────────────────┘
```

### Decision Support

**When Student Clicks Matchup:**

Chatbot appears with reflection prompt:
```
Bot: "UX Design vs Data Science—tough choice!

      Quick thought experiment:

      5 years from now, you're really good at one of these.
      Which version of you feels more exciting?"

[Voice response or text]
```

**Head-to-Head Comparison View:**

```
┌──────────────────────────────────────────┐
│  UX Design          vs      Data Science │
├──────────────────────────────────────────┤
│  Your Alignment                          │
│  ████████░░ 85%            ██████░░░░ 60%│
│                                          │
│  Skills Match                            │
│  Creative ✓                Analytical ✓  │
│  Visual ✓                  Math ✓        │
│  Social ✓                  Coding ✗      │
│                                          │
│  Course Support                          │
│  Design Thinking ✓         Math ✓        │
│  Art & Life ✓              Physics ✓     │
│  Media Studies ✓           (Need Stats)  │
│                                          │
│  Exploration Effort                      │
│  Ready to start            Need prep     │
│                                          │
│  [Pick UX Design]    [Pick Data Science] │
└──────────────────────────────────────────┘
```

### Tournament Progression

**Round 1 (8 → 4):** Eliminate half
**Round 2 (4 → 2):** Semifinals
**Round 3 (2 → 1):** Finals... BUT:

**Twist: Students can select BOTH finalists**

```
┌────────────────────────────────┐
│  Championship Round            │
│                                │
│  [UX Design] vs [Social Ent]   │
│                                │
│  Plot twist:                   │
│  You don't have to choose one! │
│                                │
│  Options:                      │
│  ○ Focus on UX Design only     │
│  ○ Focus on Social Ent only    │
│  ● Explore both (recommended)  │
│                                │
│  Why both?                     │
│  "These complement each other: │
│   UX gives you design skills,  │
│   Social Ent gives you impact  │
│   mission. Rare combo!"        │
│                                │
│  [Confirm Selection]           │
└────────────────────────────────┘
```

### Output Understanding

**Specialization Commitments:**

```json
{
  "tournamentResults": {
    "round1Winners": ["UX Design", "Social Ent", "Content Creation", "EdTech"],
    "round2Winners": ["UX Design", "Social Ent"],
    "finalSpecializations": [
      {
        "name": "UX Design",
        "alignmentScore": 0.85,
        "chosenBecause": "Creative + impact-driven",
        "confidenceLevel": "high",
        "nextSteps": ["Take HCI course", "Join design club"]
      },
      {
        "name": "Social Entrepreneurship",
        "alignmentScore": 0.88,
        "chosenBecause": "Solve social problems through innovation",
        "confidenceLevel": "high",
        "nextSteps": ["Find social innovation internship", "Read case studies"]
      }
    ],
    "eliminated": [
      {
        "name": "Data Science",
        "eliminatedInRound": 1,
        "reason": "Lacks coding foundation, low interest"
      }
    ]
  }
}
```

**Dashboard Update:**
```
┌──────────────────────────────────┐
│  🏆 Your Specializations         │
│                                  │
│  Primary: UX Design              │
│  Secondary: Social Ent           │
│                                  │
│  These align with:               │
│  • Your creative strengths       │
│  • Your social impact goals      │
│  • Your course selections        │
│                                  │
│  Confidence: 85%                 │
│                                  │
│  [Continue to Storyboard →]      │
└──────────────────────────────────┘
```

---

## **Stage 5: Storyboard (Future Visualization)**

### Objective
Create concrete, visual narrative of student's future path to make it feel real and achievable

### Interaction Model
**AI-assisted comic/storyboard generator** showing "A Day in Your Future Life"

### Storyboard Creation Process

**Step 1: Timeline Selection**

```
┌────────────────────────────────┐
│  When do you want to see?      │
│                                │
│  ○ 1 year from now (Year 2)    │
│  ● 3 years from now (University│
│  ○ 5 years from now (Career)   │
│  ○ 10 years from now (Mastery) │
│                                │
│  [Next]                        │
└────────────────────────────────┘
```

**Step 2: Scenario Building (Chatbot-Guided)**

```
Bot: "Let's imagine you 3 years from now.
      You're in university, studying something
      related to UX Design and Social Ent.

      What does a typical Tuesday look like?

      Let's build it together, scene by scene."
```

**Step 3: Scene-by-Scene Co-Creation**

**Panel 1: Morning**
```
Bot: "What are you doing when you wake up?"

Student (voice/text): "Maybe I'm working on a design project
                       for a social impact startup?"

Bot: "Love that! Let me visualize that scene..."

[AI generates image/illustration]

┌─────────────────────────────────────┐
│  Panel 1: 8:00 AM                   │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   [AI-generated illustration: │  │
│  │    Student at desk with       │  │
│  │    design sketches, laptop,   │  │
│  │    coffee, sunrise through    │  │
│  │    window]                    │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Caption: "You're refining a mobile │
│  app design for a community health  │
│  startup. Your UX research from     │
│  yesterday's user interviews is     │
│  shaping the interface."            │
│                                     │
│  [Edit Caption] [Regenerate Image]  │
└─────────────────────────────────────┘
```

**Panel 2: Midday**
```
Bot: "What happens next in your day?"

Student: "Class on human-centered design"

[AI generates classroom scene]
```

**Panel 3: Afternoon**
```
Bot: "After class?"

Student: "Maybe meeting with my social entrepreneurship
         team to plan our project pitch"

[AI generates team collaboration scene]
```

**Panel 4: Evening**
```
Bot: "How does your day end?"

Student: "Probably reviewing feedback on my portfolio
         and feeling proud of the progress"

[AI generates reflective evening scene]
```

### Storyboard Output

**Final 6-Panel Storyboard:**

```
┌──────────────────────────────────────────────┐
│  [Student Name]'s Future Story               │
│  3 Years from Now | University Life          │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Panel 1 │  │Panel 2 │  │Panel 3 │        │
│  │Morning │  │ Class  │  │  Team  │        │
│  │Design  │  │  HCD   │  │Meeting │        │
│  │Work    │  │        │  │        │        │
│  └────────┘  └────────┘  └────────┘        │
│                                              │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Panel 4 │  │Panel 5 │  │Panel 6 │        │
│  │Project │  │Portfolio│ │Evening │        │
│  │  Pitch │  │ Review  │ │Reflect │        │
│  │        │  │         │ │        │        │
│  └────────┘  └────────┘  └────────┘        │
│                                              │
│  Key Skills in Action:                       │
│  ✓ UX Design (Panels 1, 5)                  │
│  ✓ Collaboration (Panels 3, 4)              │
│  ✓ Systems Thinking (Panel 2)               │
│  ✓ Social Impact Focus (Panels 1, 4)        │
│                                              │
│  Path to This Future:                        │
│  Year 1: Build design foundation             │
│  Year 2: Join social innovation club         │
│  Year 3: Land impact startup internship      │
│                                              │
│  [Download Storyboard] [Share] [Edit]       │
└──────────────────────────────────────────────┘
```

### Multiple Timeline Storyboards

Students can create 3-4 different timelines:

1. **Near Future (1 year)**: "You in Year 2 of high school"
2. **University (3 years)**: "You thriving in your major"
3. **Early Career (5 years)**: "Your first job in UX Design"
4. **Mastery (10 years)**: "Leading social impact design projects"

### Storyboard Features

**1. AI Image Generation**
- Text-to-image AI (DALL-E, Midjourney style)
- Consistent character across panels
- Korean student aesthetic
- Realistic university/workplace settings

**2. Narrative Coherence**
- AI ensures story flows logically
- References skills from Stage 3
- Incorporates specializations from Stage 4
- Shows progression over time

**3. Emotional Anchoring**
- Each panel has emotional beat
- Show challenges + overcoming them
- End on achievement/pride moment
- Make future feel tangible

**4. Actionable Pathway**
- Each storyboard includes "Path to This Future" checklist
- Milestones tied to current course choices
- Next steps from where student is now

### Output Understanding

```json
{
  "storyboards": [
    {
      "timeline": "3-years",
      "title": "University Life in UX Design",
      "panels": [
        {
          "panelNumber": 1,
          "timeOfDay": "morning",
          "scene": "Working on social impact app design",
          "imageUrl": "generated-image-url",
          "caption": "You're refining a mobile app...",
          "skillsShown": ["UX Design", "Problem-Solving"],
          "emotionalTone": "focused-determined"
        }
      ],
      "pathwaySteps": [
        "Year 1: Build design foundation via Design Thinking course",
        "Year 2: Join social innovation club",
        "Year 3: Land impact startup internship"
      ],
      "confidenceLevel": "This feels achievable"
    }
  ]
}
```

**Dashboard Update:**
- Storyboard gallery accessible
- Journey completion badge
- Final recommendations unlocked

---

## **Final Dashboard: Recommendations & Next Semester Plan**

### Objective
Synthesize all 5 stages into actionable, concrete next steps

### Dashboard Final View

```
┌─────────────────────────────────────────────────┐
│  SCOPE+ Journey Complete! 🎉                    │
│  [학생 이름]의 진로 탐색 보고서                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Your Journey at a Glance               │   │
│  │                                         │   │
│  │  Stage 1: 50 roles explored ✓          │   │
│  │  Stage 2: Roadmap built ✓              │   │
│  │  Stage 3: Skills mapped ✓              │   │
│  │  Stage 4: 2 specializations chosen ✓   │   │
│  │  Stage 5: Future visualized ✓          │   │
│  │                                         │   │
│  │  Total Time Invested: 4.5 hours         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  🎯 Your Specializations                        │
│  ┌─────────────────────────────────────────┐   │
│  │  1. UX Design (85% confidence)          │   │
│  │  2. Social Entrepreneurship (88%)       │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📚 Recommended Courses (Next Semester)         │
│  ┌─────────────────────────────────────────┐   │
│  │  ⚓ Anchor (필수 기반)                     │   │
│  │  • 수학 (Math)                           │   │
│  │  • 영어 (English)                        │   │
│  │  • 한국사 (Korean History)               │   │
│  │                                         │   │
│  │  🎯 Signal (탐색 & 전문화)                │   │
│  │  • 디자인 사고 (Design Thinking) ⭐      │   │
│  │  • 미술과 생활 (Art & Life) ⭐           │   │
│  │  • 사회문제 탐구 (Social Issues) ⭐      │   │
│  │                                         │   │
│  │  Total Workload: 18h/week (Manageable)  │   │
│  │  Alignment Score: 92%                   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  🚀 Your Next 6 Months                          │
│  ┌─────────────────────────────────────────┐   │
│  │  □ Enroll in recommended courses        │   │
│  │  □ Join design or social impact club    │   │
│  │  □ Start personal design project        │   │
│  │  □ Find 1 mentor in UX field            │   │
│  │  □ Attend social innovation workshop    │   │
│  │  □ Build portfolio foundation           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  📊 Your Growth Character Report                │
│  [Download PDF] [View Interactive]              │
│                                                 │
│  🎨 Your Future Storyboards                     │
│  [View 3-Year Vision] [View 5-Year Vision]      │
│                                                 │
│  💬 Reflection Notes from AI Companion          │
│  [View Conversation History]                    │
│                                                 │
│  ─────────────────────────────────────────      │
│                                                 │
│  [Save Journey] [Share with Counselor]          │
│  [Start New Exploration] [Revisit Stages]       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Downloadable Assets

**1. Journey Summary PDF**
- All 5 stages summarized
- Visual journey map
- Skills growth report
- Storyboards included
- Recommended course list

**2. Counselor Handoff Document**
- Professional summary for school counselor
- Evidence of thoughtful exploration
- Justification for course choices
- Parent conversation guide

**3. Parent Conversation Prep Guide**
```
┌────────────────────────────────────┐
│  Talking to Parents About Your     │
│  Course Choices                    │
├────────────────────────────────────┤
│                                    │
│  Opening:                          │
│  "I spent 4+ hours exploring my    │
│   interests through SCOPE+..."     │
│                                    │
│  Show them:                        │
│  • Your Growth Character Report    │
│  • Storyboard of your future       │
│  • Why each course matters         │
│                                    │
│  Expect them to ask:               │
│  Q: "Will this get you into SKY?"  │
│  A: "I'm building skills that will │
│      make me successful anywhere"  │
│                                    │
│  Q: "Why Design Thinking?"         │
│  A: "I discovered I'm drawn to     │
│      creative problem-solving      │
│      through 50 role explorations" │
│                                    │
│  [More conversation templates...]  │
│                                    │
└────────────────────────────────────┘
```

---

## Technical Architecture

### Tech Stack

**Frontend:**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Animations**: Framer Motion
- **State**: Zustand (global) + React Query (server state)
- **Forms**: React Hook Form + Zod validation

**Backend:**
- **Framework**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **File Storage**: Supabase Storage (for storyboard images)

**AI Services:**
- **LLM**: OpenAI GPT-4 Turbo (chatbot, text generation)
- **Image Generation**: DALL-E 3 or Stable Diffusion (storyboards)
- **Speech-to-Text**: OpenAI Whisper API
- **Text-to-Speech**: ElevenLabs or OpenAI TTS

**Additional Tools:**
- **Analytics**: Posthog (privacy-focused)
- **Monitoring**: Sentry
- **Deployment**: Vercel
- **Voice Recording**: Web Audio API + MediaRecorder

### Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  year_level INTEGER,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 0: Profile
CREATE TABLE user_profiles (
  user_id UUID REFERENCES users(id),
  strengths TEXT[],
  learning_style TEXT,
  interests TEXT[],
  fears TEXT[],
  decision_style TEXT,
  uncertainty_tolerance TEXT,
  current_subjects TEXT[],
  cca_activities TEXT[],
  completed_at TIMESTAMPTZ
);

-- Stage 1: Role Roulette
CREATE TABLE role_swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  role_id TEXT,
  swipe_direction TEXT, -- 'left', 'right', 'up'
  swipe_speed FLOAT,
  card_tap_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage 2: Course Roadmap
CREATE TABLE course_selections (
  user_id UUID REFERENCES users(id),
  semester TEXT,
  selected_combination TEXT,
  course_list JSONB,
  total_workload INTEGER,
  alignment_score FLOAT,
  completed_at TIMESTAMPTZ
);

-- Stage 3: Growth Report
CREATE TABLE growth_reports (
  user_id UUID REFERENCES users(id),
  north_star TEXT,
  skills_current JSONB,
  skill_evolution_path JSONB,
  unique_edge TEXT,
  recommended_next JSONB,
  conversation_transcript JSONB,
  voice_analytics JSONB,
  completed_at TIMESTAMPTZ
);

-- Stage 4: Tournament
CREATE TABLE tournament_results (
  user_id UUID REFERENCES users(id),
  round1_winners TEXT[],
  round2_winners TEXT[],
  final_specializations JSONB,
  eliminated JSONB,
  completed_at TIMESTAMPTZ
);

-- Stage 5: Storyboards
CREATE TABLE storyboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  timeline TEXT,
  title TEXT,
  panels JSONB,
  pathway_steps TEXT[],
  confidence_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stage TEXT,
  role TEXT, -- 'user' or 'assistant'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI Prompt Engineering

**Chatbot System Prompt (Stage 3 Example):**

```
You are a supportive career exploration companion for Korean high school students.

Context:
- Student has completed Stages 1-2
- They've explored 50 career roles and selected courses
- Now translating courses into skills journey

Your role:
- Guide conversation to extract skill insights
- Ask open-ended questions
- Mirror back patterns you notice
- Help student articulate "why" skills matter to them
- Generate Growth Character Report at end

Strict rules:
- Use conversational Korean (반말)
- NEVER recommend specific careers
- NEVER evaluate aptitude
- Focus on "what you'll build" not "what you should do"
- Normalize uncertainty
- Celebrate progress

Conversation flow:
1. Start with course selection recap
2. Ask about each Signal subject: "What skills will you build?"
3. Probe deeper: "Why does that matter to you?"
4. Connect to larger goals: "Where does this lead?"
5. Synthesize into growth narrative

Crisis detection:
If student mentions suicide/self-harm/abuse:
- STOP immediately
- Provide crisis resources (1393, 1388)
- Do not attempt counseling

Tone: Warm, curious, non-judgmental, empowering
```

---

## 24-Hour Development Plan

Now I'll create the revised 24-hour plan in a separate document...

