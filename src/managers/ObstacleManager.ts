import Phaser from 'phaser';
import type { ObstacleSpec, ObstacleType, PlayerAction } from '../core/types';
import { GAME_HEIGHT } from '../config/GameConfig';
import { ImagePool } from '../utils/Pool';
import { aboveHorizon, depthScale, laneXAt } from '../utils/Perspective';

/** Vehicles are big and move; they can only be avoided by switching lanes. */
const MOVING_TYPES: ObstacleType[] = ['car', 'taxi', 'bus', 'truck'];
/** Small obstacles a turbo can plough through. */
const MINOR_TYPES: ObstacleType[] = ['cone', 'box', 'sign', 'puddle'];

export interface ActiveObstacle {
  image: Phaser.GameObjects.Image;
  type: ObstacleType;
  lane: number;
  avoidWith: PlayerAction[];
  minor: boolean;
  driftSpeed: number; // extra downward speed for moving vehicles
  baseScale: number; // size variance before perspective scaling
}

/**
 * Spawns, moves, pools and recycles obstacle sprites. Keeps obstacle handling
 * out of the GameScene and provides the data needed for collision resolution.
 */
export class ObstacleManager {
  private pool: ImagePool;
  private active: ActiveObstacle[] = [];

  constructor(scene: Phaser.Scene) {
    this.pool = new ImagePool(scene);
  }

  spawn(spec: ObstacleSpec, y: number, difficulty: number): void {
    const img = this.pool.obtain(`ob-${spec.type}`, laneXAt(spec.lane, y), y);
    const moving = MOVING_TYPES.includes(spec.type);
    // Normalise any source resolution to a consistent on-screen width so real
    // (large) PNGs and procedural placeholders render at the same size.
    const targetW = moving ? 220 : 150;
    const norm = targetW / (img.width || targetW);
    const baseScale = norm * Phaser.Math.FloatBetween(0.92, 1.12);
    img.setOrigin(0.5, 1).setScale(depthScale(y, baseScale)).setVisible(!aboveHorizon(y));
    this.active.push({
      image: img,
      type: spec.type,
      lane: spec.lane,
      avoidWith: spec.avoidWith,
      minor: MINOR_TYPES.includes(spec.type),
      // Slower vehicles at low difficulty; they creep toward the player.
      driftSpeed: moving ? Math.min(120, 30 + difficulty * 6) : 0,
      baseScale,
    });
  }

  update(dy: number): void {
    for (const o of this.active) {
      o.image.y += dy + o.driftSpeed * (dy / 560);
      // Apply perspective: converge toward centre and scale with depth.
      o.image.x = laneXAt(o.lane, o.image.y);
      o.image.setScale(depthScale(o.image.y, o.baseScale));
      o.image.setVisible(!aboveHorizon(o.image.y));
      o.image.setDepth(Math.floor(o.image.y)); // nearer obstacles draw on top
    }
    // Recycle anything below the screen.
    this.active = this.active.filter((o) => {
      if (o.image.y > GAME_HEIGHT + 160) {
        this.pool.release(o.image);
        return false;
      }
      return true;
    });
  }

  /** Remove one obstacle immediately (e.g. after a hit or turbo plough-through). */
  remove(o: ActiveObstacle): void {
    const idx = this.active.indexOf(o);
    if (idx >= 0) {
      this.pool.release(o.image);
      this.active.splice(idx, 1);
    }
  }

  get list(): ActiveObstacle[] {
    return this.active;
  }

  clear(): void {
    for (const o of this.active) this.pool.release(o.image);
    this.active = [];
  }
}
