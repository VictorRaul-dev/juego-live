import Phaser from 'phaser';
import {
  JUMP_HEIGHT,
  JUMP_MS,
  LANE_CHANGE_MS,
  LANE_X,
  PLAYER_Y,
  SLIDE_MS,
} from '../config/GameConfig';
import type { GameState } from '../core/GameState';
import { resolveLoadout, scooterSkinKey, scooterSkinSlideKey } from '../systems/Cosmetics';

/**
 * VACA the dog on her scooter. Owns lane position, jump/slide state and the
 * little idle animations (ear/tail wiggle via a bob tween). Collision is
 * resolved by GameScene using {@link getHitBox} plus the airborne/sliding flags.
 *
 * Appearance reflects the player's shop purchases: the equipped scooter uses
 * a dedicated full-body skin texture when one has been dropped into
 * public/assets/images/ (see ASSETS.md), or falls back to recolouring the
 * base art with the item's tint so every purchase is visible immediately.
 */
export class Player extends Phaser.GameObjects.Container {
  /** Target on-screen height so any source image renders at a consistent size. */
  private static readonly TARGET_HEIGHT = 300;

  lane = 1;
  isJumping = false;
  isSliding = false;
  private jumpOffset = 0;
  private sprite: Phaser.GameObjects.Sprite;
  private shieldBubble: Phaser.GameObjects.Image;
  private baseY: number;
  private baseScale = 1;
  private idleTextureKey: string;
  private slideTextureKey: string;
  private equippedTint: number | null = null;
  private laneTween?: Phaser.Tweens.Tween;
  private jumpTween?: Phaser.Tweens.Tween;
  private slideTimer?: Phaser.Time.TimerEvent;
  private bobTween?: Phaser.Tweens.Tween;

  /** Colour for the scene's headlight beam, resolved from the equipped light. */
  readonly headlightTint: number;
  /** Colour for the particle trail, or undefined when no trail is equipped. */
  readonly trailTint?: number;

  constructor(scene: Phaser.Scene, gs: GameState) {
    super(scene, LANE_X[1], PLAYER_Y);
    this.baseY = PLAYER_Y;

    const loadout = resolveLoadout(gs.save.equippedItems);
    const scooterId = loadout.scooter?.id ?? 'scooter-pink';
    const idleSkin = scooterSkinKey(scooterId);
    const slideSkin = scooterSkinSlideKey(scooterId);
    const hasCustomSkin = scene.textures.exists(idleSkin);
    this.idleTextureKey = hasCustomSkin ? idleSkin : 'player';
    this.slideTextureKey = scene.textures.exists(slideSkin) ? slideSkin : 'player-slide';

    this.sprite = scene.add.sprite(0, 0, this.idleTextureKey).setOrigin(0.5, 0.85);
    // Normalise the sprite to a consistent height regardless of source art size.
    this.baseScale = Player.TARGET_HEIGHT / (this.sprite.height || Player.TARGET_HEIGHT);
    this.sprite.setScale(this.baseScale);

    // Recolour the base art when no dedicated skin image exists yet. Once a
    // real `skin-<id>.png` is added the custom texture wins and this is skipped.
    if (!hasCustomSkin && loadout.scooter?.tint && scooterId !== 'scooter-pink') {
      this.equippedTint = loadout.scooter.tint;
      this.sprite.setTint(this.equippedTint);
    }

    this.headlightTint = loadout.lights?.tint ?? 0xfff4c8;
    this.trailTint = loadout.trail?.tint;

    this.shieldBubble = scene.add
      .image(0, -40, 'shield-bubble')
      .setDisplaySize(240, 240)
      .setVisible(false);

    this.add([this.sprite, this.shieldBubble]);
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
    this.sprite.setTexture(this.slideTextureKey);
    const s = Player.TARGET_HEIGHT / (this.sprite.height || Player.TARGET_HEIGHT);
    this.sprite.setScale(s, s * 0.85);
    this.slideTimer = this.scene.time.delayedCall(SLIDE_MS, () => {
      this.isSliding = false;
      this.sprite.setTexture(this.idleTextureKey);
      this.sprite.setScale(this.baseScale);
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
    this.scene.time.delayedCall(400, () => {
      if (this.equippedTint !== null) this.sprite.setTint(this.equippedTint);
      else this.sprite.clearTint();
    });
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
