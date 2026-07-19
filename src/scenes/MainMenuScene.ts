import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawCurrencyChips, drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { t } from '../core/i18n';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const gs = this.registry.get('gameState') as GameState;
    const audio = this.registry.get('audio') as AudioManager;
    audio.applySettings(gs.save.settings);

    drawMenuBackground(this);
    drawCurrencyChips(this, gs.save.coins, gs.save.bones);

    // Title
    this.add
      .text(GAME_WIDTH / 2, 320, 'VACA', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '160px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(0, 8, '#7b2ff7', 0, true, true);
    this.add
      .text(GAME_WIDTH / 2, 430, t('game.subtitle'), {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '52px',
        color: '#ff5db1',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Idle VACA
    const hero = this.add.image(GAME_WIDTH / 2, 700, 'player').setScale(2.0);
    this.tweens.add({
      targets: hero,
      y: 682,
      angle: 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Best distance
    this.add
      .text(GAME_WIDTH / 2, 940, `${t('menu.best')}: ${Math.floor(gs.save.bestDistance)} m`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#ffcc33',
      })
      .setOrigin(0.5);

    const click = () => audio.play('button');

    new Button(this, GAME_WIDTH / 2, 1080, t('menu.play'), () => {
      click();
      this.scene.start('LevelSelectScene');
    });

    const smallOpts = { width: 300, height: 96, fontSize: 34, color: 0x4a2b8c };
    new Button(this, GAME_WIDTH / 2 - 165, 1230, t('menu.shop'), () => {
      click();
      this.scene.start('ShopScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 + 165, 1230, t('menu.missions'), () => {
      click();
      this.scene.start('MissionsScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 - 165, 1350, t('menu.levels'), () => {
      click();
      this.scene.start('LevelSelectScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 + 165, 1350, t('menu.settings'), () => {
      click();
      this.scene.start('SettingsScene');
    }, smallOpts);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Desliza o usa las flechas • ↑ salta • ↓ deslízate', {
        fontFamily: 'Trebuchet MS',
        fontSize: '30px',
        color: '#c9b8ff',
      })
      .setOrigin(0.5);
  }
}
