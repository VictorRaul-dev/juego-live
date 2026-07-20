import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawCurrencyChips, drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { SHOP_ITEMS } from '../data/shopItems';
import { UPGRADES, nextUpgradeCost } from '../data/upgrades';
import { UPGRADE_MAX_LEVEL } from '../config/GameConfig';
import type { ShopItem } from '../core/types';
import { t } from '../core/i18n';
import { accessoryIconKey } from '../systems/Cosmetics';

export class ShopScene extends Phaser.Scene {
  private gs!: GameState;
  private audio!: AudioManager;
  private listLayer!: Phaser.GameObjects.Container;
  private tab: 'cosmetics' | 'upgrades' = 'cosmetics';

  constructor() {
    super('ShopScene');
  }

  create(): void {
    this.gs = this.registry.get('gameState') as GameState;
    this.audio = this.registry.get('audio') as AudioManager;
    drawMenuBackground(this);

    this.add
      .text(GAME_WIDTH / 2, 100, t('menu.shop'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '76px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    new Button(this, GAME_WIDTH / 2 - 230, 230, 'Cosméticos', () => {
      this.tab = 'cosmetics';
      this.render();
    }, { width: 400, height: 90, fontSize: 34, color: 0x7b2ff7 });
    new Button(this, GAME_WIDTH / 2 + 230, 230, 'Mejoras', () => {
      this.tab = 'upgrades';
      this.render();
    }, { width: 400, height: 90, fontSize: 34, color: 0x4a2b8c });

    this.listLayer = this.add.container(0, 0);
    this.render();

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 110, t('common.back'), () => {
      this.audio.play('button');
      this.scene.start('MainMenuScene');
    }, { width: 320, height: 96, color: 0x4a2b8c });
  }

  private render(): void {
    this.listLayer.removeAll(true);
    drawCurrencyChips(this, this.gs.save.coins, this.gs.save.bones);
    if (this.tab === 'cosmetics') this.renderCosmetics();
    else this.renderUpgrades();
  }

  private renderCosmetics(): void {
    const startY = 330;
    const rowH = 150;
    const cols = 2;
    SHOP_ITEMS.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = GAME_WIDTH / 2 + (col === 0 ? -270 : 270);
      const y = startY + row * rowH;
      this.listLayer.add(this.cosmeticCard(item, x, y));
    });
  }

  private cosmeticCard(item: ShopItem, x: number, y: number): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const owned = this.gs.owns(item.id);
    const equipped = this.gs.save.equippedItems[item.category] === item.id;

    const bg = this.add.graphics();
    bg.fillStyle(0x3a2360, 0.9);
    bg.fillRoundedRect(-250, -66, 500, 132, 18);
    bg.lineStyle(3, equipped ? 0x39ff14 : 0xff5db1, 0.8);
    bg.strokeRoundedRect(-250, -66, 500, 132, 18);
    c.add(bg);

    const iconKey = accessoryIconKey(item.id);
    const preview = this.textures.exists(iconKey)
      ? this.add.image(-200, 0, iconKey).setDisplaySize(68, 68)
      : this.add.circle(-200, 0, 34, item.tint ?? 0xffffff);
    c.add(preview);

    c.add(this.add.text(-150, -34, item.name, {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: 'bold',
    }));
    c.add(this.add.text(-150, 4, item.category, {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#c9b8ff',
    }));

    let label: string;
    let color = 0x39b54a;
    if (equipped) {
      label = t('common.equipped');
      color = 0x2a7a2a;
    } else if (owned) {
      label = t('common.equip');
      color = 0x4a6fff;
    } else {
      label = `${item.price} ${item.currency === 'coins' ? '🪙' : '🦴'}`;
      color = 0x7b2ff7;
    }

    const btn = new Button(this, 150, 20, label, () => this.onCardAction(item), {
      width: 190,
      height: 80,
      fontSize: 28,
      color,
    });
    c.add(btn);
    return c;
  }

  private onCardAction(item: ShopItem): void {
    const owned = this.gs.owns(item.id);
    if (owned) {
      this.gs.equip(item.category, item.id);
      this.audio.play('button');
    } else {
      const paid =
        item.currency === 'coins' ? this.gs.spendCoins(item.price) : this.gs.spendBones(item.price);
      if (!paid) {
        this.audio.play('hit');
        this.flash('Monedas/huesos insuficientes');
        return;
      }
      this.gs.save.ownedItems.push(item.id);
      this.gs.equip(item.category, item.id);
      this.audio.play('power');
    }
    this.gs.persist();
    this.render();
  }

  private renderUpgrades(): void {
    const startY = 340;
    const rowH = 190;
    UPGRADES.forEach((up, i) => {
      const y = startY + i * rowH;
      const level = this.gs.upgradeLevel(up.id);
      const cost = nextUpgradeCost(up, level);
      const c = this.add.container(GAME_WIDTH / 2, y);

      const bg = this.add.graphics();
      bg.fillStyle(0x3a2360, 0.9);
      bg.fillRoundedRect(-460, -80, 920, 160, 20);
      c.add(bg);

      c.add(this.add.text(-430, -60, up.name, {
        fontFamily: 'Trebuchet MS',
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      }));
      c.add(this.add.text(-430, -12, up.description, {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#c9b8ff',
        wordWrap: { width: 560 },
      }));

      // Level pips
      for (let l = 0; l < UPGRADE_MAX_LEVEL; l++) {
        c.add(this.add.circle(-430 + l * 40, 46, 14, l < level ? 0x39ff14 : 0x555577));
      }

      const label = cost === null ? 'MAX' : `${cost} 🦴`;
      const btn = new Button(this, 320, 0, label, () => {
        if (cost === null) return;
        if (!this.gs.spendBones(cost)) {
          this.audio.play('hit');
          this.flash('Huesos insuficientes');
          return;
        }
        this.gs.save.upgrades[up.id] = level + 1;
        this.gs.persist();
        this.audio.play('power');
        this.render();
      }, { width: 200, height: 90, fontSize: 32, color: cost === null ? 0x555577 : 0x7b2ff7 });
      c.add(btn);

      this.listLayer.add(c);
    });
  }

  private flash(msg: string): void {
    const txt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 210, msg, {
        fontFamily: 'Trebuchet MS',
        fontSize: '32px',
        color: '#ff6a6a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.tweens.add({ targets: txt, alpha: 0, duration: 1400, onComplete: () => txt.destroy() });
  }
}
