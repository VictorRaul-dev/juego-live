import { SCORE_PER_BONE, SCORE_PER_COIN, SCORE_PER_METRE } from '../config/GameConfig';

/**
 * Tracks the live score for a run.
 *
 * score = (distance*w_d + coins*w_c + bones*w_b + bonuses) * multiplier
 *
 * The multiplier is the product of the persistent base multiplier (from
 * upgrades) and any temporary power-up multiplier (e.g. double-score).
 */
export class ScoreManager {
  private distance = 0;
  private coins = 0;
  private bones = 0;
  private bonuses = 0;
  private baseMultiplier = 1;
  private tempMultiplier = 1;

  constructor(baseMultiplier = 1) {
    this.baseMultiplier = baseMultiplier;
  }

  reset(baseMultiplier = this.baseMultiplier): void {
    this.distance = 0;
    this.coins = 0;
    this.bones = 0;
    this.bonuses = 0;
    this.baseMultiplier = baseMultiplier;
    this.tempMultiplier = 1;
  }

  setDistance(metres: number): void {
    this.distance = Math.max(0, Math.floor(metres));
  }

  addCoin(count = 1): void {
    this.coins += count;
  }

  addBone(count = 1): void {
    this.bones += count;
  }

  addBonus(points: number): void {
    this.bonuses += points;
  }

  setTempMultiplier(mult: number): void {
    this.tempMultiplier = Math.max(1, mult);
  }

  get multiplier(): number {
    return this.baseMultiplier * this.tempMultiplier;
  }

  get coinCount(): number {
    return this.coins;
  }

  get boneCount(): number {
    return this.bones;
  }

  get distanceMetres(): number {
    return this.distance;
  }

  get score(): number {
    const raw =
      this.distance * SCORE_PER_METRE +
      this.coins * SCORE_PER_COIN +
      this.bones * SCORE_PER_BONE +
      this.bonuses;
    return Math.round(raw * this.multiplier);
  }
}
