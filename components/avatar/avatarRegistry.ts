import type { AccessoryAsset, AccessoryId, CardId, ProgressState } from './avatarTypes';

export const ACCESSORIES: AccessoryAsset[] = [
  {
    id: 'HeadAntennaGlow',
    name: 'Antenna Glow',
    layer: 'front',
    src: '/asset/accessories/HeadAntennaGlow.svg',
    defaultPosition: {
      leftPct: 35,
      topPct: 5,
      widthPct: 20,
      rotateDeg: 0,
    },
    unlockedByCards: ['S_StrengthPattern_01', 'C_CuriosityThread_01'],
  },
  {
    id: 'Backpack',
    name: 'Backpack',
    layer: 'behind',
    src: '/asset/accessories/Backpack.svg',
    defaultPosition: {
      leftPct: 55,
      topPct: 35,
      widthPct: 35,
      rotateDeg: 10,
    },
    unlockedByCards: ['P_ProofMoment_01'],
  },
  {
    id: 'StarPin',
    name: 'Star Pin',
    layer: 'front',
    src: '/asset/accessories/StarPin.svg',
    defaultPosition: {
      leftPct: 20,
      topPct: 40,
      widthPct: 15,
      rotateDeg: -15,
    },
    unlockedByCards: ['S_StrengthPattern_01'],
  },
  {
    id: 'BookCharm',
    name: 'Book Charm',
    layer: 'front',
    src: '/asset/accessories/BookCharm.svg',
    defaultPosition: {
      leftPct: 65,
      topPct: 60,
      widthPct: 18,
      rotateDeg: 10,
    },
    unlockedByCards: ['C_CuriosityThread_01', 'O_Options_01'],
  },
  {
    id: 'HorizonCape',
    name: 'Horizon Cape',
    layer: 'behind',
    src: '/asset/accessories/HorizonCape.svg',
    defaultPosition: {
      leftPct: 15,
      topPct: 30,
      widthPct: 70,
      rotateDeg: 0,
    },
    unlockedByCards: ['E_ThenVsNow_01'],
  },
];

// Helper: Create a map for quick lookup
const ACCESSORY_MAP = new Map<AccessoryId, AccessoryAsset>(
  ACCESSORIES.map(acc => [acc.id, acc])
);

export function getAccessoryById(id: AccessoryId): AccessoryAsset | undefined {
  return ACCESSORY_MAP.get(id);
}

export function getUnlockedAccessories(progress: ProgressState): Set<AccessoryId> {
  const unlocked = new Set<AccessoryId>();
  const collectedSet = new Set(progress.collectedCards);

  for (const accessory of ACCESSORIES) {
    // Unlocked if ANY of its required cards are collected
    const isUnlocked = accessory.unlockedByCards.some(cardId =>
      collectedSet.has(cardId)
    );
    if (isUnlocked) {
      unlocked.add(accessory.id);
    }
  }

  return unlocked;
}

export function isAccessoryUnlocked(
  id: AccessoryId,
  progress: ProgressState
): boolean {
  const accessory = getAccessoryById(id);
  if (!accessory) return false;

  const collectedSet = new Set(progress.collectedCards);
  return accessory.unlockedByCards.some(cardId => collectedSet.has(cardId));
}

// Helper: Get accessories by layer
export function getAccessoriesByLayer(layer: 'behind' | 'front'): AccessoryAsset[] {
  return ACCESSORIES.filter(acc => acc.layer === layer);
}

// Auto-style preset logic
export function getAutoStylePreset(progress: ProgressState): AccessoryId[] {
  const collectedSet = new Set(progress.collectedCards);
  const unlocked = getUnlockedAccessories(progress);
  const selected: AccessoryId[] = [];

  // If has C_CuriosityThread_01 → include BookCharm + HeadAntennaGlow
  if (collectedSet.has('C_CuriosityThread_01')) {
    if (unlocked.has('BookCharm')) selected.push('BookCharm');
    if (unlocked.has('HeadAntennaGlow')) selected.push('HeadAntennaGlow');
  }

  // If has P_ProofMoment_01 → include Backpack
  if (collectedSet.has('P_ProofMoment_01')) {
    if (unlocked.has('Backpack')) selected.push('Backpack');
  }

  // If has E_ThenVsNow_01 → include HorizonCape
  if (collectedSet.has('E_ThenVsNow_01')) {
    if (unlocked.has('HorizonCape')) selected.push('HorizonCape');
  }

  // StarPin is always optional (only include if StrengthPattern unlocked and not already selected)
  if (collectedSet.has('S_StrengthPattern_01') && unlocked.has('StarPin')) {
    if (!selected.includes('StarPin')) {
      selected.push('StarPin');
    }
  }

  return selected;
}
