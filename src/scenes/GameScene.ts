import Phaser from 'phaser';
import {
  BASE_SPEED,
  GAME_HEIGHT,
  GAME_WIDTH,
  MAX_SPEED,
  PLAYER_Y,
  UNITS_PER_METRE,
} from '../config/GameConfig';
import {
  HORIZON_Y,
  aboveHorizon,
  depthScale,
  laneXAt,
  roadHalfWidthAt,
} from '../utils/Perspective';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { DifficultyManager } from '../systems/DifficultyManager';
import { ChunkGenerator } from '../systems/ChunkGenerator';
import { ScoreManager } from '../systems/ScoreManager';
import { PowerUpManager } from '../systems/PowerUpManager';
import { ObstacleManager } from '../managers/ObstacleManager';
import { CollectibleManager, type ActivePickup } from '../managers/CollectibleManager';
import { InputManager } from '../managers/InputManager';
import { Player } from '../entities/Player';
import { SHOP_ITEMS } from '../data/shopItems';
import { getLevel } from '../data/levels';
import type { PlayerAction, PowerUpType, RunStats } from '../core/types';
import { getTheme, type Theme } from '../data/themes';
import { MissionManager } from '../systems/MissionManager';

const SPAWN_BUFFER = 400;

// Rendering depth bands. Road/background use negatives, moving entities use
// their world-Y so nearer things paint on top, and HUD/overlays sit far above.
const DEPTH_SHADOW = 0;
const DEPTH_PLAYER = Math.floor(PLAYER_Y) + 5;
const DEPTH_OVERLAY = 90_000;
const DEPTH_HUD = 100_000;

/** Darken a hex colour by `factor` (0..1). */
function shade(color: number, factor: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color);
  return Phaser.Display.Color.GetColor(
    Math.floor(c.red * factor),
    Math.floor(c.green * factor),
    Math.floor(c.blue * factor),
  );
}

export class GameScene extends Phaser.Scene {
  private gs!: GameState;
  private audio!: AudioManager;
  private difficulty!: DifficultyManager;
  private generator!: ChunkGenerator;
  private score!: ScoreManager;
  private powers!: PowerUpManager;
  private obstacles!: ObstacleManager;
  private collectibles!: CollectibleManager;
  private input2!: InputManager;
  private player!: Player;
  private theme!: Theme;

  private roadFx!: Phaser.GameObjects.Graphics;
  private shadowFx!: Phaser.GameObjects.Graphics;
  private bgFar?: Phaser.GameObjects.TileSprite;
  private bgNear?: Phaser.GameObjects.TileSprite;
  private headlight?: Phaser.GameObjects.Image;
  private roadScroll = 0;
  private frontierY = 0;
  private totalPixels = 0;
  private levelId = 1;
  private targetMetres = Infinity;
  private running = false;
  private invuln = 0;
  private levelCompleted = false;
  private levelResultRecorded = false;
  private completedStars = 0;
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  // HUD
  private distanceText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private boneText!: Phaser.GameObjects.Text;
  private multText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;

  private stats!: RunStats;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.gs = this.registry.get('gameState') as GameState;
    this.audio = this.registry.get('audio') as AudioManager;
    this.levelId = this.gs.currentLevel;
    const level = getLevel(this.levelId);
    this.theme = getTheme(level.scenario);
    this.targetMetres = level.targetDistance;

    // Systems
    this.difficulty = new DifficultyManager(level.difficulty);
    this.generator = new ChunkGenerator();
    this.score = new ScoreManager(this.gs.baseMultiplier);
    this.powers = new PowerUpManager();
    this.powers.configureUpgrades(this.gs.save.upgrades);
    this.obstacles = new ObstacleManager(this);
    this.collectibles = new CollectibleManager(this);

    this.stats = {
      distance: 0,
      coins: 0,
      bones: 0,
      jumps: 0,
      slides: 0,
      laneChanges: 0,
      shieldsUsed: 0,
      hit: false,
    };

