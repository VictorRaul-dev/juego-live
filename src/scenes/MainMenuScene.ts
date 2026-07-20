import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawCurrencyChips, drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { t } from '../core/i18n';
import { accessoryIconKey, equippedItemIds, resolveLoadout, scooterSkinKey } from '../systems/Cosmetics';

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

    // Idle VACA — reflects the equipped scooter skin/tint from the shop, and
    // normalises to a fixed height so any source image fits.
    const loadout = resolveLoadout(gs.save.equippedItems);
    const scooterId = loadout.scooter?.id ?? 'scooter-pink';
    const skinKey = scooterSkinKey(scooterId);
    const heroTexture = this.textures.exists(skinKey) ? skinKey : 'player';
    const hero = this.add.image(GAME_WIDTH / 2, 630, heroTexture);
    hero.setScale(300 / (hero.height || 300));
    if (heroTexture === 'player' && loadout.scooter?.tint && scooterId !== 'scooter-pink') {
      hero.setTint(loadout.scooter.tint);
    }
    this.tweens.add({
      targets: hero,
      y: 614,
      angle: 3,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Best distance
    this.add
      .text(GAME_WIDTH / 2, 840, `${t('menu.best')}: ${Math.floor(gs.save.bestDistance)} m`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#ffcc33',
      })
      .setOrigin(0.5);

    // Equipped-loadout strip: a small icon per purchased item currently
    // equipped, so shop purchases are visible right on the menu.
    const equippedIds = equippedItemIds(gs.save.equippedItems);
    if (equippedIds.length > 0) {
      const spacing = 58;
      const startX = GAME_WIDTH / 2 - ((equippedIds.length - 1) * spacing) / 2;
      equippedIds.forEach((id, i) => {
        const key = accessoryIconKey(id);
        if (this.textures.exists(key)) {
          this.add.image(startX + i * spacing, 890, key).setDisplaySize(48, 48);
        }
      });
    }

    const click = () => audio.play('button');

    // --- Primary call to action: JUGAR, set apart and highlighted ---
    const playY = 1090;
    const glow = this.add
      .image(GAME_WIDTH / 2, playY, 'glow')
      .setTint(0xff5db1)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDisplaySize(620, 320)
      .setAlpha(0.5);
    this.tweens.add({
      targets: glow,
      alpha: 0.85,
      scaleX: glow.scaleX * 1.08,
      scaleY: glow.scaleY * 1.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
    new Button(this, GAME_WIDTH / 2, playY, t('menu.play'), () => {
      click();
      this.scene.start('LevelSelectScene');
    }, { width: 520, height: 150, fontSize: 62, color: 0xff3b8d });

    // A faint divider makes the separation from the secondary buttons explicit.
    const div = this.add.graphics();
    div.fillStyle(0xffffff, 0.12);
    div.fillRoundedRect(GAME_WIDTH / 2 - 240, 1270, 480, 4, 2);

    // --- Secondary buttons, clearly below the divider ---
    const smallOpts = { width: 300, height: 96, fontSize: 34, color: 0x4a2b8c };
    const rowA = 1400;
    const rowB = 1524;
    new Button(this, GAME_WIDTH / 2 - 165, rowA, t('menu.shop'), () => {
      click();
      this.scene.start('ShopScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 + 165, rowA, t('menu.missions'), () => {
      click();
      this.scene.start('MissionsScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 - 165, rowB, t('menu.levels'), () => {
      click();
      this.scene.start('LevelSelectScene');
    }, smallOpts);
    new Button(this, GAME_WIDTH / 2 + 165, rowB, t('menu.settings'), () => {
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
