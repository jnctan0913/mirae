'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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

  return (
    <>
      <div className="sticky top-6">
        <div className="rounded-3xl border border-white/40 bg-white/85 p-6 shadow-lg backdrop-blur-lg relative">
          {/* Pencil Icon Button - Top Right */}
          <button
            onClick={() => setShowCustomizer(true)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gradient-to-r from-[#9DD5F5] to-[#C7B9FF] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 z-10"
            title="Customize Mirae"
          >
            <Pencil className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Identity</h3>

          <div className="relative w-full aspect-[4/3] max-h-[280px] mb-4 rounded-2xl bg-gradient-to-br from-sky-50 via-violet-50 to-rose-50 flex items-center justify-center overflow-hidden">
            <MiraeCharacter
              cardCount={cardCount}
              recentCardTypes={recentCardTypes}
              size={220}
              equippedAccessories={equippedAccessories}
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
}

const StatementView = ({ cards }: StatementViewProps) => {
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/40 bg-white/85 p-6 backdrop-blur-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">
          What I'm drawn to
        </h3>
        {drawnTo.length > 0 ? (
          <ul className="space-y-2 mb-3">
            {drawnTo.map((card) => (
              <li key={card.id} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>{card.title}: {card.description}</span>
              </li>
            ))}
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
            {done.map((card) => (
              <li key={card.id} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>{card.title}: {card.description}</span>
              </li>
            ))}
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
            {changed.map((card) => (
              <li key={card.id} className="text-sm text-slate-600 flex items-start gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>{card.title}: {card.description}</span>
              </li>
            ))}
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
  const [cards] = useState<IdentityCard[]>(SEED_CARDS);
  const [viewMode, setViewMode] = useState<'collection' | 'statement'>('collection');
  const [selectedCard, setSelectedCard] = useState<IdentityCard | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [currentReflection, setCurrentReflection] = useState('');
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});

  // Load from localStorage
  useEffect(() => {
    const savedReflections = localStorage.getItem('miraePlus_reflections');
    const savedViewMode = localStorage.getItem('miraePlus_viewMode');
    const savedAccessories = localStorage.getItem('miraePlus_accessories');

    if (savedReflections) setReflections(JSON.parse(savedReflections));
    if (savedViewMode) setViewMode(savedViewMode as 'collection' | 'statement');
    if (savedAccessories) setEquippedAccessories(JSON.parse(savedAccessories));
  }, []);

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

  const handleAccessoryChange = (newAccessories: EquippedAccessories) => {
    setEquippedAccessories(newAccessories);
    localStorage.setItem('miraePlus_accessories', JSON.stringify(newAccessories));
  };

  const unlockedCards = cards.filter((c) => c.unlocked);
  const allTags = Array.from(new Set(unlockedCards.flatMap((c) => c.tags)));
  const recentCardTypes = unlockedCards.slice(-3).map((c) => c.type);
  const completedStages = Array.from(new Set(unlockedCards.map((c) => c.stage)));
  const collectionSections = [
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 h-full">
          {/* Left Column */}
          <div className="space-y-6 h-full">
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
          <div className="space-y-6 h-full flex flex-col">
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

            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
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
                                {sectionCards.map((card) => (
                                  <IdentityCardTile
                                    key={card.id}
                                    card={card}
                                    onClick={() => handleCardClick(card)}
                                    compact
                                  />
                                ))}
                              </div>
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
                                {sectionCards.map((card) => (
                                  <IdentityCardTile
                                    key={card.id}
                                    card={card}
                                    onClick={() => handleCardClick(card)}
                                    compact
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <StatementView cards={cards} />
              )}
            </div>

            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2 rounded-full text-sm font-medium bg-white/80 text-slate-600 border border-white/40 hover:bg-white transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

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
