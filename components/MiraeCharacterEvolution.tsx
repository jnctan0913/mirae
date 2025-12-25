import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ============= Types =============
export type CardType =
  | 'StrengthPattern'
  | 'CuriosityThread'
  | 'Experience'
  | 'ProofMoment'
  | 'ThenVsNow'
  | 'ValueSignal';

export type CharacterState =
  | 'base'           // No cards collected
  | 'awakening'      // 1-2 cards
  | 'discovering'    // 3-4 cards
  | 'emerging'       // 5-7 cards
  | 'realized';      // 8+ cards

export type CharacterExpression =
  | 'neutral'
  | 'thoughtful'     // Strength/analytical cards
  | 'curious'        // Curiosity cards
  | 'confident'      // Proof/achievement cards
  | 'wise';          // Evolution/growth cards

// ============= Accessory Types =============
export type AccessoryType = 'hat' | 'cape' | 'accessory' | 'effect';

export interface Accessory {
  id: string;
  name: string;
  type: AccessoryType;
  description: string;
  unlockCondition: {
    type: 'cardCount' | 'stage' | 'achievement';
    value: number | string;
  };
  component: React.ReactNode;
}

export interface EquippedAccessories {
  hat?: string;
  cape?: string;
  accessory?: string;
  effect?: string;
}

// ============= Character State Logic =============
export const getCharacterState = (cardCount: number): CharacterState => {
  if (cardCount === 0) return 'base';
  if (cardCount <= 2) return 'awakening';
  if (cardCount <= 4) return 'discovering';
  if (cardCount <= 7) return 'emerging';
  return 'realized';
};

export const getCharacterExpression = (
  recentCards: CardType[]
): CharacterExpression => {
  if (recentCards.length === 0) return 'neutral';

  const recent = recentCards[recentCards.length - 1];

  switch (recent) {
    case 'StrengthPattern':
      return 'thoughtful';
    case 'CuriosityThread':
      return 'curious';
    case 'ProofMoment':
      return 'confident';
    case 'ThenVsNow':
    case 'ValueSignal':
      return 'wise';
    default:
      return 'neutral';
  }
};

// ============= Accessory Components =============

// Hats
const StarCrownSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
    <path d="M 100 20 L 105 35 L 120 35 L 108 45 L 113 60 L 100 50 L 87 60 L 92 45 L 80 35 L 95 35 Z" fill="#FFD675" stroke="#FFA500" strokeWidth="1.5" />
    <circle cx="100" cy="35" r="3" fill="#FFFBF0" />
  </svg>
);

const FlowerCrownSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
    <circle cx="85" cy="30" r="6" fill="#F4A9C8" opacity="0.9" />
    <circle cx="100" cy="25" r="6" fill="#FFD675" opacity="0.9" />
    <circle cx="115" cy="30" r="6" fill="#C7B9FF" opacity="0.9" />
    <circle cx="95" cy="27" r="4" fill="#BEEDE3" opacity="0.8" />
    <circle cx="105" cy="27" r="4" fill="#F5B7A8" opacity="0.8" />
  </svg>
);

const GlowHaloSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
    <circle cx="100" cy="35" r="25" stroke="#FFD675" strokeWidth="2" fill="none" opacity="0.6" className="animate-pulse" />
    <circle cx="100" cy="35" r="28" stroke="#FFA500" strokeWidth="1" fill="none" opacity="0.3" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
  </svg>
);

// Capes
const HeroCapeSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0" style={{ zIndex: -1 }}>
    <path d="M 70 80 Q 50 120 60 160 L 70 155 Q 65 120 75 85 Z" fill="url(#capeGrad1)" opacity="0.8" />
    <path d="M 130 80 Q 150 120 140 160 L 130 155 Q 135 120 125 85 Z" fill="url(#capeGrad1)" opacity="0.8" />
    <defs>
      <linearGradient id="capeGrad1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9DD5F5" />
        <stop offset="100%" stopColor="#5B9BD5" />
      </linearGradient>
    </defs>
  </svg>
);

const MagicCapeSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0" style={{ zIndex: -1 }}>
    <path d="M 70 80 Q 45 120 55 165 L 65 160 Q 60 120 75 85 Z" fill="url(#capeGrad2)" opacity="0.85" />
    <path d="M 130 80 Q 155 120 145 165 L 135 160 Q 140 120 125 85 Z" fill="url(#capeGrad2)" opacity="0.85" />
    {/* Sparkle effects on cape */}
    <circle cx="60" cy="120" r="2" fill="#FFD675" className="animate-pulse" />
    <circle cx="140" cy="125" r="2" fill="#C7B9FF" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
    <defs>
      <linearGradient id="capeGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#C7B9FF" />
        <stop offset="50%" stopColor="#F4A9C8" />
        <stop offset="100%" stopColor="#9DD5F5" />
      </linearGradient>
    </defs>
  </svg>
);

// Accessories
const BookAccessorySVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
    <rect x="120" y="110" width="18" height="24" rx="2" fill="#A8D5BA" stroke="#8DC9B8" strokeWidth="1" />
    <line x1="125" y1="115" x2="133" y2="115" stroke="#6BA895" strokeWidth="1" />
    <line x1="125" y1="120" x2="133" y2="120" stroke="#6BA895" strokeWidth="1" />
  </svg>
);

const ButterflyAccessorySVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
    <ellipse cx="75" cy="85" rx="8" ry="12" fill="#F4A9C8" opacity="0.8" transform="rotate(-20 75 85)" />
    <ellipse cx="65" cy="88" rx="6" ry="9" fill="#FFD675" opacity="0.7" transform="rotate(-20 65 88)" />
    <circle cx="70" cy="87" r="2" fill="#2D3748" />
    <line x1="70" y1="87" x2="68" y2="82" stroke="#2D3748" strokeWidth="0.5" />
    <line x1="70" y1="87" x2="72" y2="82" stroke="#2D3748" strokeWidth="0.5" />
  </svg>
);

// Effects
const SparkleEffectSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none">
    <g className="animate-pulse">
      <path d="M 140 70 L 143 73 L 140 76 L 137 73 Z" fill="#FFD675" />
      <path d="M 60 70 L 63 73 L 60 76 L 57 73 Z" fill="#9DD5F5" />
      <path d="M 100 145 L 102 147 L 100 149 L 98 147 Z" fill="#F4A9C8" />
    </g>
  </svg>
);

const RainbowAuraSVG = () => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 pointer-events-none">
    <circle cx="100" cy="100" r="80" fill="url(#rainbowAura)" opacity="0.3" className="animate-pulse" />
    <defs>
      <radialGradient id="rainbowAura">
        <stop offset="0%" stopColor="#FFD675" />
        <stop offset="25%" stopColor="#F4A9C8" />
        <stop offset="50%" stopColor="#C7B9FF" />
        <stop offset="75%" stopColor="#9DD5F5" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
  </svg>
);

// ============= Character Evolution Overlays =============

const MiraeBaseSVG = () => (
  <div className="relative w-full h-full">
    <Image
      src="/asset/Mirae_Icon1.png"
      alt="Mirae"
      fill
      className="object-contain"
      priority
    />
  </div>
);

const MiraeAwakeningSVG = () => (
  <div className="relative w-full h-full">
    <Image
      src="/asset/Mirae_Icon1.png"
      alt="Mirae"
      fill
      className="object-contain"
      priority
    />
    {/* Subtle glow aura overlay */}
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#9DD5F5]/20 via-[#9DD5F5]/10 to-transparent opacity-60 animate-pulse" />
    {/* Small sparkle */}
    <div className="absolute top-[35%] right-[15%] w-2 h-2 bg-[#FFD675]/60 rotate-45 animate-pulse" />
  </div>
);

const MiraeDiscoveringSVG = () => (
  <div className="relative w-full h-full">
    <Image
      src="/asset/Mirae_Icon1.png"
      alt="Mirae"
      fill
      className="object-contain"
      priority
    />
    {/* Multi-colored aura overlay */}
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#9DD5F5]/30 via-[#C7B9FF]/20 to-transparent opacity-70 animate-pulse" />
    {/* Multiple sparkles */}
    <div className="absolute top-[32%] right-[18%] w-2.5 h-2.5 bg-[#FFD675] rotate-45" />
    <div className="absolute top-[32%] left-[18%] w-2.5 h-2.5 bg-[#A8D5E8] rotate-45" />
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#F4A9C8]/70 rotate-45" />
  </div>
);

