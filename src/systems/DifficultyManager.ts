import {
  BASE_SPEED,
  MAX_SPEED,
  SPEED_PER_DIFFICULTY,
  UNITS_PER_METRE,
} from '../config/GameConfig';

/**
 * Computes a smoothly rising difficulty value from the current level and the
 * distance travelled, and adapts slightly to the player's performance so that
 * skilled players get a gentle extra challenge without ever spiking unfairly.
 *
 * Difficulty is an abstract scalar (roughly 0..20+) consumed by the chunk
 * generator and the speed model.
 */
export class DifficultyManager {
  private baseDifficulty: number;
  private performanceBonus = 0;

  /** metres travelled since the run started, used for the ramp. */
  private metres = 0;

  constructor(startDifficulty = 0) {
    this.baseDifficulty = startDifficulty;
  }

  reset(startDifficulty = 0): void {
    this.baseDifficulty = startDifficulty;
    this.performanceBonus = 0;
    this.metres = 0;
  }

  /** Update with the total metres travelled so far this run. */
  setDistance(metres: number): void {
    this.metres = Math.max(0, metres);
  }

  /**
   * Adaptive difficulty: reward clean play, ease off after a hit.
   * `delta` is small and clamped so the curve never jumps.
   */
  registerPerformance(delta: number): void {
    this.performanceBonus = clamp(this.performanceBonus + delta, -1.5, 2.5);
  }

  /** Current difficulty scalar. Rises ~1 point every 300 m. */
  get difficulty(): number {
    const distanceRamp = this.metres / 300;
    return Math.max(0, this.baseDifficulty + distanceRamp + this.performanceBonus);
  }

  /** Current world speed (units/sec), capped so the game stays playable. */
  get speed(): number {
    return Math.min(MAX_SPEED, BASE_SPEED + this.difficulty * SPEED_PER_DIFFICULTY);
  }

  /** Speed expressed in on-screen metres per second (for HUD/tuning). */
  get speedMetresPerSecond(): number {
    return this.speed / UNITS_PER_METRE;
  }

  /**
   * Gap multiplier between chunks: higher difficulty packs obstacles closer,
   * but never below a floor that guarantees reaction time.
   */
  get spacingFactor(): number {
    return clamp(1.15 - this.difficulty * 0.03, 0.6, 1.15);
  }

  /** Probability [0..1] that a spawned chunk includes a power-up. */
  powerUpChance(luckLevel: number): number {
    // Base chance drops slightly as difficulty rises, upgrades push it back up.
    const base = clamp(0.28 - this.difficulty * 0.008, 0.08, 0.28);
    return clamp(base + luckLevel * 0.04, 0, 0.6);
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
