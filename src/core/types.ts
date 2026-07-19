/**
 * Shared type definitions for VACA - Aventura Sin Límites.
 * Kept free of Phaser imports so gameplay logic can be unit-tested in Node.
 */

/** The three actions a player can take to avoid an obstacle. */
export type PlayerAction = 'lane-left' | 'lane-right' | 'jump' | 'slide';

/** Categories of obstacles and which action clears them. */
export type ObstacleType =
  | 'cone'
  | 'box'
  | 'barrier-low' // slide under
  | 'barrier-high' // jump over
  | 'fence'
  | 'hole'
  | 'puddle'
  | 'car'
  | 'taxi'
  | 'bus'
  | 'truck'
  | 'sign'
  | 'construction';

export type CollectibleType = 'coin' | 'bone' | 'key';

export type PowerUpType =
  | 'shield'
  | 'magnet'
  | 'double-score'
  | 'super-jump'
  | 'turbo'
  | 'slow-motion';

/** How an obstacle can be avoided — drives the procedural safety validator. */
export interface ObstacleSpec {
  type: ObstacleType;
  lane: number; // 0, 1, 2
  /** Actions that let the player pass this obstacle safely. */
  avoidWith: PlayerAction[];
  /** Relative width in lanes (1 = single lane). */
  laneSpan?: number;
}

export interface CollectibleSpec {
  type: CollectibleType;
  lane: number;
  /** Vertical offset within the chunk, 0..1 (0 = far, 1 = near player). */
  offset: number;
  /** True when the coin sits at jump height (encourages jumping). */
  elevated?: boolean;
}

export interface PowerUpSpec {
  type: PowerUpType;
  lane: number;
  offset: number;
}

/** A pre-authored, validated slice of track that is combined procedurally. */
export interface TrackChunk {
  id: string;
  minimumDifficulty: number;
  maximumDifficulty: number;
  /** Length in world units (metres of track). */
  length: number;
  obstacles: ObstacleSpec[];
  collectibles: CollectibleSpec[];
  powerUps?: PowerUpSpec[];
  /** At least one lane that is always passable straight through. */
  safeLane: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'scooter' | 'wheels' | 'lights' | 'sticker' | 'collar' | 'hat' | 'glasses' | 'trail';
  currency: 'coins' | 'bones';
  price: number;
  /** Hex tint applied to the equipped preview (placeholder styling). */
  tint?: number;
  description: string;
}

export interface LevelDef {
  id: number;
  name: string;
  scenario: string;
  targetDistance: number;
  /** Base difficulty the level starts at. */
  difficulty: number;
  reward: number;
  objectives: string[];
}

export type MissionMetric =
  | 'distance'
  | 'coins'
  | 'bones'
  | 'jumps'
  | 'slides'
  | 'laneChanges'
  | 'shieldsUsed'
  | 'runsNoHit';

export interface MissionDef {
  id: string;
  description: string;
  metric: MissionMetric;
  target: number;
  reward: number;
}

export interface MissionProgress {
  id: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

/** Aggregated stats produced by a single run, fed to the mission system. */
export interface RunStats {
  distance: number;
  coins: number;
  bones: number;
  jumps: number;
  slides: number;
  laneChanges: number;
  shieldsUsed: number;
  hit: boolean;
}

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  quality: 'auto' | 'low' | 'medium' | 'high';
  vibration: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  language: 'es' | 'en';
}

export interface GameSave {
  version: number;
  bestDistance: number;
  bestScore: number;
  coins: number;
  bones: number;
  keys: number;
  unlockedLevels: number[];
  levelStars: Record<number, number>;
  levelBest: Record<number, number>;
  upgrades: Record<string, number>;
  ownedItems: string[];
  equippedItems: Partial<Record<ShopItem['category'], string>>;
  missions: MissionProgress[];
  missionsDate: string;
  achievements: string[];
  settings: Settings;
  totals: RunStats;
}

export interface SaveService {
  load(): GameSave;
  save(data: GameSave): void;
  reset(): void;
  exportSave(): string;
  importSave(data: string): boolean;
}
