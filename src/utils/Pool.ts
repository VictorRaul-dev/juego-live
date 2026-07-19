import Phaser from 'phaser';

/**
 * A tiny object pool for Phaser Images. Reusing sprites instead of creating and
 * destroying them every spawn keeps the garbage collector quiet and helps hold
 * 60 FPS on mid-range phones.
 */
export class ImagePool {
  private scene: Phaser.Scene;
  private free: Phaser.GameObjects.Image[] = [];
  private used: Set<Phaser.GameObjects.Image> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  obtain(texture: string, x: number, y: number): Phaser.GameObjects.Image {
    let img = this.free.pop();
    if (!img) {
      img = this.scene.add.image(x, y, texture);
    } else {
      img.setTexture(texture).setPosition(x, y).setActive(true).setVisible(true);
      img.setScale(1).setAlpha(1).setAngle(0).clearTint();
    }
    this.used.add(img);
    return img;
  }

  release(img: Phaser.GameObjects.Image): void {
    if (!this.used.has(img)) return;
    this.used.delete(img);
    img.setActive(false).setVisible(false);
    img.setData('kind', undefined);
    this.free.push(img);
  }

  get active(): Phaser.GameObjects.Image[] {
    return [...this.used];
  }

  releaseAll(): void {
    for (const img of this.used) {
      img.setActive(false).setVisible(false);
      this.free.push(img);
    }
    this.used.clear();
  }
}
