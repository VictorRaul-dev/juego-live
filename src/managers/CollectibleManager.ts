import Phaser from 'phaser';
import type { CollectibleType, PowerUpType } from '../core/types';
import { GAME_HEIGHT, LANE_X, MAGNET_RADIUS } from '../config/GameConfig';
import { ImagePool } from '../utils/Pool';

export type PickupKind = CollectibleType | 'power';

export interface ActivePickup {
  image: Phaser.GameObjects.Image;
  kind: PickupKind;
  lane: number;
  powerType?: PowerUpType;
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
    const img = this.pool.obtain(texture, LANE_X[lane], y - (elevated ? 120 : 0));
    img.setOrigin(0.5);
    this.scene.tweens.add({
      targets: img,
      angle: 360,
      duration: 1400,
      repeat: -1,
    });
    this.active.push({ image: img, kind, lane });
  }

  spawnPower(type: PowerUpType, lane: number, y: number): void {
    const img = this.pool.obtain(`pu-${type}`, LANE_X[lane], y);
    img.setOrigin(0.5).setScale(1.2);
    this.scene.tweens.add({
      targets: img,
      scale: 1.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    this.active.push({ image: img, kind: 'power', lane, powerType: type });
  }

  update(dy: number, magnetOn: boolean, playerX: number, playerY: number): void {
    for (const p of this.active) {
      p.image.y += dy;
      if (magnetOn && (p.kind === 'coin' || p.kind === 'bone')) {
        const dist = Phaser.Math.Distance.Between(p.image.x, p.image.y, playerX, playerY);
        if (dist < MAGNET_RADIUS * 2.2 && p.image.y < playerY + 100) {
          p.image.x = Phaser.Math.Linear(p.image.x, playerX, 0.2);
          p.image.y = Phaser.Math.Linear(p.image.y, playerY, 0.2);
        }
      }
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

export { LANE_X };