    this.roadScroll = 0;
    this.frontierY = 0;
    this.totalPixels = 0;
    this.invuln = 0;
    this.running = true;
    this.levelCompleted = false;
    this.levelResultRecorded = false;
    this.completedStars = 0;

    this.buildBackground();
    this.roadFx = this.add.graphics().setDepth(-20);
    this.shadowFx = this.add.graphics().setDepth(DEPTH_SHADOW);
    this.drawRoad();

    // Headlight cone (subtle by day, prominent at night).
    this.headlight = this.add
      .image(0, 0, 'headlight')
      .setOrigin(0.5, 1)
      .setDepth(DEPTH_PLAYER - 1)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(this.theme.night ? 0.9 : 0.28);

    // Player with equipped scooter colour.
    const scooterId = this.gs.save.equippedItems.scooter ?? 'scooter-pink';
    const scooterTint = SHOP_ITEMS.find((s) => s.id === scooterId)?.tint ?? 0xff5db1;
    this.player = new Player(this, scooterTint);
    this.player.setDepth(DEPTH_PLAYER);

    this.buildHud();
    this.buildInput();

    // Speed upgrade grants a small head-start on control (starts a touch faster).
    this.audio.startMusic();

    // Pre-fill a couple of screens of track.
    this.generateAhead();

    this.events.on(Phaser.Scenes.Events.RESUME, () => {
      this.input2.setEnabled(true);
      this.audio.startMusic();
    });
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  // ---- Setup helpers ------------------------------------------------------
  private buildBackground(): void {
    const horizonY = HORIZON_Y;

    // Vertical sky gradient (sky -> horizon haze).
    const sky = this.add.graphics().setDepth(-40);
    sky.fillGradientStyle(
      this.theme.sky,
      this.theme.sky,
      this.theme.horizon,
      this.theme.horizon,
      1,
    );
    sky.fillRect(0, 0, GAME_WIDTH, horizonY + 40);

    // Sun / moon glow near the horizon.
    const glow = this.add
      .image(GAME_WIDTH * 0.72, horizonY * 0.55, 'glow')
      .setDepth(-38)
      .setDisplaySize(560, 560)
      .setTint(this.theme.night ? 0xbfd0ff : 0xfff2c0)
      .setAlpha(this.theme.night ? 0.5 : 0.8);
    this.tweens.add({ targets: glow, alpha: glow.alpha * 0.7, duration: 2600, yoyo: true, repeat: -1 });

    // Distant hills band for a sense of place.
    const hills = this.add.graphics().setDepth(-34);
    hills.fillStyle(this.theme.horizon, 1);
    hills.beginPath();
    hills.moveTo(0, horizonY);
    for (let x = 0; x <= GAME_WIDTH; x += 120) {
      hills.lineTo(x, horizonY - 40 - Math.abs(Math.sin(x * 0.006)) * 90);
    }
    hills.lineTo(GAME_WIDTH, horizonY);
    hills.closePath();
    hills.fillPath();

    // Two parallax skyline layers (atmospheric perspective: far = hazier).
    const stripH = 300;
    this.bgFar = this.add
      .tileSprite(GAME_WIDTH / 2, horizonY - 90, GAME_WIDTH, stripH, 'bg-buildings')
      .setDepth(-32)
      .setTint(this.theme.building)
      .setAlpha(0.55);
    this.bgNear = this.add
      .tileSprite(GAME_WIDTH / 2, horizonY - 20, GAME_WIDTH, stripH, 'bg-buildings')
      .setDepth(-30)
      .setTint(this.theme.building)
      .setAlpha(0.9)
      .setScale(1, 1.25);

    // Ground beyond the road (grass/earth) below the horizon.
    const ground = this.add.graphics().setDepth(-25);
    ground.fillStyle(shade(this.theme.sidewalk, 0.75), 1);
    ground.fillRect(0, horizonY, GAME_WIDTH, GAME_HEIGHT - horizonY);

    // Cinematic vignette over the play area (below the HUD).
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'vignette')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(DEPTH_OVERLAY)
      .setAlpha(this.theme.night ? 0.9 : 0.6);

