import { describe, it, expect } from 'vitest';
import { DifficultyManager, clamp } from '../src/systems/DifficultyManager';
import { BASE_SPEED, MAX_SPEED } from '../src/config/GameConfig';

describe('DifficultyManager', () => {
  it('starts at the base difficulty and rises with distance', () => {
    const d = new DifficultyManager(2);
    expect(d.difficulty).toBeCloseTo(2, 5);
    d.setDistance(600); // +2 from ramp (600/300)
    expect(d.difficulty).toBeCloseTo(4, 5);
  });

  it('increases speed with difficulty but never exceeds the cap', () => {
    const d = new DifficultyManager(0);
    expect(d.speed).toBe(BASE_SPEED);
    d.setDistance(100000);
    expect(d.speed).toBe(MAX_SPEED);
  });

  it('adaptive performance bonus is clamped', () => {
    const d = new DifficultyManager(0);
    for (let i = 0; i < 20; i++) d.registerPerformance(1);
    const high = d.difficulty;
    for (let i = 0; i < 40; i++) d.registerPerformance(-1);
    expect(d.difficulty).toBeLessThan(high);
    expect(d.difficulty).toBeGreaterThanOrEqual(0);
  });

  it('spacing tightens with difficulty but stays above a safe floor', () => {
    const easy = new DifficultyManager(0);
    const hard = new DifficultyManager(0);
    hard.setDistance(100000);
    expect(hard.spacingFactor).toBeLessThan(easy.spacingFactor);
    expect(hard.spacingFactor).toBeGreaterThanOrEqual(0.6);
  });

  it('clamp helper bounds values', () => {
    expect(clamp(5, 0, 3)).toBe(3);
    expect(clamp(-5, 0, 3)).toBe(0);
    expect(clamp(2, 0, 3)).toBe(2);
  });
});
