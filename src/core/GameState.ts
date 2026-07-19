import type { GameSave } from './types';
import { LocalSaveService } from '../services/SaveService';
import { MissionManager } from '../systems/MissionManager';
import { LEVELS } from '../data/levels';

/**
 * Central, app-wide state. Wraps the persistent save and exposes helpers for
 * currency, level unlocking and equipment. A single instance is shared across
 * all Phaser scenes via the game registry.
 */
export class GameState {
  readonly saveService = new LocalSaveService();
  save: GameSave;

  /** The level the player selected to play (1..10). */
  currentLevel = 1;

  constructor() {
    this.save = this.saveService.load();
    MissionManager.ensureDaily(this.save);
    this.persist();
  }

  persist(): void {
    this.saveService.save(this.save);
  }

  // ---- Currency -----------------------------------------------------------
  addCoins(n: number): void {
    this.save.coins = Math.max(0, this.save.coins + n);
  }

  addBones(n: number): void {
    this.save.bones = Math.max(0, this.save.bones + n);
  }

  spendCoins(n: number): boolean {
    if (this.save.coins < n) return false;
    this.save.coins -= n;
    return true;
  }

  spendBones(n: number): boolean {
    if (this.save.bones < n) return false;
    this.save.bones -= n;
    return true;
  }

  // ---- Levels -------------------------------------------------------------
  isLevelUnlocked(id: number): boolean {
    return this.save.unlockedLevels.includes(id);
  }

  unlockLevel(id: number): void {
    if (id <= LEVELS.length && !this.save.unlockedLevels.includes(id)) {
      this.save.unlockedLevels.push(id);
    }
  }

  /** Record a run against a level, unlock the next one and store stars/best. */
  recordLevelResult(levelId: number, distance: number, stars: number): void {
    const prevBest = this.save.levelBest[levelId] ?? 0;
    if (distance > prevBest) this.save.levelBest[levelId] = Math.floor(distance);
    const prevStars = this.save.levelStars[levelId] ?? 0;
    if (stars > prevStars) this.save.levelStars[levelId] = stars;
    if (stars >= 1) this.unlockLevel(levelId + 1);
  }

  // ---- Upgrades -----------------------------------------------------------
  upgradeLevel(id: string): number {
    return this.save.upgrades[id] ?? 0;
  }

  /** Base score multiplier derived from the multiplier upgrade. */
  get baseMultiplier(): number {
    return 1 + this.upgradeLevel('multiplier') * 0.15;
  }

  // ---- Shop / equipment ---------------------------------------------------
  owns(itemId: string): boolean {
    return this.save.ownedItems.includes(itemId);
  }

  equip(category: keyof GameSave['equippedItems'], itemId: string): void {
    this.save.equippedItems[category] = itemId;
  }
}
