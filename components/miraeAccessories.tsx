import React from 'react';

// ============= Types =============
export type AccessoryId =
  | 'HeadAntennaGlow'
  | 'Backpack'
  | 'StarPin'
  | 'BookCharm'
  | 'HorizonCape';

export type AccessoryPosition = {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
};

export type AccessoryMeta = {
  id: AccessoryId;
  name: string;
  layer: 'behind' | 'front';
  defaultPosition: AccessoryPosition;
};

// ============= Accessory Metadata =============
export const ACCESSORIES: Record<AccessoryId, AccessoryMeta> = {
  HeadAntennaGlow: {
    id: 'HeadAntennaGlow',
    name: 'Antenna Glow',
    layer: 'front',
    defaultPosition: { x: 50, y: 10, scale: 0.35, rotate: 0 },
  },
  Backpack: {
    id: 'Backpack',
    name: 'Backpack',
    layer: 'behind',
    defaultPosition: { x: 65, y: 50, scale: 0.45, rotate: 15 },
  },
  StarPin: {
    id: 'StarPin',
    name: 'Star Pin',
    layer: 'front',
    defaultPosition: { x: 30, y: 45, scale: 0.25, rotate: -15 },
  },
  BookCharm: {
    id: 'BookCharm',
    name: 'Book Charm',
    layer: 'front',
    defaultPosition: { x: 70, y: 70, scale: 0.3, rotate: 10 },
  },
  HorizonCape: {
    id: 'HorizonCape',
    name: 'Horizon Cape',
    layer: 'behind',
    defaultPosition: { x: 50, y: 55, scale: 0.6, rotate: 0 },
  },
};

// ============= SVG Components =============

const HeadAntennaGlowSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Antenna stick */}
    <path
      d="M48 75 L48 25"
      stroke="#9DD5F5"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Glow orb */}
    <circle cx="48" cy="20" r="12" fill="url(#antennaGlow)" />
    {/* Inner highlight */}
    <circle cx="51" cy="17" r="4" fill="white" opacity="0.6" />
    {/* Sparkle */}
    <path
      d="M62 15 L64 17 L62 19 L60 17 Z"
      fill="#FFD675"
    />
    <defs>
      <radialGradient id="antennaGlow">
        <stop offset="0%" stopColor="#FFE5A8" />
        <stop offset="100%" stopColor="#FFD675" />
      </radialGradient>
    </defs>
  </svg>
);

const BackpackSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Main backpack body */}
    <rect
      x="30"
      y="35"
      width="40"
      height="50"
      rx="8"
      fill="url(#backpackGrad)"
    />
    {/* Top flap */}
    <rect
      x="32"
      y="30"
      width="36"
      height="8"
      rx="4"
      fill="#8DC9B8"
    />
    {/* Pocket */}
    <rect
      x="38"
      y="45"
      width="24"
      height="20"
      rx="4"
      fill="#A8D5BA"
      opacity="0.4"
    />
    {/* Straps */}
    <path
      d="M40 35 Q35 30 35 25"
      stroke="#7EBCA8"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M60 35 Q65 30 65 25"
      stroke="#7EBCA8"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
    <defs>
      <linearGradient id="backpackGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A8D5BA" />
        <stop offset="100%" stopColor="#8DC9B8" />
      </linearGradient>
    </defs>
  </svg>
);

const StarPinSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Star shape */}
    <path
      d="M50 25 L57 45 L78 48 L62 62 L66 83 L50 72 L34 83 L38 62 L22 48 L43 45 Z"
      fill="url(#starGrad)"
    />
    {/* Inner highlight */}
    <path
      d="M50 30 L54 42 L66 44 L56 53 L58 65 L50 59 L42 65 L44 53 L34 44 L46 42 Z"
      fill="white"
      opacity="0.3"
    />
    {/* Pin needle */}
    <circle cx="50" cy="50" r="4" fill="#E8D068" />
    <defs>
      <radialGradient id="starGrad">
        <stop offset="0%" stopColor="#FFE5A8" />
        <stop offset="100%" stopColor="#F4D675" />
      </radialGradient>
    </defs>
  </svg>
);

const BookCharmSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Book cover */}
    <rect
      x="30"
      y="35"
      width="35"
      height="45"
      rx="3"
      fill="url(#bookGrad)"
    />
    {/* Pages edge */}
    <rect
      x="62"
      y="37"
      width="3"
      height="41"
      fill="white"
      opacity="0.8"
    />
    {/* Bookmark */}
    <path
      d="M45 35 L45 50 L48 47 L51 50 L51 35 Z"
      fill="#FFD675"
    />
    {/* Book spine line */}
    <line
      x1="33"
      y1="38"
      x2="33"
      y2="77"
      stroke="#D68A78"
      strokeWidth="1.5"
    />
    {/* Title lines */}
    <rect x="38" y="45" width="18" height="2" rx="1" fill="white" opacity="0.4" />
    <rect x="38" y="52" width="15" height="2" rx="1" fill="white" opacity="0.4" />
    <defs>
      <linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F5B7A8" />
        <stop offset="100%" stopColor="#F2A896" />
      </linearGradient>
    </defs>
  </svg>
);

const HorizonCapeSVG = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Cape flowing shape */}
    <path
      d="M30 20 Q25 45 20 70 L40 75 Q50 60 60 75 L80 70 Q75 45 70 20 Q65 25 60 28 Q55 22 50 20 Q45 22 40 28 Q35 25 30 20 Z"
      fill="url(#capeGrad)"
    />
    {/* Highlight on left side */}
    <path
      d="M32 25 Q28 48 24 68 L38 72 Q45 60 50 65"
      fill="white"
      opacity="0.15"
    />
    {/* Collar/attachment */}
    <ellipse cx="50" cy="22" rx="22" ry="5" fill="#9A8BC2" />
    <defs>
      <linearGradient id="capeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B19CD9" />
        <stop offset="50%" stopColor="#A78BCA" />
        <stop offset="100%" stopColor="#9A7AB8" />
      </linearGradient>
    </defs>
  </svg>
);

// ============= Main Component =============
interface AccessorySVGProps {
  accessoryId: AccessoryId;
  className?: string;
}

export const AccessorySVG: React.FC<AccessorySVGProps> = ({ accessoryId, className = '' }) => {
  const svgMap: Record<AccessoryId, React.ReactNode> = {
    HeadAntennaGlow: <HeadAntennaGlowSVG />,
    Backpack: <BackpackSVG />,
    StarPin: <StarPinSVG />,
    BookCharm: <BookCharmSVG />,
    HorizonCape: <HorizonCapeSVG />,
  };

  return <div className={className}>{svgMap[accessoryId]}</div>;
};

// ============= Helper: Get accessories by layer =============
export const getAccessoriesByLayer = (
  selectedIds: AccessoryId[],
  layer: 'behind' | 'front'
): AccessoryId[] => {
  return selectedIds.filter((id) => ACCESSORIES[id].layer === layer);
};
