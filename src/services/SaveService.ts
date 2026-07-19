import type { GameSave, SaveService as ISaveService, Settings } from '../core/types';
import { SAVE_KEY, SAVE_VERSION } from '../config/GameConfig';
import { DEFAULT_EQUIPPED, DEFAULT_OWNED } from '../data/shopItems';

export const DEFAULT_SETTINGS: Settings = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
  muted: false,
  quality: 'auto',
  vibration: true,
  reducedMotion: false,
  highContrast: false,
  language: 'es',
};

export function createDefaultSave(): GameSave {
  return {
    version: SAVE_VERSION,
    bestDistance: 0,
    bestScore: 0,
    coins: 0,
    bones: 0,
    keys: 0,
    unlockedLevels: [1],
    levelStars: {},
    levelBest: {},
    upgrades: {},
    ownedItems: [...DEFAULT_OWNED],
    equippedItems: { ...DEFAULT_EQUIPPED },
    missions: [],
    missionsDate: '',
    achievements: [],
    settings: { ...DEFAULT_SETTINGS },
    totals: {
      distance: 0,
      coins: 0,
      bones: 0,
      jumps: 0,
      slides: 0,
      laneChanges: 0,
      shieldsUsed: 0,
      hit: false,
    },
  };
}

/**
 * Minimal storage abstraction so the service can run in Node tests with an
 * in-memory map and in the browser with localStorage.
 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/**
 * localStorage-backed save service with validation and corruption recovery.
 * Deep-merges the loaded data over defaults so new fields are always present.
 */
export class LocalSaveService implements ISaveService {
  private storage: StorageLike;

  constructor(storage?: StorageLike) {
    if (storage) {
      this.storage = storage;
    } else if (typeof localStorage !== 'undefined') {
      this.storage = localStorage;
    } else {
      this.storage = new MemoryStorage();
    }
  }

  load(): GameSave {
    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) return createDefaultSave();
    try {
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch {
      // Corrupted data — start fresh rather than crash.
      return createDefaultSave();
    }
  }

  save(data: GameSave): void {
    try {
      this.storage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // Storage may be full or blocked (private mode); fail soft.
      console.warn('No se pudo guardar la partida:', e);
    }
  }

  reset(): void {
    this.storage.removeItem(SAVE_KEY);
  }

  exportSave(): string {
    return JSON.stringify(this.load());
  }

  importSave(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed !== 'object' || parsed === null) return false;
      const migrated = this.migrate(parsed);
      this.save(migrated);
      return true;
    } catch {
      return false;
    }
  }

  /** Merge unknown/old data over the current default shape and coerce types. */
  private migrate(input: unknown): GameSave {
    const base = createDefaultSave();
    if (typeof input !== 'object' || input === null) return base;
    const src = input as Partial<GameSave>;

    return {
      ...base,
      ...src,
      version: SAVE_VERSION,
      unlockedLevels:
        Array.isArray(src.unlockedLevels) && src.unlockedLevels.length > 0
          ? [...new Set(src.unlockedLevels.filter((n) => Number.isFinite(n)))]
          : base.unlockedLevels,
      levelStars: { ...base.levelStars, ...(src.levelStars ?? {}) },
      levelBest: { ...base.levelBest, ...(src.levelBest ?? {}) },
      upgrades: { ...base.upgrades, ...(src.upgrades ?? {}) },
      ownedItems: Array.isArray(src.ownedItems)
        ? [...new Set([...base.ownedItems, ...src.ownedItems])]
        : base.ownedItems,
      equippedItems: { ...base.equippedItems, ...(src.equippedItems ?? {}) },
      missions: Array.isArray(src.missions) ? src.missions : base.missions,
      achievements: Array.isArray(src.achievements) ? src.achievements : base.achievements,
      settings: { ...base.settings, ...(src.settings ?? {}) },
      totals: { ...base.totals, ...(src.totals ?? {}) },
      coins: numberOr(src.coins, 0),
      bones: numberOr(src.bones, 0),
      keys: numberOr(src.keys, 0),
      bestDistance: numberOr(src.bestDistance, 0),
      bestScore: numberOr(src.bestScore, 0),
    };
  }
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
