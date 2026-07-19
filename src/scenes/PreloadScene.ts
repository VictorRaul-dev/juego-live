import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { TextureFactory } from '../utils/TextureFactory';

/**
 * Generates all procedural textures and shows a loading bar. Real image/audio
 * assets, when added later, would be queued here with this.load.* using the
 * same texture keys so nothing else has to change.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const barW = 520;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT / 2;

    this.add
      .text(GAME_WIDTH / 2, barY - 120, 'VACA', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '120px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, barY - 30, 'Aventura Sin Límites', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '40px',
        color: '#ff5db1',
      })
      .setOrigin(0.5);

    const border = this.add.graphics();
    border.lineStyle(4, 0xffffff, 0.5);
    border.strokeRoundedRect(barX, barY, barW, 40, 12);
    const fill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      fill.clear();
      fill.fillStyle(0xff5db1, 1);
      fill.fillRoundedRect(barX + 4, barY + 4, (barW - 8) * value, 32, 8);
    });

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('Error al cargar recurso:', file.key);
    });

    // No external files in this build — trigger one no-op tick so the loader
    // still emits complete. Textures are generated in create().
    this.load.image('__noop', createNoopDataUri());
  }

  create(): void {
    TextureFactory.generateAll(this);
    // Remove the placeholder loader texture.
    if (this.textures.exists('__noop')) this.textures.remove('__noop');
    this.scene.start('MainMenuScene');
  }
}

/** 1x1 transparent PNG so the Phaser loader always has something to load. */
function createNoopDataUri(): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}
