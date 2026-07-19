import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/GameConfig';
import { Button } from '../ui/Button';
import { drawMenuBackground } from '../ui/Background';
import { GameState } from '../core/GameState';
import { AudioManager } from '../managers/AudioManager';
import { setLanguage } from '../core/i18n';

export class SettingsScene extends Phaser.Scene {
  private gs!: GameState;
  private audio!: AudioManager;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('SettingsScene');
  }

  create(): void {
    this.gs = this.registry.get('gameState') as GameState;
    this.audio = this.registry.get('audio') as AudioManager;
    drawMenuBackground(this);

    this.add
      .text(GAME_WIDTH / 2, 110, 'Ajustes', {
        fontFamily: 'Trebuchet MS',
        fontSize: '76px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.layer = this.add.container(0, 0);
    this.render();

    new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 110, 'Volver', () => {
      this.audio.play('button');
      this.persistAndBack();
    }, { width: 320, height: 96, color: 0x4a2b8c });
  }

  private persistAndBack(): void {
    this.gs.persist();
    this.audio.applySettings(this.gs.save.settings);
    this.scene.start('MainMenuScene');
  }

  private render(): void {
    this.layer.removeAll(true);
    const s = this.gs.save.settings;
    let y = 250;
    const step = 130;

    this.slider('Música', s.musicVolume, y, (d) => {
      s.musicVolume = Phaser.Math.Clamp(+(s.musicVolume + d).toFixed(1), 0, 1);
      this.apply();
    });
    y += step;
    this.slider('Efectos', s.sfxVolume, y, (d) => {
      s.sfxVolume = Phaser.Math.Clamp(+(s.sfxVolume + d).toFixed(1), 0, 1);
      this.apply();
    });
    y += step;
    this.toggle('Silenciar', s.muted, y, () => {
      s.muted = !s.muted;
      this.apply();
    });
    y += step;
    this.cycle('Calidad', s.quality, y, () => {
      const order: Array<typeof s.quality> = ['auto', 'low', 'medium', 'high'];
      s.quality = order[(order.indexOf(s.quality) + 1) % order.length];
      this.apply();
    });
    y += step;
    this.toggle('Vibración', s.vibration, y, () => {
      s.vibration = !s.vibration;
      this.apply();
    });
    y += step;
    this.toggle('Reducir movimiento', s.reducedMotion, y, () => {
      s.reducedMotion = !s.reducedMotion;
      this.apply();
    });
    y += step;
    this.toggle('Alto contraste', s.highContrast, y, () => {
      s.highContrast = !s.highContrast;
      this.apply();
    });
    y += step;
    this.cycle('Idioma', s.language.toUpperCase(), y, () => {
      s.language = s.language === 'es' ? 'en' : 'es';
      setLanguage(s.language);
      this.apply();
    });
    y += step + 20;

    // Data buttons
    const b1 = new Button(this, GAME_WIDTH / 2 - 300, y, 'Exportar', () => this.exportSave(), {
      width: 260,
      height: 90,
      fontSize: 30,
      color: 0x4a6fff,
    });
    const b2 = new Button(this, GAME_WIDTH / 2, y, 'Importar', () => this.importSave(), {
      width: 260,
      height: 90,
      fontSize: 30,
      color: 0x4a6fff,
    });
    const b3 = new Button(this, GAME_WIDTH / 2 + 300, y, 'Borrar', () => this.resetSave(), {
      width: 260,
      height: 90,
      fontSize: 30,
      color: 0xcc3355,
    });
    this.layer.add([b1, b2, b3]);
  }

  private apply(): void {
    this.gs.persist();
    this.audio.applySettings(this.gs.save.settings);
    this.render();
  }

  private rowLabel(text: string, y: number): void {
    this.layer.add(
      this.add.text(120, y, text, {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5),
    );
  }

  private slider(label: string, value: number, y: number, change: (d: number) => void): void {
    this.rowLabel(label, y);
    const minus = new Button(this, GAME_WIDTH - 520, y, '−', () => change(-0.1), {
      width: 90,
      height: 90,
      fontSize: 48,
      color: 0x4a2b8c,
    });
    const val = this.add
      .text(GAME_WIDTH - 360, y, `${Math.round(value * 100)}%`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '40px',
        color: '#ffcc33',
      })
      .setOrigin(0.5);
    const plus = new Button(this, GAME_WIDTH - 200, y, '+', () => change(0.1), {
      width: 90,
      height: 90,
      fontSize: 48,
      color: 0x4a2b8c,
    });
    this.layer.add([minus, val, plus]);
  }

  private toggle(label: string, on: boolean, y: number, change: () => void): void {
    this.rowLabel(label, y);
    const btn = new Button(this, GAME_WIDTH - 280, y, on ? 'SÍ' : 'NO', change, {
      width: 200,
      height: 90,
      fontSize: 36,
      color: on ? 0x39b54a : 0x555577,
    });
    this.layer.add(btn);
  }

  private cycle(label: string, value: string, y: number, change: () => void): void {
    this.rowLabel(label, y);
    const btn = new Button(this, GAME_WIDTH - 300, y, `${value}`, change, {
      width: 300,
      height: 90,
      fontSize: 34,
      color: 0x7b2ff7,
    });
    this.layer.add(btn);
  }

  private exportSave(): void {
    const data = this.gs.saveService.exportSave();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(data).catch(() => undefined);
    }
    window.prompt('Copia tu partida (Ctrl+C):', data);
  }

  private importSave(): void {
    const data = window.prompt('Pega tu partida guardada:');
    if (!data) return;
    if (this.gs.saveService.importSave(data)) {
      this.gs.save = this.gs.saveService.load();
      setLanguage(this.gs.save.settings.language);
      this.audio.applySettings(this.gs.save.settings);
      this.render();
    } else {
      window.alert('Partida inválida.');
    }
  }

  private resetSave(): void {
    if (!window.confirm('¿Borrar todo el progreso? Esta acción no se puede deshacer.')) return;
    this.gs.saveService.reset();
    this.gs.save = this.gs.saveService.load();
    this.apply();
  }
}
