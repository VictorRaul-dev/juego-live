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

    // Press feedback scales this inner wrapper only, so nothing about the
    // hit test depends on the visual state.
    this.content = scene.add.container(0, 0, [this.bg, this.label]);
    this.add(this.content);
    this.setSize(this.bw, this.bh);

    // Hit-test at the SCENE input level (the same path that powers the gameplay
    // swipe controls) instead of relying on per-object interactivity. This is
    // the most reliable approach on real touch screens: on any pointer-down we
    // check whether it landed inside this button's on-screen bounds.
    const onDown = (pointer: Phaser.Input.Pointer) => {
      if (this.fired) return;
      // Build the hit rect from the button's real size (getBounds() ignores the
      // Graphics background and would only cover the text). getWorldTransformMatrix
      // composes any parent-container transforms so nested buttons work too.
      const m = this.getWorldTransformMatrix();
      const w = this.bw * m.scaleX + 24; // +padding for easier phone taps
      const h = this.bh * m.scaleY + 24;
      const b = new Phaser.Geom.Rectangle(m.tx - w / 2, m.ty - h / 2, w, h);
      if (!b.contains(pointer.x, pointer.y)) return;
      this.fired = true;
      this.content.setScale(0.95);
      onClick();
      scene.time.delayedCall(280, () => {
        if (!this.scene) return; // button was destroyed by a scene change/rebuild
        this.fired = false;
        this.content.setScale(1);
      });
    };
    scene.input.on(Phaser.Input.Events.POINTER_DOWN, onDown);
    this.once(Phaser.GameObjects.Events.DESTROY, () => {
      scene.input.off(Phaser.Input.Events.POINTER_DOWN, onDown);
    });

    // Keep lightweight hover polish on desktop (does not gate activation).
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.bw / 2, -this.bh / 2, this.bw, this.bh),
      Phaser.Geom.Rectangle.Contains,
    );
    this.on('pointerover', () => !this.fired && this.content.setScale(1.03));
    this.on('pointerout', () => !this.fired && this.content.setScale(1));

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
