import type { PowerUpType } from '../core/types';
import { POWERUP_DURATION } from '../config/GameConfig';

interface ActivePowerUp {
  type: PowerUpType;
  remaining: number; // ms; shields use Infinity until consumed
  duration: number;
}

/**
 * Pure timing logic for power-ups. The GameScene owns the visual/audio side;
 * this class just tracks which power-ups are active and how much time is left,
 * so it can be unit-tested deterministically.
 */
export class PowerUpManager {
  private active = new Map<PowerUpType, ActivePowerUp>();

  /** Extra duration (ms) granted per relevant upgrade level. */
  private durationBonus: Partial<Record<PowerUpType, number>> = {};

  reset(): void {
    this.active.clear();
  }

  configureUpgrades(upgrades: Record<string, number>): void {
    this.durationBonus = {
      shield: (upgrades['shield-duration'] ?? 0) * 1200,
      magnet: (upgrades['magnet-duration'] ?? 0) * 1500,
      turbo: (upgrades['turbo-duration'] ?? 0) * 1200,
    };
  }

  activate(type: PowerUpType): void {
    const base = POWERUP_DURATION[type] ?? 6000;
    if (type === 'shield') {
      // Shields persist until they absorb a hit (represented as Infinity).
      this.active.set('shield', { type, remaining: Infinity, duration: Infinity });
      return;
    }
    const duration = base + (this.durationBonus[type] ?? 0);
    this.active.set(type, { type, remaining: duration, duration });
  }

  isActive(type: PowerUpType): boolean {
    return this.active.has(type);
  }

  /** Fraction of time remaining [0..1], or 1 for shields. */
  remainingFraction(type: PowerUpType): number {
    const p = this.active.get(type);
    if (!p) return 0;
    if (!isFinite(p.duration)) return 1;
    return Math.max(0, p.remaining / p.duration);
  }

  /**
   * Consume the shield if present. Returns true when a hit was absorbed.
   */
  consumeShield(): boolean {
    if (this.active.has('shield')) {
      this.active.delete('shield');
      return true;
    }
    return false;
  }

  /** Advance timers by `dtMs`. Returns power-ups that expired this tick. */
  update(dtMs: number): PowerUpType[] {
    const expired: PowerUpType[] = [];
    for (const [type, p] of this.active) {
      if (!isFinite(p.remaining)) continue;
      p.remaining -= dtMs;
      if (p.remaining <= 0) {
        this.active.delete(type);
        expired.push(type);
      }
    }
    return expired;
  }

  get activeTypes(): PowerUpType[] {
    return [...this.active.keys()];
  }
}
