import type { Settings } from '../core/types';

type SfxName =
  | 'coin'
  | 'bone'
  | 'jump'
  | 'land'
  | 'lane'
  | 'power'
  | 'hit'
  | 'record'
  | 'button';

/**
 * Web Audio synthesiser. All sounds are generated at runtime, so the game ships
 * with zero binary audio assets (nothing to 404 on GitHub Pages). Music is a
 * simple procedural loop whose intensity rises with speed.
 *
 * Audio only starts after a user gesture, respecting browser autoplay rules.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;
  private started = false;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private intensity = 0; // 0..1, scales tempo/brightness

  private settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  /** Must be called from within a user-gesture handler. */
  unlock(): void {
    if (this.started) {
      this.ctx?.resume();
      return;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.applyVolumes();
    this.started = true;
  }

  applySettings(settings: Settings): void {
    this.settings = settings;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.started) return;
    const master = this.settings.muted ? 0 : 1;
    this.masterGain.gain.value = master;
    this.musicGain.gain.value = this.settings.musicVolume * 0.5;
    this.sfxGain.gain.value = this.settings.sfxVolume;
  }

  /** intensity 0..1 raises tempo & brightness of the music loop. */
  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  startMusic(): void {
    if (!this.started || this.musicTimer !== null) return;
    const scheduler = () => {
      this.playMusicStep();
      const interval = 320 - this.intensity * 140; // faster when intense
      this.musicTimer = window.setTimeout(scheduler, interval);
    };
    scheduler();
  }

  stopMusic(): void {
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playMusicStep(): void {
    if (!this.ctx) return;
    // Cheerful minor-pentatonic-ish arpeggio.
    const scale = [220, 262, 294, 330, 392, 440];
    const note = scale[this.musicStep % scale.length];
    this.musicStep++;
    const bright = 1 + this.intensity;
    this.tone(note * bright, 0.18, 'triangle', this.musicGain, 0.5);
    if (this.musicStep % 4 === 0) {
      this.tone(110, 0.22, 'sine', this.musicGain, 0.7); // bass
    }
  }

  play(name: SfxName): void {
    if (!this.started || !this.ctx) return;
    switch (name) {
      case 'coin':
        this.tone(880, 0.08, 'square', this.sfxGain, 0.4);
        this.tone(1320, 0.09, 'square', this.sfxGain, 0.3, 0.04);
        break;
      case 'bone':
        this.tone(660, 0.12, 'triangle', this.sfxGain, 0.5);
        break;
      case 'jump':
        this.sweep(300, 620, 0.18, 'sawtooth', 0.4);
        break;
      case 'land':
        this.tone(160, 0.1, 'sine', this.sfxGain, 0.5);
        break;
      case 'lane':
        this.tone(520, 0.06, 'square', this.sfxGain, 0.25);
        break;
      case 'power':
        this.sweep(440, 990, 0.3, 'triangle', 0.5);
        break;
      case 'hit':
        this.sweep(400, 80, 0.35, 'sawtooth', 0.6);
        break;
      case 'record':
        this.tone(523, 0.15, 'triangle', this.sfxGain, 0.5);
        this.tone(659, 0.15, 'triangle', this.sfxGain, 0.5, 0.12);
        this.tone(784, 0.25, 'triangle', this.sfxGain, 0.5, 0.24);
        break;
      case 'button':
        this.tone(440, 0.05, 'square', this.sfxGain, 0.3);
        break;
    }
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    dest: GainNode,
    peak: number,
    delay = 0,
  ): void {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private sweep(from: number, to: number, dur: number, type: OscillatorType, peak: number): void {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
    gain.gain.setValueAtTime(peak, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
}
