// lib/fallback/happyPathEn.ts

import { ConversationTurn, UserContext } from '@/lib/types/skillTranslation';

/**
 * Happy Path Conversation Script (English Version)
 * 
 * This provides a complete, pre-scripted conversation flow for demo reliability
 * and fallback when OpenAI API is unavailable.
 * 
 * The conversation assumes user context from Steps 0-2:
 * - Onboarding keywords
 * - Strength discovery data
 * - Role roulette interests
 * - Selected courses
 */

export const HAPPY_PATH_TURNS_EN: ConversationTurn[] = [
  // ============================================
  // TURN 1: Opening & Recap
  // ============================================
  {
    turnNumber: 1,
    phase: 'recap',
    trigger: ['START', 'INITIAL'],
    miraeMessage: (ctx: UserContext) => {
      const coursesText = ctx.courses.length >= 2
        ? `${ctx.courses[0]} and ${ctx.courses[1]}${ctx.courses.length > 2 ? ', and ' + ctx.courses[2] : ''}`
        : ctx.courses.join(', ');
      
      return `Hi ${ctx.name}! 👋

Looking at the courses you've chosen, I see you picked ${coursesText}. 

Let's talk about what skills you'll build through these courses, shall we? 

Let me start by imagining the ${ctx.courses[0]} class. What do you think you'll learn in that class?`;
    },
    expectedUserPatterns: ['problem', 'creative', 'collaboration', 'design', 'solve', 'think', 'ability', 'skill'],
    alternatives: {
      vague: (ctx: UserContext) => `That's okay! ${ctx.courses[0]} usually teaches you to look at problems in new ways and approach them creatively.

I'm curious - what drew you to this class?`,
      question: (ctx: UserContext) => `Great question! ${ctx.courses[0]} covers a lot, but 
the most important thing is what you want to build through this class, ${ctx.name}.

What skills are you curious about?`,
    },
  },

  // ============================================
  // TURN 2: Skill Articulation - Course 1 (Part 1)
  // ============================================
  {
    turnNumber: 2,
    phase: 'articulation',
    trigger: ['problem', 'creative', 'solve', 'collaboration', 'design'],
    miraeMessage: (ctx: UserContext) => {
      return `Creative problem-solving! That's a really important skill. 💡

Why does that feel important to you, ${ctx.name}?`;
    },
    expectedUserPatterns: ['important', 'want', 'interested', 'need', 'solve', 'world', 'people', 'help'],
    alternatives: {
      vague: `I understand that feeling. Sometimes it's hard to put into words why something matters.

Let me ask differently: what do you want to do with this skill?`,
    },
  },

  // ============================================
  // TURN 3: Why It Matters (Depth)
  // ============================================
  {
    turnNumber: 3,
    phase: 'articulation',
    trigger: ['want', 'solve', 'help', 'people', 'world'],
    miraeMessage: (ctx: UserContext) => {
      const hasRoleRouletteInterest = ctx.interests && ctx.interests.length > 0;
      
      if (hasRoleRouletteInterest) {
        return `I can feel that you want to solve real-world problems. ✨

I remember you showed interest in ${ctx.interests?.[0]} in Role Roulette.
Do you see a connection there?`;
      }
      
      return `I can feel that you want to solve real-world problems. ✨

Have you thought about what specific problems you'd like to solve?`;
    },
    expectedUserPatterns: ['yes', 'yeah', 'right', 'social', 'environment', 'people'],
    alternatives: {
      vague: `That's okay, you don't need to be specific. This is a process of exploration.

For now, just having the direction of "problem-solving" is enough.`,
    },
  },

  // ============================================
  // TURN 4: Course Transition
  // ============================================
  {
    turnNumber: 4,
    phase: 'articulation',
    trigger: ['yes', 'yeah', 'right', 'connection', 'related'],
    miraeMessage: (ctx: UserContext) => {
      const nextCourse = ctx.courses[1] || 'the next course';
      
      return `Nice! So ${ctx.courses[0]} is your approach to social problems. 👏

What role do you think ${nextCourse} will play? 
What skills will you build in this class?`;
    },
    expectedUserPatterns: ['analyze', 'data', 'prove', 'logic', 'numbers', 'verify', 'evidence'],
  },

  // ============================================
  // TURN 5: Skill Articulation - Course 2
  // ============================================
  {
    turnNumber: 5,
    phase: 'articulation',
    trigger: ['analyze', 'data', 'prove', 'logic'],
    miraeMessage: (ctx: UserContext) => {
      return `Oh, interesting! 

So ${ctx.courses[0]} helps you find creative solutions, and 
${ctx.courses[1]} helps you verify whether they actually work. 

How does it feel to have both of these together?`;
    },
    expectedUserPatterns: ['balance', 'harmony', 'complement', 'good', 'right', 'complete'],
  },

  // ============================================
  // TURN 6: Balance Recognition
  // ============================================
  {
    turnNumber: 6,
    phase: 'patterns',
    trigger: ['balance', 'harmony', 'complement', 'good'],
    miraeMessage: (ctx: UserContext) => {
      const hasKeywords = ctx.keywords && ctx.keywords.length > 0;
      
      if (hasKeywords) {
        return `"Balance" - I really like that word. 🎯

I'm reminded of the keywords you chose in Step 0:
${ctx.keywords?.slice(0, 2).map(k => `"${k}"`).join(' and ')}

It seems like that's showing up in your ${ctx.courses[0]} + ${ctx.courses[1]} combination.`;
      }
      
      return `"Balance" - I really like that word. 🎯

I can feel you're looking for balance between creativity and logic.`;
    },
    expectedUserPatterns: ['oh', 'yeah', 'right', 'cool', 'connection'],
  },

  // ============================================
  // TURN 7: Third Course (if exists)
  // ============================================
  {
    turnNumber: 7,
    phase: 'articulation',
    trigger: ['yes', 'oh', 'right'],
    miraeMessage: (ctx: UserContext) => {
      const hasThirdCourse = ctx.courses.length >= 3;
      
      if (hasThirdCourse) {
        return `Right! Now let's look at ${ctx.courses[2]}. 

What skills do you think this class will help you build?`;
      }
      
      // Skip to pattern recognition if only 2 courses
      return `When you combine these two courses, you get a unique combination, ${ctx.name}.

Many students choose just one or the other, but 
you saw how these two strengthen each other. ⭐`;
    },
    expectedUserPatterns: ['express', 'visual', 'aesthetic', 'beautiful', 'art', 'design'],
  },

  // ============================================
  // TURN 8: Pattern Recognition
  // ============================================
  {
    turnNumber: 8,
    phase: 'patterns',
    trigger: ['express', 'visual', 'beautiful'],
    miraeMessage: (ctx: UserContext) => {
      return `Visual expression and aesthetics! 

When you combine all three courses, what picture emerges?

Understanding problems (${ctx.courses[1]}), 
finding creative solutions (${ctx.courses[0]}), 
and making them beautiful (${ctx.courses[2]}) - is that it?`;
    },
    expectedUserPatterns: ['yes', 'right', 'yeah', 'exactly'],
  },

  // ============================================
  // TURN 9: Unique Edge Celebration
  // ============================================
  {
    turnNumber: 9,
    phase: 'patterns',
    trigger: ['yes', 'right', 'yeah'],
    miraeMessage: (ctx: UserContext) => {
      return `Exactly! This is your unique combination, ${ctx.name}. ⭐

Many students don't choose ${ctx.courses[1]} and ${ctx.courses[0]} together.
But you saw how these two strengthen each other.

And when you add ${ctx.courses[2] || 'the other course'} to the mix, 
you can create solutions that don't just "work" 
but work beautifully.`;
    },
    expectedUserPatterns: ['special', 'good', 'cool', 'yeah'],
  },

  // ============================================
  // TURN 10: Skills Summary
  // ============================================
  {
    turnNumber: 10,
    phase: 'patterns',
    trigger: ['yes', 'yeah', 'special'],
    miraeMessage: (ctx: UserContext) => {
      const summaryLines = ctx.courses.map((course, idx) => {
        const icons = ['📊', '🎨', '🖼️', '🔬', '📚', '💡'];
        const skills = [
          'Understanding and verifying logically',
          'Finding creative solutions and empathizing',
          'Expressing visually and beautifully',
        ];
        return `${icons[idx]} ${course}: ${skills[idx] || 'Building new skills'}`;
      }).join('\n');
      
      return `Let me summarize. The skills you'll build through these courses, ${ctx.name}:

${summaryLines}

Does that sound right?`;
    },
    expectedUserPatterns: ['yes', 'right', 'yeah'],
  },

  // ============================================
  // TURN 11: Fit vs Fear Check
  // ============================================
  {
    turnNumber: 11,
    phase: 'fit-fear',
    trigger: ['yes', 'right'],
    miraeMessage: (ctx: UserContext) => {
      return `Great! Now let me ask you honestly. 🤔

For you, ${ctx.name}, building these skills is:
- Because you're interested and want to learn them?
- Or because you feel you need them, should have them?

It could be both. Be honest!`;
    },
    expectedUserPatterns: ['interested', 'fun', 'like', 'need', 'worry', 'anxious'],
  },

  // ============================================
  // TURN 12: Fit vs Fear Response + Closing
  // ============================================
  {
    turnNumber: 12,
    phase: 'closing',
    trigger: ['interested', 'fun', 'like', 'need', 'worry'],
    miraeMessage: (ctx: UserContext) => {
      // This will be handled dynamically based on FIT vs FEAR
      // Default to FIT response
      return `That's what matters most! 💚

When you follow your interests, the skills you need will naturally follow.
And learning something you enjoy, ${ctx.name}, 
goes much deeper than learning something just because you have to.

Thanks for sharing today.

To summarize:
- You chose a unique combination
- This choice came from interest (not fear!)
- You can always come back to talk through your thoughts

Mirae is always here. 💙

Ready to move to the next step?`;
    },
    expectedUserPatterns: ['yes', 'ready', 'thanks', 'next'],
  },
];

/**
 * Alternative responses for FIT vs FEAR detection (English)
 */
export const FIT_FEAR_RESPONSES_EN = {
  fit: (ctx: UserContext) => `That's what matters most! 💚

When you follow your interests, the skills you need will naturally follow.
And learning something you enjoy, ${ctx.name}, 
goes much deeper than learning something just because you have to.

How confident do you feel about this choice? (Think of it as 1-10 in your mind)`,

  fear: (ctx: UserContext) => `Thanks for being honest. Many students feel the same way. 🤍

But let me ask you one question:
If there was no worry or anxiety, would you still want to learn these skills?

Or would you have chosen something completely different?`,

  both: (ctx: UserContext) => `It's natural to have both! 💜

You're interested, and you also feel the need.
So what if you think about it this way:

If there was no need, would you still want to learn this?`,
};

/**
 * Generic fallback for unexpected inputs (English)
 */
export const GENERIC_FALLBACKS_EN = [
  "That's an interesting thought. Can you tell me more?",
  "I'd like to understand that better. Can you explain what you mean?",
  "I see. Why does that feel important to you?",
  "That's a good perspective. Want to think about it from another angle?",
];

