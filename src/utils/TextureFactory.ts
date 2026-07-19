import Phaser from 'phaser';
import type { ObstacleType, PowerUpType } from '../core/types';

/**
 * Draws every visual as an original, procedurally-generated texture at load
 * time. This keeps the repository free of binary art assets (so nothing can
 * 404 on GitHub Pages) while giving each element a clear, labelled identity —
 * no anonymous rectangles. Replace these with real sprites later by loading
 * images with the same texture keys in PreloadScene.
 */
export class TextureFactory {
  static generateAll(scene: Phaser.Scene): void {
    TextureFactory.player(scene, 'player', false);
    TextureFactory.player(scene, 'player-slide', true);
    TextureFactory.coin(scene);
    TextureFactory.bone(scene);
    TextureFactory.key(scene);
    TextureFactory.particle(scene);
    TextureFactory.shieldBubble(scene);

    const obstacleTypes: ObstacleType[] = [
      'cone',
      'box',
      'barrier-low',
      'barrier-high',
      'fence',
      'hole',
      'puddle',
      'car',
      'taxi',
      'bus',
      'truck',
      'sign',
      'construction',
    ];
    obstacleTypes.forEach((t) => TextureFactory.obstacle(scene, t));

    const powerTypes: PowerUpType[] = [
      'shield',
      'magnet',
      'double-score',
      'super-jump',
      'turbo',
      'slow-motion',
    ];
    powerTypes.forEach((p) => TextureFactory.powerUp(scene, p));
  }