const MiraeEmergingSVG = () => (
  <div className="relative w-full h-full">
    <Image
      src="/asset/Mirae_Icon1.png"
      alt="Mirae"
      fill
      className="object-contain"
      priority
    />
    {/* Strong multi-layered aura overlay */}
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#9DD5F5]/40 via-[#C7B9FF]/25 via-[#F4A9C8]/15 to-transparent opacity-80 animate-pulse" />
    {/* Constellation of sparkles */}
    <div className="absolute top-[30%] right-[12%] w-3 h-3 bg-[#FFD675] rotate-45 animate-pulse" />
    <div className="absolute top-[30%] left-[12%] w-3 h-3 bg-[#A8D5E8] rotate-45 animate-pulse" />
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#F4A9C8] rotate-45" />
    <div className="absolute top-1/2 right-[8%] w-2 h-2 bg-[#C7B9FF]/80 rotate-45" />
    <div className="absolute top-1/2 left-[8%] w-2 h-2 bg-[#BEEDE3]/80 rotate-45" />
  </div>
);

const MiraeRealizedSVG = () => (
  <div className="relative w-full h-full">
    <Image
      src="/asset/Mirae_Icon1.png"
      alt="Mirae"
      fill
      className="object-contain"
      priority
    />
    {/* Radiant multi-layered aura overlay */}
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#9DD5F5]/50 via-[#C7B9FF]/30 to-transparent opacity-70 animate-pulse" />
    <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#F4A9C8]/30 via-[#FFD1A8]/15 to-transparent opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
    {/* Full constellation of sparkles */}
    <div className="absolute top-[27%] right-[10%] w-3.5 h-3.5 bg-[#FFD675] rotate-45" />
    <div className="absolute top-[27%] left-[10%] w-3.5 h-3.5 bg-[#A8D5E8] rotate-45" />
    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#F4A9C8] rotate-45 animate-pulse" />
    <div className="absolute top-1/2 right-[5%] w-2.5 h-2.5 bg-[#C7B9FF] rotate-45" />
    <div className="absolute top-1/2 left-[5%] w-2.5 h-2.5 bg-[#BEEDE3] rotate-45" />
    <div className="absolute bottom-[20%] right-[25%] w-2 h-2 bg-[#FFD675]/70 rotate-45" />
    <div className="absolute bottom-[20%] left-[25%] w-2 h-2 bg-[#9DD5F5]/70 rotate-45" />
    {/* Subtle halo ring */}
    <div className="absolute inset-0 rounded-full border border-gradient-to-r from-[#9DD5F5] via-[#C7B9FF] via-[#F4A9C8] to-[#FFD675] opacity-40" style={{ width: '100%', height: '100%' }} />
  </div>
);

// ============= Available Accessories =============
export const ACCESSORIES: Accessory[] = [
  // Hats
  {
    id: 'star-crown',
    name: 'Star Crown',
    type: 'hat',
    description: 'Shine bright like a star',
    unlockCondition: { type: 'cardCount', value: 1 },
    component: <StarCrownSVG />,
  },
  {
    id: 'flower-crown',
    name: 'Flower Crown',
    type: 'hat',
    description: 'Bloom with creativity',
    unlockCondition: { type: 'cardCount', value: 3 },
    component: <FlowerCrownSVG />,
  },
  {
    id: 'glow-halo',
    name: 'Glow Halo',
    type: 'hat',
    description: 'Radiate wisdom',
    unlockCondition: { type: 'cardCount', value: 5 },
    component: <GlowHaloSVG />,
  },
  // Capes
  {
    id: 'hero-cape',
    name: 'Hero Cape',
    type: 'cape',
    description: 'Ready for action',
    unlockCondition: { type: 'cardCount', value: 2 },
    component: <HeroCapeSVG />,
  },
  {
    id: 'magic-cape',
    name: 'Magic Cape',
    type: 'cape',
    description: 'Flows with possibility',
    unlockCondition: { type: 'cardCount', value: 4 },
    component: <MagicCapeSVG />,
  },
  // Accessories
  {
    id: 'book',
    name: 'Knowledge Book',
    type: 'accessory',
    description: 'Always learning',
    unlockCondition: { type: 'stage', value: 'O' },
    component: <BookAccessorySVG />,
  },
  {
    id: 'butterfly',
    name: 'Butterfly Friend',
    type: 'accessory',
    description: 'Transformation companion',
    unlockCondition: { type: 'stage', value: 'E' },
    component: <ButterflyAccessorySVG />,
  },
  // Effects
  {
    id: 'sparkles',
    name: 'Sparkle Effect',
    type: 'effect',
    description: 'Extra magical vibes',
    unlockCondition: { type: 'cardCount', value: 6 },
    component: <SparkleEffectSVG />,
  },
  {
    id: 'rainbow-aura',
    name: 'Rainbow Aura',
    type: 'effect',
    description: 'Full spectrum energy',
    unlockCondition: { type: 'cardCount', value: 8 },
    component: <RainbowAuraSVG />,
  },
];

