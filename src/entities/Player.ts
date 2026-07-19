import Phaser from 'phaser';
import {
  JUMP_HEIGHT,
  JUMP_MS,
  LANE_CHANGE_MS,
  LANE_X,
  PLAYER_Y,
  SLIDE_MS,
} from '../config/GameConfig';

/**
 * VACA the dog on her scooter. Owns lane position, jump/slide state and the
 * little idle animations (ear/tail wiggle via a bob tween). Collision is
 * resolved by GameScene using {@link getHitBox} plus the airborne/sliding flags.
 */
export class Player extends Phaser.GameObjects.Container {
  lane = 1;
  isJumping = false;
  isSliding = false;
  private jumpOffset = 0;
  private sprite: Phaser.GameObjects.Sprite;
  private deck: Phaser.GameObjects.Rectangle;
  private shieldBubble: Phaser.GameObjects.Image;
  private baseY: number;
  private laneTween?: Phaser.Tweens.Tween;
  private jumpTween?: Phaser.Tweens.Tween;
  private slideTimer?: Phaser.Time.TimerEvent;
  private bobTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, scooterTint: number) {
    super(scene, LANE_X[1], PLAYER_Y);
    this.baseY = PLAYER_Y;

    // Coloured deck overlay to reflect the equipped scooter colour.
    this.deck = scene.add.rectangle(-6, 34, 96, 12, scooterTint).setOrigin(0.5);
    this.sprite = scene.add.sprite(0, 0, 'player').setOrigin(0.5);
    this.shieldBubble = scene.add
      .image(0, -10, 'shield-bubble')
      .setDisplaySize(180, 180)
      .setVisible(false);

    this.add([this.deck, this.sprite, this.shieldBubble]);
    this.setSize(120, 150);
    scene.add.existing(this);

    // Idle bob to suggest ear/tail motion.
    this.bobTween = scene.tweens.add({
      targets: this.sprite,
      y: -6,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  setScooterTint(tint: number): void {
    this.deck.setFillStyle(tint);
  }

  showShield(on: boolean): void {
    this.shieldBubble.setVisible(on);
  }

  changeLane(dir: -1 | 1): boolean {
    const target = Phaser.Math.Clamp(this.lane + dir, 0, LANE_X.length - 1);
    if (target === this.lane) return false;
    this.lane = target;
    this.laneTween?.stop();
    this.laneTween = this.scene.tweens.add({
      targets: this,
      x: LANE_X[this.lane],
      duration: LANE_CHANGE_MS,
      ease: 'Quad.out',
    });
    // Lean into the turn for flair.
    this.scene.tweens.add({
      targets: this.sprite,
      angle: dir * 12,
      duration: LANE_CHANGE_MS,
      yoyo: true,
      ease: 'Sine.inOut',
    });
    return true;
  }

  jump(superJump = false): boolean {
    if (this.isJumping || this.isSliding) return false;
    this.isJumping = true;
    this.bobTween?.pause();
    const height = superJump ? JUMP_HEIGHT * 1.6 : JUMP_HEIGHT;
    const duration = superJump ? JUMP_MS * 1.2 : JUMP_MS;
    this.jumpTween = this.scene.tweens.add({
      targets: this,
      jumpOffset: { from: 0, to: height },
      duration: duration / 2,
      ease: 'Quad.out',
      yoyo: true,
      onUpdate: () => {
        this.y = this.baseY - this.jumpOffset;
      },
      onComplete: () => {
        this.isJumping = false;
        this.jumpOffset = 0;
        this.y = this.baseY;
        this.bobTween?.resume();
      },
    });
    return true;
  }

  slide(): boolean {
    if (this.isSliding || this.isJumping) return false;
    this.isSliding = true;
    this.sprite.setTexture('player-slide');
    this.sprite.setScale(1, 0.8);
    this.slideTimer = this.scene.time.delayedCall(SLIDE_MS, () => {
      this.isSliding = false;
      this.sprite.setTexture('player');
      this.sprite.setScale(1, 1);
    });
    return true;
  }

  /** True when the player is high enough in a jump to clear a jumpable obstacle. */
  get isAirborne(): boolean {
    return this.isJumping && this.jumpOffset > JUMP_HEIGHT * 0.4;
  }

  /** Hit box centred on the current position, slightly tighter than the sprite. */
  getHitBox(): Phaser.Geom.Rectangle {
    const w = 70;
    const h = this.isSliding ? 60 : 110;
    return new Phaser.Geom.Rectangle(this.x - w / 2, this.y - h / 2, w, h);
  }

  playHitReaction(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      angle: { from: -18, to: 18 },
      duration: 80,
      yoyo: true,
      repeat: 3,
    });
    this.sprite.setTint(0xff8888);
    this.scene.time.delayedCall(400, () => this.sprite.clearTint());
  }

  celebrate(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      y: -24,
      duration: 200,
      yoyo: true,
      repeat: 2,
      ease: 'Quad.out',
    });
  }

  destroy(fromScene?: boolean): void {
    this.laneTween?.stop();
    this.jumpTween?.stop();
    this.bobTween?.stop();
    this.slideTimer?.remove();
    super.destroy(fromScene);
  }
}
