import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawMenuBackground } from '../ui/Background';
import { AudioManager } from '../managers/AudioManager';
import { t } from '../core/i18n';

interface ResultsData {
  win: boolean;
  metres: number;
  score: number;
  coins: number;
  bones: number;
  best: number;
  newRecord: boolean;
  stars: number;
  levelId: number;
}

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('ResultsScene');
  }

  create(data: ResultsData): void {
    const audio = this.registry.get('audio') as AudioManager;
    drawMenuBackground(this);

    const title = data.win ? '¡Nivel completado!' : t('results.title');
    this.add
      .text(GAME_WIDTH / 2, 200, title, {
        fontFamily: 'Trebuchet MS',
        fontSize: '72px',
        color: data.win ? '#39ff14' : '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    if (data.newRecord) {
      const rec = this.add
        .text(GAME_WIDTH / 2, 300, t('results.newRecord'), {
          fontFamily: 'Trebuchet MS',
          fontSize: '56px',
          color: '#ffcc33',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      this.tweens.add({ targets: rec, scale: 1.15, duration: 500, yoyo: true, repeat: -1 });
    }

    if (data.levelId <= 9) {
      const starStr = '★★★'.slice(0, data.stars) + '☆☆☆'.slice(data.stars).slice(0, 3 - data.stars);
      this.add
        .text(GAME_WIDTH / 2, 380, starStr, { fontSize: '64px', color: '#ffcc33' })
        .setOrigin(0.5);
    }

    const rows: Array<[string, string]> = [
      [t('results.distance'), `${data.metres} m`],
      [t('results.score'), `${data.score}`],
      [t('results.coins'), `${data.coins}`],
      [t('results.bones'), `${data.bones}`],
      [t('results.best'), `${Math.floor(data.best)} m`],
    ];

    const panelY = 480;
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.35);
    panel.fillRoundedRect(GAME_WIDTH / 2 - 380, panelY, 760, rows.length * 90 + 40, 24);

    rows.forEach(([label, value], i) => {
      const y = panelY + 60 + i * 90;
      this.add.text(GAME_WIDTH / 2 - 330, y, label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '44px',
        color: '#c9b8ff',
      }).setOrigin(0, 0.5);
      this.add.text(GAME_WIDTH / 2 + 330, y, value, {
        fontFamily: 'Trebuchet MS',
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(1, 0.5);
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 360, t('results.retry'), () => {
      audio.play('button');
      this.scene.start('GameScene');
    });
    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 220, t('results.menu'), () => {
      audio.play('button');
      this.scene.start('MainMenuScene');
    }, { color: 0x4a2b8c });
  }
}