// ============= Accessory Helper Functions =============
export const isAccessoryUnlocked = (
  accessory: Accessory,
  cardCount: number,
  completedStages: string[]
): boolean => {
  if (accessory.unlockCondition.type === 'cardCount') {
    return cardCount >= (accessory.unlockCondition.value as number);
  }
  if (accessory.unlockCondition.type === 'stage') {
    return completedStages.includes(accessory.unlockCondition.value as string);
  }
  return false;
};

export const getAccessoryById = (id: string): Accessory | undefined => {
  return ACCESSORIES.find((acc) => acc.id === id);
};

// ============= Main Component =============
interface MiraeCharacterProps {
  cardCount: number;
  recentCardTypes?: CardType[];
  size?: number;
  className?: string;
  equippedAccessories?: EquippedAccessories;
}

export const MiraeCharacter: React.FC<MiraeCharacterProps> = ({
  cardCount,
  recentCardTypes = [],
  size = 240,
  className = '',
  equippedAccessories = {},
}) => {
  const state = getCharacterState(cardCount);
  const expression = getCharacterExpression(recentCardTypes);

  // Debug logging
  console.log('MiraeCharacter render:', { equippedAccessories, cardCount, state });

  const characterMap: Record<CharacterState, React.ReactNode> = {
    base: <MiraeBaseSVG />,
    awakening: <MiraeAwakeningSVG />,
    discovering: <MiraeDiscoveringSVG />,
    emerging: <MiraeEmergingSVG />,
    realized: <MiraeRealizedSVG />,
  };

  // Get equipped accessory components
  const capeComponent = equippedAccessories.cape ? getAccessoryById(equippedAccessories.cape)?.component : null;
  const hatComponent = equippedAccessories.hat ? getAccessoryById(equippedAccessories.hat)?.component : null;
  const accessoryComponent = equippedAccessories.accessory ? getAccessoryById(equippedAccessories.accessory)?.component : null;
  const effectComponent = equippedAccessories.effect ? getAccessoryById(equippedAccessories.effect)?.component : null;

  console.log('Accessory components:', {
    cape: capeComponent ? 'yes' : 'no',
    hat: hatComponent ? 'yes' : 'no',
    accessory: accessoryComponent ? 'yes' : 'no',
    effect: effectComponent ? 'yes' : 'no',
  });

  return (
    <motion.div
      key={`${state}-${JSON.stringify(equippedAccessories)}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Cape (renders behind character) */}
      {capeComponent}
      
      {/* Main character */}
      {characterMap[state]}
      
      {/* Hat (renders on top) */}
      {hatComponent}
      
      {/* Accessory (renders on top) */}
      {accessoryComponent}
      
      {/* Effect (renders on top, no pointer events) */}
      {effectComponent}
    </motion.div>
  );
};

// ============= Helper: Get evolution message =============
export const getEvolutionMessage = (state: CharacterState): string => {
  const messages: Record<CharacterState, string> = {
    base: "Your journey begins...",
    awakening: "Mirae is awakening to your story",
    discovering: "Discovering the patterns of who you are",
    emerging: "Your identity is taking shape",
    realized: "A clear sense of self emerges",
  };
  return messages[state];
};