    if (this.theme.night) {
      this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a33, 0.4)
        .setDepth(DEPTH_OVERLAY - 1);
    }
    if (this.theme.rain && !this.gs.save.settings.reducedMotion) {
      this.rainEmitter = this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: GAME_WIDTH },
        y: -20,
        lifespan: 900,
        speedY: { min: 900, max: 1200 },
        scaleX: 0.3,
        scaleY: 2.5,
        quantity: this.qualityScale(4),
        frequency: 30,
        tint: 0x9fd8ff,
        alpha: 0.5,
      });
      this.rainEmitter.setDepth(DEPTH_OVERLAY - 2);
    }
  }

  private qualityScale(base: number): number {
    const q = this.gs.save.settings.quality;
    if (q === 'low') return Math.max(1, Math.floor(base * 0.4));
    if (q === 'medium') return Math.max(1, Math.floor(base * 0.7));
    return base;
  }

  private buildHud(): void {
    const style = {
      fontFamily: 'Trebuchet MS',
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    };
    this.distanceText = this.add.text(40, 50, '0 m', style).setDepth(DEPTH_HUD);
    this.coinText = this.add
      .text(40, 120, '0', { ...style, fontSize: '40px', color: '#ffcc33' })
      .setDepth(DEPTH_HUD);
    this.add.image(200, 138, 'coin').setScale(0.7).setDepth(DEPTH_HUD).setScrollFactor(0);
    this.boneText = this.add
      .text(260, 120, '0', { ...style, fontSize: '40px', color: '#f3e9d2' })
      .setDepth(DEPTH_HUD);
    this.add.image(410, 138, 'bone').setScale(0.7).setDepth(DEPTH_HUD);

    this.multText = this.add
      .text(GAME_WIDTH / 2, 60, 'x1', { ...style, fontSize: '54px', color: '#ff5db1' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD);
    this.powerText = this.add
      .text(GAME_WIDTH / 2, 140, '', { ...style, fontSize: '32px', color: '#9fe0ff' })
      .setOrigin(0.5, 0)
      .setDepth(DEPTH_HUD);

    // Pause button
    const pause = this.add.container(GAME_WIDTH - 90, 90).setDepth(DEPTH_HUD);
    const pg = this.add.graphics();
    pg.fillStyle(0x000000, 0.35);
    pg.fillRoundedRect(-56, -56, 112, 112, 20);
    pg.fillStyle(0xffffff, 1);
    pg.fillRoundedRect(-22, -30, 14, 60, 4);
    pg.fillRoundedRect(8, -30, 14, 60, 4);
    pause.add(pg);
    pause.setSize(112, 112).setInteractive(
      new Phaser.Geom.Rectangle(-56, -56, 112, 112),
      Phaser.Geom.Rectangle.Contains,
    );
    pause.on('pointerup', () => this.pauseGame());

    this.progressBar = this.add.graphics().setDepth(DEPTH_HUD);
  }

  private buildInput(): void {
    this.input2 = new InputManager(this, (action) => this.handleAction(action));
  }

  // ---- Input --------------------------------------------------------------
  private handleAction(action: PlayerAction | 'pause'): void {
    if (!this.running) return;
    switch (action) {
      case 'pause':
        this.pauseGame();
        break;
      case 'lane-left':
        if (this.player.changeLane(-1)) {
          this.stats.laneChanges++;
          this.audio.play('lane');
        }
        break;
      case 'lane-right':
        if (this.player.changeLane(1)) {
          this.stats.laneChanges++;
          this.audio.play('lane');
        }
        break;
      case 'jump':
        if (this.player.jump(this.powers.isActive('super-jump'))) {
          this.stats.jumps++;
          this.audio.play('jump');
        }
        break;
      case 'slide':
        if (this.player.slide()) {
          this.stats.slides++;
          this.audio.play('lane');
        }
        break;
    }
  }

  private pauseGame(): void {
    if (!this.running) return;
    this.input2.setEnabled(false);
    this.audio.stopMusic();
    this.scene.launch('PauseScene', { level: this.levelId });
    this.scene.pause();
  }

  // ---- Main loop ----------------------------------------------------------
  update(_time: number, delta: number): void {
    if (!this.running) return;
    const dt = Math.min(delta, 50); // clamp huge frames (tab switches)

    let speed = this.difficulty.speed;
    if (this.powers.isActive('turbo')) speed *= 1.6;
    if (this.powers.isActive('slow-motion')) speed *= 0.55;
    speed = Math.min(speed, MAX_SPEED * 1.6);

    const dy = speed * (dt / 1000);
    this.totalPixels += dy;
    this.roadScroll += dy;

    const metres = Math.floor(this.totalPixels / UNITS_PER_METRE);
    this.stats.distance = metres;
    this.score.setDistance(metres);
    this.difficulty.setDistance(metres);

    // Scroll world.
    this.frontierY += dy;
    this.obstacles.update(dy);
    this.collectibles.update(
      dy,
      this.powers.isActive('magnet'),
      this.player.x,
      this.player.y,
    );
    this.generateAhead();
    this.drawRoad();
    this.drawShadows();

    // Parallax skyline drift for a sense of forward motion.
    if (this.bgFar) this.bgFar.tilePositionX += dy * 0.02;
    if (this.bgNear) this.bgNear.tilePositionX += dy * 0.05;

    // Headlight follows the scooter and points down the track.
    if (this.headlight) {
      this.headlight.setPosition(this.player.x, this.player.y - 20);
      this.headlight.setScale(0.9 + (this.powers.isActive('turbo') ? 0.3 : 0));
    }

    // Power-up timers.
    const expired = this.powers.update(dt);
    expired.forEach((p) => this.onPowerExpired(p));
    this.score.setTempMultiplier(this.powers.isActive('double-score') ? 2 : 1);

    if (this.invuln > 0) this.invuln -= dt;

    this.handleCollisions();
    this.updateHud();

    // Audio intensity tracks speed.
    this.audio.setIntensity((speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED));

    // Finite level objective reached: mark complete, unlock the next level and
    // keep running (endless continuation) instead of ending the run abruptly.
    if (!this.levelCompleted && metres >= this.targetMetres) {
      this.onLevelComplete();
    }
  }

  private onLevelComplete(): void {
    this.levelCompleted = true;

    // Evaluate stars at the moment of completion (before any later crash).
    let stars = 1; // reaching the target earns the first star
    if (this.stats.coins >= 50) stars++;
    if (!this.stats.hit) stars++;
    this.completedStars = stars;

    if (this.levelId <= 9) {
      this.gs.recordLevelResult(this.levelId, this.stats.distance, stars);
      this.levelResultRecorded = true;
      this.gs.persist();
    }

    this.audio.play('record');
    this.player.celebrate();
    this.showToast('¡Nivel completado! Sigue para más puntos');
  }

  private showToast(msg: string): void {
    const txt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.42, msg, {
        fontFamily: 'Trebuchet MS',
        fontSize: '46px',
        color: '#39ff14',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#0a3a0a',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_HUD - 1);
    this.tweens.add({
      targets: txt,
      y: GAME_HEIGHT * 0.36,
      alpha: 0,
      duration: 2200,
      ease: 'Quad.out',
      onComplete: () => txt.destroy(),
    });
  }

  private generateAhead(): void {
    let guard = 0;
    const luck = this.gs.upgradeLevel('powerup-rate');
    while (this.frontierY > -(GAME_HEIGHT + SPAWN_BUFFER) && guard++ < 40) {
      const d = this.difficulty.difficulty;
      const chunk = this.generator.next(d, this.difficulty.powerUpChance(luck));
      const top = this.frontierY - chunk.length;

      const n = chunk.obstacles.length;
      chunk.obstacles.forEach((o, i) => {
        const y = top + (chunk.length * (i + 1)) / (n + 1);
        this.obstacles.spawn(o, y, d);
      });
      chunk.collectibles.forEach((c) => {
        this.collectibles.spawnCollectible(c.type, c.lane, top + c.offset * chunk.length, c.elevated);
      });
      (chunk.powerUps ?? []).forEach((p) => {
        this.collectibles.spawnPower(p.type, p.lane, top + p.offset * chunk.length);
      });

      const gap = 240 * this.difficulty.spacingFactor;
      this.frontierY = top - gap;
    }
  }

  // ---- Collisions ---------------------------------------------------------
  private handleCollisions(): void {
    const box = this.player.getHitBox();

    // Obstacles
    for (const o of [...this.obstacles.list]) {
      if (o.lane !== this.player.lane) continue;
      const b = o.image.getBounds();
      if (!Phaser.Geom.Intersects.RectangleToRectangle(box, b)) continue;

      // Turbo ploughs through minor obstacles.
      if (this.powers.isActive('turbo') && o.minor) {
        this.obstacles.remove(o);
        this.score.addBonus(5);
        this.spawnBurst(o.image.x, o.image.y, 0xffa500);
        continue;
      }
      const avoided =
        (o.avoidWith.includes('jump') && this.player.isAirborne) ||
        (o.avoidWith.includes('slide') && this.player.isSliding);
      if (avoided) continue;

      if (this.invuln > 0) continue;
      this.onHit(o.image.x, o.image.y);
      this.obstacles.remove(o);
      break;
    }

    // Pickups
    for (const p of [...this.collectibles.list]) {
      const dist = Phaser.Math.Distance.Between(p.image.x, p.image.y, this.player.x, this.player.y);
      if (dist > 90) continue;
      this.collectPickup(p);
    }
  }

  private collectPickup(p: ActivePickup): void {
    switch (p.kind) {
      case 'coin':
        this.score.addCoin();
        this.stats.coins++;
        this.audio.play('coin');
        this.spawnBurst(p.image.x, p.image.y, 0xffcc33);
        break;
      case 'bone':
        this.score.addBone();
        this.stats.bones++;
        this.audio.play('bone');
        this.spawnBurst(p.image.x, p.image.y, 0xf3e9d2);
        break;
      case 'key':
        this.gs.save.keys++;
        this.audio.play('bone');
        break;
      case 'power':
        if (p.powerType) this.activatePower(p.powerType);
        break;
    }
    this.collectibles.release(p);
  }

  private activatePower(type: PowerUpType): void {
    this.powers.activate(type);
    this.audio.play('power');
    if (type === 'shield') this.player.showShield(true);
    this.spawnBurst(this.player.x, this.player.y - 40, 0x4dd0ff);
  }

  private onPowerExpired(type: PowerUpType): void {
    if (type === 'shield') this.player.showShield(false);
  }

  private onHit(x: number, y: number): void {
    if (this.powers.consumeShield()) {
      this.stats.shieldsUsed++;
      this.player.showShield(false);
      this.invuln = 900;
      this.audio.play('power');
      this.spawnBurst(x, y, 0x4dd0ff);
      this.difficulty.registerPerformance(-0.4);
      return;
    }
    this.stats.hit = true;
    this.player.playHitReaction();
    this.audio.play('hit');
    if (this.gs.save.settings.vibration && navigator.vibrate) navigator.vibrate(120);
    if (!this.gs.save.settings.reducedMotion) this.cameras.main.shake(220, 0.012);
    this.finishRun(false);
  }

  private spawnBurst(x: number, y: number, tint: number): void {
    if (this.gs.save.settings.reducedMotion) return;
    const p = this.add.particles(x, y, 'particle', {
      speed: { min: 80, max: 240 },
      lifespan: 400,
      quantity: this.qualityScale(8),
      scale: { start: 0.8, end: 0 },
      tint,
    });
    p.setDepth(DEPTH_HUD - 500);
    this.time.delayedCall(420, () => p.destroy());
  }

  // ---- HUD ----------------------------------------------------------------
  private updateHud(): void {
    this.distanceText.setText(`${this.stats.distance} m`);
    this.coinText.setText(`${this.score.coinCount}`);
    this.boneText.setText(`${this.score.boneCount}`);
    this.multText.setText(`x${this.score.multiplier.toFixed(this.score.multiplier % 1 ? 2 : 0)}`);

    const active = this.powers.activeTypes;
    this.powerText.setText(active.length ? active.map(labelForPower).join('  ') : '');

    if (isFinite(this.targetMetres)) {
      const frac = Phaser.Math.Clamp(this.stats.distance / this.targetMetres, 0, 1);
      this.progressBar.clear();
      this.progressBar.fillStyle(0x000000, 0.4);
      this.progressBar.fillRoundedRect(GAME_WIDTH / 2 - 250, 210, 500, 22, 10);
      this.progressBar.fillStyle(0x39ff14, 1);
      this.progressBar.fillRoundedRect(GAME_WIDTH / 2 - 246, 214, 492 * frac, 14, 7);
    }
  }

  // ---- Road rendering (perspective trapezoid) -----------------------------
  private drawRoad(): void {
    const g = this.roadFx;
    g.clear();
    const cx = GAME_WIDTH / 2;
    const top = HORIZON_Y;
    const bottom = GAME_HEIGHT;

    const topHalf = roadHalfWidthAt(top);
    const botHalf = roadHalfWidthAt(bottom);
    const shoulder = 1.35; // sidewalks extend beyond the road edge

    // Sidewalk / shoulder trapezoid (slightly wider, lighter).
    g.fillStyle(this.theme.sidewalk, 1);
    g.fillPoints(
      [
        new Phaser.Geom.Point(cx - topHalf * shoulder, top),
        new Phaser.Geom.Point(cx + topHalf * shoulder, top),
        new Phaser.Geom.Point(cx + botHalf * shoulder, bottom),
        new Phaser.Geom.Point(cx - botHalf * shoulder, bottom),
      ],
      true,
    );

    // Road surface trapezoid.
    g.fillStyle(this.theme.road, 1);
    g.fillPoints(
      [
        new Phaser.Geom.Point(cx - topHalf, top),
        new Phaser.Geom.Point(cx + topHalf, top),
        new Phaser.Geom.Point(cx + botHalf, bottom),
        new Phaser.Geom.Point(cx - botHalf, bottom),
      ],
      true,
    );

    // Yellow road edges.
    g.lineStyle(6, 0xffcc33, 0.9);
    g.lineBetween(cx - topHalf, top, cx - botHalf, bottom);
    g.lineBetween(cx + topHalf, top, cx + botHalf, bottom);

    // Dashed lane dividers between lanes, converging to the vanishing point.
    const dash = 70;
    const gap = 55;
    const period = dash + gap;
    const offset = this.roadScroll % period;
    g.fillStyle(0xffffff, this.theme.night ? 0.45 : 0.8);
    for (const boundary of [0.5, 1.5]) {
      // lane boundary position expressed between lane 0 and lane 2
      for (let y = top - period + offset; y < bottom; y += period) {
        const y2 = Math.min(bottom, y + dash);
        if (y2 <= top) continue;
        const yA = Math.max(y, top);
        const xA = this.boundaryX(boundary, yA);
        const xB = this.boundaryX(boundary, y2);
        const wA = Math.max(2, depthScale(yA) * 9);
        const wB = Math.max(2, depthScale(y2) * 9);
        g.fillPoints(
          [
            new Phaser.Geom.Point(xA - wA, yA),
            new Phaser.Geom.Point(xA + wA, yA),
            new Phaser.Geom.Point(xB + wB, y2),
            new Phaser.Geom.Point(xB - wB, y2),
          ],
          true,
        );
      }
    }
  }

  /** X of a lane boundary (0.5 = between lane 0 and 1) at a given depth. */
  private boundaryX(boundary: number, y: number): number {
    const lo = Math.floor(boundary);
    return (laneXAt(lo, y) + laneXAt(lo + 1, y)) / 2;
  }

  /** Soft ground shadows under the player and every visible obstacle. */
  private drawShadows(): void {
    const g = this.shadowFx;
    g.clear();
    const drawAt = (x: number, y: number, scale: number) => {
      const w = 150 * scale;
      const h = 46 * scale;
      g.fillStyle(0x000000, 0.28);
      g.fillEllipse(x, y, w, h);
    };
    for (const o of this.obstacles.list) {
      if (aboveHorizon(o.image.y)) continue;
      drawAt(o.image.x, o.image.y - 6, depthScale(o.image.y, o.baseScale));
    }
    // Player shadow stays on the ground even while jumping (offset ignored).
    drawAt(this.player.x, PLAYER_Y + 4, 1);
  }

  // ---- End of run ---------------------------------------------------------
  // Called when VACA crashes. Finite levels may already be flagged complete
  // (the player kept running past the objective for a higher score).
  private finishRun(_win: boolean): void {
    if (!this.running) return;
    this.running = false;
    this.input2.setEnabled(false);
    this.audio.stopMusic();

    const win = this.levelCompleted;
    const metres = this.stats.distance;
    const finalScore = this.score.score;

    // Persist currency and totals.
    this.gs.addCoins(this.stats.coins);
    this.gs.addBones(this.stats.bones);
    this.accumulateTotals();

    const newRecord = metres > this.gs.save.bestDistance;
    if (newRecord) this.gs.save.bestDistance = metres;
    if (finalScore > this.gs.save.bestScore) this.gs.save.bestScore = finalScore;

    // Stars for finite levels. If the objective was reached mid-run it was
    // already recorded in onLevelComplete(); otherwise record what was earned.
    let stars = this.completedStars;
    if (this.levelId <= 9 && !this.levelResultRecorded) {
      stars = 0;
      if (metres >= this.targetMetres) stars++;
      if (this.stats.coins >= 50) stars++;
      if (!this.stats.hit) stars++;
      this.gs.recordLevelResult(this.levelId, metres, stars);
    }

    // Missions.
    MissionManager.ensureDaily(this.gs.save);
    MissionManager.applyRun(this.gs.save.missions, this.stats);

    this.gs.persist();

    if (newRecord) {
      this.audio.play('record');
      this.player.celebrate();
    }

    this.time.delayedCall(newRecord ? 700 : 350, () => {
      this.scene.start('ResultsScene', {
        win,
        metres,
        score: finalScore,
        coins: this.stats.coins,
        bones: this.stats.bones,
        best: this.gs.save.bestDistance,
        newRecord,
        stars,
        levelId: this.levelId,
      });
    });
  }

  private accumulateTotals(): void {
    const tot = this.gs.save.totals;
    tot.distance += this.stats.distance;
    tot.coins += this.stats.coins;
    tot.bones += this.stats.bones;
    tot.jumps += this.stats.jumps;
    tot.slides += this.stats.slides;
    tot.laneChanges += this.stats.laneChanges;
    tot.shieldsUsed += this.stats.shieldsUsed;
  }

  private cleanup(): void {
    this.audio.stopMusic();
    this.input2?.destroy();
    this.obstacles?.clear();
    this.collectibles?.clear();
    this.rainEmitter?.destroy();
  }
}

function labelForPower(type: PowerUpType): string {
  const map: Record<PowerUpType, string> = {
    shield: '🛡️',
    magnet: '🧲',
    'double-score': 'x2',
    'super-jump': '⤒',
    turbo: '🔥',
    'slow-motion': '🐢',
  };
  return map[type];
}
