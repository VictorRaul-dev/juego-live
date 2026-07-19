import { describe, it, expect } from 'vitest';
import { PowerUpManager } from '../src/systems/PowerUpManager';
import { POWERUP_DURATION } from '../src/config/GameConfig';

describe('PowerUpManager', () => {
  it('activates and expires a timed power-up', () => {
    const pm = new PowerUpManager();
    pm.activate('magnet');
    expect(pm.isActive('magnet')).toBe(true);
    const expired = pm.update(POWERUP_DURATION.magnet + 10);
    expect(expired).toContain('magnet');
    expect(pm.isActive('magnet')).toBe(false);
  });

  it('shield persists until consumed', () => {
    const pm = new PowerUpManager();
    pm.activate('shield');
    pm.update(100000);
    expect(pm.isActive('shield')).toBe(true);
    expect(pm.consumeShield()).toBe(true);
    expect(pm.isActive('shield')).toBe(false);
    expect(pm.consumeShield()).toBe(false);
  });

  it('upgrades extend duration', () => {
    const pm = new PowerUpManager();
    pm.configureUpgrades({ 'magnet-duration': 3 });
    pm.activate('magnet');
    // Base duration alone would have expired; the bonus keeps it alive.
    pm.update(POWERUP_DURATION.magnet + 100);
    expect(pm.isActive('magnet')).toBe(true);
  });

  it('reports remaining fraction between 0 and 1', () => {
    const pm = new PowerUpManager();
    pm.activate('turbo');
    pm.update(POWERUP_DURATION.turbo / 2);
    const frac = pm.remainingFraction('turbo');
    expect(frac).toBeGreaterThan(0.3);
    expect(frac).toBeLessThan(0.7);
  });
});
