import Phaser from 'phaser';
import type { CollectibleType, PowerUpType } from '../core/types';
import { GAME_HEIGHT, MAGNET_RADIUS } from '../config/GameConfig';
import { ImagePool } from '../utils/Pool';
import { aboveHorizon, depthScale, laneXAt } from '../utils/Perspective';

export type PickupKind = CollectibleType | 'power';

export interface ActivePickup {
  image: Phaser.GameObjects.Image;
  kind: PickupKind;
  lane: number;
  powerType?: PowerUpType;
  baseScale: number;
  pulled: boolean;
}

/**
 * Handles coins, bones, keys and power-up pickups: spawning, pooling, downward
 * movement, magnet attraction and off-screen recycling.
 */
export class CollectibleManager {
  private scene: Phaser.Scene;
  private pool: ImagePool;
  private active: ActivePickup[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.pool = new ImagePool(scene);
  }

  spawnCollectible(kind: CollectibleType, lane: number, y: number, elevated = false): void {
    const texture = kind === 'coin' ? 'coin' : kind === 'bone' ? 'bone' : 'key';
    const yy = y - (elevated ? 120 : 0);
    const img = this.pool.obtain(texture, laneXAt(lane, yy), yy);
    img.setOrigin(0.5).setScale(depthScale(yy)).setVisible(!aboveHorizon(yy));
    this.scene.tweens.add({ targets: img, angle: 360, duration: 1400, repeat: -1 });
    this.active.push({ image: img, kind, lane, baseScale: 1, pulled: false });
  }

  spawnPower(type: PowerUpType, lane: number, y: number): void {
    const img = this.pool.obtain(`pu-${type}`, laneXAt(lane, y), y);
    img.setOrigin(0.5).setScale(depthScale(y, 1.25)).setVisible(!aboveHorizon(y));
    this.active.push({ image: img, kind: 'power', lane, powerType: type, baseScale: 1.25, pulled: false });
  }

  update(dy: number, magnetOn: boolean, playerX: number, playerY: number): void {
    for (const p of this.active) {
      p.image.y += dy;
      const magnetic = magnetOn && (p.kind === 'coin' || p.kind === 'bone');
      if (
        magnetic &&
        p.image.y < playerY + 100 &&
        Phaser.Math.Distance.Between(p.image.x, p.image.y, playerX, playerY) < MAGNET_RADIUS * 2.2
      ) {
        // Magnet overrides perspective positioning and pulls toward the player.
        p.pulled = true;
        p.image.x = Phaser.Math.Linear(p.image.x, playerX, 0.2);
        p.image.y = Phaser.Math.Linear(p.image.y, playerY, 0.2);
      } else {
        p.image.x = laneXAt(p.lane, p.image.y);
      }
      p.image.setScale(depthScale(p.image.y, p.baseScale));
      p.image.setVisible(!aboveHorizon(p.image.y));
      p.image.setDepth(Math.floor(p.image.y) + 1);
    }
    this.active = this.active.filter((p) => {
      if (p.image.y > GAME_HEIGHT + 120) {
        this.release(p);
        return false;
      }
      return true;
    });
  }

  release(p: ActivePickup): void {
    this.scene.tweens.killTweensOf(p.image);
    p.image.setAngle(0);
    this.pool.release(p.image);
    const idx = this.active.indexOf(p);
    if (idx >= 0) this.active.splice(idx, 1);
  }

  get list(): ActivePickup[] {
    return this.active;
  }

  clear(): void {
    for (const p of [...this.active]) {
      this.scene.tweens.killTweensOf(p.image);
      this.pool.release(p.image);
    }
    this.active = [];
  }
}
