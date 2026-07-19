import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { AudioManager } from '../managers/AudioManager';
import { t } from '../core/i18n';

/** Overlay shown on top of a paused GameScene. */
export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(): void {
    const audio = this.registry.get('audio') as AudioManager;
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0620, 0.8);

    this.add
      .text(GAME_WIDTH / 2, 500, t('pause.title'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '110px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    new Button(this, GAME_WIDTH / 2, 780, t('pause.resume'), () => {
      audio.play('button');
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    new Button(this, GAME_WIDTH / 2, 930, t('pause.restart'), () => {
      audio.play('button');
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });

    new Button(this, GAME_WIDTH / 2, 1080, t('pause.menu'), () => {
      audio.play('button');
      this.scene.stop();
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    }, { color: 0x4a2b8c });
  }
}
