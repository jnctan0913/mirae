'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Pencil, Edit2, Check, X as XIcon, Share2, Download, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { getUser } from '@/lib/auth';
import { useUserStore } from '@/lib/stores/userStore';
import ActivityCalendar from '@/components/ActivityCalendar';
import JourneyReportView from '@/components/JourneyReportView';
import { loadActivityLogs, saveActivityLogs, type ActivityLog } from '@/lib/activityLogs';
import {
  MiraeCharacter,
  getEvolutionMessage,
  type CardType as CharCardType,
  type EquippedAccessories,
} from '@/components/MiraeCharacterEvolution';
import { AccessoryPanel } from '@/components/AccessoryPanel';

// ============= Types =============
type Stage = 'S' | 'C' | 'O' | 'P' | 'E';

type CardType = CharCardType;

type CardRarity = 'Common' | 'Rare' | 'Epic';

type CollectionSection = {
  id: string;
  title: string;
  subtitle: string;
  types: CardType[];
};

type IdentityCard = {
  id: string;
  stage: Stage;
  type: CardType;
  title: string;
  description: string;
  rarity: CardRarity;
  unlocked: boolean;
  tags: string[];
  createdFrom: string;
};

// ============= Seed Data =============
const SEED_CARDS: IdentityCard[] = [
  {
    id: 'card-1',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Pattern Recognition',
    description: 'You notice connections others miss. When analyzing problems, you naturally see underlying structures.',
    rarity: 'Rare',
    unlocked: true,
    tags: ['analytical', 'systems thinking'],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-2',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Human-Centered Design',
    description: 'You\'re drawn to understanding how people interact with the world around them.',
    rarity: 'Common',
    unlocked: true,
    tags: ['empathy', 'design', 'people'],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-3',
    stage: 'O',
    type: 'Experience',
    title: 'Calculus & Statistics',
    description: 'Building mathematical foundations to understand data and change.',
    rarity: 'Common',
    unlocked: true,
    tags: ['math', 'data', 'foundations'],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-4',
    stage: 'P',
    type: 'ProofMoment',
    title: 'School Project Success',
    description: 'Led a team project that combined research and creative presentation. Learned that structure supports creativity.',
    rarity: 'Rare',
    unlocked: true,
    tags: ['teamwork', 'leadership'],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-5',
    stage: 'E',
    type: 'ThenVsNow',
    title: 'From Rigid to Flexible',
    description: 'You used to think planning meant locking in. Now you see it as creating space for better choices.',
    rarity: 'Epic',
    unlocked: true,
    tags: ['growth', 'mindset'],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-6',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Creative Problem Solving',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-7',
    stage: 'C',
    type: 'ValueSignal',
    title: 'Making Impact',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-8',
    stage: 'O',
    type: 'Experience',
    title: 'Advanced Programming',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-9',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Personal Challenge',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-10',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Core Values Clarity',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-11',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Strategic Planner',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-12',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Behavioral Psychology',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-13',
    stage: 'O',
    type: 'Experience',
    title: 'Research Methods',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-14',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Internship Reflection',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-15',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Community Impact',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-16',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Systems Thinker',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-17',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Pattern Spotter',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-18',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Insight Connector',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-19',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Structured Creator',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-20',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Big-Picture Vision',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-21',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Detail Guardian',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-22',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Focus Builder',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-23',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Process Designer',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-24',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Calm Decision-Maker',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-25',
    stage: 'S',
    type: 'StrengthPattern',
    title: 'Learning Strategist',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 0: Strength Discovery',
  },
  {
    id: 'card-26',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Product Curiosity',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-27',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Social Impact Lens',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-28',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Health & Wellness Interest',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-29',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Media Storytelling',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-30',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'AI & Ethics',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-31',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Environmental Futures',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-32',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Business Strategy',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-33',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Education Innovation',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-34',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Urban Design',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-35',
    stage: 'C',
    type: 'CuriosityThread',
    title: 'Cultural Analysis',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 1: Role Roulette',
  },
  {
    id: 'card-36',
    stage: 'O',
    type: 'Experience',
    title: 'AP Computer Science',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-37',
    stage: 'O',
    type: 'Experience',
    title: 'Statistics Lab',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-38',
    stage: 'O',
    type: 'Experience',
    title: 'Design Studio',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-39',
    stage: 'O',
    type: 'Experience',
    title: 'Economics Foundations',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-40',
    stage: 'O',
    type: 'Experience',
    title: 'Research Seminar',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-41',
    stage: 'O',
    type: 'Experience',
    title: 'Data Visualization',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-42',
    stage: 'O',
    type: 'Experience',
    title: 'Biology Lab',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-43',
    stage: 'O',
    type: 'Experience',
    title: 'Ethnography Project',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-44',
    stage: 'O',
    type: 'Experience',
    title: 'Entrepreneurship Workshop',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-45',
    stage: 'O',
    type: 'Experience',
    title: 'Portfolio Review',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 2: Course Roadmap',
  },
  {
    id: 'card-46',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Capstone Showcase',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-47',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Competition Win',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-48',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Mentor Feedback',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-49',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Club Leadership',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-50',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Prototype Launch',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-51',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Field Interview',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-52',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Hackathon Sprint',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-53',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Volunteer Impact',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-54',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Peer Teaching',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-55',
    stage: 'P',
    type: 'ProofMoment',
    title: 'Case Study Submission',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 3: Skill Translation',
  },
  {
    id: 'card-56',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Equity Focus',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-57',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Sustainability Drive',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-58',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Creativity First',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-59',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Long-Term Stability',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-60',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Community Belonging',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-61',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Global Perspective',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-62',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Collaboration Energy',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-63',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Independent Growth',
    description: 'Unlock by continuing your journey.',
    rarity: 'Rare',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-64',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Balance & Wellbeing',
    description: 'Unlock by continuing your journey.',
    rarity: 'Common',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
  {
    id: 'card-65',
    stage: 'E',
    type: 'ValueSignal',
    title: 'Meaningful Work',
    description: 'Unlock by continuing your journey.',
    rarity: 'Epic',
    unlocked: false,
    tags: [],
    createdFrom: 'Stage 4: Evolve',
  },
];

// ============= FloatingOrbsBackground =============
const FloatingOrbsBackground = () => {
  const orbs = [
    { size: 300, x: '10%', y: '20%', duration: 25, delay: 0, color: 'rgba(157, 213, 245, 0.1)' },
    { size: 200, x: '80%', y: '60%', duration: 30, delay: 5, color: 'rgba(168, 213, 186, 0.08)' },
    { size: 250, x: '50%', y: '80%', duration: 28, delay: 10, color: 'rgba(244, 214, 117, 0.09)' },
    { size: 180, x: '70%', y: '15%', duration: 32, delay: 2, color: 'rgba(245, 183, 168, 0.07)' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
};

// ============= IdentityCardTile =============
interface IdentityCardTileProps {
  card: IdentityCard;
  onClick: () => void;
  compact?: boolean;
}

const IdentityCardTile = ({ card, onClick, compact = false }: IdentityCardTileProps) => {
  const stageColors = {
    S: 'from-[#9DD5F5] to-[#7EC4F0]',
    C: 'from-[#A8D5BA] to-[#8DC9B8]',
    O: 'from-[#F4D675] to-[#E8D068]',
    P: 'from-[#F5B7A8] to-[#F2A896]',
    E: 'from-[#B19CD9] to-[#A78BCA]',
  };

  const rarityBadge = {
    Common: 'bg-slate-200 text-slate-600',
    Rare: 'bg-violet-200 text-violet-700',
    Epic: 'bg-amber-200 text-amber-700',
  };

  return (
    <motion.div
      whileHover={card.unlocked ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={`relative rounded-2xl ${compact ? 'p-4' : 'p-5'} backdrop-blur-lg transition-all cursor-pointer ${
        card.unlocked
          ? 'bg-white/85 border border-white/40 shadow-lg hover:shadow-xl'
          : 'bg-white/30 border border-white/30 shadow-md'
      }`}
    >
      {!card.unlocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl backdrop-blur-sm z-10">
          <Lock className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs text-slate-400 px-4 text-center">
            Unlock by continuing your journey
          </p>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${stageColors[card.stage]}`}>
          {card.stage}
        </div>
        {card.unlocked && card.rarity === 'Epic' && (
          <Sparkles className="w-4 h-4 text-amber-400" />
        )}
      </div>

      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-slate-800 mb-2 line-clamp-1`}>
        {card.title}
      </h3>

      <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-600 mb-3 line-clamp-2`}>
        {card.description}
      </p>

      {card.unlocked && (
        <>
          {!compact && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between ${compact ? 'pt-2' : 'pt-3'} border-t border-slate-200/50`}>
            {!compact && <p className="text-xs text-slate-400">{card.createdFrom}</p>}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarityBadge[card.rarity]}`}>
              {card.rarity}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
};

// ============= CardDetailModal =============
interface CardDetailModalProps {
  card: IdentityCard;
  onClose: () => void;
  reflection: string;
  onReflectionChange: (value: string) => void;
  onSave: () => void;
}

const CardDetailModal = ({
  card,
  onClose,
  reflection,
  onReflectionChange,
  onSave,
}: CardDetailModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const stageColors = {
    S: 'from-[#9DD5F5] to-[#7EC4F0]',
    C: 'from-[#A8D5BA] to-[#8DC9B8]',
    O: 'from-[#F4D675] to-[#E8D068]',
    P: 'from-[#F5B7A8] to-[#F2A896]',
    E: 'from-[#B19CD9] to-[#A78BCA]',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-white/40 bg-white/90 p-6 shadow-2xl backdrop-blur-lg"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${stageColors[card.stage]}`}>
            Stage {card.stage} · {card.type}
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
            {card.rarity}
          </span>
        </div>

        <h2 className="text-2xl font-semibold text-slate-800 mb-3">
          {card.title}
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          {card.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-1">Created from</p>
          <p className="text-sm font-medium text-slate-700">{card.createdFrom}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Add a short reflection (optional)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            className="w-full h-24 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            placeholder="What does this mean to you?"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============= AvatarPanel =============
interface AvatarPanelProps {
  cardCount: number;
  recentCardTypes: CardType[];
  allTags: string[];
  equippedAccessories: EquippedAccessories;
  completedStages: string[];
  onAccessoryChange: (accessories: EquippedAccessories) => void;
}

const AvatarPanel = ({
  cardCount,
  recentCardTypes,
  allTags,
  equippedAccessories,
  completedStages,
  onAccessoryChange,
}: AvatarPanelProps) => {
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    console.log('AvatarPanel: equippedAccessories changed:', equippedAccessories);
  }, [equippedAccessories]);

  return (
    <>
      <div className="sticky top-6">
        <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg relative">
          {/* Pencil Icon Button - Top Right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowCustomizer(true);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-[#9DD5F5] to-[#C7B9FF] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 z-10"
            title="Customize Mirae"
          >
            <Pencil className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Identity</h3>

          <div className="relative w-full aspect-[4/3] max-h-[280px] mb-4 rounded-2xl bg-gradient-to-br from-sky-50 via-violet-50 to-rose-50 flex items-center justify-center overflow-hidden">
            <MiraeCharacter
              key={`main-${JSON.stringify(equippedAccessories)}`}
              cardCount={cardCount}
              recentCardTypes={recentCardTypes}
              size={220}
              equippedAccessories={equippedAccessories}
              className="debug-main-avatar"
            />
          </div>

          <div className="mb-4 p-3 rounded-xl bg-slate-50/80">
            <p className="text-sm font-medium text-slate-700 text-center">
              {getEvolutionMessage(
                cardCount === 0 ? 'base' :
                cardCount <= 2 ? 'awakening' :
                cardCount <= 4 ? 'discovering' :
                cardCount <= 7 ? 'emerging' :
                'realized'
              )}
            </p>
            <p className="text-xs text-slate-500 text-center mt-1">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'} collected
            </p>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-slate-600 mb-2">Your Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags.length > 0 ? (
                allTags.slice(0, 8).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Themes will appear as you collect cards
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            Mirae evolves with each card you collect, reflecting your growing sense of self.
          </p>
        </div>
      </div>

      {/* Accessory Customization Modal */}
      <AccessoryPanel
        cardCount={cardCount}
        completedStages={completedStages}
        equippedAccessories={equippedAccessories}
        onAccessoryChange={onAccessoryChange}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        showTriggerButton={false}
      />
    </>
  );
};

// ============= StatementView =============
interface StatementViewProps {
  cards: IdentityCard[];
  onUpdateCard: (cardId: string, updates: { title?: string; description?: string }) => void;
}

const StatementView = ({ cards, onUpdateCard }: StatementViewProps) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const unlockedCards = cards.filter((c) => c.unlocked);

  const drawnTo = unlockedCards.filter(
    (c) => c.type === 'CuriosityThread' || c.type === 'ValueSignal'
  );
  const done = unlockedCards.filter(
    (c) => c.type === 'Experience' || c.type === 'ProofMoment'
  );
  const changed = unlockedCards.filter(
    (c) => c.type === 'ThenVsNow' || c.type === 'StrengthPattern'
  );

  const handleStartEdit = (card: IdentityCard) => {
    setEditingCardId(card.id);
    setEditTitle(card.title);
    setEditDescription(card.description);
  };

  const handleSaveEdit = () => {
    if (editingCardId) {
      onUpdateCard(editingCardId, { title: editTitle, description: editDescription });
      setEditingCardId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const renderEditableCard = (card: IdentityCard) => {
    const isEditing = editingCardId === card.id;

    if (isEditing) {
      return (
        <li key={card.id} className="text-sm bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-slate-400 mt-1">•</span>
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-2 py-1 text-sm font-medium border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#9DD5F5]"
                placeholder="Title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#9DD5F5] min-h-[60px]"
                placeholder="Description"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-slate-300 text-slate-700 text-xs rounded-full hover:bg-slate-400 transition flex items-center gap-1"
                >
                  <XIcon className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li key={card.id} className="text-sm text-slate-600 flex items-start gap-2 group hover:bg-slate-50 rounded-lg p-2 -ml-2 transition">
        <span className="text-slate-400 mt-1">•</span>
        <span className="flex-1">{card.title}: {card.description}</span>
        <button
          onClick={() => handleStartEdit(card)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded transition"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/40 bg-white/85 p-6 backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          What I'm drawn to
        </h3>
        {drawnTo.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {drawnTo.map((card) => renderEditableCard(card))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-3">Nothing here yet.</p>
        )}
        <p className="text-xs text-slate-400 italic">
          This is a draft shape — you're always allowed to change.
        </p>
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/85 p-6 backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          What I've done
        </h3>
        {done.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {done.map((card) => renderEditableCard(card))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-3">Nothing here yet.</p>
        )}
        <p className="text-xs text-slate-400 italic">
          This is a draft shape — you're always allowed to change.
        </p>
      </div>

      <div className="rounded-2xl border border-white/40 bg-white/85 p-6 backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          How I've changed
        </h3>
        {changed.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {changed.map((card) => renderEditableCard(card))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 mb-3">Nothing here yet.</p>
        )}
        <p className="text-xs text-slate-400 italic">
          This is a draft shape — you're always allowed to change.
        </p>
      </div>
    </div>
  );
};

// ============= Main Component =============
export default function MiraePlusStatement() {
  const router = useRouter();
  const { progress } = useUserStore();
  const [cards, setCards] = useState<IdentityCard[]>(SEED_CARDS);
  const [viewMode, setViewMode] = useState<'collection' | 'statement'>('collection');
  const [selectedCard, setSelectedCard] = useState<IdentityCard | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [currentReflection, setCurrentReflection] = useState('');
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});
  const [activeCategory, setActiveCategory] = useState<CollectionSection | null>(null);
  const [adventureOpen, setAdventureOpen] = useState(false);
  const [adventureView, setAdventureView] = useState<'archive' | 'report'>('archive');
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [studentName, setStudentName] = useState('Student');
  const collectionScrollRef = useRef<HTMLDivElement | null>(null);

  // Load from localStorage
  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setStudentName(user.name);
    } else if (user?.email) {
      setStudentName(user.email.split('@')[0]);
    }

    const savedReflections = localStorage.getItem('miraePlus_reflections');
    const savedViewMode = localStorage.getItem('miraePlus_viewMode');
    const savedAccessories = localStorage.getItem('miraePlus_accessories');
    const savedCards = localStorage.getItem('miraePlus_cards');

    if (savedReflections) setReflections(JSON.parse(savedReflections));
    if (savedViewMode) setViewMode(savedViewMode as 'collection' | 'statement');
    if (savedAccessories) setEquippedAccessories(JSON.parse(savedAccessories));
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      setCards(parsedCards);
    }
    setActivityLogs(loadActivityLogs());
  }, []);

  useEffect(() => {
    if (!adventureOpen) {
      // Remove body class when modal closes
      document.body.classList.remove('modal-open');
      setShareDropdownOpen(false);
      return;
    }
    // Add body class when modal opens
    document.body.classList.add('modal-open');
  }, [adventureOpen, adventureView]);

  const handleCardClick = (card: IdentityCard) => {
    if (!card.unlocked) {
      // Show gentle message
      return;
    }
    setSelectedCard(card);
    setCurrentReflection(reflections[card.id] || '');
  };

  const handleSaveReflection = () => {
    if (!selectedCard) return;
    const updated = { ...reflections, [selectedCard.id]: currentReflection };
    setReflections(updated);
    localStorage.setItem('miraePlus_reflections', JSON.stringify(updated));
    setSelectedCard(null);
  };

  const handleViewModeChange = (mode: 'collection' | 'statement') => {
    setViewMode(mode);
    localStorage.setItem('miraePlus_viewMode', mode);
  };

  const handleDownloadStoryPdf = () => {
    setAdventureView('report');
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        window.print();
      }, 200);
    }
  };

  const handleAccessoryChange = (newAccessories: EquippedAccessories) => {
    console.log('Collection page: handleAccessoryChange called with:', newAccessories);
    setEquippedAccessories(newAccessories);
    localStorage.setItem('miraePlus_accessories', JSON.stringify(newAccessories));
    console.log('Collection page: State updated, localStorage saved');
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('miraeAccessoriesUpdated'));
    }
  };

  useEffect(() => {
    if (activityLogs.length > 0) {
      saveActivityLogs(activityLogs);
    }
  }, [activityLogs]);

  const handleUpdateCard = (cardId: string, updates: { title?: string; description?: string }) => {
    const updatedCards = cards.map((card) =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    setCards(updatedCards);
    localStorage.setItem('miraePlus_cards', JSON.stringify(updatedCards));
  };

  const handleScrollToBottom = () => {
    collectionScrollRef.current?.scrollTo({
      top: collectionScrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleAddLog = (log: ActivityLog) => {
    setActivityLogs((prev) =>
      [...prev, log].sort((a, b) => a.date.localeCompare(b.date))
    );
  };

  const handleOpenCategory = (section: CollectionSection) => {
    setActiveCategory(section);
  };

  const handleCloseCategory = () => {
    setActiveCategory(null);
  };

  const handleOpenAdventure = () => {
    setAdventureView('archive');
    setAdventureOpen(true);
  };

  const handleCloseAdventure = () => {
    setAdventureOpen(false);
  };

  const unlockedCards = cards.filter((c) => c.unlocked);
  const allTags = Array.from(new Set(unlockedCards.flatMap((c) => c.tags)));
  const recentCardTypes = unlockedCards.slice(-3).map((c) => c.type);
  const completedStages = Array.from(new Set(unlockedCards.map((c) => c.stage)));
  const collectionSections: CollectionSection[] = [
    {
      id: 'self-strengths',
      title: 'Self & Strengths',
      subtitle: 'What you naturally bring to the table.',
      types: ['StrengthPattern', 'ThenVsNow'] as CardType[],
    },
    {
      id: 'curiosity-roles',
      title: 'Curiosity & Roles',
      subtitle: 'Interests that hint at future roles.',
      types: ['CuriosityThread'] as CardType[],
    },
    {
      id: 'academics-path',
      title: 'Academic Path',
      subtitle: 'Courses and skills that shape university readiness.',
      types: ['Experience'] as CardType[],
    },
    {
      id: 'proof-experiences',
      title: 'Proof & Experiences',
      subtitle: 'Evidence of growth through projects and challenges.',
      types: ['ProofMoment'] as CardType[],
    },
    {
      id: 'values-fit',
      title: 'Values & Fit',
      subtitle: 'Signals that guide university and program fit.',
      types: ['ValueSignal'] as CardType[],
    },
  ];

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/asset/Background.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>
      <FloatingOrbsBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 h-screen overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 h-full min-h-0">
          {/* Left Column */}
          <div className="space-y-6 h-full min-h-0">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-2">
                Your story, so far
              </h1>
              <p className="text-sm text-slate-600 mb-4">
                This isn't something you write once. It grows as you explore.
              </p>
            </div>
            <AvatarPanel
              cardCount={unlockedCards.length}
              recentCardTypes={recentCardTypes}
              allTags={allTags}
              equippedAccessories={equippedAccessories}
              completedStages={completedStages}
              onAccessoryChange={handleAccessoryChange}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6 h-full min-h-0 flex flex-col">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewModeChange('collection')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'collection'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white/80 text-slate-600 border border-white/40 hover:bg-white'
                }`}
                aria-label="Switch to Collection View"
              >
                Collection View
              </button>
              <button
                onClick={() => handleViewModeChange('statement')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  viewMode === 'statement'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white/80 text-slate-600 border border-white/40 hover:bg-white'
                }`}
                aria-label="Switch to Statement View"
              >
                Statement View
              </button>
            </div>

            <div ref={collectionScrollRef} className="relative flex-1 min-h-0 overflow-y-auto pr-2">
              {viewMode === 'collection' ? (
                <div className="space-y-8">
                  <div className="min-h-full flex flex-col justify-center">
                    <p className="text-xs text-slate-500 mb-4">
                      More cards appear as you explore.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {collectionSections
                        .filter((section) =>
                          ['self-strengths', 'curiosity-roles', 'academics-path'].includes(section.id)
                        )
                        .map((section) => {
                          const sectionCards = cards.filter((card) =>
                            section.types.includes(card.type)
                          );
                    return (
                      <div key={section.id} className="space-y-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-800">
                            {section.title}
                          </h2>
                          <p className="text-xs text-slate-500">{section.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {sectionCards.filter((card) => card.unlocked).slice(0, 3).map((card) => (
                            <IdentityCardTile
                              key={card.id}
                              card={card}
                              onClick={() => handleCardClick(card)}
                              compact
                            />
                          ))}
                          {sectionCards.filter((card) => card.unlocked).length === 0 && (
                            <div className="rounded-2xl border border-white/40 bg-white/60 p-4 text-xs text-slate-500">
                              No unlocked cards yet.
                            </div>
                          )}
                        </div>
                        {sectionCards.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleOpenCategory(section)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                          >
                            Click to view all ->
                          </button>
                        )}
                      </div>
                    );
                  })}
                    </div>
                  </div>
                  <div className="min-h-full flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {collectionSections
                        .filter((section) =>
                          ['proof-experiences', 'values-fit'].includes(section.id)
                        )
                        .map((section) => {
                          const sectionCards = cards.filter((card) =>
                            section.types.includes(card.type)
                          );
                    return (
                      <div key={section.id} className="space-y-3">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-800">
                            {section.title}
                          </h2>
                          <p className="text-xs text-slate-500">{section.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {sectionCards.filter((card) => card.unlocked).slice(0, 3).map((card) => (
                            <IdentityCardTile
                              key={card.id}
                              card={card}
                              onClick={() => handleCardClick(card)}
                              compact
                            />
                          ))}
                          {sectionCards.filter((card) => card.unlocked).length === 0 && (
                            <div className="rounded-2xl border border-white/40 bg-white/60 p-4 text-xs text-slate-500">
                              No unlocked cards yet.
                            </div>
                          )}
                        </div>
                        {sectionCards.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleOpenCategory(section)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition"
                          >
                            Click to view all ->
                          </button>
                        )}
                      </div>
                    );
                  })}
                    </div>
                  </div>
                </div>
              ) : (
                <StatementView cards={cards} onUpdateCard={handleUpdateCard} />
              )}

            </div>

            <div>
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/dashboard?stage=${progress.currentStage}`)}
                    className="px-5 py-2 rounded-full text-sm font-medium bg-white/80 text-slate-600 border border-white/40 hover:bg-white transition-colors"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={handleOpenAdventure}
                    className="px-5 py-2 rounded-full text-sm font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    View Your Adventure
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleScrollToBottom}
                  className="absolute left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-md animate-bounce hover:bg-white transition"
                  aria-label="Scroll to bottom"
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-6 backdrop-blur-sm"
            onClick={handleCloseCategory}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{activeCategory.title}</h2>
                  <p className="text-sm text-slate-500">{activeCategory.subtitle}</p>
                </div>
                <button
                  onClick={handleCloseCategory}
                  className="h-9 w-9 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:text-slate-800 transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cards
                    .filter((card) => activeCategory.types.includes(card.type))
                    .map((card) => (
                      <IdentityCardTile
                        key={card.id}
                        card={card}
                        onClick={() => {
                          handleCardClick(card);
                          handleCloseCategory();
                        }}
                        compact
                      />
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adventure Modal */}
      <AnimatePresence>
        {adventureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-6 backdrop-blur-sm"
            onClick={handleCloseAdventure}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl backdrop-blur-lg"
            >
              <button
                onClick={handleCloseAdventure}
                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/70 border border-white/60 text-slate-600 hover:text-slate-800 transition"
                aria-label="Close"
              >
                ✕
              </button>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-5 pr-12">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Personal Statement Support</p>
                  <h2 className="text-2xl font-semibold text-slate-800">Your Growth Map</h2>
                  <p className="text-sm text-slate-500">
                    Mirae tracks strengths, interests, and growth over time to help you articulate your journey.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setAdventureView('archive')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                      adventureView === 'archive'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white/80 text-slate-600 border border-white/40 hover:bg-white'
                    }`}
                  >
                    Activity Archive
                  </button>
                  <button
                    onClick={() => setAdventureView('report')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                      adventureView === 'report'
                        ? 'bg-slate-800 text-white'
                        : 'bg-white/80 text-slate-600 border border-white/40 hover:bg-white'
                    }`}
                  >
                    Journey Report
                  </button>
                  
                  {/* Share Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
                      className="w-9 h-9 rounded-full bg-white/80 text-slate-600 border border-white/40 hover:bg-white transition flex items-center justify-center"
                      type="button"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    
                    {shareDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShareDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/40 bg-white shadow-lg z-50 overflow-hidden">
                          <button
                            onClick={() => {
                              handleDownloadStoryPdf();
                              setShareDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                            type="button"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Implement share link
                              console.log('Share link');
                              setShareDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-3"
                            type="button"
                          >
                            <Link className="w-4 h-4" />
                            Share link
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-[75vh] overflow-y-auto pr-2">
                {adventureView === 'archive' ? (
                  <ActivityCalendar logs={activityLogs} onAddLog={handleAddLog} />
                ) : (
                  <JourneyReportView
                    logs={activityLogs}
                    cards={cards.map((card) => ({
                      id: card.id,
                      type: card.type,
                      title: card.title,
                      description: card.description,
                      stage: card.stage,
                      unlocked: card.unlocked,
                    }))}
                    studentName={studentName}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            reflection={currentReflection}
            onReflectionChange={setCurrentReflection}
            onSave={handleSaveReflection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
