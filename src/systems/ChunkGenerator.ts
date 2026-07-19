import type { PowerUpSpec, PowerUpType, TrackChunk } from '../core/types';
import { CHUNK_LIBRARY } from '../data/chunks';
import { LANE_COUNT } from '../config/GameConfig';

/** A minimal RNG interface so tests can inject a deterministic generator. */
export type Rng = () => number;

const POWERUP_TYPES: PowerUpType[] = [
  'shield',
  'magnet',
  'double-score',
  'super-jump',
  'turbo',
  'slow-motion',
];

/**
 * Selects and validates track chunks procedurally. Chunks come from a
 * hand-authored library; this class picks ones that fit the current difficulty
 * and runs a safety validator so an impossible section is never emitted.
 */
export class ChunkGenerator {
  private rng: Rng;
  private lastChunkId = '';

  constructor(rng: Rng = Math.random) {
    this.rng = rng;
  }

  reset(): void {
    this.lastChunkId = '';
  }

  /** All chunks eligible at the given difficulty and that pass validation. */
  eligibleChunks(difficulty: number): TrackChunk[] {
    return CHUNK_LIBRARY.filter(
      (c) =>
        difficulty >= c.minimumDifficulty &&
        difficulty <= c.maximumDifficulty &&
        this.isChunkSafe(c),
    );
  }

  /**
   * Pick the next chunk for the given difficulty. Avoids repeating the same
   * chunk twice in a row when alternatives exist, and optionally injects a
   * power-up according to the supplied chance.
   */
  next(difficulty: number, powerUpChance: number): TrackChunk {
    let pool = this.eligibleChunks(difficulty);
    if (pool.length === 0) {
      // Fall back to the easiest safe chunk so we always return something valid.
      pool = CHUNK_LIBRARY.filter((c) => this.isChunkSafe(c));
    }
    const varied = pool.length > 1 ? pool.filter((c) => c.id !== this.lastChunkId) : pool;
    const source = varied.length > 0 ? varied : pool;

    const chosen = source[Math.floor(this.rng() * source.length)];
    this.lastChunkId = chosen.id;

    // Clone so callers can mutate freely (offsets, injected power-ups).
    const chunk: TrackChunk = {
      ...chosen,
      obstacles: chosen.obstacles.map((o) => ({ ...o })),
      collectibles: chosen.collectibles.map((c) => ({ ...c })),
      powerUps: chosen.powerUps ? chosen.powerUps.map((p) => ({ ...p })) : [],
    };

    if ((!chunk.powerUps || chunk.powerUps.length === 0) && this.rng() < powerUpChance) {
      chunk.powerUps = [this.randomPowerUp(chunk.safeLane)];
    }

    return chunk;
  }

  private randomPowerUp(safeLane: number): PowerUpSpec {
    const type = POWERUP_TYPES[Math.floor(this.rng() * POWERUP_TYPES.length)];
    return { type, lane: safeLane, offset: 0.5 };
  }

  /**
   * Safety validator: rejects chunks that could be impossible to clear.
   * Rules enforced:
   *  - there must be at least one lane with no blocking obstacle;
   *  - no two obstacles fully overlap in the same lane;
   *  - a low barrier (slide) and a high barrier (jump) must not force
   *    conflicting simultaneous actions in every lane;
   *  - all lane indices are within range.
   */
  isChunkSafe(chunk: TrackChunk): boolean {
    if (chunk.safeLane < 0 || chunk.safeLane >= LANE_COUNT) return false;

    // Lane occupancy check: at least one lane must be clear OR clearable.
    const laneBlocked = new Array(LANE_COUNT).fill(false);
    for (const o of chunk.obstacles) {
      if (o.lane < 0 || o.lane >= LANE_COUNT) return false;
      if (o.avoidWith.length === 0) return false; // unavoidable
      // An obstacle that can only be avoided by leaving the lane blocks it.
      const stayable = o.avoidWith.includes('jump') || o.avoidWith.includes('slide');
      if (!stayable) laneBlocked[o.lane] = true;
    }
    const hasOpenLane = laneBlocked.some((b) => !b);
    if (!hasOpenLane) return false;

    // The declared safe lane must not require an action that conflicts.
    const safeLaneObstacles = chunk.obstacles.filter((o) => o.lane === chunk.safeLane);
    const needsJump = safeLaneObstacles.some(
      (o) => o.avoidWith.length === 1 && o.avoidWith[0] === 'jump',
    );
    const needsSlide = safeLaneObstacles.some(
      (o) => o.avoidWith.length === 1 && o.avoidWith[0] === 'slide',
    );
    if (needsJump && needsSlide) return false;

    return true;
  }
}
