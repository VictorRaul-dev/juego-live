import Phaser from 'phaser';

export interface ButtonOptions {
  width?: number;
  height?: number;
  color?: number;
  textColor?: string;
  fontSize?: number;
}

/**
 * A large, touch-friendly rounded button rendered from a container so it works
 * on any screen size without external image assets.
 */
export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private content: Phaser.GameObjects.Container;
  private bw: number;
  private bh: number;
  private bcolor: number;
  private fired = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    opts: ButtonOptions = {},
  ) {
    super(scene, x, y);
    this.bw = opts.width ?? 420;
    this.bh = opts.height ?? 110;
    this.bcolor = opts.color ?? 0x7b2ff7;

    this.bg = scene.add.graphics();
    this.drawBg(this.bcolor);
    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: `${opts.fontSize ?? 44}px`,
        color: opts.textColor ?? '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Press feedback scales this inner wrapper only, so the interactive hit
    // area on the container never moves — taps register on the first touch.
    this.content = scene.add.container(0, 0, [this.bg, this.label]);
    this.add(this.content);
    this.setSize(this.bw, this.bh);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.bw / 2, -this.bh / 2, this.bw, this.bh),
      Phaser.Geom.Rectangle.Contains,
    );

    // Fire on pointer DOWN for an immediate, tap-friendly response on mobile
    // (no hover step required). A guard prevents a double trigger if a
    // pointerup lands on the same button before the scene changes.
    const activate = () => {
      if (this.fired) return;
      this.fired = true;
      this.content.setScale(0.96);
      onClick();
    };
    this.on('pointerdown', activate);
    this.on('pointerover', () => this.content.setScale(1.03));
    this.on('pointerout', () => this.content.setScale(1));
    this.on('pointerup', () => this.content.setScale(1));

    scene.add.existing(this);
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  setColor(color: number): void {
    this.bcolor = color;
    this.drawBg(color);
  }

  private drawBg(color: number): void {
    this.bg.clear();
    this.bg.fillStyle(0x000000, 0.25);
    this.bg.fillRoundedRect(-this.bw / 2, -this.bh / 2 + 6, this.bw, this.bh, 22);
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh, 22);
    this.bg.lineStyle(3, 0xffffff, 0.35);
    this.bg.strokeRoundedRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh, 22);
  }
}
