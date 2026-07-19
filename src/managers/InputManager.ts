import Phaser from 'phaser';
import type { PlayerAction } from '../core/types';

type ActionHandler = (action: PlayerAction | 'pause') => void;

/**
 * Translates touch swipes and keyboard input into abstract player actions,
 * keeping raw input handling out of the GameScene.
 *
 * Touch: swipe left/right to change lane, up to jump, down to slide, tap to
 * jump. Keyboard: arrows / WASD / space, Esc or P to pause.
 */
export class InputManager {
  private scene: Phaser.Scene;
  private handler: ActionHandler;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private readonly SWIPE_THRESHOLD = 30;
  private readonly TAP_TIME = 220;
  private enabled = true;

  private keyboardCleanup: (() => void) | null = null;

  constructor(scene: Phaser.Scene, handler: ActionHandler) {
    this.scene = scene;
    this.handler = handler;
    this.setupPointer();
    this.setupKeyboard();
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
  }

  private setupPointer(): void {
    this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      this.startX = p.x;
      this.startY = p.y;
      this.startTime = p.downTime;
    });

    this.scene.input.on(Phaser.Input.Events.POINTER_UP, (p: Phaser.Input.Pointer) => {
      if (!this.enabled) return;
      const dx = p.x - this.startX;
      const dy = p.y - this.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const dt = p.upTime - this.startTime;

      if (absX < this.SWIPE_THRESHOLD && absY < this.SWIPE_THRESHOLD) {
        // Tap = jump (only quick taps, so drags across UI don't jump).
        if (dt <= this.TAP_TIME) this.handler('jump');
        return;
      }
      if (absX > absY) {
        this.handler(dx > 0 ? 'lane-right' : 'lane-left');
      } else {
        this.handler(dy > 0 ? 'slide' : 'jump');
      }
    });
  }

  private setupKeyboard(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    const onKey = (e: KeyboardEvent) => {
      if (!this.enabled && e.code !== 'Escape' && e.code !== 'KeyP') return;
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.handler('lane-left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.handler('lane-right');
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.handler('jump');
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.handler('slide');
          break;
        case 'Escape':
        case 'KeyP':
          this.handler('pause');
          break;
      }
    };

    kb.on('keydown', onKey);
    this.keyboardCleanup = () => kb.off('keydown', onKey);
  }

  destroy(): void {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP);
    this.keyboardCleanup?.();
  }
}
