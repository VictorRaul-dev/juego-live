import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';

/** Draws the shared purple/pink menu gradient with a few floating paw dots. */
export function drawMenuBackground(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const top = 0x3a1a6e;
  const bottom = 0x140630;
  const steps = 32;
  for (let i = 0; i < steps; i++) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(top),
      Phaser.Display.Color.ValueToColor(bottom),
      steps,
      i,
    );
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(0, (GAME_HEIGHT / steps) * i, GAME_WIDTH, GAME_HEIGHT / steps + 1);
  }

  for (let i = 0; i < 14; i++) {
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const y = Phaser.Math.Between(40, GAME_HEIGHT - 40);
    const dot = scene.add.circle(x, y, Phaser.Math.Between(4, 12), 0xff5db1, 0.12);
    scene.tweens.add({
      targets: dot,
      y: y - 40,
      alpha: 0.25,
      duration: Phaser.Math.Between(2000, 4000),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }
}

/** Small coins/bones counter chip shown in the top corner of menus. */
export function drawCurrencyChips(scene: Phaser.Scene, coins: number, bones: number): void {
  const y = 70;
  const mk = (x: number, icon: string, value: number) => {
    const c = scene.add.container(x, y);
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-90, -34, 180, 68, 34);
    const img = scene.add.image(-52, 0, icon).setScale(0.9);
    const txt = scene.add
      .text(-20, 0, `${value}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '38px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);
    c.add([bg, img, txt]);
    return c;
  };
  mk(GAME_WIDTH - 320, 'coin', coins);
  mk(GAME_WIDTH - 120, 'bone', bones);
}
