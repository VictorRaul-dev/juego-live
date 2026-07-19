import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawCurrencyChips, drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { MissionManager } from '../systems/MissionManager';
import { t } from '../core/i18n';

export class MissionsScene extends Phaser.Scene {
  private gs!: GameState;
  private audio!: AudioManager;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('MissionsScene');
  }

  create(): void {
    this.gs = this.registry.get('gameState') as GameState;
    this.audio = this.registry.get('audio') as AudioManager;
    MissionManager.ensureDaily(this.gs.save);
    drawMenuBackground(this);

    this.add
      .text(GAME_WIDTH / 2, 120, t('menu.missions'), {
        fontFamily: 'Trebuchet MS',
        fontSize: '76px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(GAME_WIDTH / 2, 210, 'Misiones diarias', {
        fontFamily: 'Trebuchet MS',
        fontSize: '36px',
        color: '#c9b8ff',
      })
      .setOrigin(0.5);

    this.layer = this.add.container(0, 0);
    this.render();

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 120, t('common.back'), () => {
      this.audio.play('button');
      this.scene.start('MainMenuScene');
    }, { width: 320, height: 96, color: 0x4a2b8c });
  }

  private render(): void {
    this.layer.removeAll(true);
    drawCurrencyChips(this, this.gs.save.coins, this.gs.save.bones);

    const startY = 340;
    const rowH = 210;
    this.gs.save.missions.forEach((m, i) => {
      const def = MissionManager.def(m.id);
      if (!def) return;
      const y = startY + i * rowH;
      const c = this.add.container(GAME_WIDTH / 2, y);

      const bg = this.add.graphics();
      bg.fillStyle(0x3a2360, 0.9);
      bg.fillRoundedRect(-460, -90, 920, 180, 20);
      bg.lineStyle(3, m.completed ? 0x39ff14 : 0xff5db1, 0.7);
      bg.strokeRoundedRect(-460, -90, 920, 180, 20);
      c.add(bg);

      c.add(this.add.text(-430, -66, def.description, {
        fontFamily: 'Trebuchet MS',
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
      }));

      // Progress bar
      const frac = Phaser.Math.Clamp(m.progress / def.target, 0, 1);
      const pb = this.add.graphics();
      pb.fillStyle(0x000000, 0.4);
      pb.fillRoundedRect(-430, 0, 620, 34, 16);
      pb.fillStyle(0x39ff14, 1);
      pb.fillRoundedRect(-426, 4, 612 * frac, 26, 13);
      c.add(pb);
      c.add(this.add.text(-120, 17, `${Math.floor(m.progress)}/${def.target}`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#ffffff',
      }).setOrigin(0.5));

      c.add(this.add.text(-430, 50, `Recompensa: ${def.reward} 🪙`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '26px',
        color: '#ffcc33',
      }));

      let label = t('common.claim');
      let color = 0x39b54a;
      let enabled = true;
      if (m.claimed) {
        label = t('common.claimed');
        color = 0x555577;
        enabled = false;
      } else if (!m.completed) {
        label = 'En curso';
        color = 0x4a2b8c;
        enabled = false;
      }
      const btn = new Button(this, 330, 20, label, () => {
        if (!enabled) return;
        const reward = MissionManager.claimCompleted([this.gs.save.missions[i]]);
        if (reward > 0) {
          this.gs.addCoins(reward);
          this.gs.persist();
          this.audio.play('power');
          this.render();
        }
      }, { width: 210, height: 90, fontSize: 30, color });
      c.add(btn);

      this.layer.add(c);
    });
  }
}