  private static make(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number,
    draw: (g: Phaser.GameObjects.Graphics) => void,
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  /** VACA the dog riding a pink scooter. `sliding` gives a crouched pose. */
  static player(scene: Phaser.Scene, key: string, sliding: boolean): void {
    const w = 160;
    const h = 200;
    TextureFactory.make(scene, key, w, h, (g) => {
      const cx = w / 2;
      const bodyY = sliding ? 150 : 120;
      const scale = sliding ? 0.85 : 1;

      // --- Scooter ---
      // deck
      g.fillStyle(0xff5db1, 1);
      g.fillRoundedRect(cx - 55, 168, 110, 18, 8);
      // stem
      g.fillStyle(0xff5db1, 1);
      g.fillRect(cx + 28, 96, 12, 74);
      // handlebar
      g.fillStyle(0x2ec4c6, 1);
      g.fillRoundedRect(cx + 12, 90, 46, 10, 5);
      // headlight
      g.fillStyle(0xfff6c8, 1);
      g.fillCircle(cx + 52, 96, 7);
      // wheels (turquoise)
      g.fillStyle(0x2ec4c6, 1);
      g.fillCircle(cx - 44, 190, 14);
      g.fillCircle(cx + 44, 190, 14);
      g.fillStyle(0x1a3a3a, 1);
      g.fillCircle(cx - 44, 190, 6);
      g.fillCircle(cx + 44, 190, 6);

      // --- Dog body (black with white chest) ---
      g.fillStyle(0x1a1a1a, 1);
      g.fillEllipse(cx - 4, bodyY, 74 * scale, 84 * scale);
      // white chest
      g.fillStyle(0xf5f5f5, 1);
      g.fillEllipse(cx + 6, bodyY + 12, 34 * scale, 46 * scale);

      // front legs on handlebar
      g.fillStyle(0x1a1a1a, 1);
      g.fillRoundedRect(cx + 14, bodyY - 6, 14, 46, 6);
      // white paw
      g.fillStyle(0xf5f5f5, 1);
      g.fillRoundedRect(cx + 14, bodyY + 30, 14, 12, 5);

      // --- Head ---
      const hx = cx - 30;
      const hy = bodyY - 44;
      g.fillStyle(0x1a1a1a, 1);
      g.fillCircle(hx, hy, 30);
      // ears
      g.fillStyle(0x111111, 1);
      g.fillEllipse(hx - 22, hy - 14, 16, 26);
      g.fillEllipse(hx + 20, hy - 16, 14, 24);
      // white face stripe
      g.fillStyle(0xf5f5f5, 1);
      g.fillRoundedRect(hx - 6, hy - 24, 12, 42, 6);
      // snout
      g.fillStyle(0xf5f5f5, 1);
      g.fillEllipse(hx - 14, hy + 8, 20, 14);
      // nose
      g.fillStyle(0x000000, 1);
      g.fillCircle(hx - 22, hy + 6, 5);
      // eyes
      g.fillStyle(0xffffff, 1);
      g.fillCircle(hx - 6, hy - 4, 6);
      g.fillCircle(hx + 10, hy - 5, 6);
      g.fillStyle(0x2a1a0a, 1);
      g.fillCircle(hx - 5, hy - 3, 3);
      g.fillCircle(hx + 11, hy - 4, 3);

      // purple collar
      g.fillStyle(0x7b2ff7, 1);
      g.fillRoundedRect(hx - 12, hy + 22, 28, 9, 4);

      // tail
      g.fillStyle(0x1a1a1a, 1);
      g.fillEllipse(cx - 46, bodyY - 6, 20, 40);
      g.fillStyle(0xf5f5f5, 1);
      g.fillCircle(cx - 52, bodyY - 22, 8);
    });
  }

  static coin(scene: Phaser.Scene): void {
    TextureFactory.make(scene, 'coin', 48, 48, (g) => {
      g.fillStyle(0xffcc33, 1);
      g.fillCircle(24, 24, 22);
      g.fillStyle(0xffe08a, 1);
      g.fillCircle(24, 24, 16);
      // paw print
      g.fillStyle(0xb8860b, 1);
      g.fillCircle(24, 27, 6);
      g.fillCircle(19, 20, 3);
      g.fillCircle(24, 18, 3);
      g.fillCircle(29, 20, 3);
    });
  }

  static bone(scene: Phaser.Scene): void {
    TextureFactory.make(scene, 'bone', 52, 32, (g) => {
      g.fillStyle(0xf3e9d2, 1);
      g.fillCircle(12, 10, 9);
      g.fillCircle(12, 22, 9);
      g.fillCircle(40, 10, 9);
      g.fillCircle(40, 22, 9);
      g.fillRoundedRect(10, 10, 32, 12, 6);
    });
  }

  static key(scene: Phaser.Scene): void {
    TextureFactory.make(scene, 'key', 40, 40, (g) => {
      g.fillStyle(0xffcc33, 1);
      g.fillCircle(14, 14, 10);
      g.fillStyle(0x2b1055, 1);
      g.fillCircle(14, 14, 4);
      g.fillStyle(0xffcc33, 1);
      g.fillRect(20, 12, 16, 5);
      g.fillRect(30, 17, 5, 8);
    });
  }

  static particle(scene: Phaser.Scene): void {
    TextureFactory.make(scene, 'particle', 12, 12, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, 6, 6);
    });
  }

  static shieldBubble(scene: Phaser.Scene): void {
    TextureFactory.make(scene, 'shield-bubble', 200, 200, (g) => {
      g.lineStyle(6, 0x4dd0ff, 0.9);
      g.strokeCircle(100, 100, 92);
      g.fillStyle(0x4dd0ff, 0.15);
      g.fillCircle(100, 100, 92);
    });
  }

  static obstacle(scene: Phaser.Scene, type: ObstacleType): void {
    const key = `ob-${type}`;
    const w = 150;
    const h = 150;
    TextureFactory.make(scene, key, w, h, (g) => {
      switch (type) {
        case 'cone':
          g.fillStyle(0xff6a00, 1);
          g.fillTriangle(75, 30, 40, 130, 110, 130);
          g.fillStyle(0xffffff, 1);
          g.fillRect(52, 70, 46, 12);
          g.fillStyle(0xcc5500, 1);
          g.fillRoundedRect(34, 128, 82, 14, 4);
          break;
        case 'box':
          g.fillStyle(0xb5651d, 1);
          g.fillRect(30, 40, 90, 90);
          g.lineStyle(4, 0x7a3f10, 1);
          g.strokeRect(30, 40, 90, 90);
          g.lineBetween(30, 85, 120, 85);
          g.lineBetween(75, 40, 75, 130);
          break;
        case 'barrier-high':
          // must be jumped / dodged — tall red/white
          g.fillStyle(0xd9d9d9, 1);
          g.fillRect(28, 30, 94, 22);
          for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 === 0 ? 0xff3b3b : 0xffffff, 1);
            g.fillRect(28 + i * 24, 30, 24, 22);
          }
          g.fillStyle(0x555555, 1);
          g.fillRect(40, 52, 10, 78);
          g.fillRect(100, 52, 10, 78);
          break;
        case 'barrier-low':
          // must be slid under — bar raised high, gap below
          g.fillStyle(0x555555, 1);
          g.fillRect(34, 20, 10, 60);
          g.fillRect(106, 20, 10, 60);
          for (let i = 0; i < 4; i++) {
            g.fillStyle(i % 2 === 0 ? 0xffcc33 : 0x2b1055, 1);
            g.fillRect(34 + i * 20, 20, 20, 18);
          }
          break;
        case 'fence':
          g.fillStyle(0x8a5a2b, 1);
          for (let i = 0; i < 5; i++) g.fillRect(30 + i * 20, 40, 10, 90);
          g.fillRect(28, 55, 94, 10);
          g.fillRect(28, 100, 94, 10);
          break;
        case 'hole':
          g.fillStyle(0x0a0a12, 1);
          g.fillEllipse(75, 90, 120, 60);
          g.lineStyle(4, 0x333344, 1);
          g.strokeEllipse(75, 90, 120, 60);
          break;
        case 'puddle':
          g.fillStyle(0x2a6fb0, 0.75);
          g.fillEllipse(75, 100, 120, 44);
          g.fillStyle(0x7fc4ff, 0.6);
          g.fillEllipse(60, 96, 40, 14);
          break;
        case 'car':
          TextureFactory.vehicle(g, 0xff4d4d, 120, 90);
          break;
        case 'taxi':
          TextureFactory.vehicle(g, 0xffcc33, 120, 90);
          break;
        case 'bus':
          TextureFactory.vehicle(g, 0x39b54a, 140, 130);
          break;
        case 'truck':
          TextureFactory.vehicle(g, 0x4a6fff, 140, 120);
          break;
        case 'sign':
          g.fillStyle(0x888888, 1);
          g.fillRect(70, 60, 10, 80);
          g.fillStyle(0xffcc33, 1);
          g.fillTriangle(75, 20, 40, 70, 110, 70);
          g.lineStyle(4, 0x000000, 1);
          g.strokeTriangle(75, 24, 44, 68, 106, 68);
          break;
        case 'construction':
          g.fillStyle(0xffcc33, 1);
          g.fillRect(30, 60, 90, 70);
          for (let i = 0; i < 6; i++) {
            g.fillStyle(0x000000, 1);
            g.fillTriangle(30 + i * 16, 60, 46 + i * 16, 60, 30 + i * 16, 76);
          }
          g.fillStyle(0xff6a00, 1);
          g.fillTriangle(75, 26, 55, 60, 95, 60);
          break;
      }
    });
  }

  private static vehicle(
    g: Phaser.GameObjects.Graphics,
    color: number,
    bodyW: number,
    bodyH: number,
  ): void {
    const x = (150 - bodyW) / 2;
    const y = 150 - bodyH - 8;
    g.fillStyle(color, 1);
    g.fillRoundedRect(x, y, bodyW, bodyH, 12);
    // cabin/windows
    g.fillStyle(0xbfe6ff, 1);
    g.fillRoundedRect(x + 12, y + 12, bodyW - 24, bodyH * 0.35, 8);
    // headlights
    g.fillStyle(0xfff6c8, 1);
    g.fillCircle(x + 14, y + bodyH - 18, 7);
    g.fillCircle(x + bodyW - 14, y + bodyH - 18, 7);
    // wheels
    g.fillStyle(0x111111, 1);
    g.fillCircle(x + 24, y + bodyH, 14);
    g.fillCircle(x + bodyW - 24, y + bodyH, 14);
  }

  static powerUp(scene: Phaser.Scene, type: PowerUpType): void {
    const key = `pu-${type}`;
    const colors: Record<PowerUpType, number> = {
      shield: 0x4dd0ff,
      magnet: 0xff3b3b,
      'double-score': 0xffcc33,
      'super-jump': 0x39ff14,
      turbo: 0xff6a00,
      'slow-motion': 0x9b6bff,
    };
    TextureFactory.make(scene, key, 64, 64, (g) => {
      g.fillStyle(0xffffff, 0.15);
      g.fillCircle(32, 32, 30);
      g.fillStyle(colors[type], 1);
      g.fillCircle(32, 32, 24);
      g.fillStyle(0xffffff, 1);
      TextureFactory.powerIcon(g, type);
    });
  }

  private static powerIcon(g: Phaser.GameObjects.Graphics, type: PowerUpType): void {
    switch (type) {
      case 'shield':
        g.fillTriangle(32, 16, 18, 24, 32, 48);
        g.fillTriangle(32, 16, 46, 24, 32, 48);
        break;
      case 'magnet':
        g.fillRect(22, 20, 8, 22);
        g.fillRect(34, 20, 8, 22);
        g.fillRect(22, 18, 20, 8);
        g.fillStyle(0xff3b3b, 1);
        g.fillRect(22, 40, 8, 6);
        g.fillRect(34, 40, 8, 6);
        break;
      case 'double-score':
        g.fillCircle(24, 26, 6);
        g.fillCircle(40, 38, 6);
        g.lineStyle(4, 0xffffff, 1);
        g.lineBetween(20, 44, 44, 20);
        break;
      case 'super-jump':
        g.fillTriangle(32, 16, 20, 34, 44, 34);
        g.fillRect(28, 34, 8, 14);
        break;
      case 'turbo':
        g.fillTriangle(20, 16, 20, 48, 40, 32);
        g.fillTriangle(34, 16, 34, 48, 50, 32);
        break;
      case 'slow-motion':
        g.lineStyle(4, 0xffffff, 1);
        g.strokeCircle(32, 32, 14);
        g.lineBetween(32, 32, 32, 22);
        g.lineBetween(32, 32, 40, 34);
        break;
    }
  }
}
