export type Layer = "behind" | "front";

export type AccessoryId =
  | "HeadAntennaGlow"
  | "Backpack"
  | "StarPin"
  | "BookCharm"
  | "HorizonCape";

export type CardId =
  | "S_StrengthPattern_01"
  | "C_CuriosityThread_01"
  | "O_Options_01"
  | "P_ProofMoment_01"
  | "E_ThenVsNow_01";

export type AccessoryPosition = {
  // Percent-based positioning for easy scaling
  leftPct: number;  // 0–100
  topPct: number;   // 0–100
  widthPct: number; // 0–100
  rotateDeg?: number;
};

export type AccessoryAsset = {
  id: AccessoryId;
  name: string;
  layer: Layer;
  // Use SVG/PNG files from /public/assets/accessories/
  src: string;
  defaultPosition: AccessoryPosition;
  // Unlock rules:
  unlockedByCards: CardId[];
};

export type AvatarConfig = {
  selectedAccessories: AccessoryId[];
};

export type ProgressState = {
  collectedCards: CardId[]; // this comes from the card collection system
};
