import Phaser from 'phaser';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { setLanguage } from '../core/i18n';

/**
 * First scene: builds the shared GameState + AudioManager, applies saved
 * preferences and hands off to the asset preloader.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const gameState = new GameState();
    setLanguage(gameState.save.settings.language);

    const audio = new AudioManager(gameState.save.settings);

    this.registry.set('gameState', gameState);
    this.registry.set('audio', audio);

    // Unlock audio on the first user interaction anywhere in the game.
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => audio.unlock());
    if (this.input.keyboard) {
      this.input.keyboard.once('keydown', () => audio.unlock());
    }

    this.scene.start('PreloadScene');
  }
}
