import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { LEVELS } from '../data/levels';
import { t } from '../core/i18n';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create(): void {
    const gs = this.registry.get('gameState') as GameState;
    const audio = this.registry.get('audio') as AudioManager;
    drawMenuBackground(this);

    this.add
      .text(GAME_WIDTH / 2, 130, t('menu.levels'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '80px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const cols = 2;
    const startY = 300;
    const cellW = 460;
    const cellH = 200;
    const gapY = 30;

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = GAME_WIDTH / 2 + (col === 0 ? -cellW / 2 - 15 : cellW / 2 + 15);
      const y = startY + row * (cellH + gapY);
      const unlocked = gs.isLevelUnlocked(level.id);
      const stars = gs.save.levelStars[level.id] ?? 0;

      const card = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(unlocked ? 0x4a2b8c : 0x2a1a44, unlocked ? 1 : 0.7);
      bg.fillRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 20);
      bg.lineStyle(3, unlocked ? 0xff5db1 : 0x555577, 0.8);
      bg.strokeRoundedRect(-cellW / 2, -cellH / 2, cellW, cellH, 20);
      card.add(bg);

      card.add(
        this.add
          .text(0, -60, `${level.id}. ${level.name}`, {
            fontFamily: 'Trebuchet MS',
            fontSize: '34px',
            color: unlocked ? '#ffffff' : '#8888aa',
            fontStyle: 'bold',
          })
          .setOrigin(0.5),
      );
      card.add(
        this.add
          .text(0, -18, level.scenario, {
            fontFamily: 'Trebuchet MS',
            fontSize: '26px',
            color: unlocked ? '#c9b8ff' : '#666688',
          })
          .setOrigin(0.5),
      );

      if (unlocked) {
        // Star row
        const starStr = '★★★'.slice(0, stars) + '☆☆☆'.slice(stars).slice(0, 3 - stars);
        card.add(
          this.add
            .text(0, 24, starStr, { fontSize: '38px', color: '#ffcc33' })
            .setOrigin(0.5),
        );
        const best = gs.save.levelBest[level.id];
        if (best) {
          card.add(
            this.add
              .text(0, 66, `Mejor: ${best} m`, {
                fontFamily: 'Trebuchet MS',
                fontSize: '24px',
                color: '#9fe0ff',
              })
              .setOrigin(0.5),
          );
        }
        bg.setInteractive(
          new Phaser.Geom.Rectangle(-cellW / 2, -cellH / 2, cellW, cellH),
          Phaser.Geom.Rectangle.Contains,
        );
        bg.on('pointerdown', () => {
          audio.play('button');
          gs.currentLevel = level.id;
          this.scene.start('GameScene');
        });
      } else {
        card.add(this.add.text(0, 30, `🔒 ${t('common.locked')}`, {
          fontFamily: 'Trebuchet MS',
          fontSize: '30px',
          color: '#8888aa',
        }).setOrigin(0.5));
      }
    });

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 120, t('common.back'), () => {
      audio.play('button');
      this.scene.start('MainMenuScene');
    }, { width: 320, height: 96, color: 0x4a2b8c });
  }
}
